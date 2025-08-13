import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface ColorConversion {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
  cmyk: { c: number; m: number; y: number; k: number };
  name?: string;
}

interface ColorConverterResult {
  success: boolean;
  data?: {
    input: {
      value: string;
      format: 'hex' | 'rgb' | 'hsl' | 'hsv' | 'cmyk' | 'name';
    };
    conversions: ColorConversion;
    isValid: boolean;
    error?: string;
  };
  error?: string;
  analysis?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { color, format = 'hex' } = await request.json();

    if (!color) {
      return NextResponse.json<ColorConverterResult>({
        success: false,
        error: 'Color value is required'
      }, { status: 400 });
    }

    // Parse and validate input color
    const parsedColor = parseColor(color, format);
    
    if (!parsedColor.isValid) {
      return NextResponse.json<ColorConverterResult>({
        success: false,
        error: parsedColor.error || 'Invalid color format'
      }, { status: 400 });
    }

    // Convert to all formats
    const conversions = convertToAllFormats(parsedColor.rgb);

    const result = {
      input: {
        value: color,
        format: format as 'hex' | 'rgb' | 'hsl' | 'hsv' | 'cmyk' | 'name'
      },
      conversions,
      isValid: true
    };

    // AI Analysis
    let analysis = '';
    try {
      const zai = await ZAI.create();
      const analysisResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a color theory expert. Analyze the color conversion results and provide insights about the color\'s properties, psychological effects, common use cases, and design recommendations.'
          },
          {
            role: 'user',
            content: `Analyze this color conversion:\n\nInput: ${color} (${format})\n\nConversions:\n- HEX: ${conversions.hex}\n- RGB: ${conversions.rgb.r}, ${conversions.rgb.g}, ${conversions.rgb.b}\n- HSL: ${conversions.hsl.h}°, ${conversions.hsl.s}%, ${conversions.hsl.l}%\n- HSV: ${conversions.hsv.h}°, ${conversions.hsv.s}%, ${conversions.hsv.v}%\n- CMYK: ${conversions.cmyk.c}%, ${conversions.cmyk.m}%, ${conversions.cmyk.y}%, ${conversions.cmyk.k}%\n- Name: ${conversions.name || 'Unknown'}`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      analysis = analysisResponse.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI analysis failed:', error);
    }

    return NextResponse.json<ColorConverterResult>({
      success: true,
      data: result,
      analysis
    });

  } catch (error) {
    console.error('Color conversion error:', error);
    return NextResponse.json<ColorConverterResult>({
      success: false,
      error: 'Internal server error during color conversion'
    }, { status: 500 });
  }
}

function parseColor(color: string, format: string): { rgb: { r: number; g: number; b: number }; isValid: boolean; error?: string } {
  try {
    switch (format.toLowerCase()) {
      case 'hex':
        return parseHex(color);
      case 'rgb':
        return parseRgb(color);
      case 'hsl':
        return parseHsl(color);
      case 'hsv':
        return parseHsv(color);
      case 'cmyk':
        return parseCmyk(color);
      case 'name':
        return parseName(color);
      default:
        return { rgb: { r: 0, g: 0, b: 0 }, isValid: false, error: 'Unsupported color format' };
    }
  } catch (error) {
    return { rgb: { r: 0, g: 0, b: 0 }, isValid: false, error: 'Invalid color format' };
  }
}

function parseHex(hex: string): { rgb: { r: number; g: number; b: number }; isValid: boolean; error?: string } {
  // Remove # if present
  let cleanHex = hex.replace('#', '');
  
  // Handle shorthand hex
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  
  if (cleanHex.length !== 6) {
    return { rgb: { r: 0, g: 0, b: 0 }, isValid: false, error: 'Invalid hex format' };
  }
  
  const r = parseInt(cleanHex.substr(0, 2), 16);
  const g = parseInt(cleanHex.substr(2, 2), 16);
  const b = parseInt(cleanHex.substr(4, 2), 16);
  
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return { rgb: { r: 0, g: 0, b: 0 }, isValid: false, error: 'Invalid hex values' };
  }
  
  return { rgb: { r, g, b }, isValid: true };
}

function parseRgb(rgb: string): { rgb: { r: number; g: number; b: number }; isValid: boolean; error?: string } {
  const match = rgb.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (!match) {
    return { rgb: { r: 0, g: 0, b: 0 }, isValid: false, error: 'Invalid RGB format' };
  }
  
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    return { rgb: { r: 0, g: 0, b: 0 }, isValid: false, error: 'RGB values must be between 0 and 255' };
  }
  
  return { rgb: { r, g, b }, isValid: true };
}

function parseHsl(hsl: string): { rgb: { r: number; g: number; b: number }; isValid: boolean; error?: string } {
  const match = hsl.match(/hsl\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i);
  if (!match) {
    return { rgb: { r: 0, g: 0, b: 0 }, isValid: false, error: 'Invalid HSL format' };
  }
  
  const h = parseInt(match[1], 10);
  const s = parseInt(match[2], 10);
  const l = parseInt(match[3], 10);
  
  if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) {
    return { rgb: { r: 0, g: 0, b: 0 }, isValid: false, error: 'HSL values out of range' };
  }
  
  const rgb = hslToRgb(h, s, l);
  return { rgb, isValid: true };
}

function parseHsv(hsv: string): { rgb: { r: number; g: number; b: number }; isValid: boolean; error?: string } {
  const match = hsv.match(/hsv\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i);
  if (!match) {
    return { rgb: { r: 0, g: 0, b: 0 }, isValid: false, error: 'Invalid HSV format' };
  }
  
  const h = parseInt(match[1], 10);
  const s = parseInt(match[2], 10);
  const v = parseInt(match[3], 10);
  
  if (h < 0 || h > 360 || s < 0 || s > 100 || v < 0 || v > 100) {
    return { rgb: { r: 0, g: 0, b: 0 }, isValid: false, error: 'HSV values out of range' };
  }
  
  const rgb = hsvToRgb(h, s, v);
  return { rgb, isValid: true };
}

function parseCmyk(cmyk: string): { rgb: { r: number; g: number; b: number }; isValid: boolean; error?: string } {
  const match = cmyk.match(/cmyk\s*\(\s*(\d+)%\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i);
  if (!match) {
    return { rgb: { r: 0, g: 0, b: 0 }, isValid: false, error: 'Invalid CMYK format' };
  }
  
  const c = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const y = parseInt(match[3], 10);
  const k = parseInt(match[4], 10);
  
  if (c < 0 || c > 100 || m < 0 || m > 100 || y < 0 || y > 100 || k < 0 || k > 100) {
    return { rgb: { r: 0, g: 0, b: 0 }, isValid: false, error: 'CMYK values must be between 0 and 100' };
  }
  
  const rgb = cmykToRgb(c, m, y, k);
  return { rgb, isValid: true };
}

function parseName(name: string): { rgb: { r: number; g: number; b: number }; isValid: boolean; error?: string } {
  const colorNames: Record<string, { r: number; g: number; b: number }> = {
    'red': { r: 255, g: 0, b: 0 },
    'green': { r: 0, g: 255, b: 0 },
    'blue': { r: 0, g: 0, b: 255 },
    'white': { r: 255, g: 255, b: 255 },
    'black': { r: 0, g: 0, b: 0 },
    'yellow': { r: 255, g: 255, b: 0 },
    'orange': { r: 255, g: 165, b: 0 },
    'purple': { r: 128, g: 0, b: 128 },
    'pink': { r: 255, g: 192, b: 203 },
    'brown': { r: 165, g: 42, b: 42 },
    'gray': { r: 128, g: 128, b: 128 },
    'grey': { r: 128, g: 128, b: 128 },
    'cyan': { r: 0, g: 255, b: 255 },
    'magenta': { r: 255, g: 0, b: 255 },
    'lime': { r: 0, g: 255, b: 0 },
    'navy': { r: 0, g: 0, b: 128 },
    'teal': { r: 0, g: 128, b: 128 },
    'silver': { r: 192, g: 192, b: 192 },
    'maroon': { r: 128, g: 0, b: 0 },
    'olive': { r: 128, g: 128, b: 0 },
    'aqua': { r: 0, g: 255, b: 255 },
    'fuchsia': { r: 255, g: 0, b: 255 }
  };
  
  const normalizedName = name.toLowerCase().trim();
  const color = colorNames[normalizedName];
  
  if (!color) {
    return { rgb: { r: 0, g: 0, b: 0 }, isValid: false, error: 'Unknown color name' };
  }
  
  return { rgb: color, isValid: true };
}

function convertToAllFormats(rgb: { r: number; g: number; b: number }): ColorConversion {
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  const name = getColorName(rgb.r, rgb.g, rgb.b);
  
  return {
    hex,
    rgb,
    hsl,
    hsv,
    cmyk,
    name
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  
  if (max !== min) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  };
}

function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const k = 1 - Math.max(r, g, b);
  const c = (1 - r - k) / (1 - k) || 0;
  const m = (1 - g - k) / (1 - k) || 0;
  const y = (1 - b - k) / (1 - k) || 0;
  
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100)
  };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  v /= 100;
  
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  
  let r = 0, g = 0, b = 0;
  
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function cmykToRgb(c: number, m: number, y: number, k: number): { r: number; g: number; b: number } {
  c /= 100;
  m /= 100;
  y /= 100;
  k /= 100;
  
  const r = 255 * (1 - c) * (1 - k);
  const g = 255 * (1 - m) * (1 - k);
  const b = 255 * (1 - y) * (1 - k);
  
  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b)
  };
}

function getColorName(r: number, g: number, b: number): string | undefined {
  const colors = [
    { name: 'red', rgb: { r: 255, g: 0, b: 0 } },
    { name: 'green', rgb: { r: 0, g: 255, b: 0 } },
    { name: 'blue', rgb: { r: 0, g: 0, b: 255 } },
    { name: 'white', rgb: { r: 255, g: 255, b: 255 } },
    { name: 'black', rgb: { r: 0, g: 0, b: 0 } },
    { name: 'yellow', rgb: { r: 255, g: 255, b: 0 } },
    { name: 'orange', rgb: { r: 255, g: 165, b: 0 } },
    { name: 'purple', rgb: { r: 128, g: 0, b: 128 } },
    { name: 'pink', rgb: { r: 255, g: 192, b: 203 } },
    { name: 'brown', rgb: { r: 165, g: 42, b: 42 } }
  ];
  
  let closestColor = colors[0];
  let minDistance = Infinity;
  
  colors.forEach(color => {
    const distance = Math.sqrt(
      Math.pow(r - color.rgb.r, 2) +
      Math.pow(g - color.rgb.g, 2) +
      Math.pow(b - color.rgb.b, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color;
    }
  });
  
  return minDistance < 50 ? closestColor.name : undefined;
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'POST method required with color value and format'
  }, { status: 405 });
}