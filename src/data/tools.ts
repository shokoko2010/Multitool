export interface Tool {
  id: string
  name: string
  description: string
  category: string
  icon: string
  path: string
  featured?: boolean
  tags?: string[]
}

export const tools: Tool[] = [
  // AI Tools
  {
    id: 'ai-content-generator',
    name: 'AI Content Generator',
    description: 'Generate high-quality content using AI',
    category: 'AI Tools',
    icon: 'Bot',
    path: '/tools/ai-content-generator',
    featured: true,
    tags: ['ai', 'content', 'writing']
  },
  {
    id: 'ai-seo-title',
    name: 'AI SEO Title Generator',
    description: 'Generate SEO-optimized titles using AI',
    category: 'AI Tools',
    icon: 'Search',
    path: '/tools/ai-seo-title',
    featured: true,
    tags: ['ai', 'seo', 'title']
  },
  {
    id: 'ai-seo-description',
    name: 'AI SEO Description Generator',
    description: 'Generate SEO-optimized descriptions using AI',
    category: 'AI Tools',
    icon: 'FileText',
    path: '/tools/ai-seo-description',
    featured: true,
    tags: ['ai', 'seo', 'description']
  },
  {
    id: 'ai-code-reviewer',
    name: 'AI Code Reviewer',
    description: 'Analyze code quality, detect bugs, and get optimization suggestions',
    category: 'AI Tools',
    icon: 'Code',
    path: '/tools/ai-code-reviewer',
    featured: true,
    tags: ['ai', 'code', 'review', 'analysis']
  },
  {
    id: 'ai-keyword-cluster',
    name: 'AI Keyword Cluster Generator',
    description: 'Generate comprehensive keyword clusters based on search intent',
    category: 'AI Tools',
    icon: 'Search',
    path: '/tools/ai-keyword-cluster',
    featured: true,
    tags: ['ai', 'keyword', 'seo', 'clustering']
  },
  {
    id: 'ai-content-optimizer',
    name: 'AI Content Optimizer',
    description: 'Optimize content for SEO and readability using AI',
    category: 'AI Tools',
    icon: 'Bot',
    path: '/tools/ai-content-optimizer',
    tags: ['ai', 'content', 'seo', 'optimization']
  },
  {
    id: 'ai-idea-generator',
    name: 'AI Idea Generator',
    description: 'Generate creative ideas for content, business, and projects',
    category: 'AI Tools',
    icon: 'Bot',
    path: '/tools/ai-idea-generator',
    tags: ['ai', 'ideas', 'creativity']
  },
  {
    id: 'ai-text-summarizer',
    name: 'AI Text Summarizer',
    description: 'Summarize long texts using AI',
    category: 'AI Tools',
    icon: 'FileText',
    path: '/tools/ai-text-summarizer',
    tags: ['ai', 'summarize', 'text']
  },
  {
    id: 'prompt-to-json-tool',
    name: 'Prompt to JSON',
    description: 'Convert natural language prompts to structured JSON using AI',
    category: 'AI Tools',
    icon: 'Wand2',
    path: '/tools/prompt-to-json-tool',
    featured: true,
    tags: ['ai', 'json', 'conversion', 'prompt']
  },
  {
    id: 'ai-image-generator',
    name: 'AI Image Generator',
    description: 'Generate images from text descriptions using AI',
    category: 'AI Tools',
    icon: 'Image',
    path: '/tools/ai-image-generator',
    tags: ['ai', 'image', 'generate', 'art', 'dalle']
  },
  {
    id: 'ai-translation',
    name: 'AI Translation',
    description: 'Translate text between languages with AI-powered accuracy',
    category: 'AI Tools',
    icon: 'Languages',
    path: '/tools/ai-translation',
    tags: ['ai', 'translation', 'language', 'multilingual']
  },
  {
    id: 'ai-code-generator',
    name: 'AI Code Generator',
    description: 'Generate code snippets and functions from natural language descriptions',
    category: 'AI Tools',
    icon: 'Code',
    path: '/tools/ai-code-generator',
    tags: ['ai', 'code', 'generate', 'programming', 'developer']
  },
  {
    id: 'ai-chat-assistant',
    name: 'AI Chat Assistant',
    description: 'Chat with AI assistant for help with various tasks and questions',
    category: 'AI Tools',
    icon: 'MessageCircle',
    path: '/tools/ai-chat-assistant',
    tags: ['ai', 'chat', 'assistant', 'help', 'conversation']
  },
  {
    id: 'ai-data-analyzer',
    name: 'AI Data Analyzer',
    description: 'Analyze datasets and generate insights using AI',
    category: 'AI Tools',
    icon: 'BarChart3',
    path: '/tools/ai-data-analyzer',
    tags: ['ai', 'data', 'analysis', 'insights', 'analytics']
  },
  {
    id: 'ai-email-writer',
    name: 'AI Email Writer',
    description: 'Write professional emails using AI with customizable tone and purpose',
    category: 'AI Tools',
    icon: 'Mail',
    path: '/tools/ai-email-writer',
    tags: ['ai', 'email', 'writing', 'communication', 'professional']
  },
  
  // Validators
  {
    id: 'email-validator',
    name: 'Email Validator',
    description: 'Validate email addresses with MX record verification',
    category: 'Validators',
    icon: 'Mail',
    path: '/tools/email-validator',
    featured: true,
    tags: ['email', 'validation', 'mx']
  },
  {
    id: 'credit-card-validator',
    name: 'Credit Card Validator',
    description: 'Validate credit card numbers using Luhn algorithm',
    category: 'Validators',
    icon: 'CreditCard',
    path: '/tools/credit-card-validator',
    featured: true,
    tags: ['credit-card', 'validation', 'luhn']
  },
  {
    id: 'phone-number-validator',
    name: 'Phone Number Validator',
    description: 'Validate phone numbers from different countries',
    category: 'Validators',
    icon: 'Phone',
    path: '/tools/phone-number-validator',
    tags: ['phone', 'validation', 'number']
  },
  {
    id: 'url-validator',
    name: 'URL Validator',
    description: 'Validate and normalize URLs with format checking',
    category: 'Validators',
    icon: 'Link',
    path: '/tools/url-validator',
    tags: ['url', 'validation', 'format', 'normalize']
  },
  {
    id: 'iban-validator',
    name: 'IBAN Validator',
    description: 'Validate International Bank Account Numbers (IBAN)',
    category: 'Validators',
    icon: 'CreditCard',
    path: '/tools/iban-validator',
    tags: ['iban', 'bank', 'validation', 'account']
  },
  {
    id: 'vat-validator',
    name: 'VAT Number Validator',
    description: 'Validate VAT numbers for EU countries',
    category: 'Validators',
    icon: 'Tag',
    path: '/tools/vat-validator',
    tags: ['vat', 'tax', 'validation', 'eu']
  },
  {
    id: 'uuid-validator',
    name: 'UUID Validator',
    description: 'Validate and generate UUIDs (Universally Unique Identifiers)',
    category: 'Validators',
    icon: 'Fingerprint',
    path: '/tools/uuid-validator',
    tags: ['uuid', 'validation', 'identifier', 'generate']
  },
  
  // Converters
  {
    id: 'currency-converter',
    name: 'Currency Converter',
    description: 'Convert currencies with real-time exchange rates',
    category: 'Converters',
    icon: 'DollarSign',
    path: '/tools/currency-converter',
    featured: true,
    tags: ['currency', 'converter', 'exchange']
  },
  {
    id: 'length-converter',
    name: 'Length Converter',
    description: 'Convert between different length units',
    category: 'Converters',
    icon: 'Ruler',
    path: '/tools/length-converter',
    tags: ['length', 'converter', 'units']
  },
  {
    id: 'weight-converter',
    name: 'Weight Converter',
    description: 'Convert between different weight units',
    category: 'Converters',
    icon: 'Weight',
    path: '/tools/weight-converter',
    tags: ['weight', 'converter', 'units']
  },
  {
    id: 'temperature-converter',
    name: 'Temperature Converter',
    description: 'Convert between temperature units',
    category: 'Converters',
    icon: 'Thermometer',
    path: '/tools/temperature-converter',
    tags: ['temperature', 'converter', 'units']
  },
  {
    id: 'distance-converter',
    name: 'Distance Converter',
    description: 'Convert between different distance units',
    category: 'Converters',
    icon: 'Ruler',
    path: '/tools/distance-converter',
    tags: ['distance', 'converter', 'units']
  },
  {
    id: 'data-size-converter',
    name: 'Data Size Converter',
    description: 'Convert between different data size units',
    category: 'Converters',
    icon: 'Database',
    path: '/tools/data-size-converter',
    tags: ['data', 'size', 'converter', 'bytes']
  },
  {
    id: 'time-zone-converter',
    name: 'Time Zone Converter',
    description: 'Convert time between different time zones',
    category: 'Converters',
    icon: 'Clock',
    path: '/tools/time-zone-converter',
    tags: ['time', 'zone', 'converter']
  },
  {
    id: 'unit-converter',
    name: 'Unit Converter',
    description: 'Convert between various measurement units',
    category: 'Converters',
    icon: 'Ruler',
    path: '/tools/unit-converter',
    tags: ['unit', 'converter', 'measurement']
  },
  {
    id: 'unit-converter-advanced',
    name: 'Advanced Unit Converter',
    description: 'Advanced unit converter with custom categories',
    category: 'Converters',
    icon: 'Ruler',
    path: '/tools/unit-converter-advanced',
    tags: ['unit', 'converter', 'advanced']
  },
  
  // Text Tools
  {
    id: 'text-case-converter',
    name: 'Text Case Converter',
    description: 'Convert text between different cases',
    category: 'Text Tools',
    icon: 'Type',
    path: '/tools/text-case-converter',
    tags: ['text', 'case', 'converter']
  },
  {
    id: 'word-counter',
    name: 'Word Counter',
    description: 'Count words, characters, and lines in text',
    category: 'Text Tools',
    icon: 'Hash',
    path: '/tools/word-counter',
    tags: ['text', 'count', 'words']
  },
  {
    id: 'word-counter-tool',
    name: 'Word Counter Tool',
    description: 'Advanced word counter with statistics',
    category: 'Text Tools',
    icon: 'Hash',
    path: '/tools/word-counter-tool',
    tags: ['text', 'count', 'words', 'statistics']
  },
  {
    id: 'text-diff-tool',
    name: 'Text Diff Tool',
    description: 'Advanced text comparison tool with highlighting',
    category: 'Text Tools',
    icon: 'GitCompare',
    path: '/tools/text-diff-tool',
    tags: ['text', 'compare', 'diff', 'highlighting']
  },
  {
    id: 'character-counter',
    name: 'Character Counter',
    description: 'Count characters in text',
    category: 'Text Tools',
    icon: 'Hash',
    path: '/tools/character-counter',
    tags: ['text', 'count', 'characters']
  },
  {
    id: 'character-counter-tool',
    name: 'Character Counter Tool',
    description: 'Advanced character counter with analysis',
    category: 'Text Tools',
    icon: 'Hash',
    path: '/tools/character-counter-tool',
    tags: ['text', 'count', 'characters', 'analysis']
  },
  {
    id: 'line-counter',
    name: 'Line Counter',
    description: 'Count lines in text',
    category: 'Text Tools',
    icon: 'AlignLeft',
    path: '/tools/line-counter',
    tags: ['text', 'count', 'lines']
  },
  {
    id: 'paragraph-counter',
    name: 'Paragraph Counter',
    description: 'Count paragraphs in text',
    category: 'Text Tools',
    icon: 'AlignLeft',
    path: '/tools/paragraph-counter',
    tags: ['text', 'count', 'paragraphs']
  },
  {
    id: 'sentence-counter',
    name: 'Sentence Counter',
    description: 'Count sentences in text',
    category: 'Text Tools',
    icon: 'AlignLeft',
    path: '/tools/sentence-counter',
    tags: ['text', 'count', 'sentences']
  },
  {
    id: 'syllable-counter',
    name: 'Syllable Counter',
    description: 'Count syllables in words',
    category: 'Text Tools',
    icon: 'AlignLeft',
    path: '/tools/syllable-counter',
    tags: ['text', 'count', 'syllables']
  },
  {
    id: 'text-repeater',
    name: 'Text Repeater',
    description: 'Repeat text multiple times',
    category: 'Text Tools',
    icon: 'Copy',
    path: '/tools/text-repeater',
    tags: ['text', 'repeat', 'generator']
  },
  {
    id: 'text-reverser',
    name: 'Text Reverser',
    description: 'Reverse text strings',
    category: 'Text Tools',
    icon: 'RotateCcw',
    path: '/tools/text-reverser',
    tags: ['text', 'reverse', 'string']
  },
  {
    id: 'text-trimmer',
    name: 'Text Trimmer',
    description: 'Remove whitespace from text',
    category: 'Text Tools',
    icon: 'Scissors',
    path: '/tools/text-trimmer',
    tags: ['text', 'trim', 'whitespace']
  },
  {
    id: 'text-to-uppercase',
    name: 'Text to Uppercase',
    description: 'Convert text to uppercase',
    category: 'Text Tools',
    icon: 'Type',
    path: '/tools/text-to-uppercase',
    tags: ['text', 'uppercase', 'convert']
  },
  {
    id: 'text-to-lowercase',
    name: 'Text to Lowercase',
    description: 'Convert text to lowercase',
    category: 'Text Tools',
    icon: 'Type',
    path: '/tools/text-to-lowercase',
    tags: ['text', 'lowercase', 'convert']
  },
  {
    id: 'text-to-titlecase',
    name: 'Text to Title Case',
    description: 'Convert text to title case',
    category: 'Text Tools',
    icon: 'Type',
    path: '/tools/text-to-titlecase',
    tags: ['text', 'titlecase', 'convert']
  },
  {
    id: 'text-to-camelcase',
    name: 'Text to Camel Case',
    description: 'Convert text to camel case',
    category: 'Text Tools',
    icon: 'Type',
    path: '/tools/text-to-camelcase',
    tags: ['text', 'camelcase', 'convert']
  },
  {
    id: 'text-to-snakecase',
    name: 'Text to Snake Case',
    description: 'Convert text to snake case',
    category: 'Text Tools',
    icon: 'Type',
    path: '/tools/text-to-snakecase',
    tags: ['text', 'snakecase', 'convert']
  },
  {
    id: 'text-to-kebabcase',
    name: 'Text to Kebab Case',
    description: 'Convert text to kebab case',
    category: 'Text Tools',
    icon: 'Type',
    path: '/tools/text-to-kebabcase',
    tags: ['text', 'kebabcase', 'convert']
  },
  {
    id: 'case-converter',
    name: 'Case Converter',
    description: 'Convert text between different cases',
    category: 'Text Tools',
    icon: 'Type',
    path: '/tools/case-converter',
    tags: ['text', 'case', 'converter']
  },
  {
    id: 'case-converter-tool',
    name: 'Case Converter Tool',
    description: 'Advanced case converter with multiple formats',
    category: 'Text Tools',
    icon: 'Type',
    path: '/tools/case-converter-tool',
    tags: ['text', 'case', 'converter', 'formats']
  },
  {
    id: 'text-replacer-tool',
    name: 'Text Replacer Tool',
    description: 'Replace text patterns with advanced options',
    category: 'Text Tools',
    icon: 'Replace',
    path: '/tools/text-replacer-tool',
    tags: ['text', 'replace', 'patterns']
  },
  {
    id: 'text-statistics-analyzer',
    name: 'Text Statistics Analyzer',
    description: 'Analyze text statistics and readability',
    category: 'Text Tools',
    icon: 'BarChart',
    path: '/tools/text-statistics-analyzer',
    tags: ['text', 'statistics', 'analysis', 'readability']
  },
  {
    id: 'text-complexity',
    name: 'Text Complexity Analyzer',
    description: 'Analyze text complexity and readability',
    category: 'Text Tools',
    icon: 'BarChart',
    path: '/tools/text-complexity',
    tags: ['text', 'complexity', 'analysis', 'readability']
  },
  {
    id: 'text-entropy',
    name: 'Text Entropy Calculator',
    description: 'Calculate entropy and information content of text',
    category: 'Text Tools',
    icon: 'BarChart',
    path: '/tools/text-entropy',
    tags: ['text', 'entropy', 'information', 'analysis']
  },
  {
    id: 'text-clustering',
    name: 'Text Clustering Tool',
    description: 'Cluster similar texts together',
    category: 'Text Tools',
    icon: 'GitBranch',
    path: '/tools/text-clustering',
    tags: ['text', 'clustering', 'similarity', 'analysis']
  },
  {
    id: 'text-to-speech',
    name: 'Text to Speech',
    description: 'Convert text to speech audio',
    category: 'Text Tools',
    icon: 'Volume2',
    path: '/tools/text-to-speech',
    tags: ['text', 'speech', 'audio', 'conversion']
  },
  {
    id: 'speech-to-text',
    name: 'Speech to Text',
    description: 'Convert speech audio to text',
    category: 'Text Tools',
    icon: 'Mic',
    path: '/tools/speech-to-text',
    tags: ['speech', 'text', 'audio', 'conversion']
  },
  {
    id: 'text-to-binary',
    name: 'Text to Binary',
    description: 'Convert text to binary code',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-binary',
    tags: ['text', 'binary', 'conversion']
  },
  {
    id: 'text-to-morse',
    name: 'Text to Morse Code',
    description: 'Convert text to Morse code',
    category: 'Text Tools',
    icon: 'Radio',
    path: '/tools/text-to-morse',
    tags: ['text', 'morse', 'code', 'conversion']
  },
  {
    id: 'text-to-leet',
    name: 'Text to Leet Speak',
    description: 'Convert text to leet speak',
    category: 'Text Tools',
    icon: 'Code',
    path: '/tools/text-to-leet',
    tags: ['text', 'leet', 'speak', 'conversion']
  },
  {
    id: 'text-to-ascii-art-generator',
    name: 'Text to ASCII Art Generator',
    description: 'Generate ASCII art from text',
    category: 'Text Tools',
    icon: 'Type',
    path: '/tools/text-to-ascii-art-generator',
    tags: ['text', 'ascii', 'art', 'generator']
  },
  {
    id: 'lorem-ipsum',
    name: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text',
    category: 'Text Tools',
    icon: 'FileText',
    path: '/tools/lorem-ipsum',
    tags: ['text', 'placeholder', 'generator']
  },
  {
    id: 'lorem-ipsum-generator-tool',
    name: 'Lorem Ipsum Generator Tool',
    description: 'Advanced Lorem ipsum generator with options',
    category: 'Text Tools',
    icon: 'FileText',
    path: '/tools/lorem-ipsum-generator-tool',
    tags: ['text', 'placeholder', 'generator', 'options']
  },
  {
    id: 'readability-score',
    name: 'Readability Score Calculator',
    description: 'Calculate readability scores for text',
    category: 'Text Tools',
    icon: 'BarChart',
    path: '/tools/readability-score',
    tags: ['text', 'readability', 'score', 'analysis']
  },
  {
    id: 'sentiment-analyzer',
    name: 'Sentiment Analyzer',
    description: 'Analyze sentiment of text',
    category: 'Text Tools',
    icon: 'Smile',
    path: '/tools/sentiment-analyzer',
    tags: ['text', 'sentiment', 'analysis', 'ai']
  },
  {
    id: 'keyword-extractor',
    name: 'Keyword Extractor',
    description: 'Extract keywords from text',
    category: 'Text Tools',
    icon: 'Search',
    path: '/tools/keyword-extractor',
    tags: ['text', 'keyword', 'extract', 'analysis']
  },
  {
    id: 'keyword-density',
    name: 'Keyword Density Analyzer',
    description: 'Analyze keyword density in text',
    category: 'Text Tools',
    icon: 'Search',
    path: '/tools/keyword-density',
    tags: ['text', 'keyword', 'density', 'analysis']
  },
  {
    id: 'keyword-density-analyzer',
    name: 'Keyword Density Analyzer Tool',
    description: 'Advanced keyword density analysis',
    category: 'Text Tools',
    icon: 'Search',
    path: '/tools/keyword-density-analyzer',
    tags: ['text', 'keyword', 'density', 'analysis']
  },
  {
    id: 'word-frequency',
    name: 'Word Frequency Analyzer',
    description: 'Analyze word frequency in text',
    category: 'Text Tools',
    icon: 'BarChart',
    path: '/tools/word-frequency',
    tags: ['text', 'word', 'frequency', 'analysis']
  },
  {
    id: 'text-summarizer',
    name: 'Text Summarizer',
    description: 'Summarize long texts',
    category: 'Text Tools',
    icon: 'FileText',
    path: '/tools/text-summarizer',
    tags: ['text', 'summarize', 'summary']
  },
  {
    id: 'paraphraser',
    name: 'Paraphraser Tool',
    description: 'Paraphrase text with AI',
    category: 'Text Tools',
    icon: 'RefreshCw',
    path: '/tools/paraphraser',
    tags: ['text', 'paraphrase', 'ai', 'rewriting']
  },
  {
    id: 'article-rewriter',
    name: 'Article Rewriter',
    description: 'Rewrite articles with AI',
    category: 'Text Tools',
    icon: 'RefreshCw',
    path: '/tools/article-rewriter',
    tags: ['text', 'article', 'rewrite', 'ai']
  },
  {
    id: 'grammar-checker',
    name: 'Grammar Checker',
    description: 'Check grammar and spelling',
    category: 'Text Tools',
    icon: 'CheckCircle',
    path: '/tools/grammar-checker',
    tags: ['text', 'grammar', 'spelling', 'check']
  },
  {
    id: 'plagiarism-checker',
    name: 'Plagiarism Checker',
    description: 'Check for plagiarism in text',
    category: 'Text Tools',
    icon: 'Shield',
    path: '/tools/plagiarism-checker',
    tags: ['text', 'plagiarism', 'check', 'originality']
  },
  {
    id: 'text-summarizer-advanced',
    name: 'Advanced Text Summarizer',
    description: 'Summarize long texts with advanced AI algorithms and customizable length',
    category: 'Text Tools',
    icon: 'FileText',
    path: '/tools/text-summarizer-advanced',
    tags: ['text', 'summarizer', 'ai', 'advanced', 'length']
  },
  {
    id: 'text-paraphraser',
    name: 'Text Paraphraser',
    description: 'Paraphrase text while maintaining meaning and improving readability',
    category: 'Text Tools',
    icon: 'RefreshCw',
    path: '/tools/text-paraphraser',
    tags: ['text', 'paraphrase', 'rewrite', 'readability']
  },
  {
    id: 'text-simplifier',
    name: 'Text Simplifier',
    description: 'Simplify complex text for easier understanding and readability',
    category: 'Text Tools',
    icon: 'AlignLeft',
    path: '/tools/text-simplifier',
    tags: ['text', 'simplify', 'readability', 'complexity']
  },
  {
    id: 'text-expander',
    name: 'Text Expander',
    description: 'Expand abbreviated text and acronyms to full form',
    category: 'Text Tools',
    icon: 'Maximize',
    path: '/tools/text-expander',
    tags: ['text', 'expand', 'acronyms', 'abbreviations']
  },
  {
    id: 'text-template-generator',
    name: 'Text Template Generator',
    description: 'Generate text templates for emails, documents, and communications',
    category: 'Text Tools',
    icon: 'FileText',
    path: '/tools/text-template-generator',
    tags: ['text', 'template', 'generate', 'documents']
  },
  {
    id: 'text-style-analyzer',
    name: 'Text Style Analyzer',
    description: 'Analyze writing style, tone, and readability metrics',
    category: 'Text Tools',
    icon: 'BarChart',
    path: '/tools/text-style-analyzer',
    tags: ['text', 'style', 'analyze', 'tone', 'readability']
  },
  {
    id: 'text-diff-advanced',
    name: 'Advanced Text Diff',
    description: 'Compare texts with advanced diff algorithms and merge suggestions',
    category: 'Text Tools',
    icon: 'GitCompare',
    path: '/tools/text-diff-advanced',
    tags: ['text', 'diff', 'compare', 'merge', 'advanced']
  },
  {
    id: 'text-format-validator',
    name: 'Text Format Validator',
    description: 'Validate text format against style guides and writing standards',
    category: 'Text Tools',
    icon: 'CheckCircle',
    path: '/tools/text-format-validator',
    tags: ['text', 'format', 'validate', 'style', 'standards']
  },
  {
    id: 'text-locale-converter',
    name: 'Text Locale Converter',
    description: 'Convert text between different locales and regional formats',
    category: 'Text Tools',
    icon: 'Globe',
    path: '/tools/text-locale-converter',
    tags: ['text', 'locale', 'regional', 'format', 'international']
  },
  {
    id: 'text-emotion-detector',
    name: 'Text Emotion Detector',
    description: 'Detect emotions and sentiment in text using AI analysis',
    category: 'Text Tools',
    icon: 'Smile',
    path: '/tools/text-emotion-detector',
    tags: ['text', 'emotion', 'sentiment', 'ai', 'analysis']
  },
  {
    id: 'text-keyword-extractor',
    name: 'Text Keyword Extractor',
    description: 'Extract keywords and important phrases from text documents',
    category: 'Text Tools',
    icon: 'Search',
    path: '/tools/text-keyword-extractor',
    tags: ['text', 'keyword', 'extract', 'phrases', 'analysis']
  },
  {
    id: 'text-outline-generator',
    name: 'Text Outline Generator',
    description: 'Generate structured outlines from long text documents and articles',
    category: 'Text Tools',
    icon: 'ListOrdered',
    path: '/tools/text-outline-generator',
    tags: ['text', 'outline', 'structure', 'organize', 'documents']
  },
  {
    id: 'text-citation-generator',
    name: 'Text Citation Generator',
    description: 'Generate citations and bibliographies in various academic styles',
    category: 'Text Tools',
    icon: 'Book',
    path: '/tools/text-citation-generator',
    tags: ['text', 'citation', 'bibliography', 'academic', 'styles']
  },
  {
    id: 'text-translation-advanced',
    name: 'Advanced Text Translation',
    description: 'Translate text with context awareness and multiple language support',
    category: 'Text Tools',
    icon: 'Languages',
    path: '/tools/text-translation-advanced',
    tags: ['text', 'translation', 'language', 'advanced', 'context']
  },
  {
    id: 'text-audio-converter',
    name: 'Text to Audio Converter',
    description: 'Convert text to natural-sounding audio with multiple voice options',
    category: 'Text Tools',
    icon: 'Volume2',
    path: '/tools/text-audio-converter',
    tags: ['text', 'audio', 'speech', 'voice', 'conversion']
  },
  {
    id: 'text-handwriting-generator',
    name: 'Text Handwriting Generator',
    description: 'Generate handwriting-style text images from digital text',
    category: 'Text Tools',
    icon: 'Edit',
    path: '/tools/text-handwriting-generator',
    tags: ['text', 'handwriting', 'generate', 'image', 'style']
  },
  {
    id: 'text-watermarker',
    name: 'Text Watermarker',
    description: 'Add invisible and visible watermarks to text documents',
    category: 'Text Tools',
    icon: 'Shield',
    path: '/tools/text-watermarker',
    tags: ['text', 'watermark', 'protect', 'security', 'copyright']
  },
  {
    id: 'text-compression-tool',
    name: 'Text Compression Tool',
    description: 'Compress text files while preserving readability and quality',
    category: 'Text Tools',
    icon: 'Minimize2',
    path: '/tools/text-compression-tool',
    tags: ['text', 'compression', 'size', 'optimize', 'quality']
  },
  {
    id: 'text-normalizer',
    name: 'Text Normalizer',
    description: 'Normalize text by removing special characters and standardizing format',
    category: 'Text Tools',
    icon: 'AlignLeft',
    path: '/tools/text-normalizer',
    tags: ['text', 'normalize', 'standardize', 'format', 'clean']
  },
  {
    id: 'text-segmenter',
    name: 'Text Segmenter',
    description: 'Segment text into logical sections, chapters, and topics',
    category: 'Text Tools',
    icon: 'Scissors',
    path: '/tools/text-segmenter',
    tags: ['text', 'segment', 'section', 'organize', 'structure']
  },
  {
    id: 'text-persona-generator',
    name: 'Text Persona Generator',
    description: 'Generate text in different personas and writing styles',
    category: 'Text Tools',
    icon: 'User',
    path: '/tools/text-persona-generator',
    tags: ['text', 'persona', 'style', 'generate', 'creative']
  },
  {
    id: 'text-consistency-checker',
    name: 'Text Consistency Checker',
    description: 'Check text for consistent terminology, formatting, and style',
    category: 'Text Tools',
    icon: 'CheckCircle',
    path: '/tools/text-consistency-checker',
    tags: ['text', 'consistency', 'terminology', 'formatting', 'style']
  },
  {
    id: 'text-localization-tool',
    name: 'Text Localization Tool',
    description: 'Adapt text for different regions, cultures, and languages',
    category: 'Text Tools',
    icon: 'Globe',
    path: '/tools/text-localization-tool',
    tags: ['text', 'localization', 'cultural', 'regional', 'adapt']
  },
  {
    id: 'text-version-control',
    name: 'Text Version Control',
    description: 'Track changes and manage versions of text documents',
    category: 'Text Tools',
    icon: 'GitBranch',
    path: '/tools/text-version-control',
    tags: ['text', 'version', 'control', 'changes', 'tracking']
  },
  {
    id: 'text-collaboration-tool',
    name: 'Text Collaboration Tool',
    description: 'Real-time text editing and collaboration features',
    category: 'Text Tools',
    icon: 'Users',
    path: '/tools/text-collaboration-tool',
    tags: ['text', 'collaboration', 'real-time', 'editing', 'team']
  },
  {
    id: 'text-accessibility-checker',
    name: 'Text Accessibility Checker',
    description: 'Check text for accessibility compliance and readability standards',
    category: 'Text Tools',
    icon: 'Shield',
    path: '/tools/text-accessibility-checker',
    tags: ['text', 'accessibility', 'compliance', 'readability', 'standards']
  },
  {
    id: 'text-performance-analyzer',
    name: 'Text Performance Analyzer',
    description: 'Analyze text performance metrics including engagement and readability',
    category: 'Text Tools',
    icon: 'TrendingUp',
    path: '/tools/text-performance-analyzer',
    tags: ['text', 'performance', 'metrics', 'engagement', 'analysis']
  },
  {
    id: 'text-ai-enhancer',
    name: 'Text AI Enhancer',
    description: 'Enhance text quality using AI-powered suggestions and improvements',
    category: 'Text Tools',
    icon: 'Wand2',
    path: '/tools/text-ai-enhancer',
    tags: ['text', 'ai', 'enhance', 'improve', 'quality', 'suggestions']
  },
  
  // Encoding/Decoding Tools
  {
    id: 'base64-encoder',
    name: 'Base64 Encoder',
    description: 'Encode text to Base64',
    category: 'Encoding/Decoding',
    icon: 'Lock',
    path: '/tools/base64-encoder',
    tags: ['base64', 'encode', 'text']
  },
  {
    id: 'base64-encoder-decoder',
    name: 'Base64 Encoder/Decoder',
    description: 'Encode and decode Base64 text',
    category: 'Encoding/Decoding',
    icon: 'Lock',
    path: '/tools/base64-encoder-decoder',
    tags: ['base64', 'encode', 'decode', 'text']
  },
  {
    id: 'base64-encoder-decoder-tool',
    name: 'Base64 Encoder/Decoder Tool',
    description: 'Advanced Base64 encoding and decoding',
    category: 'Encoding/Decoding',
    icon: 'Lock',
    path: '/tools/base64-encoder-decoder-tool',
    tags: ['base64', 'encode', 'decode', 'text', 'advanced']
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder',
    description: 'Encode URLs for web use',
    category: 'Encoding/Decoding',
    icon: 'Link',
    path: '/tools/url-encoder',
    tags: ['url', 'encode', 'web']
  },
  {
    id: 'url-encoder-decoder',
    name: 'URL Encoder/Decoder',
    description: 'Encode and decode URLs',
    category: 'Encoding/Decoding',
    icon: 'Link',
    path: '/tools/url-encoder-decoder',
    tags: ['url', 'encode', 'decode', 'web']
  },
  {
    id: 'url-encoder-decoder-tool',
    name: 'URL Encoder/Decoder Tool',
    description: 'Advanced URL encoding and decoding',
    category: 'Encoding/Decoding',
    icon: 'Link',
    path: '/tools/url-encoder-decoder-tool',
    tags: ['url', 'encode', 'decode', 'web', 'advanced']
  },
  {
    id: 'html-entity-encoder',
    name: 'HTML Entity Encoder',
    description: 'Encode HTML entities',
    category: 'Encoding/Decoding',
    icon: 'Code',
    path: '/tools/html-entity-encoder',
    tags: ['html', 'entity', 'encode', 'web']
  },
  {
    id: 'html-entity-encoder-decoder-tool',
    name: 'HTML Entity Encoder/Decoder Tool',
    description: 'Encode and decode HTML entities',
    category: 'Encoding/Decoding',
    icon: 'Code',
    path: '/tools/html-entity-encoder-decoder-tool',
    tags: ['html', 'entity', 'encode', 'decode', 'web']
  },
  {
    id: 'punycode-converter-tool',
    name: 'Punycode Converter',
    description: 'Convert between Unicode and Punycode',
    category: 'Encoding/Decoding',
    icon: 'Globe',
    path: '/tools/punycode-converter-tool',
    tags: ['punycode', 'unicode', 'convert', 'domain']
  },
  {
    id: 'rot13-cipher-tool',
    name: 'ROT13 Cipher',
    description: 'Encode and decode text with ROT13',
    category: 'Encoding/Decoding',
    icon: 'RotateCw',
    path: '/tools/rot13-cipher-tool',
    tags: ['rot13', 'cipher', 'encode', 'decode', 'text']
  },
  {
    id: 'morse-code-converter-tool',
    name: 'Morse Code Converter',
    description: 'Convert text to and from Morse code',
    category: 'Encoding/Decoding',
    icon: 'Radio',
    path: '/tools/morse-code-converter-tool',
    tags: ['morse', 'code', 'convert', 'text']
  },
  {
    id: 'binary-converter',
    name: 'Binary Converter',
    description: 'Convert text to binary and vice versa',
    category: 'Encoding/Decoding',
    icon: 'Binary',
    path: '/tools/binary-converter',
    tags: ['binary', 'convert', 'text', 'number']
  },
  {
    id: 'hex-to-rgb',
    name: 'Hex to RGB Converter',
    description: 'Convert hex colors to RGB values',
    category: 'Encoding/Decoding',
    icon: 'Palette',
    path: '/tools/hex-to-rgb',
    tags: ['hex', 'rgb', 'color', 'convert']
  },
  {
    id: 'rgb-hex-converter',
    name: 'RGB to Hex Converter',
    description: 'Convert RGB values to hex colors',
    category: 'Encoding/Decoding',
    icon: 'Palette',
    path: '/tools/rgb-hex-converter',
    tags: ['rgb', 'hex', 'color', 'convert']
  },
  {
    id: 'number-base-converter',
    name: 'Number Base Converter',
    description: 'Convert between different number bases',
    category: 'Encoding/Decoding',
    icon: 'Hash',
    path: '/tools/number-base-converter',
    tags: ['number', 'base', 'convert', 'math']
  },
  
  // Generator Tools
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate UUIDs',
    category: 'Generators',
    icon: 'Fingerprint',
    path: '/tools/uuid-generator',
    tags: ['uuid', 'generate', 'identifier']
  },
  {
    id: 'uuid-generator-tool',
    name: 'UUID Generator Tool',
    description: 'Advanced UUID generator with options',
    category: 'Generators',
    icon: 'Fingerprint',
    path: '/tools/uuid-generator-tool',
    tags: ['uuid', 'generate', 'identifier', 'options']
  },
  {
    id: 'slug-generator',
    name: 'Slug Generator',
    description: 'Generate URL-friendly slugs',
    category: 'Generators',
    icon: 'Link',
    path: '/tools/slug-generator',
    tags: ['slug', 'generate', 'url', 'seo']
  },
  {
    id: 'slug-generator-tool',
    name: 'Slug Generator Tool',
    description: 'Advanced slug generator with options',
    category: 'Generators',
    icon: 'Link',
    path: '/tools/slug-generator-tool',
    tags: ['slug', 'generate', 'url', 'seo', 'options']
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate secure passwords',
    category: 'Generators',
    icon: 'Key',
    path: '/tools/password-generator',
    tags: ['password', 'generate', 'security']
  },
  {
    id: 'password-generator-tool',
    name: 'Password Generator Tool',
    description: 'Advanced password generator with options',
    category: 'Generators',
    icon: 'Key',
    path: '/tools/password-generator-tool',
    tags: ['password', 'generate', 'security', 'options']
  },
  {
    id: 'random-number-generator',
    name: 'Random Number Generator',
    description: 'Generate random numbers',
    category: 'Generators',
    icon: 'Dice1',
    path: '/tools/random-number-generator',
    tags: ['random', 'number', 'generate', 'math']
  },
  {
    id: 'random-number-generator-tool',
    name: 'Random Number Generator Tool',
    description: 'Advanced random number generator with options',
    category: 'Generators',
    icon: 'Dice1',
    path: '/tools/random-number-generator-tool',
    tags: ['random', 'number', 'generate', 'math', 'options']
  },
  {
    id: 'random-generator',
    name: 'Random Generator',
    description: 'Generate random data',
    category: 'Generators',
    icon: 'Shuffle',
    path: '/tools/random-generator',
    tags: ['random', 'generate', 'data']
  },
  {
    id: 'qr-code-generator',
    name: 'QR Code Generator',
    description: 'Generate QR codes',
    category: 'Generators',
    icon: 'QrCode',
    path: '/tools/qr-code-generator',
    tags: ['qr', 'code', 'generate', 'barcode']
  },
  {
    id: 'qr-code-generator-tool',
    name: 'QR Code Generator Tool',
    description: 'Advanced QR code generator with options',
    category: 'Generators',
    icon: 'QrCode',
    path: '/tools/qr-code-generator-tool',
    tags: ['qr', 'code', 'generate', 'barcode', 'options']
  },
  {
    id: 'barcode-generator',
    name: 'Barcode Generator',
    description: 'Generate barcodes',
    category: 'Generators',
    icon: 'Barcode',
    path: '/tools/barcode-generator',
    tags: ['barcode', 'generate', 'product']
  },
  {
    id: 'lorem-ipsum-generator',
    name: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text',
    category: 'Generators',
    icon: 'FileText',
    path: '/tools/lorem-ipsum-generator',
    tags: ['lorem', 'ipsum', 'text', 'placeholder']
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate hash values',
    category: 'Generators',
    icon: 'Hash',
    path: '/tools/hash-generator',
    tags: ['hash', 'generate', 'security']
  },
  {
    id: 'md5-generator',
    name: 'MD5 Generator',
    description: 'Generate MD5 hashes',
    category: 'Generators',
    icon: 'Hash',
    path: '/tools/md5-generator',
    tags: ['md5', 'hash', 'generate', 'security']
  },
  {
    id: 'sha256-generator',
    name: 'SHA256 Generator',
    description: 'Generate SHA256 hashes',
    category: 'Generators',
    icon: 'Hash',
    path: '/tools/sha256-generator',
    tags: ['sha256', 'hash', 'generate', 'security']
  },
  {
    id: 'bcrypt-generator',
    name: 'BCrypt Generator',
    description: 'Generate BCrypt hashes',
    category: 'Generators',
    icon: 'Hash',
    path: '/tools/bcrypt-generator',
    tags: ['bcrypt', 'hash', 'generate', 'security']
  },
  {
    id: 'token-generator',
    name: 'Token Generator',
    description: 'Generate secure tokens',
    category: 'Generators',
    icon: 'Key',
    path: '/tools/token-generator',
    tags: ['token', 'generate', 'security']
  },
  {
    id: 'blog-title-generator',
    name: 'Blog Title Generator',
    description: 'Generate blog titles',
    category: 'Generators',
    icon: 'FileText',
    path: '/tools/blog-title-generator',
    tags: ['blog', 'title', 'generate', 'content']
  },
  {
    id: 'meta-description-generator',
    name: 'Meta Description Generator',
    description: 'Generate meta descriptions',
    category: 'Generators',
    icon: 'FileText',
    path: '/tools/meta-description-generator',
    tags: ['meta', 'description', 'generate', 'seo']
  },
  {
    id: 'hashtag-generator',
    name: 'Hashtag Generator',
    description: 'Generate relevant hashtags for social media posts',
    category: 'Generators',
    icon: 'Tag',
    path: '/tools/hashtag-generator',
    tags: ['hashtag', 'social', 'media', 'generate', 'marketing']
  },
  {
    id: 'username-generator',
    name: 'Username Generator',
    description: 'Generate creative and available usernames for various platforms',
    category: 'Generators',
    icon: 'User',
    path: '/tools/username-generator',
    tags: ['username', 'generate', 'creative', 'available']
  },
  {
    id: 'business-name-generator',
    name: 'Business Name Generator',
    description: 'Generate unique and catchy business names with domain availability',
    category: 'Generators',
    icon: 'Building',
    path: '/tools/business-name-generator',
    tags: ['business', 'name', 'generate', 'startup', 'domain']
  },
  {
    id: 'domain-name-generator',
    name: 'Domain Name Generator',
    description: 'Generate available domain names based on keywords and industry',
    category: 'Generators',
    icon: 'Globe',
    path: '/tools/domain-name-generator',
    tags: ['domain', 'name', 'generate', 'available', 'website']
  },
  {
    id: 'slogan-generator',
    name: 'Slogan Generator',
    description: 'Generate catchy slogans and taglines for businesses and products',
    category: 'Generators',
    icon: 'MessageCircle',
    path: '/tools/slogan-generator',
    tags: ['slogan', 'tagline', 'generate', 'marketing', 'business']
  },
  {
    id: 'password-generator-pro',
    name: 'Password Generator Pro',
    description: 'Generate strong passwords with advanced options and patterns',
    category: 'Generators',
    icon: 'Key',
    path: '/tools/password-generator-pro',
    tags: ['password', 'generate', 'security', 'advanced', 'patterns']
  },
  {
    id: 'coupon-code-generator',
    name: 'Coupon Code Generator',
    description: 'Generate unique coupon codes for discounts and promotions',
    category: 'Generators',
    icon: 'Tag',
    path: '/tools/coupon-code-generator',
    tags: ['coupon', 'code', 'generate', 'discount', 'promotion']
  },
  {
    id: 'invoice-number-generator',
    name: 'Invoice Number Generator',
    description: 'Generate sequential and formatted invoice numbers for businesses',
    category: 'Generators',
    icon: 'FileText',
    path: '/tools/invoice-number-generator',
    tags: ['invoice', 'number', 'generate', 'business', 'accounting']
  },
  {
    id: 'quote-generator',
    name: 'Quote Generator',
    description: 'Generate inspirational and motivational quotes on various topics',
    category: 'Generators',
    icon: 'MessageCircle',
    path: '/tools/quote-generator',
    tags: ['quote', 'generate', 'inspirational', 'motivational']
  },
  {
    id: 'poem-generator',
    name: 'Poem Generator',
    description: 'Generate poems in various styles and themes using AI',
    category: 'Generators',
    icon: 'FileText',
    path: '/tools/poem-generator',
    tags: ['poem', 'generate', 'creative', 'ai', 'literature']
  },
  {
    id: 'song-lyrics-generator',
    name: 'Song Lyrics Generator',
    description: 'Generate song lyrics in different genres and moods',
    category: 'Generators',
    icon: 'Music',
    path: '/tools/song-lyrics-generator',
    tags: ['song', 'lyrics', 'generate', 'music', 'creative']
  },
  {
    id: 'story-generator',
    name: 'Story Generator',
    description: 'Generate creative stories with plots, characters, and settings',
    category: 'Generators',
    icon: 'Book',
    path: '/tools/story-generator',
    tags: ['story', 'generate', 'creative', 'fiction', 'plot']
  },
  {
    id: 'character-name-generator',
    name: 'Character Name Generator',
    description: 'Generate character names for novels, games, and stories',
    category: 'Generators',
    icon: 'User',
    path: '/tools/character-name-generator',
    tags: ['character', 'name', 'generate', 'fiction', 'fantasy']
  },
  {
    id: 'team-name-generator',
    name: 'Team Name Generator',
    description: 'Generate creative team names for sports, games, and projects',
    category: 'Generators',
    icon: 'Users',
    path: '/tools/team-name-generator',
    tags: ['team', 'name', 'generate', 'sports', 'games']
  },
  {
    id: 'project-name-generator',
    name: 'Project Name Generator',
    description: 'Generate project names for coding, research, and creative projects',
    category: 'Generators',
    icon: 'Folder',
    path: '/tools/project-name-generator',
    tags: ['project', 'name', 'generate', 'coding', 'research']
  },
  {
    id: 'event-name-generator',
    name: 'Event Name Generator',
    description: 'Generate catchy names for conferences, meetups, and special events',
    category: 'Generators',
    icon: 'Calendar',
    path: '/tools/event-name-generator',
    tags: ['event', 'name', 'generate', 'conference', 'meetup']
  },
  {
    id: 'recipe-generator',
    name: 'Recipe Generator',
    description: 'Generate recipes based on ingredients, cuisine, and dietary preferences',
    category: 'Generators',
    icon: 'ChefHat',
    path: '/tools/recipe-generator',
    tags: ['recipe', 'generate', 'cooking', 'food', 'ingredients']
  },
  {
    id: 'workout-plan-generator',
    name: 'Workout Plan Generator',
    description: 'Generate personalized workout plans based on fitness goals and equipment',
    category: 'Generators',
    icon: 'Dumbbell',
    path: '/tools/workout-plan-generator',
    tags: ['workout', 'plan', 'generate', 'fitness', 'exercise']
  },
  {
    id: 'meal-plan-generator',
    name: 'Meal Plan Generator',
    description: 'Generate personalized meal plans based on dietary needs and preferences',
    category: 'Generators',
    icon: 'Apple',
    path: '/tools/meal-plan-generator',
    tags: ['meal', 'plan', 'generate', 'nutrition', 'diet']
  },
  {
    id: 'travel-itinerary-generator',
    name: 'Travel Itinerary Generator',
    description: 'Generate travel itineraries based on destination, duration, and interests',
    category: 'Generators',
    icon: 'Map',
    path: '/tools/travel-itinerary-generator',
    tags: ['travel', 'itinerary', 'generate', 'vacation', 'planning']
  },
  
  // JSON Tools
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format and validate JSON',
    category: 'JSON Tools',
    icon: 'Braces',
    path: '/tools/json-formatter',
    tags: ['json', 'format', 'validate', 'beautify']
  },
  {
    id: 'json-formatter-validator',
    name: 'JSON Formatter/Validator',
    description: 'Format and validate JSON with advanced options',
    category: 'JSON Tools',
    icon: 'Braces',
    path: '/tools/json-formatter-validator',
    tags: ['json', 'format', 'validate', 'beautify', 'advanced']
  },
  {
    id: 'json-minifier-tool',
    name: 'JSON Minifier',
    description: 'Minify JSON files',
    category: 'JSON Tools',
    icon: 'Minimize2',
    path: '/tools/json-minifier-tool',
    tags: ['json', 'minify', 'compress', 'optimize']
  },
  {
    id: 'json-path-tester-tool',
    name: 'JSON Path Tester',
    description: 'Test JSONPath expressions',
    category: 'JSON Tools',
    icon: 'Search',
    path: '/tools/json-path-tester-tool',
    tags: ['json', 'path', 'test', 'query']
  },
  {
    id: 'json-schema-validator',
    name: 'JSON Schema Validator',
    description: 'Validate JSON against schemas',
    category: 'JSON Tools',
    icon: 'CheckSquare',
    path: '/tools/json-schema-validator',
    tags: ['json', 'schema', 'validate', 'check']
  },
  {
    id: 'json-schema-validator-tool',
    name: 'JSON Schema Validator Tool',
    description: 'Advanced JSON schema validation',
    category: 'JSON Tools',
    icon: 'CheckSquare',
    path: '/tools/json-schema-validator-tool',
    tags: ['json', 'schema', 'validate', 'check', 'advanced']
  },
  {
    id: 'json-to-csv',
    name: 'JSON to CSV Converter',
    description: 'Convert JSON to CSV format',
    category: 'JSON Tools',
    icon: 'FileSpreadsheet',
    path: '/tools/json-to-csv',
    tags: ['json', 'csv', 'convert', 'data']
  },
  {
    id: 'json-to-csv-converter-tool',
    name: 'JSON to CSV Converter Tool',
    description: 'Advanced JSON to CSV conversion',
    category: 'JSON Tools',
    icon: 'FileSpreadsheet',
    path: '/tools/json-to-csv-converter-tool',
    tags: ['json', 'csv', 'convert', 'data', 'advanced']
  },
  {
    id: 'json-to-excel',
    name: 'JSON to Excel Converter',
    description: 'Convert JSON to Excel format',
    category: 'JSON Tools',
    icon: 'FileSpreadsheet',
    path: '/tools/json-to-excel',
    tags: ['json', 'excel', 'convert', 'data']
  },
  {
    id: 'json-visualizer',
    name: 'JSON Visualizer',
    description: 'Visualize JSON data structure',
    category: 'JSON Tools',
    icon: 'Eye',
    path: '/tools/json-visualizer',
    tags: ['json', 'visualize', 'structure', 'data']
  },
  {
    id: 'csv-to-json',
    name: 'CSV to JSON Converter',
    description: 'Convert CSV to JSON format',
    category: 'JSON Tools',
    icon: 'FileJson',
    path: '/tools/csv-to-json',
    tags: ['csv', 'json', 'convert', 'data']
  },
  {
    id: 'csv-to-json-converter-tool',
    name: 'CSV to JSON Converter Tool',
    description: 'Advanced CSV to JSON conversion',
    category: 'JSON Tools',
    icon: 'FileJson',
    path: '/tools/csv-to-json-converter-tool',
    tags: ['csv', 'json', 'convert', 'data', 'advanced']
  },
  {
    id: 'xml-to-json',
    name: 'XML to JSON Converter',
    description: 'Convert XML to JSON format',
    category: 'JSON Tools',
    icon: 'FileJson',
    path: '/tools/xml-to-json',
    tags: ['xml', 'json', 'convert', 'data']
  },
  {
    id: 'xml-to-json-converter-tool',
    name: 'XML to JSON Converter Tool',
    description: 'Advanced XML to JSON conversion',
    category: 'JSON Tools',
    icon: 'FileJson',
    path: '/tools/xml-to-json-converter-tool',
    tags: ['xml', 'json', 'convert', 'data', 'advanced']
  },
  {
    id: 'yaml-to-json',
    name: 'YAML to JSON Converter',
    description: 'Convert YAML to JSON format',
    category: 'JSON Tools',
    icon: 'FileJson',
    path: '/tools/yaml-to-json',
    tags: ['yaml', 'json', 'convert', 'data']
  },
  {
    id: 'yaml-to-json-converter-tool',
    name: 'YAML to JSON Converter Tool',
    description: 'Advanced YAML to JSON conversion',
    category: 'JSON Tools',
    icon: 'FileJson',
    path: '/tools/yaml-to-json-converter-tool',
    tags: ['yaml', 'json', 'convert', 'data', 'advanced']
  },
  
  // Development Tools
  {
    id: 'markdown-editor',
    name: 'Markdown Editor',
    description: 'Edit markdown with live preview',
    category: 'Development Tools',
    icon: 'FileText',
    path: '/tools/markdown-editor',
    tags: ['markdown', 'editor', 'preview', 'documentation']
  },
  {
    id: 'markdown-editor-tool',
    name: 'Markdown Editor Tool',
    description: 'Advanced markdown editor with features',
    category: 'Development Tools',
    icon: 'FileText',
    path: '/tools/markdown-editor-tool',
    tags: ['markdown', 'editor', 'preview', 'documentation', 'advanced']
  },
  {
    id: 'code-playground-tool',
    name: 'Code Playground',
    description: 'Write and test code in multiple languages',
    category: 'Development Tools',
    icon: 'Code',
    path: '/tools/code-playground-tool',
    tags: ['code', 'playground', 'test', 'languages']
  },
  {
    id: 'api-documentation-generator',
    name: 'API Documentation Generator',
    description: 'Generate API documentation',
    category: 'Development Tools',
    icon: 'FileText',
    path: '/tools/api-documentation-generator',
    tags: ['api', 'documentation', 'generate', 'development']
  },
  {
    id: 'api-documentation-generator-tool',
    name: 'API Documentation Generator Tool',
    description: 'Advanced API documentation generation',
    category: 'Development Tools',
    icon: 'FileText',
    path: '/tools/api-documentation-generator-tool',
    tags: ['api', 'documentation', 'generate', 'development', 'advanced']
  },
  {
    id: 'code-formatter',
    name: 'Code Formatter',
    description: 'Format code in various languages',
    category: 'Development Tools',
    icon: 'Braces',
    path: '/tools/code-formatter',
    tags: ['code', 'format', 'beautify', 'languages']
  },
  {
    id: 'javascript-formatter',
    name: 'JavaScript Formatter',
    description: 'Format JavaScript code',
    category: 'Development Tools',
    icon: 'Braces',
    path: '/tools/javascript-formatter',
    tags: ['javascript', 'code', 'format', 'beautify']
  },
  {
    id: 'css-formatter',
    name: 'CSS Formatter',
    description: 'Format CSS code',
    category: 'Development Tools',
    icon: 'Palette',
    path: '/tools/css-formatter',
    tags: ['css', 'code', 'format', 'beautify']
  },
  {
    id: 'html-formatter',
    name: 'HTML Formatter',
    description: 'Format HTML code',
    category: 'Development Tools',
    icon: 'Code',
    path: '/tools/html-formatter',
    tags: ['html', 'code', 'format', 'beautify']
  },
  {
    id: 'sql-formatter',
    name: 'SQL Formatter',
    description: 'Format SQL code',
    category: 'Development Tools',
    icon: 'Database',
    path: '/tools/sql-formatter',
    tags: ['sql', 'code', 'format', 'beautify']
  },
  {
    id: 'js-minifier',
    name: 'JavaScript Minifier',
    description: 'Minify JavaScript code',
    category: 'Development Tools',
    icon: 'Minimize2',
    path: '/tools/js-minifier',
    tags: ['javascript', 'minify', 'compress', 'optimize']
  },
  {
    id: 'css-minifier',
    name: 'CSS Minifier',
    description: 'Minify CSS code',
    category: 'Development Tools',
    icon: 'Minimize2',
    path: '/tools/css-minifier',
    tags: ['css', 'minify', 'compress', 'optimize']
  },
  {
    id: 'html-minifier',
    name: 'HTML Minifier',
    description: 'Minify HTML code',
    category: 'Development Tools',
    icon: 'Minimize2',
    path: '/tools/html-minifier',
    tags: ['html', 'minify', 'compress', 'optimize']
  },
  {
    id: 'js-obfuscator',
    name: 'JavaScript Obfuscator',
    description: 'Obfuscate JavaScript code',
    category: 'Development Tools',
    icon: 'Lock',
    path: '/tools/js-obfuscator',
    tags: ['javascript', 'obfuscate', 'security', 'protect']
  },
  {
    id: 'javascript-validator',
    name: 'JavaScript Validator',
    description: 'Validate JavaScript code',
    category: 'Development Tools',
    icon: 'CheckCircle',
    path: '/tools/javascript-validator',
    tags: ['javascript', 'validate', 'check', 'code']
  },
  {
    id: 'css-validator',
    name: 'CSS Validator',
    description: 'Validate CSS code',
    category: 'Development Tools',
    icon: 'CheckCircle',
    path: '/tools/css-validator',
    tags: ['css', 'validate', 'check', 'code']
  },
  {
    id: 'html-validator',
    name: 'HTML Validator',
    description: 'Validate HTML code',
    category: 'Development Tools',
    icon: 'CheckCircle',
    path: '/tools/html-validator',
    tags: ['html', 'validate', 'check', 'code']
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test regular expressions',
    category: 'Development Tools',
    icon: 'Search',
    path: '/tools/regex-tester',
    tags: ['regex', 'test', 'pattern', 'expression']
  },
  {
    id: 'regex-generator',
    name: 'Regex Generator',
    description: 'Generate regular expressions',
    category: 'Development Tools',
    icon: 'Search',
    path: '/tools/regex-generator',
    tags: ['regex', 'generate', 'pattern', 'expression']
  },
  {
    id: 'regular-expression-tester',
    name: 'Regular Expression Tester',
    description: 'Test regular expressions with advanced options',
    category: 'Development Tools',
    icon: 'Search',
    path: '/tools/regular-expression-tester',
    tags: ['regex', 'test', 'pattern', 'expression', 'advanced']
  },
  {
    id: 'code-complexity-analyzer',
    name: 'Code Complexity Analyzer',
    description: 'Analyze code complexity',
    category: 'Development Tools',
    icon: 'BarChart',
    path: '/tools/code-complexity-analyzer',
    tags: ['code', 'complexity', 'analyze', 'metrics']
  },
  {
    id: 'code-snippet-manager',
    name: 'Code Snippet Manager',
    description: 'Manage and organize code snippets',
    category: 'Development Tools',
    icon: 'Code',
    path: '/tools/code-snippet-manager',
    tags: ['code', 'snippet', 'manage', 'organize']
  },
  {
    id: 'sql-query-builder',
    name: 'SQL Query Builder',
    description: 'Build SQL queries visually',
    category: 'Development Tools',
    icon: 'Database',
    path: '/tools/sql-query-builder',
    tags: ['sql', 'query', 'builder', 'database']
  },
  {
    id: 'database-schema-designer',
    name: 'Database Schema Designer',
    description: 'Design database schemas',
    category: 'Development Tools',
    icon: 'Database',
    path: '/tools/database-schema-designer',
    tags: ['database', 'schema', 'design', 'erd']
  },
  {
    id: 'git-helper',
    name: 'Git Helper',
    description: 'Git command helper and reference',
    category: 'Development Tools',
    icon: 'GitBranch',
    path: '/tools/git-helper',
    tags: ['git', 'command', 'helper', 'reference']
  },
  {
    id: 'git-repository-analyzer',
    name: 'Git Repository Analyzer',
    description: 'Analyze Git repository statistics',
    category: 'Development Tools',
    icon: 'GitBranch',
    path: '/tools/git-repository-analyzer',
    tags: ['git', 'repository', 'analyze', 'statistics']
  },
  {
    id: 'cron-expression-generator',
    name: 'Cron Expression Generator',
    description: 'Generate cron expressions',
    category: 'Development Tools',
    icon: 'Clock',
    path: '/tools/cron-expression-generator',
    tags: ['cron', 'expression', 'generate', 'scheduler']
  },
  {
    id: 'jwt-decoder-tool',
    name: 'JWT Decoder',
    description: 'Decode JWT tokens',
    category: 'Development Tools',
    icon: 'Key',
    path: '/tools/jwt-decoder-tool',
    tags: ['jwt', 'decode', 'token', 'auth']
  },
  {
    id: 'jwt-tool',
    name: 'JWT Tool',
    description: 'Encode and decode JWT tokens',
    category: 'Development Tools',
    icon: 'Key',
    path: '/tools/jwt-tool',
    tags: ['jwt', 'encode', 'decode', 'token', 'auth']
  },
  
  // Color Tools
  {
    id: 'color-converter',
    name: 'Color Converter',
    description: 'Convert between color formats',
    category: 'Color Tools',
    icon: 'Palette',
    path: '/tools/color-converter',
    tags: ['color', 'convert', 'format', 'design']
  },
  {
    id: 'color-picker',
    name: 'Color Picker',
    description: 'Pick colors from screen or image',
    category: 'Color Tools',
    icon: 'Eye',
    path: '/tools/color-picker',
    tags: ['color', 'pick', 'screen', 'image']
  },
  {
    id: 'color-palette-generator',
    name: 'Color Palette Generator',
    description: 'Generate color palettes',
    category: 'Color Tools',
    icon: 'Palette',
    path: '/tools/color-palette-generator',
    tags: ['color', 'palette', 'generate', 'design']
  },
  {
    id: 'color-gradient',
    name: 'Color Gradient Generator',
    description: 'Generate color gradients',
    category: 'Color Tools',
    icon: 'Palette',
    path: '/tools/color-gradient',
    tags: ['color', 'gradient', 'generate', 'design']
  },
  {
    id: 'color-blindness-simulator',
    name: 'Color Blindness Simulator',
    description: 'Simulate color blindness',
    category: 'Color Tools',
    icon: 'Eye',
    path: '/tools/color-blindness-simulator',
    tags: ['color', 'blindness', 'simulate', 'accessibility']
  },
  {
    id: 'color-contrast-checker',
    name: 'Color Contrast Checker',
    description: 'Check color contrast ratios for accessibility compliance (WCAG)',
    category: 'Color Tools',
    icon: 'CheckCircle',
    path: '/tools/color-contrast-checker',
    tags: ['color', 'contrast', 'accessibility', 'wcag', 'compliance']
  },
  {
    id: 'color-harmony-finder',
    name: 'Color Harmony Finder',
    description: 'Find harmonious color combinations based on color theory',
    category: 'Color Tools',
    icon: 'Palette',
    path: '/tools/color-harmony-finder',
    tags: ['color', 'harmony', 'theory', 'combinations', 'design']
  },
  {
    id: 'color-mixer',
    name: 'Color Mixer',
    description: 'Mix colors together to create new colors with precise control',
    category: 'Color Tools',
    icon: 'Palette',
    path: '/tools/color-mixer',
    tags: ['color', 'mix', 'blend', 'create', 'design']
  },
  {
    id: 'color-namer',
    name: 'Color Namer',
    description: 'Get the names of colors and find similar colors by name',
    category: 'Color Tools',
    icon: 'Tag',
    path: '/tools/color-namer',
    tags: ['color', 'name', 'identify', 'similar', 'design']
  },
  {
    id: 'color-scheme-generator',
    name: 'Color Scheme Generator',
    description: 'Generate complete color schemes for websites and designs',
    category: 'Color Tools',
    icon: 'Palette',
    path: '/tools/color-scheme-generator',
    tags: ['color', 'scheme', 'website', 'design', 'palette']
  },
  
  // Image Tools
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    description: 'Compress images',
    category: 'Image Tools',
    icon: 'Image',
    path: '/tools/image-compressor',
    tags: ['image', 'compress', 'optimize', 'size']
  },
  {
    id: 'image-compressor-tool',
    name: 'Image Compressor Tool',
    description: 'Advanced image compression',
    category: 'Image Tools',
    icon: 'Image',
    path: '/tools/image-compressor-tool',
    tags: ['image', 'compress', 'optimize', 'size', 'advanced']
  },
  {
    id: 'image-converter',
    name: 'Image Converter',
    description: 'Convert image formats',
    category: 'Image Tools',
    icon: 'Image',
    path: '/tools/image-converter',
    tags: ['image', 'convert', 'format', 'transform']
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    description: 'Resize images',
    category: 'Image Tools',
    icon: 'Maximize',
    path: '/tools/image-resizer',
    tags: ['image', 'resize', 'dimensions', 'scale']
  },
  {
    id: 'image-optimizer',
    name: 'Image Optimizer',
    description: 'Optimize images for web',
    category: 'Image Tools',
    icon: 'Zap',
    path: '/tools/image-optimizer',
    tags: ['image', 'optimize', 'web', 'performance']
  },
  {
    id: 'image-placeholder',
    name: 'Image Placeholder Generator',
    description: 'Generate placeholder images',
    category: 'Image Tools',
    icon: 'Image',
    path: '/tools/image-placeholder',
    tags: ['image', 'placeholder', 'generate', 'dummy']
  },
  {
    id: 'image-to-text',
    name: 'Image to Text',
    description: 'Extract text from images',
    category: 'Image Tools',
    icon: 'Type',
    path: '/tools/image-to-text',
    tags: ['image', 'text', 'extract', 'ocr']
  },
  {
    id: 'favicon-generator',
    name: 'Favicon Generator',
    description: 'Generate favicons',
    category: 'Image Tools',
    icon: 'Globe',
    path: '/tools/favicon-generator',
    tags: ['favicon', 'generate', 'icon', 'web']
  },
  {
    id: 'exif-reader',
    name: 'EXIF Reader',
    description: 'Read EXIF data from images',
    category: 'Image Tools',
    icon: 'Info',
    path: '/tools/exif-reader',
    tags: ['exif', 'image', 'metadata', 'read']
  },
  {
    id: 'exif-remover',
    name: 'EXIF Remover',
    description: 'Remove EXIF data from images',
    category: 'Image Tools',
    icon: 'Trash2',
    path: '/tools/exif-remover',
    tags: ['exif', 'image', 'metadata', 'remove']
  },
  
  // File Tools
  {
    id: 'file-converter',
    name: 'File Converter',
    description: 'Convert between file formats',
    category: 'File Tools',
    icon: 'File',
    path: '/tools/file-converter',
    tags: ['file', 'convert', 'format', 'transform']
  },
  {
    id: 'file-joiner',
    name: 'File Joiner',
    description: 'Join multiple files',
    category: 'File Tools',
    icon: 'Link',
    path: '/tools/file-joiner',
    tags: ['file', 'join', 'merge', 'combine']
  },
  {
    id: 'file-splitter',
    name: 'File Splitter',
    description: 'Split files into parts',
    category: 'File Tools',
    icon: 'Scissors',
    path: '/tools/file-splitter',
    tags: ['file', 'split', 'divide', 'parts']
  },
  {
    id: 'file-renamer',
    name: 'File Renamer',
    description: 'Rename multiple files',
    category: 'File Tools',
    icon: 'Edit',
    path: '/tools/file-renamer',
    tags: ['file', 'rename', 'batch', 'organize']
  },
  {
    id: 'file-hash-checker',
    name: 'File Hash Checker',
    description: 'Check file hashes',
    category: 'File Tools',
    icon: 'Hash',
    path: '/tools/file-hash-checker',
    tags: ['file', 'hash', 'check', 'verify']
  },
  {
    id: 'pdf-generator',
    name: 'PDF Generator',
    description: 'Generate PDF files',
    category: 'File Tools',
    icon: 'FileText',
    path: '/tools/pdf-generator',
    tags: ['pdf', 'generate', 'create', 'document']
  },
  {
    id: 'pdf-merger',
    name: 'PDF Merger',
    description: 'Merge PDF files',
    category: 'File Tools',
    icon: 'Merge',
    path: '/tools/pdf-merger',
    tags: ['pdf', 'merge', 'combine', 'join']
  },
  {
    id: 'csv-converter',
    name: 'CSV Converter',
    description: 'Convert CSV files',
    category: 'File Tools',
    icon: 'FileSpreadsheet',
    path: '/tools/csv-converter',
    tags: ['csv', 'convert', 'format', 'data']
  },
  {
    id: 'file-compressor',
    name: 'File Compressor',
    description: 'Compress files to reduce size with various compression algorithms',
    category: 'File Tools',
    icon: 'Minimize2',
    path: '/tools/file-compressor',
    tags: ['file', 'compress', 'size', 'zip', 'archive']
  },
  {
    id: 'file-extractor',
    name: 'File Extractor',
    description: 'Extract files from archives (ZIP, RAR, 7z, etc.)',
    category: 'File Tools',
    icon: 'Maximize',
    path: '/tools/file-extractor',
    tags: ['file', 'extract', 'archive', 'zip', 'unzip']
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF Converter',
    description: 'Convert images to PDF documents',
    category: 'File Tools',
    icon: 'Image',
    path: '/tools/image-to-pdf',
    tags: ['image', 'pdf', 'convert', 'document']
  },
  {
    id: 'text-to-pdf',
    name: 'Text to PDF Converter',
    description: 'Convert text files to PDF documents',
    category: 'File Tools',
    icon: 'FileText',
    path: '/tools/text-to-pdf',
    tags: ['text', 'pdf', 'convert', 'document']
  },
  
  // Network Tools
  {
    id: 'ip-lookup',
    name: 'IP Lookup',
    description: 'Lookup IP address information',
    category: 'Network Tools',
    icon: 'Globe',
    path: '/tools/ip-lookup',
    tags: ['ip', 'lookup', 'address', 'information']
  },
  {
    id: 'ip-address-lookup',
    name: 'IP Address Lookup',
    description: 'Lookup IP address details',
    category: 'Network Tools',
    icon: 'Globe',
    path: '/tools/ip-address-lookup',
    tags: ['ip', 'address', 'lookup', 'details']
  },
  {
    id: 'ip-geolocation',
    name: 'IP Geolocation',
    description: 'Get IP geolocation data',
    category: 'Network Tools',
    icon: 'MapPin',
    path: '/tools/ip-geolocation',
    tags: ['ip', 'geolocation', 'location', 'map']
  },
  {
    id: 'my-ip',
    name: 'My IP',
    description: 'Check your IP address',
    category: 'Network Tools',
    icon: 'Wifi',
    path: '/tools/my-ip',
    tags: ['ip', 'address', 'check', 'my']
  },
  {
    id: 'dns-lookup',
    name: 'DNS Lookup',
    description: 'Lookup DNS records',
    category: 'Network Tools',
    icon: 'Globe',
    path: '/tools/dns-lookup',
    tags: ['dns', 'lookup', 'records', 'domain']
  },
  {
    id: 'whois',
    name: 'WHOIS Lookup',
    description: 'Lookup domain WHOIS information',
    category: 'Network Tools',
    icon: 'Globe',
    path: '/tools/whois',
    tags: ['whois', 'domain', 'lookup', 'information']
  },
  {
    id: 'whois-lookup',
    name: 'WHOIS Lookup Tool',
    description: 'Advanced WHOIS lookup',
    category: 'Network Tools',
    icon: 'Globe',
    path: '/tools/whois-lookup',
    tags: ['whois', 'domain', 'lookup', 'information', 'advanced']
  },
  {
    id: 'ping',
    name: 'Ping Tool',
    description: 'Ping servers and websites',
    category: 'Network Tools',
    icon: 'Wifi',
    path: '/tools/ping',
    tags: ['ping', 'server', 'website', 'network']
  },
  {
    id: 'online-ping-website-tool',
    name: 'Online Ping Website Tool',
    description: 'Ping websites online',
    category: 'Network Tools',
    icon: 'Wifi',
    path: '/tools/online-ping-website-tool',
    tags: ['ping', 'website', 'online', 'network']
  },
  {
    id: 'port-scanner',
    name: 'Port Scanner',
    description: 'Scan open ports',
    category: 'Network Tools',
    icon: 'Settings',
    path: '/tools/port-scanner',
    tags: ['port', 'scan', 'network', 'security']
  },
  {
    id: 'network-port-scanner',
    name: 'Network Port Scanner',
    description: 'Advanced port scanning',
    category: 'Network Tools',
    icon: 'Settings',
    path: '/tools/network-port-scanner',
    tags: ['port', 'scan', 'network', 'security', 'advanced']
  },
  {
    id: 'network-speed-test',
    name: 'Network Speed Test',
    description: 'Test network speed',
    category: 'Network Tools',
    icon: 'Gauge',
    path: '/tools/network-speed-test',
    tags: ['network', 'speed', 'test', 'performance']
  },
  {
    id: 'network-diagnostic',
    name: 'Network Diagnostic',
    description: 'Diagnose network issues',
    category: 'Network Tools',
    icon: 'Activity',
    path: '/tools/network-diagnostic',
    tags: ['network', 'diagnostic', 'troubleshoot', 'issues']
  },
  {
    id: 'ssl-certificate-checker',
    name: 'SSL Certificate Checker',
    description: 'Check SSL certificates',
    category: 'Network Tools',
    icon: 'Shield',
    path: '/tools/ssl-certificate-checker',
    tags: ['ssl', 'certificate', 'check', 'security']
  },
  {
    id: 'ssl-lookup',
    name: 'SSL Lookup',
    description: 'Lookup SSL certificate information',
    category: 'Network Tools',
    icon: 'Shield',
    path: '/tools/ssl-lookup',
    tags: ['ssl', 'certificate', 'lookup', 'information']
  },
  {
    id: 'ssl-security-checker',
    name: 'SSL Security Checker',
    description: 'Check SSL security',
    category: 'Network Tools',
    icon: 'Shield',
    path: '/tools/ssl-security-checker',
    tags: ['ssl', 'security', 'check', 'https']
  },
  {
    id: 'http-headers',
    name: 'HTTP Headers Viewer',
    description: 'View HTTP headers',
    category: 'Network Tools',
    icon: 'FileText',
    path: '/tools/http-headers',
    tags: ['http', 'headers', 'view', 'web']
  },
  {
    id: 'http-request',
    name: 'HTTP Request Tool',
    description: 'Make HTTP requests',
    category: 'Network Tools',
    icon: 'Webhook',
    path: '/tools/http-request',
    tags: ['http', 'request', 'api', 'test']
  },
  {
    id: 'domain-to-ip',
    name: 'Domain to IP',
    description: 'Convert domain to IP address',
    category: 'Network Tools',
    icon: 'Globe',
    path: '/tools/domain-to-ip',
    tags: ['domain', 'ip', 'convert', 'address']
  },
  {
    id: 'reverse-ip',
    name: 'Reverse IP Lookup',
    description: 'Reverse IP lookup',
    category: 'Network Tools',
    icon: 'Globe',
    path: '/tools/reverse-ip',
    tags: ['reverse', 'ip', 'lookup', 'domain']
  },
  {
    id: 'domain-age',
    name: 'Domain Age Checker',
    description: 'Check domain age',
    category: 'Network Tools',
    icon: 'Calendar',
    path: '/tools/domain-age',
    tags: ['domain', 'age', 'check', 'whois']
  },
  {
    id: 'domain-hosting',
    name: 'Domain Hosting Checker',
    description: 'Check domain hosting information',
    category: 'Network Tools',
    icon: 'Server',
    path: '/tools/domain-hosting',
    tags: ['domain', 'hosting', 'check', 'server']
  },
  
  // SEO Tools
  {
    id: 'seo-analyzer',
    name: 'SEO Analyzer',
    description: 'Analyze website SEO',
    category: 'SEO Tools',
    icon: 'Search',
    path: '/tools/seo-analyzer',
    tags: ['seo', 'analyze', 'website', 'optimization']
  },
  {
    id: 'seo-audit-tool',
    name: 'SEO Audit Tool',
    description: 'Audit website SEO',
    category: 'SEO Tools',
    icon: 'Search',
    path: '/tools/seo-audit-tool',
    tags: ['seo', 'audit', 'website', 'optimization']
  },
  {
    id: 'keyword-cpc-calculator',
    name: 'Keyword CPC Calculator',
    description: 'Calculate keyword cost per click',
    category: 'SEO Tools',
    icon: 'DollarSign',
    path: '/tools/keyword-cpc-calculator',
    tags: ['keyword', 'cpc', 'calculate', 'cost']
  },
  {
    id: 'keyword-position-checker',
    name: 'Keyword Position Checker',
    description: 'Check keyword position in search results',
    category: 'SEO Tools',
    icon: 'Search',
    path: '/tools/keyword-position-checker',
    tags: ['keyword', 'position', 'check', 'ranking']
  },
  {
    id: 'backlink-checker',
    name: 'Backlink Checker',
    description: 'Check backlinks',
    category: 'SEO Tools',
    icon: 'Link',
    path: '/tools/backlink-checker',
    tags: ['backlink', 'check', 'seo', 'links']
  },
  {
    id: 'backlink-maker',
    name: 'Backlink Maker',
    description: 'Generate backlinks',
    category: 'SEO Tools',
    icon: 'Link',
    path: '/tools/backlink-maker',
    tags: ['backlink', 'make', 'generate', 'seo']
  },
  {
    id: 'broken-link-checker',
    name: 'Broken Link Checker',
    description: 'Check for broken links',
    category: 'SEO Tools',
    icon: 'Link2',
    path: '/tools/broken-link-checker',
    tags: ['broken', 'link', 'check', 'seo']
  },
  {
    id: 'link-analyzer',
    name: 'Link Analyzer',
    description: 'Analyze links',
    category: 'SEO Tools',
    icon: 'Link',
    path: '/tools/link-analyzer',
    tags: ['link', 'analyze', 'seo', 'analysis']
  },
  {
    id: 'link-price',
    name: 'Link Price Calculator',
    description: 'Calculate link prices',
    category: 'SEO Tools',
    icon: 'DollarSign',
    path: '/tools/link-price',
    tags: ['link', 'price', 'calculate', 'seo']
  },
  {
    id: 'meta-tags',
    name: 'Meta Tags Generator',
    description: 'Generate meta tags',
    category: 'SEO Tools',
    icon: 'Code',
    path: '/tools/meta-tags',
    tags: ['meta', 'tags', 'generate', 'seo']
  },
  {
    id: 'meta-tag-generator',
    name: 'Meta Tag Generator Tool',
    description: 'Advanced meta tag generation',
    category: 'SEO Tools',
    icon: 'Code',
    path: '/tools/meta-tag-generator',
    tags: ['meta', 'tags', 'generate', 'seo', 'advanced']
  },
  {
    id: 'meta-tags-analyzer',
    name: 'Meta Tags Analyzer',
    description: 'Analyze meta tags',
    category: 'SEO Tools',
    icon: 'Search',
    path: '/tools/meta-tags-analyzer',
    tags: ['meta', 'tags', 'analyze', 'seo']
  },
  {
    id: 'robots-txt-generator',
    name: 'Robots.txt Generator',
    description: 'Generate robots.txt files',
    category: 'SEO Tools',
    icon: 'FileText',
    path: '/tools/robots-txt-generator',
    tags: ['robots', 'txt', 'generate', 'seo']
  },
  {
    id: 'robots-txt-validator',
    name: 'Robots.txt Validator',
    description: 'Validate robots.txt files',
    category: 'SEO Tools',
    icon: 'CheckCircle',
    path: '/tools/robots-txt-validator',
    tags: ['robots', 'txt', 'validate', 'seo']
  },
  {
    id: 'xml-sitemap-generator',
    name: 'XML Sitemap Generator',
    description: 'Generate XML sitemaps',
    category: 'SEO Tools',
    icon: 'FileText',
    path: '/tools/xml-sitemap-generator',
    tags: ['xml', 'sitemap', 'generate', 'seo']
  },
  {
    id: 'xml-sitemap-validator',
    name: 'XML Sitemap Validator',
    description: 'Validate XML sitemaps',
    category: 'SEO Tools',
    icon: 'CheckCircle',
    path: '/tools/xml-sitemap-validator',
    tags: ['xml', 'sitemap', 'validate', 'seo']
  },
  {
    id: 'hreflang-generator',
    name: 'Hreflang Generator',
    description: 'Generate hreflang tags',
    category: 'SEO Tools',
    icon: 'Globe',
    path: '/tools/hreflang-generator',
    tags: ['hreflang', 'generate', 'seo', 'international']
  },
  {
    id: 'structured-data-generator',
    name: 'Structured Data Generator',
    description: 'Generate structured data',
    category: 'SEO Tools',
    icon: 'Code',
    path: '/tools/structured-data-generator',
    tags: ['structured', 'data', 'generate', 'schema']
  },
  {
    id: 'google-index',
    name: 'Google Index Checker',
    description: 'Check Google index status',
    category: 'SEO Tools',
    icon: 'Search',
    path: '/tools/google-index',
    tags: ['google', 'index', 'check', 'seo']
  },
  {
    id: 'pagespeed-insights',
    name: 'PageSpeed Insights',
    description: 'Check PageSpeed insights',
    category: 'SEO Tools',
    icon: 'Gauge',
    path: '/tools/pagespeed-insights',
    tags: ['pagespeed', 'insights', 'check', 'performance']
  },
  {
    id: 'mobile-responsive-tester',
    name: 'Mobile Responsive Tester',
    description: 'Test mobile responsiveness',
    category: 'SEO Tools',
    icon: 'Smartphone',
    path: '/tools/mobile-responsive-tester',
    tags: ['mobile', 'responsive', 'test', 'design']
  },
  {
    id: 'seo-content-template',
    name: 'SEO Content Template',
    description: 'Generate SEO content templates',
    category: 'SEO Tools',
    icon: 'FileText',
    path: '/tools/seo-content-template',
    tags: ['seo', 'content', 'template', 'generate']
  },
  {
    id: 'serp-checker',
    name: 'SERP Checker',
    description: 'Check search engine results pages',
    category: 'SEO Tools',
    icon: 'Search',
    path: '/tools/serp-checker',
    tags: ['serp', 'check', 'search', 'results']
  },
  {
    id: 'search-console-simulator',
    name: 'Search Console Simulator',
    description: 'Simulate Google Search Console',
    category: 'SEO Tools',
    icon: 'Search',
    path: '/tools/search-console-simulator',
    tags: ['search', 'console', 'simulate', 'google']
  },
  {
    id: 'youtube-keywords',
    name: 'YouTube Keywords',
    description: 'Find YouTube keywords',
    category: 'SEO Tools',
    icon: 'Youtube',
    path: '/tools/youtube-keywords',
    tags: ['youtube', 'keywords', 'find', 'video']
  },
  {
    id: 'youtube-thumbnail',
    name: 'YouTube Thumbnail Downloader',
    description: 'Download YouTube thumbnails',
    category: 'SEO Tools',
    icon: 'Youtube',
    path: '/tools/youtube-thumbnail',
    tags: ['youtube', 'thumbnail', 'download', 'video']
  },
  
  // Web Tools
  {
    id: 'url-shortener',
    name: 'URL Shortener',
    description: 'Shorten URLs',
    category: 'Web Tools',
    icon: 'Link',
    path: '/tools/url-shortener',
    tags: ['url', 'shorten', 'link', 'web']
  },
  {
    id: 'url-shortener-tool',
    name: 'URL Shortener Tool',
    description: 'Advanced URL shortening',
    category: 'Web Tools',
    icon: 'Link',
    path: '/tools/url-shortener-tool',
    tags: ['url', 'shorten', 'link', 'web', 'advanced']
  },
  {
    id: 'url-extractor',
    name: 'URL Extractor',
    description: 'Extract URLs from text',
    category: 'Web Tools',
    icon: 'Link',
    path: '/tools/url-extractor',
    tags: ['url', 'extract', 'link', 'text']
  },
  {
    id: 'url-rewriting',
    name: 'URL Rewriting Tool',
    description: 'Rewrite URLs',
    category: 'Web Tools',
    icon: 'Edit',
    path: '/tools/url-rewriting',
    tags: ['url', 'rewrite', 'link', 'web']
  },
  {
    id: 'website-screenshot',
    name: 'Website Screenshot',
    description: 'Take website screenshots',
    category: 'Web Tools',
    icon: 'Camera',
    path: '/tools/website-screenshot',
    tags: ['website', 'screenshot', 'capture', 'web']
  },
  {
    id: 'web-scraper',
    name: 'Web Scraper',
    description: 'Scrape web data',
    category: 'Web Tools',
    icon: 'Download',
    path: '/tools/web-scraper',
    tags: ['web', 'scrape', 'data', 'extract']
  },
  {
    id: 'html-scraper',
    name: 'HTML Scraper',
    description: 'Scrape HTML data',
    category: 'Web Tools',
    icon: 'Code',
    path: '/tools/html-scraper',
    tags: ['html', 'scrape', 'data', 'extract']
  },
  {
    id: 'html-to-markdown',
    name: 'HTML to Markdown Converter',
    description: 'Convert HTML to Markdown',
    category: 'Web Tools',
    icon: 'FileText',
    path: '/tools/html-to-markdown',
    tags: ['html', 'markdown', 'convert', 'web']
  },
  {
    id: 'markdown-to-html',
    name: 'Markdown to HTML Converter',
    description: 'Convert Markdown to HTML',
    category: 'Web Tools',
    icon: 'Code',
    path: '/tools/markdown-to-html',
    tags: ['markdown', 'html', 'convert', 'web']
  },
  {
    id: 'markdown-preview',
    name: 'Markdown Preview',
    description: 'Preview Markdown',
    category: 'Web Tools',
    icon: 'Eye',
    path: '/tools/markdown-preview',
    tags: ['markdown', 'preview', 'render', 'web']
  },
  {
    id: 'safe-url',
    name: 'Safe URL Checker',
    description: 'Check if URL is safe',
    category: 'Web Tools',
    icon: 'Shield',
    path: '/tools/safe-url',
    tags: ['url', 'safe', 'check', 'security']
  },
  {
    id: 'suspicious-domain',
    name: 'Suspicious Domain Checker',
    description: 'Check suspicious domains',
    category: 'Web Tools',
    icon: 'AlertTriangle',
    path: '/tools/suspicious-domain',
    tags: ['domain', 'suspicious', 'check', 'security']
  },
  {
    id: 'malware-checker',
    name: 'Malware Checker',
    description: 'Check for malware',
    category: 'Web Tools',
    icon: 'Shield',
    path: '/tools/malware-checker',
    tags: ['malware', 'check', 'security', 'virus']
  },
  {
    id: 'blacklist',
    name: 'Blacklist Checker',
    description: 'Check if domain is blacklisted',
    category: 'Web Tools',
    icon: 'Ban',
    path: '/tools/blacklist',
    tags: ['blacklist', 'check', 'domain', 'security']
  },
  {
    id: 'www-redirect',
    name: 'WWW Redirect Checker',
    description: 'Check WWW redirects',
    category: 'Web Tools',
    icon: 'RefreshCw',
    path: '/tools/www-redirect',
    tags: ['www', 'redirect', 'check', 'web']
  },
  {
    id: 'utm-link',
    name: 'UTM Link Builder',
    description: 'Build UTM links',
    category: 'Web Tools',
    icon: 'Link',
    path: '/tools/utm-link',
    tags: ['utm', 'link', 'build', 'marketing']
  },
  {
    id: 'whatsapp-link',
    name: 'WhatsApp Link Generator',
    description: 'Generate WhatsApp links',
    category: 'Web Tools',
    icon: 'MessageCircle',
    path: '/tools/whatsapp-link',
    tags: ['whatsapp', 'link', 'generate', 'chat']
  },
  {
    id: 'email-extractor',
    name: 'Email Extractor',
    description: 'Extract emails from text',
    category: 'Web Tools',
    icon: 'Mail',
    path: '/tools/email-extractor',
    tags: ['email', 'extract', 'text', 'web']
  },
  {
    id: 'api-tester',
    name: 'API Tester',
    description: 'Test APIs',
    category: 'Web Tools',
    icon: 'Code',
    path: '/tools/api-tester',
    tags: ['api', 'test', 'endpoint', 'web']
  },
  {
    id: 'api-testing-tool',
    name: 'API Testing Tool',
    description: 'Advanced API testing',
    category: 'Web Tools',
    icon: 'Code',
    path: '/tools/api-testing-tool',
    tags: ['api', 'test', 'endpoint', 'web', 'advanced']
  },
  {
    id: 'api-rate-limit-calculator',
    name: 'API Rate Limit Calculator',
    description: 'Calculate API rate limits',
    category: 'Web Tools',
    icon: 'Clock',
    path: '/tools/api-rate-limit-calculator',
    tags: ['api', 'rate', 'limit', 'calculate']
  },
  {
    id: 'webhook-tester',
    name: 'Webhook Tester',
    description: 'Test webhooks',
    category: 'Web Tools',
    icon: 'Webhook',
    path: '/tools/webhook-tester',
    tags: ['webhook', 'test', 'endpoint', 'web']
  },
  {
    id: 'graphql-tester',
    name: 'GraphQL Tester',
    description: 'Test GraphQL APIs',
    category: 'Web Tools',
    icon: 'Code',
    path: '/tools/graphql-tester',
    tags: ['graphql', 'test', 'api', 'web']
  },
  {
    id: 'mobile-app-manifest-generator',
    name: 'Mobile App Manifest Generator',
    description: 'Generate mobile app manifests',
    category: 'Web Tools',
    icon: 'Smartphone',
    path: '/tools/mobile-app-manifest-generator',
    tags: ['mobile', 'app', 'manifest', 'generate']
  },
  {
    id: 'privacy-policy',
    name: 'Privacy Policy Generator',
    description: 'Generate privacy policies',
    category: 'Web Tools',
    icon: 'FileText',
    path: '/tools/privacy-policy',
    tags: ['privacy', 'policy', 'generate', 'legal']
  },
  {
    id: 'terms-conditions',
    name: 'Terms & Conditions Generator',
    description: 'Generate terms and conditions',
    category: 'Web Tools',
    icon: 'FileText',
    path: '/tools/terms-conditions',
    tags: ['terms', 'conditions', 'generate', 'legal']
  },
  {
    id: 'legal-document-generator',
    name: 'Legal Document Generator',
    description: 'Generate legal documents',
    category: 'Web Tools',
    icon: 'FileText',
    path: '/tools/legal-document-generator',
    tags: ['legal', 'document', 'generate', 'law']
  },
  {
    id: 'citation-generator',
    name: 'Citation Generator',
    description: 'Generate citations',
    category: 'Web Tools',
    icon: 'Quote',
    path: '/tools/citation-generator',
    tags: ['citation', 'generate', 'reference', 'academic']
  },
  
  // Calculators
  {
    id: 'calculator',
    name: 'Calculator',
    description: 'Basic calculator',
    category: 'Calculators',
    icon: 'Calculator',
    path: '/tools/calculator',
    tags: ['calculator', 'basic', 'math']
  },
  {
    id: 'scientific-calculator',
    name: 'Scientific Calculator',
    description: 'Scientific calculator',
    category: 'Calculators',
    icon: 'Calculator',
    path: '/tools/scientific-calculator',
    tags: ['calculator', 'scientific', 'math', 'advanced']
  },
  {
    id: 'percentage-calculator',
    name: 'Percentage Calculator',
    description: 'Calculate percentages',
    category: 'Calculators',
    icon: 'Percent',
    path: '/tools/percentage-calculator',
    tags: ['percentage', 'calculate', 'math']
  },
  {
    id: 'tip-calculator',
    name: 'Tip Calculator',
    description: 'Calculate tips',
    category: 'Calculators',
    icon: 'DollarSign',
    path: '/tools/tip-calculator',
    tags: ['tip', 'calculate', 'restaurant']
  },
  {
    id: 'loan-calculator',
    name: 'Loan Calculator',
    description: 'Calculate loans',
    category: 'Calculators',
    icon: 'DollarSign',
    path: '/tools/loan-calculator',
    tags: ['loan', 'calculate', 'finance']
  },
  {
    id: 'mortgage-calculator',
    name: 'Mortgage Calculator',
    description: 'Calculate mortgages',
    category: 'Calculators',
    icon: 'Home',
    path: '/tools/mortgage-calculator',
    tags: ['mortgage', 'calculate', 'finance', 'home']
  },
  {
    id: 'financial-calculator',
    name: 'Financial Calculator',
    description: 'Financial calculations',
    category: 'Calculators',
    icon: 'DollarSign',
    path: '/tools/financial-calculator',
    tags: ['financial', 'calculate', 'finance', 'business']
  },
  {
    id: 'bmi-calculator',
    name: 'BMI Calculator',
    description: 'Calculate BMI',
    category: 'Calculators',
    icon: 'Activity',
    path: '/tools/bmi-calculator',
    tags: ['bmi', 'calculate', 'health']
  },
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    description: 'Calculate age',
    category: 'Calculators',
    icon: 'Calendar',
    path: '/tools/age-calculator',
    tags: ['age', 'calculate', 'date']
  },
  {
    id: 'date-calculator',
    name: 'Date Calculator',
    description: 'Calculate dates',
    category: 'Calculators',
    icon: 'Calendar',
    path: '/tools/date-calculator',
    tags: ['date', 'calculate', 'time']
  },
  {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    description: 'Convert timestamps',
    category: 'Calculators',
    icon: 'Clock',
    path: '/tools/timestamp-converter',
    tags: ['timestamp', 'convert', 'time', 'date']
  },
  {
    id: 'timestamp-converter-tool',
    name: 'Timestamp Converter Tool',
    description: 'Advanced timestamp conversion',
    category: 'Calculators',
    icon: 'Clock',
    path: '/tools/timestamp-converter-tool',
    tags: ['timestamp', 'convert', 'time', 'date', 'advanced']
  },
  {
    id: 'timezone-converter',
    name: 'Timezone Converter',
    description: 'Convert timezones',
    category: 'Calculators',
    icon: 'Globe',
    path: '/tools/timezone-converter',
    tags: ['timezone', 'convert', 'time', 'world']
  },
  {
    id: 'discount-calculator',
    name: 'Discount Calculator',
    description: 'Calculate discounts',
    category: 'Calculators',
    icon: 'Percent',
    path: '/tools/discount-calculator',
    tags: ['discount', 'calculate', 'shopping']
  },
  {
    id: 'vat-calculator',
    name: 'VAT Calculator',
    description: 'Calculate VAT',
    category: 'Calculators',
    icon: 'Percent',
    path: '/tools/vat-calculator',
    tags: ['vat', 'calculate', 'tax']
  },
  {
    id: 'equation-solver',
    name: 'Equation Solver',
    description: 'Solve equations',
    category: 'Calculators',
    icon: 'Calculator',
    path: '/tools/equation-solver',
    tags: ['equation', 'solve', 'math', 'algebra']
  },
  {
    id: 'medical-dosage-calculator',
    name: 'Medical Dosage Calculator',
    description: 'Calculate medical dosage',
    category: 'Calculators',
    icon: 'Activity',
    path: '/tools/medical-dosage-calculator',
    tags: ['medical', 'dosage', 'calculate', 'health']
  },
  
  // Security Tools
  {
    id: 'password-analyzer',
    name: 'Password Analyzer',
    description: 'Analyze password strength',
    category: 'Security Tools',
    icon: 'Key',
    path: '/tools/password-analyzer',
    tags: ['password', 'analyze', 'strength', 'security']
  },
  {
    id: 'password-security-analyzer',
    name: 'Password Security Analyzer',
    description: 'Analyze password security',
    category: 'Security Tools',
    icon: 'Key',
    path: '/tools/password-security-analyzer',
    tags: ['password', 'security', 'analyze', 'protection']
  },
  {
    id: 'password-strength',
    name: 'Password Strength Checker',
    description: 'Check password strength',
    category: 'Security Tools',
    icon: 'Key',
    path: '/tools/password-strength',
    tags: ['password', 'strength', 'check', 'security']
  },
  {
    id: 'password-strength-analyzer',
    name: 'Password Strength Analyzer',
    description: 'Analyze password strength',
    category: 'Security Tools',
    icon: 'Key',
    path: '/tools/password-strength-analyzer',
    tags: ['password', 'strength', 'analyze', 'security']
  },
  {
    id: 'password-strength-checker',
    name: 'Password Strength Checker Tool',
    description: 'Advanced password strength checking',
    category: 'Security Tools',
    icon: 'Key',
    path: '/tools/password-strength-checker',
    tags: ['password', 'strength', 'check', 'security', 'advanced']
  },
  {
    id: 'hash-checker',
    name: 'Hash Checker',
    description: 'Check hash values',
    category: 'Security Tools',
    icon: 'Hash',
    path: '/tools/hash-checker',
    tags: ['hash', 'check', 'verify', 'security']
  },
  {
    id: 'ssl-checker',
    name: 'SSL Certificate Checker',
    description: 'Check SSL certificate validity and security information',
    category: 'Security Tools',
    icon: 'Shield',
    path: '/tools/ssl-checker',
    tags: ['ssl', 'certificate', 'security', 'encryption', 'https']
  },
  {
    id: 'security-headers-analyzer',
    name: 'Security Headers Analyzer',
    description: 'Analyze HTTP security headers and get recommendations',
    category: 'Security Tools',
    icon: 'Shield',
    path: '/tools/security-headers-analyzer',
    tags: ['security', 'headers', 'http', 'analysis', 'web']
  },
  {
    id: 'security-port-scanner',
    name: 'Port Scanner',
    description: 'Scan open ports and check network security',
    category: 'Security Tools',
    icon: 'Wifi',
    path: '/tools/security-port-scanner',
    tags: ['port', 'scanner', 'network', 'security', 'vulnerability']
  },
  {
    id: 'security-whois-lookup',
    name: 'WHOIS Lookup',
    description: 'Get domain registration information and ownership details',
    category: 'Security Tools',
    icon: 'Globe',
    path: '/tools/security-whois-lookup',
    tags: ['whois', 'domain', 'registration', 'lookup', 'security']
  },
  
  // Data Tools
  {
    id: 'data-extractor',
    name: 'Data Extractor',
    description: 'Extract data from various sources',
    category: 'Data Tools',
    icon: 'Download',
    path: '/tools/data-extractor',
    tags: ['data', 'extract', 'scrape', 'web']
  },
  {
    id: 'data-table-generator',
    name: 'Data Table Generator',
    description: 'Generate data tables',
    category: 'Data Tools',
    icon: 'Table',
    path: '/tools/data-table-generator',
    tags: ['data', 'table', 'generate', 'format']
  },
  {
    id: 'data-visualization',
    name: 'Data Visualization',
    description: 'Visualize data',
    category: 'Data Tools',
    icon: 'BarChart',
    path: '/tools/data-visualization',
    tags: ['data', 'visualization', 'chart', 'graph']
  },
  {
    id: 'chart-creator',
    name: 'Chart Creator',
    description: 'Create charts',
    category: 'Data Tools',
    icon: 'BarChart',
    path: '/tools/chart-creator',
    tags: ['chart', 'create', 'data', 'visualization']
  },
  {
    id: 'chart-data-generator',
    name: 'Chart Data Generator',
    description: 'Generate chart data',
    category: 'Data Tools',
    icon: 'BarChart',
    path: '/tools/chart-data-generator',
    tags: ['chart', 'data', 'generate', 'visualization']
  },
  {
    id: 'chart-generator',
    name: 'Chart Generator',
    description: 'Generate charts',
    category: 'Data Tools',
    icon: 'BarChart',
    path: '/tools/chart-generator',
    tags: ['chart', 'generate', 'data', 'visualization']
  },
  {
    id: 'dependency-graph-visualizer',
    name: 'Dependency Graph Visualizer',
    description: 'Visualize dependency graphs',
    category: 'Data Tools',
    icon: 'GitBranch',
    path: '/tools/dependency-graph-visualizer',
    tags: ['dependency', 'graph', 'visualize', 'code']
  },
  {
    id: 'bulk-geo',
    name: 'Bulk Geocoding',
    description: 'Geocode multiple locations',
    category: 'Data Tools',
    icon: 'MapPin',
    path: '/tools/bulk-geo',
    tags: ['bulk', 'geo', 'geocode', 'location']
  },
  {
    id: 'data-cleaner',
    name: 'Data Cleaner',
    description: 'Clean and preprocess data by removing duplicates, fixing errors, and standardizing formats',
    category: 'Data Tools',
    icon: 'Database',
    path: '/tools/data-cleaner',
    tags: ['data', 'clean', 'preprocess', 'quality', 'standardize']
  },
  {
    id: 'data-validator',
    name: 'Data Validator',
    description: 'Validate data against schemas and business rules',
    category: 'Data Tools',
    icon: 'CheckCircle',
    path: '/tools/data-validator',
    tags: ['data', 'validate', 'schema', 'rules', 'quality']
  },
  {
    id: 'data-transformer',
    name: 'Data Transformer',
    description: 'Transform data structures and formats with custom mapping rules',
    category: 'Data Tools',
    icon: 'RefreshCw',
    path: '/tools/data-transformer',
    tags: ['data', 'transform', 'convert', 'mapping', 'format']
  },
  {
    id: 'data-merger',
    name: 'Data Merger',
    description: 'Merge multiple datasets with intelligent matching and deduplication',
    category: 'Data Tools',
    icon: 'Merge',
    path: '/tools/data-merger',
    tags: ['data', 'merge', 'combine', 'deduplicate', 'join']
  },
  {
    id: 'data-sampler',
    name: 'Data Sampler',
    description: 'Create representative samples from large datasets for analysis and testing',
    category: 'Data Tools',
    icon: 'Shuffle',
    path: '/tools/data-sampler',
    tags: ['data', 'sample', 'random', 'analysis', 'testing']
  },
  {
    id: 'data-profiler',
    name: 'Data Profiler',
    description: 'Analyze data quality, patterns, and generate comprehensive data profiles',
    category: 'Data Tools',
    icon: 'BarChart3',
    path: '/tools/data-profiler',
    tags: ['data', 'profile', 'quality', 'analysis', 'statistics']
  },
  
  // System Tools
  {
    id: 'system-info',
    name: 'System Information',
    description: 'Get system information',
    category: 'System Tools',
    icon: 'Info',
    path: '/tools/system-info',
    tags: ['system', 'information', 'hardware', 'software']
  },
  {
    id: 'performance-optimization',
    name: 'Performance Optimization',
    description: 'Optimize system performance',
    category: 'System Tools',
    icon: 'Zap',
    path: '/tools/performance-optimization',
    tags: ['performance', 'optimization', 'system', 'speed']
  },
  {
    id: 'disk-space-analyzer',
    name: 'Disk Space Analyzer',
    description: 'Analyze disk space usage and find large files',
    category: 'System Tools',
    icon: 'HardDrive',
    path: '/tools/disk-space-analyzer',
    tags: ['disk', 'space', 'analyzer', 'storage', 'files']
  },
  {
    id: 'process-monitor',
    name: 'Process Monitor',
    description: 'Monitor system processes and resource usage',
    category: 'System Tools',
    icon: 'Activity',
    path: '/tools/process-monitor',
    tags: ['process', 'monitor', 'system', 'resources', 'cpu']
  },
  {
    id: 'network-scanner',
    name: 'Network Scanner',
    description: 'Scan network devices and analyze network traffic',
    category: 'System Tools',
    icon: 'Wifi',
    path: '/tools/network-scanner',
    tags: ['network', 'scanner', 'devices', 'traffic', 'analysis']
  },
  {
    id: 'system-log-viewer',
    name: 'System Log Viewer',
    description: 'View and analyze system logs for troubleshooting',
    category: 'System Tools',
    icon: 'FileText',
    path: '/tools/system-log-viewer',
    tags: ['system', 'logs', 'viewer', 'troubleshooting', 'analysis']
  },
  {
    id: 'battery-monitor',
    name: 'Battery Monitor',
    description: 'Monitor battery health and power consumption',
    category: 'System Tools',
    icon: 'Battery',
    path: '/tools/battery-monitor',
    tags: ['battery', 'monitor', 'power', 'health', 'consumption']
  },
  
  // Audio/Video Tools
  {
    id: 'audio-converter',
    name: 'Audio Converter',
    description: 'Convert audio formats',
    category: 'Audio/Video Tools',
    icon: 'Music',
    path: '/tools/audio-converter',
    tags: ['audio', 'convert', 'format', 'sound']
  },
  {
    id: 'audio-recorder',
    name: 'Audio Recorder',
    description: 'Record audio',
    category: 'Audio/Video Tools',
    icon: 'Mic',
    path: '/tools/audio-recorder',
    tags: ['audio', 'record', 'sound', 'voice']
  },
  {
    id: 'video-converter',
    name: 'Video Converter',
    description: 'Convert video formats',
    category: 'Audio/Video Tools',
    icon: 'Video',
    path: '/tools/video-converter',
    tags: ['video', 'convert', 'format', 'media']
  },
  {
    id: 'video-downloader',
    name: 'Video Downloader',
    description: 'Download videos',
    category: 'Audio/Video Tools',
    icon: 'Download',
    path: '/tools/video-downloader',
    tags: ['video', 'download', 'save', 'media']
  },
  {
    id: 'audio-editor',
    name: 'Audio Editor',
    description: 'Edit audio files with trimming, mixing, and effects',
    category: 'Audio/Video Tools',
    icon: 'Volume2',
    path: '/tools/audio-editor',
    tags: ['audio', 'editor', 'trim', 'mix', 'effects']
  },
  {
    id: 'video-editor',
    name: 'Video Editor',
    description: 'Edit videos with cutting, merging, and basic effects',
    category: 'Audio/Video Tools',
    icon: 'Video',
    path: '/tools/video-editor',
    tags: ['video', 'editor', 'cut', 'merge', 'effects']
  },
  {
    id: 'audio-compressor',
    name: 'Audio Compressor',
    description: 'Compress audio files to reduce size while maintaining quality',
    category: 'Audio/Video Tools',
    icon: 'Minimize2',
    path: '/tools/audio-compressor',
    tags: ['audio', 'compress', 'size', 'quality']
  },
  {
    id: 'video-metadata-viewer',
    name: 'Video Metadata Viewer',
    description: 'View and edit video metadata, codec information, and technical details',
    category: 'Audio/Video Tools',
    icon: 'Info',
    path: '/tools/video-metadata-viewer',
    tags: ['video', 'metadata', 'codec', 'technical', 'info']
  },
  
  // Finance Tools
  {
    id: 'stock-price-checker',
    name: 'Stock Price Checker',
    description: 'Check stock prices and market data',
    category: 'Finance Tools',
    icon: 'TrendingUp',
    path: '/tools/stock-price-checker',
    tags: ['stock', 'price', 'check', 'finance']
  },
  {
    id: 'cryptocurrency-price-checker',
    name: 'Cryptocurrency Price Checker',
    description: 'Check cryptocurrency prices and market data',
    category: 'Finance Tools',
    icon: 'Bitcoin',
    path: '/tools/cryptocurrency-price-checker',
    tags: ['crypto', 'cryptocurrency', 'price', 'bitcoin', 'finance']
  },
  {
    id: 'loan-calculator-advanced',
    name: 'Advanced Loan Calculator',
    description: 'Calculate loan payments, interest, and generate amortization schedules',
    category: 'Finance Tools',
    icon: 'Calculator',
    path: '/tools/loan-calculator-advanced',
    tags: ['loan', 'calculator', 'payment', 'interest', 'amortization']
  },
  {
    id: 'retirement-calculator',
    name: 'Retirement Calculator',
    description: 'Plan your retirement savings and see if you are on track to meet your goals',
    category: 'Finance Tools',
    icon: 'PiggyBank',
    path: '/tools/retirement-calculator',
    tags: ['retirement', 'calculator', 'savings', 'planning', 'finance']
  },
  {
    id: 'investment-return-calculator',
    name: 'Investment Return Calculator',
    description: 'Calculate investment returns, compound interest, and growth projections',
    category: 'Finance Tools',
    icon: 'BarChart3',
    path: '/tools/investment-return-calculator',
    tags: ['investment', 'return', 'calculator', 'compound', 'interest', 'growth']
  },
  {
    id: 'advanced-mortgage-calculator',
    name: 'Mortgage Calculator',
    description: 'Calculate mortgage payments, affordability, and compare different loan options',
    category: 'Finance Tools',
    icon: 'Home',
    path: '/tools/advanced-mortgage-calculator',
    tags: ['mortgage', 'calculator', 'payment', 'home', 'loan', 'affordability']
  },
  {
    id: 'budget-planner',
    name: 'Budget Planner',
    description: 'Create and manage personal budgets with expense tracking and financial goals',
    category: 'Finance Tools',
    icon: 'Calculator',
    path: '/tools/budget-planner',
    tags: ['budget', 'planner', 'expense', 'tracking', 'savings', 'goals']
  },
  {
    id: 'currency-exchange-rates',
    name: 'Currency Exchange Rates',
    description: 'Get real-time currency exchange rates and convert between different currencies',
    category: 'Finance Tools',
    icon: 'DollarSign',
    path: '/tools/currency-exchange-rates',
    tags: ['currency', 'exchange', 'rates', 'convert', 'finance', 'forex']
  },
  {
    id: 'tax-calculator',
    name: 'Tax Calculator',
    description: 'Calculate income tax, estimate refunds, and plan for tax season',
    category: 'Finance Tools',
    icon: 'Calculator',
    path: '/tools/tax-calculator',
    tags: ['tax', 'calculator', 'income', 'refund', 'estimate', 'planning']
  },
  {
    id: 'net-worth-calculator',
    name: 'Net Worth Calculator',
    description: 'Calculate your net worth by tracking assets and liabilities over time',
    category: 'Finance Tools',
    icon: 'BarChart3',
    path: '/tools/net-worth-calculator',
    tags: ['net', 'worth', 'calculator', 'assets', 'liabilities', 'wealth']
  },
  
  // CSS Tools
  {
    id: 'css-filter-generator',
    name: 'CSS Filter Generator',
    description: 'Generate CSS filters',
    category: 'CSS Tools',
    icon: 'Palette',
    path: '/tools/css-filter-generator',
    tags: ['css', 'filter', 'generate', 'style']
  },
  {
    id: 'css-gradient-generator',
    name: 'CSS Gradient Generator',
    description: 'Generate CSS gradients',
    category: 'CSS Tools',
    icon: 'Palette',
    path: '/tools/css-gradient-generator',
    tags: ['css', 'gradient', 'generate', 'style']
  },
  {
    id: 'border-radius-generator',
    name: 'Border Radius Generator',
    description: 'Generate border radius CSS',
    category: 'CSS Tools',
    icon: 'Square',
    path: '/tools/border-radius-generator',
    tags: ['border', 'radius', 'generate', 'css']
  },
  {
    id: 'box-shadow-generator',
    name: 'Box Shadow Generator',
    description: 'Generate box shadow CSS',
    category: 'CSS Tools',
    icon: 'Square',
    path: '/tools/box-shadow-generator',
    tags: ['box', 'shadow', 'generate', 'css']
  },
  {
    id: 'css-flexbox-generator',
    name: 'CSS Flexbox Generator',
    description: 'Generate CSS Flexbox layouts with interactive preview',
    category: 'CSS Tools',
    icon: 'Grid3X3',
    path: '/tools/css-flexbox-generator',
    tags: ['css', 'flexbox', 'layout', 'generate']
  },
  {
    id: 'css-grid-generator',
    name: 'CSS Grid Generator',
    description: 'Generate CSS Grid layouts with interactive preview',
    category: 'CSS Tools',
    icon: 'Grid',
    path: '/tools/css-grid-generator',
    tags: ['css', 'grid', 'layout', 'generate']
  },
  {
    id: 'css-animation-generator',
    name: 'CSS Animation Generator',
    description: 'Generate CSS animations and keyframes with preview',
    category: 'CSS Tools',
    icon: 'Activity',
    path: '/tools/css-animation-generator',
    tags: ['css', 'animation', 'keyframes', 'generate']
  },
  {
    id: 'css-transform-generator',
    name: 'CSS Transform Generator',
    description: 'Generate CSS transform properties with visual preview',
    category: 'CSS Tools',
    icon: 'RotateCw',
    path: '/tools/css-transform-generator',
    tags: ['css', 'transform', 'rotate', 'scale', 'generate']
  },
  
  // Text Encoding Tools
  {
    id: 'text-diff',
    name: 'Text Diff',
    description: 'Compare text differences',
    category: 'Text Encoding Tools',
    icon: 'GitCompare',
    path: '/tools/text-diff',
    tags: ['text', 'diff', 'compare', 'difference']
  },
  {
    id: 'text-difference',
    name: 'Text Difference',
    description: 'Find text differences',
    category: 'Text Encoding Tools',
    icon: 'GitCompare',
    path: '/tools/text-difference',
    tags: ['text', 'difference', 'compare', 'find']
  },
  {
    id: 'text-encoder-decoder',
    name: 'Text Encoder/Decoder',
    description: 'Encode and decode text',
    category: 'Text Encoding Tools',
    icon: 'Lock',
    path: '/tools/text-encoder-decoder',
    tags: ['text', 'encode', 'decode', 'convert']
  },
  {
    id: 'line-sorter-tool',
    name: 'Line Sorter',
    description: 'Sort lines of text',
    category: 'Text Encoding Tools',
    icon: 'ArrowUpDown',
    path: '/tools/line-sorter-tool',
    tags: ['line', 'sort', 'text', 'organize']
  },
  {
    id: 'reverse-words',
    name: 'Reverse Words',
    description: 'Reverse words in text',
    category: 'Text Encoding Tools',
    icon: 'RotateCcw',
    path: '/tools/reverse-words',
    tags: ['reverse', 'words', 'text', 'transform']
  },
  {
    id: 'asc-to-text',
    name: 'ASCII to Text',
    description: 'Convert ASCII to text',
    category: 'Text Encoding Tools',
    icon: 'Type',
    path: '/tools/asc-to-text',
    tags: ['ascii', 'text', 'convert', 'decode']
  },
  {
    id: 'ascii-art-to-text',
    name: 'ASCII Art to Text',
    description: 'Convert ASCII art to text',
    category: 'Text Encoding Tools',
    icon: 'Type',
    path: '/tools/ascii-art-to-text',
    tags: ['ascii', 'art', 'text', 'convert']
  },
  {
    id: 'ascii-table-generator-tool',
    name: 'ASCII Table Generator',
    description: 'Generate ASCII table',
    category: 'Text Encoding Tools',
    icon: 'Table',
    path: '/tools/ascii-table-generator-tool',
    tags: ['ascii', 'table', 'generate', 'reference']
  },
  {
    id: 'ascii85-encoder',
    name: 'ASCII85 Encoder',
    description: 'Encode with ASCII85',
    category: 'Text Encoding Tools',
    icon: 'Lock',
    path: '/tools/ascii85-encoder',
    tags: ['ascii85', 'encode', 'text', 'convert']
  },
  {
    id: 'base32-to-text',
    name: 'Base32 to Text',
    description: 'Convert Base32 to text',
    category: 'Text Encoding Tools',
    icon: 'Lock',
    path: '/tools/base32-to-text',
    tags: ['base32', 'text', 'convert', 'decode']
  },
  {
    id: 'base58-encoder',
    name: 'Base58 Encoder',
    description: 'Encode with Base58',
    category: 'Text Encoding Tools',
    icon: 'Lock',
    path: '/tools/base58-encoder',
    tags: ['base58', 'encode', 'text', 'convert']
  },
  {
    id: 'base62-encoder',
    name: 'Base62 Encoder',
    description: 'Encode with Base62',
    category: 'Text Encoding Tools',
    icon: 'Lock',
    path: '/tools/base62-encoder',
    tags: ['base62', 'encode', 'text', 'convert']
  },
  {
    id: 'binary-to-text',
    name: 'Binary to Text',
    description: 'Convert binary to text',
    category: 'Text Encoding Tools',
    icon: 'Binary',
    path: '/tools/binary-to-text',
    tags: ['binary', 'text', 'convert', 'decode']
  },
  {
    id: 'morse-to-text',
    name: 'Morse to Text',
    description: 'Convert Morse code to text',
    category: 'Text Encoding Tools',
    icon: 'Radio',
    path: '/tools/morse-to-text',
    tags: ['morse', 'text', 'convert', 'decode']
  },
  {
    id: 'quoted-printable-encoder',
    name: 'Quoted Printable Encoder',
    description: 'Encode with quoted printable',
    category: 'Text Encoding Tools',
    icon: 'Lock',
    path: '/tools/quoted-printable-encoder',
    tags: ['quoted', 'printable', 'encode', 'text']
  },
  {
    id: 'url-safe-base64-encoder',
    name: 'URL Safe Base64 Encoder',
    description: 'Encode with URL safe Base64',
    category: 'Text Encoding Tools',
    icon: 'Lock',
    path: '/tools/url-safe-base64-encoder',
    tags: ['url', 'safe', 'base64', 'encode']
  },
  {
    id: 'caesar-cipher',
    name: 'Caesar Cipher',
    description: 'Caesar cipher encryption',
    category: 'Text Encoding Tools',
    icon: 'Lock',
    path: '/tools/caesar-cipher',
    tags: ['caesar', 'cipher', 'encrypt', 'text']
  },
  {
    id: 'punycode-encoder',
    name: 'Punycode Encoder',
    description: 'Encode with Punycode',
    category: 'Text Encoding Tools',
    icon: 'Globe',
    path: '/tools/punycode-encoder',
    tags: ['punycode', 'encode', 'domain', 'url']
  },
  {
    id: 'random-password-generator',
    name: 'Random Password Generator',
    description: 'Generate random passwords',
    category: 'Text Encoding Tools',
    icon: 'Key',
    path: '/tools/random-password-generator',
    tags: ['random', 'password', 'generate', 'security']
  },
  {
    id: 'source-code',
    name: 'Source Code Viewer',
    description: 'View source code',
    category: 'Text Encoding Tools',
    icon: 'Code',
    path: '/tools/source-code',
    tags: ['source', 'code', 'view', 'inspect']
  },
  
  // Miscellaneous Tools
  {
    id: 'mozrank',
    name: 'MozRank Checker',
    description: 'Check MozRank and domain authority',
    category: 'Miscellaneous Tools',
    icon: 'Search',
    path: '/tools/mozrank',
    tags: ['mozrank', 'check', 'seo', 'authority']
  },
  {
    id: 'random-decision-maker',
    name: 'Random Decision Maker',
    description: 'Let fate decide! Add your options and let the random generator make the choice for you',
    category: 'Miscellaneous Tools',
    icon: 'Dice1',
    path: '/tools/random-decision-maker',
    tags: ['random', 'decision', 'choice', 'generator', 'fate']
  },
  {
    id: 'password-strength-analyzer-advanced',
    name: 'Advanced Password Strength Analyzer',
    description: 'Analyze your password strength, get security recommendations, and generate strong passwords',
    category: 'Miscellaneous Tools',
    icon: 'Shield',
    path: '/tools/password-strength-analyzer-advanced',
    tags: ['password', 'strength', 'analyzer', 'security', 'generator']
  },
  {
    id: 'qr-code-generator-tool-advanced',
    name: 'Advanced QR Code Generator',
    description: 'Generate custom QR codes for various purposes with advanced options',
    category: 'Miscellaneous Tools',
    icon: 'QrCode',
    path: '/tools/qr-code-generator-tool-advanced',
    tags: ['qr', 'code', 'generator', 'barcode', 'advanced']
  },
  {
    id: 'advanced-age-calculator',
    name: 'Age Calculator',
    description: 'Calculate age from birth date with detailed breakdown in years, months, and days',
    category: 'Miscellaneous Tools',
    icon: 'Calendar',
    path: '/tools/advanced-age-calculator',
    tags: ['age', 'calculator', 'birth', 'date', 'time']
  },
  {
    id: 'typing-speed-test',
    name: 'Typing Speed Test',
    description: 'Test your typing speed and accuracy with real-time statistics and improvement tracking',
    category: 'Miscellaneous Tools',
    icon: 'Keyboard',
    path: '/tools/typing-speed-test',
    tags: ['typing', 'speed', 'test', 'wpm', 'accuracy']
  },
  {
    id: 'advanced-ip-address-lookup',
    name: 'IP Address Lookup',
    description: 'Get detailed information about IP addresses including location, ISP, and geolocation data',
    category: 'Miscellaneous Tools',
    icon: 'Globe',
    path: '/tools/advanced-ip-address-lookup',
    tags: ['ip', 'address', 'lookup', 'location', 'geolocation']
  },
  {
    id: 'color-blindness-test',
    name: 'Color Blindness Test',
    description: 'Test for color blindness and different types of color vision deficiencies',
    category: 'Miscellaneous Tools',
    icon: 'Eye',
    path: '/tools/color-blindness-test',
    tags: ['color', 'blindness', 'test', 'vision', 'health']
  },
]

export function getToolsByCategory(category: string): Tool[] {
  return tools.filter(tool => tool.category === category)
}

export function getFeaturedTools(): Tool[] {
  return tools.filter(tool => tool.featured)
}

export function searchTools(query: string): Tool[] {
  const lowercaseQuery = query.toLowerCase()
  return tools.filter(tool => 
    tool.name.toLowerCase().includes(lowercaseQuery) ||
    tool.description.toLowerCase().includes(lowercaseQuery) ||
    tool.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}

export function getCategories(): string[] {
  const categories = [...new Set(tools.map(tool => tool.category))]
  return categories.sort()
}