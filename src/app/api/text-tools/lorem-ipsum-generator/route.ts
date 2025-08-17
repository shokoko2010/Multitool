import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface LoremIpsumOptions {
  type?: 'lorem-ipsum' | 'cicero' | 'business' | 'tech' | 'legal' | 'medical';
  count?: number;
  unit?: 'words' | 'sentences' | 'paragraphs';
  format?: 'plain' | 'html' | 'markdown';
  startWithLorem?: boolean;
  includePunctuation?: boolean;
  capitalize?: boolean;
}

interface LoremIpsumResult {
  success: boolean;
  data?: {
    text: string;
    options: LoremIpsumOptions;
    stats: {
      wordCount: number;
      sentenceCount: number;
      paragraphCount: number;
      characterCount: number;
    };
  };
  error?: string;
  analysis?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { options = {} } = await request.json();

    // Set default options
    const loremOptions: LoremIpsumOptions = {
      type: options.type || 'lorem-ipsum',
      count: Math.min(Math.max(options.count || 5, 1), 1000),
      unit: options.unit || 'paragraphs',
      format: options.format || 'plain',
      startWithLorem: options.startWithLorem !== false,
      includePunctuation: options.includePunctuation !== false,
      capitalize: options.capitalize !== false
    };

    // Validate options
    if (loremOptions.count < 1 || loremOptions.count > 1000) {
      return NextResponse.json<LoremIpsumResult>({
        success: false,
        error: 'Count must be between 1 and 1000'
      }, { status: 400 });
    }

    // Generate Lorem Ipsum text
    const generatedText = generateLoremIpsum(loremOptions);

    // Calculate statistics
    const stats = calculateTextStats(generatedText);

    const result = {
      text: generatedText,
      options: loremOptions,
      stats
    };

    // AI Analysis
    let analysis = '';
    try {
      const zai = await ZAI.create();
      const analysisResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a content generation expert. Analyze the Lorem Ipsum generation parameters and provide insights about the generated text, its use cases, and recommendations for content creation.'
          },
          {
            role: 'user',
            content: `Analyze this Lorem Ipsum generation:\n\nType: ${loremOptions.type}\nCount: ${loremOptions.count} ${loremOptions.unit}\nFormat: ${loremOptions.format}\nStart With Lorem: ${loremOptions.startWithLorem}\n\nGenerated Text Stats:\n- Words: ${stats.wordCount}\n- Sentences: ${stats.sentenceCount}\n- Paragraphs: ${stats.paragraphCount}\n- Characters: ${stats.characterCount}\n\nText Preview: ${generatedText.substring(0, 200)}...`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      analysis = analysisResponse.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI analysis failed:', error);
    }

    return NextResponse.json<LoremIpsumResult>({
      success: true,
      data: result,
      analysis
    });

  } catch (error) {
    console.error('Lorem Ipsum generation error:', error);
    return NextResponse.json<LoremIpsumResult>({
      success: false,
      error: 'Internal server error during Lorem Ipsum generation'
    }, { status: 500 });
  }
}

function generateLoremIpsum(options: LoremIpsumOptions): string {
  const wordLists = {
    'lorem-ipsum': [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
      'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
      'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
      'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
      'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
      'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
      'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
      'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
    ],
    'cicero': [
      'sed', 'ut', 'perspiciatis', 'unde', 'omnis', 'iste', 'natus', 'error',
      'sit', 'voluptatem', 'accusantium', 'doloremque', 'laudantium', 'totam',
      'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo', 'inventore',
      'veritatis', 'et', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta',
      'sunt', 'explicabo', 'nemo', 'ipsam', 'voluptatem', 'quia', 'voluptas',
      'sit', 'aspernatur', 'aut', 'odit', 'aut', 'fugit', 'sed', 'quia',
      'consequuntur', 'magni', 'dolores', 'eos', 'qui', 'ratione', 'voluptatem',
      'sequi', 'nesciunt', 'neque', 'porro', 'quisquam', 'est', 'qui', 'dolorem'
    ],
    'business': [
      'strategy', 'innovation', 'growth', 'market', 'revenue', 'profit', 'customer',
      'service', 'quality', 'efficiency', 'productivity', 'leadership', 'team',
      'collaboration', 'partnership', 'synergy', 'optimization', 'performance',
      'analytics', 'insights', 'data', 'metrics', 'kpi', 'roi', 'scalability',
      'sustainability', 'competitive', 'advantage', 'value', 'proposition', 'brand',
      'marketing', 'sales', 'operations', 'finance', 'investment', 'diversification'
    ],
    'tech': [
      'algorithm', 'database', 'framework', 'library', 'api', 'interface', 'protocol',
      'architecture', 'scalability', 'performance', 'optimization', 'deployment',
      'integration', 'automation', 'cloud', 'container', 'microservice', 'serverless',
      'blockchain', 'artificial', 'intelligence', 'machine', 'learning', 'neural',
      'network', 'quantum', 'computing', 'cybersecurity', 'encryption', 'authentication',
      'authorization', 'devops', 'continuous', 'integration', 'delivery'
    ],
    'legal': [
      'contract', 'agreement', 'terms', 'conditions', 'liability', 'indemnification',
      'warranty', 'disclaimer', 'confidentiality', 'intellectual', 'property',
      'copyright', 'trademark', 'patent', 'licensing', 'compliance', 'regulation',
      'jurisdiction', 'arbitration', 'litigation', 'settlement', 'damages', 'injunction',
      'subpoena', 'deposition', 'testimony', 'evidence', 'precedent', 'statute',
      'ordinance', 'regulation', 'directive', 'legislation', 'enforcement'
    ],
    'medical': [
      'diagnosis', 'treatment', 'therapy', 'medication', 'prescription', 'symptom',
      'disease', 'condition', 'patient', 'care', 'health', 'wellness', 'prevention',
      'recovery', 'rehabilitation', 'surgery', 'procedure', 'examination', 'diagnostic',
      'prognosis', 'chronic', 'acute', 'epidemic', 'pandemic', 'vaccine', 'antibiotic',
      'therapy', 'rehabilitation', 'specialist', 'physician', 'nurse', 'technician'
    ]
  };

  const wordList = wordLists[options.type] || wordLists['lorem-ipsum'];
  let text = '';

  // Generate content based on unit
  switch (options.unit) {
    case 'words':
      text = generateWords(wordList, options.count, options);
      break;
    case 'sentences':
      text = generateSentences(wordList, options.count, options);
      break;
    case 'paragraphs':
      text = generateParagraphs(wordList, options.count, options);
      break;
  }

  // Apply formatting
  return formatText(text, options);
}

function generateWords(wordList: string[], count: number, options: LoremIpsumOptions): string {
  const words: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const word = wordList[Math.floor(Math.random() * wordList.length)];
    let formattedWord = word;
    
    if (options.capitalize && i === 0) {
      formattedWord = word.charAt(0).toUpperCase() + word.slice(1);
    }
    
    words.push(formattedWord);
  }
  
  return words.join(' ');
}

function generateSentences(wordList: string[], count: number, options: LoremIpsumOptions): string {
  const sentences: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const wordCount = Math.floor(Math.random() * 15) + 5; // 5-20 words per sentence
    const words = generateWords(wordList, wordCount, { ...options, capitalize: false });
    
    let sentence = words;
    if (options.capitalize) {
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    }
    
    if (options.includePunctuation) {
      sentence += Math.random() > 0.7 ? '!' : '.';
    }
    
    sentences.push(sentence);
  }
  
  return sentences.join(' ');
}

function generateParagraphs(wordList: string[], count: number, options: LoremIpsumOptions): string {
  const paragraphs: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const sentenceCount = Math.floor(Math.random() * 8) + 3; // 3-10 sentences per paragraph
    const sentences = generateSentences(wordList, sentenceCount, { ...options, capitalize: true });
    
    paragraphs.push(sentences);
  }
  
  return paragraphs.join('\n\n');
}

function formatText(text: string, options: LoremIpsumOptions): string {
  let formatted = text;

  // Handle start with Lorem
  if (options.startWithLorem && options.type === 'lorem-ipsum') {
    const words = formatted.split(' ');
    if (words.length > 0 && words[0].toLowerCase() !== 'lorem') {
      words[0] = 'Lorem';
      formatted = words.join(' ');
    }
  }

  // Apply format
  switch (options.format) {
    case 'html':
      formatted = formatted
        .split('\n\n')
        .map(para => `<p>${para}</p>`)
        .join('\n');
      break;
    case 'markdown':
      formatted = formatted
        .split('\n\n')
        .map(para => `${para}\n`)
        .join('\n');
      break;
  }

  return formatted;
}

function calculateTextStats(text: string) {
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0);
  
  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    characterCount: text.length
  };
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'POST method required with options'
  }, { status: 405 });
}