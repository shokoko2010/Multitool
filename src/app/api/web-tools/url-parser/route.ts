import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface URLComponents {
  href: string;
  protocol: string;
  username: string;
  password: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
  domain: string;
  subdomain: string;
  tld: string;
  isValid: boolean;
  isRelative: boolean;
  hasAuth: boolean;
  hasQuery: boolean;
  hasFragment: boolean;
}

interface ParsedQuery {
  [key: string]: string | string[];
}

interface ParseOptions {
  parseQuery: boolean;
  decodeComponents: boolean;
  validateURL: boolean;
  extractDomainInfo: boolean;
  normalizeURL: boolean;
}

interface ParseResult {
  success: boolean;
  originalURL: string;
  components: URLComponents;
  queryParameters?: ParsedQuery;
  normalizedURL?: string;
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  options: ParseOptions;
  securityInfo: {
    isSecure: boolean;
    hasCredentials: boolean;
    hasSuspiciousParams: boolean;
    suspiciousParams: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, options = {} } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required and must be a string' },
        { status: 400 }
      );
    }

    if (url.length > 2048) {
      return NextResponse.json(
        { error: 'URL length exceeds 2048 characters' },
        { status: 400 }
      );
    }

    // Default options
    const defaultOptions: ParseOptions = {
      parseQuery: true,
      decodeComponents: true,
      validateURL: true,
      extractDomainInfo: true,
      normalizeURL: false,
    };

    const finalOptions: ParseOptions = { ...defaultOptions, ...options };

    // Parse URL components
    const components = parseURLComponents(url, finalOptions);
    
    // Parse query parameters if requested
    let queryParameters: ParsedQuery | undefined;
    if (finalOptions.parseQuery && components.search) {
      queryParameters = parseQueryString(components.search, finalOptions.decodeComponents);
    }

    // Normalize URL if requested
    let normalizedURL: string | undefined;
    if (finalOptions.normalizeURL) {
      normalizedURL = normalizeURLString(url, components);
    }

    // Validate URL
    const validation = validateURLComponents(url, components);

    // Security analysis
    const securityInfo = analyzeSecurity(components, queryParameters);

    const result: ParseResult = {
      success: true,
      originalURL: url,
      components,
      queryParameters,
      normalizedURL,
      validation,
      options: finalOptions,
      securityInfo,
    };

    // Try to get AI insights
    let aiInsights = '';
    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a URL parsing and security expert. Provide insights about URL structure and security best practices.'
          },
          {
            role: 'user',
            content: `Analyze this URL parsing operation:
            - URL: ${url}
            - Protocol: ${components.protocol}
            - Domain: ${components.domain}
            - Has query: ${components.hasQuery}
            - Security issues: ${securityInfo.suspiciousParams.length}
            
            Provide insights about:
            1. URL structure and components
            2. Security considerations
            3. Best practices for URL handling
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
    console.error('URL parsing error:', error);
    return NextResponse.json(
      { error: 'Internal server error during URL parsing' },
      { status: 500 }
    );
  }
}

function parseURLComponents(url: string, options: ParseOptions): URLComponents {
  // Handle relative URLs
  const isRelative = !url.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:/);
  
  if (isRelative) {
    return {
      href: url,
      protocol: '',
      username: '',
      password: '',
      hostname: '',
      port: '',
      pathname: url,
      search: '',
      hash: '',
      origin: '',
      domain: '',
      subdomain: '',
      tld: '',
      isValid: true,
      isRelative: true,
      hasAuth: false,
      hasQuery: false,
      hasFragment: false,
    };
  }

  try {
    // Use URL constructor for parsing
    const urlObj = new URL(url);
    
    // Extract domain information
    const domainInfo = extractDomainInfo(urlObj.hostname);
    
    return {
      href: urlObj.href,
      protocol: urlObj.protocol,
      username: urlObj.username,
      password: urlObj.password,
      hostname: urlObj.hostname,
      port: urlObj.port,
      pathname: urlObj.pathname,
      search: urlObj.search,
      hash: urlObj.hash,
      origin: urlObj.origin,
      domain: domainInfo.domain,
      subdomain: domainInfo.subdomain,
      tld: domainInfo.tld,
      isValid: true,
      isRelative: false,
      hasAuth: !!(urlObj.username || urlObj.password),
      hasQuery: !!urlObj.search,
      hasFragment: !!urlObj.hash,
    };
  } catch (error) {
    // Fallback to regex parsing if URL constructor fails
    return parseURLWithRegex(url, options);
  }
}

function parseURLWithRegex(url: string, options: ParseOptions): URLComponents {
  const regex = /^([a-zA-Z][a-zA-Z0-9+.-]*):\/\/(?:([^:@]+)(?::([^@]+))?@)?([^:/?#]+)(?::(\d+))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?$/;
  const match = url.match(regex);
  
  if (!match) {
    return {
      href: url,
      protocol: '',
      username: '',
      password: '',
      hostname: '',
      port: '',
      pathname: url,
      search: '',
      hash: '',
      origin: '',
      domain: '',
      subdomain: '',
      tld: '',
      isValid: false,
      isRelative: true,
      hasAuth: false,
      hasQuery: false,
      hasFragment: false,
    };
  }

  const [, protocol, username, password, hostname, port, pathname, search, hash] = match;
  const domainInfo = extractDomainInfo(hostname);

  return {
    href: url,
    protocol: protocol + ':',
    username: username || '',
    password: password || '',
    hostname,
    port: port || '',
    pathname: pathname || '/',
    search: search ? '?' + search : '',
    hash: hash ? '#' + hash : '',
    origin: protocol + '://' + hostname + (port ? ':' + port : ''),
    domain: domainInfo.domain,
    subdomain: domainInfo.subdomain,
    tld: domainInfo.tld,
    isValid: true,
    isRelative: false,
    hasAuth: !!(username || password),
    hasQuery: !!search,
    hasFragment: !!hash,
  };
}

function extractDomainInfo(hostname: string): { domain: string; subdomain: string; tld: string } {
  if (!hostname) {
    return { domain: '', subdomain: '', tld: '' };
  }

  const parts = hostname.split('.');
  
  if (parts.length < 2) {
    return { domain: hostname, subdomain: '', tld: '' };
  }

  // Handle common TLDs
  const commonTLDs = ['com', 'org', 'net', 'edu', 'gov', 'mil', 'io', 'co', 'ai', 'dev'];
  const twoPartTLDs = ['co.uk', 'com.au', 'org.uk', 'net.au', 'gov.uk', 'ac.uk'];

  let tld = '';
  let domain = '';
  let subdomain = '';

  // Check for two-part TLDs
  if (parts.length >= 3) {
    const twoPart = parts.slice(-2).join('.');
    if (twoPartTLDs.includes(twoPart)) {
      tld = twoPart;
      domain = parts[parts.length - 3];
      subdomain = parts.slice(0, parts.length - 3).join('.');
      return { domain, subdomain, tld };
    }
  }

  // Handle single-part TLDs
  tld = parts[parts.length - 1];
  domain = parts[parts.length - 2];
  subdomain = parts.slice(0, parts.length - 2).join('.');

  return { domain, subdomain, tld };
}

function parseQueryString(search: string, decode: boolean): ParsedQuery {
  const query: ParsedQuery = {};
  const queryString = search.startsWith('?') ? search.slice(1) : search;
  
  if (!queryString) {
    return query;
  }

  const pairs = queryString.split('&');
  
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (!key) continue;

    const decodedKey = decode ? decodeURIComponent(key) : key;
    const decodedValue = value ? (decode ? decodeURIComponent(value) : value) : '';

    if (decodedKey in query) {
      // Handle duplicate keys
      const existing = query[decodedKey];
      if (Array.isArray(existing)) {
        existing.push(decodedValue);
      } else {
        query[decodedKey] = [existing, decodedValue];
      }
    } else {
      query[decodedKey] = decodedValue;
    }
  }

  return query;
}

function normalizeURLString(url: string, components: URLComponents): string {
  if (components.isRelative) {
    return url;
  }

  let normalized = components.protocol + '//';
  
  // Add authority
  if (components.username) {
    normalized += components.username;
    if (components.password) {
      normalized += ':' + components.password;
    }
    normalized += '@';
  }
  
  normalized += components.hostname.toLowerCase();
  
  if (components.port) {
    normalized += ':' + components.port;
  }
  
  // Normalize path
  let path = components.pathname;
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  
  // Remove trailing slash for non-root paths
  if (path !== '/' && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  
  normalized += path;
  
  // Add query and hash if present
  if (components.search) {
    normalized += components.search;
  }
  
  if (components.hash) {
    normalized += components.hash;
  }
  
  return normalized;
}

function validateURLComponents(url: string, components: URLComponents) {
  const errors: string[] = [];
  const warnings: string[] = [];
  let isValid = true;

  if (!components.protocol && !components.isRelative) {
    errors.push('Missing protocol');
    isValid = false;
  }

  if (components.protocol && !['http:', 'https:', 'ftp:', 'ftps:', 'file:', 'mailto:', 'tel:'].includes(components.protocol)) {
    warnings.push('Uncommon protocol detected');
  }

  if (!components.hostname && !components.isRelative) {
    errors.push('Missing hostname');
    isValid = false;
  }

  if (components.username && !components.password) {
    warnings.push('Username without password');
  }

  if (components.pathname.length > 2048) {
    warnings.push('Very long path may cause issues');
  }

  return {
    isValid,
    errors,
    warnings,
  };
}

function analyzeSecurity(components: URLComponents, queryParameters?: ParsedQuery) {
  const suspiciousParams: string[] = [];
  
  // Check for HTTPS
  const isSecure = components.protocol === 'https:';
  
  // Check for credentials
  const hasCredentials = !!(components.username || components.password);
  
  // Check for suspicious query parameters
  const suspiciousKeys = ['password', 'pass', 'pwd', 'token', 'key', 'secret', 'credit', 'card', 'ssn', 'social'];
  
  if (queryParameters) {
    for (const key in queryParameters) {
      const lowerKey = key.toLowerCase();
      if (suspiciousKeys.some(suspicious => lowerKey.includes(suspicious))) {
        suspiciousParams.push(key);
      }
    }
  }

  return {
    isSecure,
    hasCredentials,
    hasSuspiciousParams: suspiciousParams.length > 0,
    suspiciousParams,
  };
}