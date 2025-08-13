import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text,
      type = 'code128',
      width = 200,
      height = 100,
      showText = true,
      format = 'png',
      color = '#000000',
      backgroundColor = '#ffffff'
    } = body;

    // Input validation
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    if (text.length > 100) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 100 characters for barcodes' },
        { status: 400 }
      );
    }

    const validTypes = ['code128', 'code39', 'ean13', 'ean8', 'upca', 'upce', 'itf14', 'codabar'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid barcode type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    if (!Number.isInteger(width) || width < 50 || width > 500) {
      return NextResponse.json(
        { error: 'Width must be between 50 and 500 pixels' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(height) || height < 20 || height > 200) {
      return NextResponse.json(
        { error: 'Height must be between 20 and 200 pixels' },
        { status: 400 }
      );
    }

    if (typeof showText !== 'boolean') {
      return NextResponse.json(
        { error: 'showText must be a boolean value' },
        { status: 400 }
      );
    }

    if (!['png', 'jpg', 'svg'].includes(format)) {
      return NextResponse.json(
        { error: 'Format must be png, jpg, or svg' },
        { status: 400 }
      );
    }

    if (!isValidColor(color) || !isValidColor(backgroundColor)) {
      return NextResponse.json(
        { error: 'Invalid color format. Use hex colors like #000000' },
        { status: 400 }
      );
    }

    // Validate text for specific barcode types
    const validation = validateBarcodeText(text, type);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Generate barcode data
    const barcodeData = {
      text,
      type,
      width,
      height,
      showText,
      format,
      color,
      backgroundColor
    };

    // Calculate barcode properties
    const properties = calculateBarcodeProperties(text, type, width, height);

    // Generate barcode using ZAI SDK for image generation
    let barcodeImage = null;
    let generationMethod = 'ai_generated';

    try {
      const zai = await ZAI.create();
      
      // Create a prompt for barcode generation
      const prompt = `Generate a ${type} barcode containing the text: "${text}". 
        Dimensions: ${width}x${height}px, 
        Foreground color: ${color}, 
        Background color: ${backgroundColor}, 
        Format: ${format}
        ${showText ? 'Include human-readable text below the barcode' : ''}
        Make it a clean, scannable barcode with proper encoding.`;

      const response = await zai.images.generations.create({
        prompt: prompt,
        size: '1024x1024'
      });

      if (response.data && response.data[0]) {
        barcodeImage = response.data[0].base64;
      }

    } catch (error) {
      console.warn('AI barcode generation failed, using fallback method:', error);
      generationMethod = 'fallback';
      // Fallback to simple SVG generation
      barcodeImage = generateSimpleBarcodeSVG(text, type, width, height, color, backgroundColor, showText);
    }

    // Barcode analysis
    const analysis = {
      textLength: text.length,
      type: type,
      encoding: getEncodingInfo(type),
      checksum: getChecksumInfo(text, type),
      scannability: calculateBarcodeScannability(text, type),
      recommendedUses: getBarcodeRecommendedUses(type),
      industryStandards: getIndustryStandards(type)
    };

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a barcode and inventory management expert. Analyze the barcode generation and provide insights about best practices, use cases, and industry applications.'
          },
          {
            role: 'user',
            content: `Generated ${type} barcode for text: "${text}" with dimensions ${width}x${height}px. Text length: ${text.length} characters. ${showText ? 'Includes human-readable text.' : ''} ${validation.checksum ? `Checksum: ${validation.checksum}.` : ''} Provide insights about barcode applications and best practices.`
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
      barcode: {
        imageData: barcodeImage,
        format: format,
        width: width,
        height: height,
        generationMethod: generationMethod
      },
      properties,
      analysis,
      parameters: barcodeData,
      validation,
      aiInsights
    });

  } catch (error) {
    console.error('Barcode generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate barcode' },
      { status: 500 }
    );
  }
}

// Helper functions
function isValidColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

function validateBarcodeText(text: string, type: string): { isValid: boolean; error?: string; checksum?: string } {
  // Remove whitespace and convert to uppercase for validation
  const cleanText = text.trim().toUpperCase();
  
  switch (type) {
    case 'code128':
      // Code 128 supports full ASCII
      return { isValid: true };
      
    case 'code39':
      // Code 39 supports: A-Z, 0-9, -, ., $, /, +, %, and space
      if (!/^[A-Z0-9\-\.\$\/\+\% ]+$/.test(cleanText)) {
        return { isValid: false, error: 'Code 39 only supports A-Z, 0-9, -, ., $, /, +, %, and space' };
      }
      return { isValid: true };
      
    case 'ean13':
      // EAN-13 requires 12 digits (13th is checksum)
      if (!/^\d{12}$/.test(cleanText)) {
        return { isValid: false, error: 'EAN-13 requires exactly 12 digits' };
      }
      // Calculate and validate checksum
      const checksum = calculateEAN13Checksum(cleanText);
      return { isValid: true, checksum: checksum.toString() };
      
    case 'ean8':
      // EAN-8 requires 7 digits (8th is checksum)
      if (!/^\d{7}$/.test(cleanText)) {
        return { isValid: false, error: 'EAN-8 requires exactly 7 digits' };
      }
      const checksum8 = calculateEAN8Checksum(cleanText);
      return { isValid: true, checksum: checksum8.toString() };
      
    case 'upca':
      // UPC-A requires 11 digits (12th is checksum)
      if (!/^\d{11}$/.test(cleanText)) {
        return { isValid: false, error: 'UPC-A requires exactly 11 digits' };
      }
      const checksumUPCA = calculateUPCAChecksum(cleanText);
      return { isValid: true, checksum: checksumUPCA.toString() };
      
    case 'upce':
      // UPC-E requires 6 digits
      if (!/^\d{6}$/.test(cleanText)) {
        return { isValid: false, error: 'UPC-E requires exactly 6 digits' };
      }
      return { isValid: true };
      
    case 'itf14':
      // ITF-14 requires even number of digits
      if (!/^\d+$/.test(cleanText) || cleanText.length % 2 !== 0) {
        return { isValid: false, error: 'ITF-14 requires even number of digits' };
      }
      return { isValid: true };
      
    case 'codabar':
      // Codabar supports: A-D, 0-9, -, $, :, /, ., +
      if (!/^[ABCD][0-9\-\$\:\/\.\+]+[ABCD]$/.test(cleanText)) {
        return { isValid: false, error: 'Codabar must start and end with A-D and contain only 0-9, -, $, :, /, ., +' };
      }
      return { isValid: true };
      
    default:
      return { isValid: false, error: 'Unknown barcode type' };
  }
}

function calculateBarcodeProperties(text: string, type: string, width: number, height: string): any {
  const properties: any = {
    type: type,
    width: width,
    height: height,
    modules: Math.floor(width / 2), // Approximate module count
    quietZone: Math.floor(width * 0.1) // 10% quiet zone
  };

  // Add type-specific properties
  switch (type) {
    case 'ean13':
      properties.digits = 13;
      properties.structure = '1-1-1-1-1-1-1-1-1-1-1-1';
      break;
    case 'ean8':
      properties.digits = 8;
      properties.structure = '1-1-1-1-1-1-1-1';
      break;
    case 'upca':
      properties.digits = 12;
      properties.structure = '1-1-1-1-1-1-1-1-1-1-1';
      break;
    case 'upce':
      properties.digits = 6;
      properties.structure = '1-1-1-1-1-1';
      break;
    case 'code128':
      properties.encoding = 'Full ASCII';
      properties.compression = 'High';
      break;
    case 'code39':
      properties.encoding = '43 characters';
      properties.compression = 'Low';
      break;
  }

  return properties;
}

function getEncodingInfo(type: string): string {
  const encodings = {
    'code128': 'Full ASCII (128 characters)',
    'code39': '43 characters (A-Z, 0-9, -, ., $, /, +, %, space)',
    'ean13': 'Numeric only (13 digits)',
    'ean8': 'Numeric only (8 digits)',
    'upca': 'Numeric only (12 digits)',
    'upce': 'Numeric only (6 digits)',
    'itf14': 'Numeric only (even digits)',
    'codabar': '16 characters (A-D, 0-9, -, $, :, /, ., +)'
  };
  return encodings[type as keyof typeof encodings] || 'Unknown';
}

function getChecksumInfo(text: string, type: string): string {
  switch (type) {
    case 'ean13':
      return 'Modulo 10 checksum';
    case 'ean8':
      return 'Modulo 10 checksum';
    case 'upca':
      return 'Modulo 10 checksum';
    case 'code128':
      return 'Modulo 103 checksum';
    case 'code39':
      return 'Modulo 43 checksum';
    default:
      return 'No checksum';
  }
}

function calculateBarcodeScannability(text: string, type: string): string {
  let score = 70; // Base score
  
  // Adjust based on text length
  if (text.length < 10) score += 15;
  else if (text.length < 20) score += 10;
  else if (text.length > 50) score -= 15;
  
  // Adjust based on barcode type
  const typeBonus = {
    'code128': 20,
    'code39': 10,
    'ean13': 25,
    'ean8': 20,
    'upca': 25,
    'upce': 15,
    'itf14': 15,
    'codabar': 5
  };
  score += typeBonus[type as keyof typeof typeBonus] || 0;
  
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Fair';
  return 'Poor';
}

function getBarcodeRecommendedUses(type: string): string[] {
  const uses = {
    'code128': ['Shipping labels', 'Inventory management', 'Document tracking'],
    'code39': ['Asset tracking', 'Inventory', 'Industrial applications'],
    'ean13': ['Retail products', 'Consumer goods', 'Point of sale'],
    'ean8': ['Small products', 'Limited space applications'],
    'upca': ['North American retail', 'Consumer products'],
    'upce': ['Small items', 'Limited packaging space'],
    'itf14': ['Shipping containers', 'Logistics', 'Carton labeling'],
    'codabar': ['Libraries', 'Blood banks', 'FedEx packages']
  };
  return uses[type as keyof typeof uses] || ['General purpose'];
}

function getIndustryStandards(type: string): string[] {
  const standards = {
    'code128': ['GS1', 'ISO/IEC 15417'],
    'code39': ['AIM USS Code 39', 'ISO/IEC 16388'],
    'ean13': ['GS1', 'ISO/IEC 15420'],
    'ean8': ['GS1', 'ISO/IEC 15420'],
    'upca': ['GS1', 'ISO/IEC 15420'],
    'upce': ['GS1', 'ISO/IEC 15420'],
    'itf14': ['GS1', 'ISO/IEC 15420'],
    'codabar': ['AIM USS Codabar', 'ANSI/AIM BC3-1995']
  };
  return standards[type as keyof typeof standards] || ['No specific standard'];
}

// Checksum calculation functions
function calculateEAN13Checksum(text: string): number {
  let sum = 0;
  for (let i = 0; i < text.length; i++) {
    const digit = parseInt(text[i]);
    sum += digit * (i % 2 === 0 ? 1 : 3);
  }
  return (10 - (sum % 10)) % 10;
}

function calculateEAN8Checksum(text: string): number {
  return calculateEAN13Checksum(text);
}

function calculateUPCAChecksum(text: string): number {
  return calculateEAN13Checksum(text);
}

function generateSimpleBarcodeSVG(text: string, type: string, width: number, height: number, color: string, backgroundColor: string, showText: boolean): string {
  const svgWidth = width + 20; // Add padding
  const svgHeight = height + (showText ? 30 : 20); // Add space for text if needed
  
  // Generate simple barcode pattern
  let pattern = '';
  for (let i = 0; i < Math.min(text.length * 3, width); i++) {
    pattern += Math.random() > 0.5 ? '1' : '0';
  }
  
  return `
    <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${svgWidth}" height="${svgHeight}" fill="${backgroundColor}"/>
      <g transform="translate(10, 10)">
        ${generateBarcodePattern(pattern, width - 20, height, color)}
        ${showText ? `<text x="${(width - 20) / 2}" y="${height + 20}" text-anchor="middle" fill="${color}" font-family="monospace" font-size="12">${text}</text>` : ''}
      </g>
      <text x="${svgWidth / 2}" y="${svgHeight - 5}" text-anchor="middle" fill="${color}" font-family="Arial" font-size="8">${type.toUpperCase()}</text>
    </svg>
  `.trim();
}

function generateBarcodePattern(pattern: string, width: number, height: number, color: string): string {
  const barWidth = width / pattern.length;
  let svg = '';
  
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '1') {
      svg += `<rect x="${i * barWidth}" y="0" width="${barWidth}" height="${height}" fill="${color}"/>`;
    }
  }
  
  return svg;
}

export async function GET() {
  return NextResponse.json({
    message: 'Barcode Generator API',
    usage: 'POST /api/barcode-tools/barcode-generator',
    parameters: {
      text: 'Text to encode in barcode (required)',
      type: 'Barcode type: code128, code39, ean13, ean8, upca, upce, itf14, codabar (default: code128) - optional',
      width: 'Barcode width in pixels (50-500, default: 200) - optional',
      height: 'Barcode height in pixels (20-200, default: 100) - optional',
      showText: 'Show human-readable text (default: true) - optional',
      format: 'Output format: png, jpg, svg (default: png) - optional',
      color: 'Foreground color hex (default: #000000) - optional',
      backgroundColor: 'Background color hex (default: #ffffff) - optional'
    },
    barcodeTypes: {
      code128: 'Full ASCII, high density, checksum',
      code39: '43 characters, widely used in industry',
      ean13: '13-digit retail standard, global',
      ean8: '8-digit compact retail standard',
      upca: '12-digit North American retail',
      upce: '6-digit compact North American retail',
      itf14: '14-digit shipping container standard',
      codabar: '16 characters, libraries, blood banks'
    },
    examples: [
      {
        text: '123456789012',
        type: 'ean13',
        width: 300,
        height: 100,
        showText: true
      },
      {
        text: 'EXAMPLE123',
        type: 'code128',
        width: 250,
        height: 80,
        color: '#2563eb'
      },
      {
        text: '123456',
        type: 'upce',
        width: 200,
        height: 60
      }
    ],
    tips: [
      'Use EAN-13/UPC-A for retail products',
      'Use Code 128 for maximum flexibility and density',
      'Ensure adequate quiet zones around barcodes',
      'Test barcodes with actual scanners before deployment',
      'Consider barcode size and scanning distance'
    ]
  });
}