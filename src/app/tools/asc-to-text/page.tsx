'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, FileText, RotateCcw } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'

export default function AscToText() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const { trackUsage } = useToolAccess('asc-to-text')

  const convertAscToText = async () => {
    if (!input.trim()) {
      setError('Please enter ASCII codes')
      return
    }

    try {
      // Track usage before converting
      await trackUsage()

      // Split input by lines, commas, or spaces
      const codes = input.split(/[\n,\s]+/).filter(code => code.trim())
      const text = codes.map(code => {
        const num = parseInt(code.trim())
        if (isNaN(num) || num < 0 || num > 127) {
          throw new Error(`Invalid ASCII code: ${code}`)
        }
        return String.fromCharCode(num)
      }).join('')

      setOutput(text)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed')
      setOutput('')
    }
  }

  const convertTextToAsc = async () => {
    if (!input.trim()) {
      setError('Please enter text')
      return
    }

    try {
      // Track usage before converting
      await trackUsage()

      const codes = input.split('').map(char => char.charCodeAt(0)).join(' ')
      setOutput(codes)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed')
      setOutput('')
    }
  }

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output)
    }
  }

  const downloadResult = () => {
    if (output) {
      const blob = new Blob([output], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'asc-conversion-result.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError(null)
  }

  const loadSample = () => {
    setInput('72 101 108 108 111 32 87 111 114 108 100')
    setError(null)
  }

  return (
    <ToolLayout
      toolId="asc-to-text"
      toolName="ASCII to Text Converter"
      toolDescription="Convert between ASCII codes and text"
      toolCategory="Text Tools"
      toolIcon={<FileText className="w-8 h-8" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
            <CardDescription>
              Enter ASCII codes (space/newline/comma separated) or text to convert
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Input Data</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter ASCII codes (e.g., 72 101 108 108 111) or text..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={loadSample}>
                Load Sample
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
            <CardDescription>
              Conversion result will appear here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Result</label>
                {output && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadResult}>
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
              <Textarea
                value={output}
                readOnly
                placeholder="Conversion result will appear here..."
                rows={8}
                className="font-mono text-sm bg-muted/50"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={convertAscToText}
                disabled={!input.trim()}
                className="flex-1"
              >
                ASCII to Text
              </Button>
              <Button 
                variant="outline"
                onClick={convertTextToAsc}
                disabled={!input.trim()}
              >
                Text to ASCII
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">About ASCII Converter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">📝 What is ASCII?</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• American Standard Code for Information Interchange</li>
                <li>• 7-bit character encoding standard</li>
                <li>• Values range from 0 to 127</li>
                <li>• Includes letters, numbers, symbols, and control codes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">💡 Usage Tips</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Separate codes with spaces, commas, or newlines</li>
                <li>• Use decimal values (0-127)</li>
                <li>• Convert both ways: ASCII ↔ Text</li>
                <li>• Invalid codes will show error messages</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}