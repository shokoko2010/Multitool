import { NextResponse } from 'next/server'

interface Tool {
  name: string
  href: string
  description: string
  category: string
  icon: any
  featured?: boolean
  popular?: boolean
}

const tools: Tool[] = [
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
  { name: 'URL Encoder', href: '/tools/url-encoder', description: 'URL encoding and decoding utilities', category: 'text', icon: 'LinkIcon' },
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
  { name: 'SEO Analyzer', href: '/tools/seo-audit-tool', description: 'Comprehensive website SEO analysis', category: 'seo', icon: 'TrendingUp', featured: true, popular: true },
  { name: 'Keyword Density', href: '/tools/keyword-density', description: 'Keyword analysis and density calculation', category: 'seo', icon: 'TrendingUp' },
  { name: 'Meta Tag Generator', href: '/tools/meta-tag-generator', description: 'SEO meta tag generation', category: 'seo', icon: 'Hash', popular: true },
  { name: 'SERP Checker', href: '/tools/serp-checker', description: 'Track keyword rankings in search results', category: 'seo', icon: 'TrendingUp' },
  { name: 'Backlink Checker', href: '/tools/backlink-checker', description: 'Backlink analysis and monitoring', category: 'seo', icon: 'TrendingUp' },
  { name: 'Plagiarism Checker', href: '/tools/plagiarism-checker', description: 'Content originality and plagiarism detection', category: 'seo', icon: 'FileText' },
  { name: 'Readability Score', href: '/tools/readability-score', description: 'Content readability and complexity analysis', category: 'seo', icon: 'FileText' },

  // AI Tools
  { name: 'AI Content Generator', href: '/tools/ai-content-generator', description: 'AI-powered content creation', category: 'ai', icon: 'Brain', featured: true, popular: true },
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
]

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Group tools by category
    const toolsByCategory = tools.reduce((acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = []
      }
      acc[tool.category].push(tool)
      return acc
    }, {} as Record<string, Tool[]>)
    
    // Create category objects with counts
    const categories = Object.keys(toolsByCategory).map(category => ({
      id: category,
      name: category.charAt(0).toUpperCase() + category.slice(1) + ' Tools',
      count: toolsByCategory[category].length,
      description: `${category.charAt(0).toUpperCase() + category.slice(1)} utilities and tools`
    }))
    
    return NextResponse.json({
      success: true,
      data: tools,
      total: tools.length,
      categories: categories,
      featured: tools.filter(tool => tool.featured),
      popular: tools.filter(tool => tool.popular),
      toolsByCategory: toolsByCategory
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tools' },
      { status: 500 }
    )
  }
}