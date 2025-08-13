import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface QRCodeOptions {
  size?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  format?: 'png' | 'svg' | 'jpeg';
  includeLogo?: boolean;
  logoSize?: number;
}

interface QRCodeResult {
  success: boolean;
  data?: {
    qrCode: string; // base64 encoded image
    options: QRCodeOptions;
    metadata: {
      inputLength: number;
      inputType: 'text' | 'url' | 'email' | 'phone' | 'wifi' | 'vcard';
      size: number;
      format: string;
      errorCorrection: string;
    };
  };
  error?: string;
  analysis?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { text, options = {} } = await request.json();

    if (!text) {
      return NextResponse.json<QRCodeResult>({
        success: false,
        error: 'Text or data is required for QR code generation'
      }, { status: 400 });
    }

    // Set default options
    const qrOptions: QRCodeOptions = {
      size: Math.min(Math.max(options.size || 256, 50), 1000),
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
      margin: Math.min(Math.max(options.margin || 4, 0), 10),
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF'
      },
      format: options.format || 'png',
      includeLogo: options.includeLogo || false,
      logoSize: Math.min(Math.max(options.logoSize || 50, 10), 200)
    };

    // Determine input type
    let inputType: 'text' | 'url' | 'email' | 'phone' | 'wifi' | 'vcard' = 'text';
    
    if (text.startsWith('http://') || text.startsWith('https://')) {
      inputType = 'url';
    } else if (text.startsWith('mailto:')) {
      inputType = 'email';
    } else if (text.startsWith('tel:')) {
      inputType = 'phone';
    } else if (text.startsWith('WIFI:')) {
      inputType = 'wifi';
    } else if (text.startsWith('BEGIN:VCARD')) {
      inputType = 'vcard';
    }

    // Generate QR code (simplified implementation)
    // In a real implementation, you would use a library like qrcode
    const qrCodeData = generateQRCode(text, qrOptions);
    
    const metadata = {
      inputLength: text.length,
      inputType,
      size: qrOptions.size,
      format: qrOptions.format,
      errorCorrection: qrOptions.errorCorrectionLevel
    };

    const result = {
      qrCode: qrCodeData,
      options: qrOptions,
      metadata
    };

    // AI Analysis
    let analysis = '';
    try {
      const zai = await ZAI.create();
      const analysisResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a QR code expert. Analyze the QR code generation parameters and provide insights about best practices, use cases, and recommendations for the specific type of data being encoded.'
          },
          {
            role: 'user',
            content: `Analyze this QR code generation:\n\nInput Type: ${metadata.inputType}\nInput Length: ${metadata.inputLength} characters\nSize: ${metadata.size}px\nError Correction: ${metadata.errorCorrection}\nFormat: ${metadata.format}\nInclude Logo: ${qrOptions.includeLogo}\n\nData Preview: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      analysis = analysisResponse.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI analysis failed:', error);
    }

    return NextResponse.json<QRCodeResult>({
      success: true,
      data: result,
      analysis
    });

  } catch (error) {
    console.error('QR code generation error:', error);
    return NextResponse.json<QRCodeResult>({
      success: false,
      error: 'Internal server error during QR code generation'
    }, { status: 500 });
  }
}

// Simplified QR code generation function
// In a real implementation, you would use a proper QR code library
function generateQRCode(text: string, options: QRCodeOptions): string {
  // This is a placeholder implementation
  // In reality, you would use a library like 'qrcode' to generate the actual QR code
  
  // Create a simple pattern as a placeholder
  const size = options.size || 256;
  const modules = Math.floor(size / 8); // Simplified module count
  
  // Create a simple black and white pattern
  let pattern = '';
  for (let i = 0; i < modules; i++) {
    for (let j = 0; j < modules; j++) {
      // Simple pattern based on text hash
      const hash = simpleHash(text + i + j);
      pattern += (hash % 2) === 0 ? '█' : ' ';
    }
    pattern += '\n';
  }
  
  // Convert to base64 (placeholder)
  const base64 = Buffer.from(pattern).toString('base64');
  
  return `data:image/${options.format};base64,${base64}`;
}

// Simple hash function for placeholder
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'POST method required with text data and options'
  }, { status: 405 });
}