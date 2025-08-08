'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, RotateCcw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function CSSFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const formatCSS = () => {
    if (!input.trim()) {
      toast({
        title: "Empty input",
        description: "Please enter CSS code to format",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      let formatted = input
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        .replace(/;\s*/g, ';\n')
        .replace(/{\s*/g, ' {\n  ')
        .replace(/}\s*/g, '\n}\n')
        // Format selectors and properties
        .replace(/([^{}]+)\s*{/g, '$1 {\n  ')
        .replace(/([^{}]+)\s*([^{};]+)\s*;/g, '    $1: $2;\n')
        // Clean up multiple newlines
        .replace(/\n\s*\n/g, '\n')

      setOutput(formatted)
      
      toast({
        title: "CSS formatted successfully",
        description: "Your CSS code has been properly formatted"
      })
    } catch (error) {
      toast({
        title: "Formatting error",
        description: "Unable to format the CSS code",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const minifyCSS = () => {
    if (!input.trim()) {
      toast({
        title: "Empty input",
        description: "Please enter CSS code to minify",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      let minified = input
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove whitespace
        .replace(/\s+/g, ' ')
        // Remove spaces around operators
        .replace(/\s*([:;{}])\s*/g, '$1')
        // Remove unnecessary semicolons
        .replace(/;}/g, '}')
        // Remove newlines
        .replace(/\n/g, '')

      setOutput(minified)
      
      toast({
        title: "CSS minified successfully",
        description: "Your CSS code has been minified"
      })
    } catch (error) {
      toast({
        title: "Minification error",
        description: "Unable to minify the CSS code",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    toast({
      title: "Copied to clipboard",
      description: "Formatted CSS has been copied to clipboard"
    })
  }

  const downloadFile = () => {
    const blob = new Blob([output], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.css'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Download started",
      description: "CSS file download has started"
    })
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CSS Formatter</h1>
        <p className="text-muted-foreground">
          Format and minify CSS code with proper indentation and structure
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">Code Tool</Badge>
          <Badge variant="outline">CSS</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
            <CardDescription>
              Enter your CSS code below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="/* Enter your CSS code here */
.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.button {
    background-color: #007bff;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.button:hover {
    background-color: #0056b3;
}"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[300px] font-mono"
            />
            <div className="flex gap-2">
              <Button onClick={clearAll} variant="outline" className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
            <CardDescription>
              Formatted CSS code will appear here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={output}
              readOnly
              className="min-h-[300px] font-mono bg-muted"
            />
            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button onClick={downloadFile} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Formatting Options</CardTitle>
          <CardDescription>
            Choose how you want to format your CSS code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="format" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="format">Format & Beautify</TabsTrigger>
              <TabsTrigger value="minify">Minify</TabsTrigger>
            </TabsList>
            <TabsContent value="format" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="format-desc">Format Description</Label>
                <p className="text-sm text-muted-foreground">
                  This option will format your CSS code with proper indentation, 
                  spacing, and structure for better readability.
                </p>
              </div>
              <Button 
                onClick={formatCSS} 
                disabled={loading || !input.trim()}
                className="w-full"
              >
                {loading ? "Formatting..." : "Format CSS"}
              </Button>
            </TabsContent>
            <TabsContent value="minify" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="minify-desc">Minify Description</Label>
                <p className="text-sm text-muted-foreground">
                  This option will minify your CSS code by removing whitespace, 
                  comments, and unnecessary characters to reduce file size.
                </p>
              </div>
              <Button 
                onClick={minifyCSS} 
                disabled={loading || !input.trim()}
                className="w-full"
              >
                {loading ? "Minifying..." : "Minify CSS"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>CSS Formatting Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Best Practices</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Use consistent indentation (2 or 4 spaces)</li>
                <li>• Organize CSS using BEM methodology</li>
                <li>• Group related styles together</li>
                <li>• Use CSS custom properties for theming</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Common Issues</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Missing semicolons</li>
                <li>• Incorrect selector specificity</li>
                <li>• Unused CSS rules</li>
                <li>• Inconsistent formatting</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}