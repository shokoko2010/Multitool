import { Tool } from '@/types/tool'

export const toolsData: Tool[] = [
  // Network Tools
  { name: 'DNS Lookup', href: '/tools/dns-lookup', description: 'DNS record analysis and domain information', category: 'network', icon: 'Globe' },
  { name: 'IP Lookup', href: '/tools/ip-lookup', description: 'Geolocation and IP address information', category: 'network', icon: 'Globe' },
  { name: 'SSL Checker', href: '/tools/ssl-lookup', description: 'SSL certificate validation and analysis', category: 'network', icon: 'Shield' },
  { name: 'Whois Lookup', href: '/tools/whois', description: 'Domain registration and ownership information', category: 'network', icon: 'Globe' },
  { name: 'Ping Tool', href: '/tools/ping', description: 'Network connectivity and latency testing', category: 'network', icon: 'Globe' },
  { name: 'Port Scanner', href: '/tools/port-scanner', description: 'Open port detection and security scanning', category: 'network', icon: 'Globe' },
  { name: 'HTTP Headers', href: '/tools/http-headers', description: 'HTTP header analysis and inspection', category: 'network', icon: 'Globe' },
  { name: 'HTTP Request', href: '/tools/http-request', description: 'HTTP request testing and debugging', category: 'network', icon: 'Globe' },

  // Security Tools
  { name: 'Safe URL Checker', href: '/tools/safe-url', description: 'URL safety and threat detection', category: 'security', icon: 'Shield' },
  { name: 'Password Strength', href: '/tools/password-strength', description: 'Password security analysis and recommendations', category: 'security', icon: 'Shield' },
  { name: 'Meta Tags Checker', href: '/tools/meta-tags', description: 'Meta tag analysis and SEO optimization', category: 'security', icon: 'Shield' },
  { name: 'MD5 Generator', href: '/tools/md5-generator', description: 'MD5 hash generation and verification', category: 'security', icon: 'Hash' },
  { name: 'SHA-256 Generator', href: '/tools/sha256-generator', description: 'SHA-256 hash generation and verification', category: 'security', icon: 'Hash' },
  { name: 'Password Generator', href: '/tools/password-generator', description: 'Secure random password generation', category: 'security', icon: 'Key' },
  { name: 'Hash Checker', href: '/tools/hash-checker', description: 'Hash verification and integrity checking', category: 'security', icon: 'Hash' },
  { name: 'Token Generator', href: '/tools/token-generator', description: 'API token and authentication key generation', category: 'security', icon: 'Key' },

  // Text Utilities
  { name: 'Text to Speech', href: '/tools/text-to-speech', description: 'Text-to-speech conversion with multiple voices', category: 'text', icon: 'Volume2' },
  { name: 'Case Converter', href: '/tools/case-converter', description: 'Text case conversion utilities', category: 'text', icon: 'Code' },
  { name: 'Character Counter', href: '/tools/character-counter', description: 'Character, word, and line counting', category: 'text', icon: 'FileText' },
  { name: 'Email Extractor', href: '/tools/email-extractor', description: 'Email address extraction from text', category: 'text', icon: 'FileText' },
  { name: 'Reverse Text', href: '/tools/reverse-words', description: 'Text and word reversal utilities', category: 'text', icon: 'Code' },
  { name: 'URL Encoder', href: '/tools/url-encoder', description: 'URL encoding and decoding utilities', category: 'text', icon: 'Link' },
  { name: 'Base64 Converter', href: '/tools/base64-encoder', description: 'Base64 encoding and decoding', category: 'text', icon: 'Hash' },
  { name: 'Text Difference', href: '/tools/text-difference', description: 'Text comparison and diff analysis', category: 'text', icon: 'Code' },
  { name: 'Word Counter', href: '/tools/word-counter', description: 'Advanced word counting and analysis', category: 'text', icon: 'FileText' },

  // Image Tools
  { name: 'Image Converter', href: '/tools/image-converter', description: 'Image format conversion and optimization', category: 'image', icon: 'Image' },
  { name: 'YouTube Thumbnail', href: '/tools/youtube-thumbnail', description: 'YouTube thumbnail extraction and download', category: 'image', icon: 'Image' },
  { name: 'QR Code Reader', href: '/tools/qr-code-reader', description: 'QR code scanning and content extraction', category: 'image', icon: 'QrCode' },
  { name: 'Color Picker', href: '/tools/color-picker', description: 'Color selection and conversion utilities', category: 'image', icon: 'Palette' },
  { name: 'EXIF Reader', href: '/tools/exif-reader', description: 'EXIF data extraction from images', category: 'image', icon: 'Image' },
  { name: 'Image Resizer', href: '/tools/image-resizer', description: 'Image resizing and dimension adjustment', category: 'image', icon: 'Image' },
  { name: 'Image Compressor', href: '/tools/image-compressor', description: 'Image compression and optimization', category: 'image', icon: 'Image' },

  // SEO Tools
  { name: 'SEO Analyzer', href: '/tools/seo-audit-tool', description: 'Comprehensive website SEO analysis', category: 'seo', icon: 'TrendingUp' },
  { name: 'Keyword Density', href: '/tools/keyword-density', description: 'Keyword analysis and density calculation', category: 'seo', icon: 'TrendingUp' },
  { name: 'Meta Tag Generator', href: '/tools/meta-tag-generator', description: 'SEO meta tag generation', category: 'seo', icon: 'Hash' },
  { name: 'SERP Checker', href: '/tools/serp-checker', description: 'Track keyword rankings in search results', category: 'seo', icon: 'TrendingUp' },
  { name: 'Backlink Checker', href: '/tools/backlink-checker', description: 'Backlink analysis and monitoring', category: 'seo', icon: 'TrendingUp' },
  { name: 'Plagiarism Checker', href: '/tools/plagiarism-checker', description: 'Content originality and plagiarism detection', category: 'seo', icon: 'FileText' },
  { name: 'Readability Score', href: '/tools/readability-score', description: 'Content readability and complexity analysis', category: 'seo', icon: 'FileText' },

  // AI Tools
  { name: 'AI Content Generator', href: '/tools/ai-content-generator', description: 'AI-powered content creation', category: 'ai', icon: 'Brain' },
  { name: 'AI SEO Title', href: '/tools/ai-seo-title', description: 'AI-powered SEO title generation', category: 'ai', icon: 'Brain' },
  { name: 'AI SEO Description', href: '/tools/ai-seo-description', description: 'AI meta description generation', category: 'ai', icon: 'Brain' },
  { name: 'AI Keyword Cluster', href: '/tools/ai-keyword-cluster', description: 'AI keyword clustering and analysis', category: 'ai', icon: 'Brain' },
  { name: 'Text Summarizer', href: '/tools/text-summarizer', description: 'AI text summarization and condensation', category: 'ai', icon: 'Brain' },
  { name: 'Sentiment Analyzer', href: '/tools/sentiment-analyzer', description: 'AI sentiment analysis and emotion detection', category: 'ai', icon: 'Brain' },

  // Development Tools
  { name: 'JSON Formatter', href: '/tools/json-formatter', description: 'JSON formatting and validation', category: 'development', icon: 'Code' },
  { name: 'XML Formatter', href: '/tools/xml-formatter', description: 'XML formatting and validation', category: 'development', icon: 'Code' },
  { name: 'HTML Formatter', href: '/tools/html-formatter', description: 'HTML formatting and validation', category: 'development', icon: 'Code' },
  { name: 'SQL Formatter', href: '/tools/sql-formatter', description: 'SQL formatting and syntax highlighting', category: 'development', icon: 'Code' },
  { name: 'Regex Tester', href: '/tools/regex-tester', description: 'Regular expression testing and validation', category: 'development', icon: 'Code' },
  { name: 'JavaScript Formatter', href: '/tools/javascript-formatter', description: 'JavaScript code formatting and beautification', category: 'development', icon: 'Code' },
  { name: 'CSS Formatter', href: '/tools/css-formatter', description: 'CSS formatting and optimization', category: 'development', icon: 'Code' },
  { name: 'AI Code Reviewer', href: '/tools/ai-code-reviewer', description: 'AI-powered code quality analysis and suggestions', category: 'development', icon: 'Brain' },

  // Converters
  { name: 'Temperature Converter', href: '/tools/temperature-converter', description: 'Temperature unit conversion', category: 'converters', icon: 'Calculator' },
  { name: 'Distance Converter', href: '/tools/distance-converter', description: 'Distance and length unit conversion', category: 'converters', icon: 'Calculator' },
  { name: 'Weight Converter', href: '/tools/weight-converter', description: 'Weight and mass unit conversion', category: 'converters', icon: 'Calculator' },
  { name: 'Timestamp Converter', href: '/tools/timestamp-converter', description: 'Timestamp and date conversion', category: 'converters', icon: 'Calendar' },
  { name: 'Data Size Converter', href: '/tools/data-size-converter', description: 'Data storage size conversion', category: 'converters', icon: 'Calculator' },

  // Additional tools to reach 135+
  { name: 'QR Code Generator', href: '/tools/qr-code-generator', description: 'QR code generation for various data types', category: 'image', icon: 'QrCode' },
  { name: 'Video Downloader', href: '/tools/video-downloader', description: 'Download videos from various platforms', category: 'media', icon: 'Video' },
  { name: 'Video Converter', href: '/tools/video-converter', description: 'Convert video formats and optimize', category: 'media', icon: 'Video' },
  { name: 'Audio Recorder', href: '/tools/audio-recorder', description: 'Record and edit audio files', category: 'media', icon: 'Volume2' },
  { name: 'Audio Converter', href: '/tools/audio-converter', description: 'Convert audio formats and optimize', category: 'media', icon: 'Volume2' },
  { name: 'System Info', href: '/tools/system-info', description: 'View system information and specifications', category: 'system', icon: 'Monitor' },
  { name: 'CPU Info', href: '/tools/cpu', description: 'CPU information and performance data', category: 'system', icon: 'Cpu' },
  { name: 'Hard Drive Info', href: '/tools/hard-drive', description: 'Hard drive and storage information', category: 'system', icon: 'HardDrive' },
  { name: 'Calculator', href: '/tools/calculator', description: 'Scientific calculator with advanced functions', category: 'productivity', icon: 'Calculator' },
  { name: 'Date Calculator', href: '/tools/date-calculator', description: 'Date calculation and duration calculator', category: 'productivity', icon: 'Calendar' },
  { name: 'Equation Solver', href: '/tools/equation-solver', description: 'Mathematical equation solver', category: 'productivity', icon: 'Calculator' },
  { name: 'File Splitter', href: '/tools/file-splitter', description: 'Split large files into smaller parts', category: 'file', icon: 'FileCode' },
  { name: 'File Joiner', href: '/tools/file-joiner', description: 'Join split files back together', category: 'file', icon: 'FileCode' },
  { name: 'CSV Converter', href: '/tools/csv-converter', description: 'CSV file conversion and manipulation', category: 'data', icon: 'Database' },
  { name: 'JSON Schema Validator', href: '/tools/json-schema-validator', description: 'JSON schema validation and testing', category: 'development', icon: 'Code' },
  { name: 'HTML to Markdown', href: '/tools/html-to-markdown', description: 'Convert HTML to Markdown format', category: 'text', icon: 'Code' },
  { name: 'Markdown to HTML', href: '/tools/markdown-to-html', description: 'Convert Markdown to HTML format', category: 'text', icon: 'Code' },
  { name: 'URL Shortener', href: '/tools/url-shortener', description: 'Create short, memorable URLs', category: 'network', icon: 'Link' },
  { name: 'Base64 Encoder', href: '/tools/base64-encoder', description: 'Base64 encoding and decoding', category: 'text', icon: 'Hash' },
  { name: 'Hash Generator', href: '/tools/hash-generator', description: 'Generate various hash types', category: 'security', icon: 'Hash' },
  { name: 'Password Analyzer', href: '/tools/password-analyzer', description: 'Analyze password strength and security', category: 'security', icon: 'Shield' },
  { name: 'UUID Generator', href: '/tools/uuid-generator', description: 'Generate UUIDs and unique identifiers', category: 'development', icon: 'Hash' },
  { name: 'Regex Generator', href: '/tools/regex-generator', description: 'Generate regular expressions easily', category: 'development', icon: 'Code' },
  { name: 'Color Converter', href: '/tools/color-converter', description: 'Convert between color formats', category: 'image', icon: 'Palette' },
  { name: 'Image Optimizer', href: '/tools/image-optimizer', description: 'Optimize images for web performance', category: 'image', icon: 'Image' },
  { name: 'QR Code Generator', href: '/tools/qr-code-generator', description: 'Generate QR codes for various data types', category: 'image', icon: 'QrCode' }
]

export const getToolsByCategory = (category: string): Tool[] => {
  return toolsData.filter(tool => tool.category === category)
}

export const getAllCategories = (): string[] => {
  const categories = new Set(toolsData.map(tool => tool.category))
  return Array.from(categories)
}

export const searchTools = (query: string): Tool[] => {
  const lowercaseQuery = query.toLowerCase()
  return toolsData.filter(tool =>
    tool.name.toLowerCase().includes(lowercaseQuery) ||
    tool.description.toLowerCase().includes(lowercaseQuery) ||
    tool.category.toLowerCase().includes(lowercaseQuery)
  )
}

export const getFeaturedTools = (): Tool[] => {
  return toolsData.filter(tool => tool.featured)
}

export const getPopularTools = (): Tool[] => {
  return toolsData.filter(tool => tool.popular)
}