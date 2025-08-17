'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, FileText, Type } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'

export default function AsciiArtToText() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const { trackUsage } = useToolAccess('ascii-art-to-text')

  const convertAsciiArtToText = () => {
    if (!input.trim()) return

    // Track usage
    trackUsage()

    // Simple ASCII art to text conversion
    // This is a basic implementation that handles common ASCII art patterns
    let result = input
    
    // Remove common ASCII art characters and patterns
    result = result.replace(/[|\\\/\-\+\=\*_\[\]{}()<>~`@#$%^&]/g, '')
    
    // Remove excessive whitespace and newlines
    result = result.replace(/\s+/g, ' ')
    result = result.replace(/\n\s*\n/g, '\n')
    
    // Clean up the result
    result = result.trim()
    
    setOutput(result)
  }

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output)
    }
  }

  const downloadText = () => {
    if (output) {
      const blob = new Blob([output], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'converted-text.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
  }

  return (
    <ToolLayout
      toolId="ascii-art-to-text"
      toolName="ASCII Art to Text"
      toolDescription="Convert ASCII art back to readable text"
      toolCategory="Text Tools"
      toolIcon={<Type className="w-8 h-8" />}
      action={{
        label: "Convert to Text",
        onClick: convertAsciiArtToText,
        disabled: !input.trim()
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>ASCII Art Input</CardTitle>
            <CardDescription>
              Paste your ASCII art text below to convert it to readable text
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Paste your ASCII art here...
Example:
  _____ _   _ ____    _    _     _     ____ 
 | ____| \ | |  _ \  / \  | |   | |   |  _ \
 |  _| |  \| | | | |/ _ \ | |   | |   | | | |
 | |___| |\  | |_| / ___ \| |___| |___| |_| |
 |_____|_| \_|____/_/   \_\_____|_____|____/"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={10}
                className="font-mono text-sm resize-none"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={clearAll}
                disabled={!input && !output}
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Converted Text</CardTitle>
            <CardDescription>
              The extracted readable text will appear here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {output ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    <FileText className="w-3 h-3 mr-1" />
                    {output.length} characters
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadText}>
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 bg-muted/50 max-h-96 overflow-y-auto">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {output}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Ready to convert</h3>
                <p className="text-muted-foreground">
                  Paste ASCII art in the input area and click "Convert to Text" to extract readable text
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Examples and Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Common ASCII Art Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium mb-1">Text Art</h4>
                <p className="text-muted-foreground">
                  Large text made of characters like #, *, |, -, etc.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Box Art</h4>
                <p className="text-muted-foreground">
                  Text enclosed in boxes made of +, -, | characters.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Decorative Art</h4>
                <p className="text-muted-foreground">
                  Text with decorative borders and symbols.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium mb-1">Pattern Recognition</h4>
                <p className="text-muted-foreground">
                  Removes common ASCII art characters and symbols.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Text Extraction</h4>
                <p className="text-muted-foreground">
                  Preserves actual text content while removing formatting.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Cleanup</h4>
                <p className="text-muted-foreground">
                  Removes excessive whitespace and normalizes formatting.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}