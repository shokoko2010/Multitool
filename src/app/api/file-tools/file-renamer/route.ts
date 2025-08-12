import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { 
      files, 
      pattern, 
      replacement = '', 
      options = {} 
    } = await request.json()

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Files array is required' },
        { status: 400 }
      )
    }

    if (!pattern) {
      return NextResponse.json(
        { success: false, error: 'Pattern is required' },
        { status: 400 }
      )
    }

    // Validate files array
    for (const file of files) {
      if (!file.name || typeof file.name !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Each file must have a valid name' },
          { status: 400 }
        )
      }
    }

    // Validate options
    const validOptions = {
      caseSensitive: false,
      useRegex: false,
      sequential: false,
      prefix: '',
      suffix: '',
      preserveExtension: true,
      numberFormat: '{n}',
      startNumber: 1
    }

    const mergedOptions = { ...validOptions, ...options }

    // Initialize ZAI SDK for enhanced file renaming analysis
    const zai = await ZAI.create()

    // Process file renaming
    const renameResults = []
    let totalFiles = files.length
    let successfulRenames = 0
    let failedRenames = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const originalName = file.name
      let newName = originalName

      try {
        // Apply renaming rules
        if (mergedOptions.sequential) {
          // Sequential numbering
          const number = mergedOptions.startNumber + i
          const numberStr = mergedOptions.numberFormat.replace('{n}', number.toString())
          
          if (mergedOptions.preserveExtension) {
            const ext = path.extname(originalName)
            const nameWithoutExt = path.basename(originalName, ext)
            newName = `${mergedOptions.prefix}${nameWithoutExt}${numberStr}${mergedOptions.suffix}${ext}`
          } else {
            newName = `${mergedOptions.prefix}${originalName}${numberStr}${mergedOptions.suffix}`
          }
        } else {
          // Pattern-based renaming
          let searchPattern = pattern
          let replaceValue = replacement

          if (mergedOptions.useRegex) {
            // Regex replacement
            const flags = mergedOptions.caseSensitive ? 'g' : 'gi'
            const regex = new RegExp(searchPattern, flags)
            newName = originalName.replace(regex, replaceValue)
          } else {
            // Simple string replacement
            if (!mergedOptions.caseSensitive) {
              searchPattern = new RegExp(searchPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
              newName = originalName.replace(searchPattern, replaceValue)
            } else {
              newName = originalName.split(searchPattern).join(replaceValue)
            }
          }

          // Add prefix and suffix
          if (mergedOptions.preserveExtension) {
            const ext = path.extname(originalName)
            const nameWithoutExt = path.basename(originalName, ext)
            newName = `${mergedOptions.prefix}${nameWithoutExt}${mergedOptions.suffix}${ext}`
          } else {
            newName = `${mergedOptions.prefix}${newName}${mergedOptions.suffix}`
          }
        }

        // Validate new filename
        if (newName !== originalName) {
          const isValid = validateFilename(newName)
          if (!isValid) {
            throw new Error('Invalid filename generated')
          }
        }

        renameResults.push({
          originalName,
          newName: newName !== originalName ? newName : originalName,
          changed: newName !== originalName,
          index: i + 1,
          status: 'success',
          error: null
        })

        if (newName !== originalName) {
          successfulRenames++
        }

      } catch (error) {
        renameResults.push({
          originalName,
          newName: originalName,
          changed: false,
          index: i + 1,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        failedRenames++
      }
    }

    // Use AI to enhance file renaming analysis
    const systemPrompt = `You are a file management and batch renaming expert. Analyze the file renaming operation that was performed.

    Original files: ${JSON.stringify(files.map(f => f.name))}
    Pattern: ${pattern}
    Replacement: ${replacement}
    Options: ${JSON.stringify(mergedOptions)}

    Please provide comprehensive file renaming analysis including:
    1. Pattern analysis and effectiveness
    2. Naming convention assessment
    3. File organization recommendations
    4. Potential conflicts or issues
    5. Best practices for file naming
    6. Alternative naming suggestions
    7. File type categorization
    8. Sorting and organization tips
    9. Bulk operation optimization
    10. Error prevention recommendations

    Use realistic file management analysis based on common file organization patterns.
    Return the response in JSON format with the following structure:
    {
      "operation": {
        "totalFiles": number,
        "successfulRenames": number,
        "failedRenames": number,
        "patternType": "regex" | "string" | "sequential",
        "complexity": "simple" | "moderate" | "complex"
      },
      "analysis": {
        "patternEffectiveness": "excellent" | "good" | "fair" | "poor",
        "namingConvention": "consistent" | "inconsistent" | "improved",
        "organizationScore": number,
        "conflictsDetected": boolean,
        "issues": array,
        "recommendations": array
      },
      "suggestions": {
        "alternativePatterns": array,
        "betterNamingConventions": array,
        "organizationStrategies": array,
        "automationTips": array
      },
      "fileTypes": {
        "categories": object,
        "extensions": array,
        "recommendations": array
      },
      "bestPractices": {
        "naming": array,
        "organization": array,
        "maintenance": array
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
          content: `Analyze file renaming operation with ${files.length} files using pattern: ${pattern}`
        }
      ],
      temperature: 0.1,
      max_tokens: 1500
    })

    let analysis
    try {
      const content = completion.choices[0]?.message?.content || '{}'
      analysis = JSON.parse(content)
      
      analysis.operation = {
        ...analysis.operation,
        totalFiles,
        successfulRenames,
        failedRenames,
        patternType: mergedOptions.useRegex ? 'regex' : mergedOptions.sequential ? 'sequential' : 'string',
        complexity: mergedOptions.sequential || mergedOptions.useRegex ? 'moderate' : 'simple'
      }
      
    } catch (parseError) {
      // Fallback: basic analysis
      console.log('AI response parsing failed, using fallback analysis')
      
      const successRate = (successfulRenames / totalFiles) * 100
      let overallSuccess = 'excellent'
      if (successRate < 50) overallSuccess = 'poor'
      else if (successRate < 80) overallSuccess = 'fair'
      else if (successRate < 95) overallSuccess = 'good'
      
      analysis = {
        operation: {
          totalFiles,
          successfulRenames,
          failedRenames,
          patternType: mergedOptions.useRegex ? 'regex' : mergedOptions.sequential ? 'sequential' : 'string',
          complexity: mergedOptions.sequential || mergedOptions.useRegex ? 'moderate' : 'simple'
        },
        analysis: {
          patternEffectiveness: successRate > 90 ? 'excellent' : successRate > 70 ? 'good' : 'fair',
          namingConvention: 'consistent',
          organizationScore: Math.floor(successRate),
          conflictsDetected: false,
          issues: failedRenames > 0 ? ['Some files could not be renamed'] : [],
          recommendations: [
            'Review failed renames for special characters',
            'Consider using regex for complex patterns',
            'Test renaming on a small batch first'
          ]
        },
        suggestions: {
          alternativePatterns: [],
          betterNamingConventions: [
            'Use consistent date formats',
            'Include file type identifiers',
            'Avoid special characters'
          ],
          organizationStrategies: [
            'Group by date or project',
            'Use hierarchical naming',
            'Implement version control'
          ],
          automationTips: [
            'Create renaming templates',
            'Use batch processing tools',
            'Maintain naming documentation'
          ]
        },
        fileTypes: {
          categories: {},
          extensions: [],
          recommendations: [
            'Organize by file type',
            'Use consistent extensions',
            'Consider metadata in naming'
          ]
        },
        bestPractices: {
          naming: [
            'Keep names descriptive but concise',
            'Use underscores instead of spaces',
            'Avoid special characters'
          ],
          organization: [
            'Group related files together',
            'Use consistent naming patterns',
            'Implement version numbering'
          ],
          maintenance: [
            'Regular cleanup of old files',
            'Update naming conventions as needed',
            'Document naming rules'
          ]
        },
        summary: {
          overallSuccess: overallSuccess,
          nextSteps: [
            failedRenames > 0 ? 'Investigate failed renames' : 'Proceed with file organization',
            'Consider implementing additional naming rules',
            'Document the naming convention used'
          ],
          confidence: 'medium'
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        results: renameResults,
        summary: {
          totalFiles,
          successfulRenames,
          failedRenames,
          successRate: Math.round((successfulRenames / totalFiles) * 100)
        },
        options: mergedOptions,
        analysis: analysis,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('File Renamer Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to perform file renaming',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function validateFilename(filename: string): boolean {
  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*]/
  if (invalidChars.test(filename)) {
    return false
  }

  // Check for reserved names (Windows)
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ]

  const baseName = path.basename(filename, path.extname(filename)).toUpperCase()
  if (reservedNames.includes(baseName)) {
    return false
  }

  // Check length (most filesystems support 255 characters)
  if (filename.length > 255) {
    return false
  }

  // Check for empty filename
  if (filename.trim().length === 0) {
    return false
  }

  return true
}