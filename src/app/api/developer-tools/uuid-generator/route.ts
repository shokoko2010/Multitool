import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface UUIDOptions {
  version?: 1 | 2 | 3 | 4 | 5 | 'nil' | 'max';
  count?: number;
  format?: 'standard' | 'hex' | 'urn' | 'bytes' | 'base64';
  uppercase?: boolean;
  removeDashes?: boolean;
}

interface UUIDResult {
  success: boolean;
  data?: {
    uuids: string[];
    options: UUIDOptions;
    metadata: {
      version: string;
      count: number;
      format: string;
      generatedAt: string;
    };
    validation?: {
      isValid: boolean;
      variant?: string;
      version?: number;
    };
  };
  error?: string;
  analysis?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { options = {} } = await request.json();

    // Set default options
    const uuidOptions: UUIDOptions = {
      version: options.version || 4,
      count: Math.min(Math.max(options.count || 1, 1), 100),
      format: options.format || 'standard',
      uppercase: options.uppercase || false,
      removeDashes: options.removeDashes || false
    };

    // Validate options
    if (uuidOptions.count < 1 || uuidOptions.count > 100) {
      return NextResponse.json<UUIDResult>({
        success: false,
        error: 'Count must be between 1 and 100'
      }, { status: 400 });
    }

    const validVersions = [1, 2, 3, 4, 5, 'nil', 'max'];
    if (!validVersions.includes(uuidOptions.version!)) {
      return NextResponse.json<UUIDResult>({
        success: false,
        error: 'Invalid UUID version. Use: 1, 2, 3, 4, 5, nil, or max'
      }, { status: 400 });
    }

    // Generate UUIDs
    const uuids: string[] = [];
    for (let i = 0; i < uuidOptions.count!; i++) {
      const uuid = generateUUID(uuidOptions.version!);
      const formattedUUID = formatUUID(uuid, uuidOptions);
      uuids.push(formattedUUID);
    }

    const metadata = {
      version: String(uuidOptions.version),
      count: uuidOptions.count,
      format: uuidOptions.format,
      generatedAt: new Date().toISOString()
    };

    // Validate the first UUID (if not nil or max)
    let validation;
    if (uuidOptions.version !== 'nil' && uuidOptions.version !== 'max') {
      validation = validateUUID(uuids[0]);
    }

    const result = {
      uuids,
      options: uuidOptions,
      metadata,
      validation
    };

    // AI Analysis
    let analysis = '';
    try {
      const zai = await ZAI.create();
      const analysisResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a UUID expert. Analyze the UUID generation parameters and provide insights about the chosen version, use cases, and best practices for UUID usage.'
          },
          {
            role: 'user',
            content: `Analyze this UUID generation:\n\nVersion: ${metadata.version}\nCount: ${metadata.count}\nFormat: ${metadata.format}\nGenerated At: ${metadata.generatedAt}\n\nSample UUID: ${uuids[0]}\n\nOptions: ${JSON.stringify(uuidOptions, null, 2)}`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      analysis = analysisResponse.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI analysis failed:', error);
    }

    return NextResponse.json<UUIDResult>({
      success: true,
      data: result,
      analysis
    });

  } catch (error) {
    console.error('UUID generation error:', error);
    return NextResponse.json<UUIDResult>({
      success: false,
      error: 'Internal server error during UUID generation'
    }, { status: 500 });
  }
}

function generateUUID(version: number | 'nil' | 'max'): string {
  switch (version) {
    case 'nil':
      return '00000000-0000-0000-0000-000000000000';
    case 'max':
      return 'ffffffff-ffff-ffff-ffff-ffffffffffff';
    case 1:
      return generateUUIDv1();
    case 2:
      return generateUUIDv2();
    case 3:
      return generateUUIDv3();
    case 4:
      return generateUUIDv4();
    case 5:
      return generateUUIDv5();
    default:
      return generateUUIDv4(); // Default to v4
  }
}

function generateUUIDv1(): string {
  // Simplified UUID v1 generation (timestamp-based)
  const timestamp = Date.now();
  const randomBytes = crypto.getRandomValues(new Uint8Array(8));
  
  return [
    timestamp.toString(16).padStart(8, '0'),
    (timestamp & 0xffff0000).toString(16).padStart(4, '0'),
    '1' + ((timestamp >> 48) & 0x0fff).toString(16).padStart(3, '0'),
    '8' + (randomBytes[0] & 0x3f).toString(16).padStart(2, '0'),
    Array.from(randomBytes.slice(1)).map(b => b.toString(16).padStart(2, '0')).join('')
  ].join('-');
}

function generateUUIDv2(): string {
  // UUID v2 (DCE Security) - simplified implementation
  return generateUUIDv1().replace(/^.{13}/, '2' + generateUUIDv1().substring(1, 13));
}

function generateUUIDv3(): string {
  // UUID v3 (MD5 hash) - simplified implementation
  const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // DNS namespace
  const name = 'example.com';
  const hash = simpleHash(namespace + name);
  
  return [
    hash.toString(16).padStart(8, '0'),
    (hash >> 32).toString(16).padStart(4, '0'),
    '3' + ((hash >> 48) & 0x0fff).toString(16).padStart(3, '0'),
    '8' + ((hash >> 60) & 0x3f).toString(16).padStart(2, '0'),
    (hash >> 16).toString(16).padStart(12, '0')
  ].join('-');
}

function generateUUIDv4(): string {
  // UUID v4 (random)
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  
  return [
    bytes[0].toString(16).padStart(2, '0') + bytes[1].toString(16).padStart(2, '0') +
    bytes[2].toString(16).padStart(2, '0') + bytes[3].toString(16).padStart(2, '0'),
    bytes[4].toString(16).padStart(2, '0') + bytes[5].toString(16).padStart(2, '0'),
    '4' + (bytes[6] & 0x0f).toString(16).padStart(1, '0') + bytes[7].toString(16).padStart(2, '0'),
    '8' + (bytes[8] & 0x3f).toString(16).padStart(2, '0'),
    bytes[9].toString(16).padStart(2, '0') + bytes[10].toString(16).padStart(2, '0') +
    bytes[11].toString(16).padStart(2, '0') + bytes[12].toString(16).padStart(2, '0') +
    bytes[13].toString(16).padStart(2, '0') + bytes[14].toString(16).padStart(2, '0') +
    bytes[15].toString(16).padStart(2, '0')
  ].join('-');
}

function generateUUIDv5(): string {
  // UUID v5 (SHA-1 hash) - simplified implementation
  const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // DNS namespace
  const name = 'example.com';
  const hash = simpleHash(namespace + name);
  
  return [
    hash.toString(16).padStart(8, '0'),
    (hash >> 32).toString(16).padStart(4, '0'),
    '5' + ((hash >> 48) & 0x0fff).toString(16).padStart(3, '0'),
    '8' + ((hash >> 60) & 0x3f).toString(16).padStart(2, '0'),
    (hash >> 16).toString(16).padStart(12, '0')
  ].join('-');
}

function formatUUID(uuid: string, options: UUIDOptions): string {
  let formatted = uuid;

  // Apply formatting options
  if (options.removeDashes) {
    formatted = formatted.replace(/-/g, '');
  }

  if (options.uppercase) {
    formatted = formatted.toUpperCase();
  }

  // Apply specific format
  switch (options.format) {
    case 'hex':
      formatted = formatted.replace(/-/g, '');
      break;
    case 'urn':
      formatted = `urn:uuid:${formatted}`;
      break;
    case 'bytes':
      // Convert to bytes representation
      const hex = formatted.replace(/-/g, '');
      const bytes = [];
      for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
      }
      formatted = bytes.join(',');
      break;
    case 'base64':
      // Convert to base64
      const hexStr = formatted.replace(/-/g, '');
      const buffer = Buffer.from(hexStr, 'hex');
      formatted = buffer.toString('base64');
      break;
  }

  return formatted;
}

function validateUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isValid = uuidRegex.test(uuid);
  
  if (!isValid) {
    return { isValid: false };
  }

  // Extract version
  const version = parseInt(uuid[14], 16);
  
  // Extract variant
  const variantByte = parseInt(uuid[19], 16);
  let variant = '';
  if ((variantByte & 0x80) === 0x00) variant = 'NCS (backward compatibility)';
  else if ((variantByte & 0xc0) === 0x80) variant = 'RFC 4122';
  else if ((variantByte & 0xe0) === 0xc0) variant = 'Microsoft GUID';
  else if ((variantByte & 0xe0) === 0xe0) variant = 'reserved for future definition';

  return {
    isValid: true,
    variant,
    version
  };
}

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
    error: 'POST method required with options'
  }, { status: 405 });
}