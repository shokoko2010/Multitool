import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface URLShortenerOptions {
  customAlias?: string;
  domain?: string;
  expiration?: string; // ISO date string or duration
  password?: string;
  description?: string;
  analytics?: boolean;
  qrCode?: boolean;
}

interface ShortenedURL {
  shortUrl: string;
  shortCode: string;
  originalUrl: string;
  createdAt: string;
  expiresAt?: string;
  clicks: number;
  options: URLShortenerOptions;
}

interface URLShortenerResult {
  success: boolean;
  data?: {
    shortenedURL: ShortenedURL;
    qrCode?: string; // base64 encoded
    analytics?: {
      predictedClicks: number;
      riskAssessment: 'low' | 'medium' | 'high';
      category: 'social' | 'news' | 'ecommerce' | 'education' | 'entertainment' | 'other';
    };
  };
  error?: string;
  analysis?: string;
}

// In-memory storage for demo purposes (in production, use a database)
const urlStore = new Map<string, ShortenedURL>();
const clickStore = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    const { url, options = {} } = await request.json();

    if (!url) {
      return NextResponse.json<URLShortenerResult>({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json<URLShortenerResult>({
        success: false,
        error: 'Invalid URL format'
      }, { status: 400 });
    }

    // Set default options
    const shortenerOptions: URLShortenerOptions = {
      customAlias: options.customAlias || undefined,
      domain: options.domain || 'short.ly',
      expiration: options.expiration || undefined,
      password: options.password || undefined,
      description: options.description || '',
      analytics: options.analytics !== false,
      qrCode: options.qrCode || false
    };

    // Generate short code
    let shortCode: string;
    if (shortenerOptions.customAlias) {
      // Validate custom alias
      if (!/^[a-zA-Z0-9_-]+$/.test(shortenerOptions.customAlias)) {
        return NextResponse.json<URLShortenerResult>({
          success: false,
          error: 'Custom alias can only contain letters, numbers, hyphens, and underscores'
        }, { status: 400 });
      }
      
      if (urlStore.has(shortenerOptions.customAlias)) {
        return NextResponse.json<URLShortenerResult>({
          success: false,
          error: 'Custom alias already exists'
        }, { status: 400 });
      }
      
      shortCode = shortenerOptions.customAlias;
    } else {
      // Generate random short code
      shortCode = generateShortCode(url);
      while (urlStore.has(shortCode)) {
        shortCode = generateShortCode(url);
      }
    }

    // Parse expiration date
    let expiresAt: string | undefined;
    if (shortenerOptions.expiration) {
      try {
        const expirationDate = new Date(shortenerOptions.expiration);
        if (isNaN(expirationDate.getTime())) {
          // Try to parse as duration (e.g., "1h", "7d", "30m")
          expiresAt = parseDuration(shortenerOptions.expiration);
        } else {
          expiresAt = expirationDate.toISOString();
        }
      } catch (error) {
        return NextResponse.json<URLShortenerResult>({
          success: false,
          error: 'Invalid expiration format. Use ISO date or duration (e.g., "1h", "7d")'
        }, { status: 400 });
      }
    }

    // Create shortened URL
    const shortenedURL: ShortenedURL = {
      shortUrl: `https://${shortenerOptions.domain}/${shortCode}`,
      shortCode,
      originalUrl: url,
      createdAt: new Date().toISOString(),
      expiresAt,
      clicks: 0,
      options: shortenerOptions
    };

    // Store the URL
    urlStore.set(shortCode, shortenedURL);
    clickStore.set(shortCode, 0);

    // Generate QR code if requested
    let qrCode: string | undefined;
    if (shortenerOptions.qrCode) {
      qrCode = generateQRCode(shortenedURL.shortUrl);
    }

    // Generate analytics
    let analytics;
    if (shortenerOptions.analytics) {
      analytics = generateURLAnalytics(url);
    }

    const result = {
      shortenedURL,
      qrCode,
      analytics
    };

    // AI Analysis
    let analysis = '';
    try {
      const zai = await ZAI.create();
      const analysisResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a URL shortening expert. Analyze the URL shortening request and provide insights about URL best practices, security considerations, and usage recommendations.'
          },
          {
            role: 'user',
            content: `Analyze this URL shortening request:\n\nOriginal URL: ${url}\nShort URL: ${shortenedURL.shortUrl}\nCustom Alias: ${shortenerOptions.customAlias || 'Auto-generated'}\nDomain: ${shortenerOptions.domain}\nExpiration: ${expiresAt || 'Never'}\nPassword Protected: ${!!shortenerOptions.password}\nAnalytics: ${shortenerOptions.analytics}\nQR Code: ${shortenerOptions.qrCode}\n\nAnalytics Data: ${analytics ? JSON.stringify(analytics, null, 2) : 'None'}`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      analysis = analysisResponse.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI analysis failed:', error);
    }

    return NextResponse.json<URLShortenerResult>({
      success: true,
      data: result,
      analysis
    });

  } catch (error) {
    console.error('URL shortening error:', error);
    return NextResponse.json<URLShortenerResult>({
      success: false,
      error: 'Internal server error during URL shortening'
    }, { status: 500 });
  }
}

function generateShortCode(url: string): string {
  // Generate a short code based on URL hash
  const hash = simpleHash(url);
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  let code = '';
  let value = hash;
  
  for (let i = 0; i < 6; i++) {
    code += alphabet[value % alphabet.length];
    value = Math.floor(value / alphabet.length);
  }
  
  return code;
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

function parseDuration(duration: string): string {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error('Invalid duration format');
  }
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  const now = new Date();
  let expiration = new Date(now);
  
  switch (unit) {
    case 's':
      expiration.setSeconds(now.getSeconds() + value);
      break;
    case 'm':
      expiration.setMinutes(now.getMinutes() + value);
      break;
    case 'h':
      expiration.setHours(now.getHours() + value);
      break;
    case 'd':
      expiration.setDate(now.getDate() + value);
      break;
  }
  
  return expiration.toISOString();
}

function generateQRCode(url: string): string {
  // This is a placeholder implementation
  // In a real implementation, you would use a QR code library
  const size = 256;
  const modules = 32; // Simplified module count
  
  // Create a simple pattern
  let pattern = '';
  for (let i = 0; i < modules; i++) {
    for (let j = 0; j < modules; j++) {
      const hash = simpleHash(url + i + j);
      pattern += (hash % 2) === 0 ? '█' : ' ';
    }
    pattern += '\n';
  }
  
  const base64 = Buffer.from(pattern).toString('base64');
  return `data:image/png;base64,${base64}`;
}

function generateURLAnalytics(url: string) {
  const urlObj = new URL(url);
  const domain = urlObj.hostname;
  
  // Simple URL categorization
  let category: 'social' | 'news' | 'ecommerce' | 'education' | 'entertainment' | 'other' = 'other';
  
  if (domain.includes('facebook') || domain.includes('twitter') || domain.includes('instagram')) {
    category = 'social';
  } else if (domain.includes('news') || domain.includes('bbc') || domain.includes('cnn')) {
    category = 'news';
  } else if (domain.includes('amazon') || domain.includes('shop') || domain.includes('store')) {
    category = 'ecommerce';
  } else if (domain.includes('edu') || domain.includes('university') || domain.includes('school')) {
    category = 'education';
  } else if (domain.includes('youtube') || domain.includes('netflix') || domain.includes('spotify')) {
    category = 'entertainment';
  }
  
  // Risk assessment based on URL characteristics
  let riskAssessment: 'low' | 'medium' | 'high' = 'low';
  
  if (url.length > 200) riskAssessment = 'medium';
  if (domain.includes('bit.ly') || domain.includes('tinyurl')) riskAssessment = 'medium';
  if (url.includes('password') || url.includes('login')) riskAssessment = 'medium';
  
  // Predicted clicks (simplified)
  const predictedClicks = Math.floor(Math.random() * 1000) + 100;
  
  return {
    predictedClicks,
    riskAssessment,
    category
  };
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'POST method required with URL and options'
  }, { status: 405 });
}