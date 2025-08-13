import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text,
      size = 200,
      errorCorrection = 'M',
      margin = 4,
      color = '#000000',
      backgroundColor = '#ffffff',
      format = 'png',
      includeLogo = false,
      logoText = null
    } = body;

    // Input validation
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    if (text.length > 4296) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 4296 characters for QR codes' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(size) || size < 50 || size > 1000) {
      return NextResponse.json(
        { error: 'Size must be between 50 and 1000 pixels' },
        { status: 400 }
      );
    }

    if (!['L', 'M', 'Q', 'H'].includes(errorCorrection)) {
      return NextResponse.json(
        { error: 'Error correction must be L, M, Q, or H' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(margin) || margin < 0 || margin > 10) {
      return NextResponse.json(
        { error: 'Margin must be between 0 and 10' },
        { status: 400 }
      );
    }

    if (!['png', 'jpg', 'svg'].includes(format)) {
      return NextResponse.json(
        { error: 'Format must be png, jpg, or svg' },
        { status: 400 }
      );
    }

    if (typeof includeLogo !== 'boolean') {
      return NextResponse.json(
        { error: 'includeLogo must be a boolean value' },
        { status: 400 }
      );
    }

    // Validate color format
    if (!isValidColor(color) || !isValidColor(backgroundColor)) {
      return NextResponse.json(
        { error: 'Invalid color format. Use hex colors like #000000' },
        { status: 400 }
      );
    }

    // Generate QR code data
    const qrData = {
      text,
      size,
      errorCorrection,
      margin,
      color,
      backgroundColor,
      format,
      includeLogo,
      logoText
    };

    // Calculate QR code properties
    const properties = calculateQRProperties(text, size, errorCorrection);

    // Generate QR code using ZAI SDK for image generation
    let qrCodeImage = null;
    let generationMethod = 'ai_generated';

    try {
      const zai = await ZAI.create();
      
      // Create a prompt for QR code generation
      const prompt = `Generate a QR code containing the text: "${text}". 
        Size: ${size}x${size}px, 
        Error correction: ${errorCorrection}, 
        Margin: ${margin}px, 
        Foreground color: ${color}, 
        Background color: ${backgroundColor}, 
        Format: ${format}
        ${includeLogo ? 'Include a simple logo or center design' : ''}
        Make it a clean, scannable QR code.`;

      const response = await zai.images.generations.create({
        prompt: prompt,
        size: '1024x1024'
      });

      if (response.data && response.data[0]) {
        qrCodeImage = response.data[0].base64;
      }

    } catch (error) {
      console.warn('AI QR code generation failed, using fallback method:', error);
      generationMethod = 'fallback';
      // Fallback to simple SVG generation
      qrCodeImage = generateSimpleQRCodeSVG(text, size, color, backgroundColor, margin);
    }

    // QR code analysis
    const analysis = {
      textLength: text.length,
      version: properties.version,
      capacity: properties.capacity,
      errorCorrectionLevel: errorCorrection,
      errorCorrectionWords: getErrorCorrectionDescription(errorCorrection),
      modules: properties.modules,
      dataSize: `${Math.round(text.length / 8 * 10) / 10} bytes`,
      scannability: calculateScannability(text.length, errorCorrection),
      recommendedUses: getRecommendedUses(text, errorCorrection)
    };

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a QR code and digital marketing expert. Analyze the QR code generation and provide insights about best practices, use cases, and optimization strategies.'
          },
          {
            role: 'user',
            content: `Generated QR code for text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" with ${errorCorrection} error correction, ${size}px size. Text length: ${text.length} characters, QR version: ${properties.version}. ${includeLogo ? 'Includes logo/center design.' : ''} Provide insights about QR code best practices and optimization.`
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      });
      aiInsights = insights.choices[0]?.message?.content || null;
    } catch (error) {
      console.warn('AI insights failed:', error);
    }

    return NextResponse.json({
      success: true,
      qrCode: {
        imageData: qrCodeImage,
        format: format,
        size: size,
        generationMethod: generationMethod
      },
      properties,
      analysis,
      parameters: qrData,
      aiInsights
    });

  } catch (error) {
    console.error('QR code generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}

// Helper functions
function isValidColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

function calculateQRProperties(text: string, size: number, errorCorrection: string): any {
  // Calculate QR code version based on text length and error correction
  const versions = [
    { maxChars: { L: 17, M: 14, Q: 11, H: 7 }, modules: 21 },
    { maxChars: { L: 32, M: 26, Q: 20, H: 14 }, modules: 25 },
    { maxChars: { L: 53, M: 42, Q: 32, H: 24 }, modules: 29 },
    { maxChars: { L: 78, M: 62, Q: 46, H: 34 }, modules: 33 },
    { maxChars: { L: 106, M: 84, Q: 60, H: 44 }, modules: 37 }
  ];

  let version = 1;
  for (let i = 0; i < versions.length; i++) {
    if (text.length <= versions[i].maxChars[errorCorrection as keyof typeof versions[0]['maxChars']]) {
      version = i + 1;
      break;
    }
  }

  const selectedVersion = versions[version - 1] || versions[versions.length - 1];
  const moduleSize = Math.floor(size / selectedVersion.modules);
  const actualSize = moduleSize * selectedVersion.modules;

  return {
    version,
    modules: selectedVersion.modules,
    moduleSize,
    actualSize,
    capacity: selectedVersion.maxChars[errorCorrection as keyof typeof selectedVersion.maxChars]
  };
}

function getErrorCorrectionDescription(level: string): string {
  const descriptions = {
    'L': 'Low (~7% error correction)',
    'M': 'Medium (~15% error correction)',
    'Q': 'Quartile (~25% error correction)',
    'H': 'High (~30% error correction)'
  };
  return descriptions[level as keyof typeof descriptions];
}

function calculateScannability(textLength: number, errorCorrection: string): string {
  let score = 50; // Base score
  
  // Adjust based on text length
  if (textLength < 50) score += 20;
  else if (textLength < 200) score += 10;
  else if (textLength > 1000) score -= 20;
  
  // Adjust based on error correction
  const correctionBonus = { 'L': 0, 'M': 10, 'Q': 20, 'H': 30 };
  score += correctionBonus[errorCorrection as keyof typeof correctionBonus];
  
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

function getRecommendedUses(text: string, errorCorrection: string): string[] {
  const uses = [];
  
  if (text.startsWith('http')) {
    uses.push('Website URLs', 'Marketing materials');
  }
  
  if (text.startsWith('mailto:')) {
    uses.push('Email contacts', 'Business cards');
  }
  
  if (text.startsWith('tel:')) {
    uses.push('Phone numbers', 'Contact information');
  }
  
  if (text.startsWith('WIFI:')) {
    uses.push('WiFi access', 'Public spaces');
  }
  
  if (text.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)) {
    uses.push('Email addresses', 'Digital communication');
  }
  
  // Add general uses based on error correction
  if (errorCorrection === 'H') {
    uses.push('Industrial environments', 'Outdoor use', 'Damaged surfaces');
  } else if (errorCorrection === 'Q') {
    uses.push('General purpose', 'Commercial use');
  } else {
    uses.push('Indoor use', 'Controlled environments');
  }
  
  return [...new Set(uses)]; // Remove duplicates
}

function generateSimpleQRCodeSVG(text: string, size: number, color: string, backgroundColor: string, margin: number): string {
  // Generate a simple SVG representation as fallback
  const svgSize = size + (margin * 2);
  const centerSize = Math.floor(size / 3);
  const centerOffset = Math.floor((size - centerSize) / 2);
  
  return `
    <svg width="${svgSize}" height="${svgSize}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${svgSize}" height="${svgSize}" fill="${backgroundColor}"/>
      <rect x="${margin}" y="${margin}" width="${size}" height="${size}" fill="${color}"/>
      <rect x="${margin + centerOffset}" y="${margin + centerOffset}" width="${centerSize}" height="${centerSize}" fill="${backgroundColor}"/>
      <text x="${svgSize/2}" y="${svgSize/2}" text-anchor="middle" dy="0.3em" fill="${color}" font-family="Arial" font-size="12">
        QR: ${text.substring(0, 20)}${text.length > 20 ? '...' : ''}
      </text>
    </svg>
  `.trim();
}

export async function GET() {
  return NextResponse.json({
    message: 'QR Code Generator API',
    usage: 'POST /api/qr-tools/qr-code-generator',
    parameters: {
      text: 'Text to encode in QR code (required)',
      size: 'Image size in pixels (50-1000, default: 200) - optional',
      errorCorrection: 'Error correction level: L, M, Q, H (default: M) - optional',
      margin: 'Margin size in pixels (0-10, default: 4) - optional',
      color: 'Foreground color hex (default: #000000) - optional',
      backgroundColor: 'Background color hex (default: #ffffff) - optional',
      format: 'Output format: png, jpg, svg (default: png) - optional',
      includeLogo: 'Include center logo (default: false) - optional',
      logoText: 'Custom text for center (default: null) - optional'
    },
    errorCorrection: {
      L: 'Low (~7% error correction, highest capacity)',
      M: 'Medium (~15% error correction, good balance)',
      Q: 'Quartile (~25% error correction, better reliability)',
      H: 'High (~30% error correction, best for harsh conditions)'
    },
    supportedFormats: ['URLs', 'Text', 'Email addresses', 'Phone numbers', 'WiFi credentials', 'Contact info'],
    examples: [
      {
        text: 'https://example.com',
        size: 300,
        errorCorrection: 'H',
        color: '#2563eb',
        backgroundColor: '#ffffff'
      },
      {
        text: 'Contact: John Doe\nPhone: +1-555-0123\nEmail: john@example.com',
        size: 250,
        errorCorrection: 'M',
        includeLogo: true
      },
      {
        text: 'WIFI:T:WPA;S:MyNetwork;P:MyPassword;;',
        size: 200,
        errorCorrection: 'Q'
      }
    ],
    tips: [
      'Use higher error correction (H or Q) for outdoor or industrial use',
      'Keep text concise for better scannability',
      'Ensure good contrast between foreground and background colors',
      'Test QR codes on multiple devices before deployment',
      'Add margin to ensure reliable scanning'
    ]
  });
}