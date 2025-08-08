'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Copy, Download, RefreshCw, ExternalLink, Plus, Trash2, Globe } from 'lucide-react'
import { toast } from 'sonner'

interface HreflangEntry {
  lang: string
  hreflang: string
  url: string
}

const COMMON_LANGUAGES = [
  { code: 'en', name: 'English', hreflang: 'en' },
  { code: 'en-US', name: 'English (US)', hreflang: 'en-US' },
  { code: 'en-GB', name: 'English (UK)', hreflang: 'en-GB' },
  { code: 'es', name: 'Spanish', hreflang: 'es' },
  { code: 'es-ES', name: 'Spanish (Spain)', hreflang: 'es-ES' },
  { code: 'es-MX', name: 'Spanish (Mexico)', hreflang: 'es-MX' },
  { code: 'fr', name: 'French', hreflang: 'fr' },
  { code: 'fr-FR', name: 'French (France)', hreflang: 'fr-FR' },
  { code: 'fr-CA', name: 'French (Canada)', hreflang: 'fr-CA' },
  { code: 'de', name: 'German', hreflang: 'de' },
  { code: 'de-DE', name: 'German (Germany)', hreflang: 'de-DE' },
  { code: 'de-AT', name: 'German (Austria)', hreflang: 'de-AT' },
  { code: 'it', name: 'Italian', hreflang: 'it' },
  { code: 'it-IT', name: 'Italian (Italy)', hreflang: 'it-IT' },
  { code: 'pt', name: 'Portuguese', hreflang: 'pt' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', hreflang: 'pt-BR' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', hreflang: 'pt-PT' },
  { code: 'ru', name: 'Russian', hreflang: 'ru' },
  { code: 'ru-RU', name: 'Russian (Russia)', hreflang: 'ru-RU' },
  { code: 'ja', name: 'Japanese', hreflang: 'ja' },
  { code: 'ja-JP', name: 'Japanese (Japan)', hreflang: 'ja-JP' },
  { code: 'ko', name: 'Korean', hreflang: 'ko' },
  { code: 'ko-KR', name: 'Korean (South Korea)', hreflang: 'ko-KR' },
  { code: 'zh', name: 'Chinese', hreflang: 'zh' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', hreflang: 'zh-CN' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', hreflang: 'zh-TW' },
  { code: 'zh-HK', name: 'Chinese (Hong Kong)', hreflang: 'zh-HK' },
  { code: 'ar', name: 'Arabic', hreflang: 'ar' },
  { code: 'ar-SA', name: 'Arabic (Saudi Arabia)', hreflang: 'ar-SA' },
  { code: 'ar-EG', name: 'Arabic (Egypt)', hreflang: 'ar-EG' },
  { code: 'hi', name: 'Hindi', hreflang: 'hi' },
  { code: 'hi-IN', name: 'Hindi (India)', hreflang: 'hi-IN' },
  { code: 'th', name: 'Thai', hreflang: 'th' },
  { code: 'th-TH', name: 'Thai (Thailand)', hreflang: 'th-TH' },
  { code: 'vi', name: 'Vietnamese', hreflang: 'vi' },
  { code: 'vi-VN', name: 'Vietnamese (Vietnam)', hreflang: 'vi-VN' },
  { code: 'nl', name: 'Dutch', hreflang: 'nl' },
  { code: 'nl-NL', name: 'Dutch (Netherlands)', hreflang: 'nl-NL' },
  { code: 'sv', name: 'Swedish', hreflang: 'sv' },
  { code: 'sv-SE', name: 'Swedish (Sweden)', hreflang: 'sv-SE' },
  { code: 'no', name: 'Norwegian', hreflang: 'no' },
  { code: 'no-NO', name: 'Norwegian (Norway)', hreflang: 'no-NO' },
  { code: 'da', name: 'Danish', hreflang: 'da' },
  { code: 'da-DK', name: 'Danish (Denmark)', hreflang: 'da-DK' },
  { code: 'fi', name: 'Finnish', hreflang: 'fi' },
  { code: 'fi-FI', name: 'Finnish (Finland)', hreflang: 'fi-FI' },
  { code: 'pl', name: 'Polish', hreflang: 'pl' },
  { code: 'pl-PL', name: 'Polish (Poland)', hreflang: 'pl-PL' },
  { code: 'cs', name: 'Czech', hreflang: 'cs' },
  { code: 'cs-CZ', name: 'Czech (Czech Republic)', hreflang: 'cs-CZ' },
  { code: 'hu', name: 'Hungarian', hreflang: 'hu' },
  { code: 'hu-HU', name: 'Hungarian (Hungary)', hreflang: 'hu-HU' },
  { code: 'el', name: 'Greek', hreflang: 'el' },
  { code: 'el-GR', name: 'Greek (Greece)', hreflang: 'el-GR' },
  { code: 'tr', name: 'Turkish', hreflang: 'tr' },
  { code: 'tr-TR', name: 'Turkish (Turkey)', hreflang: 'tr-TR' },
  { code: 'he', name: 'Hebrew', hreflang: 'he' },
  { code: 'he-IL', name: 'Hebrew (Israel)', hreflang: 'he-IL' }
]

export default function HreflangGenerator() {
  const [baseUrl, setBaseUrl] = useState('')
  const [hreflangEntries, setHreflangEntries] = useState<HreflangEntry[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const [generatedTags, setGeneratedTags] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const addHreflangEntry = () => {
    if (!selectedLanguage) {
      toast.error('Please select a language')
      return
    }

    const language = COMMON_LANGUAGES.find(lang => lang.code === selectedLanguage)
    if (!language) {
      toast.error('Invalid language selected')
      return
    }

    const newEntry: HreflangEntry = {
      lang: language.code,
      hreflang: language.hreflang,
      url: customUrl || `${baseUrl}${language.code === 'en' ? '' : `/${language.code}`}`
    }

    // Check if entry already exists
    const exists = hreflangEntries.some(entry => entry.lang === newEntry.lang)
    if (exists) {
      toast.error('Language already added')
      return
    }

    setHreflangEntries([...hreflangEntries, newEntry])
    setCustomUrl('')
    setSelectedLanguage('')
    toast.success('Language added successfully!')
  }

  const removeHreflangEntry = (index: number) => {
    const updatedEntries = hreflangEntries.filter((_, i) => i !== index)
    setHreflangEntries(updatedEntries)
    toast.success('Language removed')
  }

  const generateHreflangTags = async () => {
    if (!baseUrl) {
      toast.error('Please enter a base URL')
      return
    }

    if (hreflangEntries.length === 0) {
      toast.error('Please add at least one language')
      return
    }

    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Generate hreflang tags
      let tags = ''

      // Add link tags for each language
      hreflangEntries.forEach(entry => {
        tags += `<link rel="alternate" hreflang="${entry.hreflang}" href="${entry.url}" />\n`
      })

      // Add self-referencing canonical tag
      tags += `<link rel="canonical" href="${baseUrl}" />\n`

      // Add x-default for default language
      const defaultEntry = hreflangEntries.find(entry => entry.lang === 'en' || entry.lang === 'en-US')
      if (defaultEntry) {
        tags += `<link rel="alternate" hreflang="x-default" href="${defaultEntry.url}" />\n`
      }

      setGeneratedTags(tags.trim())
      toast.success('Hreflang tags generated successfully!')
    } catch (error) {
      toast.error('Failed to generate hreflang tags')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const downloadAsFile = () => {
    const content = `<!-- Hreflang Tags -->\n<!-- Generated for ${hreflangEntries.length} languages -->\n\n${generatedTags}`
    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hreflang-tags.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Hreflang tags downloaded!')
  }

  const previewTags = () => {
    const previewWindow = window.open('', '_blank')
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <title>Hreflang Tags Preview</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .preview-section { margin-bottom: 30px; }
            .preview-section h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
            .tag { background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 4px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="preview-section">
            <h2>Hreflang Tags Preview</h2>
            <div class="tag">${generatedTags.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>
          </div>
        </body>
        </html>
      `)
      previewWindow.document.close()
    }
  }

  const validateHreflangSetup = () => {
    const issues: string[] = []
    const warnings: string[] = []

    // Check for base URL
    if (!baseUrl) {
      issues.push('Base URL is required')
    }

    // Check for duplicate hreflang values
    const hreflangValues = hreflangEntries.map(entry => entry.hreflang)
    const duplicates = hreflangValues.filter((value, index) => hreflangValues.indexOf(value) !== index)
    if (duplicates.length > 0) {
      issues.push(`Duplicate hreflang values found: ${[...new Set(duplicates)].join(', ')}`)
    }

    // Check for missing canonical
    if (!hreflangEntries.find(entry => entry.hreflang === 'x-default')) {
      warnings.push('Consider adding x-default hreflang tag for default language')
    }

    // Check for URL consistency
    hreflangEntries.forEach(entry => {
      try {
        new URL(entry.url)
      } catch {
        issues.push(`Invalid URL for ${entry.lang}: ${entry.url}`)
      }
    })

    return { issues, warnings }
  }

  const { issues, warnings } = validateHreflangSetup()

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hreflang Tag Generator</h1>
        <p className="text-muted-foreground">
          Generate hreflang tags for international SEO and multilingual websites
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Base Configuration</CardTitle>
            <CardDescription>Set up the base URL for your multilingual website</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-sm font-medium mb-2 block">Base URL *</label>
              <Input
                placeholder="https://example.com"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />
              <div className="text-sm text-muted-foreground mt-1">
                This should be your primary domain (e.g., https://example.com)
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Languages</CardTitle>
            <CardDescription>Add different language versions of your page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Language *</label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_LANGUAGES.map(language => (
                      <SelectItem key={language.code} value={language.code}>
                        {language.name} ({language.hreflang})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Custom URL (optional)</label>
                <Input
                  placeholder="Leave empty for auto-generated URL"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                />
                <div className="text-sm text-muted-foreground mt-1">
                  Override the auto-generated URL if needed
                </div>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={addHreflangEntry}
                  disabled={!selectedLanguage || !baseUrl}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Language
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {hreflangEntries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Added Languages</CardTitle>
              <CardDescription>Manage the language versions you've added</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hreflangEntries.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium">{entry.lang}</div>
                        <div className="text-sm text-muted-foreground">hreflang="{entry.hreflang}"</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{entry.url}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHreflangEntry(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Generate Hreflang Tags</CardTitle>
            <CardDescription>Generate the complete hreflang tag set</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={generateHreflangTags}
              disabled={isGenerating || !baseUrl || hreflangEntries.length === 0}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Hreflang Tags...
                </>
              ) : (
                'Generate Hreflang Tags'
              )}
            </Button>
          </CardContent>
        </Card>

        {generatedTags && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Hreflang Tags</CardTitle>
              <CardDescription>Your hreflang tags will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {hreflangEntries.length} hreflang tags generated
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={previewTags}
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button 
                      onClick={() => copyToClipboard(generatedTags)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy All
                    </Button>
                    <Button 
                      onClick={downloadAsFile}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    {generatedTags}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {(issues.length > 0 || warnings.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Validation Results</CardTitle>
              <CardDescription>Check for potential issues with your hreflang setup</CardDescription>
            </CardHeader>
            <CardContent>
              {issues.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-red-600 mb-2">Issues Found:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {issues.map((issue, index) => (
                      <li key={index} className="text-red-600">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              {warnings.length > 0 && (
                <div>
                  <h4 className="font-medium text-yellow-600 mb-2">Warnings:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {warnings.map((warning, index) => (
                      <li key={index} className="text-yellow-600">{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Hreflang Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">One-to-One</div>
                <div className="text-sm mt-2">Each URL should have exactly one hreflang tag</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">Bidirectional</div>
                <div className="text-sm mt-2">If A links to B, B should link back to A</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">x-default</div>
                <div className="text-sm mt-2">Add for the default/fallback language</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">Validation</div>
                <div className="text-sm mt-2">Test with Google's Search Console</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}