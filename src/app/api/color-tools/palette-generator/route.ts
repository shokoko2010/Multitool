import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import ZAI from 'z-ai-web-dev-sdk'

interface PaletteGenerationRequest {
  baseColor?: string
  style?: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'split-complementary' | 'random'
  count?: number
  theme?: 'warm' | 'cool' | 'neutral' | 'vibrant' | 'pastel' | 'earth'
  useAI?: boolean
  prompt?: string
}

interface ColorInfo {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  name: string
}

interface PaletteGenerationResponse {
  colors: ColorInfo[]
  paletteName: string
  description: string
  cssVariables: string
  downloadUrl?: string
  aiGenerated?: boolean
}

// Color utilities
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
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

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360
  s /= 100
  l /= 100
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
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
  // Simple color naming based on hex values
  const colorNames: Record<string, string> = {
    '#FF0000': 'Red',
    '#00FF00': 'Green',
    '#0000FF': 'Blue',
    '#FFFF00': 'Yellow',
    '#FF00FF': 'Magenta',
    '#00FFFF': 'Cyan',
    '#000000': 'Black',
    '#FFFFFF': 'White',
    '#808080': 'Gray',
    '#FFA500': 'Orange',
    '#800080': 'Purple',
    '#FFC0CB': 'Pink',
    '#A52A2A': 'Brown',
    '#FFD700': 'Gold',
    '#C0C0C0': 'Silver'
  }
  
  return colorNames[hex.toUpperCase()] || 'Custom Color'
}

// Palette generation algorithms
function generateMonochromatic(baseColor: string, count: number): ColorInfo[] {
  const rgb = hexToRgb(baseColor)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  
  const colors: ColorInfo[] = []
  
  for (let i = 0; i < count; i++) {
    const lightness = Math.max(10, Math.min(90, hsl.l + (i - Math.floor(count / 2)) * 15))
    const newRgb = hslToRgb(hsl.h, hsl.s, lightness)
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    
    colors.push({
      hex,
      rgb: newRgb,
      hsl: { h: hsl.h, s: hsl.s, l: lightness },
      name: getColorName(hex)
    })
  }
  
  return colors
}

function generateAnalogous(baseColor: string, count: number): ColorInfo[] {
  const rgb = hexToRgb(baseColor)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  
  const colors: ColorInfo[] = []
  
  for (let i = 0; i < count; i++) {
    const hue = (hsl.h + (i - Math.floor(count / 2)) * 30 + 360) % 360
    const newRgb = hslToRgb(hue, hsl.s, hsl.l)
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    
    colors.push({
      hex,
      rgb: newRgb,
      hsl: { h: hue, s: hsl.s, l: hsl.l },
      name: getColorName(hex)
    })
  }
  
  return colors
}

function generateComplementary(baseColor: string, count: number): ColorInfo[] {
  const rgb = hexToRgb(baseColor)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  
  const colors: ColorInfo[] = []
  
  for (let i = 0; i < count; i++) {
    const hue = (hsl.h + (i * 180) + 360) % 360
    const saturation = Math.max(20, Math.min(100, hsl.s + (i % 2) * 20 - 10))
    const lightness = Math.max(20, Math.min(80, hsl.l + (i % 2) * 20 - 10))
    const newRgb = hslToRgb(hue, saturation, lightness)
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    
    colors.push({
      hex,
      rgb: newRgb,
      hsl: { h: hue, s: saturation, l: lightness },
      name: getColorName(hex)
    })
  }
  
  return colors
}

function generateTriadic(baseColor: string, count: number): ColorInfo[] {
  const rgb = hexToRgb(baseColor)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  
  const colors: ColorInfo[] = []
  
  for (let i = 0; i < count; i++) {
    const hue = (hsl.h + (i * 120) + 360) % 360
    const saturation = Math.max(30, Math.min(100, hsl.s - 10 + Math.random() * 20))
    const lightness = Math.max(30, Math.min(70, hsl.l - 10 + Math.random() * 20))
    const newRgb = hslToRgb(hue, saturation, lightness)
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    
    colors.push({
      hex,
      rgb: newRgb,
      hsl: { h: hue, s: saturation, l: lightness },
      name: getColorName(hex)
    })
  }
  
  return colors
}

function generateRandom(count: number, theme?: string): ColorInfo[] {
  const colors: ColorInfo[] = []
  
  const themeConstraints: Record<string, { h: [number, number]; s: [number, number]; l: [number, number] }> = {
    warm: { h: [0, 60], s: [50, 100], l: [30, 70] },
    cool: { h: [180, 300], s: [50, 100], l: [30, 70] },
    neutral: { h: [0, 360], s: [0, 30], l: [20, 80] },
    vibrant: { h: [0, 360], s: [80, 100], l: [40, 60] },
    pastel: { h: [0, 360], s: [20, 50], l: [70, 90] },
    earth: { h: [20, 50], s: [30, 70], l: [20, 60] }
  }
  
  const constraints = theme ? themeConstraints[theme] : { h: [0, 360], s: [0, 100], l: [0, 100] }
  
  for (let i = 0; i < count; i++) {
    const h = Math.floor(Math.random() * (constraints.h[1] - constraints.h[0]) + constraints.h[0])
    const s = Math.floor(Math.random() * (constraints.s[1] - constraints.s[0]) + constraints.s[0])
    const l = Math.floor(Math.random() * (constraints.l[1] - constraints.l[0]) + constraints.l[0])
    
    const rgb = hslToRgb(h, s, l)
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
    
    colors.push({
      hex,
      rgb,
      hsl: { h, s, l },
      name: getColorName(hex)
    })
  }
  
  return colors
}

function generateCssVariables(colors: ColorInfo[]): string {
  let css = ':root {\n'
  colors.forEach((color, index) => {
    css += `  --color-${index + 1}: ${color.hex};\n`
    css += `  --color-${index + 1}-rgb: ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b};\n`
  })
  css += '}\n'
  return css
}

function getPaletteName(style: string, theme?: string): string {
  const styleNames: Record<string, string> = {
    monochromatic: 'Monochromatic Harmony',
    analogous: 'Analogous Harmony',
    complementary: 'Complementary Harmony',
    triadic: 'Triadic Harmony',
    tetradic: 'Tetradic Harmony',
    'split-complementary': 'Split Complementary',
    random: 'Random Palette'
  }
  
  const themeSuffix = theme ? ` - ${theme.charAt(0).toUpperCase() + theme.slice(1)}` : ''
  return styleNames[style] + themeSuffix
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: PaletteGenerationRequest = await request.json()
    const { 
      baseColor = '#3B82F6', 
      style = 'random', 
      count = 5, 
      theme, 
      useAI = false,
      prompt 
    } = body

    if (count < 2 || count > 10) {
      return NextResponse.json(
        { error: 'Count must be between 2 and 10' },
        { status: 400 }
      )
    }

    let colors: ColorInfo[] = []
    let aiGenerated = false

    if (useAI && prompt) {
      try {
        // Use AI to generate palette
        const zai = await ZAI.create()
        
        const aiPrompt = `Generate a color palette with ${count} colors based on this request: "${prompt}". 
        Return the colors as a JSON array of hex color codes. The colors should be harmonious and suitable for design purposes.
        Only return the JSON array, nothing else.`

        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are a color theory expert. Generate harmonious color palettes based on user descriptions.'
            },
            {
              role: 'user',
              content: aiPrompt
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        })

        const response = completion.choices[0]?.message?.content || ''
        const hexColors = JSON.parse(response)
        
        if (Array.isArray(hexColors) && hexColors.length >= count) {
          colors = hexColors.slice(0, count).map((hex: string) => {
            const rgb = hexToRgb(hex)
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
            return {
              hex,
              rgb,
              hsl,
              name: getColorName(hex)
            }
          })
          aiGenerated = true
        }
      } catch (error) {
        console.error('AI generation failed, falling back to algorithmic generation:', error)
      }
    }

    // Fallback to algorithmic generation
    if (colors.length === 0) {
      switch (style) {
        case 'monochromatic':
          colors = generateMonochromatic(baseColor, count)
          break
        case 'analogous':
          colors = generateAnalogous(baseColor, count)
          break
        case 'complementary':
          colors = generateComplementary(baseColor, count)
          break
        case 'triadic':
          colors = generateTriadic(baseColor, count)
          break
        case 'random':
        default:
          colors = generateRandom(count, theme)
          break
      }
    }

    const paletteName = useAI && prompt ? `AI Generated: ${prompt}` : getPaletteName(style, theme)
    const description = useAI ? `AI-generated palette based on: "${prompt}"` : `A ${style} color palette with ${count} harmonious colors`
    
    const cssVariables = generateCssVariables(colors)
    
    // Create download URL
    const paletteData = {
      name: paletteName,
      colors: colors.map(c => ({ hex: c.hex, name: c.name })),
      css: cssVariables
    }
    const downloadUrl = `data:application/json;base64,${Buffer.from(JSON.stringify(paletteData, null, 2)).toString('base64')}`

    const response: PaletteGenerationResponse = {
      colors,
      paletteName,
      description,
      cssVariables,
      downloadUrl,
      aiGenerated
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error generating color palette:', error)
    return NextResponse.json(
      { error: 'Failed to generate color palette' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return available options
  return NextResponse.json({
    styles: [
      { value: 'monochromatic', label: 'Monochromatic', description: 'Different shades of the same color' },
      { value: 'analogous', label: 'Analogous', description: 'Colors adjacent on the color wheel' },
      { value: 'complementary', label: 'Complementary', description: 'Opposite colors on the color wheel' },
      { value: 'triadic', label: 'Triadic', description: 'Three colors evenly spaced on the color wheel' },
      { value: 'random', label: 'Random', description: 'Random harmonious colors' }
    ],
    themes: [
      { value: 'warm', label: 'Warm', description: 'Reds, oranges, yellows' },
      { value: 'cool', label: 'Cool', description: 'Blues, greens, purples' },
      { value: 'neutral', label: 'Neutral', description: 'Grays, browns, muted colors' },
      { value: 'vibrant', label: 'Vibrant', description: 'Bright, saturated colors' },
      { value: 'pastel', label: 'Pastel', description: 'Soft, light colors' },
      { value: 'earth', label: 'Earth', description: 'Natural, earthy tones' }
    ],
    sampleColors: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'],
    features: [
      "Multiple palette generation algorithms",
      "AI-powered palette generation",
      "Theme-based color generation",
      "CSS variables export",
      "Color information (RGB, HSL, names)",
      "Download functionality"
    ]
  })
}