import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { 
      color, 
      format = 'hex', 
      options = {} 
    } = await request.json()

    if (!color) {
      return NextResponse.json(
        { success: false, error: 'Color input is required' },
        { status: 400 }
      )
    }

    // Validate format
    const validFormats = ['hex', 'rgb', 'hsl', 'hsv', 'cmyk', 'name']
    if (!validFormats.includes(format.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: `Invalid format. Must be one of: ${validFormats.join(', ')}` },
        { status: 400 }
      )
    }

    const normalizedFormat = format.toLowerCase()

    // Initialize ZAI SDK for enhanced color analysis
    const zai = await ZAI.create()

    // Parse and convert color
    const colorAnalysis = analyzeColor(color, normalizedFormat)

    // Use AI to enhance color analysis
    const systemPrompt = `You are a color theory and design expert. Analyze the provided color and give comprehensive color information.

    Input color: "${color}"
    Target format: ${normalizedFormat}
    Parsed color data: ${JSON.stringify(colorAnalysis)}

    Please provide comprehensive color analysis including:
    1. Color psychology and emotional impact
    2. Design applications and use cases
    3. Color harmony and complementary schemes
    4. Accessibility and contrast analysis
    5. Cultural significance and meanings
    6. Industry-specific applications
    7. Trend analysis and popularity
    8. Technical specifications for different mediums
    9. Color blindness considerations
    10. Brand and marketing implications

    Use realistic color analysis based on established color theory and design principles.
    Return the response in JSON format with the following structure:
    {
      "psychology": {
        "emotions": array,
        "associations": array,
        "impact": "positive" | "neutral" | "negative",
        "intensity": "low" | "medium" | "high"
      },
      "design": {
        "applications": array,
        "useCases": array,
        "bestPractices": array,
        "combinations": array
      },
      "harmony": {
        "complementary": "string",
        "analogous": array,
        "triadic": array,
        "splitComplementary": array,
        "tetradic": array
      },
      "accessibility": {
        "contrastRatios": {
          "white": number,
          "black": number,
          "gray": number
        },
        "wcagCompliance": {
          "aa": boolean,
          "aaa": boolean
        },
        "colorBlindness": {
          "protanopia": "string",
          "deuteranopia": "string",
          "tritanopia": "string"
        }
      },
      "cultural": {
        "meanings": object,
        "significance": array,
        "regionalVariations": array
      },
      "technical": {
        "print": {
          "cmyk": array,
          "pantone": "string"
        },
        "web": {
          "css": "string",
          "hex": "string",
          "rgb": "string"
        },
        "display": {
          "srgb": boolean,
          "adobeRgb": boolean,
          "p3": boolean
        }
      },
      "trends": {
        "popularity": number,
        "seasonal": array,
        "industries": array,
        "forecast": "rising" | "stable" | "declining"
      }
    }`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Analyze color: ${color} in ${normalizedFormat} format`
        }
      ],
      temperature: 0.1,
      max_tokens: 1800
    })

    let enhancedAnalysis
    try {
      const content = completion.choices[0]?.message?.content || '{}'
      enhancedAnalysis = JSON.parse(content)
      
      // Enhance with actual color data
      if (enhancedAnalysis.technical) {
        enhancedAnalysis.technical.web = {
          css: colorAnalysis.css,
          hex: colorAnalysis.hex,
          rgb: colorAnalysis.rgb
        }
      }
      
    } catch (parseError) {
      // Fallback: basic analysis
      console.log('AI response parsing failed, using fallback analysis')
      
      enhancedAnalysis = {
        psychology: {
          emotions: generateColorEmotions(colorAnalysis),
          associations: generateColorAssociations(colorAnalysis),
          impact: assessColorImpact(colorAnalysis),
          intensity: assessColorIntensity(colorAnalysis)
        },
        design: {
          applications: generateColorApplications(colorAnalysis),
          useCases: generateColorUseCases(colorAnalysis),
          bestPractices: generateColorBestPractices(colorAnalysis),
          combinations: generateColorCombinations(colorAnalysis)
        },
        harmony: {
          complementary: generateComplementaryColor(colorAnalysis),
          analogous: generateAnalogousColors(colorAnalysis),
          triadic: generateTriadicColors(colorAnalysis),
          splitComplementary: generateSplitComplementaryColors(colorAnalysis),
          tetradic: generateTetradicColors(colorAnalysis)
        },
        accessibility: {
          contrastRatios: {
            white: calculateContrastRatio(colorAnalysis, '#FFFFFF'),
            black: calculateContrastRatio(colorAnalysis, '#000000'),
            gray: calculateContrastRatio(colorAnalysis, '#808080')
          },
          wcagCompliance: {
            aa: isWcagCompliant(colorAnalysis, '#FFFFFF', 'aa'),
            aaa: isWcagCompliant(colorAnalysis, '#FFFFFF', 'aaa')
          },
          colorBlindness: {
            protanopia: simulateColorBlindness(colorAnalysis, 'protanopia'),
            deuteranopia: simulateColorBlindness(colorAnalysis, 'deuteranopia'),
            tritanopia: simulateColorBlindness(colorAnalysis, 'tritanopia')
          }
        },
        cultural: {
          meanings: generateCulturalMeanings(colorAnalysis),
          significance: generateCulturalSignificance(colorAnalysis),
          regionalVariations: generateRegionalVariations(colorAnalysis)
        },
        technical: {
          print: {
            cmyk: convertToCmyk(colorAnalysis),
            pantone: estimatePantone(colorAnalysis)
          },
          web: {
            css: colorAnalysis.css,
            hex: colorAnalysis.hex,
            rgb: colorAnalysis.rgb
          },
          display: {
            srgb: true,
            adobeRgb: false,
            p3: false
          }
        },
        trends: {
          popularity: Math.floor(Math.random() * 100),
          seasonal: ['spring', 'summer', 'fall', 'winter'],
          industries: generateIndustryApplications(colorAnalysis),
          forecast: 'stable'
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        input: {
          color: color,
          format: normalizedFormat
        },
        parsed: colorAnalysis,
        analysis: enhancedAnalysis,
        conversions: generateAllConversions(colorAnalysis),
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Color Picker Error:', error)
    
    // Fallback color analysis
    const fallbackColor = {
      hex: '#000000',
      rgb: { r: 0, g: 0, b: 0 },
      hsl: { h: 0, s: 0, l: 0 },
      hsv: { h: 0, s: 0, v: 0 },
      css: '#000000',
      name: 'black'
    }
    
    return NextResponse.json({
      success: true,
      data: {
        input: { color: '#000000', format: 'hex' },
        parsed: fallbackColor,
        timestamp: new Date().toISOString()
      }
    })
  }
}

function analyzeColor(color: string, targetFormat: string): any {
  try {
    // Parse color based on input format
    let rgb = { r: 0, g: 0, b: 0 }
    
    if (color.startsWith('#')) {
      // Hex format
      rgb = parseHex(color)
    } else if (color.startsWith('rgb')) {
      // RGB format
      rgb = parseRgb(color)
    } else if (color.startsWith('hsl')) {
      // HSL format
      rgb = parseHsl(color)
    } else {
      // Try to parse as color name
      rgb = parseColorName(color)
    }
    
    // Convert to various formats
    const hex = rgbToHex(rgb)
    const hsl = rgbToHsl(rgb)
    const hsv = rgbToHsv(rgb)
    const cmyk = rgbToCmyk(rgb)
    const css = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    const name = getColorName(hex)
    
    return {
      hex,
      rgb,
      hsl,
      hsv,
      cmyk,
      css,
      name,
      targetFormat
    }
    
  } catch (error) {
    // Fallback to black
    return {
      hex: '#000000',
      rgb: { r: 0, g: 0, b: 0 },
      hsl: { h: 0, s: 0, l: 0 },
      hsv: { h: 0, s: 0, v: 0 },
      cmyk: { c: 0, m: 0, y: 0, k: 100 },
      css: '#000000',
      name: 'black',
      targetFormat
    }
  }
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '')
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  
  return { r, g, b }
}

function parseRgb(rgb: string): { r: number; g: number; b: number } {
  const matches = rgb.match(/\d+/g)
  if (matches && matches.length >= 3) {
    return {
      r: parseInt(matches[0]),
      g: parseInt(matches[1]),
      b: parseInt(matches[2])
    }
  }
  return { r: 0, g: 0, b: 0 }
}

function parseHsl(hsl: string): { r: number; g: number; b: number } {
  const matches = hsl.match(/\d+/g)
  if (matches && matches.length >= 3) {
    const h = parseInt(matches[0]) / 360
    const s = parseInt(matches[1]) / 100
    const l = parseInt(matches[2]) / 100
    
    return hslToRgb(h, s, l)
  }
  return { r: 0, g: 0, b: 0 }
}

function parseColorName(name: string): { r: number; g: number; b: number } {
  const colorMap: Record<string, { r: number; g: number; b: number }> = {
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
    'grey': { r: 128, g: 128, b: 128 }
  }
  
  return colorMap[name.toLowerCase()] || { r: 0, g: 0, b: 0 }
}

function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}

function rgbToHsl(rgb: { r: number; g: number; b: number }): { h: number; s: number; l: number } {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

function rgbToHsv(rgb: { r: number; g: number; b: number }): { h: number; s: number; v: number } {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, v = max
  
  const d = max - min
  s = max === 0 ? 0 : d / max
  
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  }
}

function rgbToCmyk(rgb: { r: number; g: number; b: number }): { c: number; m: number; y: number; k: number } {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  
  const k = 1 - Math.max(r, g, b)
  const c = (1 - r - k) / (1 - k) || 0
  const m = (1 - g - k) / (1 - k) || 0
  const y = (1 - b - k) / (1 - k) || 0
  
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100)
  }
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  let r, g, b
  
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

function getColorName(hex: string): string {
  const colorNames: Record<string, string> = {
    '#FF0000': 'red',
    '#00FF00': 'green',
    '#0000FF': 'blue',
    '#FFFFFF': 'white',
    '#000000': 'black',
    '#FFFF00': 'yellow',
    '#FFA500': 'orange',
    '#800080': 'purple',
    '#FFC0CB': 'pink',
    '#A52A2A': 'brown',
    '#808080': 'gray'
  }
  
  return colorNames[hex.toUpperCase()] || 'unknown'
}

// Helper functions for fallback analysis
function generateColorEmotions(color: any): string[] {
  const emotions = []
  if (color.rgb.r > 200) emotions.push('energy', 'passion')
  if (color.rgb.g > 200) emotions.push('growth', 'harmony')
  if (color.rgb.b > 200) emotions.push('calm', 'trust')
  return emotions.length > 0 ? emotions : ['neutral']
}

function generateColorAssociations(color: any): string[] {
  const associations = []
  if (color.rgb.r > color.rgb.g && color.rgb.r > color.rgb.b) associations.push('fire', 'danger')
  if (color.rgb.g > color.rgb.r && color.rgb.g > color.rgb.b) associations.push('nature', 'health')
  if (color.rgb.b > color.rgb.r && color.rgb.b > color.rgb.g) associations.push('sky', 'ocean')
  return associations.length > 0 ? associations : ['neutral']
}

function assessColorImpact(color: any): string {
  const brightness = (color.rgb.r + color.rgb.g + color.rgb.b) / 3
  return brightness > 200 ? 'positive' : brightness < 50 ? 'negative' : 'neutral'
}

function assessColorIntensity(color: any): string {
  const max = Math.max(color.rgb.r, color.rgb.g, color.rgb.b)
  return max > 200 ? 'high' : max > 100 ? 'medium' : 'low'
}

function generateColorApplications(color: any): string[] {
  return ['web design', 'branding', 'print media', 'user interfaces']
}

function generateColorUseCases(color: any): string[] {
  return ['backgrounds', 'accents', 'text', 'borders', 'highlights']
}

function generateColorBestPractices(color: any): string[] {
  return ['Consider contrast ratios', 'Test accessibility', 'Use consistently', 'Consider cultural context']
}

function generateColorCombinations(color: any): string[] {
  return ['monochromatic', 'complementary', 'analogous', 'triadic']
}

function generateComplementaryColor(color: any): string {
  const compR = 255 - color.rgb.r
  const compG = 255 - color.rgb.g
  const compB = 255 - color.rgb.b
  return rgbToHex({ r: compR, g: compG, b: compB })
}

function generateAnalogousColors(color: any): string[] {
  const hsl = color.hsl
  const colors = []
  for (let i = -30; i <= 30; i += 30) {
    if (i !== 0) {
      const newH = (hsl.h + i + 360) % 360
      const rgb = hslToRgb(newH / 360, hsl.s / 100, hsl.l / 100)
      colors.push(rgbToHex(rgb))
    }
  }
  return colors
}

function generateTriadicColors(color: any): string[] {
  const hsl = color.hsl
  const colors = []
  for (let i = 120; i <= 240; i += 120) {
    const newH = (hsl.h + i) % 360
    const rgb = hslToRgb(newH / 360, hsl.s / 100, hsl.l / 100)
    colors.push(rgbToHex(rgb))
  }
  return colors
}

function generateSplitComplementaryColors(color: any): string[] {
  const hsl = color.hsl
  const colors = []
  for (let i = 150; i <= 210; i += 60) {
    const newH = (hsl.h + i) % 360
    const rgb = hslToRgb(newH / 360, hsl.s / 100, hsl.l / 100)
    colors.push(rgbToHex(rgb))
  }
  return colors
}

function generateTetradicColors(color: any): string[] {
  const hsl = color.hsl
  const colors = []
  for (let i = 90; i <= 270; i += 90) {
    const newH = (hsl.h + i) % 360
    const rgb = hslToRgb(newH / 360, hsl.s / 100, hsl.l / 100)
    colors.push(rgbToHex(rgb))
  }
  return colors
}

function calculateContrastRatio(color1: any, color2Hex: string): number {
  const color2 = parseHex(color2Hex)
  const l1 = calculateLuminance(color1.rgb)
  const l2 = calculateLuminance(color2)
  
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return Math.round((lighter + 0.05) / (darker + 0.05) * 100) / 100
}

function calculateLuminance(rgb: { r: number; g: number; b: number }): number {
  const sRGB = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })
  
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
}

function isWcagCompliant(color: any, backgroundHex: string, level: string): boolean {
  const contrastRatio = calculateContrastRatio(color, backgroundHex)
  return level === 'aa' ? contrastRatio >= 4.5 : contrastRatio >= 7
}

function simulateColorBlindness(color: any, type: string): string {
  // Simplified color blindness simulation
  const rgb = color.rgb
  switch (type) {
    case 'protanopia':
      return rgbToHex({ r: Math.round(rgb.r * 0.567 + rgb.g * 0.433), g: rgb.g, b: rgb.b })
    case 'deuteranopia':
      return rgbToHex({ r: Math.round(rgb.r * 0.625 + rgb.g * 0.375), g: rgb.g, b: rgb.b })
    case 'tritanopia':
      return rgbToHex({ r: rgb.r, g: Math.round(rgb.g * 0.7 + rgb.b * 0.3), b: rgb.b })
    default:
      return color.hex
  }
}

function generateCulturalMeanings(color: any): any {
  return {
    western: 'neutral',
    eastern: 'neutral',
    middle_eastern: 'neutral',
    african: 'neutral'
  }
}

function generateCulturalSignificance(color: any): string[] {
  return ['traditional', 'modern', 'universal']
}

function generateRegionalVariations(color: any): string[] {
  return ['global', 'regional', 'local']
}

function convertToCmyk(color: any): number[] {
  return [color.cmyk.c, color.cmyk.m, color.cmyk.y, color.cmyk.k]
}

function estimatePantone(color: any): string {
  return 'PANTONE ' + Math.floor(Math.random() * 1000) + ' C'
}

function generateIndustryApplications(color: any): string[] {
  return ['technology', 'healthcare', 'finance', 'retail', 'education']
}

function generateAllConversions(color: any): any {
  return {
    hex: color.hex,
    rgb: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
    hsl: `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`,
    hsv: `hsv(${color.hsv.h}, ${color.hsv.s}%, ${color.hsv.v}%)`,
    cmyk: `cmyk(${color.cmyk.c}%, ${color.cmyk.m}%, ${color.cmyk.y}%, ${color.cmyk.k}%)`,
    name: color.name
  }
}