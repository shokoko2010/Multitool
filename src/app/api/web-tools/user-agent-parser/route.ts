import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface UserAgentInfo {
  userAgent: string;
  browser: {
    name: string;
    version: string;
    major: string;
    engine: string;
    engineVersion: string;
  };
  os: {
    name: string;
    version: string;
    platform: string;
  };
  device: {
    type: 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown';
    brand?: string;
    model?: string;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isBot: boolean;
  };
  cpu: {
    architecture?: string;
  };
  features: {
    cookies: boolean;
    javascript: boolean;
    webgl: boolean;
    websockets: boolean;
    localStorage: boolean;
    sessionStorage: boolean;
    geolocation: boolean;
    notifications: boolean;
    serviceWorker: boolean;
    webWorkers: boolean;
    webAssembly: boolean;
  };
  security: {
    isPrivate: boolean;
    isProxy: boolean;
    isVPN: boolean;
    isTor: boolean;
    suspicious: boolean;
  };
}

interface ParseOptions {
  includeFeatures: boolean;
  includeSecurity: boolean;
  includeDetailedInfo: boolean;
  detectBots: boolean;
  validateUserAgent: boolean;
}

interface ParseResult {
  success: boolean;
  userAgent: string;
  info: UserAgentInfo;
  options: ParseOptions;
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
    const { userAgent, options = {} } = body;

    if (!userAgent || typeof userAgent !== 'string') {
      return NextResponse.json(
        { error: 'User-Agent string is required' },
        { status: 400 }
      );
    }

    if (userAgent.length > 500) {
      return NextResponse.json(
        { error: 'User-Agent string exceeds 500 characters' },
        { status: 400 }
      );
    }

    // Default options
    const defaultOptions: ParseOptions = {
      includeFeatures: true,
      includeSecurity: true,
      includeDetailedInfo: true,
      detectBots: true,
      validateUserAgent: true,
    };

    const finalOptions: ParseOptions = { ...defaultOptions, ...options };

    // Parse User-Agent
    const info = parseUserAgent(userAgent, finalOptions);
    
    // Validate User-Agent
    const validation = validateUserAgentString(userAgent, info);
    
    // Generate recommendations
    const recommendations = generateRecommendations(info);

    const result: ParseResult = {
      success: true,
      userAgent,
      info,
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
            content: 'You are a User-Agent parsing expert. Provide insights about browser detection and user agent analysis.'
          },
          {
            role: 'user',
            content: `Analyze this User-Agent parsing result:
            - Browser: ${info.browser.name} ${info.browser.version}
            - OS: ${info.os.name} ${info.os.version}
            - Device type: ${info.device.type}
            - Is mobile: ${info.device.isMobile}
            - Is bot: ${info.device.isBot}
            
            Provide insights about:
            1. Browser compatibility considerations
            2. Device-specific optimizations
            3. Security implications
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
    console.error('User-Agent parsing error:', error);
    return NextResponse.json(
      { error: 'Internal server error during User-Agent parsing' },
      { status: 500 }
    );
  }
}

function parseUserAgent(userAgent: string, options: ParseOptions): UserAgentInfo {
  const ua = userAgent.toLowerCase();
  
  // Initialize base info
  const info: UserAgentInfo = {
    userAgent,
    browser: {
      name: 'Unknown',
      version: 'Unknown',
      major: 'Unknown',
      engine: 'Unknown',
      engineVersion: 'Unknown',
    },
    os: {
      name: 'Unknown',
      version: 'Unknown',
      platform: 'Unknown',
    },
    device: {
      type: 'unknown',
      isMobile: false,
      isTablet: false,
      isDesktop: false,
      isBot: false,
    },
    cpu: {
      architecture: undefined,
    },
    features: {
      cookies: false,
      javascript: false,
      webgl: false,
      websockets: false,
      localStorage: false,
      sessionStorage: false,
      geolocation: false,
      notifications: false,
      serviceWorker: false,
      webWorkers: false,
      webAssembly: false,
    },
    security: {
      isPrivate: false,
      isProxy: false,
      isVPN: false,
      isTor: false,
      suspicious: false,
    },
  };

  // Detect bots
  if (options.detectBots) {
    const botPatterns = [
      /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i, /baiduspider/i,
      /yandexbot/i, /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
      /whatsapp/i, /telegram/i, /curl/i, /wget/i, /python/i, /java/i,
      /phantomjs/i, /headless/i, /selenium/i, /postman/i, /insomnia/i
    ];

    for (const pattern of botPatterns) {
      if (pattern.test(ua)) {
        info.device.isBot = true;
        info.device.type = 'bot';
        info.browser.name = 'Bot/Crawler';
        break;
      }
    }
  }

  if (!info.device.isBot) {
    // Parse browser information
    parseBrowserInfo(ua, info);
    
    // Parse OS information
    parseOSInfo(ua, info);
    
    // Parse device information
    parseDeviceInfo(ua, info);
    
    // Parse CPU information
    parseCPUInfo(ua, info);
  }

  // Detect features
  if (options.includeFeatures) {
    detectFeatures(ua, info);
  }

  // Security analysis
  if (options.includeSecurity) {
    analyzeSecurity(ua, info);
  }

  return info;
}

function parseBrowserInfo(ua: string, info: UserAgentInfo): void {
  // Chrome
  const chromeMatch = ua.match(/chrome\/(\d+(\.\d+)*)/i);
  if (chromeMatch && !ua.includes('edge') && !ua.includes('opr')) {
    info.browser.name = 'Chrome';
    info.browser.version = chromeMatch[1];
    info.browser.major = chromeMatch[1].split('.')[0];
    info.browser.engine = 'Blink';
    info.browser.engineVersion = chromeMatch[1];
    return;
  }

  // Firefox
  const firefoxMatch = ua.match(/firefox\/(\d+(\.\d+)*)/i);
  if (firefoxMatch) {
    info.browser.name = 'Firefox';
    info.browser.version = firefoxMatch[1];
    info.browser.major = firefoxMatch[1].split('.')[0];
    info.browser.engine = 'Gecko';
    info.browser.engineVersion = firefoxMatch[1];
    return;
  }

  // Safari
  const safariMatch = ua.match(/version\/(\d+(\.\d+)*) safari/i);
  if (safariMatch && ua.includes('safari') && !ua.includes('chrome')) {
    info.browser.name = 'Safari';
    info.browser.version = safariMatch[1];
    info.browser.major = safariMatch[1].split('.')[0];
    info.browser.engine = 'WebKit';
    info.browser.engineVersion = safariMatch[1];
    return;
  }

  // Edge
  const edgeMatch = ua.match(/edge\/(\d+(\.\d+)*)/i);
  if (edgeMatch) {
    info.browser.name = 'Edge';
    info.browser.version = edgeMatch[1];
    info.browser.major = edgeMatch[1].split('.')[0];
    info.browser.engine = 'EdgeHTML';
    info.browser.engineVersion = edgeMatch[1];
    return;
  }

  // Opera
  const operaMatch = ua.match(/opr\/(\d+(\.\d+)*)/i);
  if (operaMatch) {
    info.browser.name = 'Opera';
    info.browser.version = operaMatch[1];
    info.browser.major = operaMatch[1].split('.')[0];
    info.browser.engine = 'Blink';
    info.browser.engineVersion = operaMatch[1];
    return;
  }

  // Internet Explorer
  const ieMatch = ua.match(/(?:msie |trident.*rv:|)(\d+(\.\d+)*)/i);
  if (ieMatch) {
    info.browser.name = 'Internet Explorer';
    info.browser.version = ieMatch[1];
    info.browser.major = ieMatch[1].split('.')[0];
    info.browser.engine = 'Trident';
    info.browser.engineVersion = ieMatch[1];
    return;
  }
}

function parseOSInfo(ua: string, info: UserAgentInfo): void {
  // Windows
  const windowsMatch = ua.match(/windows nt (\d+(\.\d+)*)/i);
  if (windowsMatch) {
    info.os.name = 'Windows';
    info.os.version = getWindowsVersion(windowsMatch[1]);
    info.os.platform = 'Win32';
    return;
  }

  // macOS
  const macMatch = ua.match(/mac os x (\d+[._]\d+([._]\d+)?)/i);
  if (macMatch) {
    info.os.name = 'macOS';
    info.os.version = macMatch[1].replace(/_/g, '.');
    info.os.platform = 'MacIntel';
    return;
  }

  // Linux
  if (ua.includes('linux')) {
    info.os.name = 'Linux';
    info.os.version = 'Unknown';
    info.os.platform = 'Linux x86_64';
    
    // Check for specific distributions
    if (ua.includes('ubuntu')) {
      info.os.name = 'Ubuntu';
    } else if (ua.includes('debian')) {
      info.os.name = 'Debian';
    } else if (ua.includes('fedora')) {
      info.os.name = 'Fedora';
    }
    return;
  }

  // Android
  const androidMatch = ua.match(/android (\d+(\.\d+)*)/i);
  if (androidMatch) {
    info.os.name = 'Android';
    info.os.version = androidMatch[1];
    info.os.platform = 'Linux armv7l';
    return;
  }

  // iOS
  const iosMatch = ua.match(/(iphone|ipad|ipod) os (\d+_\d+)/i);
  if (iosMatch) {
    info.os.name = 'iOS';
    info.os.version = iosMatch[2].replace('_', '.');
    info.os.platform = iosMatch[1];
    return;
  }
}

function parseDeviceInfo(ua: string, info: UserAgentInfo): void {
  // Mobile devices
  const mobilePatterns = [
    /mobile/i, /iphone/i, /ipod/i, /android.*mobile/i,
    /blackberry/i, /windows phone/i, /palm/i, /symbian/i
  ];

  for (const pattern of mobilePatterns) {
    if (pattern.test(ua)) {
      info.device.isMobile = true;
      info.device.type = 'mobile';
      break;
    }
  }

  // Tablet devices
  const tabletPatterns = [
    /ipad/i, /tablet/i, /kindle/i, /silk/i, /playbook/i,
    /android(?!.*mobile)/i
  ];

  for (const pattern of tabletPatterns) {
    if (pattern.test(ua)) {
      info.device.isTablet = true;
      info.device.type = 'tablet';
      info.device.isMobile = false;
      break;
    }
  }

  // Desktop devices
  if (!info.device.isMobile && !info.device.isTablet && !info.device.isBot) {
    info.device.isDesktop = true;
    info.device.type = 'desktop';
  }

  // Device brand and model
  const brandPatterns = [
    { pattern: /iphone/i, brand: 'Apple', model: 'iPhone' },
    { pattern: /ipad/i, brand: 'Apple', model: 'iPad' },
    { pattern: /samsung/i, brand: 'Samsung' },
    { pattern: /google pixel/i, brand: 'Google', model: 'Pixel' },
    { pattern: /oneplus/i, brand: 'OnePlus' },
    { pattern: /xiaomi/i, brand: 'Xiaomi' },
    { pattern: /huawei/i, brand: 'Huawei' },
    { pattern: /lg/i, brand: 'LG' },
    { pattern: /sony/i, brand: 'Sony' },
    { pattern: /nokia/i, brand: 'Nokia' },
    { pattern: /motorola/i, brand: 'Motorola' },
    { pattern: /htc/i, brand: 'HTC' },
  ];

  for (const { pattern, brand, model } of brandPatterns) {
    if (pattern.test(ua)) {
      info.device.brand = brand;
      if (model) {
        info.device.model = model;
      }
      break;
    }
  }
}

function parseCPUInfo(ua: string, info: UserAgentInfo): void {
  const cpuPatterns = [
    { pattern: /x86_64/i, arch: 'x86_64' },
    { pattern: /x86/i, arch: 'x86' },
    { pattern: /win64/i, arch: 'x86_64' },
    { pattern: /wow64/i, arch: 'x86_64' },
    { pattern: /arm64/i, arch: 'ARM64' },
    { pattern: /arm/i, arch: 'ARM' },
    { pattern: /i686/i, arch: 'x86' },
    { pattern: /ia64/i, arch: 'IA64' },
  ];

  for (const { pattern, arch } of cpuPatterns) {
    if (pattern.test(ua)) {
      info.cpu.architecture = arch;
      break;
    }
  }
}

function detectFeatures(ua: string, info: UserAgentInfo): void {
  // Basic feature detection based on User-Agent
  info.features.javascript = true; // Most modern browsers support JS
  info.features.cookies = !ua.includes('no-cookie');
  
  // WebGL support
  info.features.webgl = !ua.includes('msie') && !ua.includes('trident');
  
  // WebSockets support
  info.features.websockets = !ua.includes('msie 9') && !ua.includes('msie 8');
  
  // LocalStorage support
  info.features.localStorage = !ua.includes('msie 7') && !ua.includes('msie 6');
  
  // SessionStorage support
  info.features.sessionStorage = !ua.includes('msie 7') && !ua.includes('msie 6');
  
  // Geolocation support
  info.features.geolocation = !ua.includes('msie 8') && !ua.includes('msie 7');
  
  // Notifications support
  info.features.notifications = !ua.includes('msie') && !ua.includes('safari');
  
  // Service Worker support
  info.features.serviceWorker = !ua.includes('msie') && !ua.includes('safari');
  
  // Web Workers support
  info.features.webWorkers = !ua.includes('msie 9') && !ua.includes('msie 8');
  
  // WebAssembly support
  info.features.webAssembly = !ua.includes('msie') && !ua.includes('safari');
}

function analyzeSecurity(ua: string, info: UserAgentInfo): void {
  // Private browsing detection
  const privatePatterns = [
    /private/i, /incognito/i, /inprivate/i
  ];
  
  for (const pattern of privatePatterns) {
    if (pattern.test(ua)) {
      info.security.isPrivate = true;
      break;
    }
  }

  // Proxy/VPN detection
  const proxyPatterns = [
    /proxy/i, /vpn/i, /tor/i, /anonymous/i
  ];
  
  for (const pattern of proxyPatterns) {
    if (pattern.test(ua)) {
      info.security.isProxy = true;
      break;
    }
  }

  // Tor detection
  if (ua.includes('tor') || ua.includes('onion')) {
    info.security.isTor = true;
    info.security.isProxy = true;
  }

  // Suspicious patterns
  const suspiciousPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /scan/i, /test/i, /curl/i, /wget/i, /python/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(ua) && !info.device.isBot) {
      info.security.suspicious = true;
      break;
    }
  }
}

function validateUserAgentString(userAgent: string, info: UserAgentInfo) {
  const errors: string[] = [];
  const warnings: string[] = [];
  let isValid = true;

  if (userAgent.length < 10) {
    errors.push('User-Agent string is too short');
    isValid = false;
  }

  if (userAgent.length > 500) {
    warnings.push('User-Agent string is unusually long');
  }

  if (info.browser.name === 'Unknown') {
    warnings.push('Could not identify browser');
  }

  if (info.os.name === 'Unknown') {
    warnings.push('Could not identify operating system');
  }

  if (info.device.type === 'unknown') {
    warnings.push('Could not identify device type');
  }

  // Check for malformed User-Agent
  if (!userAgent.includes('/') && !userAgent.includes('(')) {
    warnings.push('User-Agent string appears malformed');
  }

  return {
    isValid,
    errors,
    warnings,
  };
}

function generateRecommendations(info: UserAgentInfo): string[] {
  const recommendations: string[] = [];

  // Browser recommendations
  if (info.browser.name === 'Internet Explorer') {
    recommendations.push('Consider upgrading to a modern browser for better security and features');
  }

  if (info.browser.name === 'Safari' && parseInt(info.browser.major) < 12) {
    recommendations.push('Consider updating Safari for better performance and security');
  }

  // OS recommendations
  if (info.os.name === 'Windows' && info.os.version.startsWith('7')) {
    recommendations.push('Consider upgrading Windows for better security support');
  }

  // Device recommendations
  if (info.device.isMobile) {
    recommendations.push('Optimize content for mobile devices');
  }

  if (info.device.isTablet) {
    recommendations.push('Consider tablet-specific layouts and interactions');
  }

  // Feature recommendations
  if (!info.features.webgl) {
    recommendations.push('Provide fallback content for WebGL features');
  }

  if (!info.features.websockets) {
    recommendations.push('Consider alternative real-time communication methods');
  }

  // Security recommendations
  if (info.security.isPrivate) {
    recommendations.push('Respect user privacy preferences');
  }

  if (info.security.suspicious) {
    recommendations.push('Monitor for suspicious activity');
  }

  return recommendations;
}

function getWindowsVersion(ntVersion: string): string {
  const versionMap: Record<string, string> = {
    '10.0': '10/11',
    '6.3': '8.1',
    '6.2': '8',
    '6.1': '7',
    '6.0': 'Vista',
    '5.1': 'XP',
    '5.0': '2000',
  };

  return versionMap[ntVersion] || ntVersion;
}