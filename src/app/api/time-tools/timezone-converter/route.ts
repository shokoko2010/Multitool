import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

interface TimezoneConversionRequest {
  sourceTimezone: string
  targetTimezone: string
  datetime: string
  format?: string
}

interface TimezoneConversionResponse {
  sourceTime: string
  targetTime: string
  sourceTimezone: string
  targetTimezone: string
  sourceOffset: string
  targetOffset: string
  timeDifference: string
  formatted: {
    source: {
      iso: string
      local: string
      utc: string
    }
    target: {
      iso: string
      local: string
      utc: string
    }
  }
}

// Common timezone mappings
const timezoneMap: Record<string, string> = {
  // Major timezones
  'UTC': 'UTC',
  'GMT': 'Europe/London',
  'EST': 'America/New_York',
  'EDT': 'America/New_York',
  'CST': 'America/Chicago',
  'CDT': 'America/Chicago',
  'MST': 'America/Denver',
  'MDT': 'America/Denver',
  'PST': 'America/Los_Angeles',
  'PDT': 'America/Los_Angeles',
  'AEST': 'Australia/Sydney',
  'AEDT': 'Australia/Sydney',
  'ACST': 'Australia/Adelaide',
  'ACDT': 'Australia/Adelaide',
  'AWST': 'Australia/Perth',
  'JST': 'Asia/Tokyo',
  'KST': 'Asia/Seoul',
  'CST': 'Asia/Shanghai',
  'IST': 'Asia/Kolkata',
  'CEST': 'Europe/Berlin',
  'CET': 'Europe/Berlin',
  'MSK': 'Europe/Moscow',
  'EET': 'Europe/Helsinki',
  'EEST': 'Europe/Helsinki',
  'HKT': 'Asia/Hong_Kong',
  'SGT': 'Asia/Singapore',
  'NZST': 'Pacific/Auckland',
  'NZDT': 'Pacific/Auckland',
  'BRT': 'America/Sao_Paulo',
  'BRST': 'America/Sao_Paulo',
  'ART': 'America/Argentina/Buenos_Aires',
  'CLT': 'America/Santiago',
  'CLST': 'America/Santiago',
  'MEX': 'America/Mexico_City',
  'CAT': 'Africa/Harare',
  'SAST': 'Africa/Johannesburg',
  'EAT': 'Africa/Nairobi',
  'WAT': 'Africa/Lagos',
  'GMT+1': 'Europe/London',
  'GMT+2': 'Europe/Helsinki',
  'GMT+3': 'Africa/Nairobi',
  'GMT+4': 'Asia/Dubai',
  'GMT+5': 'Asia/Karachi',
  'GMT+5:30': 'Asia/Kolkata',
  'GMT+6': 'Asia/Dhaka',
  'GMT+7': 'Asia/Bangkok',
  'GMT+8': 'Asia/Shanghai',
  'GMT+9': 'Asia/Tokyo',
  'GMT+10': 'Australia/Sydney',
  'GMT+11': 'Pacific/Noumea',
  'GMT+12': 'Pacific/Auckland',
  'GMT-1': 'Atlantic/Azores',
  'GMT-2': 'Atlantic/South_Georgia',
  'GMT-3': 'America/Sao_Paulo',
  'GMT-4': 'America/Santiago',
  'GMT-5': 'America/New_York',
  'GMT-6': 'America/Chicago',
  'GMT-7': 'America/Denver',
  'GMT-8': 'America/Los_Angeles',
  'GMT-9': 'America/Anchorage',
  'GMT-10': 'Pacific/Honolulu',
  'GMT-11': 'Pacific/Pago_Pago',
  'GMT-12': 'Pacific/Kwajalein'
}

function getIANATimezone(timezone: string): string {
  return timezoneMap[timezone] || timezone
}

function formatDateTime(date: Date, format: string = 'iso'): string {
  switch (format) {
    case 'iso':
      return date.toISOString()
    case 'local':
      return date.toLocaleString()
    case 'utc':
      return date.toUTCString()
    case 'time':
      return date.toLocaleTimeString()
    case 'date':
      return date.toLocaleDateString()
    default:
      return date.toISOString()
  }
}

function getTimezoneOffset(timezone: string): string {
  try {
    const date = new Date()
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
    const offset = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60)
    const sign = offset >= 0 ? '+' : ''
    return `UTC${sign}${offset}`
  } catch {
    return 'UTC'
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: TimezoneConversionRequest = await request.json()
    const { sourceTimezone, targetTimezone, datetime, format = 'iso' } = body

    if (!sourceTimezone || !targetTimezone || !datetime) {
      return NextResponse.json(
        { error: 'Source timezone, target timezone, and datetime are required' },
        { status: 400 }
      )
    }

    // Get IANA timezone identifiers
    const sourceIANA = getIANATimezone(sourceTimezone)
    const targetIANA = getIANATimezone(targetTimezone)

    // Parse the input datetime
    const sourceDate = new Date(datetime)
    
    if (isNaN(sourceDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid datetime format' },
        { status: 400 }
      )
    }

    // Convert to target timezone
    const targetDate = new Date(
      sourceDate.toLocaleString('en-US', { timeZone: targetIANA })
    )

    // Get timezone offsets
    const sourceOffset = getTimezoneOffset(sourceIANA)
    const targetOffset = getTimezoneOffset(targetIANA)

    // Calculate time difference in hours
    const sourceOffsetHours = parseFloat(sourceOffset.replace('UTC', ''))
    const targetOffsetHours = parseFloat(targetOffset.replace('UTC', ''))
    const timeDifference = targetOffsetHours - sourceOffsetHours

    // Format the response
    const response: TimezoneConversionResponse = {
      sourceTime: formatDateTime(sourceDate, format),
      targetTime: formatDateTime(targetDate, format),
      sourceTimezone,
      targetTimezone,
      sourceOffset,
      targetOffset,
      timeDifference: `${timeDifference >= 0 ? '+' : ''}${timeDifference} hours`,
      formatted: {
        source: {
          iso: formatDateTime(sourceDate, 'iso'),
          local: formatDateTime(sourceDate, 'local'),
          utc: formatDateTime(sourceDate, 'utc')
        },
        target: {
          iso: formatDateTime(targetDate, 'iso'),
          local: formatDateTime(targetDate, 'local'),
          utc: formatDateTime(targetDate, 'utc')
        }
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error converting timezone:', error)
    return NextResponse.json(
      { error: 'Failed to convert timezone' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return available timezones
  const timezones = Object.keys(timezoneMap)
  return NextResponse.json({
    timezones,
    popular: [
      'UTC', 'EST', 'CST', 'MST', 'PST',
      'GMT', 'CET', 'EET', 'JST', 'AEST',
      'IST', 'CST', 'KST', 'MSK', 'HKT'
    ]
  })
}