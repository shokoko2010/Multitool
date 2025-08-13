import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      version = '4',
      quantity = 1,
      uppercase = false,
      removeDashes = false,
      namespace,
      name,
      validate = false
    } = body;

    // Input validation
    if (!['1', '3', '4', '5', 'nil'].includes(version)) {
      return NextResponse.json(
        { error: 'Version must be 1, 3, 4, 5, or nil' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000) {
      return NextResponse.json(
        { error: 'Quantity must be between 1 and 1000' },
        { status: 400 }
      );
    }

    if (typeof uppercase !== 'boolean' || typeof removeDashes !== 'boolean' || typeof validate !== 'boolean') {
      return NextResponse.json(
        { error: 'All boolean flags must be boolean values' },
        { status: 400 }
      );
    }

    if ((version === '3' || version === '5') && (!namespace || !name)) {
      return NextResponse.json(
        { error: 'Namespace and name are required for UUID v3 and v5' },
        { status: 400 }
      );
    }

    // Generate UUIDs
    const uuids: string[] = [];
    const validationResults: any[] = [];

    for (let i = 0; i < quantity; i++) {
      let uuid: string;

      switch (version) {
        case '1':
          uuid = generateUUIDv1();
          break;
        case '3':
          uuid = generateUUIDv3(namespace!, name!);
          break;
        case '4':
          uuid = generateUUIDv4();
          break;
        case '5':
          uuid = generateUUIDv5(namespace!, name!);
          break;
        case 'nil':
          uuid = '00000000-0000-0000-0000-000000000000';
          break;
        default:
          uuid = generateUUIDv4();
      }

      // Apply formatting options
      if (removeDashes) {
        uuid = uuid.replace(/-/g, '');
      }
      if (uppercase) {
        uuid = uuid.toUpperCase();
      }

      uuids.push(uuid);

      // Validate UUID if requested
      if (validate) {
        const validation = validateUUID(uuid);
        validationResults.push(validation);
      }
    }

    // UUID information and analysis
    const uuidInfo = {
      version,
      versionDescription: getVersionDescription(version),
      quantity,
      formatting: {
        uppercase,
        removeDashes,
        format: removeDashes ? (uppercase ? 'UPPERCASE_NO_DASHES' : 'lowercase_no_dashes') : 
                (uppercase ? 'UPPERCASE' : 'standard')
      },
      generatedAt: new Date().toISOString()
    };

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a UUID and distributed systems expert. Analyze the UUID generation and provide insights about UUID usage, best practices, and applications.'
          },
          {
            role: 'user',
            content: `Generated ${quantity} UUID v${version} with ${uppercase ? 'uppercase' : 'lowercase'} ${removeDashes ? 'without dashes' : 'with dashes'}. ${version === 'nil' ? 'Generated nil UUIDs for testing purposes.' : ''} Provide insights about UUID usage, collision probability, and best practices for distributed systems.`
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      });
      aiInsights = insights.choices[0]?.message?.content || null;
    } catch (error) {
      console.warn('AI insights failed:', error);
    }

    const result = {
      success: true,
      uuids,
      info: uuidInfo
    };

    if (validate) {
      result.validation = validationResults;
    }

    return NextResponse.json({
      ...result,
      aiInsights
    });

  } catch (error) {
    console.error('UUID generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate UUIDs' },
      { status: 500 }
    );
  }
}

// UUID generation functions
function generateUUIDv1(): string {
  const buffer = crypto.randomBytes(16);
  
  // Set version (1) and variant bits
  buffer[6] = (buffer[6] & 0x0f) | 0x10; // Version 1
  buffer[8] = (buffer[8] & 0x3f) | 0x80; // Variant 1

  // Get timestamp (100-nanosecond intervals since 1582-10-15)
  const timestamp = Date.now() * 10000 + 122192928000000000;
  const timeLow = timestamp & 0xffffffff;
  const timeMid = (timestamp >> 32) & 0xffff;
  const timeHi = (timestamp >> 48) & 0x0fff;

  // Set time fields
  buffer.writeUInt32LE(timeLow, 0);
  buffer.writeUInt16LE(timeMid, 4);
  buffer.writeUInt16LE(timeHi, 6);

  // Format as UUID string
  return formatUUID(buffer);
}

function generateUUIDv3(namespace: string, name: string): string {
  // Generate namespace UUID if it's a well-known namespace
  let namespaceBuffer: Buffer;
  const wellKnownNamespaces: Record<string, string> = {
    'dns': '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    'url': '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
    'oid': '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
    'x500': '6ba7b814-9dad-11d1-80b4-00c04fd430c8'
  };

  if (wellKnownNamespaces[namespace.toLowerCase()]) {
    namespaceBuffer = Buffer.from(wellKnownNamespaces[namespace.toLowerCase()].replace(/-/g, ''), 'hex');
  } else {
    // Assume it's a UUID string
    namespaceBuffer = Buffer.from(namespace.replace(/-/g, ''), 'hex');
  }

  // Concatenate namespace and name
  const nameBuffer = Buffer.from(name, 'utf8');
  const combined = Buffer.concat([namespaceBuffer, nameBuffer]);

  // Generate MD5 hash
  const hash = crypto.createHash('md5').update(combined).digest();

  // Set version (3) and variant bits
  hash[6] = (hash[6] & 0x0f) | 0x30; // Version 3
  hash[8] = (hash[8] & 0x3f) | 0x80; // Variant 1

  return formatUUID(hash);
}

function generateUUIDv4(): string {
  const buffer = crypto.randomBytes(16);
  
  // Set version (4) and variant bits
  buffer[6] = (buffer[6] & 0x0f) | 0x40; // Version 4
  buffer[8] = (buffer[8] & 0x3f) | 0x80; // Variant 1

  return formatUUID(buffer);
}

function generateUUIDv5(namespace: string, name: string): string {
  // Generate namespace UUID if it's a well-known namespace
  let namespaceBuffer: Buffer;
  const wellKnownNamespaces: Record<string, string> = {
    'dns': '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    'url': '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
    'oid': '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
    'x500': '6ba7b814-9dad-11d1-80b4-00c04fd430c8'
  };

  if (wellKnownNamespaces[namespace.toLowerCase()]) {
    namespaceBuffer = Buffer.from(wellKnownNamespaces[namespace.toLowerCase()].replace(/-/g, ''), 'hex');
  } else {
    // Assume it's a UUID string
    namespaceBuffer = Buffer.from(namespace.replace(/-/g, ''), 'hex');
  }

  // Concatenate namespace and name
  const nameBuffer = Buffer.from(name, 'utf8');
  const combined = Buffer.concat([namespaceBuffer, nameBuffer]);

  // Generate SHA-1 hash
  const hash = crypto.createHash('sha1').update(combined).digest();

  // Set version (5) and variant bits
  hash[6] = (hash[6] & 0x0f) | 0x50; // Version 5
  hash[8] = (hash[8] & 0x3f) | 0x80; // Variant 1

  return formatUUID(hash.slice(0, 16));
}

function formatUUID(buffer: Buffer): string {
  const hex = buffer.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function validateUUID(uuid: string): { isValid: boolean; version?: string; variant?: string; error?: string } {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(uuid)) {
    return { isValid: false, error: 'Invalid UUID format' };
  }

  const cleanUUID = uuid.replace(/-/g, '');
  const buffer = Buffer.from(cleanUUID, 'hex');
  
  // Extract version
  const version = (buffer[6] & 0xf0) >> 4;
  
  // Extract variant
  const variant = buffer[8] & 0xc0;
  let variantName: string;
  
  if (variant === 0x80) variantName = 'RFC 4122';
  else if (variant === 0xc0) variantName = 'Microsoft';
  else if (variant === 0xe0) variantName = 'Future';
  else variantName = 'Reserved';

  return {
    isValid: true,
    version: version.toString(),
    variant: variantName
  };
}

function getVersionDescription(version: string): string {
  const descriptions = {
    '1': 'Time-based UUID with MAC address',
    '3': 'MD5 hash-based UUID with namespace',
    '4': 'Random UUID',
    '5': 'SHA-1 hash-based UUID with namespace',
    'nil': 'Nil UUID (all zeros)'
  };
  return descriptions[version as keyof typeof descriptions] || 'Unknown';
}

export async function GET() {
  return NextResponse.json({
    message: 'UUID Generator API',
    usage: 'POST /api/developer-tools/uuid-generator',
    parameters: {
      version: 'UUID version: 1, 3, 4, 5, or nil (default: 4) - optional',
      quantity: 'Number of UUIDs to generate (1-1000, default: 1) - optional',
      uppercase: 'Output in uppercase (default: false) - optional',
      removeDashes: 'Remove dashes from output (default: false) - optional',
      namespace: 'Namespace for v3/v5 (required for v3/v5) - optional',
      name: 'Name for v3/v5 (required for v3/v5) - optional',
      validate: 'Validate generated UUIDs (default: false) - optional'
    },
    versions: {
      '1': 'Time-based UUID (timestamp + MAC address)',
      '3': 'MD5 namespace-based UUID',
      '4': 'Random UUID (recommended)',
      '5': 'SHA-1 namespace-based UUID',
      'nil': 'Nil UUID (all zeros)'
    },
    wellKnownNamespaces: {
      'dns': 'DNS namespace',
      'url': 'URL namespace',
      'oid': 'OID namespace',
      'x500': 'X.500 DN namespace'
    },
    examples: [
      {
        version: '4',
        quantity: 5,
        uppercase: false,
        removeDashes: false
      },
      {
        version: '5',
        namespace: 'dns',
        name: 'example.com',
        quantity: 1
      }
    ]
  });
}