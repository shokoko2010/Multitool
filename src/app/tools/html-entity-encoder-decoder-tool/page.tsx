'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, FileText, Code, Lock, Unlock } from 'lucide-react'

export default function HTMLEntityEncoderDecoderTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const processHTMLEntity = useCallback(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }

    try {
      if (mode === 'encode') {
        const encoded = encodeHTMLEntities(input)
        setOutput(encoded)
      } else {
        const decoded = decodeHTMLEntities(input)
        setOutput(decoded)
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Invalid input'}`)
    }
  }, [input, mode])

  const encodeHTMLEntities = (text: string): string => {
    const textarea = document.createElement('textarea')
    textarea.textContent = text
    return textarea.innerHTML
  }

  const decodeHTMLEntities = (text: string): string => {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = text
    return textarea.value
  }

  const handleCopy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output)
    }
  }

  const handleDownload = () => {
    if (output) {
      const blob = new Blob([output], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `html-entity-${mode === 'encode' ? 'encoded' : 'decoded'}.txt`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInput(content)
      }
      reader.readAsText(file)
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
  }

  const getCommonEntities = () => {
    return [
      { entity: '&quot;', character: '"', description: 'Quotation mark' },
      { entity: '&amp;', character: '&', description: 'Ampersand' },
      { entity: '&lt;', character: '<', description: 'Less than' },
      { entity: '&gt;', character: '>', description: 'Greater than' },
      { entity: '&nbsp;', character: ' ', description: 'Non-breaking space' },
      { entity: '&apos;', character: "'", description: 'Apostrophe' },
      { entity: '&copy;', character: '©', description: 'Copyright symbol' },
      { entity: '&reg;', character: '®', description: 'Registered trademark' }
    ]
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {mode === 'encode' ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
            HTML Entity {mode === 'encode' ? 'Encoder' : 'Decoder'}
          </CardTitle>
          <CardDescription>
            {mode === 'encode' 
              ? 'Convert special characters to HTML entities' 
              : 'Convert HTML entities back to special characters'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'encode' | 'decode')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="encode">Encode</TabsTrigger>
              <TabsTrigger value="decode">Decode</TabsTrigger>
            </TabsList>

            <TabsContent value="encode" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Input Text</label>
                <Textarea
                  placeholder="Enter text with special characters to encode..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={6}
                />
              </div>
            </TabsContent>

            <TabsContent value="decode" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">HTML Entities</label>
                <Textarea
                  placeholder="Enter HTML entities to decode..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={6}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 mt-4">
            <Button onClick={processHTMLEntity} disabled={!input.trim()}>
              {mode === 'encode' ? 'Encode' : 'Decode'}
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <div className="flex-1" />
            <input
              type="file"
              accept=".txt,.html"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <FileText className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          </div>

          {output && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Output</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <Textarea
                value={output}
                readOnly
                rows={6}
                className="font-mono"
              />
            </div>
          )}

          <div className="mt-6 space-y-4">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="about">About HTML Entities</TabsTrigger>
                <TabsTrigger value="common">Common Entities</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">What are HTML Entities?</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    HTML entities are used to display reserved characters in HTML that might otherwise 
                    be interpreted as HTML code. They start with an ampersand (&) and end with a semicolon (;).
                  </p>
                  <p className="text-sm text-muted-foreground">
                    For example, the less than sign (&lt;) is used to start HTML tags, so to display it 
                    as text, you need to use the entity &amp;lt; instead.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="common" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Common HTML Entities</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {getCommonEntities().map((entity, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <code className="bg-background px-2 py-1 rounded">{entity.entity}</code>
                        <span className="text-muted-foreground">→</span>
                        <span>{entity.character}</span>
                        <span className="text-muted-foreground text-xs">({entity.description})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}