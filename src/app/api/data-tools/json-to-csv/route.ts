import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jsonData, delimiter = ',', includeHeaders = true } = body;

    // Input validation
    if (!jsonData) {
      return NextResponse.json(
        { error: 'JSON data is required' },
        { status: 400 }
      );
    }

    let parsedData;
    try {
      parsedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    // Ensure data is an array of objects
    if (!Array.isArray(parsedData)) {
      return NextResponse.json(
        { error: 'JSON data must be an array of objects' },
        { status: 400 }
      );
    }

    if (parsedData.length === 0) {
      return NextResponse.json(
        { error: 'JSON data array cannot be empty' },
        { status: 400 }
      );
    }

    // Convert JSON to CSV
    const headers = Object.keys(parsedData[0]);
    const csvRows = [];

    // Add headers if requested
    if (includeHeaders) {
      csvRows.push(headers.join(delimiter));
    }

    // Add data rows
    for (const row of parsedData) {
      const values = headers.map(header => {
        const value = row[header];
        // Handle nested objects and arrays
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        // Escape quotes and wrap in quotes if contains delimiter or newline
        if (typeof value === 'string' && (value.includes(delimiter) || value.includes('\n') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(delimiter));
    }

    const csvData = csvRows.join('\n');

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a data analysis expert. Analyze the provided JSON to CSV conversion and provide insights about the data structure, potential issues, and recommendations.'
          },
          {
            role: 'user',
            content: `JSON to CSV conversion completed. Original data had ${parsedData.length} records with ${headers.length} fields: ${headers.join(', ')}. Provide analysis and recommendations.`
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
      csvData,
      metadata: {
        recordCount: parsedData.length,
        fieldCount: headers.length,
        headers,
        delimiter,
        includeHeaders
      },
      aiInsights
    });

  } catch (error) {
    console.error('JSON to CSV conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to convert JSON to CSV' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'JSON to CSV Converter API',
    usage: 'POST /api/data-tools/json-to-csv',
    parameters: {
      jsonData: 'JSON data (string or object) - required',
      delimiter: 'CSV delimiter (default: ",") - optional',
      includeHeaders: 'Include header row (default: true) - optional'
    },
    example: {
      jsonData: '[{"name":"John","age":30,"city":"New York"},{"name":"Jane","age":25,"city":"Los Angeles"}]',
      delimiter: ',',
      includeHeaders: true
    }
  });
}