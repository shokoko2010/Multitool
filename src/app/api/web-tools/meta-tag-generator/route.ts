import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface MetaTagData {
  // Basic meta tags
  title: string;
  description: string;
  keywords: string;
  author: string;
  language: string;
  charset: string;
  viewport: string;
  
  // Open Graph tags
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: string;
  ogSiteName: string;
  
  // Twitter Card tags
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterCreator: string;
  twitterSite: string;
  
  // Additional SEO tags
  robots: string;
  googlebot: string;
  bingbot: string;
  canonical: string;
  alternate: string;
  
  // Technical tags
  themeColor: string;
  msapplicationTileColor: string;
  msapplicationTileImage: string;
  appleMobileWebAppCapable: string;
  appleMobileWebAppStatusBarStyle: string;
  appleTouchIcon: string;
  favicon: string;
  
  // Verification tags
  googleSiteVerification: string;
  bingSiteVerification: string;
  yandexVerification: string;
  
  // Additional tags
  customTags: Array<{ name: string; content: string; property?: string }>;
}

interface GenerationOptions {
  includeBasic: boolean;
  includeOpenGraph: boolean;
  includeTwitter: boolean;
  includeSEO: boolean;
  includeTechnical: boolean;
  includeVerification: boolean;
  includeCustom: boolean;
  format: 'html' | 'json' | 'xml';
  indentation: number;
  sortTags: boolean;
  validateURLs: boolean;
}

interface GeneratedTags {
  html: string;
  json: MetaTagData;
  xml: string;
  stats: {
    totalTags: number;
    basicTags: number;
    openGraphTags: number;
    twitterTags: number;
    seoTags: number;
    technicalTags: number;
    verificationTags: number;
    customTags: number;
  };
}

interface GenerationResult {
  success: boolean;
  generatedTags: GeneratedTags;
  options: GenerationOptions;
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  recommendations: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, options = {} } = body;

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Meta tag data is required' },
        { status: 400 }
      );
    }

    // Default options
    const defaultOptions: GenerationOptions = {
      includeBasic: true,
      includeOpenGraph: true,
      includeTwitter: true,
      includeSEO: true,
      includeTechnical: true,
      includeVerification: false,
      includeCustom: true,
      format: 'html',
      indentation: 2,
      sortTags: true,
      validateURLs: true,
    };

    const finalOptions: GenerationOptions = { ...defaultOptions, ...options };

    // Validate data
    const validation = validateMetaTagData(data, finalOptions);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid meta tag data', details: validation.errors },
        { status: 400 }
      );
    }

    // Generate meta tags
    const generatedTags = generateMetaTags(data, finalOptions);
    
    // Generate recommendations
    const recommendations = generateRecommendations(data, generatedTags.stats);

    const result: GenerationResult = {
      success: true,
      generatedTags,
      options: finalOptions,
      validation,
      recommendations,
    };

    // Try to get AI insights
    let aiInsights = '';
    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an SEO and meta tag expert. Provide insights about meta tag optimization and best practices.'
          },
          {
            role: 'user',
            content: `Analyze this meta tag generation:
            - Total tags: ${generatedTags.stats.totalTags}
            - Title length: ${data.title?.length || 0} characters
            - Description length: ${data.description?.length || 0} characters
            - Includes Open Graph: ${finalOptions.includeOpenGraph}
            - Includes Twitter Card: ${finalOptions.includeTwitter}
            
            Provide insights about:
            1. SEO effectiveness of these meta tags
            2. Social media sharing optimization
            3. Recommendations for improvement
            Keep it concise and informative.`
          }
        ],
        max_tokens: 250,
        temperature: 0.3,
      });

      aiInsights = completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI analysis failed:', error);
      aiInsights = 'AI analysis unavailable';
    }

    return NextResponse.json({
      result,
      aiInsights,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Meta tag generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during meta tag generation' },
      { status: 500 }
    );
  }
}

function validateMetaTagData(data: MetaTagData, options: GenerationOptions) {
  const errors: string[] = [];
  const warnings: string[] = [];
  let isValid = true;

  // Required fields
  if (!data.title || data.title.trim() === '') {
    errors.push('Title is required');
    isValid = false;
  }

  if (!data.description || data.description.trim() === '') {
    errors.push('Description is required');
    isValid = false;
  }

  // Length validations
  if (data.title && data.title.length > 60) {
    warnings.push('Title is longer than recommended 60 characters');
  }

  if (data.description && data.description.length > 160) {
    warnings.push('Description is longer than recommended 160 characters');
  }

  if (data.keywords && data.keywords.length > 255) {
    warnings.push('Keywords are longer than recommended 255 characters');
  }

  // URL validations
  if (options.validateURLs) {
    if (data.ogImage && !isValidURL(data.ogImage)) {
      warnings.push('Open Graph image URL appears invalid');
    }

    if (data.twitterImage && !isValidURL(data.twitterImage)) {
      warnings.push('Twitter image URL appears invalid');
    }

    if (data.canonical && !isValidURL(data.canonical)) {
      warnings.push('Canonical URL appears invalid');
    }
  }

  // Image validations
  if (data.ogImage && !data.ogImage.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    warnings.push('Open Graph image should be in JPG, PNG, GIF, or WebP format');
  }

  return {
    isValid,
    errors,
    warnings,
  };
}

function generateMetaTags(data: MetaTagData, options: GenerationOptions): GeneratedTags {
  const tags: string[] = [];
  const stats = {
    totalTags: 0,
    basicTags: 0,
    openGraphTags: 0,
    twitterTags: 0,
    seoTags: 0,
    technicalTags: 0,
    verificationTags: 0,
    customTags: 0,
  };

  // Basic meta tags
  if (options.includeBasic) {
    if (data.charset) {
      tags.push(`<meta charset="${data.charset}">`);
      stats.basicTags++;
    }
    
    if (data.viewport) {
      tags.push(`<meta name="viewport" content="${data.viewport}">`);
      stats.basicTags++;
    }
    
    if (data.title) {
      tags.push(`<title>${escapeHtml(data.title)}</title>`);
      stats.basicTags++;
    }
    
    if (data.description) {
      tags.push(`<meta name="description" content="${escapeHtml(data.description)}">`);
      stats.basicTags++;
    }
    
    if (data.keywords) {
      tags.push(`<meta name="keywords" content="${escapeHtml(data.keywords)}">`);
      stats.basicTags++;
    }
    
    if (data.author) {
      tags.push(`<meta name="author" content="${escapeHtml(data.author)}">`);
      stats.basicTags++;
    }
    
    if (data.language) {
      tags.push(`<meta name="language" content="${escapeHtml(data.language)}">`);
      stats.basicTags++;
    }
  }

  // Open Graph tags
  if (options.includeOpenGraph) {
    if (data.ogTitle || data.title) {
      tags.push(`<meta property="og:title" content="${escapeHtml(data.ogTitle || data.title)}">`);
      stats.openGraphTags++;
    }
    
    if (data.ogDescription || data.description) {
      tags.push(`<meta property="og:description" content="${escapeHtml(data.ogDescription || data.description)}">`);
      stats.openGraphTags++;
    }
    
    if (data.ogImage) {
      tags.push(`<meta property="og:image" content="${escapeHtml(data.ogImage)}">`);
      stats.openGraphTags++;
    }
    
    if (data.ogUrl) {
      tags.push(`<meta property="og:url" content="${escapeHtml(data.ogUrl)}">`);
      stats.openGraphTags++;
    }
    
    if (data.ogType) {
      tags.push(`<meta property="og:type" content="${escapeHtml(data.ogType)}">`);
      stats.openGraphTags++;
    }
    
    if (data.ogSiteName) {
      tags.push(`<meta property="og:site_name" content="${escapeHtml(data.ogSiteName)}">`);
      stats.openGraphTags++;
    }
  }

  // Twitter Card tags
  if (options.includeTwitter) {
    if (data.twitterCard) {
      tags.push(`<meta name="twitter:card" content="${escapeHtml(data.twitterCard)}">`);
      stats.twitterTags++;
    }
    
    if (data.twitterTitle || data.title) {
      tags.push(`<meta name="twitter:title" content="${escapeHtml(data.twitterTitle || data.title)}">`);
      stats.twitterTags++;
    }
    
    if (data.twitterDescription || data.description) {
      tags.push(`<meta name="twitter:description" content="${escapeHtml(data.twitterDescription || data.description)}">`);
      stats.twitterTags++;
    }
    
    if (data.twitterImage || data.ogImage) {
      tags.push(`<meta name="twitter:image" content="${escapeHtml(data.twitterImage || data.ogImage)}">`);
      stats.twitterTags++;
    }
    
    if (data.twitterCreator) {
      tags.push(`<meta name="twitter:creator" content="${escapeHtml(data.twitterCreator)}">`);
      stats.twitterTags++;
    }
    
    if (data.twitterSite) {
      tags.push(`<meta name="twitter:site" content="${escapeHtml(data.twitterSite)}">`);
      stats.twitterTags++;
    }
  }

  // SEO tags
  if (options.includeSEO) {
    if (data.robots) {
      tags.push(`<meta name="robots" content="${escapeHtml(data.robots)}">`);
      stats.seoTags++;
    }
    
    if (data.googlebot) {
      tags.push(`<meta name="googlebot" content="${escapeHtml(data.googlebot)}">`);
      stats.seoTags++;
    }
    
    if (data.bingbot) {
      tags.push(`<meta name="bingbot" content="${escapeHtml(data.bingbot)}">`);
      stats.seoTags++;
    }
    
    if (data.canonical) {
      tags.push(`<link rel="canonical" href="${escapeHtml(data.canonical)}">`);
      stats.seoTags++;
    }
    
    if (data.alternate) {
      tags.push(`<link rel="alternate" href="${escapeHtml(data.alternate)}">`);
      stats.seoTags++;
    }
  }

  // Technical tags
  if (options.includeTechnical) {
    if (data.themeColor) {
      tags.push(`<meta name="theme-color" content="${escapeHtml(data.themeColor)}">`);
      stats.technicalTags++;
    }
    
    if (data.msapplicationTileColor) {
      tags.push(`<meta name="msapplication-TileColor" content="${escapeHtml(data.msapplicationTileColor)}">`);
      stats.technicalTags++;
    }
    
    if (data.msapplicationTileImage) {
      tags.push(`<meta name="msapplication-TileImage" content="${escapeHtml(data.msapplicationTileImage)}">`);
      stats.technicalTags++;
    }
    
    if (data.appleMobileWebAppCapable) {
      tags.push(`<meta name="apple-mobile-web-app-capable" content="${escapeHtml(data.appleMobileWebAppCapable)}">`);
      stats.technicalTags++;
    }
    
    if (data.appleMobileWebAppStatusBarStyle) {
      tags.push(`<meta name="apple-mobile-web-app-status-bar-style" content="${escapeHtml(data.appleMobileWebAppStatusBarStyle)}">`);
      stats.technicalTags++;
    }
    
    if (data.appleTouchIcon) {
      tags.push(`<link rel="apple-touch-icon" href="${escapeHtml(data.appleTouchIcon)}">`);
      stats.technicalTags++;
    }
    
    if (data.favicon) {
      tags.push(`<link rel="icon" href="${escapeHtml(data.favicon)}">`);
      stats.technicalTags++;
    }
  }

  // Verification tags
  if (options.includeVerification) {
    if (data.googleSiteVerification) {
      tags.push(`<meta name="google-site-verification" content="${escapeHtml(data.googleSiteVerification)}">`);
      stats.verificationTags++;
    }
    
    if (data.bingSiteVerification) {
      tags.push(`<meta name="msvalidate.01" content="${escapeHtml(data.bingSiteVerification)}">`);
      stats.verificationTags++;
    }
    
    if (data.yandexVerification) {
      tags.push(`<meta name="yandex-verification" content="${escapeHtml(data.yandexVerification)}">`);
      stats.verificationTags++;
    }
  }

  // Custom tags
  if (options.includeCustom && data.customTags) {
    for (const tag of data.customTags) {
      if (tag.property) {
        tags.push(`<meta property="${escapeHtml(tag.property)}" content="${escapeHtml(tag.content)}">`);
      } else {
        tags.push(`<meta name="${escapeHtml(tag.name)}" content="${escapeHtml(tag.content)}">`);
      }
      stats.customTags++;
    }
  }

  // Sort tags if requested
  if (options.sortTags) {
    tags.sort();
  }

  // Calculate total tags
  stats.totalTags = tags.length;

  // Generate HTML output
  const indent = ' '.repeat(options.indentation);
  const html = tags.map(tag => indent + tag).join('\n');

  // Generate JSON output
  const json = { ...data };

  // Generate XML output
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<metadata>
${tags.map(tag => indent + '<tag>' + escapeHtml(tag) + '</tag>').join('\n')}
</metadata>`;

  return {
    html,
    json,
    xml,
    stats,
  };
}

function generateRecommendations(data: MetaTagData, stats: any): string[] {
  const recommendations: string[] = [];

  // Title recommendations
  if (!data.title) {
    recommendations.push('Add a title tag for better SEO');
  } else if (data.title.length < 30) {
    recommendations.push('Consider making the title more descriptive (30-60 characters)');
  } else if (data.title.length > 60) {
    recommendations.push('Consider shortening the title to under 60 characters');
  }

  // Description recommendations
  if (!data.description) {
    recommendations.push('Add a meta description for better SEO');
  } else if (data.description.length < 120) {
    recommendations.push('Consider making the description more detailed (120-160 characters)');
  } else if (data.description.length > 160) {
    recommendations.push('Consider shortening the description to under 160 characters');
  }

  // Open Graph recommendations
  if (!data.ogImage && stats.openGraphTags > 0) {
    recommendations.push('Add an Open Graph image for better social media sharing');
  }

  // Twitter Card recommendations
  if (!data.twitterCard && stats.twitterTags > 0) {
    recommendations.push('Add a Twitter Card type for better Twitter sharing');
  }

  // Image recommendations
  if (data.ogImage && !data.ogImage.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    recommendations.push('Use a standard image format (JPG, PNG, GIF, WebP) for Open Graph images');
  }

  // Technical recommendations
  if (!data.canonical) {
    recommendations.push('Add a canonical URL to prevent duplicate content issues');
  }

  if (!data.viewport) {
    recommendations.push('Add a viewport meta tag for better mobile responsiveness');
  }

  return recommendations;
}

function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}