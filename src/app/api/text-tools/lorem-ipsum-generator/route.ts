import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type = 'paragraphs',
      count = 3,
      startWithLorem = true,
      language = 'latin',
      format = 'html',
      includeTags = false,
      sentenceLength = 'medium'
    } = body;

    // Input validation
    if (!['words', 'sentences', 'paragraphs'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be words, sentences, or paragraphs' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(count) || count < 1 || count > 100) {
      return NextResponse.json(
        { error: 'Count must be between 1 and 100' },
        { status: 400 }
      );
    }

    if (typeof startWithLorem !== 'boolean') {
      return NextResponse.json(
        { error: 'startWithLorem must be a boolean value' },
        { status: 400 }
      );
    }

    if (!['latin', 'english', 'spanish', 'german', 'french'].includes(language)) {
      return NextResponse.json(
        { error: 'Language must be latin, english, spanish, german, or french' },
        { status: 400 }
      );
    }

    if (!['plain', 'html', 'markdown'].includes(format)) {
      return NextResponse.json(
        { error: 'Format must be plain, html, or markdown' },
        { status: 400 }
      );
    }

    if (typeof includeTags !== 'boolean') {
      return NextResponse.json(
        { error: 'includeTags must be a boolean value' },
        { status: 400 }
      );
    }

    if (!['short', 'medium', 'long', 'variable'].includes(sentenceLength)) {
      return NextResponse.json(
        { error: 'Sentence length must be short, medium, long, or variable' },
        { status: 400 }
      );
    }

    // Generate Lorem Ipsum text
    const generatedText = generateLoremIpsum(type, count, startWithLorem, language, sentenceLength);
    
    // Format the output
    let formattedText = generatedText;
    let formattedHTML = '';
    let formattedMarkdown = '';

    switch (format) {
      case 'html':
        formattedText = formatAsHTML(generatedText, type, includeTags);
        break;
      case 'markdown':
        formattedText = formatAsMarkdown(generatedText, type);
        break;
      default:
        // Keep as plain text
        break;
    }

    // Generate all formats for comparison
    formattedHTML = formatAsHTML(generatedText, type, includeTags);
    formattedMarkdown = formatAsMarkdown(generatedText, type);

    // Analyze generated text
    const analysis = analyzeLoremIpsum(generatedText, type, language);

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a typography and content generation expert. Analyze the Lorem Ipsum generation and provide insights about its usage, best practices, and applications in design and development.'
          },
          {
            role: 'user',
            content: `Generated ${type} of Lorem Ipsum text (${count} ${type}) in ${language} language. ${startWithLorem ? 'Starts with "Lorem ipsum".' : 'Random start.'} Sentence length: ${sentenceLength}. Format: ${format}. Text length: ${analysis.characterCount} characters. Provide insights about Lorem Ipsum usage and best practices for placeholder text.`
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
      text: {
        plain: generatedText,
        html: formattedHTML,
        markdown: formattedMarkdown
      },
      currentFormat: format,
      analysis,
      parameters: {
        type,
        count,
        startWithLorem,
        language,
        format,
        includeTags,
        sentenceLength
      },
      aiInsights
    });

  } catch (error) {
    console.error('Lorem Ipsum generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate Lorem Ipsum' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateLoremIpsum(type: string, count: number, startWithLorem: boolean, language: string, sentenceLength: string): string {
  const wordLists = getWordLists(language);
  const { words, sentences, paragraphs } = wordLists;

  let result = '';

  switch (type) {
    case 'words':
      result = generateWords(count, words, startWithLorem);
      break;
    case 'sentences':
      result = generateSentences(count, sentences, words, startWithLorem, sentenceLength);
      break;
    case 'paragraphs':
      result = generateParagraphs(count, paragraphs, sentences, words, startWithLorem, sentenceLength);
      break;
  }

  return result.trim();
}

function getWordLists(language: string): { words: string[]; sentences: string[]; paragraphs: string[] } {
  const wordLists: Record<string, { words: string[]; sentences: string[]; paragraphs: string[] }> = {
    latin: {
      words: [
        'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
        'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
        'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
        'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
        'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
        'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
        'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
        'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
      ],
      sentences: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
        'Duis aute irure dolor in reprehenderit in voluptate velit esse.',
        'Excepteur sint occaecat cupidatat non proident, sunt in culpa.',
        'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit.',
        'Ut aliquip ex ea commodo consequat.',
        'Duis aute irure dolor in reprehenderit in voluptate velit esse.'
      ],
      paragraphs: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.'
      ]
    },
    english: {
      words: [
        'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'pack',
        'my', 'box', 'with', 'five', 'dozen', 'liquor', 'jugs', 'how', 'razorback',
        'jumping', 'frogs', 'can', 'level', 'six', 'piqued', 'gymnasts', 'waltz',
        'nymph', 'for', 'quid', 'pro', 'quo', 'scrambled', 'eggs', 'believe', 'it',
        'not', 'art', 'thou', 'a', 'go', 'kill', 'wiz', 'freak', 'yoyo', 'boy'
      ],
      sentences: [
        'The quick brown fox jumps over the lazy dog.',
        'Pack my box with five dozen liquor jugs.',
        'How razorback jumping frogs can level six piqued gymnasts.',
        'Waltz nymph, for quick jigs vex bud.',
        'Sphinx of black quartz, judge my vow.',
        'The five boxing wizards jump quickly.',
        'Jackdaws love my big sphinx of quartz.',
        'How vexingly quick daft zebras jump!'
      ],
      paragraphs: [
        'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How razorback jumping frogs can level six piqued gymnasts. Waltz nymph, for quick jigs vex bud.',
        'Sphinx of black quartz, judge my vow. The five boxing wizards jump quickly. Jackdaws love my big sphinx of quartz. How vexingly quick daft zebras jump! Bright vixens jump; dozy fowl quack.',
        'Quick zephyrs blow, vexing daft Jim. Six big devils from Japan quickly forgot how to waltz. Big fjords vex quick waltz nymph. Glow jocks quiz vex dwarf.'
      ]
    },
    spanish: {
      words: [
        'el', 'veloz', 'zorro', 'marrón', 'salta', 'sobre', 'el', 'perro',
        'perezoso', 'mi', 'caja', 'con', 'cinco', 'docenas', 'jarras', 'licor',
        'cómo', 'las', 'ranas', 'saltarinas', 'pueden', 'nivelar', 'seis', 'gimnastas',
        'valses', 'ninfas', 'para', 'rápidos', 'jigs', 'molestan', 'brote'
      ],
      sentences: [
        'El veloz zorro marrón salta sobre el perro perezoso.',
        'Empaqueta mi caja con cinco docenas de jarras de licor.',
        '¿Cómo las ranas saltarinas pueden nivelar seis gimnastas?',
        'Vals ninfas, para jigs rápidos molestan el brote.',
        'Esfinge de cuarzo negro, juzga mi voto.',
        'Los cinco magos boxeadores saltan rápidamente.',
        'Las grajas jackdaws aman mi gran esfinge de cuarzo.'
      ],
      paragraphs: [
        'El veloz zorro marrón salta sobre el perro perezoso. Empaqueta mi caja con cinco docenas de jarras de licor. ¿Cómo las ranas saltarinas pueden nivelar seis gimnastas? Vals ninfas, para jigs rápidos molestan el brote.',
        'Esfinge de cuarzo negro, juzga mi voto. Los cinco magos boxeadores saltan rápidamente. Las grajas jackdaws aman mi gran esfinge de cuarzo. ¡Qué rápida y tonta cebras saltan! Brillantes zorros saltan; patos torpes graznan.',
        'Céfiros rápidos soplan, molestando al tonto Jim. Seis grandes diablos de Japón olvidaron rápidamente cómo valsar. Grandes fiordos molestan valsos ninfas. Resplandecen atletas que interrogan enano.'
      ]
    }
  };

  return wordLists[language] || wordLists.latin;
}

function generateWords(count: number, words: string[], startWithLorem: boolean): string {
  const result: string[] = [];
  
  if (startWithLorem && words.includes('lorem')) {
    result.push('Lorem');
    count--;
  }
  
  for (let i = 0; i < count; i++) {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    result.push(randomWord);
  }
  
  return result.join(' ');
}

function generateSentences(count: number, sentences: string[], words: string[], startWithLorem: boolean, sentenceLength: string): string {
  const result: string[] = [];
  
  for (let i = 0; i < count; i++) {
    let sentence: string;
    
    if (i === 0 && startWithLorem && sentences.some(s => s.toLowerCase().includes('lorem'))) {
      sentence = sentences.find(s => s.toLowerCase().includes('lorem')) || sentences[0];
    } else {
      sentence = generateSentence(words, sentenceLength);
    }
    
    result.push(sentence);
  }
  
  return result.join(' ');
}

function generateParagraphs(count: number, paragraphs: string[], sentences: string[], words: string[], startWithLorem: boolean, sentenceLength: string): string {
  const result: string[] = [];
  
  for (let i = 0; i < count; i++) {
    let paragraph: string;
    
    if (i === 0 && startWithLorem && paragraphs.some(p => p.toLowerCase().includes('lorem'))) {
      paragraph = paragraphs.find(p => p.toLowerCase().includes('lorem')) || paragraphs[0];
    } else {
      const sentenceCount = Math.floor(Math.random() * 3) + 3; // 3-5 sentences per paragraph
      const paragraphSentences: string[] = [];
      
      for (let j = 0; j < sentenceCount; j++) {
        paragraphSentences.push(generateSentence(words, sentenceLength));
      }
      
      paragraph = paragraphSentences.join(' ');
    }
    
    result.push(paragraph);
  }
  
  return result.join('\n\n');
}

function generateSentence(words: string[], lengthType: string): string {
  let wordCount: number;
  
  switch (lengthType) {
    case 'short':
      wordCount = Math.floor(Math.random() * 5) + 5; // 5-9 words
      break;
    case 'medium':
      wordCount = Math.floor(Math.random() * 8) + 8; // 8-15 words
      break;
    case 'long':
      wordCount = Math.floor(Math.random() * 10) + 15; // 15-25 words
      break;
    case 'variable':
      wordCount = Math.floor(Math.random() * 20) + 5; // 5-25 words
      break;
    default:
      wordCount = Math.floor(Math.random() * 8) + 8;
  }
  
  const sentenceWords: string[] = [];
  
  for (let i = 0; i < wordCount; i++) {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    sentenceWords.push(randomWord);
  }
  
  // Capitalize first letter and add period
  sentenceWords[0] = sentenceWords[0].charAt(0).toUpperCase() + sentenceWords[0].slice(1);
  return sentenceWords.join(' ') + '.';
}

function formatAsHTML(text: string, type: string, includeTags: boolean): string {
  if (!includeTags) {
    return text;
  }
  
  switch (type) {
    case 'words':
      return `<span>${text}</span>`;
    case 'sentences':
      return text.split('. ').map(sentence => sentence.trim() + '.').filter(s => s !== '.').map(s => `<p>${s}</p>`).join('\n');
    case 'paragraphs':
      return text.split('\n\n').map(paragraph => `<p>${paragraph}</p>`).join('\n');
    default:
      return `<p>${text}</p>`;
  }
}

function formatAsMarkdown(text: string, type: string): string {
  switch (type) {
    case 'words':
      return text;
    case 'sentences':
      return text.split('. ').map(sentence => sentence.trim() + '.').filter(s => s !== '.').map(s => `${s}`).join('\n\n');
    case 'paragraphs':
      return text;
    default:
      return text;
  }
}

function analyzeLoremIpsum(text: string, type: string, language: string): any {
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  const paragraphs = text.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0);
  
  const analysis = {
    type: type,
    language: language,
    characterCount: text.length,
    wordCount: words.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    averageWordsPerSentence: sentences.length > 0 ? Math.round(words.length / sentences.length) : 0,
    averageWordsPerParagraph: paragraphs.length > 0 ? Math.round(words.length / paragraphs.length) : 0,
    uniqueWords: new Set(words.map(word => word.toLowerCase())).size,
    lexicalDiversity: words.length > 0 ? ((new Set(words.map(word => word.toLowerCase())).size / words.length) * 100).toFixed(2) + '%' : '0%'
  };
  
  return analysis;
}

export async function GET() {
  return NextResponse.json({
    message: 'Lorem Ipsum Generator API',
    usage: 'POST /api/text-tools/lorem-ipsum-generator',
    parameters: {
      type: 'Output type: words, sentences, paragraphs (default: paragraphs) - optional',
      count: 'Number of items to generate (1-100, default: 3) - optional',
      startWithLorem: 'Start with "Lorem ipsum" (default: true) - optional',
      language: 'Language: latin, english, spanish, german, french (default: latin) - optional',
      format: 'Output format: plain, html, markdown (default: plain) - optional',
      includeTags: 'Include HTML tags (default: false) - optional',
      sentenceLength: 'Sentence length: short, medium, long, variable (default: medium) - optional'
    },
    supportedLanguages: {
      latin: 'Traditional Lorem Ipsum text',
      english: 'English placeholder text',
      spanish: 'Spanish placeholder text',
      german: 'German placeholder text',
      french: 'French placeholder text'
    },
    outputFormats: {
      plain: 'Plain text without formatting',
      html: 'HTML formatted with appropriate tags',
      markdown: 'Markdown formatted text'
    },
    examples: [
      {
        type: 'paragraphs',
        count: 3,
        startWithLorem: true,
        language: 'latin',
        format: 'html'
      },
      {
        type: 'sentences',
        count: 5,
        startWithLorem: false,
        language: 'english',
        format: 'plain'
      },
      {
        type: 'words',
        count: 50,
        startWithLorem: true,
        language: 'spanish',
        format: 'markdown'
      }
    ],
    tips: [
      'Use Lorem ipsum for design mockups and prototypes',
      'Choose language based on your target audience',
      'Vary sentence length for more natural appearance',
      'Use HTML format for web design mockups',
      'Consider accessibility when using placeholder text'
    ]
  });
}