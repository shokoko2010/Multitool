'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Code, 
  Copy, 
  Download, 
  RefreshCw, 
  Settings, 
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Hash,
  Braces,
  AngleBrackets,
  CurlyBraces,
  SquareBrackets
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

interface LanguageConfig {
  name: string
  value: string
  extensions: string[]
  comment: string
  braceStyle: 'collapse' | 'expand' | 'none'
  indentSize: number
  semicolons: boolean
}

const languages: LanguageConfig[] = [
  {
    name: 'JavaScript',
    value: 'javascript',
    extensions: ['.js', '.jsx', '.mjs'],
    comment: '//',
    braceStyle: 'collapse',
    indentSize: 2,
    semicolons: true
  },
  {
    name: 'TypeScript',
    value: 'typescript',
    extensions: ['.ts', '.tsx'],
    comment: '//',
    braceStyle: 'collapse',
    indentSize: 2,
    semicolons: true
  },
  {
    name: 'Python',
    value: 'python',
    extensions: ['.py', '.pyw'],
    comment: '#',
    braceStyle: 'none',
    indentSize: 4,
    semicolons: false
  },
  {
    name: 'HTML',
    value: 'html',
    extensions: ['.html', '.htm'],
    comment: '<!-- -->',
    braceStyle: 'expand',
    indentSize: 2,
    semicolons: false
  },
  {
    name: 'CSS',
    value: 'css',
    extensions: ['.css', '.scss', '.sass'],
    comment: '/* */',
    braceStyle: 'expand',
    indentSize: 2,
    semicolons: true
  },
  {
    name: 'JSON',
    value: 'json',
    extensions: ['.json', '.json5'],
    comment: '//',
    braceStyle: 'none',
    indentSize: 2,
    semicolons: false
  },
  {
    name: 'XML',
    value: 'xml',
    extensions: ['.xml', '.xsl', '.svg'],
    comment: '<!-- -->',
    braceStyle: 'expand',
    indentSize: 2,
    semicolons: false
  },
  {
    name: 'SQL',
    value: 'sql',
    extensions: ['.sql', '.ddl', '.dml'],
    comment: '--',
    braceStyle: 'expand',
    indentSize: 2,
    semicolons: true
  }
]

export default function CodeFormatter() {
  const { theme } = useTheme()
  const [inputCode, setInputCode] = useState('')
  const [outputCode, setOutputCode] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [indentSize, setIndentSize] = useState(2)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [minify, setMinify] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [autoDetect, setAutoDetect] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentLanguage = languages.find(lang => lang.value === selectedLanguage) || languages[0]

  const detectLanguage = (code: string): string => {
    if (!code.trim()) return 'javascript'
    
    // Check for JSON
    try {
      JSON.parse(code)
      return 'json'
    } catch {
      // Not JSON
    }
    
    // Check for HTML
    if (code.includes('<') && code.includes('>')) {
      return 'html'
    }
    
    // Check for CSS
    if (code.includes('{') && code.includes('}') && (code.includes('color:') || code.includes('background:'))) {
      return 'css'
    }
    
    // Check for Python
    if (code.includes('def ') || code.includes('import ') || code.includes('from ')) {
      return 'python'
    }
    
    // Check for SQL
    if (code.includes('SELECT') || code.includes('INSERT') || code.includes('UPDATE') || code.includes('DELETE')) {
      return 'sql'
    }
    
    // Default to JavaScript
    return 'javascript'
  }

  const formatCode = () => {
    if (!inputCode.trim()) return

    setIsProcessing(true)
    
    setTimeout(() => {
      let formatted = inputCode
      const detectedLanguage = autoDetect ? detectLanguage(inputCode) : selectedLanguage
      const lang = languages.find(l => l.value === detectedLanguage) || languages[0]

      // Simple formatting based on language
      if (minify) {
        // Minification - remove whitespace and comments
        formatted = inputCode
          .replace(/\s*\/\/.*$/gm, '') // Remove single-line comments
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
          .replace(/\s+/g, ' ') // Multiple spaces to single space
          .replace(/;\s*/g, ';') // Remove space after semicolons
          .replace(/{\s*/g, '{') // Remove space after opening braces
          .replace(/\s*}/g, '}') // Remove space before closing braces
          .replace(/\[\s*/g, '[') // Remove space after opening brackets
          .replace(/\s*]/g, ']') // Remove space before closing brackets
          .replace(/<\s*/g, '<') // Remove space after opening angle brackets
          .replace(/\s*>/g, '>') // Remove space before closing angle brackets
          .trim()
      } else {
        // Formatting - add proper indentation and spacing
        formatted = inputCode
          .replace(/\r\n/g, '\n') // Normalize line endings
          .replace(/\t/g, ' '.repeat(lang.indentSize)) // Replace tabs with spaces
        
        // Basic brace formatting
        if (lang.braceStyle !== 'none') {
          formatted = formatted
            .replace(/{\s*/g, ' {\n' + ' '.repeat(lang.indentSize))
            .replace(/\s*}/g, '\n}')
            .replace(/\[\s*/g, ' [\n' + ' '.repeat(lang.indentSize))
            .replace(/\s*]/g, '\n]')
            .replace(/<\s*/g, ' <\n' + ' '.repeat(lang.indentSize))
            .replace(/\s*>/g, '\n>')
        }
        
        // Add semicolons if needed
        if (lang.semicolons) {
          formatted = formatted.replace(/([^;])\s*$/gm, '$1;')
        }
      }

      setOutputCode(formatted)
      setIsProcessing(false)
    }, 500)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadCode = () => {
    const blob = new Blob([outputCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `formatted-code.${currentLanguage.extensions[0].substring(1)}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const loadExample = () => {
    const examples = {
      javascript: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate first 10 Fibonacci numbers
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}`,
      python: `def calculate_factorial(n):
    """Calculate the factorial of a number"""
    if n == 0 or n == 1:
        return 1
    else:
        return n * calculate_factorial(n - 1)

# Calculate factorial of 5
result = calculate_factorial(5)
print(f"5! = {result}")`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Example Page</title>
</head>
<body>
    <header>
        <h1>Welcome to My Website</h1>
        <nav>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section id="home">
            <h2>Home Section</h2>
            <p>This is the main content area.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2024 My Website. All rights reserved.</p>
    </footer>
</body>
</html>`,
      css: `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f4f4f4;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header {
    text-align: center;
    margin-bottom: 30px;
}

.header h1 {
    color: #333;
    font-size: 2.5em;
}

.button {
    display: inline-block;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.button:hover {
    background-color: #0056b3;
}`
    }

    const example = examples[selectedLanguage as keyof typeof examples] || examples.javascript
    setInputCode(example)
  }

  const toggleLineNumbers = () => {
    setShowLineNumbers(!showLineNumbers)
  }

  const renderCodeWithLineNumbers = (code: string) => {
    if (!showLineNumbers) return code
    
    const lines = code.split('\n')
    const maxLineNumber = lines.length.toString().length
    const lineNumberWidth = maxLineNumber + 2
    
    return lines.map((line, index) => {
      const lineNumber = (index + 1).toString().padStart(maxLineNumber, ' ')
      return `${lineNumber} | ${line}`
    }).join('\n')
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Code Formatter</h1>
        <p className="text-muted-foreground">
          Format and beautify code in multiple programming languages
        </p>
      </div>

      <Tabs defaultValue="formatter" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="formatter">Code Formatter</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="formatter" className="space-y-6">
          {/* Language Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Language Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button variant="outline" onClick={loadExample}>
                  Load Example
                </Button>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="auto-detect"
                    checked={autoDetect}
                    onChange={(e) => setAutoDetect(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="auto-detect" className="text-sm">
                    Auto-detect
                  </label>
                </div>
              </div>
              
              <div className="mt-2 text-xs text-muted-foreground">
                Extensions: {currentLanguage.extensions.join(', ')}
              </div>
            </CardContent>
          </Card>

          {/* Code Input/Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Input Code</CardTitle>
                    <CardDescription>
                      Paste your unformatted code here
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {currentLanguage.name}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  ref={textareaRef}
                  placeholder="Paste your code here..."
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>

            {/* Output */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Formatted Code</CardTitle>
                    <CardDescription>
                      Your beautifully formatted code
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleLineNumbers}
                    >
                      {showLineNumbers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(outputCode)}
                      disabled={!outputCode}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={downloadCode}
                      disabled={!outputCode}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-auto">
                  <pre className="font-mono text-sm whitespace-pre-wrap">
                    {outputCode || 'Formatted code will appear here...'}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Button 
                  onClick={formatCode} 
                  disabled={!inputCode.trim() || isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Formatting...
                    </>
                  ) : (
                    <>
                      <Code className="mr-2 h-4 w-4" />
                      Format Code
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    copyToClipboard(inputCode)
                    copyToClipboard(outputCode)
                  }}
                  disabled={!inputCode || !outputCode}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Both
                </Button>
              </div>
              
              <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="minify"
                    checked={minify}
                    onChange={(e) => setMinify(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="minify" className="text-sm">
                    Minify instead of format
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="indent-size"
                    checked={!minify}
                    onChange={(e) => setIndentSize(e.target.checked ? 2 : 4)}
                    disabled={minify}
                    className="rounded"
                  />
                  <label htmlFor="indent-size" className="text-sm">
                    Indent Size: {indentSize}
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Formatting Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Language Settings</h3>
                  <div className="space-y-3">
                    {languages.map((lang) => (
                      <div key={lang.value} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <div className="font-medium">{lang.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {lang.braceStyle} braces • {lang.indentSize} spaces
                          </div>
                        </div>
                        <Badge variant={selectedLanguage === lang.value ? 'default' : 'outline'}>
                          {lang.extensions[0]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Global Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Show line numbers</span>
                      <input
                        type="checkbox"
                        checked={showLineNumbers}
                        onChange={toggleLineNumbers}
                        className="rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-detect language</span>
                      <input
                        type="checkbox"
                        checked={autoDetect}
                        onChange={(e) => setAutoDetect(e.target.checked)}
                        className="rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Minify by default</span>
                      <input
                        type="checkbox"
                        checked={minify}
                        onChange={(e) => setMinify(e.target.checked)}
                        className="rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}