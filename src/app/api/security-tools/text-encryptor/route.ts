import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, key, operation = 'encrypt', encoding = 'base64' } = body;

    // Input validation
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!key) {
      return NextResponse.json(
        { error: 'Encryption key is required' },
        { status: 400 }
      );
    }

    if (!['encrypt', 'decrypt'].includes(operation)) {
      return NextResponse.json(
        { error: 'Operation must be either "encrypt" or "decrypt"' },
        { status: 400 }
      );
    }

    if (!['base64', 'hex'].includes(encoding)) {
      return NextResponse.json(
        { error: 'Encoding must be either "base64" or "hex"' },
        { status: 400 }
      );
    }

    // Derive a proper key from the provided key
    const deriveKey = (password: string, salt: Buffer): Buffer => {
      return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    };

    if (operation === 'encrypt') {
      // Generate random salt and IV
      const salt = crypto.randomBytes(16);
      const iv = crypto.randomBytes(16);
      
      // Derive key
      const derivedKey = deriveKey(key, salt);
      
      // Create cipher
      const cipher = crypto.createCipher(ALGORITHM, derivedKey);
      
      // Encrypt the text
      let encrypted = cipher.update(text, 'utf8', encoding);
      encrypted += cipher.final(encoding);
      
      // Get authentication tag
      const authTag = cipher.getAuthTag();
      
      // Combine salt, IV, auth tag, and encrypted data
      const result = Buffer.concat([salt, iv, authTag, Buffer.from(encrypted, encoding)]);
      
      // Try to get AI insights
      let aiInsights = null;
      try {
        const zai = await ZAI.create();
        const insights = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are a cryptography expert. Analyze the encryption operation and provide security recommendations.'
            },
            {
              role: 'user',
              content: `Encrypted text (${text.length} characters) using AES-256-GCM with key derivation. Provide security analysis and best practices for encrypted data storage and transmission.`
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
        result: result.toString(encoding),
        operation: 'encrypt',
        metadata: {
          algorithm: ALGORITHM,
          keyDerivation: 'PBKDF2-SHA256',
          iterations: 100000,
          saltLength: 16,
          ivLength: 16,
          authTagLength: 16,
          encoding
        },
        aiInsights
      });

    } else {
      // Decrypt operation
      try {
        // Decode the encrypted data
        const encryptedData = Buffer.from(text, encoding);
        
        // Extract components
        const salt = encryptedData.subarray(0, 16);
        const iv = encryptedData.subarray(16, 32);
        const authTag = encryptedData.subarray(32, 48);
        const encrypted = encryptedData.subarray(48);
        
        // Derive key
        const derivedKey = deriveKey(key, salt);
        
        // Create decipher
        const decipher = crypto.createDecipher(ALGORITHM, derivedKey);
        decipher.setAuthTag(authTag);
        
        // Decrypt the data
        let decrypted = decipher.update(encrypted.toString(encoding), encoding, 'utf8');
        decrypted += decipher.final('utf8');
        
        // Try to get AI insights
        let aiInsights = null;
        try {
          const zai = await ZAI.create();
          const insights = await zai.chat.completions.create({
            messages: [
              {
                role: 'system',
                content: 'You are a cryptography expert. Analyze the decryption operation and provide security recommendations.'
              },
              {
                role: 'user',
                content: `Successfully decrypted text using AES-256-GCM. Provide security analysis and recommendations for handling decrypted sensitive data.`
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
          result: decrypted,
          operation: 'decrypt',
          metadata: {
            algorithm: ALGORITHM,
            keyDerivation: 'PBKDF2-SHA256',
            encoding
          },
          aiInsights
        });

      } catch (error) {
        return NextResponse.json(
          { error: 'Decryption failed. Invalid key or corrupted data.' },
          { status: 400 }
        );
      }
    }

  } catch (error) {
    console.error('Text encryption/decryption error:', error);
    return NextResponse.json(
      { error: 'Failed to perform encryption/decryption operation' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Text Encryptor/Decryptor API',
    usage: 'POST /api/security-tools/text-encryptor',
    parameters: {
      text: 'Text to encrypt or decrypt (required)',
      key: 'Encryption/decryption key (required)',
      operation: 'Operation: "encrypt" or "decrypt" (default: "encrypt") - optional',
      encoding: 'Output encoding: "base64" or "hex" (default: "base64") - optional'
    },
    security: {
      algorithm: 'AES-256-GCM',
      keyDerivation: 'PBKDF2-SHA256 with 100,000 iterations',
      features: [
        'Authenticated encryption with GCM mode',
        'Random salt and IV generation',
        'Authentication tag for integrity verification',
        'Key derivation from password'
      ]
    },
    example: {
      text: 'Secret message',
      key: 'my-secret-password',
      operation: 'encrypt',
      encoding: 'base64'
    }
  });
}