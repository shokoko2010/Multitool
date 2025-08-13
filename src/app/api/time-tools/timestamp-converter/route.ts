import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      timestamp,
      inputFormat = 'unix',
      outputFormats = ['iso', 'unix', 'unix_ms', 'local', 'utc', 'relative'],
      timezone = 'UTC'
    } = body;

    // Input validation
    if (timestamp === undefined || timestamp === null) {
      return NextResponse.json(
        { error: 'Timestamp is required' },
        { status: 400 }
      );
    }

    if (!['unix', 'unix_ms', 'iso', 'date_string', 'relative'].includes(inputFormat)) {
      return NextResponse.json(
        { error: 'Invalid input format. Must be unix, unix_ms, iso, date_string, or relative' },
        { status: 400 }
      );
    }

    if (!Array.isArray(outputFormats) || outputFormats.length === 0) {
      return NextResponse.json(
        { error: 'At least one output format must be specified' },
        { status: 400 }
      );
    }

    const validOutputFormats = ['iso', 'unix', 'unix_ms', 'local', 'utc', 'relative', 'rfc2822', 'iso8601'];
    const invalidFormats = outputFormats.filter(format => !validOutputFormats.includes(format));
    if (invalidFormats.length > 0) {
      return NextResponse.json(
        { error: `Invalid output formats: ${invalidFormats.join(', ')}` },
        { status: 400 }
      );
    }

    // Parse input timestamp
    let date: Date;
    let parsedInput: any = {};

    try {
      switch (inputFormat) {
        case 'unix':
          if (typeof timestamp !== 'number' || timestamp < 0) {
            return NextResponse.json(
              { error: 'Unix timestamp must be a positive number' },
              { status: 400 }
            );
          }
          date = new Date(timestamp * 1000);
          parsedInput = { type: 'unix', value: timestamp };
          break;

        case 'unix_ms':
          if (typeof timestamp !== 'number' || timestamp < 0) {
            return NextResponse.json(
              { error: 'Unix millisecond timestamp must be a positive number' },
              { status: 400 }
            );
          }
          date = new Date(timestamp);
          parsedInput = { type: 'unix_ms', value: timestamp };
          break;

        case 'iso':
          if (typeof timestamp !== 'string') {
            return NextResponse.json(
              { error: 'ISO timestamp must be a string' },
              { status: 400 }
            );
          }
          date = new Date(timestamp);
          if (isNaN(date.getTime())) {
            return NextResponse.json(
              { error: 'Invalid ISO timestamp format' },
              { status: 400 }
            );
          }
          parsedInput = { type: 'iso', value: timestamp };
          break;

        case 'date_string':
          if (typeof timestamp !== 'string') {
            return NextResponse.json(
              { error: 'Date string must be a string' },
              { status: 400 }
            );
          }
          date = new Date(timestamp);
          if (isNaN(date.getTime())) {
            return NextResponse.json(
              { error: 'Invalid date string format' },
              { status: 400 }
            );
          }
          parsedInput = { type: 'date_string', value: timestamp };
          break;

        case 'relative':
          if (typeof timestamp !== 'string') {
            return NextResponse.json(
              { error: 'Relative time must be a string' },
              { status: 400 }
            );
          }
          date = parseRelativeTime(timestamp);
          if (isNaN(date.getTime())) {
            return NextResponse.json(
              { error: 'Invalid relative time format. Use formats like "2 days ago", "in 3 hours", etc.' },
              { status: 400 }
            );
          }
          parsedInput = { type: 'relative', value: timestamp };
          break;

        default:
          return NextResponse.json(
            { error: 'Unsupported input format' },
            { status: 400 }
          );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to parse timestamp' },
        { status: 400 }
      );
    }

    // Validate the parsed date
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid timestamp' },
        { status: 400 }
      );
    }

    // Generate output formats
    const outputs: Record<string, string> = {};
    const now = new Date();

    if (outputFormats.includes('iso')) {
      outputs.iso = date.toISOString();
    }

    if (outputFormats.includes('unix')) {
      outputs.unix = Math.floor(date.getTime() / 1000).toString();
    }

    if (outputFormats.includes('unix_ms')) {
      outputs.unix_ms = date.getTime().toString();
    }

    if (outputFormats.includes('local')) {
      outputs.local = date.toLocaleString();
    }

    if (outputFormats.includes('utc')) {
      outputs.utc = date.toUTCString();
    }

    if (outputFormats.includes('rfc2822')) {
      outputs.rfc2822 = date.toUTCString().replace(/GMT$/, '+0000');
    }

    if (outputFormats.includes('iso8601')) {
      outputs.iso8601 = date.toISOString().replace(/\.\d{3}Z$/, 'Z');
    }

    if (outputFormats.includes('relative')) {
      outputs.relative = getRelativeTimeString(date, now);
    }

    // Additional timestamp information
    const timestampInfo = {
      isValid: true,
      isFuture: date > now,
      isPast: date < now,
      isCurrentYear: date.getFullYear() === now.getFullYear(),
      dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
      dayOfYear: getDayOfYear(date),
      weekOfYear: getWeekOfYear(date),
      quarter: Math.floor(date.getMonth() / 3) + 1,
      isLeapYear: isLeapYear(date.getFullYear()),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: date.getTimezoneOffset(),
      unixTimestamp: Math.floor(date.getTime() / 1000),
      unixTimestampMs: date.getTime()
    };

    // Date components
    const components = {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hours: date.getHours(),
      minutes: date.getMinutes(),
      seconds: date.getSeconds(),
      milliseconds: date.getMilliseconds(),
      timezoneOffset: date.getTimezoneOffset()
    };

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a timestamp and datetime expert. Analyze the timestamp conversion and provide insights about the date, its significance, and best practices for timestamp handling.'
          },
          {
            role: 'user',
            content: `Converted timestamp from ${inputFormat} format to multiple formats. Original: ${JSON.stringify(parsedInput)}. Converted to: ${Object.keys(outputs).join(', ')}. Date info: ${timestampInfo.isFuture ? 'Future' : 'Past'} date, ${timestampInfo.dayOfWeek}, ${timestampInfo.dayOfYear}th day of year. Provide insights about timestamp handling and best practices.`
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
      input: parsedInput,
      outputs,
      info: timestampInfo,
      components,
      aiInsights
    });

  } catch (error) {
    console.error('Timestamp conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to convert timestamp' },
      { status: 500 }
    );
  }
}

// Helper functions
function parseRelativeTime(relativeString: string): Date {
  const now = new Date();
  const lowerString = relativeString.toLowerCase();
  
  // Match patterns like "2 days ago", "in 3 hours", "1 week from now", etc.
  const match = lowerString.match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+(ago|from now|in the past|in the future)/);
  
  if (!match) {
    throw new Error('Invalid relative time format');
  }
  
  const value = parseInt(match[1]);
  const unit = match[2];
  const direction = match[3];
  
  const multiplier = direction.includes('ago') || direction.includes('past') ? -1 : 1;
  
  let milliseconds = 0;
  switch (unit) {
    case 'second':
      milliseconds = value * 1000;
      break;
    case 'minute':
      milliseconds = value * 60 * 1000;
      break;
    case 'hour':
      milliseconds = value * 60 * 60 * 1000;
      break;
    case 'day':
      milliseconds = value * 24 * 60 * 60 * 1000;
      break;
    case 'week':
      milliseconds = value * 7 * 24 * 60 * 60 * 1000;
      break;
    case 'month':
      milliseconds = value * 30 * 24 * 60 * 60 * 1000; // Approximate
      break;
    case 'year':
      milliseconds = value * 365 * 24 * 60 * 60 * 1000; // Approximate
      break;
  }
  
  return new Date(now.getTime() + (milliseconds * multiplier));
}

function getRelativeTimeString(date: Date, now: Date): string {
  const diff = date.getTime() - now.getTime();
  const absDiff = Math.abs(diff);
  
  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  let result: string;
  let unit: string;
  
  if (years > 0) {
    result = years.toString();
    unit = years === 1 ? 'year' : 'years';
  } else if (months > 0) {
    result = months.toString();
    unit = months === 1 ? 'month' : 'months';
  } else if (weeks > 0) {
    result = weeks.toString();
    unit = weeks === 1 ? 'week' : 'weeks';
  } else if (days > 0) {
    result = days.toString();
    unit = days === 1 ? 'day' : 'days';
  } else if (hours > 0) {
    result = hours.toString();
    unit = hours === 1 ? 'hour' : 'hours';
  } else if (minutes > 0) {
    result = minutes.toString();
    unit = minutes === 1 ? 'minute' : 'minutes';
  } else {
    result = seconds.toString();
    unit = seconds === 1 ? 'second' : 'seconds';
  }
  
  const direction = diff > 0 ? 'from now' : 'ago';
  return `${result} ${unit} ${direction}`;
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getWeekOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + start.getDay() + 1) / 7);
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export async function GET() {
  return NextResponse.json({
    message: 'Timestamp Converter API',
    usage: 'POST /api/time-tools/timestamp-converter',
    parameters: {
      timestamp: 'Timestamp to convert (required)',
      inputFormat: 'Input format: unix, unix_ms, iso, date_string, relative (default: unix) - optional',
      outputFormats: 'Array of output formats (default: ["iso", "unix", "unix_ms", "local", "utc", "relative"]) - optional',
      timezone: 'Timezone for local formatting (default: UTC) - optional'
    },
    inputFormats: {
      unix: 'Unix timestamp (seconds since epoch)',
      unix_ms: 'Unix timestamp in milliseconds',
      iso: 'ISO 8601 format string',
      date_string: 'Human-readable date string',
      relative: 'Relative time like "2 days ago" or "in 3 hours"'
    },
    outputFormats: {
      iso: 'ISO 8601 format',
      unix: 'Unix timestamp (seconds)',
      unix_ms: 'Unix timestamp (milliseconds)',
      local: 'Local time string',
      utc: 'UTC time string',
      rfc2822: 'RFC 2822 format',
      iso8601: 'ISO 8601 format without milliseconds',
      relative: 'Relative time description'
    },
    examples: [
      {
        timestamp: 1634567890,
        inputFormat: 'unix',
        outputFormats: ['iso', 'local', 'relative']
      },
      {
        timestamp: '2021-10-18T15:24:50Z',
        inputFormat: 'iso',
        outputFormats: ['unix', 'unix_ms', 'utc']
      },
      {
        timestamp: '2 days ago',
        inputFormat: 'relative',
        outputFormats: ['iso', 'unix', 'local']
      }
    ]
  });
}