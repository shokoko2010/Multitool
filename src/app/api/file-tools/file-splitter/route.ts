import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { 
      file, 
      splitMethod, 
      splitValue, 
      options = {} 
    } = await request.json()

    if (!file || !file.name || !file.content) {
      return NextResponse.json(
        { success: false, error: 'File with name and content is required' },
        { status: 400 }
      )
    }

    if (!splitMethod) {
      return NextResponse.json(
        { success: false, error: 'Split method is required' },
        { status: 400 }
      )
    }

    if (splitValue === undefined || splitValue === null) {
      return NextResponse.json(
        { success: false, error: 'Split value is required' },
        { status: 400 }
      )
    }

    // Validate split method
    const validMethods = ['lines', 'size', 'chunks', 'pattern']
    if (!validMethods.includes(splitMethod)) {
      return NextResponse.json(
        { success: false, error: `Invalid split method. Must be one of: ${validMethods.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate split value based on method
    if (splitMethod === 'lines' && (typeof splitValue !== 'number' || splitValue < 1)) {
      return NextResponse.json(
        { success: false, error: 'For lines method, split value must be a positive number' },
        { status: 400 }
      )
    }

    if (splitMethod === 'size' && (typeof splitValue !== 'number' || splitValue < 1024)) {
      return NextResponse.json(
        { success: false, error: 'For size method, split value must be at least 1024 bytes' },
        { status: 400 }
      )
    }

    if (splitMethod === 'chunks' && (typeof splitValue !== 'number' || splitValue < 1)) {
      return NextResponse.json(
        { success: false, error: 'For chunks method, split value must be a positive number' },
        { status: 400 }
      )
    }

    if (splitMethod === 'pattern' && (typeof splitValue !== 'string' || splitValue.length === 0)) {
      return NextResponse.json(
        { success: false, error: 'For pattern method, split value must be a non-empty string' },
        { status: 400 }
      )
    }

    // Validate options
    const validOptions = {
      includeHeaders: true,
      preserveLineNumbers: false,
      outputNaming: 'sequential', // sequential, original, custom
      customPrefix: '',
      includePartNumber: true,
      compressOutput: false,
      createIndex: false,
      overlapLines: 0,
      encoding: 'utf8'
    }

    const mergedOptions = { ...validOptions, ...options }

    // Initialize ZAI SDK for enhanced file splitting analysis
    const zai = await ZAI.create()

    // Process file splitting
    const splitResults = []
    let totalParts = 0
    let totalSize = 0
    let splitTime = 0

    try {
      const startTime = Date.now()

      // Split file based on method
      const splitResult = await splitFile(file, splitMethod, splitValue, mergedOptions)
      
      totalParts = splitResult.parts.length
      totalSize = splitResult.parts.reduce((sum, part) => sum + part.content.length, 0)
      splitTime = Date.now() - startTime

      // Prepare results
      for (let i = 0; i < splitResult.parts.length; i++) {
        const part = splitResult.parts[i]
        const partName = generatePartFilename(file.name, i + 1, totalParts, mergedOptions)

        splitResults.push({
          partName,
          partNumber: i + 1,
          totalParts: totalParts,
          content: part.content,
          size: part.content.length,
          startLine: part.startLine,
          endLine: part.endLine,
          startByte: part.startByte,
          endByte: part.endByte,
          status: 'success',
          error: null
        })
      }

      // Add index file if requested
      if (mergedOptions.createIndex) {
        const indexContent = generateIndexFile(file, splitResult.parts, mergedOptions)
        splitResults.push({
          partName: generateIndexFilename(file.name, mergedOptions),
          partNumber: 0,
          totalParts: totalParts,
          content: indexContent,
          size: indexContent.length,
          startLine: 0,
          endLine: 0,
          startByte: 0,
          endByte: 0,
          status: 'success',
          error: null,
          isIndex: true
        })
      }

    } catch (error) {
      splitResults.push({
        partName: 'error.txt',
        partNumber: 1,
        totalParts: 1,
        content: '',
        size: 0,
        startLine: 0,
        endLine: 0,
        startByte: 0,
        endByte: 0,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Use AI to enhance file splitting analysis
    const systemPrompt = `You are a file splitting and partitioning expert. Analyze the file splitting operation that was performed.

    File: ${file.name} (${file.content?.length || 0} bytes)
    Split method: ${splitMethod}
    Split value: ${splitValue}
    Options: ${JSON.stringify(mergedOptions)}

    Please provide comprehensive file splitting analysis including:
    1. Splitting method effectiveness
    2. Data integrity assessment
    3. Performance analysis
    4. Optimization recommendations
    5. Alternative splitting strategies
    6. File size distribution
    7. Memory usage analysis
    8. Best practices for file splitting
    9. Large file handling recommendations
    10. Reconstruction guidance

    Use realistic file splitting analysis based on common file partitioning patterns.
    Return the response in JSON format with the following structure:
    {
      "operation": {
        "originalFile": "string",
        "originalSize": number,
        "splitMethod": "lines" | "size" | "chunks" | "pattern",
        "splitValue": any,
        "totalParts": number,
        "splitTime": number,
        "complexity": "simple" | "moderate" | "complex"
      },
      "analysis": {
        "dataIntegrity": "excellent" | "good" | "fair" | "poor",
        "efficiency": "high" | "medium" | "low",
        "optimizationLevel": "optimal" | "suboptimal" | "needs_improvement",
        "balanceScore": number,
        "recommendations": array,
        "warnings": array
      },
      "distribution": {
        "sizeDistribution": "uniform" | "variable" | "uneven",
        "partSizes": array,
        "averageSize": number,
        "sizeVariance": number,
        "largestPart": number,
        "smallestPart": number
      },
      "performance": {
        "speed": "fast" | "medium" | "slow",
        "memoryUsage": "low" | "medium" | "high",
        "scalability": "excellent" | "good" | "fair" | "poor"
      },
      "methods": {
        "currentMethod": object,
        "alternativeMethods": array,
        "bestPractices": array
      },
      "reconstruction": {
        "ease": "easy" | "moderate" | "difficult",
        "toolsRequired": array,
        "steps": array,
        "verification": array
      },
      "summary": {
        "overallSuccess": "excellent" | "good" | "fair" | "poor",
        "nextSteps": array,
        "confidence": "low" | "medium" | "high"
      }
    }`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Analyze file splitting operation: ${file.name} using ${splitMethod} method with value ${splitValue}`
        }
      ],
      temperature: 0.1,
      max_tokens: 1500
    })

    let analysis
    try {
      const content = completion.choices[0]?.message?.content || '{}'
      analysis = JSON.parse(content)
      
      if (splitResults.length > 0 && splitResults[0].status === 'success') {
        analysis.operation = {
          ...analysis.operation,
          originalFile: file.name,
          originalSize: file.content?.length || 0,
          splitMethod: splitMethod,
          splitValue: splitValue,
          totalParts: totalParts,
          splitTime: splitTime,
          complexity: getSplitComplexity(file, splitMethod, splitValue)
        }
        
        // Calculate size distribution
        const partSizes = splitResults
          .filter(r => !r.isIndex)
          .map(r => r.size)
        
        analysis.distribution = {
          ...analysis.distribution,
          partSizes: partSizes,
          averageSize: partSizes.length > 0 ? partSizes.reduce((a, b) => a + b, 0) / partSizes.length : 0,
          largestPart: partSizes.length > 0 ? Math.max(...partSizes) : 0,
          smallestPart: partSizes.length > 0 ? Math.min(...partSizes) : 0
        }
      }
      
    } catch (parseError) {
      // Fallback: basic analysis
      console.log('AI response parsing failed, using fallback analysis')
      
      const success = splitResults.length > 0 && splitResults[0].status === 'success'
      const partSizes = splitResults
        .filter(r => !r.isIndex)
        .map(r => r.size)
      
      analysis = {
        operation: {
          originalFile: file.name,
          originalSize: file.content?.length || 0,
          splitMethod: splitMethod,
          splitValue: splitValue,
          totalParts: totalParts,
          splitTime: splitTime,
          complexity: getSplitComplexity(file, splitMethod, splitValue)
        },
        analysis: {
          dataIntegrity: success ? 'excellent' : 'poor',
          efficiency: 'high',
          optimizationLevel: 'optimal',
          balanceScore: calculateBalanceScore(partSizes),
          recommendations: [
            'Verify all split parts',
            'Test file reconstruction',
            'Consider compression for large parts'
          ],
          warnings: success ? [] : ['File splitting failed']
        },
        distribution: {
          sizeDistribution: partSizes.length > 0 ? 
            (Math.max(...partSizes) - Math.min(...partSizes)) / Math.max(...partSizes) < 0.1 ? 'uniform' : 'variable' : 'uniform',
          partSizes: partSizes,
          averageSize: partSizes.length > 0 ? partSizes.reduce((a, b) => a + b, 0) / partSizes.length : 0,
          sizeVariance: partSizes.length > 0 ? calculateVariance(partSizes) : 0,
          largestPart: partSizes.length > 0 ? Math.max(...partSizes) : 0,
          smallestPart: partSizes.length > 0 ? Math.min(...partSizes) : 0
        },
        performance: {
          speed: splitTime < 1000 ? 'fast' : splitTime < 5000 ? 'medium' : 'slow',
          memoryUsage: (file.content?.length || 0) < 1024 * 1024 ? 'low' : (file.content?.length || 0) < 10 * 1024 * 1024 ? 'medium' : 'high',
          scalability: totalParts < 10 ? 'excellent' : totalParts < 100 ? 'good' : 'fair'
        },
        methods: {
          currentMethod: {
            name: splitMethod,
            description: `${splitMethod} splitting method`,
            effectiveness: success ? 'high' : 'low'
          },
          alternativeMethods: [
            { name: 'lines', description: 'Split by line count' },
            { name: 'size', description: 'Split by file size' },
            { name: 'chunks', description: 'Split by number of chunks' },
            { name: 'pattern', description: 'Split by pattern matching' }
          ],
          bestPractices: [
            'Choose appropriate split method for file type',
            'Consider reconstruction requirements',
            'Test with sample data first'
          ]
        },
        reconstruction: {
          ease: 'easy',
          toolsRequired: ['File joiner tool', 'Original split information'],
          steps: [
            'Collect all split parts',
            'Order parts correctly',
            'Use join tool to reconstruct',
            'Verify file integrity'
          ],
          verification: [
            'Check file size matches original',
            'Verify content integrity',
            'Test file functionality'
          ]
        },
        summary: {
          overallSuccess: success ? 'excellent' : 'poor',
          nextSteps: success ? [
            'Verify all split parts are complete',
            'Test reconstruction process',
            'Document splitting parameters'
          ] : [
            'Check file content and format',
            'Verify split parameters',
            'Try alternative split method'
          ],
          confidence: success ? 'high' : 'low'
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        results: splitResults,
        summary: {
          originalFile: file.name,
          originalSize: file.content?.length || 0,
          totalParts: totalParts,
          totalSize: totalSize,
          splitTime: splitTime,
          splitMethod: splitMethod,
          splitValue: splitValue,
          success: splitResults.length > 0 && splitResults[0].status === 'success'
        },
        options: mergedOptions,
        analysis: analysis,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('File Splitter Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to perform file splitting',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function splitFile(file: any, method: string, value: any, options: any): Promise<{ parts: any[] }> {
  const content = file.content
  const parts: any[] = []

  switch (method) {
    case 'lines':
      return splitByLines(content, value, options)
    
    case 'size':
      return splitBySize(content, value, options)
    
    case 'chunks':
      return splitByChunks(content, value, options)
    
    case 'pattern':
      return splitByPattern(content, value, options)
    
    default:
      throw new Error(`Unknown split method: ${method}`)
  }
}

function splitByLines(content: string, linesPerPart: number, options: any): { parts: any[] } {
  const lines = content.split('\\n')
  const parts: any[] = []
  
  for (let i = 0; i < lines.length; i += linesPerPart) {
    const partLines = lines.slice(i, i + linesPerPart)
    const partContent = partLines.join('\\n')
    
    // Add overlap if specified
    let overlapContent = ''
    if (options.overlapLines > 0 && i > 0) {
      const overlapLines = lines.slice(Math.max(0, i - options.overlapLines), i)
      overlapContent = overlapLines.join('\\n') + '\\n'
    }
    
    parts.push({
      content: overlapContent + partContent,
      startLine: i + 1,
      endLine: Math.min(i + linesPerPart, lines.length),
      startByte: content.indexOf(partLines[0] || ''),
      endByte: content.lastIndexOf(partLines[partLines.length - 1] || '') + (partLines[partLines.length - 1] || '').length
    })
  }
  
  return { parts }
}

function splitBySize(content: string, bytesPerPart: number, options: any): { parts: any[] } {
  const parts: any[] = []
  let currentPos = 0
  
  while (currentPos < content.length) {
    let endPos = Math.min(currentPos + bytesPerPart, content.length)
    
    // Try to split at line boundary if possible
    if (endPos < content.length) {
      const nextNewline = content.indexOf('\\n', endPos - 100)
      if (nextNewline > currentPos && nextNewline - endPos < 100) {
        endPos = nextNewline + 1
      }
    }
    
    const partContent = content.substring(currentPos, endPos)
    const lines = partContent.split('\\n')
    
    parts.push({
      content: partContent,
      startLine: content.substring(0, currentPos).split('\\n').length + 1,
      endLine: content.substring(0, endPos).split('\\n').length,
      startByte: currentPos,
      endByte: endPos
    })
    
    currentPos = endPos
  }
  
  return { parts }
}

function splitByChunks(content: string, numberOfChunks: number, options: any): { parts: any[] } {
  const totalLength = content.length
  const chunkSize = Math.ceil(totalLength / numberOfChunks)
  const parts: any[] = []
  
  for (let i = 0; i < numberOfChunks; i++) {
    const startPos = i * chunkSize
    let endPos = Math.min((i + 1) * chunkSize, totalLength)
    
    // Try to split at line boundary
    if (endPos < totalLength) {
      const nextNewline = content.indexOf('\\n', endPos - 100)
      if (nextNewline > startPos && nextNewline - endPos < 100) {
        endPos = nextNewline + 1
      }
    }
    
    const partContent = content.substring(startPos, endPos)
    const lines = partContent.split('\\n')
    
    parts.push({
      content: partContent,
      startLine: content.substring(0, startPos).split('\\n').length + 1,
      endLine: content.substring(0, endPos).split('\\n').length,
      startByte: startPos,
      endByte: endPos
    })
  }
  
  return { parts }
}

function splitByPattern(content: string, pattern: string, options: any): { parts: any[] } {
  const parts: any[] = []
  const regex = new RegExp(pattern, 'g')
  let match
  let lastPos = 0
  let partNumber = 1
  
  while ((match = regex.exec(content)) !== null) {
    const partContent = content.substring(lastPos, match.index)
    
    if (partContent.length > 0 || parts.length === 0) {
      const lines = partContent.split('\\n')
      
      parts.push({
        content: partContent,
        startLine: content.substring(0, lastPos).split('\\n').length + 1,
        endLine: content.substring(0, match.index).split('\\n').length,
        startByte: lastPos,
        endByte: match.index
      })
    }
    
    lastPos = match.index + match[0].length
    partNumber++
  }
  
  // Add the remaining content
  if (lastPos < content.length) {
    const partContent = content.substring(lastPos)
    const lines = partContent.split('\\n')
    
    parts.push({
      content: partContent,
      startLine: content.substring(0, lastPos).split('\\n').length + 1,
      endLine: content.split('\\n').length,
      startByte: lastPos,
      endByte: content.length
    })
  }
  
  return { parts }
}

function generatePartFilename(originalName: string, partNumber: number, totalParts: number, options: any): string {
  const nameWithoutExt = originalName.includes('.') ? 
    originalName.substring(0, originalName.lastIndexOf('.')) : originalName
  const extension = originalName.includes('.') ? 
    originalName.substring(originalName.lastIndexOf('.')) : ''
  
  let prefix = options.customPrefix || nameWithoutExt
  
  if (options.includePartNumber) {
    const padding = Math.max(2, totalParts.toString().length)
    const partStr = partNumber.toString().padStart(padding, '0')
    prefix += `_part${partStr}`
  }
  
  return `${prefix}${extension}`
}

function generateIndexFilename(originalName: string, options: any): string {
  const nameWithoutExt = originalName.includes('.') ? 
    originalName.substring(0, originalName.lastIndexOf('.')) : originalName
  
  return `${nameWithoutExt}_index.txt`
}

function generateIndexFile(file: any, parts: any[], options: any): string {
  let index = `File Split Index\\n`
  index += `================\\n\\n`
  index += `Original File: ${file.name}\\n`
  index += `Original Size: ${file.content.length} bytes\\n`
  index += `Split Date: ${new Date().toISOString()}\\n`
  index += `Total Parts: ${parts.length}\\n\\n`
  index += `Parts:\\n`
  index += `------\\n`
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const partName = generatePartFilename(file.name, i + 1, parts.length, options)
    index += `${i + 1}. ${partName} (${part.content.length} bytes, Lines ${part.startLine}-${part.endLine})\\n`
  }
  
  index += `\\nReconstruction:\\n`
  index += `---------------\\n`
  index += `1. Concatenate all parts in order\\n`
  index += `2. Verify file size matches original\\n`
  index += `3. Check content integrity\\n`
  
  return index
}

function getSplitComplexity(file: any, method: string, value: any): string {
  const size = file.content?.length || 0
  
  if (size > 100 * 1024 * 1024) return 'complex' // > 100MB
  if (size > 10 * 1024 * 1024) return 'moderate' // > 10MB
  if (method === 'pattern') return 'moderate'
  return 'simple'
}

function calculateBalanceScore(sizes: number[]): number {
  if (sizes.length === 0) return 0
  
  const avg = sizes.reduce((a, b) => a + b, 0) / sizes.length
  const variance = sizes.reduce((sum, size) => sum + Math.pow(size - avg, 2), 0) / sizes.length
  const stdDev = Math.sqrt(variance)
  
  // Lower standard deviation = better balance
  return Math.max(0, 100 - (stdDev / avg) * 100)
}

function calculateVariance(sizes: number[]): number {
  if (sizes.length === 0) return 0
  
  const avg = sizes.reduce((a, b) => a + b, 0) / sizes.length
  return sizes.reduce((sum, size) => sum + Math.pow(size - avg, 2), 0) / sizes.length
}