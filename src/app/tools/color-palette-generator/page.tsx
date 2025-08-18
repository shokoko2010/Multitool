'use client'

import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, Palette, RotateCcw, Sparkles, Type } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'

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

interface OptionsData {
  styles: Array<{ value: string; label: string; description: string }>
  themes: Array<{ value: string; label: string; description: string }>
  sampleColors: string[]
  features: string[]
}

export default function ColorPaletteGenerator() {
  const [baseColor, setBaseColor] = useState('#3B82F6')
  const [style, setStyle] = useState('random')
  const [count, setCount] = useState(5)
  const [theme, setTheme] = useState('')
  const [useAI, setUseAI] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<PaletteGenerationResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [options, setOptions] = useState<OptionsData | null>(null)
  
  const { trackUsage } = useToolAccess('color-palette-generator')

  useEffect(() => {
    // Load available options
    fetchOptions()
  }, [])

  useEffect(() => {
    // Clear result when options change
    setResult(null)
    setError(null)
  }, [baseColor, style, count, theme, useAI])

  const fetchOptions = async () => {
    try {
      const response = await fetch('/api/color-tools/palette-generator')
      const data = await response.json()
      setOptions(data)
    } catch (err) {
      console.error('Failed to load options:', err)
    }
  }

  const handleGenerate = async () => {
    if (useAI && !prompt.trim()) {
      setError('Prompt is required for AI generation')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Track usage before generating
      await trackUsage()

      const requestBody: any = {
        baseColor,
        style,
        count,
        theme: theme || undefined,
        useAI,
        prompt: useAI ? prompt : undefined
      }

      const response = await fetch('/api/color-tools/palette-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate color palette')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadPalette = () => {
    if (result?.downloadUrl) {
      const link = document.createElement('a')
      link.href = result.downloadUrl
      link.download = `${result.paletteName.replace(/\s+/g, '-').toLowerCase()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const clearAll = () => {
    setResult(null)
    setError(null)
    setPrompt('')
  }

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex)
  }

  return (
    <ToolLayout
      toolId="color-palette-generator"
      toolName="Color Palette Generator"
      toolDescription="Generate beautiful color palettes with various algorithms and AI assistance"
      toolCategory="Color Tools"
      toolIcon={<Palette className="w-8 h-8" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Palette Configuration</CardTitle>
            <CardDescription>
              Configure your color palette generation settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AI Generation Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ai-toggle" className="text-base font-medium">
                  AI Generation
                </Label>
                <p className="text-sm text-muted-foreground">
                  Use AI to generate custom palettes
                </p>
              </div>
              <Switch
                id="ai-toggle"
                checked={useAI}
                onCheckedChange={setUseAI}
              />
            </div>

            {/* AI Prompt */}
            {useAI && (
              <div className="space-y-2">
                <Label htmlFor="ai-prompt">Describe Your Palette</Label>
                <Textarea
                  id="ai-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A calming palette for a meditation app, vibrant colors for a children's website, earth tones for a nature blog..."
                  rows={3}
                />
              </div>
            )}

            {!useAI && (
              <>
                {/* Base Color */}
                <div className="space-y-2">
                  <Label htmlFor="base-color">Base Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="base-color"
                      type="color"
                      value={baseColor}
                      onChange={(e) => setBaseColor(e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={baseColor}
                      onChange={(e) => setBaseColor(e.target.value)}
                      placeholder="#3B82F6"
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>

                {/* Style Selection */}
                <div className="space-y-2">
                  <Label htmlFor="style">Palette Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {options?.styles.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          <div>
                            <div className="font-medium">{s.label}</div>
                            <div className="text-xs text-muted-foreground">{s.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Theme Selection */}
                {style === 'random' && (
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme (Optional)</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Theme</SelectItem>
                        {options?.themes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            <div>
                              <div className="font-medium">{t.label}</div>
                              <div className="text-xs text-muted-foreground">{t.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            {/* Color Count */}
            <div className="space-y-2">
              <Label htmlFor="color-count">Number of Colors: {count}</Label>
              <Input
                id="color-count"
                type="range"
                min="2"
                max="10"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Sample Colors */}
            {!useAI && options?.sampleColors && (
              <div className="space-y-2">
                <Label>Quick Start Colors</Label>
                <div className="flex flex-wrap gap-2">
                  {options.sampleColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setBaseColor(color)}
                      className="w-8 h-8 rounded border-2 border-background hover:border-primary transition-colors"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleGenerate}
                className="flex-1"
                disabled={loading || (useAI && !prompt.trim())}
              >
                {loading ? 'Generating...' : (
                  <>
                    {useAI ? <Sparkles className="w-4 h-4 mr-2" /> : <Palette className="w-4 h-4 mr-2" />}
                    Generate Palette
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={clearAll}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Palette</CardTitle>
            <CardDescription>
              Your color palette will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Palette className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">
                  {useAI ? 'AI is generating your palette...' : 'Generating palette...'}
                </p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                {/* Palette Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{result.paletteName}</h3>
                    {result.aiGenerated && (
                      <Badge variant="secondary" className="text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Generated
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{result.description}</p>
                </div>

                {/* Color Display */}
                <div className="space-y-2">
                  <Label>Colors ({result.colors.length})</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {result.colors.map((color, index) => (
                      <div key={index} className="space-y-2">
                        <div className="relative group">
                          <div
                            className="w-full h-20 rounded-lg border-2 border-background"
                            style={{ backgroundColor: color.hex }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyColor(color.hex)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono">{color.hex}</span>
                            <Badge variant="outline" className="text-xs">
                              {color.name}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            RGB: {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            HSL: {color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CSS Variables */}
                <div className="space-y-2">
                  <Label>CSS Variables</Label>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <pre className="text-xs font-mono overflow-x-auto">
                      {result.cssVariables}
                    </pre>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.cssVariables)}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy CSS
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadPalette}>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.colors.map(c => c.hex).join(', '))}>
                    <Type className="w-4 h-4 mr-1" />
                    Copy Hex Codes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Palette className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Ready to create</h3>
                <p className="text-muted-foreground">
                  {useAI 
                    ? 'Describe your ideal color palette and let AI generate it for you'
                    : 'Configure your settings and generate a beautiful color palette'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Color Palette Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">🎨 Generation Methods</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Monochromatic - Single color variations</li>
                <li>• Analogous - Adjacent color wheel colors</li>
                <li>• Complementary - Opposite color pairs</li>
                <li>• Triadic - Three-color harmonies</li>
                <li>• Random - Algorithmic generation</li>
                <li>• AI-powered - Custom descriptions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔧 Features</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Multiple color format support</li>
                <li>• Theme-based generation</li>
                <li>• CSS variables export</li>
                <li>• One-click color copying</li>
                <li>• Palette download as JSON</li>
                <li>• Color information display</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}