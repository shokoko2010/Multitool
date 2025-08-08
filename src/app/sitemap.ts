import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://yourdomain.com'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ]

  // Actual tool pages based on existing files
  const toolPages = [
    // Network Tools
    { url: `${baseUrl}/tools/dns-lookup`, category: 'network', priority: 0.7 },
    { url: `${baseUrl}/tools/ip-lookup`, category: 'network', priority: 0.7 },
    { url: `${baseUrl}/tools/ssl-lookup`, category: 'network', priority: 0.7 },
    { url: `${baseUrl}/tools/whois`, category: 'network', priority: 0.7 },
    { url: `${baseUrl}/tools/ping`, category: 'network', priority: 0.7 },
    { url: `${baseUrl}/tools/port-scanner`, category: 'network', priority: 0.7 },
    { url: `${baseUrl}/tools/http-headers`, category: 'network', priority: 0.7 },
    { url: `${baseUrl}/tools/http-request`, category: 'network', priority: 0.7 },

    // Security Tools
    { url: `${baseUrl}/tools/safe-url`, category: 'security', priority: 0.7 },
    { url: `${baseUrl}/tools/password-strength`, category: 'security', priority: 0.7 },
    { url: `${baseUrl}/tools/meta-tags`, category: 'security', priority: 0.7 },
    { url: `${baseUrl}/tools/md5-generator`, category: 'security', priority: 0.7 },
    { url: `${baseUrl}/tools/sha256-generator`, category: 'security', priority: 0.7 },
    { url: `${baseUrl}/tools/password-generator`, category: 'security', priority: 0.7 },
    { url: `${baseUrl}/tools/hash-checker`, category: 'security', priority: 0.7 },
    { url: `${baseUrl}/tools/token-generator`, category: 'security', priority: 0.7 },

    // Text Utilities
    { url: `${baseUrl}/tools/text-to-speech`, category: 'text', priority: 0.6 },
    { url: `${baseUrl}/tools/case-converter`, category: 'text', priority: 0.6 },
    { url: `${baseUrl}/tools/character-counter`, category: 'text', priority: 0.6 },
    { url: `${baseUrl}/tools/email-extractor`, category: 'text', priority: 0.6 },
    { url: `${baseUrl}/tools/reverse-words`, category: 'text', priority: 0.6 },
    { url: `${baseUrl}/tools/url-encoder`, category: 'text', priority: 0.6 },
    { url: `${baseUrl}/tools/base64-encoder`, category: 'text', priority: 0.6 },
    { url: `${baseUrl}/tools/text-difference`, category: 'text', priority: 0.6 },
    { url: `${baseUrl}/tools/word-counter`, category: 'text', priority: 0.6 },

    // Image Tools
    { url: `${baseUrl}/tools/image-converter`, category: 'image', priority: 0.6 },
    { url: `${baseUrl}/tools/youtube-thumbnail`, category: 'image', priority: 0.6 },
    { url: `${baseUrl}/tools/qr-code-reader`, category: 'image', priority: 0.6 },
    { url: `${baseUrl}/tools/color-picker`, category: 'image', priority: 0.6 },
    { url: `${baseUrl}/tools/exif-reader`, category: 'image', priority: 0.6 },
    { url: `${baseUrl}/tools/image-resizer`, category: 'image', priority: 0.6 },
    { url: `${baseUrl}/tools/image-compressor`, category: 'image', priority: 0.6 },

    // SEO Tools
    { url: `${baseUrl}/tools/seo-analyzer`, category: 'seo', priority: 0.8 },
    { url: `${baseUrl}/tools/keyword-density`, category: 'seo', priority: 0.8 },
    { url: `${baseUrl}/tools/meta-tag-generator`, category: 'seo', priority: 0.8 },
    { url: `${baseUrl}/tools/serp-checker`, category: 'seo', priority: 0.8 },
    { url: `${baseUrl}/tools/backlink-checker`, category: 'seo', priority: 0.8 },
    { url: `${baseUrl}/tools/plagiarism-checker`, category: 'seo', priority: 0.8 },
    { url: `${baseUrl}/tools/readability-score`, category: 'seo', priority: 0.8 },

    // AI Tools
    { url: `${baseUrl}/tools/ai-content-generator`, category: 'ai', priority: 0.8 },
    { url: `${baseUrl}/tools/ai-seo-title`, category: 'ai', priority: 0.8 },
    { url: `${baseUrl}/tools/ai-seo-description`, category: 'ai', priority: 0.8 },
    { url: `${baseUrl}/tools/ai-keyword-cluster`, category: 'ai', priority: 0.8 },
    { url: `${baseUrl}/tools/text-summarizer`, category: 'ai', priority: 0.7 },
    { url: `${baseUrl}/tools/sentiment-analyzer`, category: 'ai', priority: 0.7 },

    // Development Tools
    { url: `${baseUrl}/tools/json-formatter`, category: 'development', priority: 0.7 },
    { url: `${baseUrl}/tools/xml-formatter`, category: 'development', priority: 0.7 },
    { url: `${baseUrl}/tools/html-formatter`, category: 'development', priority: 0.7 },
    { url: `${baseUrl}/tools/sql-formatter`, category: 'development', priority: 0.7 },
    { url: `${baseUrl}/tools/regex-tester`, category: 'development', priority: 0.7 },
    { url: `${baseUrl}/tools/javascript-formatter`, category: 'development', priority: 0.7 },
    { url: `${baseUrl}/tools/css-formatter`, category: 'development', priority: 0.7 },
    { url: `${baseUrl}/tools/ai-code-reviewer`, category: 'development', priority: 0.8 },

    // Converters
    { url: `${baseUrl}/tools/temperature-converter`, category: 'converters', priority: 0.6 },
    { url: `${baseUrl}/tools/distance-converter`, category: 'converters', priority: 0.6 },
    { url: `${baseUrl}/tools/weight-converter`, category: 'converters', priority: 0.6 },
    { url: `${baseUrl}/tools/timestamp-converter`, category: 'converters', priority: 0.6 },
    { url: `${baseUrl}/tools/data-size-converter`, category: 'converters', priority: 0.6 },

    // Cryptography
    { url: `${baseUrl}/tools/bcrypt-generator`, category: 'cryptography', priority: 0.7 },
    { url: `${baseUrl}/tools/uuid-generator`, category: 'cryptography', priority: 0.7 },
    { url: `${baseUrl}/tools/token-generator`, category: 'cryptography', priority: 0.7 },

    // Data Analysis
    { url: `${baseUrl}/tools/data-visualization`, category: 'data', priority: 0.7 },
  ].map(tool => ({
    url: tool.url,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: tool.priority,
  }))

  // Generate category pages
  const categoryPages = [
    'network',
    'security', 
    'text',
    'image',
    'seo',
    'ai',
    'development',
    'converters',
    'cryptography',
    'data',
  ].map(category => ({
    url: `${baseUrl}/categories/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...toolPages, ...categoryPages]
}