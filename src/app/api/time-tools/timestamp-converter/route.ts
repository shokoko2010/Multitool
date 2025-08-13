import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface TimestampConversion {
  unix: number;
  iso: string;
  utc: string;
  local: string;
  relative: string;
  timezone: string;
  formatted: {
    date: string;
    time: string;
    datetime: string;
  };
}

interface ConversionResult {
  success: boolean;
  data?: TimestampConversion;
  error?: string;
  analysis?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { timestamp, format = 'unix' } = await request.json();

    if (!timestamp) {
      return NextResponse.json<ConversionResult>({
        success: false,
        error: 'Timestamp is required'
      }, { status: 400 });
    }

    let date: Date;

    // Parse timestamp based on format
    switch (format) {
      case 'unix':
        // Handle both seconds and milliseconds
        const unixTime = typeof timestamp === 'string' ? parseFloat(timestamp) : timestamp;
        date = new Date(unixTime > 1e12 ? unixTime : unixTime * 1000);
        break;
      case 'iso':
        date = new Date(timestamp);
        break;
      case 'utc':
        date = new Date(timestamp);
        break;
      case 'natural':
        // Natural language parsing (simplified)
        date = new Date(timestamp);
        break;
      default:
        return NextResponse.json<ConversionResult>({
          success: false,
          error: 'Unsupported format. Use: unix, iso, utc, or natural'
        }, { status: 400 });
    }

    // Validate date
    if (isNaN(date.getTime())) {
      return NextResponse.json<ConversionResult>({
        success: false,
        error: 'Invalid timestamp format'
      }, { status: 400 });
    }

    // Convert to various formats
    const unix = Math.floor(date.getTime() / 1000);
    const iso = date.toISOString();
    const utc = date.toUTCString();
    const local = date.toLocaleString();
    
    // Calculate relative time
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    let relative = '';
    
    if (Math.abs(diff) < 60000) {
      relative = 'just now';
    } else if (Math.abs(diff) < 3600000) {
      const minutes = Math.floor(Math.abs(diff) / 60000);
      relative = diff > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''} ago` : `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (Math.abs(diff) < 86400000) {
      const hours = Math.floor(Math.abs(diff) / 3600000);
      relative = diff > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ago` : `in ${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (Math.abs(diff) < 2592000000) {
      const days = Math.floor(Math.abs(diff) / 86400000);
      relative = diff > 0 ? `${days} day${days > 1 ? 's' : ''} ago` : `in ${days} day${days > 1 ? 's' : ''}`;
    } else {
      const months = Math.floor(Math.abs(diff) / 2592000000);
      relative = diff > 0 ? `${months} month${months > 1 ? 's' : ''} ago` : `in ${months} month${months > 1 ? 's' : ''}`;
    }

    // Get timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Format various date/time representations
    const formatted = {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      datetime: date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const result: TimestampConversion = {
      unix,
      iso,
      utc,
      local,
      relative,
      timezone,
      formatted
    };

    // AI Analysis
    let analysis = '';
    try {
      const zai = await ZAI.create();
      const analysisResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a timestamp analysis expert. Analyze the provided timestamp conversion and provide insights about its significance, common use cases, and any interesting patterns.'
          },
          {
            role: 'user',
            content: `Analyze this timestamp conversion:\n\nInput: ${timestamp} (${format} format)\n\nResults:\n- Unix: ${unix}\n- ISO: ${iso}\n- UTC: ${utc}\n- Local: ${local}\n- Relative: ${relative}\n- Timezone: ${timezone}\n- Formatted: ${JSON.stringify(formatted, null, 2)}`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      analysis = analysisResponse.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI analysis failed:', error);
    }

    return NextResponse.json<ConversionResult>({
      success: true,
      data: result,
      analysis
    });

  } catch (error) {
    console.error('Timestamp conversion error:', error);
    return NextResponse.json<ConversionResult>({
      success: false,
      error: 'Internal server error during timestamp conversion'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'POST method required with timestamp data'
  }, { status: 405 });
}