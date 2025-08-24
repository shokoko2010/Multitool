import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

interface DateCalculationRequest {
  operation: 'add' | 'subtract' | 'difference' | 'weekday' | 'days_between'
  startDate?: string
  endDate?: string
  years?: number
  months?: number
  days?: number
  weeks?: number
  hours?: number
  minutes?: number
  seconds?: number
}

interface DateCalculationResponse {
  operation: string
  result: {
    date?: string
    days?: number
    weeks?: number
    months?: number
    years?: number
    weekday?: string
    isWeekend?: boolean
    isLeapYear?: boolean
    dayOfYear?: number
    weekOfYear?: number
    quarter?: number
  }
  details: {
    calculation: string
    formatted: {
      iso: string
      local: string
      utc: string
    }
    timezone: string
  }
}

function formatDate(date: Date): string {
  return date.toISOString()
}

function formatDateTime(date: Date): string {
  return date.toLocaleString()
}

function formatUTCDate(date: Date): string {
  return date.toUTCString()
}

function getWeekday(date: Date): string {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return weekdays[date.getDay()]
}

function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

function isLeapYear(date: Date): boolean {
  const year = date.getFullYear()
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function getWeekOfYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

function getQuarter(date: Date): number {
  return Math.floor(date.getMonth() / 3) + 1
}

function addTimeToDate(date: Date, years: number = 0, months: number = 0, days: number = 0, 
                      weeks: number = 0, hours: number = 0, minutes: number = 0, seconds: number = 0): Date {
  const result = new Date(date)
  
  result.setFullYear(result.getFullYear() + years)
  result.setMonth(result.getMonth() + months)
  result.setDate(result.getDate() + days + (weeks * 7))
  result.setHours(result.getHours() + hours)
  result.setMinutes(result.getMinutes() + minutes)
  result.setSeconds(result.getSeconds() + seconds)
  
  return result
}

function subtractTimeFromDate(date: Date, years: number = 0, months: number = 0, days: number = 0,
                             weeks: number = 0, hours: number = 0, minutes: number = 0, seconds: number = 0): Date {
  return addTimeToDate(date, -years, -months, -days, -weeks, -hours, -minutes, -seconds)
}

function getDaysBetween(startDate: Date, endDate: Date): number {
  const diff = endDate.getTime() - startDate.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
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

    const body: DateCalculationRequest = await request.json()
    const { operation, startDate, endDate, years, months, days, weeks, hours, minutes, seconds } = body

    if (!operation) {
      return NextResponse.json(
        { error: 'Operation is required' },
        { status: 400 }
      )
    }

    let result: DateCalculationResponse['result']
    let calculation = ''

    switch (operation) {
      case 'add':
        if (!startDate) {
          return NextResponse.json(
            { error: 'Start date is required for add operation' },
            { status: 400 }
          )
        }
        
        const addResult = addTimeToDate(
          new Date(startDate),
          years, months, days, weeks, hours, minutes, seconds
        )
        
        result = {
          date: formatDate(addResult),
          weekday: getWeekday(addResult),
          isWeekend: isWeekend(addResult),
          isLeapYear: isLeapYear(addResult),
          dayOfYear: getDayOfYear(addResult),
          weekOfYear: getWeekOfYear(addResult),
          quarter: getQuarter(addResult)
        }
        
        calculation = `Added ${years || 0} years, ${months || 0} months, ${days || 0} days, ${weeks || 0} weeks, ${hours || 0} hours, ${minutes || 0} minutes, ${seconds || 0} seconds to ${startDate}`
        break

      case 'subtract':
        if (!startDate) {
          return NextResponse.json(
            { error: 'Start date is required for subtract operation' },
            { status: 400 }
          )
        }
        
        const subtractResult = subtractTimeFromDate(
          new Date(startDate),
          years, months, days, weeks, hours, minutes, seconds
        )
        
        result = {
          date: formatDate(subtractResult),
          weekday: getWeekday(subtractResult),
          isWeekend: isWeekend(subtractResult),
          isLeapYear: isLeapYear(subtractResult),
          dayOfYear: getDayOfYear(subtractResult),
          weekOfYear: getWeekOfYear(subtractResult),
          quarter: getQuarter(subtractResult)
        }
        
        calculation = `Subtracted ${years || 0} years, ${months || 0} months, ${days || 0} days, ${weeks || 0} weeks, ${hours || 0} hours, ${minutes || 0} minutes, ${seconds || 0} seconds from ${startDate}`
        break

      case 'difference':
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: 'Both start and end dates are required for difference operation' },
            { status: 400 }
          )
        }
        
        const start = new Date(startDate)
        const end = new Date(endDate)
        const daysDiff = getDaysBetween(start, end)
        
        result = {
          days: Math.abs(daysDiff),
          weeks: Math.abs(Math.floor(daysDiff / 7)),
          months: Math.abs(Math.floor(daysDiff / 30.44)), // Average month length
          years: Math.abs(Math.floor(daysDiff / 365.25)) // Average year length
        }
        
        calculation = `Difference between ${startDate} and ${endDate}`
        break

      case 'days_between':
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: 'Both start and end dates are required for days between operation' },
            { status: 400 }
          )
        }
        
        const daysBetween = getDaysBetween(new Date(startDate), new Date(endDate))
        
        result = {
          days: Math.abs(daysBetween)
        }
        
        calculation = `Days between ${startDate} and ${endDate}`
        break

      case 'weekday':
        if (!startDate) {
          return NextResponse.json(
            { error: 'Start date is required for weekday operation' },
            { status: 400 }
          )
        }
        
        const weekdayDate = new Date(startDate)
        
        result = {
          weekday: getWeekday(weekdayDate),
          isWeekend: isWeekend(weekdayDate),
          dayOfYear: getDayOfYear(weekdayDate),
          weekOfYear: getWeekOfYear(weekdayDate),
          quarter: getQuarter(weekdayDate)
        }
        
        calculation = `Weekday information for ${startDate}`
        break

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        )
    }

    const response: DateCalculationResponse = {
      operation,
      result,
      details: {
        calculation,
        formatted: {
          iso: result.date ? formatDate(new Date(result.date)) : '',
          local: result.date ? formatDateTime(new Date(result.date)) : '',
          utc: result.date ? formatUTCDate(new Date(result.date)) : ''
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error calculating date:', error)
    return NextResponse.json(
      { error: 'Failed to calculate date' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return available operations
  return NextResponse.json({
    operations: [
      { value: 'add', label: 'Add Time', description: 'Add years, months, days, etc. to a date' },
      { value: 'subtract', label: 'Subtract Time', description: 'Subtract years, months, days, etc. from a date' },
      { value: 'difference', label: 'Date Difference', description: 'Calculate difference between two dates' },
      { value: 'days_between', label: 'Days Between', description: 'Calculate exact days between two dates' },
      { value: 'weekday', label: 'Weekday Info', description: 'Get weekday and date information' }
    ]
  })
}