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

export default function JavaScriptFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const formatJavaScript = () => {
    if (!input.trim()) {
      toast({
        title: "Empty input",
        description: "Please enter JavaScript code to format",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Basic JavaScript formatting using regex
      let formatted = input
        // Add proper indentation
        .replace(/\n\s*/g, '\n  ')
        // Format object properties
        .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1$2$3 ')
        // Format array elements
        .replace(/(\[\s*)([^,\]]+)(\s*,)/g, '$1$2$3\n  ')
        // Format function parameters
        .replace(/function\s+(\w+)\s*\(([^)]*)\)/g, 'function $1($2) {')
        // Add closing braces
        .replace(/}\s*$/, '  }\n}')

      setOutput(formatted)
      
      toast({
        title: "JavaScript formatted successfully",
        description: "Your JavaScript code has been properly formatted"
      })
    } catch (error) {
      toast({
        title: "Formatting error",
        description: "Unable to format the JavaScript code",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const minifyJavaScript = () => {
    if (!input.trim()) {
      toast({
        title: "Empty input",
        description: "Please enter JavaScript code to minify",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      let minified = input
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
        // Remove whitespace
        .replace(/\s+/g, ' ')
        // Remove spaces around operators
        .replace(/\s*([+\-*/=!<>]=?|&&|\|\|)\s*/g, '$1')
        // Remove unnecessary semicolons
        .replace(/;}/g, '}')
        // Remove newlines
        .replace(/\n/g, '')

      setOutput(minified)
      
      toast({
        title: "JavaScript minified successfully",
        description: "Your JavaScript code has been minified"
      })
    } catch (error) {
      toast({
        title: "Minification error",
        description: "Unable to minify the JavaScript code",
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
      description: "Formatted JavaScript has been copied to clipboard"
    })
  }

  const downloadFile = () => {
    const blob = new Blob([output], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.js'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Download started",
      description: "JavaScript file download has started"
    })
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">JavaScript Formatter</h1>
        <p className="text-muted-foreground">
          Format and minify JavaScript code with proper indentation and syntax highlighting
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">Code Tool</Badge>
          <Badge variant="outline">JavaScript</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
            <CardDescription>
              Enter your JavaScript code below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="// Enter your JavaScript code here
function greet(name) {
    console.log('Hello, ' + name + '!');
    return 'Welcome ' + name;
}

const user = {
    name: 'John',
    age: 30,
    hobbies: ['reading', 'coding']
};"
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
              Formatted JavaScript code will appear here
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
            Choose how you want to format your JavaScript code
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
                  This option will format your JavaScript code with proper indentation, 
                  spacing, and structure for better readability.
                </p>
              </div>
              <Button 
                onClick={formatJavaScript} 
                disabled={loading || !input.trim()}
                className="w-full"
              >
                {loading ? "Formatting..." : "Format JavaScript"}
              </Button>
            </TabsContent>
            <TabsContent value="minify" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="minify-desc">Minify Description</Label>
                <p className="text-sm text-muted-foreground">
                  This option will minify your JavaScript code by removing whitespace, 
                  comments, and unnecessary characters to reduce file size.
                </p>
              </div>
              <Button 
                onClick={minifyJavaScript} 
                disabled={loading || !input.trim()}
                className="w-full"
              >
                {loading ? "Minifying..." : "Minify JavaScript"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>JavaScript Formatting Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Best Practices</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Use consistent indentation (2 or 4 spaces)</li>
                <li>• Add comments for complex logic</li>
                <li>• Use meaningful variable names</li>
                <li>• Break long functions into smaller ones</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Common Issues</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Missing semicolons</li>
                <li>• Improper bracket matching</li>
                <li>• Inconsistent spacing</li>
                <li>• Unused variables</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}