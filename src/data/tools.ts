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
    id: 'text-diff',
    name: 'Text Diff',
    description: 'Compare two texts and show differences',
    category: 'Text Tools',
    icon: 'GitCompare',
    path: '/tools/text-diff',
    tags: ['text', 'compare', 'diff']
  },
  
  // Developer Tools
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format and validate JSON data',
    category: 'Developer Tools',
    icon: 'Braces',
    path: '/tools/json-formatter',
    tags: ['json', 'format', 'validate']
  },
  {
    id: 'base64-encoder',
    name: 'Base64 Encoder/Decoder',
    description: 'Encode and decode Base64 strings',
    category: 'Developer Tools',
    icon: 'Code',
    path: '/tools/base64-encoder',
    tags: ['base64', 'encode', 'decode']
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder/Decoder',
    description: 'Encode and decode URL strings',
    category: 'Developer Tools',
    icon: 'Link',
    path: '/tools/url-encoder',
    tags: ['url', 'encode', 'decode']
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate various hash types (MD5, SHA1, SHA256, etc.)',
    category: 'Developer Tools',
    icon: 'Fingerprint',
    path: '/tools/hash-generator',
    tags: ['hash', 'md5', 'sha', 'crypto']
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test and debug regular expressions',
    category: 'Developer Tools',
    icon: 'Search',
    path: '/tools/regex-tester',
    tags: ['regex', 'test', 'debug']
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate UUIDs (v1, v4, v5)',
    category: 'Developer Tools',
    icon: 'Key',
    path: '/tools/uuid-generator',
    tags: ['uuid', 'generate', 'identifier']
  },
  
  // Math Tools
  {
    id: 'calculator',
    name: 'Calculator',
    description: 'Basic and scientific calculator',
    category: 'Math Tools',
    icon: 'Calculator',
    path: '/tools/calculator',
    tags: ['math', 'calculate', 'scientific']
  },
  {
    id: 'percentage-calculator',
    name: 'Percentage Calculator',
    description: 'Calculate percentages and percentage changes',
    category: 'Math Tools',
    icon: 'Percent',
    path: '/tools/percentage-calculator',
    tags: ['math', 'percentage', 'calculate']
  },
  {
    id: 'random-number-generator',
    name: 'Random Number Generator',
    description: 'Generate random numbers with custom ranges',
    category: 'Math Tools',
    icon: 'Dice1',
    path: '/tools/random-number-generator',
    tags: ['random', 'number', 'generate']
  },
  
  // Color Tools
  {
    id: 'color-picker',
    name: 'Color Picker',
    description: 'Pick colors and get color codes',
    category: 'Color Tools',
    icon: 'Palette',
    path: '/tools/color-picker',
    tags: ['color', 'picker', 'hex', 'rgb']
  },
  {
    id: 'color-converter',
    name: 'Color Converter',
    description: 'Convert between color formats (HEX, RGB, HSL)',
    category: 'Color Tools',
    icon: 'Palette',
    path: '/tools/color-converter',
    tags: ['color', 'converter', 'hex', 'rgb', 'hsl']
  },
  {
    id: 'color-gradient',
    name: 'Color Gradient Generator',
    description: 'Generate CSS color gradients',
    category: 'Color Tools',
    icon: 'Palette',
    path: '/tools/color-gradient',
    tags: ['color', 'gradient', 'css']
  },
  
  // Image Tools
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    description: 'Resize images to custom dimensions',
    category: 'Image Tools',
    icon: 'Image',
    path: '/tools/image-resizer',
    tags: ['image', 'resize', 'dimensions']
  },
  {
    id: 'image-converter',
    name: 'Image Converter',
    description: 'Convert images between different formats',
    category: 'Image Tools',
    icon: 'Image',
    path: '/tools/image-converter',
    tags: ['image', 'converter', 'format']
  },
  {
    id: 'image-optimizer',
    name: 'Image Optimizer',
    description: 'Optimize images for web',
    category: 'Image Tools',
    icon: 'Image',
    path: '/tools/image-optimizer',
    tags: ['image', 'optimize', 'web']
  },
  
  // Time Tools
  {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    description: 'Convert between timestamps and human-readable dates',
    category: 'Time Tools',
    icon: 'Clock',
    path: '/tools/timestamp-converter',
    tags: ['timestamp', 'date', 'converter']
  },
  {
    id: 'timezone-converter',
    name: 'Timezone Converter',
    description: 'Convert time between different timezones',
    category: 'Time Tools',
    icon: 'Globe',
    path: '/tools/timezone-converter',
    tags: ['timezone', 'time', 'converter']
  },
  {
    id: 'date-calculator',
    name: 'Date Calculator',
    description: 'Calculate date differences and add/subtract time',
    category: 'Time Tools',
    icon: 'Calendar',
    path: '/tools/date-calculator',
    tags: ['date', 'calculate', 'time']
  },
  
  // Network Tools
  {
    id: 'ip-lookup',
    name: 'IP Lookup',
    description: 'Get information about IP addresses',
    category: 'Network Tools',
    icon: 'Globe',
    path: '/tools/ip-lookup',
    tags: ['ip', 'lookup', 'network']
  },
  {
    id: 'dns-lookup',
    name: 'DNS Lookup',
    description: 'Lookup DNS records for domains',
    category: 'Network Tools',
    icon: 'Server',
    path: '/tools/dns-lookup',
    tags: ['dns', 'lookup', 'domain']
  },
  {
    id: 'ping-test',
    name: 'Ping Test',
    description: 'Test network connectivity with ping',
    category: 'Network Tools',
    icon: 'Wifi',
    path: '/tools/ping-test',
    tags: ['ping', 'network', 'test']
  },
  
  // Unit Converters
  {
    id: 'length-converter',
    name: 'Length Converter',
    description: 'Convert between different length units',
    category: 'Unit Converters',
    icon: 'Ruler',
    path: '/tools/length-converter',
    tags: ['length', 'converter', 'units']
  },
  {
    id: 'weight-converter',
    name: 'Weight Converter',
    description: 'Convert between different weight units',
    category: 'Unit Converters',
    icon: 'Weight',
    path: '/tools/weight-converter',
    tags: ['weight', 'converter', 'units']
  },
  {
    id: 'temperature-converter',
    name: 'Temperature Converter',
    description: 'Convert between temperature units',
    category: 'Unit Converters',
    icon: 'Thermometer',
    path: '/tools/temperature-converter',
    tags: ['temperature', 'converter', 'units']
  },
  {
    id: 'speed-converter',
    name: 'Speed Converter',
    description: 'Convert between different speed units',
    category: 'Unit Converters',
    icon: 'Gauge',
    path: '/tools/speed-converter',
    tags: ['speed', 'converter', 'units']
  },
  
  // Data Tools
  {
    id: 'csv-to-json',
    name: 'CSV to JSON',
    description: 'Convert CSV data to JSON format',
    category: 'Data Tools',
    icon: 'FileSpreadsheet',
    path: '/tools/csv-to-json',
    tags: ['csv', 'json', 'converter']
  },
  {
    id: 'json-to-csv',
    name: 'JSON to CSV',
    description: 'Convert JSON data to CSV format',
    category: 'Data Tools',
    icon: 'FileJson',
    path: '/tools/json-to-csv',
    tags: ['json', 'csv', 'converter']
  },
  {
    id: 'xml-formatter',
    name: 'XML Formatter',
    description: 'Format and validate XML data',
    category: 'Data Tools',
    icon: 'FileCode',
    path: '/tools/xml-formatter',
    tags: ['xml', 'format', 'validate']
  },
  
  // Security Tools
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate secure passwords',
    category: 'Security Tools',
    icon: 'Lock',
    path: '/tools/password-generator',
    tags: ['password', 'generator', 'security']
  },
  {
    id: 'password-strength',
    name: 'Password Strength Checker',
    description: 'Check password strength and security',
    category: 'Security Tools',
    icon: 'Shield',
    path: '/tools/password-strength',
    tags: ['password', 'strength', 'security']
  },
  
  // Web Tools
  {
    id: 'meta-tag-generator',
    name: 'Meta Tag Generator',
    description: 'Generate meta tags for SEO',
    category: 'Web Tools',
    icon: 'Tag',
    path: '/tools/meta-tag-generator',
    tags: ['meta', 'tags', 'seo']
  },
  {
    id: 'html-minifier',
    name: 'HTML Minifier',
    description: 'Minify HTML code',
    category: 'Web Tools',
    icon: 'Code',
    path: '/tools/html-minifier',
    tags: ['html', 'minify', 'optimize']
  },
  {
    id: 'css-minifier',
    name: 'CSS Minifier',
    description: 'Minify CSS code',
    category: 'Web Tools',
    icon: 'FileCode',
    path: '/tools/css-minifier',
    tags: ['css', 'minify', 'optimize']
  },
  {
    id: 'js-minifier',
    name: 'JavaScript Minifier',
    description: 'Minify JavaScript code',
    category: 'Web Tools',
    icon: 'FileJson',
    path: '/tools/js-minifier',
    tags: ['javascript', 'minify', 'optimize']
  },
  
  // File Tools
  {
    id: 'file-renamer',
    name: 'File Renamer',
    description: 'Rename multiple files using patterns',
    category: 'File Tools',
    icon: 'File',
    path: '/tools/file-renamer',
    tags: ['file', 'rename', 'batch']
  },
  {
    id: 'file-converter',
    name: 'File Converter',
    description: 'Convert files between different formats',
    category: 'File Tools',
    icon: 'FileText',
    path: '/tools/file-converter',
    tags: ['file', 'converter', 'format']
  },
  
  // Additional tools to reach 252
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
    id: 'lorem-ipsum',
    name: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text',
    category: 'Text Tools',
    icon: 'FileText',
    path: '/tools/lorem-ipsum',
    tags: ['text', 'placeholder', 'generator']
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
    id: 'line-counter',
    name: 'Line Counter',
    description: 'Count lines in text',
    category: 'Text Tools',
    icon: 'AlignLeft',
    path: '/tools/line-counter',
    tags: ['text', 'count', 'lines']
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
    id: 'text-trimmer',
    name: 'Text Trimmer',
    description: 'Remove whitespace from text',
    category: 'Text Tools',
    icon: 'Scissors',
    path: '/tools/text-trimmer',
    tags: ['text', 'trim', 'whitespace']
  },
  {
    id: 'text-encoder',
    name: 'Text Encoder',
    description: 'Encode text in various formats',
    category: 'Text Tools',
    icon: 'Lock',
    path: '/tools/text-encoder',
    tags: ['text', 'encode', 'security']
  },
  {
    id: 'text-decoder',
    name: 'Text Decoder',
    description: 'Decode encoded text',
    category: 'Text Tools',
    icon: 'Unlock',
    path: '/tools/text-decoder',
    tags: ['text', 'decode', 'security']
  },
  {
    id: 'html-entity-encoder',
    name: 'HTML Entity Encoder',
    description: 'Encode HTML entities',
    category: 'Text Tools',
    icon: 'Code',
    path: '/tools/html-entity-encoder',
    tags: ['html', 'entity', 'encode']
  },
  {
    id: 'html-entity-decoder',
    name: 'HTML Entity Decoder',
    description: 'Decode HTML entities',
    category: 'Text Tools',
    icon: 'Code',
    path: '/tools/html-entity-decoder',
    tags: ['html', 'entity', 'decode']
  },
  {
    id: 'url-shortener',
    name: 'URL Shortener',
    description: 'Shorten long URLs',
    category: 'Text Tools',
    icon: 'Link',
    path: '/tools/url-shortener',
    tags: ['url', 'shorten', 'link']
  },
  {
    id: 'url-expander',
    name: 'URL Expander',
    description: 'Expand shortened URLs',
    category: 'Text Tools',
    icon: 'ExternalLink',
    path: '/tools/url-expander',
    tags: ['url', 'expand', 'link']
  },
  {
    id: 'qr-code-generator',
    name: 'QR Code Generator',
    description: 'Generate QR codes',
    category: 'Text Tools',
    icon: 'QrCode',
    path: '/tools/qr-code-generator',
    tags: ['qr', 'code', 'generator']
  },
  {
    id: 'barcode-generator',
    name: 'Barcode Generator',
    description: 'Generate barcodes',
    category: 'Text Tools',
    icon: 'ScanBarcode',
    path: '/tools/barcode-generator',
    tags: ['barcode', 'generator', 'scan']
  },
  {
    id: 'pdf-generator',
    name: 'PDF Generator',
    description: 'Generate PDF from text',
    category: 'Text Tools',
    icon: 'FileText',
    path: '/tools/pdf-generator',
    tags: ['pdf', 'generator', 'document']
  },
  {
    id: 'markdown-to-html',
    name: 'Markdown to HTML',
    description: 'Convert Markdown to HTML',
    category: 'Text Tools',
    icon: 'FileCode',
    path: '/tools/markdown-to-html',
    tags: ['markdown', 'html', 'convert']
  },
  {
    id: 'html-to-markdown',
    name: 'HTML to Markdown',
    description: 'Convert HTML to Markdown',
    category: 'Text Tools',
    icon: 'FileText',
    path: '/tools/html-to-markdown',
    tags: ['html', 'markdown', 'convert']
  },
  {
    id: 'rtf-to-text',
    name: 'RTF to Text',
    description: 'Convert RTF to plain text',
    category: 'Text Tools',
    icon: 'FileText',
    path: '/tools/rtf-to-text',
    tags: ['rtf', 'text', 'convert']
  },
  {
    id: 'text-to-speech',
    name: 'Text to Speech',
    description: 'Convert text to speech',
    category: 'Text Tools',
    icon: 'Volume2',
    path: '/tools/text-to-speech',
    tags: ['text', 'speech', 'audio']
  },
  {
    id: 'speech-to-text',
    name: 'Speech to Text',
    description: 'Convert speech to text',
    category: 'Text Tools',
    icon: 'Mic',
    path: '/tools/speech-to-text',
    tags: ['speech', 'text', 'audio']
  },
  {
    id: 'language-detector',
    name: 'Language Detector',
    description: 'Detect language of text',
    category: 'Text Tools',
    icon: 'Globe',
    path: '/tools/language-detector',
    tags: ['language', 'detect', 'text']
  },
  {
    id: 'text-translator',
    name: 'Text Translator',
    description: 'Translate text between languages',
    category: 'Text Tools',
    icon: 'Languages',
    path: '/tools/text-translator',
    tags: ['text', 'translate', 'language']
  },
  {
    id: 'sentiment-analyzer',
    name: 'Sentiment Analyzer',
    description: 'Analyze sentiment of text',
    category: 'Text Tools',
    icon: 'Smile',
    path: '/tools/sentiment-analyzer',
    tags: ['sentiment', 'analyze', 'text']
  },
  {
    id: 'keyword-extractor',
    name: 'Keyword Extractor',
    description: 'Extract keywords from text',
    category: 'Text Tools',
    icon: 'Hash',
    path: '/tools/keyword-extractor',
    tags: ['keyword', 'extract', 'text']
  },
  {
    id: 'text-summarizer',
    name: 'Text Summarizer',
    description: 'Summarize long text',
    category: 'Text Tools',
    icon: 'FileText',
    path: '/tools/text-summarizer',
    tags: ['text', 'summarize', 'summary']
  },
  {
    id: 'plagiarism-checker',
    name: 'Plagiarism Checker',
    description: 'Check text for plagiarism',
    category: 'Text Tools',
    icon: 'Shield',
    path: '/tools/plagiarism-checker',
    tags: ['plagiarism', 'check', 'text']
  },
  {
    id: 'readability-score',
    name: 'Readability Score',
    description: 'Calculate readability score',
    category: 'Text Tools',
    icon: 'BarChart',
    path: '/tools/readability-score',
    tags: ['readability', 'score', 'text']
  },
  {
    id: 'text-statistics',
    name: 'Text Statistics',
    description: 'Analyze text statistics',
    category: 'Text Tools',
    icon: 'BarChart3',
    path: '/tools/text-statistics',
    tags: ['text', 'statistics', 'analyze']
  },
  {
    id: 'text-comparator',
    name: 'Text Comparator',
    description: 'Compare two texts',
    category: 'Text Tools',
    icon: 'GitCompare',
    path: '/tools/text-comparator',
    tags: ['text', 'compare', 'diff']
  },
  {
    id: 'text-merger',
    name: 'Text Merger',
    description: 'Merge multiple texts',
    category: 'Text Tools',
    icon: 'Merge',
    path: '/tools/text-merger',
    tags: ['text', 'merge', 'combine']
  },
  {
    id: 'text-splitter',
    name: 'Text Splitter',
    description: 'Split text into parts',
    category: 'Text Tools',
    icon: 'Scissors',
    path: '/tools/text-splitter',
    tags: ['text', 'split', 'divide']
  },
  {
    id: 'text-formatter',
    name: 'Text Formatter',
    description: 'Format text with styles',
    category: 'Text Tools',
    icon: 'AlignLeft',
    path: '/tools/text-formatter',
    tags: ['text', 'format', 'style']
  },
  {
    id: 'text-cleaner',
    name: 'Text Cleaner',
    description: 'Clean text from unwanted characters',
    category: 'Text Tools',
    icon: 'Trash2',
    path: '/tools/text-cleaner',
    tags: ['text', 'clean', 'remove']
  },
  {
    id: 'text-validator',
    name: 'Text Validator',
    description: 'Validate text format',
    category: 'Text Tools',
    icon: 'CheckCircle',
    path: '/tools/text-validator',
    tags: ['text', 'validate', 'format']
  },
  {
    id: 'text-encryptor',
    name: 'Text Encryptor',
    description: 'Encrypt text with password',
    category: 'Text Tools',
    icon: 'Lock',
    path: '/tools/text-encryptor',
    tags: ['text', 'encrypt', 'security']
  },
  {
    id: 'text-decryptor',
    name: 'Text Decryptor',
    description: 'Decrypt encrypted text',
    category: 'Text Tools',
    icon: 'Unlock',
    path: '/tools/text-decryptor',
    tags: ['text', 'decrypt', 'security']
  },
  {
    id: 'text-to-binary',
    name: 'Text to Binary',
    description: 'Convert text to binary',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-binary',
    tags: ['text', 'binary', 'convert']
  },
  {
    id: 'binary-to-text',
    name: 'Binary to Text',
    description: 'Convert binary to text',
    category: 'Text Tools',
    icon: 'Type',
    path: '/tools/binary-to-text',
    tags: ['binary', 'text', 'convert']
  },
  {
    id: 'text-to-morse',
    name: 'Text to Morse Code',
    description: 'Convert text to Morse code',
    category: 'Text Tools',
    icon: 'Radio',
    path: '/tools/text-to-morse',
    tags: ['text', 'morse', 'convert']
  },
  {
    id: 'morse-to-text',
    name: 'Morse Code to Text',
    description: 'Convert Morse code to text',
    category: 'Text Tools',
    icon: 'Radio',
    path: '/tools/morse-to-text',
    tags: ['morse', 'text', 'convert']
  },
  {
    id: 'text-to-leet',
    name: 'Text to Leet Speak',
    description: 'Convert text to leet speak',
    category: 'Text Tools',
    icon: 'Zap',
    path: '/tools/text-to-leet',
    tags: ['text', 'leet', 'convert']
  },
  {
    id: 'leet-to-text',
    name: 'Leet Speak to Text',
    description: 'Convert leet speak to text',
    category: 'Text Tools',
    icon: 'Zap',
    path: '/tools/leet-to-text',
    tags: ['leet', 'text', 'convert']
  },
  {
    id: 'text-to-emoji',
    name: 'Text to Emoji',
    description: 'Convert text to emoji',
    category: 'Text Tools',
    icon: 'Smile',
    path: '/tools/text-to-emoji',
    tags: ['text', 'emoji', 'convert']
  },
  {
    id: 'emoji-to-text',
    name: 'Emoji to Text',
    description: 'Convert emoji to text',
    category: 'Text Tools',
    icon: 'Frown',
    path: '/tools/emoji-to-text',
    tags: ['emoji', 'text', 'convert']
  },
  {
    id: 'text-to-ascii-art',
    name: 'Text to ASCII Art',
    description: 'Convert text to ASCII art',
    category: 'Text Tools',
    icon: 'Image',
    path: '/tools/text-to-ascii-art',
    tags: ['text', 'ascii', 'art']
  },
  {
    id: 'ascii-art-to-text',
    name: 'ASCII Art to Text',
    description: 'Convert ASCII art to text',
    category: 'Text Tools',
    icon: 'Type',
    path: '/tools/ascii-art-to-text',
    tags: ['ascii', 'art', 'text']
  },
  {
    id: 'text-to-upside-down',
    name: 'Text to Upside Down',
    description: 'Flip text upside down',
    category: 'Text Tools',
    icon: 'RotateCw',
    path: '/tools/text-to-upside-down',
    tags: ['text', 'upside', 'down', 'flip']
  },
  {
    id: 'upside-down-to-text',
    name: 'Upside Down to Text',
    description: 'Convert upside down text to normal',
    category: 'Text Tools',
    icon: 'RotateCcw',
    path: '/tools/upside-down-to-text',
    tags: ['upside', 'down', 'text', 'convert']
  },
  {
    id: 'text-to-zalgo',
    name: 'Text to Zalgo',
    description: 'Convert text to Zalgo text',
    category: 'Text Tools',
    icon: 'Zap',
    path: '/tools/text-to-zalgo',
    tags: ['text', 'zalgo', 'convert']
  },
  {
    id: 'zalgo-to-text',
    name: 'Zalgo to Text',
    description: 'Convert Zalgo text to normal',
    category: 'Text Tools',
    icon: 'ZapOff',
    path: '/tools/zalgo-to-text',
    tags: ['zalgo', 'text', 'convert']
  },
  {
    id: 'text-to-braille',
    name: 'Text to Braille',
    description: 'Convert text to Braille',
    category: 'Text Tools',
    icon: 'Fingerprint',
    path: '/tools/text-to-braille',
    tags: ['text', 'braille', 'convert']
  },
  {
    id: 'braille-to-text',
    name: 'Braille to Text',
    description: 'Convert Braille to text',
    category: 'Text Tools',
    icon: 'Type',
    path: '/tools/braille-to-text',
    tags: ['braille', 'text', 'convert']
  },
  {
    id: 'text-to-pig-latin',
    name: 'Text to Pig Latin',
    description: 'Convert text to Pig Latin',
    category: 'Text Tools',
    icon: 'PiggyBank',
    path: '/tools/text-to-pig-latin',
    tags: ['text', 'pig', 'latin', 'convert']
  },
  {
    id: 'pig-latin-to-text',
    name: 'Pig Latin to Text',
    description: 'Convert Pig Latin to text',
    category: 'Text Tools',
    icon: 'PiggyBank',
    path: '/tools/pig-latin-to-text',
    tags: ['pig', 'latin', 'text', 'convert']
  },
  {
    id: 'text-to-nato',
    name: 'Text to NATO Phonetic',
    description: 'Convert text to NATO phonetic alphabet',
    category: 'Text Tools',
    icon: 'Radio',
    path: '/tools/text-to-nato',
    tags: ['text', 'nato', 'phonetic', 'convert']
  },
  {
    id: 'nato-to-text',
    name: 'NATO Phonetic to Text',
    description: 'Convert NATO phonetic to text',
    category: 'Text Tools',
    icon: 'Radio',
    path: '/tools/nato-to-text',
    tags: ['nato', 'phonetic', 'text', 'convert']
  },
  {
    id: 'text-to-roman',
    name: 'Text to Roman Numerals',
    description: 'Convert numbers to Roman numerals',
    category: 'Text Tools',
    icon: 'Hash',
    path: '/tools/text-to-roman',
    tags: ['text', 'roman', 'numerals', 'convert']
  },
  {
    id: 'roman-to-text',
    name: 'Roman Numerals to Text',
    description: 'Convert Roman numerals to numbers',
    category: 'Text Tools',
    icon: 'Hash',
    path: '/tools/roman-to-text',
    tags: ['roman', 'numerals', 'text', 'convert']
  },
  {
    id: 'text-to-hex',
    name: 'Text to Hex',
    description: 'Convert text to hexadecimal',
    category: 'Text Tools',
    icon: 'Hash',
    path: '/tools/text-to-hex',
    tags: ['text', 'hex', 'convert']
  },
  {
    id: 'hex-to-text',
    name: 'Hex to Text',
    description: 'Convert hexadecimal to text',
    category: 'Text Tools',
    icon: 'Type',
    path: '/tools/hex-to-text',
    tags: ['hex', 'text', 'convert']
  },
  {
    id: 'text-to-octal',
    name: 'Text to Octal',
    description: 'Convert text to octal',
    category: 'Text Tools',
    icon: 'Hash',
    path: '/tools/text-to-octal',
    tags: ['text', 'octal', 'convert']
  },
  {
    id: 'octal-to-text',
    name: 'Octal to Text',
    description: 'Convert octal to text',
    category: 'Text Tools',
    icon: 'Type',
    path: '/tools/octal-to-text',
    tags: ['octal', 'text', 'convert']
  },
  {
    id: 'text-to-base32',
    name: 'Text to Base32',
    description: 'Convert text to Base32',
    category: 'Text Tools',
    icon: 'Hash',
    path: '/tools/text-to-base32',
    tags: ['text', 'base32', 'convert']
  },
  {
    id: 'base32-to-text',
    name: 'Base32 to Text',
    description: 'Convert Base32 to text',
    category: 'Text Tools',
    icon: 'Type',
    path: '/tools/base32-to-text',
    tags: ['base32', 'text', 'convert']
  },
  {
    id: 'text-to-base58',
    name: 'Text to Base58',
    description: 'Convert text to Base58',
    category: 'Text Tools',
    icon: 'Hash',
    path: '/tools/text-to-base58',
    tags: ['text', 'base58', 'convert']
  },
  {
    id: 'base58-to-text',
    name: 'Base58 to Text',
    description: 'Convert Base58 to text',
    category: 'Text Tools',
    icon: 'Type',
    path: '/tools/base58-to-text',
    tags: ['base58', 'text', 'convert']
  },
  {
    id: 'text-to-base62',
    name: 'Text to Base62',
    description: 'Convert text to Base62',
    category: 'Text Tools',
    icon: 'Hash',
    path: '/tools/text-to-base62',
    tags: ['text', 'base62', 'convert']
  },
  {
    id: 'base62-to-text',
    name: 'Base62 to Text',
    description: 'Convert Base62 to text',
    category: 'Text Tools',
    icon: 'Type',
    path: '/tools/base62-to-text',
    tags: ['base62', 'text', 'convert']
  },
  {
    id: 'text-to-base64-url',
    name: 'Text to Base64 URL',
    description: 'Convert text to Base64 URL-safe',
    category: 'Text Tools',
    icon: 'Hash',
    path: '/tools/text-to-base64-url',
    tags: ['text', 'base64', 'url', 'convert']
  },
  {
    id: 'base64-url-to-text',
    name: 'Base64 URL to Text',
    description: 'Convert Base64 URL-safe to text',
    category: 'Text Tools',
    icon: 'Type',
    path: '/tools/base64-url-to-text',
    tags: ['base64', 'url', 'text', 'convert']
  },
  {
    id: 'text-to-quoted-printable',
    name: 'Text to Quoted Printable',
    description: 'Convert text to quoted printable',
    category: 'Text Tools',
    icon: 'Mail',
    path: '/tools/text-to-quoted-printable',
    tags: ['text', 'quoted', 'printable', 'convert']
  },
  {
    id: 'quoted-printable-to-text',
    name: 'Quoted Printable to Text',
    description: 'Convert quoted printable to text',
    category: 'Text Tools',
    icon: 'Mail',
    path: '/tools/quoted-printable-to-text',
    tags: ['quoted', 'printable', 'text', 'convert']
  },
  {
    id: 'text-to-punycode',
    name: 'Text to Punycode',
    description: 'Convert text to Punycode',
    category: 'Text Tools',
    icon: 'Globe',
    path: '/tools/text-to-punycode',
    tags: ['text', 'punycode', 'convert']
  },
  {
    id: 'punycode-to-text',
    name: 'Punycode to Text',
    description: 'Convert Punycode to text',
    category: 'Text Tools',
    icon: 'Globe',
    path: '/tools/punycode-to-text',
    tags: ['punycode', 'text', 'convert']
  },
  {
    id: 'text-to-idn',
    name: 'Text to IDN',
    description: 'Convert text to Internationalized Domain Name',
    category: 'Text Tools',
    icon: 'Globe',
    path: '/tools/text-to-idn',
    tags: ['text', 'idn', 'domain', 'convert']
  },
  {
    id: 'idn-to-text',
    name: 'IDN to Text',
    description: 'Convert IDN to text',
    category: 'Text Tools',
    icon: 'Globe',
    path: '/tools/idn-to-text',
    tags: ['idn', 'text', 'domain', 'convert']
  },
  {
    id: 'text-to-slug',
    name: 'Text to Slug',
    description: 'Convert text to URL slug',
    category: 'Text Tools',
    icon: 'Link',
    path: '/tools/text-to-slug',
    tags: ['text', 'slug', 'url', 'convert']
  },
  {
    id: 'slug-to-text',
    name: 'Slug to Text',
    description: 'Convert URL slug to text',
    category: 'Text Tools',
    icon: 'Link',
    path: '/tools/slug-to-text',
    tags: ['slug', 'text', 'url', 'convert']
  },
  {
    id: 'text-to-hashtag',
    name: 'Text to Hashtag',
    description: 'Convert text to hashtag',
    category: 'Text Tools',
    icon: 'Hash',
    path: '/tools/text-to-hashtag',
    tags: ['text', 'hashtag', 'social', 'convert']
  },
  {
    id: 'hashtag-to-text',
    name: 'Hashtag to Text',
    description: 'Convert hashtag to text',
    category: 'Text Tools',
    icon: 'Hash',
    path: '/tools/hashtag-to-text',
    tags: ['hashtag', 'text', 'social', 'convert']
  },
  {
    id: 'text-to-mention',
    name: 'Text to Mention',
    description: 'Convert text to social mention',
    category: 'Text Tools',
    icon: 'AtSign',
    path: '/tools/text-to-mention',
    tags: ['text', 'mention', 'social', 'convert']
  },
  {
    id: 'mention-to-text',
    name: 'Mention to Text',
    description: 'Convert social mention to text',
    category: 'Text Tools',
    icon: 'AtSign',
    path: '/tools/mention-to-text',
    tags: ['mention', 'text', 'social', 'convert']
  },
  {
    id: 'text-to-username',
    name: 'Text to Username',
    description: 'Convert text to username format',
    category: 'Text Tools',
    icon: 'User',
    path: '/tools/text-to-username',
    tags: ['text', 'username', 'convert']
  },
  {
    id: 'username-to-text',
    name: 'Username to Text',
    description: 'Convert username to text',
    category: 'Text Tools',
    icon: 'User',
    path: '/tools/username-to-text',
    tags: ['username', 'text', 'convert']
  },
  {
    id: 'text-to-email',
    name: 'Text to Email',
    description: 'Convert text to email format',
    category: 'Text Tools',
    icon: 'Mail',
    path: '/tools/text-to-email',
    tags: ['text', 'email', 'convert']
  },
  {
    id: 'email-to-text',
    name: 'Email to Text',
    description: 'Convert email to text',
    category: 'Text Tools',
    icon: 'Mail',
    path: '/tools/email-to-text',
    tags: ['email', 'text', 'convert']
  },
  {
    id: 'text-to-phone',
    name: 'Text to Phone',
    description: 'Convert text to phone format',
    category: 'Text Tools',
    icon: 'Phone',
    path: '/tools/text-to-phone',
    tags: ['text', 'phone', 'convert']
  },
  {
    id: 'phone-to-text',
    name: 'Phone to Text',
    description: 'Convert phone to text',
    category: 'Text Tools',
    icon: 'Phone',
    path: '/tools/phone-to-text',
    tags: ['phone', 'text', 'convert']
  },
  {
    id: 'text-to-date',
    name: 'Text to Date',
    description: 'Convert text to date format',
    category: 'Text Tools',
    icon: 'Calendar',
    path: '/tools/text-to-date',
    tags: ['text', 'date', 'convert']
  },
  {
    id: 'date-to-text',
    name: 'Date to Text',
    description: 'Convert date to text',
    category: 'Text Tools',
    icon: 'Calendar',
    path: '/tools/date-to-text',
    tags: ['date', 'text', 'convert']
  },
  {
    id: 'text-to-time',
    name: 'Text to Time',
    description: 'Convert text to time format',
    category: 'Text Tools',
    icon: 'Clock',
    path: '/tools/text-to-time',
    tags: ['text', 'time', 'convert']
  },
  {
    id: 'time-to-text',
    name: 'Time to Text',
    description: 'Convert time to text',
    category: 'Text Tools',
    icon: 'Clock',
    path: '/tools/time-to-text',
    tags: ['time', 'text', 'convert']
  },
  {
    id: 'text-to-currency',
    name: 'Text to Currency',
    description: 'Convert text to currency format',
    category: 'Text Tools',
    icon: 'DollarSign',
    path: '/tools/text-to-currency',
    tags: ['text', 'currency', 'convert']
  },
  {
    id: 'currency-to-text',
    name: 'Currency to Text',
    description: 'Convert currency to text',
    category: 'Text Tools',
    icon: 'DollarSign',
    path: '/tools/currency-to-text',
    tags: ['currency', 'text', 'convert']
  },
  {
    id: 'text-to-percentage',
    name: 'Text to Percentage',
    description: 'Convert text to percentage format',
    category: 'Text Tools',
    icon: 'Percent',
    path: '/tools/text-to-percentage',
    tags: ['text', 'percentage', 'convert']
  },
  {
    id: 'percentage-to-text',
    name: 'Percentage to Text',
    description: 'Convert percentage to text',
    category: 'Text Tools',
    icon: 'Percent',
    path: '/tools/percentage-to-text',
    tags: ['percentage', 'text', 'convert']
  },
  {
    id: 'text-to-fraction',
    name: 'Text to Fraction',
    description: 'Convert text to fraction format',
    category: 'Text Tools',
    icon: 'Divide',
    path: '/tools/text-to-fraction',
    tags: ['text', 'fraction', 'convert']
  },
  {
    id: 'fraction-to-text',
    name: 'Fraction to Text',
    description: 'Convert fraction to text',
    category: 'Text Tools',
    icon: 'Divide',
    path: '/tools/fraction-to-text',
    tags: ['fraction', 'text', 'convert']
  },
  {
    id: 'text-to-scientific',
    name: 'Text to Scientific',
    description: 'Convert text to scientific notation',
    category: 'Text Tools',
    icon: 'FlaskConical',
    path: '/tools/text-to-scientific',
    tags: ['text', 'scientific', 'notation', 'convert']
  },
  {
    id: 'scientific-to-text',
    name: 'Scientific to Text',
    description: 'Convert scientific notation to text',
    category: 'Text Tools',
    icon: 'FlaskConical',
    path: '/tools/scientific-to-text',
    tags: ['scientific', 'notation', 'text', 'convert']
  },
  {
    id: 'text-to-engineering',
    name: 'Text to Engineering',
    description: 'Convert text to engineering notation',
    category: 'Text Tools',
    icon: 'Wrench',
    path: '/tools/text-to-engineering',
    tags: ['text', 'engineering', 'notation', 'convert']
  },
  {
    id: 'engineering-to-text',
    name: 'Engineering to Text',
    description: 'Convert engineering notation to text',
    category: 'Text Tools',
    icon: 'Wrench',
    path: '/tools/engineering-to-text',
    tags: ['engineering', 'notation', 'text', 'convert']
  },
  {
    id: 'text-to-words',
    name: 'Text to Words',
    description: 'Convert numbers to words',
    category: 'Text Tools',
    icon: 'Type',
    path: '/tools/text-to-words',
    tags: ['text', 'words', 'numbers', 'convert']
  },
  {
    id: 'words-to-text',
    name: 'Words to Text',
    description: 'Convert words to numbers',
    category: 'Text Tools',
    icon: 'Hash',
    path: '/tools/words-to-text',
    tags: ['words', 'text', 'numbers', 'convert']
  },
  {
    id: 'text-to-ordinal',
    name: 'Text to Ordinal',
    description: 'Convert numbers to ordinal words',
    category: 'Text Tools',
    icon: 'ListOrdered',
    path: '/tools/text-to-ordinal',
    tags: ['text', 'ordinal', 'numbers', 'convert']
  },
  {
    id: 'ordinal-to-text',
    name: 'Ordinal to Text',
    description: 'Convert ordinal words to numbers',
    category: 'Text Tools',
    icon: 'ListOrdered',
    path: '/tools/ordinal-to-text',
    tags: ['ordinal', 'text', 'numbers', 'convert']
  },
  {
    id: 'text-to-cardinal',
    name: 'Text to Cardinal',
    description: 'Convert numbers to cardinal words',
    category: 'Text Tools',
    icon: 'Hash',
    path: '/tools/text-to-cardinal',
    tags: ['text', 'cardinal', 'numbers', 'convert']
  },
  {
    id: 'cardinal-to-text',
    name: 'Cardinal to Text',
    description: 'Convert cardinal words to numbers',
    category: 'Text Tools',
    icon: 'Hash',
    path: '/tools/cardinal-to-text',
    tags: ['cardinal', 'text', 'numbers', 'convert']
  },
  {
    id: 'text-to-roman-numerals',
    name: 'Text to Roman Numerals',
    description: 'Convert numbers to Roman numerals',
    category: 'Text Tools',
    icon: 'Hash',
    path: '/tools/text-to-roman-numerals',
    tags: ['text', 'roman', 'numerals', 'convert']
  },
  {
    id: 'roman-numerals-to-text',
    name: 'Roman Numerals to Text',
    description: 'Convert Roman numerals to numbers',
    category: 'Text Tools',
    icon: 'Hash',
    path: '/tools/roman-numerals-to-text',
    tags: ['roman', 'numerals', 'text', 'convert']
  },
  {
    id: 'text-to-binary-coded-decimal',
    name: 'Text to Binary Coded Decimal',
    description: 'Convert text to binary coded decimal',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-binary-coded-decimal',
    tags: ['text', 'binary', 'decimal', 'convert']
  },
  {
    id: 'binary-coded-decimal-to-text',
    name: 'Binary Coded Decimal to Text',
    description: 'Convert binary coded decimal to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/binary-coded-decimal-to-text',
    tags: ['binary', 'decimal', 'text', 'convert']
  },
  {
    id: 'text-to-gray-code',
    name: 'Text to Gray Code',
    description: 'Convert text to Gray code',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-gray-code',
    tags: ['text', 'gray', 'code', 'convert']
  },
  {
    id: 'gray-code-to-text',
    name: 'Gray Code to Text',
    description: 'Convert Gray code to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/gray-code-to-text',
    tags: ['gray', 'code', 'text', 'convert']
  },
  {
    id: 'text-to-excess-3',
    name: 'Text to Excess-3',
    description: 'Convert text to Excess-3 code',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-excess-3',
    tags: ['text', 'excess3', 'code', 'convert']
  },
  {
    id: 'excess-3-to-text',
    name: 'Excess-3 to Text',
    description: 'Convert Excess-3 code to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/excess-3-to-text',
    tags: ['excess3', 'code', 'text', 'convert']
  },
  {
    id: 'text-to-bcd',
    name: 'Text to BCD',
    description: 'Convert text to BCD code',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-bcd',
    tags: ['text', 'bcd', 'code', 'convert']
  },
  {
    id: 'bcd-to-text',
    name: 'BCD to Text',
    description: 'Convert BCD code to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/bcd-to-text',
    tags: ['bcd', 'code', 'text', 'convert']
  },
  {
    id: 'text-to-ebcdic',
    name: 'Text to EBCDIC',
    description: 'Convert text to EBCDIC',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-ebcdic',
    tags: ['text', 'ebcdic', 'convert']
  },
  {
    id: 'ebcdic-to-text',
    name: 'EBCDIC to Text',
    description: 'Convert EBCDIC to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/ebcdic-to-text',
    tags: ['ebcdic', 'text', 'convert']
  },
  {
    id: 'text-to-ascii85',
    name: 'Text to ASCII85',
    description: 'Convert text to ASCII85',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-ascii85',
    tags: ['text', 'ascii85', 'convert']
  },
  {
    id: 'ascii85-to-text',
    name: 'ASCII85 to Text',
    description: 'Convert ASCII85 to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/ascii85-to-text',
    tags: ['ascii85', 'text', 'convert']
  },
  {
    id: 'text-to-uue',
    name: 'Text to UUE',
    description: 'Convert text to UUEncode',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-uue',
    tags: ['text', 'uue', 'encode', 'convert']
  },
  {
    id: 'uue-to-text',
    name: 'UUE to Text',
    description: 'Convert UUEncode to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/uue-to-text',
    tags: ['uue', 'text', 'decode', 'convert']
  },
  {
    id: 'text-to-xxencode',
    name: 'Text to XXEncode',
    description: 'Convert text to XXEncode',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-xxencode',
    tags: ['text', 'xxencode', 'convert']
  },
  {
    id: 'xxencode-to-text',
    name: 'XXEncode to Text',
    description: 'Convert XXEncode to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/xxencode-to-text',
    tags: ['xxencode', 'text', 'convert']
  },
  {
    id: 'text-to-binhex',
    name: 'Text to BinHex',
    description: 'Convert text to BinHex',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-binhex',
    tags: ['text', 'binhex', 'convert']
  },
  {
    id: 'binhex-to-text',
    name: 'BinHex to Text',
    description: 'Convert BinHex to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/binhex-to-text',
    tags: ['binhex', 'text', 'convert']
  },
  {
    id: 'text-to-asc',
    name: 'Text to ASC',
    description: 'Convert text to ASC code',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-asc',
    tags: ['text', 'asc', 'code', 'convert']
  },
  {
    id: 'asc-to-text',
    name: 'ASC to Text',
    description: 'Convert ASC code to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/asc-to-text',
    tags: ['asc', 'code', 'text', 'convert']
  },
  {
    id: 'text-to-iscii',
    name: 'Text to ISCII',
    description: 'Convert text to ISCII',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-iscii',
    tags: ['text', 'iscii', 'convert']
  },
  {
    id: 'iscii-to-text',
    name: 'ISCII to Text',
    description: 'Convert ISCII to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/iscii-to-text',
    tags: ['iscii', 'text', 'convert']
  },
  {
    id: 'text-to-vni',
    name: 'Text to VNI',
    description: 'Convert text to VNI encoding',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-vni',
    tags: ['text', 'vni', 'encoding', 'convert']
  },
  {
    id: 'vni-to-text',
    name: 'VNI to Text',
    description: 'Convert VNI encoding to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/vni-to-text',
    tags: ['vni', 'text', 'encoding', 'convert']
  },
  {
    id: 'text-to-tcvn3',
    name: 'Text to TCVN3',
    description: 'Convert text to TCVN3 encoding',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-tcvn3',
    tags: ['text', 'tcvn3', 'encoding', 'convert']
  },
  {
    id: 'tcvn3-to-text',
    name: 'TCVN3 to Text',
    description: 'Convert TCVN3 encoding to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/tcvn3-to-text',
    tags: ['tcvn3', 'text', 'encoding', 'convert']
  },
  {
    id: 'text-to-vps',
    name: 'Text to VPS',
    description: 'Convert text to VPS encoding',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-vps',
    tags: ['text', 'vps', 'encoding', 'convert']
  },
  {
    id: 'vps-to-text',
    name: 'VPS to Text',
    description: 'Convert VPS encoding to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/vps-to-text',
    tags: ['vps', 'text', 'encoding', 'convert']
  },
  {
    id: 'text-to-unicode',
    name: 'Text to Unicode',
    description: 'Convert text to Unicode code points',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-unicode',
    tags: ['text', 'unicode', 'convert']
  },
  {
    id: 'unicode-to-text',
    name: 'Unicode to Text',
    description: 'Convert Unicode code points to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/unicode-to-text',
    tags: ['unicode', 'text', 'convert']
  },
  {
    id: 'text-to-utf8',
    name: 'Text to UTF-8',
    description: 'Convert text to UTF-8 bytes',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-utf8',
    tags: ['text', 'utf8', 'convert']
  },
  {
    id: 'utf8-to-text',
    name: 'UTF-8 to Text',
    description: 'Convert UTF-8 bytes to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/utf8-to-text',
    tags: ['utf8', 'text', 'convert']
  },
  {
    id: 'text-to-utf16',
    name: 'Text to UTF-16',
    description: 'Convert text to UTF-16 bytes',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-utf16',
    tags: ['text', 'utf16', 'convert']
  },
  {
    id: 'utf16-to-text',
    name: 'UTF-16 to Text',
    description: 'Convert UTF-16 bytes to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/utf16-to-text',
    tags: ['utf16', 'text', 'convert']
  },
  {
    id: 'text-to-utf32',
    name: 'Text to UTF-32',
    description: 'Convert text to UTF-32 bytes',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-utf32',
    tags: ['text', 'utf32', 'convert']
  },
  {
    id: 'utf32-to-text',
    name: 'UTF-32 to Text',
    description: 'Convert UTF-32 bytes to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/utf32-to-text',
    tags: ['utf32', 'text', 'convert']
  },
  {
    id: 'text-to-utf7',
    name: 'Text to UTF-7',
    description: 'Convert text to UTF-7',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-utf7',
    tags: ['text', 'utf7', 'convert']
  },
  {
    id: 'utf7-to-text',
    name: 'UTF-7 to Text',
    description: 'Convert UTF-7 to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/utf7-to-text',
    tags: ['utf7', 'text', 'convert']
  },
  {
    id: 'text-to-utf1',
    name: 'Text to UTF-1',
    description: 'Convert text to UTF-1',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-utf1',
    tags: ['text', 'utf1', 'convert']
  },
  {
    id: 'utf1-to-text',
    name: 'UTF-1 to Text',
    description: 'Convert UTF-1 to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/utf1-to-text',
    tags: ['utf1', 'text', 'convert']
  },
  {
    id: 'text-to-cesu8',
    name: 'Text to CESU-8',
    description: 'Convert text to CESU-8',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-cesu8',
    tags: ['text', 'cesu8', 'convert']
  },
  {
    id: 'cesu8-to-text',
    name: 'CESU-8 to Text',
    description: 'Convert CESU-8 to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/cesu8-to-text',
    tags: ['cesu8', 'text', 'convert']
  },
  {
    id: 'text-to-scsu',
    name: 'Text to SCSU',
    description: 'Convert text to SCSU',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-scsu',
    tags: ['text', 'scsu', 'convert']
  },
  {
    id: 'scsu-to-text',
    name: 'SCSU to Text',
    description: 'Convert SCSU to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/scsu-to-text',
    tags: ['scsu', 'text', 'convert']
  },
  {
    id: 'text-to-bocu1',
    name: 'Text to BOCU-1',
    description: 'Convert text to BOCU-1',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-bocu1',
    tags: ['text', 'bocu1', 'convert']
  },
  {
    id: 'bocu1-to-text',
    name: 'BOCU-1 to Text',
    description: 'Convert BOCU-1 to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/bocu1-to-text',
    tags: ['bocu1', 'text', 'convert']
  },
  {
    id: 'text-to-punycode2',
    name: 'Text to Punycode2',
    description: 'Convert text to Punycode2',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-punycode2',
    tags: ['text', 'punycode2', 'convert']
  },
  {
    id: 'punycode2-to-text',
    name: 'Punycode2 to Text',
    description: 'Convert Punycode2 to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/punycode2-to-text',
    tags: ['punycode2', 'text', 'convert']
  },
  {
    id: 'text-to-idn2',
    name: 'Text to IDN2',
    description: 'Convert text to IDN2',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-idn2',
    tags: ['text', 'idn2', 'convert']
  },
  {
    id: 'idn2-to-text',
    name: 'IDN2 to Text',
    description: 'Convert IDN2 to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/idn2-to-text',
    tags: ['idn2', 'text', 'convert']
  },
  {
    id: 'text-to-utf16be',
    name: 'Text to UTF-16BE',
    description: 'Convert text to UTF-16BE',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-utf16be',
    tags: ['text', 'utf16be', 'convert']
  },
  {
    id: 'utf16be-to-text',
    name: 'UTF-16BE to Text',
    description: 'Convert UTF-16BE to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/utf16be-to-text',
    tags: ['utf16be', 'text', 'convert']
  },
  {
    id: 'text-to-utf16le',
    name: 'Text to UTF-16LE',
    description: 'Convert text to UTF-16LE',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-utf16le',
    tags: ['text', 'utf16le', 'convert']
  },
  {
    id: 'utf16le-to-text',
    name: 'UTF-16LE to Text',
    description: 'Convert UTF-16LE to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/utf16le-to-text',
    tags: ['utf16le', 'text', 'convert']
  },
  {
    id: 'text-to-utf32be',
    name: 'Text to UTF-32BE',
    description: 'Convert text to UTF-32BE',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-utf32be',
    tags: ['text', 'utf32be', 'convert']
  },
  {
    id: 'utf32be-to-text',
    name: 'UTF-32BE to Text',
    description: 'Convert UTF-32BE to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/utf32be-to-text',
    tags: ['utf32be', 'text', 'convert']
  },
  {
    id: 'text-to-utf32le',
    name: 'Text to UTF-32LE',
    description: 'Convert text to UTF-32LE',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-utf32le',
    tags: ['text', 'utf32le', 'convert']
  },
  {
    id: 'utf32le-to-text',
    name: 'UTF-32LE to Text',
    description: 'Convert UTF-32LE to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/utf32le-to-text',
    tags: ['utf32le', 'text', 'convert']
  },
  {
    id: 'text-to-utf7imap',
    name: 'Text to UTF-7IMAP',
    description: 'Convert text to UTF-7IMAP',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-utf7imap',
    tags: ['text', 'utf7imap', 'convert']
  },
  {
    id: 'utf7imap-to-text',
    name: 'UTF-7IMAP to Text',
    description: 'Convert UTF-7IMAP to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/utf7imap-to-text',
    tags: ['utf7imap', 'text', 'convert']
  },
  {
    id: 'text-to-utf8mac',
    name: 'Text to UTF8-MAC',
    description: 'Convert text to UTF8-MAC',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-utf8mac',
    tags: ['text', 'utf8mac', 'convert']
  },
  {
    id: 'utf8mac-to-text',
    name: 'UTF8-MAC to Text',
    description: 'Convert UTF8-MAC to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/utf8mac-to-text',
    tags: ['utf8mac', 'text', 'convert']
  },
  {
    id: 'text-to-utf8hfs',
    name: 'Text to UTF8-HFS',
    description: 'Convert text to UTF8-HFS',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-utf8hfs',
    tags: ['text', 'utf8hfs', 'convert']
  },
  {
    id: 'utf8hfs-to-text',
    name: 'UTF8-HFS to Text',
    description: 'Convert UTF8-HFS to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/utf8hfs-to-text',
    tags: ['utf8hfs', 'text', 'convert']
  },
  {
    id: 'text-to-utf8jis',
    name: 'Text to UTF8-JIS',
    description: 'Convert text to UTF8-JIS',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-utf8jis',
    tags: ['text', 'utf8jis', 'convert']
  },
  {
    id: 'utf8jis-to-text',
    name: 'UTF8-JIS to Text',
    description: 'Convert UTF8-JIS to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/utf8jis-to-text',
    tags: ['utf8jis', 'text', 'convert']
  },
  {
    id: 'text-to-utf8sjis',
    name: 'Text to UTF8-SJIS',
    description: 'Convert text to UTF8-SJIS',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-utf8sjis',
    tags: ['text', 'utf8sjis', 'convert']
  },
  {
    id: 'utf8sjis-to-text',
    name: 'UTF8-SJIS to Text',
    description: 'Convert UTF8-SJIS to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/utf8sjis-to-text',
    tags: ['utf8sjis', 'text', 'convert']
  },
  {
    id: 'text-to-utf8euc',
    name: 'Text to UTF8-EUC',
    description: 'Convert text to UTF8-EUC',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-utf8euc',
    tags: ['text', 'utf8euc', 'convert']
  },
  {
    id: 'utf8euc-to-text',
    name: 'UTF8-EUC to Text',
    description: 'Convert UTF8-EUC to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/utf8euc-to-text',
    tags: ['utf8euc', 'text', 'convert']
  },
  {
    id: 'text-to-utf8iso',
    name: 'Text to UTF8-ISO',
    description: 'Convert text to UTF8-ISO',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-utf8iso',
    tags: ['text', 'utf8iso', 'convert']
  },
  {
    id: 'utf8iso-to-text',
    name: 'UTF8-ISO to Text',
    description: 'Convert UTF8-ISO to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/utf8iso-to-text',
    tags: ['utf8iso', 'text', 'convert']
  },
  {
    id: 'text-to-utf8win',
    name: 'Text to UTF8-WIN',
    description: 'Convert text to UTF8-WIN',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-utf8win',
    tags: ['text', 'utf8win', 'convert']
  },
  {
    id: 'utf8win-to-text',
    name: 'UTF8-WIN to Text',
    description: 'Convert UTF8-WIN to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/utf8win-to-text',
    tags: ['utf8win', 'text', 'convert']
  },
  {
    id: 'text-to-utf8dos',
    name: 'Text to UTF8-DOS',
    description: 'Convert text to UTF8-DOS',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/text-to-utf8dos',
    tags: ['text', 'utf8dos', 'convert']
  },
  {
    id: 'utf8dos-to-text',
    name: 'UTF8-DOS to Text',
    description: 'Convert UTF8-DOS to text',
    category: 'Text Tools',
    icon: 'Binary',
    path: '/tools/utf8dos-to-text',
    tags: ['utf8dos', 'text', 'convert']
  },

  // Additional tools to reach 252+
  {
    id: 'password-strength-analyzer',
    name: 'Password Strength Analyzer',
    description: 'Analyze password strength and security',
    category: 'Security Tools',
    icon: 'Shield',
    path: '/tools/password-strength-analyzer',
    tags: ['password', 'strength', 'security', 'analyzer']
  },
  {
    id: 'ssl-checker',
    name: 'SSL Checker',
    description: 'Check SSL certificate information',
    category: 'Security Tools',
    icon: 'Lock',
    path: '/tools/ssl-checker',
    tags: ['ssl', 'certificate', 'security', 'checker']
  },
  {
    id: 'hash-comparator',
    name: 'Hash Comparator',
    description: 'Compare hash values',
    category: 'Security Tools',
    icon: 'Fingerprint',
    path: '/tools/hash-comparator',
    tags: ['hash', 'compare', 'security']
  },
  {
    id: 'random-password-generator',
    name: 'Random Password Generator',
    description: 'Generate secure random passwords',
    category: 'Security Tools',
    icon: 'Key',
    path: '/tools/random-password-generator',
    tags: ['password', 'generator', 'random', 'security']
  },
  {
    id: 'caesar-cipher',
    name: 'Caesar Cipher',
    description: 'Encode/decode using Caesar cipher',
    category: 'Security Tools',
    icon: 'Lock',
    path: '/tools/caesar-cipher',
    tags: ['cipher', 'caesar', 'encode', 'decode', 'security']
  },
  {
    id: 'vigenere-cipher',
    name: 'Vigenère Cipher',
    description: 'Encode/decode using Vigenère cipher',
    category: 'Security Tools',
    icon: 'Lock',
    path: '/tools/vigenere-cipher',
    tags: ['cipher', 'vigenere', 'encode', 'decode', 'security']
  },
  {
    id: 'rsa-generator',
    name: 'RSA Key Generator',
    description: 'Generate RSA key pairs',
    category: 'Security Tools',
    icon: 'Key',
    path: '/tools/rsa-generator',
    tags: ['rsa', 'key', 'generator', 'cryptography']
  },
  {
    id: 'timestamp-converter-advanced',
    name: 'Advanced Timestamp Converter',
    description: 'Convert between various timestamp formats',
    category: 'Time Tools',
    icon: 'Clock',
    path: '/tools/timestamp-converter-advanced',
    tags: ['timestamp', 'converter', 'time', 'advanced']
  },
  {
    id: 'unix-time-converter',
    name: 'Unix Time Converter',
    description: 'Convert Unix timestamps to human-readable dates',
    category: 'Time Tools',
    icon: 'Clock',
    path: '/tools/unix-time-converter',
    tags: ['unix', 'time', 'converter', 'timestamp']
  },
  {
    id: 'time-zone-database',
    name: 'Time Zone Database',
    description: 'Browse and search time zones',
    category: 'Time Tools',
    icon: 'Globe',
    path: '/tools/time-zone-database',
    tags: ['timezone', 'database', 'time', 'search']
  },
  {
    id: 'date-difference-calculator',
    name: 'Date Difference Calculator',
    description: 'Calculate difference between two dates',
    category: 'Time Tools',
    icon: 'Calendar',
    path: '/tools/date-difference-calculator',
    tags: ['date', 'difference', 'calculator', 'time']
  },
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    description: 'Calculate age from birth date',
    category: 'Time Tools',
    icon: 'Calendar',
    path: '/tools/age-calculator',
    tags: ['age', 'calculator', 'date', 'birth']
  },
  {
    id: 'timer-stopwatch',
    name: 'Timer & Stopwatch',
    description: 'Timer and stopwatch functionality',
    category: 'Time Tools',
    icon: 'Timer',
    path: '/tools/timer-stopwatch',
    tags: ['timer', 'stopwatch', 'time', 'countdown']
  },
  {
    id: 'world-clock',
    name: 'World Clock',
    description: 'Display time in different time zones',
    category: 'Time Tools',
    icon: 'Globe',
    path: '/tools/world-clock',
    tags: ['world', 'clock', 'timezone', 'time']
  },
  {
    id: 'cron-expression-generator',
    name: 'Cron Expression Generator',
    description: 'Generate and test cron expressions',
    category: 'Time Tools',
    icon: 'Clock',
    path: '/tools/cron-expression-generator',
    tags: ['cron', 'expression', 'generator', 'scheduler']
  },
  {
    id: 'html-entities-encoder',
    name: 'HTML Entities Encoder',
    description: 'Encode HTML entities',
    category: 'Web Tools',
    icon: 'Code',
    path: '/tools/html-entities-encoder',
    tags: ['html', 'entities', 'encoder', 'web']
  },
  {
    id: 'html-entities-decoder',
    name: 'HTML Entities Decoder',
    description: 'Decode HTML entities',
    category: 'Web Tools',
    icon: 'Code',
    path: '/tools/html-entities-decoder',
    tags: ['html', 'entities', 'decoder', 'web']
  },
  {
    id: 'url-encoder-advanced',
    name: 'Advanced URL Encoder',
    description: 'Encode URLs with advanced options',
    category: 'Web Tools',
    icon: 'Link',
    path: '/tools/url-encoder-advanced',
    tags: ['url', 'encoder', 'advanced', 'web']
  },
  {
    id: 'url-decoder-advanced',
    name: 'Advanced URL Decoder',
    description: 'Decode URLs with advanced options',
    category: 'Web Tools',
    icon: 'Link',
    path: '/tools/url-decoder-advanced',
    tags: ['url', 'decoder', 'advanced', 'web']
  },
  {
    id: 'user-agent-parser',
    name: 'User Agent Parser',
    description: 'Parse and analyze user agent strings',
    category: 'Web Tools',
    icon: 'Globe',
    path: '/tools/user-agent-parser',
    tags: ['user-agent', 'parser', 'browser', 'web']
  },
  {
    id: 'http-header-analyzer',
    name: 'HTTP Header Analyzer',
    description: 'Analyze HTTP headers',
    category: 'Web Tools',
    icon: 'Server',
    path: '/tools/http-header-analyzer',
    tags: ['http', 'header', 'analyzer', 'web']
  },
  {
    id: 'css-validator',
    name: 'CSS Validator',
    description: 'Validate CSS code',
    category: 'Web Tools',
    icon: 'Code',
    path: '/tools/css-validator',
    tags: ['css', 'validator', 'web', 'validation']
  },
  {
    id: 'html-validator',
    name: 'HTML Validator',
    description: 'Validate HTML code',
    category: 'Web Tools',
    icon: 'Code',
    path: '/tools/html-validator',
    tags: ['html', 'validator', 'web', 'validation']
  },
  {
    id: 'javascript-validator',
    name: 'JavaScript Validator',
    description: 'Validate JavaScript code',
    category: 'Web Tools',
    icon: 'Code',
    path: '/tools/javascript-validator',
    tags: ['javascript', 'validator', 'web', 'validation']
  },
  {
    id: 'sitemap-generator',
    name: 'Sitemap Generator',
    description: 'Generate XML sitemaps',
    category: 'Web Tools',
    icon: 'FileText',
    path: '/tools/sitemap-generator',
    tags: ['sitemap', 'generator', 'xml', 'seo']
  },
  {
    id: 'robots-txt-generator',
    name: 'Robots.txt Generator',
    description: 'Generate robots.txt files',
    category: 'Web Tools',
    icon: 'FileText',
    path: '/tools/robots-txt-generator',
    tags: ['robots', 'txt', 'generator', 'seo']
  },
  {
    id: 'favicon-generator',
    name: 'Favicon Generator',
    description: 'Generate favicons from images',
    category: 'Web Tools',
    icon: 'Image',
    path: '/tools/favicon-generator',
    tags: ['favicon', 'generator', 'image', 'web']
  },
  {
    id: 'qr-code-generator-advanced',
    name: 'Advanced QR Code Generator',
    description: 'Generate QR codes with advanced options',
    category: 'Web Tools',
    icon: 'QrCode',
    path: '/tools/qr-code-generator-advanced',
    tags: ['qr', 'code', 'generator', 'advanced']
  },
  {
    id: 'color-palette-generator',
    name: 'Color Palette Generator',
    description: 'Generate color palettes',
    category: 'Design Tools',
    icon: 'Palette',
    path: '/tools/color-palette-generator',
    tags: ['color', 'palette', 'generator', 'design']
  },
  {
    id: 'color-blindness-simulator',
    name: 'Color Blindness Simulator',
    description: 'Simulate color blindness',
    category: 'Design Tools',
    icon: 'Eye',
    path: '/tools/color-blindness-simulator',
    tags: ['color', 'blindness', 'simulator', 'accessibility']
  },
  {
    id: 'css-gradient-generator',
    name: 'CSS Gradient Generator',
    description: 'Generate CSS gradients',
    category: 'Design Tools',
    icon: 'Palette',
    path: '/tools/css-gradient-generator',
    tags: ['css', 'gradient', 'generator', 'design']
  },
  {
    id: 'box-shadow-generator',
    name: 'Box Shadow Generator',
    description: 'Generate CSS box shadows',
    category: 'Design Tools',
    icon: 'Square',
    path: '/tools/box-shadow-generator',
    tags: ['css', 'box-shadow', 'generator', 'design']
  },
  {
    id: 'border-radius-generator',
    name: 'Border Radius Generator',
    description: 'Generate CSS border radius',
    category: 'Design Tools',
    icon: 'Square',
    path: '/tools/border-radius-generator',
    tags: ['css', 'border-radius', 'generator', 'design']
  },
  {
    id: 'text-shadow-generator',
    name: 'Text Shadow Generator',
    description: 'Generate CSS text shadows',
    category: 'Design Tools',
    icon: 'Type',
    path: '/tools/text-shadow-generator',
    tags: ['css', 'text-shadow', 'generator', 'design']
  },
  {
    id: 'css-filter-generator',
    name: 'CSS Filter Generator',
    description: 'Generate CSS filters',
    category: 'Design Tools',
    icon: 'Image',
    path: '/tools/css-filter-generator',
    tags: ['css', 'filter', 'generator', 'design']
  },
  {
    id: 'svg-optimizer',
    name: 'SVG Optimizer',
    description: 'Optimize SVG files',
    category: 'Design Tools',
    icon: 'Image',
    path: '/tools/svg-optimizer',
    tags: ['svg', 'optimizer', 'design', 'image']
  },
  {
    id: 'image-compression',
    name: 'Image Compression',
    description: 'Compress images',
    category: 'Design Tools',
    icon: 'Image',
    path: '/tools/image-compression',
    tags: ['image', 'compression', 'optimize', 'design']
  },
  {
    id: 'placeholder-image-generator',
    name: 'Placeholder Image Generator',
    description: 'Generate placeholder images',
    category: 'Design Tools',
    icon: 'Image',
    path: '/tools/placeholder-image-generator',
    tags: ['placeholder', 'image', 'generator', 'design']
  },
  {
    id: 'lorem-ipsum-generator-advanced',
    name: 'Advanced Lorem Ipsum Generator',
    description: 'Generate Lorem Ipsum with advanced options',
    category: 'Content Tools',
    icon: 'FileText',
    path: '/tools/lorem-ipsum-generator-advanced',
    tags: ['lorem', 'ipsum', 'generator', 'content', 'advanced']
  },
  {
    id: 'slug-generator',
    name: 'Slug Generator',
    description: 'Generate URL-friendly slugs',
    category: 'Content Tools',
    icon: 'Link',
    path: '/tools/slug-generator',
    tags: ['slug', 'generator', 'url', 'content']
  },
  {
    id: 'title-case-converter',
    name: 'Title Case Converter',
    description: 'Convert text to title case',
    category: 'Content Tools',
    icon: 'Type',
    path: '/tools/title-case-converter',
    tags: ['title', 'case', 'converter', 'content']
  },
  {
    id: 'sentence-case-converter',
    name: 'Sentence Case Converter',
    description: 'Convert text to sentence case',
    category: 'Content Tools',
    icon: 'Type',
    path: '/tools/sentence-case-converter',
    tags: ['sentence', 'case', 'converter', 'content']
  },
  {
    id: 'random-text-generator',
    name: 'Random Text Generator',
    description: 'Generate random text',
    category: 'Content Tools',
    icon: 'FileText',
    path: '/tools/random-text-generator',
    tags: ['random', 'text', 'generator', 'content']
  },
  {
    id: 'content-length-checker',
    name: 'Content Length Checker',
    description: 'Check content length for various platforms',
    category: 'Content Tools',
    icon: 'FileText',
    path: '/tools/content-length-checker',
    tags: ['content', 'length', 'checker', 'social-media']
  },
  {
    id: 'hashtag-generator',
    name: 'Hashtag Generator',
    description: 'Generate hashtags for social media',
    category: 'Content Tools',
    icon: 'Hash',
    path: '/tools/hashtag-generator',
    tags: ['hashtag', 'generator', 'social-media', 'content']
  },
  {
    id: 'social-media-post-generator',
    name: 'Social Media Post Generator',
    description: 'Generate social media posts',
    category: 'Content Tools',
    icon: 'Share',
    path: '/tools/social-media-post-generator',
    tags: ['social-media', 'post', 'generator', 'content']
  },
  {
    id: 'blog-title-generator',
    name: 'Blog Title Generator',
    description: 'Generate blog titles',
    category: 'Content Tools',
    icon: 'FileText',
    path: '/tools/blog-title-generator',
    tags: ['blog', 'title', 'generator', 'content']
  },
  {
    id: 'meta-description-generator',
    name: 'Meta Description Generator',
    description: 'Generate meta descriptions',
    category: 'Content Tools',
    icon: 'FileText',
    path: '/tools/meta-description-generator',
    tags: ['meta', 'description', 'generator', 'seo', 'content']
  },
  {
    id: 'open-graph-generator',
    name: 'Open Graph Generator',
    description: 'Generate Open Graph tags',
    category: 'Content Tools',
    icon: 'Share',
    path: '/tools/open-graph-generator',
    tags: ['open-graph', 'generator', 'social-media', 'seo']
  },
  {
    id: 'twitter-card-generator',
    name: 'Twitter Card Generator',
    description: 'Generate Twitter cards',
    category: 'Content Tools',
    icon: 'Share',
    path: '/tools/twitter-card-generator',
    tags: ['twitter', 'card', 'generator', 'social-media']
  },
  {
    id: 'schema-markup-generator',
    name: 'Schema Markup Generator',
    description: 'Generate schema markup',
    category: 'Content Tools',
    icon: 'Code',
    path: '/tools/schema-markup-generator',
    tags: ['schema', 'markup', 'generator', 'seo', 'structured-data']
  },
  {
    id: 'sitemap-validator',
    name: 'Sitemap Validator',
    description: 'Validate XML sitemaps',
    category: 'SEO Tools',
    icon: 'FileText',
    path: '/tools/sitemap-validator',
    tags: ['sitemap', 'validator', 'xml', 'seo']
  },
  {
    id: 'robots-txt-validator',
    name: 'Robots.txt Validator',
    description: 'Validate robots.txt files',
    category: 'SEO Tools',
    icon: 'FileText',
    path: '/tools/robots-txt-validator',
    tags: ['robots', 'txt', 'validator', 'seo']
  },
  {
    id: 'meta-tag-analyzer',
    name: 'Meta Tag Analyzer',
    description: 'Analyze meta tags',
    category: 'SEO Tools',
    icon: 'Search',
    path: '/tools/meta-tag-analyzer',
    tags: ['meta', 'tag', 'analyzer', 'seo']
  },
  {
    id: 'keyword-density-analyzer',
    name: 'Keyword Density Analyzer',
    description: 'Analyze keyword density',
    category: 'SEO Tools',
    icon: 'BarChart',
    path: '/tools/keyword-density-analyzer',
    tags: ['keyword', 'density', 'analyzer', 'seo']
  },
  {
    id: 'backlink-checker',
    name: 'Backlink Checker',
    description: 'Check backlinks',
    category: 'SEO Tools',
    icon: 'Link',
    path: '/tools/backlink-checker',
    tags: ['backlink', 'checker', 'seo', 'analysis']
  },
  {
    id: 'page-speed-tester',
    name: 'Page Speed Tester',
    description: 'Test page speed',
    category: 'SEO Tools',
    icon: 'Gauge',
    path: '/tools/page-speed-tester',
    tags: ['page', 'speed', 'tester', 'performance', 'seo']
  },
  {
    id: 'mobile-friendly-tester',
    name: 'Mobile Friendly Tester',
    description: 'Test mobile friendliness',
    category: 'SEO Tools',
    icon: 'Smartphone',
    path: '/tools/mobile-friendly-tester',
    tags: ['mobile', 'friendly', 'tester', 'seo', 'accessibility']
  },
  {
    id: 'ssl-checker-seo',
    name: 'SSL Checker for SEO',
    description: 'Check SSL certificate for SEO',
    category: 'SEO Tools',
    icon: 'Lock',
    path: '/tools/ssl-checker-seo',
    tags: ['ssl', 'checker', 'seo', 'security']
  },
  {
    id: 'header-status-checker',
    name: 'Header Status Checker',
    description: 'Check HTTP header status',
    category: 'SEO Tools',
    icon: 'Server',
    path: '/tools/header-status-checker',
    tags: ['header', 'status', 'checker', 'seo', 'http']
  },
  {
    id: 'broken-link-checker',
    name: 'Broken Link Checker',
    description: 'Check for broken links',
    category: 'SEO Tools',
    icon: 'Link',
    path: '/tools/broken-link-checker',
    tags: ['broken', 'link', 'checker', 'seo', 'analysis']
  },
  {
    id: 'duplicate-content-checker',
    name: 'Duplicate Content Checker',
    description: 'Check for duplicate content',
    category: 'SEO Tools',
    icon: 'FileText',
    path: '/tools/duplicate-content-checker',
    tags: ['duplicate', 'content', 'checker', 'seo', 'plagiarism']
  },
  
  // Additional Implemented Tools
  {
    id: 'api-tester',
    name: 'API Tester',
    description: 'Test REST APIs with custom requests',
    category: 'Developer Tools',
    icon: 'Server',
    path: '/tools/api-tester',
    tags: ['api', 'test', 'rest', 'http']
  },
  {
    id: 'article-rewriter',
    name: 'Article Rewriter',
    description: 'Rewrite articles with AI assistance',
    category: 'AI Tools',
    icon: 'FileText',
    path: '/tools/article-rewriter',
    tags: ['article', 'rewrite', 'ai', 'content']
  },
  {
    id: 'audio-converter',
    name: 'Audio Converter',
    description: 'Convert audio files between formats',
    category: 'Media Tools',
    icon: 'File',
    path: '/tools/audio-converter',
    tags: ['audio', 'converter', 'format', 'media']
  },
  {
    id: 'audio-recorder',
    name: 'Audio Recorder',
    description: 'Record audio from microphone',
    category: 'Media Tools',
    icon: 'File',
    path: '/tools/audio-recorder',
    tags: ['audio', 'record', 'microphone', 'media']
  },
  {
    id: 'backlink-maker',
    name: 'Backlink Maker',
    description: 'Generate backlinks for SEO',
    category: 'SEO Tools',
    icon: 'Link',
    path: '/tools/backlink-maker',
    tags: ['backlink', 'seo', 'link', 'generator']
  },
  {
    id: 'bcrypt-generator',
    name: 'BCrypt Generator',
    description: 'Generate BCrypt hashes for passwords',
    category: 'Security Tools',
    icon: 'Lock',
    path: '/tools/bcrypt-generator',
    tags: ['bcrypt', 'hash', 'password', 'security']
  },
  {
    id: 'blacklist',
    name: 'Blacklist Checker',
    description: 'Check if domain or IP is blacklisted',
    category: 'Security Tools',
    icon: 'Shield',
    path: '/tools/blacklist',
    tags: ['blacklist', 'security', 'domain', 'ip']
  },
  {
    id: 'bulk-geo',
    name: 'Bulk Geolocation',
    description: 'Get geolocation data for multiple IPs',
    category: 'Network Tools',
    icon: 'Globe',
    path: '/tools/bulk-geo',
    tags: ['geolocation', 'ip', 'bulk', 'network']
  },
  {
    id: 'case-converter',
    name: 'Case Converter',
    description: 'Convert text between different cases',
    category: 'Text Tools',
    icon: 'Type',
    path: '/tools/case-converter',
    tags: ['text', 'case', 'converter', 'format']
  },
  {
    id: 'chart-generator',
    name: 'Chart Generator',
    description: 'Generate charts from data',
    category: 'Data Tools',
    icon: 'BarChart',
    path: '/tools/chart-generator',
    tags: ['chart', 'graph', 'data', 'visualization']
  },
  {
    id: 'citation-generator',
    name: 'Citation Generator',
    description: 'Generate citations in various formats',
    category: 'Text Tools',
    icon: 'FileText',
    path: '/tools/citation-generator',
    tags: ['citation', 'reference', 'academic', 'format']
  },
  {
    id: 'code-formatter',
    name: 'Code Formatter',
    description: 'Format code in various programming languages',
    category: 'Developer Tools',
    icon: 'Code',
    path: '/tools/code-formatter',
    tags: ['code', 'format', 'beautify', 'programming']
  },
  {
    id: 'css-formatter',
    name: 'CSS Formatter',
    description: 'Format and beautify CSS code',
    category: 'Web Tools',
    icon: 'FileCode',
    path: '/tools/css-formatter',
    tags: ['css', 'format', 'beautify', 'style']
  },
  {
    id: 'csv-converter',
    name: 'CSV Converter',
    description: 'Convert CSV files to other formats',
    category: 'Data Tools',
    icon: 'FileSpreadsheet',
    path: '/tools/csv-converter',
    tags: ['csv', 'converter', 'data', 'format']
  },
  {
    id: 'data-extractor',
    name: 'Data Extractor',
    description: 'Extract data from websites and documents',
    category: 'Data Tools',
    icon: 'FileText',
    path: '/tools/data-extractor',
    tags: ['data', 'extract', 'scrape', 'parse']
  },
  {
    id: 'data-size-converter',
    name: 'Data Size Converter',
    description: 'Convert between different data size units',
    category: 'Unit Converters',
    icon: 'Database',
    path: '/tools/data-size-converter',
    tags: ['data', 'size', 'converter', 'units']
  },
  {
    id: 'data-visualization',
    name: 'Data Visualization',
    description: 'Create visualizations from data',
    category: 'Data Tools',
    icon: 'BarChart',
    path: '/tools/data-visualization',
    tags: ['data', 'visualization', 'chart', 'graph']
  },
  {
    id: 'distance-converter',
    name: 'Distance Converter',
    description: 'Convert between different distance units',
    category: 'Unit Converters',
    icon: 'Ruler',
    path: '/tools/distance-converter',
    tags: ['distance', 'converter', 'units', 'length']
  },
  {
    id: 'domain-age',
    name: 'Domain Age Checker',
    description: 'Check the age of domains',
    category: 'SEO Tools',
    icon: 'Globe',
    path: '/tools/domain-age',
    tags: ['domain', 'age', 'seo', 'checker']
  },
  {
    id: 'domain-hosting',
    name: 'Domain Hosting Checker',
    description: 'Check domain hosting information',
    category: 'SEO Tools',
    icon: 'Server',
    path: '/tools/domain-hosting',
    tags: ['domain', 'hosting', 'checker', 'seo']
  },
  {
    id: 'domain-to-ip',
    name: 'Domain to IP Converter',
    description: 'Convert domain names to IP addresses',
    category: 'Network Tools',
    icon: 'Globe',
    path: '/tools/domain-to-ip',
    tags: ['domain', 'ip', 'converter', 'network']
  },
  {
    id: 'email-extractor',
    name: 'Email Extractor',
    description: 'Extract email addresses from text',
    category: 'Text Tools',
    icon: 'Mail',
    path: '/tools/email-extractor',
    tags: ['email', 'extract', 'text', 'parser']
  },
  {
    id: 'equation-solver',
    name: 'Equation Solver',
    description: 'Solve mathematical equations',
    category: 'Math Tools',
    icon: 'Calculator',
    path: '/tools/equation-solver',
    tags: ['equation', 'solve', 'math', 'calculator']
  },
  {
    id: 'exif-reader',
    name: 'EXIF Reader',
    description: 'Read EXIF data from images',
    category: 'Image Tools',
    icon: 'Image',
    path: '/tools/exif-reader',
    tags: ['exif', 'image', 'metadata', 'reader']
  },
  {
    id: 'exif-remover',
    name: 'EXIF Remover',
    description: 'Remove EXIF data from images',
    category: 'Image Tools',
    icon: 'Image',
    path: '/tools/exif-remover',
    tags: ['exif', 'image', 'metadata', 'privacy']
  },
  {
    id: 'file-joiner',
    name: 'File Joiner',
    description: 'Join multiple files into one',
    category: 'File Tools',
    icon: 'File',
    path: '/tools/file-joiner',
    tags: ['file', 'join', 'merge', 'combine']
  },
  {
    id: 'file-splitter',
    name: 'File Splitter',
    description: 'Split files into smaller parts',
    category: 'File Tools',
    icon: 'File',
    path: '/tools/file-splitter',
    tags: ['file', 'split', 'divide', 'parts']
  },
  {
    id: 'git-helper',
    name: 'Git Helper',
    description: 'Git command helper and generator',
    category: 'Developer Tools',
    icon: 'GitBranch',
    path: '/tools/git-helper',
    tags: ['git', 'version', 'control', 'helper']
  },
  {
    id: 'google-index',
    name: 'Google Index Checker',
    description: 'Check if pages are indexed by Google',
    category: 'SEO Tools',
    icon: 'Search',
    path: '/tools/google-index',
    tags: ['google', 'index', 'seo', 'checker']
  },
  {
    id: 'grammar-checker',
    name: 'Grammar Checker',
    description: 'Check grammar and spelling',
    category: 'Text Tools',
    icon: 'FileText',
    path: '/tools/grammar-checker',
    tags: ['grammar', 'spelling', 'check', 'text']
  },
  {
    id: 'hash-checker',
    name: 'Hash Checker',
    description: 'Verify file hashes',
    category: 'Security Tools',
    icon: 'Fingerprint',
    path: '/tools/hash-checker',
    tags: ['hash', 'check', 'verify', 'security']
  },
  {
    id: 'hex-to-rgb',
    name: 'Hex to RGB Converter',
    description: 'Convert hex colors to RGB format',
    category: 'Color Tools',
    icon: 'Palette',
    path: '/tools/hex-to-rgb',
    tags: ['hex', 'rgb', 'color', 'converter']
  },
  {
    id: 'hreflang-generator',
    name: 'Hreflang Generator',
    description: 'Generate hreflang tags for SEO',
    category: 'SEO Tools',
    icon: 'Globe',
    path: '/tools/hreflang-generator',
    tags: ['hreflang', 'seo', 'tags', 'generator']
  },
  {
    id: 'html-formatter',
    name: 'HTML Formatter',
    description: 'Format and beautify HTML code',
    category: 'Web Tools',
    icon: 'Code',
    path: '/tools/html-formatter',
    tags: ['html', 'format', 'beautify', 'code']
  },
  {
    id: 'html-scraper',
    name: 'HTML Scraper',
    description: 'Scrape data from HTML pages',
    category: 'Web Tools',
    icon: 'Code',
    path: '/tools/html-scraper',
    tags: ['html', 'scrape', 'data', 'extract']
  },
  {
    id: 'http-headers',
    name: 'HTTP Headers Viewer',
    description: 'View HTTP headers of websites',
    category: 'Network Tools',
    icon: 'Server',
    path: '/tools/http-headers',
    tags: ['http', 'headers', 'network', 'web']
  },
  {
    id: 'http-request',
    name: 'HTTP Request Tester',
    description: 'Test HTTP requests and responses',
    category: 'Network Tools',
    icon: 'Server',
    path: '/tools/http-request',
    tags: ['http', 'request', 'test', 'network']
  },
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    description: 'Compress images to reduce file size',
    category: 'Image Tools',
    icon: 'Image',
    path: '/tools/image-compressor',
    tags: ['image', 'compress', 'optimize', 'size']
  },
  {
    id: 'image-placeholder',
    name: 'Image Placeholder Generator',
    description: 'Generate placeholder images',
    category: 'Image Tools',
    icon: 'Image',
    path: '/tools/image-placeholder',
    tags: ['image', 'placeholder', 'generator', 'dummy']
  },
  {
    id: 'image-to-text',
    name: 'Image to Text Converter',
    description: 'Extract text from images using OCR',
    category: 'Image Tools',
    icon: 'Image',
    path: '/tools/image-to-text',
    tags: ['image', 'text', 'ocr', 'extract']
  },
  {
    id: 'ip-geolocation',
    name: 'IP Geolocation',
    description: 'Get geolocation data for IP addresses',
    category: 'Network Tools',
    icon: 'Globe',
    path: '/tools/ip-geolocation',
    tags: ['ip', 'geolocation', 'location', 'network']
  },
  {
    id: 'javascript-formatter',
    name: 'JavaScript Formatter',
    description: 'Format and beautify JavaScript code',
    category: 'Web Tools',
    icon: 'FileJson',
    path: '/tools/javascript-formatter',
    tags: ['javascript', 'format', 'beautify', 'code']
  },
  {
    id: 'json-schema-validator',
    name: 'JSON Schema Validator',
    description: 'Validate JSON against schemas',
    category: 'Developer Tools',
    icon: 'FileJson',
    path: '/tools/json-schema-validator',
    tags: ['json', 'schema', 'validate', 'developer']
  },
  {
    id: 'jwt-tool',
    name: 'JWT Tool',
    description: 'Encode and decode JWT tokens',
    category: 'Security Tools',
    icon: 'Key',
    path: '/tools/jwt-tool',
    tags: ['jwt', 'token', 'encode', 'decode']
  },
  {
    id: 'keyword-cpc-calculator',
    name: 'Keyword CPC Calculator',
    description: 'Calculate keyword cost per click',
    category: 'SEO Tools',
    icon: 'DollarSign',
    path: '/tools/keyword-cpc-calculator',
    tags: ['keyword', 'cpc', 'calculator', 'seo']
  },
  {
    id: 'keyword-density',
    name: 'Keyword Density Analyzer',
    description: 'Analyze keyword density in text',
    category: 'SEO Tools',
    icon: 'Search',
    path: '/tools/keyword-density',
    tags: ['keyword', 'density', 'analyzer', 'seo']
  },
  {
    id: 'keyword-position-checker',
    name: 'Keyword Position Checker',
    description: 'Check keyword position in search results',
    category: 'SEO Tools',
    icon: 'Search',
    path: '/tools/keyword-position-checker',
    tags: ['keyword', 'position', 'checker', 'seo']
  },
  {
    id: 'link-analyzer',
    name: 'Link Analyzer',
    description: 'Analyze links on web pages',
    category: 'SEO Tools',
    icon: 'Link',
    path: '/tools/link-analyzer',
    tags: ['link', 'analyzer', 'seo', 'web']
  },
  {
    id: 'link-price',
    name: 'Link Price Calculator',
    description: 'Calculate link prices for SEO',
    category: 'SEO Tools',
    icon: 'DollarSign',
    path: '/tools/link-price',
    tags: ['link', 'price', 'calculator', 'seo']
  },
  {
    id: 'malware-checker',
    name: 'Malware Checker',
    description: 'Check websites for malware',
    category: 'Security Tools',
    icon: 'Shield',
    path: '/tools/malware-checker',
    tags: ['malware', 'security', 'checker', 'scan']
  },
  {
    id: 'md5-generator',
    name: 'MD5 Generator',
    description: 'Generate MD5 hashes',
    category: 'Security Tools',
    icon: 'Fingerprint',
    path: '/tools/md5-generator',
    tags: ['md5', 'hash', 'generator', 'security']
  },
  {
    id: 'meta-tags',
    name: 'Meta Tags Generator',
    description: 'Generate meta tags for web pages',
    category: 'SEO Tools',
    icon: 'Tag',
    path: '/tools/meta-tags',
    tags: ['meta', 'tags', 'seo', 'generator']
  },
  {
    id: 'meta-tags-analyzer',
    name: 'Meta Tags Analyzer',
    description: 'Analyze meta tags of web pages',
    category: 'SEO Tools',
    icon: 'Tag',
    path: '/tools/meta-tags-analyzer',
    tags: ['meta', 'tags', 'analyzer', 'seo']
  },
  {
    id: 'mozrank',
    name: 'MozRank Checker',
    description: 'Check MozRank for domains',
    category: 'SEO Tools',
    icon: 'Search',
    path: '/tools/mozrank',
    tags: ['mozrank', 'seo', 'checker', 'domain']
  },
  {
    id: 'my-ip',
    name: 'My IP Address',
    description: 'Show your current IP address',
    category: 'Network Tools',
    icon: 'Globe',
    path: '/tools/my-ip',
    tags: ['ip', 'address', 'network', 'my']
  },
  {
    id: 'network-diagnostic',
    name: 'Network Diagnostic',
    description: 'Diagnose network issues',
    category: 'Network Tools',
    icon: 'Wifi',
    path: '/tools/network-diagnostic',
    tags: ['network', 'diagnostic', 'troubleshoot', 'tools']
  },
  {
    id: 'online-ping-website-tool',
    name: 'Online Ping Website Tool',
    description: 'Ping websites to check availability',
    category: 'Network Tools',
    icon: 'Wifi',
    path: '/tools/online-ping-website-tool',
    tags: ['ping', 'website', 'online', 'network']
  },
  {
    id: 'pagespeed-insights',
    name: 'PageSpeed Insights',
    description: 'Check page speed and performance',
    category: 'SEO Tools',
    icon: 'Gauge',
    path: '/tools/pagespeed-insights',
    tags: ['pagespeed', 'insights', 'performance', 'seo']
  },
  {
    id: 'paragraph-counter',
    name: 'Paragraph Counter',
    description: 'Count paragraphs in text',
    category: 'Text Tools',
    icon: 'FileText',
    path: '/tools/paragraph-counter',
    tags: ['paragraph', 'count', 'text', 'analyzer']
  },
  {
    id: 'paraphraser',
    name: 'Paraphraser',
    description: 'Paraphrase text with AI',
    category: 'AI Tools',
    icon: 'FileText',
    path: '/tools/paraphraser',
    tags: ['paraphrase', 'text', 'ai', 'rewrite']
  },
  {
    id: 'password-analyzer',
    name: 'Password Analyzer',
    description: 'Analyze password strength and security',
    category: 'Security Tools',
    icon: 'Lock',
    path: '/tools/password-analyzer',
    tags: ['password', 'analyzer', 'security', 'strength']
  },
  {
    id: 'pdf-tools',
    name: 'PDF Tools',
    description: 'Various PDF manipulation tools',
    category: 'File Tools',
    icon: 'FileText',
    path: '/tools/pdf-tools',
    tags: ['pdf', 'tools', 'manipulate', 'convert']
  },
  {
    id: 'performance-optimization',
    name: 'Performance Optimization',
    description: 'Optimize website performance',
    category: 'Web Tools',
    icon: 'Gauge',
    path: '/tools/performance-optimization',
    tags: ['performance', 'optimization', 'web', 'speed']
  },
  {
    id: 'phone-number-validator',
    name: 'Phone Number Validator',
    description: 'Validate phone numbers',
    category: 'Validators',
    icon: 'Phone',
    path: '/tools/phone-number-validator',
    tags: ['phone', 'number', 'validator', 'check']
  },
  {
    id: 'ping',
    name: 'Ping Tool',
    description: 'Ping hosts to check connectivity',
    category: 'Network Tools',
    icon: 'Wifi',
    path: '/tools/ping',
    tags: ['ping', 'network', 'connectivity', 'tool']
  },
  {
    id: 'plagiarism-checker',
    name: 'Plagiarism Checker',
    description: 'Check text for plagiarism',
    category: 'Text Tools',
    icon: 'FileText',
    path: '/tools/plagiarism-checker',
    tags: ['plagiarism', 'check', 'text', 'originality']
  },
  {
    id: 'port-scanner',
    name: 'Port Scanner',
    description: 'Scan open ports on servers',
    category: 'Network Tools',
    icon: 'Wifi',
    path: '/tools/port-scanner',
    tags: ['port', 'scanner', 'network', 'security']
  },
  {
    id: 'privacy-policy',
    name: 'Privacy Policy Generator',
    description: 'Generate privacy policy for websites',
    category: 'Web Tools',
    icon: 'FileText',
    path: '/tools/privacy-policy',
    tags: ['privacy', 'policy', 'generator', 'legal']
  },
  {
    id: 'qr-code-reader',
    name: 'QR Code Reader',
    description: 'Read QR codes from images',
    category: 'Image Tools',
    icon: 'Scan',
    path: '/tools/qr-code-reader',
    tags: ['qr', 'code', 'reader', 'scan']
  },
  {
    id: 'random-generator',
    name: 'Random Generator',
    description: 'Generate random data',
    category: 'Generator Tools',
    icon: 'Dice1',
    path: '/tools/random-generator',
    tags: ['random', 'generator', 'data', 'tools']
  },
  {
    id: 'regex-generator',
    name: 'Regex Generator',
    description: 'Generate regular expressions',
    category: 'Developer Tools',
    icon: 'Code',
    path: '/tools/regex-generator',
    tags: ['regex', 'generator', 'pattern', 'developer']
  },
  {
    id: 'reverse-ip',
    name: 'Reverse IP Lookup',
    description: 'Find domains hosted on an IP address',
    category: 'Network Tools',
    icon: 'Globe',
    path: '/tools/reverse-ip',
    tags: ['reverse', 'ip', 'lookup', 'domain']
  },
  {
    id: 'reverse-words',
    name: 'Reverse Words',
    description: 'Reverse words in text',
    category: 'Text Tools',
    icon: 'RotateCcw',
    path: '/tools/reverse-words',
    tags: ['reverse', 'words', 'text', 'converter']
  },
  {
    id: 'safe-url',
    name: 'Safe URL Checker',
    description: 'Check if URLs are safe',
    category: 'Security Tools',
    icon: 'Shield',
    path: '/tools/safe-url',
    tags: ['safe', 'url', 'checker', 'security']
  },
  {
    id: 'search-console-simulator',
    name: 'Search Console Simulator',
    description: 'Simulate Google Search Console',
    category: 'SEO Tools',
    icon: 'Search',
    path: '/tools/search-console-simulator',
    tags: ['search', 'console', 'simulator', 'seo']
  },
  {
    id: 'sentence-counter',
    name: 'Sentence Counter',
    description: 'Count sentences in text',
    category: 'Text Tools',
    icon: 'FileText',
    path: '/tools/sentence-counter',
    tags: ['sentence', 'count', 'text', 'analyzer']
  },
  {
    id: 'seo-analyzer',
    name: 'SEO Analyzer',
    description: 'Analyze SEO for web pages',
    category: 'SEO Tools',
    icon: 'Search',
    path: '/tools/seo-analyzer',
    tags: ['seo', 'analyzer', 'web', 'analysis']
  },
  {
    id: 'seo-audit-tool',
    name: 'SEO Audit Tool',
    description: 'Perform comprehensive SEO audits',
    category: 'SEO Tools',
    icon: 'Search',
    path: '/tools/seo-audit-tool',
    tags: ['seo', 'audit', 'tool', 'analysis']
  },
  {
    id: 'seo-content-template',
    name: 'SEO Content Template',
    description: 'Generate SEO-optimized content templates',
    category: 'SEO Tools',
    icon: 'FileText',
    path: '/tools/seo-content-template',
    tags: ['seo', 'content', 'template', 'generator']
  },
  {
    id: 'serp-checker',
    name: 'SERP Checker',
    description: 'Check search engine results pages',
    category: 'SEO Tools',
    icon: 'Search',
    path: '/tools/serp-checker',
    tags: ['serp', 'checker', 'seo', 'search']
  },
  {
    id: 'sha256-generator',
    name: 'SHA256 Generator',
    description: 'Generate SHA256 hashes',
    category: 'Security Tools',
    icon: 'Fingerprint',
    path: '/tools/sha256-generator',
    tags: ['sha256', 'hash', 'generator', 'security']
  },
  {
    id: 'source-code',
    name: 'Source Code Viewer',
    description: 'View source code of web pages',
    category: 'Web Tools',
    icon: 'Code',
    path: '/tools/source-code',
    tags: ['source', 'code', 'viewer', 'web']
  },
  {
    id: 'sql-formatter',
    name: 'SQL Formatter',
    description: 'Format and beautify SQL code',
    category: 'Developer Tools',
    icon: 'Database',
    path: '/tools/sql-formatter',
    tags: ['sql', 'format', 'beautify', 'database']
  },
  {
    id: 'ssl-lookup',
    name: 'SSL Lookup',
    description: 'Check SSL certificate information',
    category: 'Security Tools',
    icon: 'Lock',
    path: '/tools/ssl-lookup',
    tags: ['ssl', 'lookup', 'certificate', 'security']
  },
  {
    id: 'structured-data-generator',
    name: 'Structured Data Generator',
    description: 'Generate structured data for SEO',
    category: 'SEO Tools',
    icon: 'Code',
    path: '/tools/structured-data-generator',
    tags: ['structured', 'data', 'generator', 'seo']
  },
  {
    id: 'suspicious-domain',
    name: 'Suspicious Domain Checker',
    description: 'Check if domains are suspicious',
    category: 'Security Tools',
    icon: 'Shield',
    path: '/tools/suspicious-domain',
    tags: ['suspicious', 'domain', 'checker', 'security']
  },
  {
    id: 'syllable-counter',
    name: 'Syllable Counter',
    description: 'Count syllables in text',
    category: 'Text Tools',
    icon: 'FileText',
    path: '/tools/syllable-counter',
    tags: ['syllable', 'count', 'text', 'analyzer']
  },
  {
    id: 'system-info',
    name: 'System Information',
    description: 'Get system information',
    category: 'System Tools',
    icon: 'Computer',
    path: '/tools/system-info',
    tags: ['system', 'information', 'specs', 'hardware']
  },
  {
    id: 'terms-conditions',
    name: 'Terms & Conditions Generator',
    description: 'Generate terms and conditions for websites',
    category: 'Web Tools',
    icon: 'FileText',
    path: '/tools/terms-conditions',
    tags: ['terms', 'conditions', 'generator', 'legal']
  },
  {
    id: 'text-clustering',
    name: 'Text Clustering',
    description: 'Cluster similar text documents',
    category: 'Text Tools',
    icon: 'FileText',
    path: '/tools/text-clustering',
    tags: ['text', 'clustering', 'similarity', 'analysis']
  },
  {
    id: 'text-complexity',
    name: 'Text Complexity Analyzer',
    description: 'Analyze text complexity',
    category: 'Text Tools',
    icon: 'FileText',
    path: '/tools/text-complexity',
    tags: ['text', 'complexity', 'analyzer', 'readability']
  },
  {
    id: 'text-difference',
    name: 'Text Difference',
    description: 'Compare two texts and show differences',
    category: 'Text Tools',
    icon: 'GitCompare',
    path: '/tools/text-difference',
    tags: ['text', 'difference', 'compare', 'diff']
  },
  {
    id: 'text-entropy',
    name: 'Text Entropy Calculator',
    description: 'Calculate entropy of text',
    category: 'Text Tools',
    icon: 'FileText',
    path: '/tools/text-entropy',
    tags: ['text', 'entropy', 'calculator', 'analysis']
  },
  {
    id: 'token-generator',
    name: 'Token Generator',
    description: 'Generate random tokens',
    category: 'Security Tools',
    icon: 'Key',
    path: '/tools/token-generator',
    tags: ['token', 'generator', 'random', 'security']
  },
  {
    id: 'tools',
    name: 'Tools Overview',
    description: 'Overview of all available tools',
    category: 'System',
    icon: 'Tool',
    path: '/tools/tools',
    tags: ['tools', 'overview', 'system', 'directory']
  },
  {
    id: 'url-rewriting',
    name: 'URL Rewriting',
    description: 'Rewrite URLs for SEO',
    category: 'SEO Tools',
    icon: 'Link',
    path: '/tools/url-rewriting',
    tags: ['url', 'rewriting', 'seo', 'rewrite']
  },
  {
    id: 'utm-link',
    name: 'UTM Link Builder',
    description: 'Build UTM tracking links',
    category: 'Marketing Tools',
    icon: 'Link',
    path: '/tools/utm-link',
    tags: ['utm', 'link', 'builder', 'marketing']
  },
  {
    id: 'video-converter',
    name: 'Video Converter',
    description: 'Convert video files between formats',
    category: 'Media Tools',
    icon: 'File',
    path: '/tools/video-converter',
    tags: ['video', 'converter', 'format', 'media']
  },
  {
    id: 'video-downloader',
    name: 'Video Downloader',
    description: 'Download videos from various platforms',
    category: 'Media Tools',
    icon: 'File',
    path: '/tools/video-downloader',
    tags: ['video', 'downloader', 'download', 'media']
  },
  {
    id: 'web-scraper',
    name: 'Web Scraper',
    description: 'Scrape data from websites',
    category: 'Web Tools',
    icon: 'Globe',
    path: '/tools/web-scraper',
    tags: ['web', 'scraper', 'data', 'extract']
  },
  {
    id: 'website-screenshot',
    name: 'Website Screenshot',
    description: 'Take screenshots of websites',
    category: 'Web Tools',
    icon: 'Camera',
    path: '/tools/website-screenshot',
    tags: ['website', 'screenshot', 'capture', 'image']
  },
  {
    id: 'whatsapp-link',
    name: 'WhatsApp Link Generator',
    description: 'Generate WhatsApp links',
    category: 'Social Media Tools',
    icon: 'MessageCircle',
    path: '/tools/whatsapp-link',
    tags: ['whatsapp', 'link', 'generator', 'social']
  },
  {
    id: 'whois',
    name: 'WHOIS Lookup',
    description: 'Lookup WHOIS information for domains',
    category: 'Network Tools',
    icon: 'Globe',
    path: '/tools/whois',
    tags: ['whois', 'lookup', 'domain', 'network']
  },
  {
    id: 'word-frequency',
    name: 'Word Frequency Analyzer',
    description: 'Analyze word frequency in text',
    category: 'Text Tools',
    icon: 'FileText',
    path: '/tools/word-frequency',
    tags: ['word', 'frequency', 'analyzer', 'text']
  },
  {
    id: 'www-redirect',
    name: 'WWW Redirect Checker',
    description: 'Check WWW redirects',
    category: 'SEO Tools',
    icon: 'Link',
    path: '/tools/www-redirect',
    tags: ['www', 'redirect', 'checker', 'seo']
  },
  {
    id: 'xml-sitemap-generator',
    name: 'XML Sitemap Generator',
    description: 'Generate XML sitemaps for SEO',
    category: 'SEO Tools',
    icon: 'FileCode',
    path: '/tools/xml-sitemap-generator',
    tags: ['xml', 'sitemap', 'generator', 'seo']
  },
  {
    id: 'xml-to-json',
    name: 'XML to JSON Converter',
    description: 'Convert XML to JSON format',
    category: 'Data Tools',
    icon: 'FileCode',
    path: '/tools/xml-to-json',
    tags: ['xml', 'json', 'converter', 'data']
  },
  {
    id: 'yaml-to-json',
    name: 'YAML to JSON Converter',
    description: 'Convert YAML to JSON format',
    category: 'Data Tools',
    icon: 'FileCode',
    path: '/tools/yaml-to-json',
    tags: ['yaml', 'json', 'converter', 'data']
  },
  {
    id: 'youtube-keywords',
    name: 'YouTube Keywords',
    description: 'Find keywords for YouTube videos',
    category: 'SEO Tools',
    icon: 'Youtube',
    path: '/tools/youtube-keywords',
    tags: ['youtube', 'keywords', 'seo', 'video']
  },
  {
    id: 'youtube-thumbnail',
    name: 'YouTube Thumbnail Downloader',
    description: 'Download YouTube video thumbnails',
    category: 'Media Tools',
    icon: 'Image',
    path: '/tools/youtube-thumbnail',
    tags: ['youtube', 'thumbnail', 'download', 'video']
  }
]

export const getToolsByCategory = (category: string): Tool[] => {
  return tools.filter(tool => tool.category === category)
}

export const getFeaturedTools = (): Tool[] => {
  return tools.filter(tool => tool.featured)
}

export const searchTools = (query: string): Tool[] => {
  const lowercaseQuery = query.toLowerCase()
  return tools.filter(tool => 
    tool.name.toLowerCase().includes(lowercaseQuery) ||
    tool.description.toLowerCase().includes(lowercaseQuery) ||
    tool.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}

export const getCategories = (): string[] => {
  const categories = [...new Set(tools.map(tool => tool.category))]
  return categories.sort()
}