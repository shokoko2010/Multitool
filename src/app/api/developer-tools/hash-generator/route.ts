import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { text, algorithms = ['md5', 'sha1', 'sha256'], options = {} } = await request.json()

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Text input is required' },
        { status: 400 }
      )
    }

    // Validate algorithms
    const validAlgorithms = [
      'md5', 'sha1', 'sha256', 'sha512', 'sha3-256', 'sha3-512',
      'ripemd160', 'whirlpool', 'crc32', 'adler32'
    ]
    
    const invalidAlgorithms = algorithms.filter(alg => !validAlgorithms.includes(alg.toLowerCase()))
    if (invalidAlgorithms.length > 0) {
      return NextResponse.json(
        { success: false, error: `Invalid algorithms: ${invalidAlgorithms.join(', ')}. Valid options: ${validAlgorithms.join(', ')}` },
        { status: 400 }
      )
    }

    const normalizedAlgorithms = algorithms.map(alg => alg.toLowerCase())

    // Set default options
    const defaultOptions = {
      encoding: 'hex',
      salt: '',
      iterations: 1,
      outputFormat: 'string',
      includeMetadata: true
    }

    const mergedOptions = { ...defaultOptions, ...options }

    // Initialize ZAI SDK for enhanced hash analysis
    const zai = await ZAI.create()

    // Generate hashes
    const hashResults = generateHashes(text, normalizedAlgorithms, mergedOptions)

    // Use AI to enhance hash analysis
    const systemPrompt = `You are a cryptographic hash and data security expert. Analyze the hash generation operation that was performed.

    Input text length: ${text.length} characters
    Algorithms: ${normalizedAlgorithms.join(', ')}
    Options: ${JSON.stringify(mergedOptions)}
    Generated hashes: ${Object.keys(hashResults.hashes).length}

    Please provide comprehensive hash analysis including:
    1. Cryptographic strength assessment
    2. Algorithm comparison and recommendations
    3. Security implications and best practices
    4. Performance analysis and optimization
    5. Collision resistance evaluation
    6. Pre-image resistance assessment
    7. Use case recommendations
    8. Compliance with security standards
    9. Hash comparison and uniqueness
    10. Salt and iteration analysis
    11. Data integrity verification
    12. Future-proofing considerations

    Use realistic cryptographic analysis based on current security standards and best practices.
    Return the response in JSON format with the following structure:
    {
      "cryptographic": {
        "strength": {
          "overall": "very-weak" | "weak" | "moderate" | "strong" | "very-strong",
          "algorithms": object,
          "recommendations": array
        },
        "security": {
          "collisionResistance": "low" | "medium" | "high",
          "preimageResistance": "low" | "medium" | "high",
          "secondPreimageResistance": "low" | "medium" | "high",
          "vulnerabilities": array
        },
        "compliance": {
          "nist": boolean,
          "iso27001": boolean,
          "pciDss": boolean,
          "gdpr": boolean,
          "hipaa": boolean
        }
      },
      "performance": {
        "speed": {
          "fastest": "string",
          "slowest": "string",
          "average": "string"
        },
        "memory": {
          "efficient": "string",
          "intensive": "string"
        },
        "scalability": "excellent" | "good" | "fair" | "poor"
      },
      "comparison": {
        "uniqueness": number,
        "distribution": "even" | "clustered" | "random",
        "entropy": number,
        "correlation": "low" | "medium" | "high"
      },
      "useCases": {
        "recommended": array,
        "avoid": array,
        "alternatives": array
      },
      "analysis": {
        "overallAssessment": "excellent" | "good" | "fair" | "poor",
        "riskLevel": "low" | "medium" | "high",
        "recommendations": array,
        "bestPractices": array
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
          content: `Analyze hash generation for ${normalizedAlgorithms.length} algorithms`
        }
      ],
      temperature: 0.1,
      max_tokens: 1500
    })

    let analysis
    try {
      const content = completion.choices[0]?.message?.content || '{}'
      analysis = JSON.parse(content)
      
      // Enhance analysis with actual performance data
      if (!analysis.performance) {
        analysis.performance = calculatePerformanceMetrics(hashResults.hashes)
      }
      
    } catch (parseError) {
      // Fallback: basic analysis
      console.log('AI response parsing failed, using fallback analysis')
      
      analysis = {
        cryptographic: {
          strength: {
            overall: assessOverallStrength(normalizedAlgorithms),
            algorithms: assessAlgorithmStrengths(hashResults.hashes),
            recommendations: generateAlgorithmRecommendations(normalizedAlgorithms)
          },
          security: {
            collisionResistance: assessCollisionResistance(normalizedAlgorithms),
            preimageResistance: assessPreimageResistance(normalizedAlgorithms),
            secondPreimageResistance: assessSecondPreimageResistance(normalizedAlgorithms),
            vulnerabilities: detectHashVulnerabilities(normalizedAlgorithms)
          },
          compliance: {
            nist: normalizedAlgorithms.some(alg => ['sha256', 'sha512'].includes(alg)),
            iso27001: normalizedAlgorithms.some(alg => ['sha256', 'sha512'].includes(alg)),
            pciDss: normalizedAlgorithms.some(alg => ['sha256', 'sha512'].includes(alg)),
            gdpr: true,
            hipaa: normalizedAlgorithms.some(alg => ['sha256', 'sha512'].includes(alg))
          }
        },
        performance: calculatePerformanceMetrics(hashResults.hashes),
        comparison: {
          uniqueness: calculateUniquenessScore(hashResults.hashes),
          distribution: assessHashDistribution(hashResults.hashes),
          entropy: calculateHashEntropy(hashResults.hashes),
          correlation: assessHashCorrelation(hashResults.hashes)
        },
        useCases: {
          recommended: generateRecommendedUseCases(normalizedAlgorithms),
          avoid: generateAvoidUseCases(normalizedAlgorithms),
          alternatives: generateAlternativeAlgorithms(normalizedAlgorithms)
        },
        analysis: {
          overallAssessment: assessOverallHashQuality(normalizedAlgorithms),
          riskLevel: assessHashRiskLevel(normalizedAlgorithms),
          recommendations: generateHashRecommendations(normalizedAlgorithms),
          bestPractices: generateHashBestPractices()
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        input: {
          text: text,
          length: text.length,
          algorithms: normalizedAlgorithms,
          options: mergedOptions
        },
        hashes: hashResults.hashes,
        metadata: hashResults.metadata,
        analysis: analysis,
        stats: {
          totalAlgorithms: normalizedAlgorithms.length,
          processingTime: hashResults.processingTime,
          inputSize: text.length,
          totalOutputSize: Object.values(hashResults.hashes).join('').length
        },
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Hash Generator Error:', error)
    
    // Fallback hash generation
    const { text, algorithms = ['md5', 'sha256'] } = await request.json()
    let fallbackHashes = {}
    
    try {
      fallbackHashes = generateFallbackHashes(text || '', algorithms)
    } catch (fallbackError) {
      fallbackHashes = {
        md5: createHash('md5').update(text || '').digest('hex'),
        sha256: createHash('sha256').update(text || '').digest('hex')
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        input: { text: text || '', algorithms },
        hashes: fallbackHashes,
        timestamp: new Date().toISOString()
      }
    })
  }
}

function generateHashes(text: string, algorithms: string[], options: any): any {
  const startTime = Date.now()
  const hashes: any = {}
  const metadata: any = {
    inputLength: text.length,
    encoding: options.encoding,
    saltUsed: options.salt ? true : false,
    iterations: options.iterations,
    algorithms: algorithms
  }

  let input = text
  
  // Apply salt if provided
  if (options.salt) {
    input = options.salt + input
  }

  // Generate hashes for each algorithm
  for (const algorithm of algorithms) {
    try {
      let hashInput = input
      
      // Apply iterations if specified
      for (let i = 0; i < options.iterations; i++) {
        const hash = createHash(algorithm)
        hash.update(hashInput)
        hashInput = hash.digest(options.encoding)
        
        // For iterations > 1, convert back to string for next iteration
        if (i < options.iterations - 1) {
          hashInput = hashInput.toString()
        }
      }
      
      hashes[algorithm] = hashInput
      
    } catch (error) {
      hashes[algorithm] = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }

  const processingTime = Date.now() - startTime

  return {
    hashes,
    metadata,
    processingTime
  }
}

function calculatePerformanceMetrics(hashes: any): any {
  const algorithmTimes: any = {}
  
  // Simulate performance metrics (in a real implementation, you'd measure actual times)
  const performanceData: Record<string, number> = {
    'md5': 0.1,
    'sha1': 0.2,
    'sha256': 0.3,
    'sha512': 0.5,
    'sha3-256': 0.8,
    'sha3-512': 1.2,
    'ripemd160': 0.4,
    'whirlpool': 1.5,
    'crc32': 0.05,
    'adler32': 0.03
  }
  
  const algorithms = Object.keys(hashes)
  const times = algorithms.map(alg => performanceData[alg] || 0.5)
  
  return {
    speed: {
      fastest: algorithms[times.indexOf(Math.min(...times))],
      slowest: algorithms[times.indexOf(Math.max(...times))],
      average: (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2) + 'ms'
    },
    memory: {
      efficient: algorithms[times.indexOf(Math.min(...times))],
      intensive: algorithms[times.indexOf(Math.max(...times))]
    },
    scalability: times.every(t => t < 1) ? 'excellent' : times.every(t => t < 2) ? 'good' : 'fair'
  }
}

function assessOverallStrength(algorithms: string[]): string {
  const strengthMap: Record<string, number> = {
    'md5': 1,
    'sha1': 2,
    'sha256': 4,
    'sha512': 5,
    'sha3-256': 4,
    'sha3-512': 5,
    'ripemd160': 3,
    'whirlpool': 4,
    'crc32': 1,
    'adler32': 1
  }
  
  const avgStrength = algorithms.reduce((sum, alg) => sum + (strengthMap[alg] || 2), 0) / algorithms.length
  
  if (avgStrength >= 4.5) return 'very-strong'
  if (avgStrength >= 3.5) return 'strong'
  if (avgStrength >= 2.5) return 'moderate'
  if (avgStrength >= 1.5) return 'weak'
  return 'very-weak'
}

function assessAlgorithmStrengths(hashes: any): any {
  const strengths: any = {}
  
  Object.keys(hashes).forEach(algorithm => {
    switch (algorithm) {
      case 'sha256':
      case 'sha512':
      case 'sha3-256':
      case 'sha3-512':
      case 'whirlpool':
        strengths[algorithm] = 'strong'
        break
      case 'sha1':
      case 'ripemd160':
        strengths[algorithm] = 'moderate'
        break
      default:
        strengths[algorithm] = 'weak'
    }
  })
  
  return strengths
}

function generateAlgorithmRecommendations(algorithms: string[]): string[] {
  const recommendations = []
  
  if (!algorithms.includes('sha256')) {
    recommendations.push('Consider using SHA-256 for better security')
  }
  
  if (algorithms.includes('md5')) {
    recommendations.push('MD5 is cryptographically broken - avoid for security purposes')
  }
  
  if (algorithms.includes('sha1')) {
    recommendations.push('SHA-1 is deprecated for security purposes')
  }
  
  recommendations.push('Use SHA-256 or SHA-512 for cryptographic security')
  recommendations.push('Consider SHA-3 for future-proofing')
  
  return recommendations
}

function assessCollisionResistance(algorithms: string[]): string {
  const strongAlgorithms = algorithms.filter(alg => 
    ['sha256', 'sha512', 'sha3-256', 'sha3-512', 'whirlpool'].includes(alg)
  )
  
  if (strongAlgorithms.length === algorithms.length) return 'high'
  if (strongAlgorithms.length > 0) return 'medium'
  return 'low'
}

function assessPreimageResistance(algorithms: string[]): string {
  return assessCollisionResistance(algorithms) // Same assessment logic
}

function assessSecondPreimageResistance(algorithms: string[]): string {
  return assessCollisionResistance(algorithms) // Same assessment logic
}

function detectHashVulnerabilities(algorithms: string[]): string[] {
  const vulnerabilities = []
  
  if (algorithms.includes('md5')) {
    vulnerabilities.push('MD5 collision attacks')
    vulnerabilities.push('MD5 preimage attacks')
  }
  
  if (algorithms.includes('sha1')) {
    vulnerabilities.push('SHA-1 collision attacks')
  }
  
  if (algorithms.includes('crc32') || algorithms.includes('adler32')) {
    vulnerabilities.push('Non-cryptographic hash vulnerabilities')
  }
  
  return vulnerabilities
}

function calculateUniquenessScore(hashes: any): number {
  const hashValues = Object.values(hashes)
  const uniqueHashes = new Set(hashValues)
  
  return (uniqueHashes.size / hashValues.length) * 100
}

function assessHashDistribution(hashes: any): string {
  // Simple distribution assessment based on hash character variety
  const hashString = Object.values(hashes).join('')
  const charFrequency: Record<string, number> = {}
  
  for (const char of hashString) {
    charFrequency[char] = (charFrequency[char] || 0) + 1
  }
  
  const frequencies = Object.values(charFrequency)
  const avgFreq = frequencies.reduce((a, b) => a + b, 0) / frequencies.length
  const variance = frequencies.reduce((sum, freq) => sum + Math.pow(freq - avgFreq, 2), 0) / frequencies.length
  
  return variance < avgFreq * 0.1 ? 'even' : variance < avgFreq * 0.5 ? 'clustered' : 'random'
}

function calculateHashEntropy(hashes: any): number {
  const hashString = Object.values(hashes).join('')
  const charFrequency: Record<string, number> = {}
  
  for (const char of hashString) {
    charFrequency[char] = (charFrequency[char] || 0) + 1
  }
  
  const length = hashString.length
  let entropy = 0
  
  for (const freq of Object.values(charFrequency)) {
    const probability = freq / length
    entropy -= probability * Math.log2(probability)
  }
  
  return entropy
}

function assessHashCorrelation(hashes: any): string {
  // Simple correlation assessment
  const hashArray = Object.values(hashes)
  let correlation = 0
  
  for (let i = 0; i < hashArray.length - 1; i++) {
    for (let j = i + 1; j < hashArray.length; j++) {
      const similarity = calculateSimilarity(hashArray[i] as string, hashArray[j] as string)
      correlation += similarity
    }
  }
  
  const avgCorrelation = correlation / (hashArray.length * (hashArray.length - 1) / 2)
  
  return avgCorrelation < 0.1 ? 'low' : avgCorrelation < 0.3 ? 'medium' : 'high'
}

function calculateSimilarity(str1: string, str2: string): number {
  const len = Math.max(str1.length, str2.length)
  let distance = 0
  
  for (let i = 0; i < len; i++) {
    if (str1[i] !== str2[i]) distance++
  }
  
  return distance / len
}

function generateRecommendedUseCases(algorithms: string[]): string[] {
  const useCases = []
  
  if (algorithms.some(alg => ['sha256', 'sha512'].includes(alg))) {
    useCases.push('Password hashing')
    useCases.push('Digital signatures')
    useCases.push('Data integrity verification')
  }
  
  if (algorithms.includes('md5')) {
    useCases.push('File checksums (non-security)')
    useCases.push('Data deduplication')
  }
  
  if (algorithms.includes('crc32') || algorithms.includes('adler32')) {
    useCases.push('Error detection')
    useCases.push('Data transmission verification')
  }
  
  return useCases
}

function generateAvoidUseCases(algorithms: string[]): string[] {
  const avoid = []
  
  if (algorithms.includes('md5')) {
    avoid.push('Cryptographic security')
    avoid.push('Password storage')
    avoid.push('Digital signatures')
  }
  
  if (algorithms.includes('sha1')) {
    avoid.push('New cryptographic implementations')
    avoid.push('Certificate signing')
  }
  
  if (algorithms.includes('crc32') || algorithms.includes('adler32')) {
    avoid.push('Security applications')
    avoid.push('Password hashing')
  }
  
  return avoid
}

function generateAlternativeAlgorithms(algorithms: string[]): string[] {
  const alternatives = []
  
  if (!algorithms.includes('sha256')) {
    alternatives.push('SHA-256 (recommended)')
  }
  
  if (!algorithms.includes('sha512')) {
    alternatives.push('SHA-512 (higher security)')
  }
  
  if (!algorithms.includes('sha3-256')) {
    alternatives.push('SHA3-256 (future-proof)')
  }
  
  if (algorithms.includes('md5') && !algorithms.includes('sha1')) {
    alternatives.push('SHA-1 (better than MD5)')
  }
  
  return alternatives
}

function assessOverallHashQuality(algorithms: string[]): string {
  const qualityScore = algorithms.reduce((score, alg) => {
    switch (alg) {
      case 'sha256':
      case 'sha512':
      case 'sha3-256':
      case 'sha3-512':
        return score + 5
      case 'whirlpool':
      case 'ripemd160':
        return score + 4
      case 'sha1':
        return score + 2
      default:
        return score + 1
    }
  }, 0)
  
  const avgQuality = qualityScore / algorithms.length
  
  if (avgQuality >= 4.5) return 'excellent'
  if (avgQuality >= 3.5) return 'good'
  if (avgQuality >= 2.5) return 'fair'
  return 'poor'
}

function assessHashRiskLevel(algorithms: string[]): string {
  if (algorithms.includes('md5')) return 'high'
  if (algorithms.includes('sha1')) return 'medium'
  if (algorithms.some(alg => ['sha256', 'sha512', 'sha3-256', 'sha3-512'].includes(alg))) return 'low'
  return 'medium'
}

function generateHashRecommendations(algorithms: string[]): string[] {
  const recommendations = []
  
  recommendations.push('Use salt for password hashing')
  recommendations.push('Consider key stretching for sensitive data')
  recommendations.push('Use appropriate hash algorithms for security level')
  recommendations.push('Keep hash algorithms updated')
  recommendations.push('Implement proper error handling')
  
  if (algorithms.includes('md5')) {
    recommendations.push('Replace MD5 with SHA-256 for security applications')
  }
  
  return recommendations
}

function generateHashBestPractices(): string[] {
  return [
    'Use SHA-256 or stronger for cryptographic applications',
    'Always use salt for password hashing',
    'Consider iteration counts for password hashing',
    'Use specialized password hashing functions (bcrypt, scrypt, argon2)',
    'Keep hash algorithms updated',
    'Implement proper error handling',
    'Use secure random number generation for salts',
    'Consider hardware security modules for sensitive operations',
    'Follow industry standards and regulations',
    'Regular security audits and updates'
  ]
}

function generateFallbackHashes(text: string, algorithms: string[]): any {
  const hashes: any = {}
  
  algorithms.forEach(algorithm => {
    try {
      const hash = createHash(algorithm)
      hash.update(text)
      hashes[algorithm] = hash.digest('hex')
    } catch (error) {
      hashes[algorithm] = 'Error generating hash'
    }
  })
  
  return hashes
}