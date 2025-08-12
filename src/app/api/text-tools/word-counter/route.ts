import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { text, options = {} } = await request.json()

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Text input is required' },
        { status: 400 }
      )
    }

    // Set default options
    const defaultOptions = {
      includeSpaces: false,
      includePunctuation: false,
      countLines: true,
      countParagraphs: true,
      countSentences: true,
      countCharacters: true,
      countWords: true,
      showFrequency: true,
      showReadability: true,
      showKeywords: true,
      language: 'auto'
    }

    const mergedOptions = { ...defaultOptions, ...options }

    // Initialize ZAI SDK for enhanced text analysis
    const zai = await ZAI.create()

    // Perform text analysis
    const analysisResults = performTextAnalysis(text, mergedOptions)

    // Use AI to enhance text analysis
    const systemPrompt = `You are a text analysis and linguistics expert. Analyze the text that was processed for word counting and statistics.

    Text length: ${text.length} characters
    Analysis options: ${JSON.stringify(mergedOptions)}
    Basic statistics: ${JSON.stringify(analysisResults.basicStats)}

    Please provide comprehensive text analysis including:
    1. Linguistic complexity assessment
    2. Readability scoring and analysis
    3. Writing style evaluation
    4. Content structure analysis
    5. Vocabulary diversity assessment
    6. Sentence structure analysis
    7. Paragraph coherence evaluation
    8. Language detection and characteristics
    9. Content type classification
    10. Writing quality assessment
    11. Audience appropriateness
    12. Improvement recommendations

    Use realistic text analysis based on linguistic principles and readability metrics.
    Return the response in JSON format with the following structure:
    {
      "linguistic": {
        "complexity": "simple" | "moderate" | "complex",
        "vocabularyDiversity": number,
        "sentenceVariety": "low" | "medium" | "high",
        "readabilityScore": number,
        "gradeLevel": number
      },
      "style": {
        "formality": "informal" | "neutral" | "formal",
        "tone": "casual" | "professional" | "academic" | "technical",
        "clarity": "excellent" | "good" | "fair" | "poor",
        "conciseness": "excellent" | "good" | "fair" | "poor"
      },
      "structure": {
        "paragraphCoherence": "high" | "medium" | "low",
        "logicalFlow": "excellent" | "good" | "fair" | "poor",
        "organization": "well-structured" | "moderate" | "poorly-structured"
      },
      "content": {
        "type": "narrative" | "expository" | "persuasive" | "descriptive" | "technical",
        "purpose": "inform" | "persuade" | "entertain" | "instruct",
        "audience": "general" | "specialized" | "academic" | "professional",
        "quality": "excellent" | "good" | "fair" | "poor"
      },
      "language": {
        "detected": "string",
        "confidence": number,
        "characteristics": array,
        "dialect": "string"
      },
      "readability": {
        "fleschScore": number,
        "fleschKincaid": number,
        "gunningFog": number,
        "smogIndex": number,
        "automatedReadability": number
      },
      "vocabulary": {
        "uniqueWords": number,
        "totalWords": number,
        "diversityRatio": number,
        "complexWords": number,
        "simpleWords": number,
        "averageWordLength": number
      },
      "sentences": {
        "averageLength": number,
        "complexity": "simple" | "compound" | "complex",
        "variety": "low" | "medium" | "high",
        "clarity": "excellent" | "good" | "fair" | "poor"
      },
      "analysis": {
        "overallAssessment": "excellent" | "good" | "fair" | "poor",
        "strengths": array,
        "weaknesses": array,
        "recommendations": array,
        "nextSteps": array
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
          content: `Analyze text for comprehensive linguistic and readability analysis`
        }
      ],
      temperature: 0.1,
      max_tokens: 1600
    })

    let enhancedAnalysis
    try {
      const content = completion.choices[0]?.message?.content || '{}'
      enhancedAnalysis = JSON.parse(content)
      
      // Enhance with actual calculated metrics
      if (!enhancedAnalysis.readability) {
        enhancedAnalysis.readability = calculateReadabilityScores(text, analysisResults.basicStats)
      }
      
      if (!enhancedAnalysis.vocabulary) {
        enhancedAnalysis.vocabulary = calculateVocabularyStats(text, analysisResults.wordFrequency)
      }
      
    } catch (parseError) {
      // Fallback: basic analysis
      console.log('AI response parsing failed, using fallback analysis')
      
      enhancedAnalysis = {
        linguistic: {
          complexity: assessTextComplexity(text, analysisResults.basicStats),
          vocabularyDiversity: calculateVocabularyDiversity(analysisResults.wordFrequency),
          sentenceVariety: assessSentenceVariety(text),
          readabilityScore: calculateReadabilityScore(text),
          gradeLevel: calculateGradeLevel(text)
        },
        style: {
          formality: assessFormality(text),
          tone: assessTone(text),
          clarity: assessClarity(text),
          conciseness: assessConciseness(text)
        },
        structure: {
          paragraphCoherence: assessParagraphCoherence(text),
          logicalFlow: assessLogicalFlow(text),
          organization: assessOrganization(text)
        },
        content: {
          type: detectContentType(text),
          purpose: detectContentPurpose(text),
          audience: detectAudience(text),
          quality: assessContentQuality(text)
        },
        language: {
          detected: detectLanguage(text),
          confidence: 0.8,
          characteristics: detectLanguageCharacteristics(text),
          dialect: detectDialect(text)
        },
        readability: calculateReadabilityScores(text, analysisResults.basicStats),
        vocabulary: calculateVocabularyStats(text, analysisResults.wordFrequency),
        sentences: {
          averageLength: analysisResults.basicStats.averageSentenceLength,
          complexity: assessSentenceComplexity(text),
          variety: assessSentenceVariety(text),
          clarity: assessClarity(text)
        },
        analysis: {
          overallAssessment: assessOverallQuality(analysisResults.basicStats),
          strengths: identifyStrengths(text, analysisResults.basicStats),
          weaknesses: identifyWeaknesses(text, analysisResults.basicStats),
          recommendations: generateTextRecommendations(text, analysisResults.basicStats),
          nextSteps: generateNextSteps(text, analysisResults.basicStats)
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        input: {
          text: text,
          length: text.length,
          options: mergedOptions
        },
        basicStats: analysisResults.basicStats,
        detailedStats: analysisResults.detailedStats,
        wordFrequency: mergedOptions.showFrequency ? analysisResults.wordFrequency : undefined,
        readability: mergedOptions.showReadability ? enhancedAnalysis.readability : undefined,
        keywords: mergedOptions.showKeywords ? analysisResults.keywords : undefined,
        analysis: enhancedAnalysis,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Word Counter Error:', error)
    
    // Fallback text analysis
    const { text } = await request.json()
    let fallbackStats = {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      lines: 0,
      paragraphs: 0,
      sentences: 0,
      averageWordsPerSentence: 0,
      averageCharactersPerWord: 0
    }
    
    try {
      fallbackStats = performBasicTextAnalysis(text || '')
    } catch (fallbackError) {
      fallbackStats = {
        characters: (text || '').length,
        charactersNoSpaces: (text || '').replace(/\s/g, '').length,
        words: (text || '').split(/\s+/).filter(w => w.length > 0).length,
        lines: (text || '').split('\n').length,
        paragraphs: (text || '').split(/\n\s*\n/).length,
        sentences: (text || '').split(/[.!?]+/).filter(s => s.trim().length > 0).length,
        averageWordsPerSentence: 0,
        averageCharactersPerWord: 0
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        input: { text: text || '' },
        basicStats: fallbackStats,
        timestamp: new Date().toISOString()
      }
    })
  }
}

function performTextAnalysis(text: string, options: any): any {
  const basicStats = calculateBasicStats(text, options)
  const detailedStats = calculateDetailedStats(text, options)
  const wordFrequency = options.showFrequency ? calculateWordFrequency(text) : {}
  const keywords = options.showKeywords ? extractKeywords(text, wordFrequency) : []

  return {
    basicStats,
    detailedStats,
    wordFrequency,
    keywords
  }
}

function calculateBasicStats(text: string, options: any): any {
  const characters = text.length
  const charactersNoSpaces = text.replace(/\s/g, '').length
  const words = text.split(/\s+/).filter(word => word.length > 0)
  const lines = text.split('\n')
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)

  return {
    characters,
    charactersNoSpaces: options.includeSpaces ? charactersNoSpaces : characters,
    words: words.length,
    lines: options.countLines ? lines.length : undefined,
    paragraphs: options.countParagraphs ? paragraphs.length : undefined,
    sentences: options.countSentences ? sentences.length : undefined,
    averageWordsPerSentence: sentences.length > 0 ? words.length / sentences.length : 0,
    averageCharactersPerWord: words.length > 0 ? charactersNoSpaces / words.length : 0
  }
}

function calculateDetailedStats(text: string, options: any): any {
  const words = text.split(/\s+/).filter(word => word.length > 0)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  const wordLengths = words.map(word => word.length)
  const sentenceLengths = sentences.map(sentence => 
    sentence.split(/\s+/).filter(word => word.length > 0).length
  )

  return {
    shortestWord: wordLengths.length > 0 ? Math.min(...wordLengths) : 0,
    longestWord: wordLengths.length > 0 ? Math.max(...wordLengths) : 0,
    averageWordLength: wordLengths.length > 0 ? 
      wordLengths.reduce((sum, len) => sum + len, 0) / wordLengths.length : 0,
    shortestSentence: sentenceLengths.length > 0 ? Math.min(...sentenceLengths) : 0,
    longestSentence: sentenceLengths.length > 0 ? Math.max(...sentenceLengths) : 0,
    averageSentenceLength: sentenceLengths.length > 0 ? 
      sentenceLengths.reduce((sum, len) => sum + len, 0) / sentenceLengths.length : 0,
    uniqueWords: new Set(words.map(word => word.toLowerCase())).size,
    punctuationCount: (text.match(/[.,!?;:'"()[\]{}]/g) || []).length,
    numbersCount: (text.match(/\b\d+\.?\d*\b/g) || []).length,
    uppercaseCount: (text.match(/[A-Z]/g) || []).length,
    lowercaseCount: (text.match(/[a-z]/g) || []).length
  }
}

function calculateWordFrequency(text: string): any {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0)

  const frequency: Record<string, number> = {}
  
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1
  })

  // Sort by frequency and return top 20
  const sortedFrequency = Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .reduce((obj, [word, count]) => {
      obj[word] = count
      return obj
    }, {} as Record<string, number>)

  return sortedFrequency
}

function extractKeywords(text: string, wordFrequency: any): string[] {
  // Simple keyword extraction based on frequency and word length
  const words = Object.entries(wordFrequency)
    .filter(([word, count]) => word.length > 3 && count > 1)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word)

  return words
}

function calculateReadabilityScores(text: string, basicStats: any): any {
  const sentences = basicStats.sentences || 1
  const words = basicStats.words || 1
  const characters = basicStats.charactersNoSpaces || 1

  // Flesch Reading Ease
  const fleschScore = 206.835 - (1.015 * (words / sentences)) - (84.6 * (characters / words))
  
  // Flesch-Kincaid Grade Level
  const fleschKincaid = (0.39 * (words / sentences)) + (11.8 * (characters / words)) - 15.59
  
  // Gunning Fog Index
  const complexWords = text.split(/\s+/).filter(word => word.length > 6).length
  const gunningFog = 0.4 * ((words / sentences) + 100 * (complexWords / words))
  
  // SMOG Index
  const polysyllables = text.split(/\s+/).filter(word => 
    word.replace(/[aeiou]/gi, '').length < word.length - 3
  ).length
  const smogIndex = 1.043 * Math.sqrt(polysyllables * (30 / sentences)) + 3.1291
  
  // Automated Readability Index
  const automatedReadability = 4.71 * (characters / words) + 0.5 * (words / sentences) - 21.43

  return {
    fleschScore: Math.max(0, Math.min(100, fleschScore)),
    fleschKincaid: Math.max(0, fleschKincaid),
    gunningFog: Math.max(0, gunningFog),
    smogIndex: Math.max(0, smogIndex),
    automatedReadability: Math.max(0, automatedReadability)
  }
}

function calculateVocabularyStats(text: string, wordFrequency: any): any {
  const words = text.split(/\s+/).filter(word => word.length > 0)
  const uniqueWords = new Set(words.map(word => word.toLowerCase()))
  
  const totalWords = words.length
  const uniqueWordCount = uniqueWords.size
  const diversityRatio = totalWords > 0 ? uniqueWordCount / totalWords : 0
  
  const complexWords = words.filter(word => word.length > 6).length
  const simpleWords = words.filter(word => word.length <= 6).length
  
  const averageWordLength = totalWords > 0 ? 
    words.reduce((sum, word) => sum + word.length, 0) / totalWords : 0

  return {
    uniqueWords: uniqueWordCount,
    totalWords,
    diversityRatio,
    complexWords,
    simpleWords,
    averageWordLength
  }
}

// Fallback analysis functions
function assessTextComplexity(text: string, stats: any): string {
  const avgWordLength = stats.averageCharactersPerWord
  const avgSentenceLength = stats.averageWordsPerSentence
  
  if (avgWordLength > 6 && avgSentenceLength > 20) return 'complex'
  if (avgWordLength > 5 && avgSentenceLength > 15) return 'moderate'
  return 'simple'
}

function calculateVocabularyDiversity(wordFrequency: any): number {
  const totalWords = Object.values(wordFrequency).reduce((sum: number, count: number) => sum + count, 0)
  const uniqueWords = Object.keys(wordFrequency).length
  
  return totalWords > 0 ? uniqueWords / totalWords : 0
}

function assessSentenceVariety(text: string): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const lengths = sentences.map(s => s.split(/\s+/).length)
  
  const variance = lengths.reduce((sum, len) => {
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length
    return sum + Math.pow(len - mean, 2)
  }, 0) / lengths.length
  
  return variance > 25 ? 'high' : variance > 10 ? 'medium' : 'low'
}

function calculateReadabilityScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1
  const words = text.split(/\s+/).filter(w => w.length > 0).length || 1
  const syllables = text.split(/\s+/).reduce((sum, word) => {
    return sum + (word.match(/[aeiouAEIOU]/g) || []).length
  }, 0)
  
  return 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words))
}

function calculateGradeLevel(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1
  const words = text.split(/\s+/).filter(w => w.length > 0).length || 1
  const characters = text.replace(/\s/g, '').length || 1
  
  return (0.39 * (words / sentences)) + (11.8 * (characters / words)) - 15.59
}

function assessFormality(text: string): string {
  const informalWords = ['hey', 'hi', 'yeah', 'okay', 'cool', 'awesome', 'great', 'good']
  const formalWords = ['therefore', 'however', 'furthermore', 'consequently', 'nevertheless']
  
  const words = text.toLowerCase().split(/\s+/)
  const informalCount = words.filter(word => informalWords.includes(word)).length
  const formalCount = words.filter(word => formalWords.includes(word)).length
  
  if (formalCount > informalCount) return 'formal'
  if (informalCount > formalCount) return 'informal'
  return 'neutral'
}

function assessTone(text: string): string {
  const technicalWords = ['algorithm', 'function', 'variable', 'parameter', 'implementation']
  const emotionalWords = ['love', 'hate', 'happy', 'sad', 'angry', 'excited']
  
  const words = text.toLowerCase().split(/\s+/)
  const technicalCount = words.filter(word => technicalWords.includes(word)).length
  const emotionalCount = words.filter(word => emotionalWords.includes(word)).length
  
  if (technicalCount > emotionalCount) return 'technical'
  if (emotionalCount > technicalCount) return 'casual'
  return 'professional'
}

function assessClarity(text: string): string {
  const avgSentenceLength = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    .reduce((sum, sentence) => sum + sentence.split(/\s+/).length, 0) / 
    (text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1)
  
  if (avgSentenceLength < 15) return 'excellent'
  if (avgSentenceLength < 20) return 'good'
  if (avgSentenceLength < 25) return 'fair'
  return 'poor'
}

function assessConciseness(text: string): string {
  const words = text.split(/\s+/).filter(w => w.length > 0)
  const fillerWords = ['very', 'really', 'quite', 'somewhat', 'rather', 'pretty']
  const fillerCount = words.filter(word => fillerWords.includes(word.toLowerCase())).length
  
  const ratio = fillerCount / words.length
  
  if (ratio < 0.02) return 'excellent'
  if (ratio < 0.05) return 'good'
  if (ratio < 0.08) return 'fair'
  return 'poor'
}

function assessParagraphCoherence(text: string): string {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
  
  // Simple coherence assessment based on paragraph length consistency
  const lengths = paragraphs.map(p => p.split(/\s+/).length)
  const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length
  
  return variance < avgLength * 0.5 ? 'high' : variance < avgLength ? 'medium' : 'low'
}

function assessLogicalFlow(text: string): string {
  const transitionWords = ['however', 'therefore', 'furthermore', 'moreover', 'consequently', 'nevertheless']
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  const transitionCount = sentences.filter(sentence => 
    transitionWords.some(word => sentence.toLowerCase().includes(word))
  ).length
  
  const ratio = transitionCount / sentences.length
  
  if (ratio > 0.3) return 'excellent'
  if (ratio > 0.15) return 'good'
  if (ratio > 0.05) return 'fair'
  return 'poor'
}

function assessOrganization(text: string): string {
  const hasStructure = /(?:^|\n)\s*(?:introduction|background|method|result|conclusion|summary)/i.test(text)
  const hasList = /(?:^|\n)\s*(?:•|-|\*|\d+\.)\s+/i.test(text)
  
  if (hasStructure && hasList) return 'well-structured'
  if (hasStructure || hasList) return 'moderate'
  return 'poorly-structured'
}

function detectContentType(text: string): string {
  const narrativeWords = ['story', 'character', 'plot', 'scene', 'narrative']
  const expositoryWords = ['explain', 'describe', 'define', 'analyze', 'examine']
  const persuasiveWords = ['should', 'must', 'argue', 'convince', 'persuade']
  const descriptiveWords = ['appearance', 'looks', 'seems', 'appears', 'description']
  const technicalWords = ['function', 'method', 'algorithm', 'data', 'process']
  
  const words = text.toLowerCase().split(/\s+/)
  
  const counts = {
    narrative: words.filter(w => narrativeWords.includes(w)).length,
    expository: words.filter(w => expositoryWords.includes(w)).length,
    persuasive: words.filter(w => persuasiveWords.includes(w)).length,
    descriptive: words.filter(w => descriptiveWords.includes(w)).length,
    technical: words.filter(w => technicalWords.includes(w)).length
  }
  
  const maxType = Object.entries(counts).reduce((max, [type, count]) => 
    count > max.count ? { type, count } : max, { type: 'expository', count: 0 }
  )
  
  return maxType.type as any
}

function detectContentPurpose(text: string): string {
  const informWords = ['information', 'fact', 'data', 'explain', 'describe']
  const persuadeWords = ['should', 'must', 'argue', 'convince', 'opinion']
  const entertainWords = ['story', 'fun', 'interesting', 'exciting', 'amusing']
  const instructWords = ['step', 'procedure', 'method', 'how', 'guide']
  
  const words = text.toLowerCase().split(/\s+/)
  
  const counts = {
    inform: words.filter(w => informWords.includes(w)).length,
    persuade: words.filter(w => persuadeWords.includes(w)).length,
    entertain: words.filter(w => entertainWords.includes(w)).length,
    instruct: words.filter(w => instructWords.includes(w)).length
  }
  
  const maxPurpose = Object.entries(counts).reduce((max, [purpose, count]) => 
    count > max.count ? { purpose, count } : max, { purpose: 'inform', count: 0 }
  )
  
  return maxPurpose.purpose
}

function detectAudience(text: string): string {
  const technicalTerms = ['algorithm', 'function', 'parameter', 'implementation', 'syntax']
  const academicTerms = ['research', 'study', 'analysis', 'theory', 'hypothesis']
  const professionalTerms = ['business', 'market', 'strategy', 'management', 'organization']
  
  const words = text.toLowerCase().split(/\s+/)
  
  const technicalCount = words.filter(w => technicalTerms.includes(w)).length
  const academicCount = words.filter(w => academicTerms.includes(w)).length
  const professionalCount = words.filter(w => professionalTerms.includes(w)).length
  
  if (technicalCount > academicCount && technicalCount > professionalCount) return 'specialized'
  if (academicCount > professionalCount) return 'academic'
  if (professionalCount > 0) return 'professional'
  return 'general'
}

function assessContentQuality(text: string): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length
  
  const grammarScore = assessGrammarQuality(text)
  const structureScore = assessStructureQuality(text)
  const vocabularyScore = assessVocabularyQuality(text)
  
  const overallScore = (grammarScore + structureScore + vocabularyScore) / 3
  
  if (overallScore > 0.8) return 'excellent'
  if (overallScore > 0.6) return 'good'
  if (overallScore > 0.4) return 'fair'
  return 'poor'
}

function detectLanguage(text: string): string {
  // Simple language detection based on character patterns
  const patterns = {
    english: /[the|and|or|but|in|on|at|to|for|of|with|by]/i,
    spanish: /[el|la|de|que|y|a|en|un|con|por|lo]/i,
    french: /[le|la|de|et|à|un|il|être|avoir|faire]/i,
    german: /[der|die|und|in|den|von|zu|das|mit|sich]/i
  }
  
  const scores = Object.entries(patterns).map(([lang, pattern]) => {
    const matches = (text.match(pattern) || []).length
    return { lang, score: matches }
  })
  
  const maxScore = scores.reduce((max, current) => current.score > max.score ? current : max)
  return maxScore.lang
}

function detectLanguageCharacteristics(text: string): string[] {
  const characteristics = []
  
  if (/[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/i.test(text)) {
    characteristics.push('diacritics')
  }
  
  if (/[а-яё]/i.test(text)) {
    characteristics.push('cyrillic')
  }
  
  if (/[α-ωά-ώ]/i.test(text)) {
    characteristics.push('greek')
  }
  
  if (/[\u4e00-\u9fff]/.test(text)) {
    characteristics.push('chinese')
  }
  
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
    characteristics.push('japanese')
  }
  
  if (characteristics.length === 0) {
    characteristics.push('latin-based')
  }
  
  return characteristics
}

function detectDialect(text: string): string {
  // Simple dialect detection
  if (/(color|center|organize)/i.test(text)) return 'american'
  if (/(colour|centre|organise)/i.test(text)) return 'british'
  return 'unknown'
}

function assessSentenceComplexity(text: string): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const avgLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length
  
  if (avgLength > 25) return 'complex'
  if (avgLength > 15) return 'compound'
  return 'simple'
}

function assessOverallQuality(stats: any): string {
  const avgWordLength = stats.averageCharactersPerWord
  const avgSentenceLength = stats.averageWordsPerSentence
  
  let score = 100
  
  if (avgWordLength < 3 || avgWordLength > 8) score -= 20
  if (avgSentenceLength < 5 || avgSentenceLength > 30) score -= 20
  if (stats.uniqueWords / stats.words < 0.3) score -= 20
  
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'fair'
  return 'poor'
}

function identifyStrengths(text: string, stats: any): string[] {
  const strengths = []
  
  if (stats.averageWordsPerSentence < 20) strengths.push('Clear sentence structure')
  if (stats.averageCharactersPerWord > 4 && stats.averageCharactersPerWord < 7) strengths.push('Good word length variety')
  if (stats.uniqueWords / stats.words > 0.5) strengths.push('Rich vocabulary')
  
  return strengths
}

function identifyWeaknesses(text: string, stats: any): string[] {
  const weaknesses = []
  
  if (stats.averageWordsPerSentence > 25) weaknesses.push('Long sentences')
  if (stats.averageCharactersPerWord < 4) weaknesses.push('Simple vocabulary')
  if (stats.uniqueWords / stats.words < 0.3) weaknesses.push('Repetitive vocabulary')
  
  return weaknesses
}

function generateTextRecommendations(text: string, stats: any): string[] {
  const recommendations = []
  
  if (stats.averageWordsPerSentence > 20) {
    recommendations.push('Consider breaking up long sentences')
  }
  
  if (stats.averageCharactersPerWord < 4) {
    recommendations.push('Use more varied vocabulary')
  }
  
  if (stats.uniqueWords / stats.words < 0.4) {
    recommendations.push('Increase vocabulary diversity')
  }
  
  recommendations.push('Review for clarity and conciseness')
  recommendations.push('Consider target audience readability')
  
  return recommendations
}

function generateNextSteps(text: string, stats: any): string[] {
  return [
    'Review grammar and spelling',
    'Check for consistent formatting',
    'Consider peer review',
    'Test readability with target audience',
    'Revise for clarity and impact'
  ]
}

function performBasicTextAnalysis(text: string): any {
  return {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    words: text.split(/\s+/).filter(w => w.length > 0).length,
    lines: text.split('\n').length,
    paragraphs: text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length,
    sentences: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
    averageWordsPerSentence: 0,
    averageCharactersPerWord: 0
  }
}

function assessGrammarQuality(text: string): number {
  // Simplified grammar assessment
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const properCapitalization = sentences.filter(s => /^[A-Z]/.test(s.trim())).length
  const properPunctuation = sentences.filter(s => /[.!?]$/.test(s.trim())).length
  
  return (properCapitalization + properPunctuation) / (sentences.length * 2)
}

function assessStructureQuality(text: string): number {
  const hasBeginning = /^.{10,}/m.test(text)
  const hasMiddle = text.length > 100
  const hasEnd = /[.!?]\s*$/.test(text)
  
  return (hasBeginning ? 0.33 : 0) + (hasMiddle ? 0.33 : 0) + (hasEnd ? 0.34 : 0)
}

function assessVocabularyQuality(text: string): number {
  const words = text.split(/\s+/).filter(w => w.length > 0)
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size
  
  return Math.min(uniqueWords / words.length, 1)
}