"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Globe, Shield, Code, Image, Palette, Calculator, Hash, Link, Database, FileText, Zap, GitCompare, BarChart3, Key, Volume2, Video, Monitor, Wifi, HardDrive, Cpu, Hash as HashIcon, Dice6, Calendar, QrCode, BarChart3 as BarcodeIcon, Upload, Settings, Binary, FileCode, Download, CheckCircle, Brain, Star, TrendingUp, Users, Zap as ZapIcon, ArrowRight, Sparkles, Grid3X3 as GridIcon3 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut'
import { LazyEnhancedToolsSearch } from '@/components/lazy-enhanced-tools-search'
import { X } from 'lucide-react'
import { Tool } from '@/types/tool'
import { toolsData, getAllCategories, getToolsByCategory } from '@/data/tools'

export default function Home() {
  const { theme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [tools, setTools] = useState<Tool[]>([])
  const [filteredTools, setFilteredTools] = useState<Tool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showSearch, setShowSearch] = useState(false)
  const [categories, setCategories] = useState([
    { id: 'all', name: 'All Tools', count: 0, icon: GridIcon3 },
    { id: 'network', name: 'Network Tools', count: 0, icon: Globe, description: 'Diagnostics and analysis utilities' },
    { id: 'security', name: 'Security Tools', count: 0, icon: Shield, description: 'Vulnerability checking and security analysis' },
    { id: 'text', name: 'Text Utilities', count: 0, icon: Code, description: 'Text processing and manipulation' },
    { id: 'image', name: 'Image Tools', count: 0, icon: Image, description: 'Image processing and conversion' },
    { id: 'seo', name: 'SEO Tools', count: 0, icon: TrendingUp, description: 'Search engine optimization utilities' },
    { id: 'ai', name: 'AI Tools', count: 0, icon: Brain, description: 'Artificial intelligence and automation' },
    { id: 'development', name: 'Development', count: 0, icon: Settings, description: 'Coding and development utilities' },
    { id: 'converters', name: 'Converters', count: 0, icon: Calculator, description: 'Unit and data conversion tools' },
    { id: 'cryptography', name: 'Cryptography', count: 0, icon: Hash, description: 'Encryption and hashing utilities' },
  ])

  // Keyboard shortcut for search (Ctrl+K or Cmd+K)
  useKeyboardShortcut(
    { key: 'k', ctrlKey: true, metaKey: true },
    () => setShowSearch(true)
  )

  // Keyboard shortcut to close search (Escape)
  useKeyboardShortcut(
    { key: 'Escape' },
    () => setShowSearch(false)
  )

  // Featured tools for hero section
  const featuredTools: Tool[] = [
    {
      name: 'SEO Analyzer',
      href: '/tools/seo-analyzer',
      description: 'Comprehensive website SEO analysis and optimization recommendations',
      category: 'seo',
      icon: TrendingUp,
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
    },
    {
      name: 'Network Diagnostic',
      href: '/tools/network-diagnostic',
      description: 'Complete network analysis and troubleshooting toolkit',
      category: 'network',
      icon: Globe,
      featured: true,
      popular: true
    }
  ]

  // Popular tools section
  const popularTools: Tool[] = [
    {
      name: 'Meta Tag Generator',
      href: '/tools/meta-tag-generator',
      description: 'Generate SEO-optimized meta tags for better search rankings',
      category: 'seo',
      icon: Hash,
      popular: true
    },
    {
      name: 'Image Optimizer',
      href: '/tools/image-optimizer',
      description: 'Compress and optimize images for web performance',
      category: 'image',
      icon: Image,
      popular: true
    },
    {
      name: 'Password Analyzer',
      href: '/tools/password-analyzer',
      description: 'Check password strength and security vulnerabilities',
      category: 'security',
      icon: Shield,
      popular: true
    },
    {
      name: 'Code Formatter',
      href: '/tools/code-formatter',
      description: 'Format and beautify code in multiple programming languages',
      category: 'development',
      icon: Code,
      popular: true
    }
  ]

  // Initialize tools data
  useEffect(() => {
    try {
      const allTools: Tool[] = [
        // Network Tools
        { name: 'DNS Lookup', href: '/tools/dns-lookup', description: 'DNS record analysis and domain information', category: 'network', icon: Globe },
        { name: 'IP Lookup', href: '/tools/ip-lookup', description: 'Geolocation and IP address information', category: 'network', icon: Globe },
        { name: 'SSL Checker', href: '/tools/ssl-lookup', description: 'SSL certificate validation and analysis', category: 'network', icon: Shield },
        { name: 'Whois Lookup', href: '/tools/whois', description: 'Domain registration and ownership information', category: 'network', icon: Globe },
        { name: 'Ping Tool', href: '/tools/ping', description: 'Network connectivity and latency testing', category: 'network', icon: Globe },
        { name: 'Port Scanner', href: '/tools/port-scanner', description: 'Open port detection and security scanning', category: 'network', icon: Globe },
        { name: 'HTTP Headers', href: '/tools/http-headers', description: 'HTTP header analysis and inspection', category: 'network', icon: Globe },
        { name: 'HTTP Request', href: '/tools/http-request', description: 'HTTP request testing and debugging', category: 'network', icon: Globe },

        // Security Tools
        { name: 'Safe URL Checker', href: '/tools/safe-url', description: 'URL safety and threat detection', category: 'security', icon: Shield },
        { name: 'Password Strength', href: '/tools/password-strength', description: 'Password security analysis and recommendations', category: 'security', icon: Shield },
        { name: 'Meta Tags Checker', href: '/tools/meta-tags', description: 'Meta tag analysis and SEO optimization', category: 'security', icon: Shield },
        { name: 'MD5 Generator', href: '/tools/md5-generator', description: 'MD5 hash generation and verification', category: 'security', icon: Hash },
        { name: 'SHA-256 Generator', href: '/tools/sha256-generator', description: 'SHA-256 hash generation and verification', category: 'security', icon: Hash },
        { name: 'Password Generator', href: '/tools/password-generator', description: 'Secure random password generation', category: 'security', icon: Key },
        { name: 'Hash Checker', href: '/tools/hash-checker', description: 'Hash verification and integrity checking', category: 'security', icon: Hash },
        { name: 'Token Generator', href: '/tools/token-generator', description: 'API token and authentication key generation', category: 'security', icon: Key },

        // Text Utilities
        { name: 'Text to Speech', href: '/tools/text-to-speech', description: 'Text-to-speech conversion with multiple voices', category: 'text', icon: Volume2 },
        { name: 'Case Converter', href: '/tools/case-converter', description: 'Text case conversion utilities', category: 'text', icon: Code },
        { name: 'Character Counter', href: '/tools/character-counter', description: 'Character, word, and line counting', category: 'text', icon: FileText },
        { name: 'Email Extractor', href: '/tools/email-extractor', description: 'Email address extraction from text', category: 'text', icon: FileText },
        { name: 'Reverse Text', href: '/tools/reverse-words', description: 'Text and word reversal utilities', category: 'text', icon: Code },
        { name: 'URL Encoder', href: '/tools/url-encoder', description: 'URL encoding and decoding utilities', category: 'text', icon: Link },
        { name: 'Base64 Converter', href: '/tools/base64-encoder', description: 'Base64 encoding and decoding', category: 'text', icon: Hash },
        { name: 'Text Difference', href: '/tools/text-difference', description: 'Text comparison and diff analysis', category: 'text', icon: Code },
        { name: 'Word Counter', href: '/tools/word-counter', description: 'Advanced word counting and analysis', category: 'text', icon: FileText },

        // Image Tools
        { name: 'Image Converter', href: '/tools/image-converter', description: 'Image format conversion and optimization', category: 'image', icon: Image },
        { name: 'YouTube Thumbnail', href: '/tools/youtube-thumbnail', description: 'YouTube thumbnail extraction and download', category: 'image', icon: Image },
        { name: 'QR Code Reader', href: '/tools/qr-code-reader', description: 'QR code scanning and content extraction', category: 'image', icon: QrCode },
        { name: 'Color Picker', href: '/tools/color-picker', description: 'Color selection and conversion utilities', category: 'image', icon: Palette },
        { name: 'EXIF Reader', href: '/tools/exif-reader', description: 'EXIF data extraction from images', category: 'image', icon: Image },
        { name: 'Image Resizer', href: '/tools/image-resizer', description: 'Image resizing and dimension adjustment', category: 'image', icon: Image },
        { name: 'Image Compressor', href: '/tools/image-compressor', description: 'Image compression and optimization', category: 'image', icon: Image },

        // SEO Tools
        { name: 'SEO Analyzer', href: '/tools/seo-audit-tool', description: 'Comprehensive website SEO analysis', category: 'seo', icon: TrendingUp },
        { name: 'Keyword Density', href: '/tools/keyword-density', description: 'Keyword analysis and density calculation', category: 'seo', icon: TrendingUp },
        { name: 'Meta Tag Generator', href: '/tools/meta-tag-generator', description: 'SEO meta tag generation', category: 'seo', icon: Hash },
        { name: 'SERP Checker', href: '/tools/serp-checker', description: 'Track keyword rankings in search results', category: 'seo', icon: TrendingUp },
        { name: 'Backlink Checker', href: '/tools/backlink-checker', description: 'Backlink analysis and monitoring', category: 'seo', icon: TrendingUp },
        { name: 'Plagiarism Checker', href: '/tools/plagiarism-checker', description: 'Content originality and plagiarism detection', category: 'seo', icon: FileText },
        { name: 'Readability Score', href: '/tools/readability-score', description: 'Content readability and complexity analysis', category: 'seo', icon: FileText },

        // AI Tools
        { name: 'AI Content Generator', href: '/tools/ai-content-generator', description: 'AI-powered content creation', category: 'ai', icon: Brain },
        { name: 'AI SEO Title', href: '/tools/ai-seo-title', description: 'AI-powered SEO title generation', category: 'ai', icon: Brain },
        { name: 'AI SEO Description', href: '/tools/ai-seo-description', description: 'AI meta description generation', category: 'ai', icon: Brain },
        { name: 'AI Keyword Cluster', href: '/tools/ai-keyword-cluster', description: 'AI keyword clustering and analysis', category: 'ai', icon: Brain },
        { name: 'Text Summarizer', href: '/tools/text-summarizer', description: 'AI text summarization and condensation', category: 'ai', icon: Brain },
        { name: 'Sentiment Analyzer', href: '/tools/sentiment-analyzer', description: 'AI sentiment analysis and emotion detection', category: 'ai', icon: Brain },

        // Development Tools
        { name: 'JSON Formatter', href: '/tools/json-formatter', description: 'JSON formatting and validation', category: 'development', icon: Code },
        { name: 'XML Formatter', href: '/tools/xml-formatter', description: 'XML formatting and validation', category: 'development', icon: Code },
        { name: 'HTML Formatter', href: '/tools/html-formatter', description: 'HTML formatting and validation', category: 'development', icon: Code },
        { name: 'SQL Formatter', href: '/tools/sql-formatter', description: 'SQL formatting and syntax highlighting', category: 'development', icon: Code },
        { name: 'Regex Tester', href: '/tools/regex-tester', description: 'Regular expression testing and validation', category: 'development', icon: Code },
        { name: 'JavaScript Formatter', href: '/tools/javascript-formatter', description: 'JavaScript code formatting and beautification', category: 'development', icon: Code },
        { name: 'CSS Formatter', href: '/tools/css-formatter', description: 'CSS formatting and optimization', category: 'development', icon: Code },
        { name: 'AI Code Reviewer', href: '/tools/ai-code-reviewer', description: 'AI-powered code quality analysis and suggestions', category: 'development', icon: Brain },

        // Converters
        { name: 'Temperature Converter', href: '/tools/temperature-converter', description: 'Temperature unit conversion', category: 'converters', icon: Calculator },
        { name: 'Distance Converter', href: '/tools/distance-converter', description: 'Distance and length unit conversion', category: 'converters', icon: Calculator },
        { name: 'Weight Converter', href: '/tools/weight-converter', description: 'Weight and mass unit conversion', category: 'converters', icon: Calculator },
        { name: 'Timestamp Converter', href: '/tools/timestamp-converter', description: 'Timestamp and date conversion', category: 'converters', icon: Calendar },
        { name: 'Data Size Converter', href: '/tools/data-size-converter', description: 'Data storage size conversion', category: 'converters', icon: Calculator },

        // Additional tools to reach 135+
        { name: 'QR Code Generator', href: '/tools/qr-code-generator', description: 'QR code generation for various data types', category: 'image', icon: QrCode },
        { name: 'Video Downloader', href: '/tools/video-downloader', description: 'Download videos from various platforms', category: 'media', icon: Video },
        { name: 'Video Converter', href: '/tools/video-converter', description: 'Convert video formats and optimize', category: 'media', icon: Video },
        { name: 'Audio Recorder', href: '/tools/audio-recorder', description: 'Record and edit audio files', category: 'media', icon: Volume2 },
        { name: 'Audio Converter', href: '/tools/audio-converter', description: 'Convert audio formats and optimize', category: 'media', icon: Volume2 },
        { name: 'System Info', href: '/tools/system-info', description: 'View system information and specifications', category: 'system', icon: Monitor },
        { name: 'CPU Info', href: '/tools/cpu', description: 'CPU information and performance data', category: 'system', icon: Cpu },
        { name: 'Hard Drive Info', href: '/tools/hard-drive', description: 'Hard drive and storage information', category: 'system', icon: HardDrive },
        { name: 'Calculator', href: '/tools/calculator', description: 'Scientific calculator with advanced functions', category: 'productivity', icon: Calculator },
        { name: 'Date Calculator', href: '/tools/date-calculator', description: 'Date calculation and duration calculator', category: 'productivity', icon: Calendar },
        { name: 'Equation Solver', href: '/tools/equation-solver', description: 'Mathematical equation solver', category: 'productivity', icon: Calculator },
        { name: 'File Splitter', href: '/tools/file-splitter', description: 'Split large files into smaller parts', category: 'file', icon: FileCode },
        { name: 'File Joiner', href: '/tools/file-joiner', description: 'Join split files back together', category: 'file', icon: FileCode },
        { name: 'PDF Tools', href: '/tools/pdf-tools', description: 'PDF processing and manipulation tools', category: 'file', icon: FileCode },
        { name: 'Web Scraper', href: '/tools/web-scraper', description: 'Web scraping and data extraction', category: 'web', icon: Globe },
        { name: 'HTML Scraper', href: '/tools/html-scraper', description: 'HTML content extraction', category: 'web', icon: Globe },
        { name: 'HTML to Markdown', href: '/tools/html-to-markdown', description: 'HTML to Markdown conversion', category: 'web', icon: Code },
        { name: 'URL Shortener', href: '/tools/url-shortener', description: 'URL shortening and redirection', category: 'web', icon: Link },
        { name: 'URL Rewriting', href: '/tools/url-rewriting', description: 'URL rewriting and redirect rules', category: 'web', icon: Link },
        { name: 'WhatsApp Link', href: '/tools/whatsapp-link', description: 'WhatsApp link generator', category: 'communication', icon: Link },
        { name: 'UTM Link', href: '/tools/utm-link', description: 'UTM parameter generator for tracking', category: 'communication', icon: Link },
        { name: 'Link Analyzer', href: '/tools/link-analyzer', description: 'Backlink and link analysis', category: 'seo', icon: TrendingUp },
        { name: 'MozRank', href: '/tools/mozrank', description: 'MozRank and domain authority analysis', category: 'seo', icon: TrendingUp },
        { name: 'Keyword Position Checker', href: '/tools/keyword-position-checker', description: 'Keyword position tracking', category: 'seo', icon: TrendingUp },
        { name: 'Keyword CPC Calculator', href: '/tools/keyword-cpc-calculator', description: 'Keyword CPC and competition analysis', category: 'seo', icon: Calculator },
        { name: 'Google Index', href: '/tools/google-index', description: 'Google indexing status checking', category: 'seo', icon: TrendingUp },
        { name: 'XML Sitemap Generator', href: '/tools/xml-sitemap-generator', description: 'XML sitemap generation', category: 'seo', icon: TrendingUp },
        { name: 'Robots.txt Generator', href: '/tools/robots-txt-generator', description: 'robots.txt file generation', category: 'seo', icon: TrendingUp },
        { name: 'PageSpeed Insights', href: '/tools/pagespeed-insights', description: 'Google PageSpeed Insights analysis', category: 'seo', icon: TrendingUp },
        { name: 'YAML to JSON', href: '/tools/yaml-to-json', description: 'YAML to JSON conversion', category: 'development', icon: Code },
        { name: 'XML to JSON', href: '/tools/xml-to-json', description: 'XML to JSON conversion', category: 'development', icon: Code },
        { name: 'JSON Schema Validator', href: '/tools/json-schema-validator', description: 'JSON Schema validation', category: 'development', icon: Code },
        { name: 'Regex Generator', href: '/tools/regex-generator', description: 'Regular expression pattern generator', category: 'development', icon: Code },
        { name: 'Git Helper', href: '/tools/git-helper', description: 'Git command helper and utilities', category: 'development', icon: GitCompare },
        { name: 'Source Code', href: '/tools/source-code', description: 'Source code formatting and analysis', category: 'development', icon: Code },
        { name: 'API Tester', href: '/tools/api-tester', description: 'API testing and debugging', category: 'development', icon: Code },
        { name: 'CSV Converter', href: '/tools/csv-converter', description: 'CSV file conversion and processing', category: 'converters', icon: Database },
        { name: 'Data Visualization', href: '/tools/data-visualization', description: 'Create charts and graphs from your data', category: 'data', icon: BarChart3 },
        { name: 'Chart Generator', href: '/tools/chart-generator', description: 'Generate various types of charts', category: 'data', icon: BarChart3 },
        { name: 'Word Frequency', href: '/tools/word-frequency', description: 'Word frequency analysis and statistics', category: 'data', icon: BarChart3 },
        { name: 'Bulk Geo', href: '/tools/bulk-geo', description: 'Bulk geocoding and location data processing', category: 'data', icon: Database },
        { name: 'Data Extractor', href: '/tools/data-extractor', description: 'Data extraction from various sources', category: 'data', icon: Database },
        { name: 'BCrypt Generator', href: '/tools/bcrypt-generator', description: 'BCrypt hash generation and verification', category: 'cryptography', icon: Hash },
        { name: 'UUID Generator', href: '/tools/uuid-generator', description: 'UUID generation and validation', category: 'cryptography', icon: Hash },
        { name: 'Text to Binary', href: '/tools/text-to-binary', description: 'Text to binary conversion', category: 'text', icon: Binary },
        { name: 'Text Entropy', href: '/tools/text-entropy', description: 'Text entropy and randomness analysis', category: 'text', icon: Hash },
        { name: 'Text Clustering', href: '/tools/text-clustering', description: 'Text clustering and categorization', category: 'text', icon: Code },
        { name: 'Text Complexity', href: '/tools/text-complexity', description: 'Text complexity and readability analysis', category: 'text', icon: Code },
        { name: 'Sentence Counter', href: '/tools/sentence-counter', description: 'Sentence counting and analysis', category: 'text', icon: FileText },
        { name: 'Paragraph Counter', href: '/tools/paragraph-counter', description: 'Paragraph counting and structure analysis', category: 'text', icon: FileText },
        { name: 'Lorem Ipsum', href: '/tools/lorem-ipsum', description: 'Lorem ipsum placeholder text generation', category: 'text', icon: FileText },
        { name: 'Grammar Checker', href: '/tools/grammar-checker', description: 'Grammar and spelling checking', category: 'text', icon: FileText },
        { name: 'Image to Text', href: '/tools/image-to-text', description: 'Extract text from images using OCR', category: 'image', icon: Image },
        { name: 'Image Placeholder', href: '/tools/image-placeholder', description: 'Generate placeholder images', category: 'image', icon: Image },
        { name: 'EXIF Remover', href: '/tools/exif-remover', description: 'Remove EXIF data from images', category: 'image', icon: Image },
        { name: 'Color Converter', href: '/tools/color-converter', description: 'Color format conversion utilities', category: 'image', icon: Palette },
        { name: 'Hex to RGB', href: '/tools/hex-to-rgb', description: 'Hex to RGB color conversion', category: 'image', icon: Palette },
        { name: 'Malware Checker', href: '/tools/malware-checker', description: 'Website malware and security scanning', category: 'security', icon: Shield },
        { name: 'Suspicious Domain', href: '/tools/suspicious-domain', description: 'Suspicious domain detection and analysis', category: 'security', icon: Shield },
        { name: 'Blacklist', href: '/tools/blacklist', description: 'Domain and IP blacklist checking', category: 'security', icon: Shield },
        { name: 'JWT Tool', href: '/tools/jwt-tool', description: 'JWT token analysis and validation', category: 'security', icon: Key },
        { name: 'Reverse IP', href: '/tools/reverse-ip', description: 'Reverse IP lookup and domain mapping', category: 'network', icon: Globe },
        { name: 'My IP', href: '/tools/my-ip', description: 'Your current IP address information', category: 'network', icon: Globe },
        { name: 'Domain Age', href: '/tools/domain-age', description: 'Domain age and registration history', category: 'network', icon: Globe },
        { name: 'Domain Hosting', href: '/tools/domain-hosting', description: 'Domain hosting and server information', category: 'network', icon: Globe },
        { name: 'Domain to IP', href: '/tools/domain-to-ip', description: 'Domain to IP address conversion', category: 'network', icon: Globe },
        { name: 'IP Geolocation', href: '/tools/ip-geolocation', description: 'IP geolocation and location data', category: 'network', icon: Globe },
        { name: 'Online Ping Website Tool', href: '/tools/online-ping-website-tool', description: 'Website ping and connectivity testing', category: 'network', icon: Globe },
        { name: 'Citation Generator', href: '/tools/citation-generator', description: 'Generate citations in various formats', category: 'text', icon: FileText },
        { name: 'Paraphraser', href: '/tools/paraphraser', description: 'AI text paraphrasing and rewriting', category: 'ai', icon: Brain },
        { name: 'Article Rewriter', href: '/tools/article-rewriter', description: 'AI article rewriting and optimization', category: 'ai', icon: Brain },
        { name: 'Meta Tags Analyzer', href: '/tools/meta-tags-analyzer', description: 'Meta tag analysis and optimization', category: 'seo', icon: TrendingUp },
        { name: 'Link Price', href: '/tools/link-price', description: 'Link pricing and valuation', category: 'business', icon: TrendingUp },
        { name: 'Terms & Conditions', href: '/tools/terms-conditions', description: 'Generate terms and conditions pages', category: 'legal', icon: FileText },
        { name: 'Privacy Policy', href: '/tools/privacy-policy', description: 'Generate privacy policy pages', category: 'legal', icon: FileText },
        { name: 'Barcode Generator', href: '/tools/barcode-generator', description: 'Generate barcodes for various data types', category: 'image', icon: BarcodeIcon },
        { name: 'Website Screenshot', href: '/tools/website-screenshot', description: 'Capture website screenshots', category: 'web', icon: Monitor },
        { name: 'WhatsApp Business API', href: '/tools/whatsapp-business-api', description: 'WhatsApp Business API tools', category: 'communication', icon: Link },
        { name: 'Email Validator', href: '/tools/email-validator', description: 'Validate email addresses', category: 'text', icon: FileText },
        { name: 'Phone Number Validator', href: '/tools/phone-number-validator', description: 'Validate phone numbers', category: 'text', icon: FileText },
        { name: 'Credit Card Validator', href: '/tools/credit-card-validator', description: 'Validate credit card numbers', category: 'security', icon: Shield },
        { name: 'IBAN Validator', href: '/tools/iban-validator', description: 'Validate IBAN numbers', category: 'security', icon: Shield },
        { name: 'Routing Number Validator', href: '/tools/routing-number-validator', description: 'Validate routing numbers', category: 'security', icon: Shield },
        { name: 'Tax Calculator', href: '/tools/tax-calculator', description: 'Calculate taxes and deductions', category: 'productivity', icon: Calculator },
        { name: 'Loan Calculator', href: '/tools/loan-calculator', description: 'Calculate loan payments and interest', category: 'productivity', icon: Calculator },
        { name: 'Mortgage Calculator', href: '/tools/mortgage-calculator', description: 'Calculate mortgage payments', category: 'productivity', icon: Calculator },
        { name: 'Investment Calculator', href: '/tools/investment-calculator', description: 'Calculate investment returns', category: 'productivity', icon: Calculator },
        { name: 'Currency Converter', href: '/tools/currency-converter', description: 'Convert between different currencies', category: 'converters', icon: Calculator },
        { name: 'Unit Converter', href: '/tools/unit-converter', description: 'Convert between different units', category: 'converters', icon: Calculator },
        { name: 'Pressure Converter', href: '/tools/pressure-converter', description: 'Convert pressure units', category: 'converters', icon: Calculator },
        { name: 'Speed Converter', href: '/tools/speed-converter', description: 'Convert speed units', category: 'converters', icon: Calculator },
        { name: 'Area Converter', href: '/tools/area-converter', description: 'Convert area units', category: 'converters', icon: Calculator },
        { name: 'Volume Converter', href: '/tools/volume-converter', description: 'Convert volume units', category: 'converters', icon: Calculator },
        { name: 'Time Converter', href: '/tools/time-converter', description: 'Convert time units', category: 'converters', icon: Calendar },
        { name: 'Angle Converter', href: '/tools/angle-converter', description: 'Convert angle units', category: 'converters', icon: Calculator },
        { name: 'Energy Converter', href: '/tools/energy-converter', description: 'Convert energy units', category: 'converters', icon: Calculator },
        { name: 'Power Converter', href: '/tools/power-converter', description: 'Convert power units', category: 'converters', icon: Calculator },
        { name: 'Force Converter', href: '/tools/force-converter', description: 'Convert force units', category: 'converters', icon: Calculator },
        { name: 'Torque Converter', href: '/tools/torque-converter', description: 'Convert torque units', category: 'converters', icon: Calculator },
        { name: 'Viscosity Converter', href: '/tools/viscosity-converter', description: 'Convert viscosity units', category: 'converters', icon: Calculator },
        { name: 'Density Converter', href: '/tools/density-converter', description: 'Convert density units', category: 'converters', icon: Calculator },
        { name: 'Concentration Converter', href: '/tools/concentration-converter', description: 'Convert concentration units', category: 'converters', icon: Calculator },
        { name: 'Flow Converter', href: '/tools/flow-converter', description: 'Convert flow units', category: 'converters', icon: Calculator },
        { name: 'Illuminance Converter', href: '/tools/illuminance-converter', description: 'Convert illuminance units', category: 'converters', icon: Calculator },
        { name: 'Luminance Converter', href: '/tools/luminance-converter', description: 'Convert luminance units', category: 'converters', icon: Calculator },
        { name: 'Luminous Flux Converter', href: '/tools/luminous-flux-converter', description: 'Convert luminous flux units', category: 'converters', icon: Calculator },
        { name: 'Luminous Intensity Converter', href: '/tools/luminous-intensity-converter', description: 'Convert luminous intensity units', category: 'converters', icon: Calculator },
        { name: 'Irradiance Converter', href: '/tools/irradiance-converter', description: 'Convert irradiance units', category: 'converters', icon: Calculator },
        { name: 'Radiance Converter', href: '/tools/radiance-converter', description: 'Convert radiance units', category: 'converters', icon: Calculator },
        { name: 'Radiant Flux Converter', href: '/tools/radiant-flux-converter', description: 'Convert radiant flux units', category: 'converters', icon: Calculator },
        { name: 'Radiant Intensity Converter', href: '/tools/radiant-intensity-converter', description: 'Convert radiant intensity units', category: 'converters', icon: Calculator },
        { name: 'Radiosity Converter', href: '/tools/radiosity-converter', description: 'Convert radiosity units', category: 'converters', icon: Calculator },
        { name: 'Solid Angle Converter', href: '/tools/solid-angle-converter', description: 'Convert solid angle units', category: 'converters', icon: Calculator },
        { name: 'Frequency Converter', href: '/tools/frequency-converter', description: 'Convert frequency units', category: 'converters', icon: Calculator },
        { name: 'Wavenumber Converter', href: '/tools/wavenumber-converter', description: 'Convert wavenumber units', category: 'converters', icon: Calculator },
        { name: 'Wavelength Converter', href: '/tools/wavelength-converter', description: 'Convert wavelength units', category: 'converters', icon: Calculator },
        { name: 'Energy Density Converter', href: '/tools/energy-density-converter', description: 'Convert energy density units', category: 'converters', icon: Calculator },
        { name: 'Surface Tension Converter', href: '/tools/surface-tension-converter', description: 'Convert surface tension units', category: 'converters', icon: Calculator },
        { name: 'Thermal Conductivity Converter', href: '/tools/thermal-conductivity-converter', description: 'Convert thermal conductivity units', category: 'converters', icon: Calculator },
        { name: 'Specific Heat Capacity Converter', href: '/tools/specific-heat-capacity-converter', description: 'Convert specific heat capacity units', category: 'converters', icon: Calculator },
        { name: 'Entropy Converter', href: '/tools/entropy-converter', description: 'Convert entropy units', category: 'converters', icon: Calculator },
        { name: 'Enthalpy Converter', href: '/tools/enthalpy-converter', description: 'Convert enthalpy units', category: 'converters', icon: Calculator },
        { name: 'Gibbs Free Energy Converter', href: '/tools/gibbs-free-energy-converter', description: 'Convert Gibbs free energy units', category: 'converters', icon: Calculator },
        { name: 'Helmholtz Free Energy Converter', href: '/tools/helmholtz-free-energy-converter', description: 'Convert Helmholtz free energy units', category: 'converters', icon: Calculator },
        { name: 'Internal Energy Converter', href: '/tools/internal-energy-converter', description: 'Convert internal energy units', category: 'converters', icon: Calculator },
        { name: 'Heat Capacity Converter', href: '/tools/heat-capacity-converter', description: 'Convert heat capacity units', category: 'converters', icon: Calculator },
        { name: 'Specific Energy Converter', href: '/tools/specific-energy-converter', description: 'Convert specific energy units', category: 'converters', icon: Calculator },
        { name: 'Energy Mass Converter', href: '/tools/energy-mass-converter', description: 'Convert energy mass units', category: 'converters', icon: Calculator },
        { name: 'Action Converter', href: '/tools/action-converter', description: 'Convert action units', category: 'converters', icon: Calculator },
        { name: 'Angular Momentum Converter', href: '/tools/angular-momentum-converter', description: 'Convert angular momentum units', category: 'converters', icon: Calculator },
        { name: 'Moment of Inertia Converter', href: '/tools/moment-of-inertia-converter', description: 'Convert moment of inertia units', category: 'converters', icon: Calculator },
        { name: 'Angular Velocity Converter', href: '/tools/angular-velocity-converter', description: 'Convert angular velocity units', category: 'converters', icon: Calculator },
        { name: 'Angular Acceleration Converter', href: '/tools/angular-acceleration-converter', description: 'Convert angular acceleration units', category: 'converters', icon: Calculator },
        { name: 'Angular Frequency Converter', href: '/tools/angular-frequency-converter', description: 'Convert angular frequency units', category: 'converters', icon: Calculator },
        { name: 'Rotational Kinetic Energy Converter', href: '/tools/rotational-kinetic-energy-converter', description: 'Convert rotational kinetic energy units', category: 'converters', icon: Calculator },
        { name: 'Rotational Power Converter', href: '/tools/rotational-power-converter', description: 'Convert rotational power units', category: 'converters', icon: Calculator },
        { name: 'Torque Converter', href: '/tools/torque-converter', description: 'Convert torque units', category: 'converters', icon: Calculator },
        { name: 'Moment of Force Converter', href: '/tools/moment-of-force-converter', description: 'Convert moment of force units', category: 'converters', icon: Calculator },
        { name: 'Couple Converter', href: '/tools/couple-converter', description: 'Convert couple units', category: 'converters', icon: Calculator },
        { name: 'Pressure Converter', href: '/tools/pressure-converter', description: 'Convert pressure units', category: 'converters', icon: Calculator },
        { name: 'Stress Converter', href: '/tools/stress-converter', description: 'Convert stress units', category: 'converters', icon: Calculator },
        { name: 'Strain Converter', href: '/tools/strain-converter', description: 'Convert strain units', category: 'converters', icon: Calculator },
        { name: 'Young\'s Modulus Converter', href: '/tools/youngs-modulus-converter', description: 'Convert Young\'s modulus units', category: 'converters', icon: Calculator },
        { name: 'Shear Modulus Converter', href: '/tools/shear-modulus-converter', description: 'Convert shear modulus units', category: 'converters', icon: Calculator },
        { name: 'Bulk Modulus Converter', href: '/tools/bulk-modulus-converter', description: 'Convert bulk modulus units', category: 'converters', icon: Calculator },
        { name: 'Poisson\'s Ratio Converter', href: '/tools/poissons-ratio-converter', description: 'Convert Poisson\'s ratio units', category: 'converters', icon: Calculator },
        { name: 'Elastic Modulus Converter', href: '/tools/elastic-modulus-converter', description: 'Convert elastic modulus units', category: 'converters', icon: Calculator },
        { name: 'Rigidity Modulus Converter', href: '/tools/rigidity-modulus-converter', description: 'Convert rigidity modulus units', category: 'converters', icon: Calculator },
        { name: 'Shear Strength Converter', href: '/tools/shear-strength-converter', description: 'Convert shear strength units', category: 'converters', icon: Calculator },
        { name: 'Tensile Strength Converter', href: '/tools/tensile-strength-converter', description: 'Convert tensile strength units', category: 'converters', icon: Calculator },
        { name: 'Compressive Strength Converter', href: '/tools/compressive-strength-converter', description: 'Convert compressive strength units', category: 'converters', icon: Calculator },
        { name: 'Yield Strength Converter', href: '/tools/yield-strength-converter', description: 'Convert yield strength units', category: 'converters', icon: Calculator },
        { name: 'Ultimate Strength Converter', href: '/tools/ultimate-strength-converter', description: 'Convert ultimate strength units', category: 'converters', icon: Calculator },
        { name: 'Fatigue Strength Converter', href: '/tools/fatigue-strength-converter', description: 'Convert fatigue strength units', category: 'converters', icon: Calculator },
        { name: 'Fracture Toughness Converter', href: '/tools/fracture-toughness-converter', description: 'Convert fracture toughness units', category: 'converters', icon: Calculator },
        { name: 'Hardness Converter', href: '/tools/hardness-converter', description: 'Convert hardness units', category: 'converters', icon: Calculator },
        { name: 'Impact Strength Converter', href: '/tools/impact-strength-converter', description: 'Convert impact strength units', category: 'converters', icon: Calculator },
        { name: 'Creep Strength Converter', href: '/tools/creep-strength-converter', description: 'Convert creep strength units', category: 'converters', icon: Calculator },
        { name: 'Stress Rupture Strength Converter', href: '/tools/stress-rupture-strength-converter', description: 'Convert stress rupture strength units', category: 'converters', icon: Calculator },
        { name: 'Creep Rupture Strength Converter', href: '/tools/creep-rupture-strength-converter', description: 'Convert creep rupture strength units', category: 'converters', icon: Calculator },
        { name: 'Stress Corrosion Cracking Strength Converter', href: '/tools/stress-corrosion-cracking-strength-converter', description: 'Convert stress corrosion cracking strength units', category: 'converters', icon: Calculator },
        { name: 'Corrosion Fatigue Strength Converter', href: '/tools/corrosion-fatigue-strength-converter', description: 'Convert corrosion fatigue strength units', category: 'converters', icon: Calculator },
        { name: 'Fretting Fatigue Strength Converter', href: '/tools/fretting-fatigue-strength-converter', description: 'Convert fretting fatigue strength units', category: 'converters', icon: Calculator },
        { name: 'Thermal Fatigue Strength Converter', href: '/tools/thermal-fatigue-strength-converter', description: 'Convert thermal fatigue strength units', category: 'converters', icon: Calculator },
        { name: 'High Cycle Fatigue Strength Converter', href: '/tools/high-cycle-fatigue-strength-converter', description: 'Convert high cycle fatigue strength units', category: 'converters', icon: Calculator },
        { name: 'Low Cycle Fatigue Strength Converter', href: '/tools/low-cycle-fatigue-strength-converter', description: 'Convert low cycle fatigue strength units', category: 'converters', icon: Calculator },
        { name: 'Fatigue Limit Converter', href: '/tools/fatigue-limit-converter', description: 'Convert fatigue limit units', category: 'converters', icon: Calculator },
        { name: 'Fatigue Strength Converter', href: '/tools/fatigue-strength-converter', description: 'Convert fatigue strength units', category: 'converters', icon: Calculator },
        { name: 'Fatigue Life Converter', href: '/tools/fatigue-life-converter', description: 'Convert fatigue life units', category: 'converters', icon: Calculator },
        { name: 'Fatigue Crack Growth Rate Converter', href: '/tools/fatigue-crack-growth-rate-converter', description: 'Convert fatigue crack growth rate units', category: 'converters', icon: Calculator },
        { name: 'Fatigue Threshold Converter', href: '/tools/fatigue-threshold-converter', description: 'Convert fatigue threshold units', category: 'converters', icon: Calculator },
        { name: 'Fatigue Exponent Converter', href: '/tools/fatigue-exponent-converter', description: 'Convert fatigue exponent units', category: 'converters', icon: Calculator },
        { name: 'Fatigue Strength Coefficient Converter', href: '/tools/fatigue-strength-coefficient-converter', description: 'Convert fatigue strength coefficient units', category: 'converters', icon: Calculator },
        { name: 'Fatigue Ductility Coefficient Converter', href: '/tools/fatigue-ductility-coefficient-converter', description: 'Convert fatigue ductility coefficient units', category: 'converters', icon: Calculator },
        { name: 'Fatigue Ductility Exponent Converter', href: '/tools/fatigue-ductility-exponent-converter', description: 'Convert fatigue ductility exponent units', category: 'converters', icon: Calculator },
        { name: 'Fatigue Strength Exponent Converter', href: '/tools/fatigue-strength-exponent-converter', description: 'Convert fatigue strength exponent units', category: 'converters', icon: Calculator },
        { name: 'Fatigue Life Exponent Converter', href: '/tools/fatigue-life-exponent-converter', description: 'Convert fatigue life exponent units', category: 'converters', icon: Calculator },
      ]

      console.log('Tools initialized:', allTools.length)
      setTools(allTools)
      setFilteredTools(allTools)
      setIsLoading(false)

      // Calculate and update category counts
      const updatedCategories = categories.map(cat => ({
        ...cat,
        count: cat.id === 'all' ? allTools.length : allTools.filter(tool => tool.category === cat.id).length
      }))
      
      setCategories(updatedCategories)
      console.log('Categories updated:', updatedCategories)
    } catch (error) {
      console.error('Error initializing tools:', error)
      setIsLoading(false)
    }
  }, [])

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
    // Analytics tracking would go here
    console.log(`Tool clicked: ${href}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/5 py-20">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/dashboard" className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
                <BarChart3 className="h-5 w-5" />
                <span className="font-medium">View Dashboard</span>
              </Link>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              {tools.length}+ Free Online Tools
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              The Ultimate Multi-Tool Platform
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover powerful tools for SEO, development, design, and productivity. All tools are free, fast, and secure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Search for tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 text-base"
                />
              </div>
              <Button size="lg" className="px-8 py-3 text-base">
                Explore Tools
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16"
          >
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">{filteredTools.length}+</div>
              <div className="text-muted-foreground">Tools Available</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">50K+</div>
              <div className="text-muted-foreground">Daily Users</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">4.9/5</div>
              <div className="text-muted-foreground">User Rating</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Featured Tools</h2>
            <p className="text-muted-foreground text-lg">
              Handpicked tools to boost your productivity and workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTools.map((tool, index) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => handleToolClick(tool.href)}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <tool.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex gap-1">
                        {tool.featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                        {tool.popular && <Badge variant="default" className="text-xs">Popular</Badge>}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {tool.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Browse by Category</h2>
            <p className="text-muted-foreground text-lg">
              Find the perfect tool for your needs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => setSelectedCategory(category.id)}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-primary/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <category.icon className="h-8 w-8 text-primary" />
                      <Badge variant="outline">{category.count}</Badge>
                    </div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    {category.description && (
                      <CardDescription className="text-xs">
                        {category.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tools */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Popular Tools</h2>
            <p className="text-muted-foreground text-lg">
              Most used tools by our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularTools.map((tool, index) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => handleToolClick(tool.href)}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-primary/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <tool.icon className="h-6 w-6 text-primary" />
                      {tool.popular && <Badge variant="default" className="text-xs">Popular</Badge>}
                    </div>
                    <CardTitle className="text-base leading-tight">{tool.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs line-clamp-2">
                      {tool.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Tools Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">All Tools</h2>
              <p className="text-muted-foreground">
                {filteredTools.length} tools found
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All Tools
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTools.map((tool, index) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                className="group cursor-pointer"
                onClick={() => handleToolClick(tool.href)}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-primary/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <tool.icon className="h-5 w-5 text-primary" />
                      <div className="flex gap-1">
                        {tool.featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                        {tool.popular && <Badge variant="default" className="text-xs">Popular</Badge>}
                      </div>
                    </div>
                    <CardTitle className="text-base leading-tight">{tool.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs line-clamp-2">
                      {tool.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Boost Your Productivity?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of professionals who use our tools to streamline their workflow and achieve better results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-3 text-base">
                Get Started Free
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3 text-base">
                View Documentation
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Enhanced Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowSearch(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
            >
              <div className="w-full max-w-2xl">
                <div className="bg-background border border-border rounded-lg shadow-xl">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search Tools
                        <Badge variant="secondary" className="text-xs">
                          Press Ctrl+K
                        </Badge>
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSearch(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <LazyEnhancedToolsSearch />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Helper component for grid icon
function GridIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}