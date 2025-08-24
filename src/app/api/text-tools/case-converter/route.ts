import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

interface TextCaseConversionRequest {
  text: string
  conversionType: 'uppercase' | 'lowercase' | 'titlecase' | 'camelcase' | 'snakecase' | 'kebabcase' | 'sentencecase' | 'alternatingcase' | 'inversecase'
}

interface TextCaseConversionResponse {
  originalText: string
  convertedText: string
  conversionType: string
  characterCount: number
  wordCount: number
  statistics: {
    uppercase: number
    lowercase: number
    numbers: number
    spaces: number
    special: number
  }
}

function toUpperCase(text: string): string {
  return text.toUpperCase()
}

function toLowerCase(text: string): string {
  return text.toLowerCase()
}

function toTitleCase(text: string): string {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

function toCamelCase(text: string): string {
  return text
    .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
      if (+match === 0) return ""
      return index === 0 ? match.toLowerCase() : match.toUpperCase()
    })
    .replace(/\s+/g, '')
}

function toSnakeCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()
}

function toKebabCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

function toSentenceCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/(^\w|\.\s*\w)/g, (letter) => letter.toUpperCase())
}

function toAlternatingCase(text: string): string {
  return text
    .split('')
    .map((char, index) => 
      index % 2 === 0 ? char.toUpperCase() : char.toLowerCase()
    )
    .join('')
}

function toInverseCase(text: string): string {
  return text
    .split('')
    .map((char) => {
      if (char === char.toUpperCase()) {
        return char.toLowerCase()
      } else {
        return char.toUpperCase()
      }
    })
    .join('')
}

function getTextStatistics(text: string) {
  let uppercase = 0
  let lowercase = 0
  let numbers = 0
  let spaces = 0
  let special = 0

  for (const char of text) {
    if (char >= 'A' && char <= 'Z') {
      uppercase++
    } else if (char >= 'a' && char <= 'z') {
      lowercase++
    } else if (char >= '0' && char <= '9') {
      numbers++
    } else if (char === ' ') {
      spaces++
    } else {
      special++
    }
  }

  return { uppercase, lowercase, numbers, spaces, special }
}

function convertTextCase(text: string, conversionType: string): string {
  switch (conversionType) {
    case 'uppercase':
      return toUpperCase(text)
    case 'lowercase':
      return toLowerCase(text)
    case 'titlecase':
      return toTitleCase(text)
    case 'camelcase':
      return toCamelCase(text)
    case 'snakecase':
      return toSnakeCase(text)
    case 'kebabcase':
      return toKebabCase(text)
    case 'sentencecase':
      return toSentenceCase(text)
    case 'alternatingcase':
      return toAlternatingCase(text)
    case 'inversecase':
      return toInverseCase(text)
    default:
      return text
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

    const body: TextCaseConversionRequest = await request.json()
    const { text, conversionType } = body

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    if (!conversionType) {
      return NextResponse.json(
        { error: 'Conversion type is required' },
        { status: 400 }
      )
    }

    const convertedText = convertTextCase(text, conversionType)
    const statistics = getTextStatistics(text)
    const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length

    const response: TextCaseConversionResponse = {
      originalText: text,
      convertedText,
      conversionType,
      characterCount: text.length,
      wordCount,
      statistics
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error converting text case:', error)
    return NextResponse.json(
      { error: 'Failed to convert text case' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return available conversion types
  return NextResponse.json({
    conversionTypes: [
      { value: 'uppercase', label: 'UPPERCASE', description: 'Convert all letters to uppercase' },
      { value: 'lowercase', label: 'lowercase', description: 'Convert all letters to lowercase' },
      { value: 'titlecase', label: 'Title Case', description: 'Capitalize The First Letter Of Each Word' },
      { value: 'camelcase', label: 'camelCase', description: 'ConvertToCamelCaseFormat' },
      { value: 'snakecase', label: 'snake_case', description: 'Convert_to_snake_case_format' },
      { value: 'kebabcase', label: 'kebab-case', description: 'Convert-to-kebab-case-format' },
      { value: 'sentencecase', label: 'Sentence case', description: 'Capitalize the first letter of each sentence' },
      { value: 'alternatingcase', label: 'AlTeRnAtInG cAsE', description: 'Convert to alternating upper and lower case' },
      { value: 'inversecase', label: 'InVeRsE CaSe', description: 'Inverse the case of each letter' }
    ],
    examples: {
      input: 'Hello World! This is a TEST.',
      outputs: {
        uppercase: 'HELLO WORLD! THIS IS A TEST.',
        lowercase: 'hello world! this is a test.',
        titlecase: 'Hello World! This Is A Test.',
        camelcase: 'helloWorld!ThisIsATest.',
        snakecase: 'hello_world!_this_is_a_test.',
        kebabcase: 'hello-world!-this-is-a-test.',
        sentencecase: 'Hello world! This is a test.',
        alternatingcase: 'HeLlO wOrLd! ThIs iS a tEsT.',
        inversecase: 'hELLO wORLD! tHIS IS A test.'
      }
    }
  })
}