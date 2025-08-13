import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type = 'linear',
      direction = 'to right',
      colors = ['#ff0000', '#0000ff'],
      colorStops = [0, 100],
      cssFormat = 'standard',
      includeFallback = true,
      includePreview = true
    } = body;

    // Input validation
    if (!['linear', 'radial', 'conic'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be linear, radial, or conic' },
        { status: 400 }
      );
    }

    if (!Array.isArray(colors) || colors.length < 2 || colors.length > 5) {
      return NextResponse.json(
        { error: 'Colors must be an array with 2-5 colors' },
        { status: 400 }
      );
    }

    // Validate colors
    for (const color of colors) {
      if (!isValidColor(color)) {
        return NextResponse.json(
          { error: `Invalid color format: ${color}. Use hex (#RRGGBB), rgb(r,g,b), or color name` },
          { status: 400 }
        );
      }
    }

    if (!Array.isArray(colorStops) || colorStops.length !== colors.length) {
      return NextResponse.json(
        { error: 'Color stops must match colors array length' },
        { status: 400 }
      );
    }

    // Validate color stops
    for (const stop of colorStops) {
      if (typeof stop !== 'number' || stop < 0 || stop > 100) {
        return NextResponse.json(
          { error: 'Color stops must be numbers between 0 and 100' },
          { status: 400 }
        );
      }
    }

    // Ensure color stops are in ascending order
    const sortedStops = [...colorStops].sort((a, b) => a - b);
    if (JSON.stringify(colorStops) !== JSON.stringify(sortedStops)) {
      return NextResponse.json(
        { error: 'Color stops must be in ascending order' },
        { status: 400 }
      );
    }

    if (!['standard', 'shorthand', 'verbose'].includes(cssFormat)) {
      return NextResponse.json(
        { error: 'CSS format must be standard, shorthand, or verbose' },
        { status: 400 }
      );
    }

    if (typeof includeFallback !== 'boolean' || typeof includePreview !== 'boolean') {
      return NextResponse.json(
        { error: 'Boolean flags must be boolean values' },
        { status: 400 }
      );
    }

    // Generate CSS gradient
    const gradientCSS = generateCSSGradient(type, direction, colors, colorStops, cssFormat);
    
    // Generate fallback CSS
    const fallbackCSS = includeFallback ? generateFallbackCSS(colors) : null;
    
    // Generate preview data
    const preview = includePreview ? generatePreviewData(type, direction, colors, colorStops) : null;
    
    // Generate additional CSS variations
    const variations = generateCSSVariations(type, colors, colorStops);
    
    // Analyze gradient
    const analysis = analyzeGradient(type, colors, colorStops);
    
    // Generate browser compatibility info
    const compatibility = getBrowserCompatibility(type);

    // Try to get AI insights
    let aiInsights = null;
    try {
      const zai = await ZAI.create();
      const insights = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a CSS and web design expert. Analyze the gradient generation and provide insights about design applications, best practices, and visual effects.'
          },
          {
            role: 'user',
            content: `Generated ${type} CSS gradient with ${colors.length} colors: ${colors.join(', ')}. Direction: ${direction}, color stops: ${colorStops.join(', ')}. CSS format: ${cssFormat}. Provide insights about gradient design, visual impact, and best practices for web design.`
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
      gradient: {
        css: gradientCSS,
        fallback: fallbackCSS,
        type: type,
        direction: direction,
        colors: colors,
        colorStops: colorStops,
        format: cssFormat
      },
      preview,
      variations,
      analysis,
      compatibility,
      parameters: {
        type,
        direction,
        colors,
        colorStops,
        cssFormat,
        includeFallback,
        includePreview
      },
      aiInsights
    });

  } catch (error) {
    console.error('CSS gradient generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSS gradient' },
      { status: 500 }
    );
  }
}

// Helper functions
function isValidColor(color: string): boolean {
  // Hex format
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
    return true;
  }
  
  // RGB format
  if (/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i.test(color)) {
    return true;
  }
  
  // Named colors (basic set)
  const namedColors = [
    'red', 'green', 'blue', 'white', 'black', 'yellow', 'cyan', 'magenta',
    'orange', 'purple', 'pink', 'brown', 'gray', 'grey', 'lime', 'navy',
    'teal', 'silver', 'gold', 'indigo', 'violet', 'coral', 'salmon'
  ];
  
  return namedColors.includes(color.toLowerCase());
}

function generateCSSGradient(type: string, direction: string, colors: string[], colorStops: number[], format: string): string {
  const colorString = colors.map((color, index) => {
    const stop = colorStops[index];
    return `${color} ${stop}%`;
  }).join(', ');

  switch (type) {
    case 'linear':
      if (format === 'shorthand') {
        return `linear-gradient(${direction}, ${colors.join(', ')})`;
      } else if (format === 'verbose') {
        return `background: linear-gradient(${direction}, ${colorString});`;
      } else {
        return `linear-gradient(${direction}, ${colorString})`;
      }
      
    case 'radial':
      if (format === 'shorthand') {
        return `radial-gradient(circle, ${colors.join(', ')})`;
      } else if (format === 'verbose') {
        return `background: radial-gradient(circle, ${colorString});`;
      } else {
        return `radial-gradient(circle, ${colorString})`;
      }
      
    case 'conic':
      if (format === 'shorthand') {
        return `conic-gradient(${colors.join(', ')})`;
      } else if (format === 'verbose') {
        return `background: conic-gradient(${colorString});`;
      } else {
        return `conic-gradient(${colorString})`;
      }
      
    default:
      return `linear-gradient(${direction}, ${colorString})`;
  }
}

function generateFallbackCSS(colors: string[]): string {
  // Use the first color as fallback
  return `background-color: ${colors[0]};`;
}

function generatePreviewData(type: string, direction: string, colors: string[], colorStops: number[]): any {
  const preview = {
    type: type,
    direction: direction,
    colors: colors,
    stops: colorStops,
    css: generateCSSGradient(type, direction, colors, colorStops, 'standard'),
    svgPreview: generateSVGPreview(type, direction, colors, colorStops)
  };
  
  return preview;
}

function generateSVGPreview(type: string, direction: string, colors: string[], colorStops: number[]): string {
  const width = 300;
  const height = 200;
  
  let gradientDef = '';
  let rectGradient = '';
  
  switch (type) {
    case 'linear':
      const angle = directionToAngle(direction);
      gradientDef = `
        <linearGradient id="gradient" x1="0%" y1="0%" x2="${Math.cos(angle * Math.PI / 180) * 100}%" y2="${Math.sin(angle * Math.PI / 180) * 100}%">
          ${colors.map((color, index) => 
            `<stop offset="${colorStops[index]}%" stop-color="${color}" />`
          ).join('\n          ')}
        </linearGradient>
      `;
      break;
      
    case 'radial':
      gradientDef = `
        <radialGradient id="gradient" cx="50%" cy="50%" r="50%">
          ${colors.map((color, index) => 
            `<stop offset="${colorStops[index]}%" stop-color="${color}" />`
          ).join('\n          ')}
        </radialGradient>
      `;
      break;
      
    case 'conic':
      gradientDef = `
        <defs>
          <conicGradient id="gradient">
            ${colors.map((color, index) => 
              `<stop offset="${colorStops[index]}%" stop-color="${color}" />`
            ).join('\n            ')}
          </conicGradient>
        </defs>
      `;
      break;
  }
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${gradientDef}
      <rect width="100%" height="100%" fill="url(#gradient)" />
    </svg>
  `.trim();
}

function directionToAngle(direction: string): number {
  const directions: Record<string, number> = {
    'to top': 0,
    'to top right': 45,
    'to right': 90,
    'to bottom right': 135,
    'to bottom': 180,
    'to bottom left': 225,
    'to left': 270,
    'to top left': 315
  };
  
  return directions[direction] || 90;
}

function generateCSSVariations(type: string, colors: string[], colorStops: number[]): any {
  const variations = {};
  
  if (type === 'linear') {
    variations.directions = {
      'to top': generateCSSGradient('linear', 'to top', colors, colorStops, 'standard'),
      'to right': generateCSSGradient('linear', 'to right', colors, colorStops, 'standard'),
      'to bottom': generateCSSGradient('linear', 'to bottom', colors, colorStops, 'standard'),
      'to left': generateCSSGradient('linear', 'to left', colors, colorStops, 'standard'),
      '45deg': generateCSSGradient('linear', '45deg', colors, colorStops, 'standard'),
      '135deg': generateCSSGradient('linear', '135deg', colors, colorStops, 'standard')
    };
  }
  
  // Different gradient types
  variations.types = {
    linear: generateCSSGradient('linear', 'to right', colors, colorStops, 'standard'),
    radial: generateCSSGradient('radial', 'circle', colors, colorStops, 'standard'),
    conic: generateCSSGradient('conic', 'from 0deg', colors, colorStops, 'standard')
  };
  
  // Color variations
  const reversedColors = [...colors].reverse();
  const reversedStops = colorStops.map(stop => 100 - stop).reverse();
  variations.reversed = generateCSSGradient(type, type === 'linear' ? 'to right' : 'circle', reversedColors, reversedStops, 'standard');
  
  return variations;
}

function analyzeGradient(type: string, colors: string[], colorStops: number[]): any {
  const analysis = {
    type: type,
    colorCount: colors.length,
    complexity: calculateComplexity(colors, colorStops),
    contrast: calculateGradientContrast(colors),
    harmony: analyzeColorHarmony(colors),
    visualEffect: getVisualEffect(type, colors),
    bestUseCases: getBestUseCases(type, colors)
  };
  
  return analysis;
}

function calculateComplexity(colors: string[], colorStops: number[]): string {
  if (colors.length === 2 && colorStops.every(stop => stop === 0 || stop === 100)) {
    return 'Simple';
  } else if (colors.length <= 3) {
    return 'Moderate';
  } else {
    return 'Complex';
  }
}

function calculateGradientContrast(colors: string[]): number {
  // Calculate contrast between first and last color
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
  
  if (colors.length < 2) return 0;
  
  const l1 = getLuminance(colors[0]);
  const l2 = getLuminance(colors[colors.length - 1]);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function analyzeColorHarmony(colors: string[]): string {
  // Simple harmony analysis based on color relationships
  if (colors.length === 2) {
    return 'Complementary';
  } else if (colors.length === 3) {
    return 'Triadic';
  } else {
    return 'Complex';
  }
}

function getVisualEffect(type: string, colors: string[]): string {
  const effects = {
    linear: {
      'to top': 'Ascending',
      'to right': 'Progressive',
      'to bottom': 'Descending',
      'to left': 'Regressive'
    },
    radial: 'Circular/Radiating',
    conic: 'Rotational/Spiral'
  };
  
  return effects[type as keyof typeof effects] || 'Dynamic';
}

function getBestUseCases(type: string, colors: string[]): string[] {
  const useCases = {
    linear: ['Backgrounds', 'Buttons', 'Headers', 'Dividers'],
    radial: ['Spotlights', 'Emphasis', 'Badges', 'Highlights'],
    conic: ['Loaders', 'Progress indicators', 'Decorative elements', 'Special effects']
  };
  
  return useCases[type as keyof typeof useCases] || ['General purpose'];
}

function getBrowserCompatibility(type: string): any {
  const compatibility = {
    linear: {
      chrome: '26+',
      firefox: '16+',
      safari: '6.1+',
      edge: '12+',
      ie: '10+',
      support: 'Excellent'
    },
    radial: {
      chrome: '26+',
      firefox: '16+',
      safari: '6.1+',
      edge: '12+',
      ie: '10+',
      support: 'Excellent'
    },
    conic: {
      chrome: '69+',
      firefox: '83+',
      safari: '12.1+',
      edge: '79+',
      ie: 'Not supported',
      support: 'Good (modern browsers)'
    }
  };
  
  return compatibility[type as keyof typeof compatibility] || {};
}

export async function GET() {
  return NextResponse.json({
    message: 'CSS Gradient Generator API',
    usage: 'POST /api/css-tools/css-gradient-generator',
    parameters: {
      type: 'Gradient type: linear, radial, conic (default: linear) - optional',
      direction: 'Direction for linear gradients (default: "to right") - optional',
      colors: 'Array of colors (2-5 colors, default: ["#ff0000", "#0000ff"]) - optional',
      colorStops: 'Array of color stop positions (0-100, must match colors length) - optional',
      cssFormat: 'CSS output format: standard, shorthand, verbose (default: standard) - optional',
      includeFallback: 'Include fallback CSS (default: true) - optional',
      includePreview: 'Include preview data (default: true) - optional'
    },
    gradientTypes: {
      linear: 'Linear gradient with customizable direction',
      radial: 'Radial gradient from center outward',
      conic: 'Conic gradient rotating around center'
    },
    supportedDirections: [
      'to top', 'to top right', 'to right', 'to bottom right',
      'to bottom', 'to bottom left', 'to left', 'to top left',
      '45deg', '90deg', '135deg', '180deg', '225deg', '270deg', '315deg'
    ],
    examples: [
      {
        type: 'linear',
        direction: 'to right',
        colors: ['#ff6b6b', '#4ecdc4'],
        colorStops: [0, 100]
      },
      {
        type: 'radial',
        colors: ['#667eea', '#764ba2', '#f093fb'],
        colorStops: [0, 50, 100]
      },
      {
        type: 'conic',
        colors: ['#ff9a9e', '#fecfef', '#fecfef'],
        colorStops: [0, 50, 100]
      }
    ],
    tips: [
      'Use 2-3 colors for simple, elegant gradients',
      'Consider accessibility and contrast ratios',
      'Test gradients on different devices and screen sizes',
      'Use fallback colors for older browsers',
      'Conic gradients have limited browser support'
    ]
  });
}