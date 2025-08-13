import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      baseColor,
      paletteType = 'complementary',
      colorCount = 5,
      format = 'hex',
      includeShades = true,
      includeTints = true,
      scheme = 'analogous'
    } = body;

    // Input validation
    if (!baseColor || typeof baseColor !== 'string') {
      return NextResponse.json(
        { error: 'Base color is required and must be a string' },
        { status: 400 }
      );
    }

    const validPaletteTypes = ['complementary', 'analogous', 'triadic', 'tetradic', 'monochromatic', 'split-complementary'];
    if (!validPaletteTypes.includes(paletteType)) {
      return NextResponse.json(
        { error: `Invalid palette type. Must be one of: ${validPaletteTypes.join(', ')}` },
        { status: 400 }
      );
    }

    if (!Number.isInteger(colorCount) || colorCount < 2 || colorCount > 12) {
      return NextResponse.json(
        { error: 'Color count must be between 2 and 12' },
        { status: 400 }
      );
    }

    const validFormats = ['hex', 'rgb', 'hsl', 'hsv', 'cmyk'];
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { error: `Invalid format. Must be one of: ${validFormats.join(', ')}` },
        { status: 400 }
      );
    }

    if (typeof includeShades !== 'boolean' || typeof includeTints !== 'boolean') {
      return NextResponse.json(
        { error: 'Boolean flags must be boolean values' },
        { status: 400 }
      );
    }

    // Parse and validate base color
    const parsedBaseColor = parseColor(baseColor);
    if (!parsedBaseColor) {
      return NextResponse.json(
        { error: 'Invalid base color format. Use hex (#RRGGBB), rgb(r,g,b), or color name' },
        { status: 400 }
      );
    }

    // Generate color palette
    const palette = generateColorPalette(parsedBaseColor, paletteType, colorCount, scheme);
    
    // Generate shades and tints if requested
    let shades: any[] = [];
    let tints: any[] = [];
    
    if (includeShades) {
      shades = generateShades(parsedBaseColor, 5);
    }
    
    if (includeTints) {
      tints = generateTints(parsedBaseColor, 5);
    }

    // Convert all colors to requested format
    const convertedPalette = palette.map(color => convertColorFormat(color, format));
    const convertedShades = shades.map(shade => convertColorFormat(shade, format));
    const convertedTints = tints.map(tint => convertColorFormat(tint, format));

    // Color analysis
    const analysis = analyzeColorPalette(convertedPalette, paletteType);
    
    // Generate CSS variables
    const cssVariables = generateCSSVariables(convertedPalette, convertedShades, convertedTints);

    // Generate color harmony information
    const harmonyInfo = getColorHarmonyInfo(paletteType);

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a color theory and design expert. Analyze the color palette and provide insights about color harmony, design applications, and psychological effects.'
          },
          {
            role: 'user',
            content: `Generated ${paletteType} color palette with ${colorCount} colors based on ${baseColor}. Palette includes ${includeShades ? 'shades' : ''}${includeShades && includeTints ? ' and ' : ''}${includeTints ? 'tints' : ''}. Primary colors: ${convertedPalette.slice(0, 3).join(', ')}. Provide insights about color harmony, design applications, and psychological impact.`
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      });
      aiInsights = insights.choices[0]?.message?.content || null;
    } catch (error) {
      console.warn('AI insights failed:', error);
    }

    return NextResponse.json({
      success: true,
      baseColor: convertColorFormat(parsedBaseColor, format),
      palette: convertedPalette,
      shades: convertedShades.length > 0 ? convertedShades : undefined,
      tints: convertedTints.length > 0 ? convertedTints : undefined,
      analysis,
      cssVariables,
      harmony: harmonyInfo,
      parameters: {
        baseColor,
        paletteType,
        colorCount,
        format,
        includeShades,
        includeTints,
        scheme
      },
      aiInsights
    });

  } catch (error) {
    console.error('Color palette generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate color palette' },
      { status: 500 }
    );
  }
}

// Helper functions
function parseColor(color: string): { r: number; g: number; b: number } | null {
  // Remove whitespace
  color = color.trim();
  
  // Hex format
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16)
      };
    } else if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16)
      };
    }
  }
  
  // RGB format
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3])
    };
  }
  
  // Named colors (basic set)
  const namedColors: Record<string, { r: number; g: number; b: number }> = {
    'red': { r: 255, g: 0, b: 0 },
    'green': { r: 0, g: 255, b: 0 },
    'blue': { r: 0, g: 0, b: 255 },
    'white': { r: 255, g: 255, b: 255 },
    'black': { r: 0, g: 0, b: 0 },
    'yellow': { r: 255, g: 255, b: 0 },
    'cyan': { r: 0, g: 255, b: 255 },
    'magenta': { r: 255, g: 0, b: 255 },
    'orange': { r: 255, g: 165, b: 0 },
    'purple': { r: 128, g: 0, b: 128 },
    'pink': { r: 255, g: 192, b: 203 },
    'brown': { r: 165, g: 42, b: 42 },
    'gray': { r: 128, g: 128, b: 128 },
    'grey': { r: 128, g: 128, b: 128 }
  };
  
  if (namedColors[color.toLowerCase()]) {
    return namedColors[color.toLowerCase()];
  }
  
  return null;
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
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return { h: h * 360, s: s * 100, l: l * 100 };
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

function generateColorPalette(baseColor: { r: number; g: number; b: number }, type: string, count: number, scheme: string): Array<{ r: number; g: number; b: number }> {
  const hsl = rgbToHsl(baseColor.r, baseColor.g, baseColor.b);
  const palette: Array<{ r: number; g: number; b: number }> = [baseColor];
  
  switch (type) {
    case 'complementary':
      const compHue = (hsl.h + 180) % 360;
      palette.push(hslToRgb(compHue, hsl.s, hsl.l));
      break;
      
    case 'analogous':
      for (let i = 1; i < count; i++) {
        const hue = (hsl.h + (i * 30)) % 360;
        palette.push(hslToRgb(hue, hsl.s, hsl.l));
      }
      break;
      
    case 'triadic':
      for (let i = 1; i < 3; i++) {
        const hue = (hsl.h + (i * 120)) % 360;
        palette.push(hslToRgb(hue, hsl.s, hsl.l));
      }
      break;
      
    case 'tetradic':
      for (let i = 1; i < 4; i++) {
        const hue = (hsl.h + (i * 90)) % 360;
        palette.push(hslToRgb(hue, hsl.s, hsl.l));
      }
      break;
      
    case 'monochromatic':
      for (let i = 1; i < count; i++) {
        const lightness = Math.max(10, Math.min(90, hsl.l + (i * 15)));
        palette.push(hslToRgb(hsl.h, hsl.s, lightness));
      }
      break;
      
    case 'split-complementary':
      palette.push(hslToRgb((hsl.h + 150) % 360, hsl.s, hsl.l));
      palette.push(hslToRgb((hsl.h + 210) % 360, hsl.s, hsl.l));
      break;
  }
  
  return palette.slice(0, count);
}

function generateShades(baseColor: { r: number; g: number; b: number }, count: number): Array<{ r: number; g: number; b: number }> {
  const shades: Array<{ r: number; g: number; b: number }> = [];
  
  for (let i = 1; i <= count; i++) {
    const factor = 1 - (i * 0.15);
    shades.push({
      r: Math.round(baseColor.r * factor),
      g: Math.round(baseColor.g * factor),
      b: Math.round(baseColor.b * factor)
    });
  }
  
  return shades;
}

function generateTints(baseColor: { r: number; g: number; b: number }, count: number): Array<{ r: number; g: number; b: number }> {
  const tints: Array<{ r: number; g: number; b: number }> = [];
  
  for (let i = 1; i <= count; i++) {
    const factor = 1 - (i * 0.15);
    tints.push({
      r: Math.round(baseColor.r + (255 - baseColor.r) * (1 - factor)),
      g: Math.round(baseColor.g + (255 - baseColor.g) * (1 - factor)),
      b: Math.round(baseColor.b + (255 - baseColor.b) * (1 - factor))
    });
  }
  
  return tints;
}

function convertColorFormat(color: { r: number; g: number; b: number }, format: string): string {
  switch (format) {
    case 'hex':
      return `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`;
      
    case 'rgb':
      return `rgb(${color.r}, ${color.g}, ${color.b})`;
      
    case 'hsl':
      const hsl = rgbToHsl(color.r, color.g, color.b);
      return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
      
    case 'hsv':
      const hsv = rgbToHsv(color.r, color.g, color.b);
      return `hsv(${Math.round(hsv.h)}, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%)`;
      
    case 'cmyk':
      const cmyk = rgbToCmyk(color.r, color.g, color.b);
      return `cmyk(${Math.round(cmyk.c)}%, ${Math.round(cmyk.m)}%, ${Math.round(cmyk.y)}%, ${Math.round(cmyk.k)}%)`;
      
    default:
      return `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`;
  }
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  
  let h = 0;
  const s = max === 0 ? 0 : delta / max;
  const v = max;
  
  if (delta !== 0) {
    switch (max) {
      case r: h = ((g - b) / delta + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / delta + 2) / 6; break;
      case b: h = ((r - g) / delta + 4) / 6; break;
    }
  }
  
  return { h: h * 360, s: s * 100, v: v * 100 };
}

function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const k = 1 - Math.max(r, g, b);
  const c = (1 - r - k) / (1 - k) || 0;
  const m = (1 - g - k) / (1 - k) || 0;
  const y = (1 - b - k) / (1 - k) || 0;
  
  return { c: c * 100, m: m * 100, y: y * 100, k: k * 100 };
}

function analyzeColorPalette(palette: string[], type: string): any {
  const analysis = {
    type: type,
    colorCount: palette.length,
    contrast: calculateContrast(palette),
    harmony: type,
    temperature: calculateTemperature(palette),
    saturation: calculateSaturation(palette),
    brightness: calculateBrightness(palette),
    accessibility: checkAccessibility(palette)
  };
  
  return analysis;
}

function calculateContrast(palette: string[]): number {
  // Simple contrast calculation based on lightness difference
  if (palette.length < 2) return 0;
  
  let maxContrast = 0;
  for (let i = 0; i < palette.length; i++) {
    for (let j = i + 1; j < palette.length; j++) {
      const contrast = Math.abs(getLightness(palette[i]) - getLightness(palette[j]));
      maxContrast = Math.max(maxContrast, contrast);
    }
  }
  
  return maxContrast;
}

function getLightness(color: string): number {
  // Extract RGB values from hex color
  const hex = color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  
  const hsl = rgbToHsl(r, g, b);
  return hsl.l;
}

function calculateTemperature(palette: string[]): string {
  let warmCount = 0;
  let coolCount = 0;
  
  palette.forEach(color => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    if (r > b) {
      warmCount++;
    } else {
      coolCount++;
    }
  });
  
  return warmCount > coolCount ? 'Warm' : 'Cool';
}

function calculateSaturation(palette: string[]): number {
  let totalSaturation = 0;
  
  palette.forEach(color => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    const hsl = rgbToHsl(r, g, b);
    totalSaturation += hsl.s;
  });
  
  return totalSaturation / palette.length;
}

function calculateBrightness(palette: string[]): number {
  let totalBrightness = 0;
  
  palette.forEach(color => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    const brightness = (r + g + b) / 3;
    totalBrightness += brightness;
  });
  
  return totalBrightness / palette.length;
}

function checkAccessibility(palette: string[]): any {
  const accessibility = {
    wcagAA: true,
    wcagAAA: true,
    contrastRatios: []
  };
  
  // Check contrast ratios between adjacent colors
  for (let i = 0; i < palette.length - 1; i++) {
    const ratio = calculateContrastRatio(palette[i], palette[i + 1]);
    accessibility.contrastRatios.push({
      pair: `${i + 1}-${i + 2}`,
      ratio: ratio.toFixed(2)
    });
    
    if (ratio < 4.5) {
      accessibility.wcagAA = false;
    }
    if (ratio < 7) {
      accessibility.wcagAAA = false;
    }
  }
  
  return accessibility;
}

function calculateContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    
    const rs = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const gs = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const bs = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function generateCSSVariables(palette: string[], shades: string[], tints: string[]): string {
  let css = ':root {\n';
  
  palette.forEach((color, index) => {
    css += `  --color-primary-${index + 1}: ${color};\n`;
  });
  
  shades.forEach((shade, index) => {
    css += `  --color-shade-${index + 1}: ${shade};\n`;
  });
  
  tints.forEach((tint, index) => {
    css += `  --color-tint-${index + 1}: ${tint};\n`;
  });
  
  css += '}';
  
  return css;
}

function getColorHarmonyInfo(type: string): any {
  const harmonyInfo = {
    complementary: {
      description: 'Colors opposite each other on the color wheel',
      effect: 'High contrast, vibrant and dynamic',
      bestFor: 'Logos, highlights, accent colors'
    },
    analogous: {
      description: 'Colors adjacent to each other on the color wheel',
      effect: 'Harmonious and pleasing',
      bestFor: 'UI design, backgrounds, natural themes'
    },
    triadic: {
      description: 'Three colors evenly spaced on the color wheel',
      effect: 'Balanced and rich',
      bestFor: 'Branding, illustrations, diverse designs'
    },
    tetradic: {
      description: 'Four colors forming a rectangle on the color wheel',
      effect: 'Rich and complex',
      bestFor: 'Complex designs, art, sophisticated themes'
    },
    monochromatic: {
      description: 'Variations of a single color',
      effect: 'Cohesive and elegant',
      bestFor: 'Minimalist designs, corporate themes'
    },
    'split-complementary': {
      description: 'Base color plus two adjacent to its complement',
      effect: 'Strong contrast with more harmony',
      bestFor: 'Web design, user interfaces'
    }
  };
  
  return harmonyInfo[type as keyof typeof harmonyInfo] || {};
}

export async function GET() {
  return NextResponse.json({
    message: 'Color Palette Generator API',
    usage: 'POST /api/color-tools/color-palette-generator',
    parameters: {
      baseColor: 'Base color for palette generation (required)',
      paletteType: 'Palette type: complementary, analogous, triadic, tetradic, monochromatic, split-complementary (default: complementary) - optional',
      colorCount: 'Number of colors in palette (2-12, default: 5) - optional',
      format: 'Output format: hex, rgb, hsl, hsv, cmyk (default: hex) - optional',
      includeShades: 'Include darker variations (default: true) - optional',
      includeTints: 'Include lighter variations (default: true) - optional',
      scheme: 'Color scheme: analogous (default: analogous) - optional'
    },
    paletteTypes: {
      complementary: 'Opposite colors for high contrast',
      analogous: 'Adjacent colors for harmony',
      triadic: 'Three evenly spaced colors',
      tetradic: 'Four colors in rectangular arrangement',
      monochromatic: 'Single color variations',
      'split-complementary': 'Base color plus two adjacent to complement'
    },
    supportedFormats: ['hex', 'rgb', 'hsl', 'hsv', 'cmyk'],
    examples: [
      {
        baseColor: '#3498db',
        paletteType: 'complementary',
        colorCount: 5,
        format: 'hex'
      },
      {
        baseColor: 'rgb(231, 76, 60)',
        paletteType: 'analogous',
        colorCount: 6,
        format: 'hsl',
        includeShades: true,
        includeTints: true
      },
      {
        baseColor: '#2ecc71',
        paletteType: 'triadic',
        colorCount: 4,
        format: 'rgb'
      }
    ],
    tips: [
      'Use complementary colors for high contrast and emphasis',
      'Analogous colors work well for harmonious designs',
      'Consider accessibility when choosing color combinations',
      'Test colors in different lighting conditions',
      'Use shades and tints for depth and variety'
    ]
  });
}