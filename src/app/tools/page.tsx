"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Globe, 
  Shield, 
  Code, 
  Image, 
  Palette, 
  Calculator, 
  Hash, 
  Database, 
  FileText, 
  Zap, 
  GitCompare, 
  BarChart3, 
  Key, 
  Volume2, 
  Video, 
  Monitor, 
  Wifi, 
  HardDrive, 
  Cpu, 
  Hash as HashIcon, 
  Dice6, 
  Calendar, 
  QrCode, 
  BarChart3 as BarcodeIcon, 
  Upload, 
  Settings, 
  Binary, 
  FileCode, 
  Download, 
  CheckCircle, 
  Brain, 
  Star, 
  TrendingUp, 
  Users, 
  Zap as ZapIcon, 
  ArrowRight, 
  Sparkles, 
  Grid3X3, 
  Link as LinkIcon,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'next/link'

interface Tool {
  name: string
  href: string
  description: string
  category: string
  icon: any
  featured?: boolean
  popular?: boolean
}

interface Category {
  id: string
  name: string
  count: number
  icon: any
  description: string
}

// Tool metadata mapping
const TOOL_METADATA: Record<string, Partial<Tool>> = {
  // Network Tools
  'dns-lookup': { category: 'network', icon: Globe, description: 'DNS record analysis and domain information' },
  'ip-lookup': { category: 'network', icon: Globe, description: 'Geolocation and IP address information' },
  'ssl-lookup': { category: 'network', icon: Shield, description: 'SSL certificate validation and analysis' },
  'whois': { category: 'network', icon: Globe, description: 'Domain registration and ownership information' },
  'ping': { category: 'network', icon: Globe, description: 'Network connectivity and latency testing' },
  'port-scanner': { category: 'network', icon: Globe, description: 'Open port detection and security scanning' },
  'http-headers': { category: 'network', icon: Globe, description: 'HTTP header analysis and inspection' },
  'http-request': { category: 'network', icon: Globe, description: 'HTTP request testing and debugging' },
  'reverse-ip': { category: 'network', icon: Globe, description: 'Reverse IP lookup and domain mapping' },
  'my-ip': { category: 'network', icon: Globe, description: 'Your current IP address information' },
  'domain-age': { category: 'network', icon: Globe, description: 'Domain age and registration history' },
  'domain-hosting': { category: 'network', icon: Globe, description: 'Domain hosting and server information' },
  'domain-to-ip': { category: 'network', icon: Globe, description: 'Domain to IP address conversion' },
  'ip-geolocation': { category: 'network', icon: Globe, description: 'IP geolocation and location data' },
  'online-ping-website-tool': { category: 'network', icon: Globe, description: 'Website ping and connectivity testing' },
  
  // Security Tools
  'safe-url': { category: 'security', icon: Shield, description: 'URL safety and threat detection' },
  'password-strength': { category: 'security', icon: Shield, description: 'Password security analysis and recommendations' },
  'meta-tags': { category: 'security', icon: Shield, description: 'Meta tag analysis and SEO optimization' },
  'md5-generator': { category: 'security', icon: Hash, description: 'MD5 hash generation and verification' },
  'sha256-generator': { category: 'security', icon: Hash, description: 'SHA-256 hash generation and verification' },
  'password-generator': { category: 'security', icon: Key, description: 'Secure random password generation' },
  'hash-checker': { category: 'security', icon: Hash, description: 'Hash verification and integrity checking' },
  'token-generator': { category: 'security', icon: Key, description: 'API token and authentication key generation' },
  'malware-checker': { category: 'security', icon: Shield, description: 'Website malware and security scanning' },
  'suspicious-domain': { category: 'security', icon: Shield, description: 'Suspicious domain detection and analysis' },
  'blacklist': { category: 'security', icon: Shield, description: 'Domain and IP blacklist checking' },
  'jwt-tool': { category: 'security', icon: Key, description: 'JWT token analysis and validation' },
  
  // Text Utilities
  'text-to-speech': { category: 'text', icon: Volume2, description: 'Text-to-speech conversion with multiple voices' },
  'case-converter': { category: 'text', icon: Code, description: 'Text case conversion utilities' },
  'character-counter': { category: 'text', icon: FileText, description: 'Character, word, and line counting' },
  'email-extractor': { category: 'text', icon: FileText, description: 'Email address extraction from text' },
  'reverse-words': { category: 'text', icon: Code, description: 'Text and word reversal utilities' },
  'url-encoder': { category: 'text', icon: LinkIcon, description: 'URL encoding and decoding utilities' },
  'base64-encoder': { category: 'text', icon: Hash, description: 'Base64 encoding and decoding' },
  'text-difference': { category: 'text', icon: Code, description: 'Text comparison and diff analysis' },
  'word-counter': { category: 'text', icon: FileText, description: 'Advanced word counting and analysis' },
  'text-to-binary': { category: 'text', icon: Binary, description: 'Text to binary conversion' },
  'text-entropy': { category: 'text', icon: Hash, description: 'Text entropy and randomness analysis' },
  'text-clustering': { category: 'text', icon: Code, description: 'Text clustering and categorization' },
  'text-complexity': { category: 'text', icon: Code, description: 'Text complexity and readability analysis' },
  'sentence-counter': { category: 'text', icon: FileText, description: 'Sentence counting and analysis' },
  'paragraph-counter': { category: 'text', icon: FileText, description: 'Paragraph counting and structure analysis' },
  'lorem-ipsum': { category: 'text', icon: FileText, description: 'Lorem ipsum placeholder text generation' },
  'grammar-checker': { category: 'text', icon: FileText, description: 'Grammar and spelling checking' },
  
  // Image Tools
  'image-converter': { category: 'image', icon: Image, description: 'Image format conversion and optimization' },
  'youtube-thumbnail': { category: 'image', icon: Image, description: 'YouTube thumbnail extraction and download' },
  'qr-code-reader': { category: 'image', icon: QrCode, description: 'QR code scanning and content extraction' },
  'color-picker': { category: 'image', icon: Palette, description: 'Color selection and conversion utilities' },
  'exif-reader': { category: 'image', icon: Image, description: 'EXIF data extraction from images' },
  'image-resizer': { category: 'image', icon: Image, description: 'Image resizing and dimension adjustment' },
  'image-compressor': { category: 'image', icon: Image, description: 'Image compression and optimization' },
  'image-to-text': { category: 'image', icon: Image, description: 'Extract text from images using OCR' },
  'image-placeholder': { category: 'image', icon: Image, description: 'Generate placeholder images' },
  'exif-remover': { category: 'image', icon: Image, description: 'Remove EXIF data from images' },
  'color-converter': { category: 'image', icon: Palette, description: 'Color format conversion utilities' },
  'hex-to-rgb': { category: 'image', icon: Palette, description: 'Hex to RGB color conversion' },
  
  // SEO Tools
  'seo-audit-tool': { category: 'seo', icon: TrendingUp, description: 'Comprehensive website SEO analysis' },
  'keyword-density': { category: 'seo', icon: TrendingUp, description: 'Keyword analysis and density calculation' },
  'meta-tag-generator': { category: 'seo', icon: Hash, description: 'SEO meta tag generation' },
  'serp-checker': { category: 'seo', icon: TrendingUp, description: 'Track keyword rankings in search results' },
  'backlink-checker': { category: 'seo', icon: TrendingUp, description: 'Backlink analysis and monitoring' },
  'plagiarism-checker': { category: 'seo', icon: FileText, description: 'Content originality and plagiarism detection' },
  'readability-score': { category: 'seo', icon: FileText, description: 'Content readability and complexity analysis' },
  'meta-tags-analyzer': { category: 'seo', icon: TrendingUp, description: 'Meta tag analysis and optimization' },
  'mozrank': { category: 'seo', icon: TrendingUp, description: 'MozRank and domain authority analysis' },
  'link-analyzer': { category: 'seo', icon: TrendingUp, description: 'Backlink and link analysis' },
  'keyword-position-checker': { category: 'seo', icon: TrendingUp, description: 'Keyword position tracking' },
  'keyword-cpc-calculator': { category: 'seo', icon: Calculator, description: 'Keyword CPC and competition analysis' },
  'google-index': { category: 'seo', icon: TrendingUp, description: 'Google indexing status checking' },
  'xml-sitemap-generator': { category: 'seo', icon: TrendingUp, description: 'XML sitemap generation' },
  'robots-txt-generator': { category: 'seo', icon: TrendingUp, description: 'robots.txt file generation' },
  'pagespeed-insights': { category: 'seo', icon: TrendingUp, description: 'Google PageSpeed Insights analysis' },
  'structured-data-generator': { category: 'seo', icon: Globe, description: 'JSON-LD structured data generation' },
  'hreflang-generator': { category: 'seo', icon: Globe, description: 'Hreflang tag generator for multilingual SEO' },
  'seo-content-template': { category: 'seo', icon: FileText, description: 'SEO-optimized content template generator' },
  'search-console-simulator': { category: 'seo', icon: BarChart3, description: 'Google Search Console performance simulator' },
  
  // AI Tools
  'ai-content-generator': { category: 'ai', icon: Brain, description: 'AI-powered content creation' },
  'ai-seo-title': { category: 'ai', icon: Brain, description: 'AI-powered SEO title generation' },
  'ai-seo-description': { category: 'ai', icon: Brain, description: 'AI meta description generation' },
  'ai-keyword-cluster': { category: 'ai', icon: Brain, description: 'AI keyword clustering and analysis' },
  'text-summarizer': { category: 'ai', icon: Brain, description: 'AI text summarization and condensation' },
  'sentiment-analyzer': { category: 'ai', icon: Brain, description: 'AI sentiment analysis and emotion detection' },
  'ai-code-reviewer': { category: 'ai', icon: Brain, description: 'AI-powered code quality analysis' },
  'paraphraser': { category: 'ai', icon: Brain, description: 'AI text paraphrasing and rewriting' },
  'article-rewriter': { category: 'ai', icon: Brain, description: 'AI article rewriting and optimization' },
  
  // Development Tools
  'json-formatter': { category: 'development', icon: Code, description: 'JSON formatting and validation' },
  'xml-formatter': { category: 'development', icon: Code, description: 'XML formatting and validation' },
  'html-formatter': { category: 'development', icon: Code, description: 'HTML formatting and validation' },
  'sql-formatter': { category: 'development', icon: Code, description: 'SQL formatting and syntax highlighting' },
  'regex-tester': { category: 'development', icon: Code, description: 'Regular expression testing and validation' },
  'javascript-formatter': { category: 'development', icon: Code, description: 'JavaScript code formatting and beautification' },
  'css-formatter': { category: 'development', icon: Code, description: 'CSS formatting and optimization' },
  'yaml-to-json': { category: 'development', icon: Code, description: 'YAML to JSON conversion' },
  'xml-to-json': { category: 'development', icon: Code, description: 'XML to JSON conversion' },
  'json-schema-validator': { category: 'development', icon: Code, description: 'JSON Schema validation' },
  'regex-generator': { category: 'development', icon: Code, description: 'Regular expression pattern generator' },
  'git-helper': { category: 'development', icon: GitCompare, description: 'Git command helper and utilities' },
  'source-code': { category: 'development', icon: Code, description: 'Source code formatting and analysis' },
  'api-tester': { category: 'development', icon: Code, description: 'API testing and debugging' },
  
  // Converters
  'temperature-converter': { category: 'converters', icon: Calculator, description: 'Temperature unit conversion' },
  'distance-converter': { category: 'converters', icon: Calculator, description: 'Distance and length unit conversion' },
  'weight-converter': { category: 'converters', icon: Calculator, description: 'Weight and mass unit conversion' },
  'timestamp-converter': { category: 'converters', icon: Calendar, description: 'Timestamp and date conversion' },
  'data-size-converter': { category: 'converters', icon: Calculator, description: 'Data storage size conversion' },
  'csv-converter': { category: 'converters', icon: Database, description: 'CSV file conversion and processing' },
  
  // Data Analysis
  'data-visualization': { category: 'data', icon: BarChart3, description: 'Create charts and graphs from your data' },
  'chart-generator': { category: 'data', icon: BarChart3, description: 'Generate various types of charts' },
  'word-frequency': { category: 'data', icon: BarChart3, description: 'Word frequency analysis and statistics' },
  'bulk-geo': { category: 'data', icon: Database, description: 'Bulk geocoding and location data processing' },
  'data-extractor': { category: 'data', icon: Database, description: 'Data extraction from various sources' },
  
  // Cryptography
  'bcrypt-generator': { category: 'cryptography', icon: Hash, description: 'BCrypt hash generation and verification' },
  'uuid-generator': { category: 'cryptography', icon: Hash, description: 'UUID generation and validation' },
  'hash-checker': { category: 'cryptography', icon: Hash, description: 'Hash verification and integrity checking' },
  
  // File Processing
  'file-splitter': { category: 'file', icon: FileCode, description: 'Split large files into smaller parts' },
  'file-joiner': { category: 'file', icon: FileCode, description: 'Join split files back together' },
  'pdf-tools': { category: 'file', icon: FileCode, description: 'PDF processing and manipulation tools' },
  
  // System & Hardware
  'system-info': { category: 'system', icon: Monitor, description: 'System information and specifications' },
  'cpu': { category: 'system', icon: Cpu, description: 'CPU information and performance data' },
  'hard-drive': { category: 'system', icon: HardDrive, description: 'Hard drive and storage information' },
  
  // Productivity
  'calculator': { category: 'productivity', icon: Calculator, description: 'Scientific calculator with advanced functions' },
  'date-calculator': { category: 'productivity', icon: Calendar, description: 'Date calculation and duration calculator' },
  'equation-solver': { category: 'productivity', icon: Calculator, description: 'Mathematical equation solver' },
  
  // Audio & Video
  'audio-recorder': { category: 'media', icon: Volume2, description: 'Audio recording and editing tools' },
  'audio-converter': { category: 'media', icon: Volume2, description: 'Audio format conversion' },
  'video-converter': { category: 'media', icon: Video, description: 'Video format conversion and processing' },
  'video-downloader': { category: 'media', icon: Video, description: 'Video downloading from various platforms' },
  
  // Communication
  'whatsapp-link': { category: 'communication', icon: LinkIcon, description: 'WhatsApp link generator' },
  'utm-link': { category: 'communication', icon: LinkIcon, description: 'UTM parameter generator for tracking' },
  
  // Web & Internet
  'url-shortener': { category: 'web', icon: LinkIcon, description: 'URL shortening and redirection' },
  'url-rewriting': { category: 'web', icon: LinkIcon, description: 'URL rewriting and redirect rules' },
  'web-scraper': { category: 'web', icon: Globe, description: 'Web scraping and data extraction' },
  'html-scraper': { category: 'web', icon: Globe, description: 'HTML content extraction' },
  'html-to-markdown': { category: 'web', icon: Code, description: 'HTML to Markdown conversion' },
  
  // Business & Marketing
  'link-price': { category: 'business', icon: TrendingUp, description: 'Link pricing and valuation' },
  'backlink-maker': { category: 'business', icon: TrendingUp, description: 'Backlink generation and building' },
  'citation-generator': { category: 'business', icon: FileText, description: 'Citation and reference generation' },
  'terms-conditions': { category: 'business', icon: FileText, description: 'Terms and conditions generator' },
  'privacy-policy': { category: 'business', icon: FileText, description: 'Privacy policy generator' },
  'slug-generator': { category: 'business', icon: Hash, description: 'URL slug generation' },
  'random-generator': { category: 'business', icon: Dice6, description: 'Random data and number generation' },
  'barcode-generator': { category: 'business', icon: BarcodeIcon, description: 'Barcode generation for various formats' },
  
  // Other Tools
  'performance-optimization': { category: 'optimization', icon: Zap, description: 'Website performance optimization analysis' },
  'syllable-counter': { category: 'text', icon: FileText, description: 'Syllable counting and analysis' },
  'line-counter': { category: 'text', icon: FileText, description: 'Line counting and analysis' },
  'youtube-keywords': { category: 'seo', icon: TrendingUp, description: 'YouTube keyword research and analysis' },
  'www-redirect': { category: 'web', icon: LinkIcon, description: 'WWW redirect configuration' },
  'website-screenshot': { category: 'web', icon: Image, description: 'Website screenshot capture' },
  'upload': { category: 'file', icon: Upload, description: 'File upload and processing' },
  'download': { category: 'file', icon: Download, description: 'File download utilities' },
  'check-circle': { category: 'validation', icon: CheckCircle, description: 'Validation and verification tools' },
  'star': { category: 'rating', icon: Star, description: 'Rating and review tools' },
  'users': { category: 'social', icon: Users, description: 'Social media and user analysis' },
  'refresh-cw': { category: 'utility', icon: RefreshCw, description: 'Data refresh and update tools' },
  'alert-circle': { category: 'notification', icon: AlertCircle, description: 'Alert and notification systems' }
}

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'all', name: 'All Tools', count: 0, icon: Grid3X3, description: 'Browse all available tools' },
  { id: 'network', name: 'Network Tools', count: 0, icon: Globe, description: 'Diagnostics and analysis utilities' },
  { id: 'security', name: 'Security Tools', count: 0, icon: Shield, description: 'Vulnerability checking and security analysis' },
  { id: 'text', name: 'Text Utilities', count: 0, icon: Code, description: 'Text processing and manipulation' },
  { id: 'image', name: 'Image Tools', count: 0, icon: Image, description: 'Image processing and conversion' },
  { id: 'seo', name: 'SEO Tools', count: 0, icon: TrendingUp, description: 'Search engine optimization utilities' },
  { id: 'ai', name: 'AI Tools', count: 0, icon: Brain, description: 'Artificial intelligence and automation' },
  { id: 'development', name: 'Development', count: 0, icon: Settings, description: 'Coding and development utilities' },
  { id: 'converters', name: 'Converters', count: 0, icon: Calculator, description: 'Unit and data conversion tools' },
  { id: 'data', name: 'Data Analysis', count: 0, icon: BarChart3, description: 'Data processing and analysis tools' },
  { id: 'cryptography', name: 'Cryptography', count: 0, icon: Hash, description: 'Encryption and hashing utilities' },
  { id: 'file', name: 'File Tools', count: 0, icon: FileCode, description: 'File processing and manipulation' },
  { id: 'system', name: 'System Tools', count: 0, icon: Monitor, description: 'System and hardware utilities' },
  { id: 'productivity', name: 'Productivity', count: 0, icon: Calculator, description: 'Productivity and calculation tools' },
  { id: 'media', name: 'Media Tools', count: 0, icon: Video, description: 'Audio and video processing' },
  { id: 'communication', name: 'Communication', count: 0, icon: LinkIcon, description: 'Communication and messaging tools' },
  { id: 'web', name: 'Web Tools', count: 0, icon: Globe, description: 'Web development and internet utilities' },
  { id: 'business', name: 'Business Tools', count: 0, icon: TrendingUp, description: 'Business and marketing utilities' },
  { id: 'optimization', name: 'Optimization', count: 0, icon: Zap, description: 'Performance and optimization tools' }
]

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [tools, setTools] = useState<Tool[]>([])
  const [filteredTools, setFilteredTools] = useState<Tool[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // Featured tools
  const featuredTools: Tool[] = [
    {
      name: 'SEO Audit Tool',
      href: '/tools/seo-audit-tool',
      description: 'Comprehensive website SEO analysis and optimization recommendations',
      category: 'seo',
      icon: TrendingUp,
      featured: true,
      popular: true
    },
    {
      name: 'Performance Optimization',
      href: '/tools/performance-optimization',
      description: 'Website performance analysis and optimization recommendations',
      category: 'optimization',
      icon: Zap,
      featured: true,
      popular: true
    },
    {
      name: 'AI Content Generator',
      href: '/tools/ai-content-generator',
      description: 'Generate high-quality content using advanced AI algorithms',
      category: 'ai',
      icon: Brain,
      featured: true,
      popular: true
    }
  ]

  // Discover tools dynamically by scanning the tools directory
  const discoverTools = async (): Promise<Tool[]> => {
    try {
      // For now, we'll use the actual discovered tools from the filesystem
      // In a production environment, you might want to use a server-side API call
      const actualTools = [
        'dns-lookup', 'ip-lookup', 'ssl-lookup', 'whois', 'ping', 'port-scanner',
        'http-headers', 'http-request', 'reverse-ip', 'my-ip', 'domain-age',
        'domain-hosting', 'domain-to-ip', 'ip-geolocation', 'online-ping-website-tool',
        'safe-url', 'password-strength', 'meta-tags', 'md5-generator', 'sha256-generator',
        'password-generator', 'hash-checker', 'token-generator', 'malware-checker',
        'suspicious-domain', 'blacklist', 'jwt-tool', 'text-to-speech', 'case-converter',
        'character-counter', 'email-extractor', 'reverse-words', 'url-encoder',
        'base64-encoder', 'text-difference', 'word-counter', 'text-to-binary',
        'text-entropy', 'text-clustering', 'text-complexity', 'sentence-counter',
        'paragraph-counter', 'lorem-ipsum', 'grammar-checker', 'image-converter',
        'youtube-thumbnail', 'qr-code-reader', 'qr-code-generator', 'color-picker', 'exif-reader',
        'image-resizer', 'image-compressor', 'image-to-text', 'image-placeholder',
        'exif-remover', 'color-converter', 'hex-to-rgb', 'seo-audit-tool',
        'keyword-density', 'meta-tag-generator', 'serp-checker', 'backlink-checker',
        'plagiarism-checker', 'readability-score', 'meta-tags-analyzer', 'mozrank',
        'link-analyzer', 'keyword-position-checker', 'keyword-cpc-calculator',
        'google-index', 'xml-sitemap-generator', 'robots-txt-generator', 'pagespeed-insights',
        'ai-content-generator', 'ai-seo-title', 'ai-seo-description', 'ai-keyword-cluster',
        'text-summarizer', 'sentiment-analyzer', 'ai-code-reviewer', 'paraphraser',
        'article-rewriter', 'json-formatter', 'xml-formatter', 'html-formatter',
        'sql-formatter', 'regex-tester', 'javascript-formatter', 'css-formatter',
        'yaml-to-json', 'xml-to-json', 'json-schema-validator', 'regex-generator',
        'git-helper', 'source-code', 'api-tester', 'temperature-converter',
        'distance-converter', 'weight-converter', 'timestamp-converter', 'data-size-converter',
        'csv-converter', 'data-visualization', 'chart-generator', 'word-frequency',
        'bulk-geo', 'data-extractor', 'bcrypt-generator', 'uuid-generator',
        'file-splitter', 'file-joiner', 'pdf-tools', 'system-info', 'cpu',
        'hard-drive', 'calculator', 'date-calculator', 'equation-solver',
        'audio-recorder', 'audio-converter', 'video-converter', 'video-downloader',
        'whatsapp-link', 'utm-link', 'url-shortener', 'url-rewriting',
        'web-scraper', 'html-scraper', 'html-to-markdown', 'link-price',
        'backlink-maker', 'citation-generator', 'terms-conditions', 'privacy-policy',
        'slug-generator', 'random-generator', 'barcode-generator', 'performance-optimization',
        'syllable-counter', 'line-counter', 'youtube-keywords', 'www-redirect',
        'website-screenshot', 'upload', 'download', 'check-circle', 'star',
        'users', 'refresh-cw', 'alert-circle'
      ]

      return actualTools.map(path => {
        const metadata = TOOL_METADATA[path] || {}
        return {
          name: formatToolName(path),
          href: `/tools/${path}`,
          description: metadata.description || 'Tool description not available',
          category: metadata.category || 'other',
          icon: metadata.icon || Settings,
          featured: metadata.featured || false,
          popular: metadata.popular || false
        }
      })
    } catch (err) {
      console.error('Error discovering tools:', err)
      setError('Failed to load tools. Please try again.')
      return []
    }
  }

  // Format tool name from path
  const formatToolName = (path: string): string => {
    return path
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Initialize tools data
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null
    
    const loadTools = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Set a timeout to prevent infinite loading
        timeout = setTimeout(() => {
          setError('Loading took too long. Please try again.')
          setIsLoading(false)
        }, 10000) // 10 second timeout

        const discoveredTools = await discoverTools()
        setTools(discoveredTools)
        setFilteredTools(discoveredTools)
        setLastRefresh(new Date())

        // Calculate category counts
        const counts = categories.map(cat => ({
          ...cat,
          count: cat.id === 'all' ? discoveredTools.length : discoveredTools.filter(tool => tool.category === cat.id).length
        }))
        
        setCategories(counts)
      } catch (err) {
        console.error('Error loading tools:', err)
        setError('Failed to load tools. Please try refreshing the page.')
      } finally {
        if (timeout) {
          clearTimeout(timeout)
        }
        setIsLoading(false)
      }
    }

    loadTools()
    
    // Cleanup timeout on unmount
    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [])

  // Refresh tools
  const refreshTools = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const discoveredTools = await discoverTools()
      setTools(discoveredTools)
      setFilteredTools(discoveredTools)
      setLastRefresh(new Date())

      // Recalculate category counts
      const counts = categories.map(cat => ({
        ...cat,
        count: cat.id === 'all' ? discoveredTools.length : discoveredTools.filter(tool => tool.category === cat.id).length
      }))
      
      setCategories(counts)
    } catch (err) {
      console.error('Error refreshing tools:', err)
      setError('Failed to refresh tools. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter tools based on search and category
  useEffect(() => {
    let filtered = tools

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredTools(filtered)
  }, [tools, selectedCategory, searchQuery])

  const handleToolClick = (href: string) => {
    console.log(`Tool clicked: ${href}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section Skeleton */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/5 py-20">
          <div className="container mx-auto px-6">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-4">
                <div className="animate-pulse bg-muted rounded-full h-8 w-32"></div>
                <div className="animate-pulse bg-muted rounded-full h-8 w-40"></div>
              </div>
              <div className="space-y-4">
                <div className="animate-pulse bg-muted rounded-lg h-12 w-3/4 mx-auto"></div>
                <div className="animate-pulse bg-muted rounded-lg h-6 w-2/3 mx-auto"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Tools Grid Skeleton */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-card rounded-lg border p-6 space-y-4">
                  <div className="animate-pulse bg-muted rounded-lg h-16 w-16"></div>
                  <div className="space-y-2">
                    <div className="animate-pulse bg-muted rounded h-4 w-3/4"></div>
                    <div className="animate-pulse bg-muted rounded h-3 w-full"></div>
                    <div className="animate-pulse bg-muted rounded h-3 w-5/6"></div>
                  </div>
                  <div className="animate-pulse bg-muted rounded h-10 w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-destructive/5 via-background to-destructive/5 py-20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6"
            >
              <div className="flex items-center justify-center gap-4">
                <AlertCircle className="w-12 h-12 text-destructive" />
                <h2 className="text-2xl font-bold text-destructive">Loading Error</h2>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {error}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={refreshTools} className="px-8">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()} className="px-8">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quick Access to Popular Tools */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <h3 className="text-2xl font-bold text-center mb-8">Popular Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTools.slice(0, 6).map((tool, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
                  <CardHeader className="text-center">
                    <tool.icon className="w-12 h-12 mx-auto text-primary" />
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      {tool.description}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleToolClick(tool.href)}
                    >
                      Open Tool
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/5 py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <div className="flex items-center justify-center gap-4">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                {tools.length}+ Free Online Tools
              </Badge>
              {lastRefresh && (
                <Badge variant="outline" className="text-sm px-4 py-2">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Updated {lastRefresh.toLocaleTimeString()}
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Browse Our Tools Collection
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover powerful tools for SEO, development, design, and productivity. All tools are free, fast, and secure.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Controls Section */}
      <section className="py-8 bg-background/50 border-b">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <category.icon className="w-4 h-4" />
                        <span>{category.name}</span>
                        <span className="text-muted-foreground text-sm">({category.count})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={refreshTools}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8">Featured Tools</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredTools.map((tool, index) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={tool.href}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <tool.icon className="w-8 h-8 text-primary" />
                        <div className="flex space-x-1">
                          {tool.featured && <Badge variant="secondary">Featured</Badge>}
                          {tool.popular && <Badge variant="default">Popular</Badge>}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Tools */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">
              All Tools
              <span className="text-lg text-muted-foreground ml-2">({filteredTools.length} found)</span>
            </h2>
          </div>

          {filteredTools.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No tools found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or category filter
              </p>
              <Button onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              <AnimatePresence>
                {filteredTools.map((tool, index) => (
                  <motion.div
                    key={tool.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    layout
                  >
                    <Link href={tool.href} onClick={() => handleToolClick(tool.href)}>
                      {viewMode === 'grid' ? (
                        <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <tool.icon className="w-8 h-8 text-primary" />
                              <div className="flex space-x-1">
                                {tool.featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                                {tool.popular && <Badge variant="default" className="text-xs">Popular</Badge>}
                              </div>
                            </div>
                            <CardTitle className="text-lg leading-tight">{tool.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <CardDescription className="text-sm leading-relaxed">
                              {tool.description}
                            </CardDescription>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <tool.icon className="w-6 h-6 text-primary" />
                                <div>
                                  <h3 className="font-semibold">{tool.name}</h3>
                                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {tool.category}
                                </Badge>
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}