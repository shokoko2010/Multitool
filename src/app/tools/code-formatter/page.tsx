'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { 
  Code, 
  Copy, 
  Download, 
  Upload, 
  Settings,
  Play,
  Trash2,
  FileText,
  Braces,
  Indent,
  WrapText,
  Save
} from 'lucide-react'

interface FormattingOptions {
  language: string
  indentSize: number
  indentType: 'spaces' | 'tabs'
  maxLineLength: number
  preserveNewlines: boolean
  trimTrailingWhitespace: boolean
  insertFinalNewline: boolean
  semicolons: 'always' | 'never' | 'auto'
  quotes: 'single' | 'double' | 'auto'
}

interface FormattedCode {
  original: string
  formatted: string
  language: string
  timestamp: Date
  stats: {
    originalLines: number
    formattedLines: number
    originalSize: number
    formattedSize: number
  }
}

const supportedLanguages = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'css', label: 'CSS', icon: '🎨' },
  { value: 'html', label: 'HTML', icon: '🌐' },
  { value: 'json', label: 'JSON', icon: '📋' },
  { value: 'xml', label: 'XML', icon: '📄' },
  { value: 'sql', label: 'SQL', icon: '🗄️' },
  { value: 'php', label: 'PHP', icon: '🐘' },
  { value: 'ruby', label: 'Ruby', icon: '💎' },
  { value: 'go', label: 'Go', icon: '🐹' },
  { value: 'rust', label: 'Rust', icon: '🦀' },
  { value: 'swift', label: 'Swift', icon: '🦉' },
  { value: 'kotlin', label: 'Kotlin', icon: '🟣' }
]

const defaultPresets = [
  { name: 'Standard', options: { indentSize: 2, indentType: 'spaces' as const, maxLineLength: 80, preserveNewlines: true, trimTrailingWhitespace: true, insertFinalNewline: true, semicolons: 'always' as const, quotes: 'single' as const } },
  { name: 'Compact', options: { indentSize: 2, indentType: 'spaces' as const, maxLineLength: 120, preserveNewlines: false, trimTrailingWhitespace: true, insertFinalNewline: true, semicolons: 'always' as const, quotes: 'single' as const } },
  { name: 'Expanded', options: { indentSize: 4, indentType: 'spaces' as const, maxLineLength: 100, preserveNewlines: true, trimTrailingWhitespace: true, insertFinalNewline: true, semicolons: 'always' as const, quotes: 'double' as const } },
  { name: 'Tabs', options: { indentSize: 2, indentType: 'tabs' as const, maxLineLength: 80, preserveNewlines: true, trimTrailingWhitespace: true, insertFinalNewline: true, semicolons: 'always' as const, quotes: 'single' as const } }
]

export default function CodeFormatter() {
  const [code, setCode] = useState('')
  const [formattedCode, setFormattedCode] = useState('')
  const [options, setOptions] = useState<FormattingOptions>({
    language: 'javascript',
    indentSize: 2,
    indentType: 'spaces',
    maxLineLength: 80,
    preserveNewlines: true,
    trimTrailingWhitespace: true,
    insertFinalNewline: true,
    semicolons: 'always',
    quotes: 'single'
  })
  const [isFormatting, setIsFormatting] = useState(false)
  const [formatHistory, setFormatHistory] = useState<FormattedCode[]>([])
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('formatter')
  const [copied, setCopied] = useState<string | null>(null)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatCode = async (codeToFormat: string): Promise<string> => {
    // Simulate code formatting - in a real implementation, this would use actual formatters
    await new Promise(resolve => setTimeout(resolve, 500))
    
    let formatted = codeToFormat
    const indent = options.indentType === 'spaces' ? ' '.repeat(options.indentSize) : '\t'
    
    // Basic formatting logic for demonstration
    const lines = formatted.split('\n')
    let formattedLines: string[] = []
    let indentLevel = 0
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim()
      
      if (options.trimTrailingWhitespace) {
        line = line.trimEnd()
      }
      
      // Handle indentation based on language
      if (options.language === 'javascript' || options.language === 'typescript') {
        // Decrease indent for closing braces
        if (line.includes('}') && !line.includes('{')) {
          indentLevel = Math.max(0, indentLevel - 1)
        }
        
        // Add indentation
        if (line) {
          line = indent.repeat(indentLevel) + line
        }
        
        // Increase indent for opening braces
        if (line.includes('{') && !line.includes('}')) {
          indentLevel++
        }
      } else if (options.language === 'python') {
        // Python indentation based on colons and dedent keywords
        if (line.includes(':') && !line.startsWith('#')) {
          line = indent.repeat(indentLevel) + line
          indentLevel++
        } else if (line.match(/^(return|break|continue|pass)$/)) {
          indentLevel = Math.max(0, indentLevel - 1)
          line = indent.repeat(indentLevel) + line
        } else {
          line = indent.repeat(indentLevel) + line
        }
      } else {
        // Generic indentation
        line = indent.repeat(indentLevel) + line
      }
      
      formattedLines.push(line)
    }
    
    formatted = formattedLines.join('\n')
    
    // Handle line length
    if (options.maxLineLength > 0) {
      formatted = formatted.split('\n').map(line => {
        if (line.length > options.maxLineLength) {
          // Simple line breaking - in real implementation this would be more sophisticated
          return line.substring(0, options.maxLineLength - 3) + '...'
        }
        return line
      }).join('\n')
    }
    
    // Add final newline
    if (options.insertFinalNewline && !formatted.endsWith('\n')) {
      formatted += '\n'
    }
    
    return formatted
  }

  const handleFormat = async () => {
    if (!code.trim()) {
      setError('Please enter code to format')
      return
    }

    setIsFormatting(true)
    setError(null)

    try {
      const formatted = await formatCode(code)
      setFormattedCode(formatted)
      
      // Add to history
      const originalLines = code.split('\n').length
      const formattedLines = formatted.split('\n').length
      const originalSize = code.length
      const formattedSize = formatted.length
      
      const historyItem: FormattedCode = {
        original: code,
        formatted,
        language: options.language,
        timestamp: new Date(),
        stats: {
          originalLines,
          formattedLines,
          originalSize,
          formattedSize
        }
      }
      
      setFormatHistory(prev => [historyItem, ...prev.slice(0, 9)])
    } catch (error) {
      setError('Failed to format code. Please try again.')
    } finally {
      setIsFormatting(false)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const downloadCode = () => {
    if (!formattedCode) return

    const blob = new Blob([formattedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `formatted_code.${options.language}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const uploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setCode(content)
      setError(null)
    }
    reader.readAsText(file)
  }

  const clearAll = () => {
    setCode('')
    setFormattedCode('')
    setError(null)
  }

  const updateOption = (key: keyof FormattingOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const applyPreset = (preset: typeof defaultPresets[0]) => {
    setOptions(prev => ({ ...prev, ...preset.options }))
  }

  const getLanguageIcon = (language: string) => {
    const lang = supportedLanguages.find(l => l.value === language)
    return lang?.icon || '📝'
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-6 w-6" />
            Code Formatter
          </CardTitle>
          <CardDescription>
            Format and beautify code in multiple programming languages with customizable options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <select
                  value={options.language}
                  onChange={(e) => updateOption('language', e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  {supportedLanguages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.icon} {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Indent Size: {options.indentSize}</Label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={options.indentSize}
                  onChange={(e) => updateOption('indentSize', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Indent Type</Label>
                <div className="flex gap-2">
                  <Button
                    variant={options.indentType === 'spaces' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateOption('indentType', 'spaces')}
                    className="flex-1"
                  >
                    Spaces
                  </Button>
                  <Button
                    variant={options.indentType === 'tabs' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateOption('indentType', 'tabs')}
                    className="flex-1"
                  >
                    Tabs
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Max Line Length: {options.maxLineLength}</Label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={options.maxLineLength}
                  onChange={(e) => updateOption('maxLineLength', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground">0 = no limit</div>
              </div>

              <div className="space-y-3">
                <Label>Options</Label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.preserveNewlines}
                      onChange={(e) => updateOption('preserveNewlines', e.target.checked)}
                    />
                    <span className="text-sm">Preserve Newlines</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.trimTrailingWhitespace}
                      onChange={(e) => updateOption('trimTrailingWhitespace', e.target.checked)}
                    />
                    <span className="text-sm">Trim Trailing Whitespace</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.insertFinalNewline}
                      onChange={(e) => updateOption('insertFinalNewline', e.target.checked)}
                    />
                    <span className="text-sm">Insert Final Newline</span>
                  </label>
                </div>
              </div>

              {(options.language === 'javascript' || options.language === 'typescript') && (
                <div className="space-y-3">
                  <Label>JavaScript/TS Options</Label>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <span className="text-sm">Semicolons</span>
                      <div className="flex gap-1">
                        <Button
                          variant={options.semicolons === 'always' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateOption('semicolons', 'always')}
                          className="flex-1"
                        >
                          Always
                        </Button>
                        <Button
                          variant={options.semicolons === 'never' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateOption('semicolons', 'never')}
                          className="flex-1"
                        >
                          Never
                        </Button>
                        <Button
                          variant={options.semicolons === 'auto' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateOption('semicolons', 'auto')}
                          className="flex-1"
                        >
                          Auto
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm">Quotes</span>
                      <div className="flex gap-1">
                        <Button
                          variant={options.quotes === 'single' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateOption('quotes', 'single')}
                          className="flex-1"
                        >
                          Single
                        </Button>
                        <Button
                          variant={options.quotes === 'double' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateOption('quotes', 'double')}
                          className="flex-1"
                        >
                          Double
                        </Button>
                        <Button
                          variant={options.quotes === 'auto' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateOption('quotes', 'auto')}
                          className="flex-1"
                        >
                          Auto
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Presets</Label>
                <div className="grid grid-cols-2 gap-2">
                  {defaultPresets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset(preset)}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-4">
              <div className="flex gap-2">
                <Button onClick={handleFormat} disabled={isFormatting || !code.trim()} className="flex-1">
                  {isFormatting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Formatting...
                    </>
                  ) : (
                    <>
                      <Braces className="mr-2 h-4 w-4" />
                      Format Code
                    </>
                  )}
                </Button>
                
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </span>
                  </Button>
                </Label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".js,.ts,.py,.java,.css,.html,.json,.xml,.sql,.php,.rb,.go,.rs,.swift,.kt"
                  onChange={uploadFile}
                  className="hidden"
                />
                
                <Button variant="outline" size="sm" onClick={clearAll}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Original Code</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getLanguageIcon(options.language)} {options.language}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(code, 'original')}
                      >
                        {copied === 'original' ? '✓' : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={`Enter your ${options.language} code here...`}
                    className="min-h-[400px] font-mono text-sm resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Formatted Code</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Indent className="h-3 w-3 mr-1" />
                        Formatted
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(formattedCode, 'formatted')}
                      >
                        {copied === 'formatted' ? '✓' : <Copy className="h-3 w-3" />}
                      </Button>
                      {formattedCode && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={downloadCode}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <Textarea
                    value={formattedCode}
                    readOnly
                    placeholder="Formatted code will appear here..."
                    className="min-h-[400px] font-mono text-sm resize-none bg-muted"
                  />
                </div>
              </div>

              {formattedCode && formatHistory.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatHistory[0].stats.originalLines}
                        </div>
                        <div className="text-sm text-muted-foreground">Original Lines</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatHistory[0].stats.formattedLines}
                        </div>
                        <div className="text-sm text-muted-foreground">Formatted Lines</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatFileSize(formatHistory[0].stats.originalSize)}
                        </div>
                        <div className="text-sm text-muted-foreground">Original Size</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {formatFileSize(formatHistory[0].stats.formattedSize)}
                        </div>
                        <div className="text-sm text-muted-foreground">Formatted Size</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <Tabs defaultValue="history" className="w-full">
            <TabsList>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Formatting History</h3>
                {formatHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No formatting history yet</p>
                    <p className="text-sm text-muted-foreground">Your formatted code will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {formatHistory.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span>{getLanguageIcon(item.language)}</span>
                                <span className="font-medium">{item.language}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {item.timestamp.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {item.stats.originalLines} → {item.stats.formattedLines} lines • 
                                {formatFileSize(item.stats.originalSize)} → {formatFileSize(item.stats.formattedSize)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setCode(item.original)
                                  setFormattedCode(item.formatted)
                                }}
                              >
                                <WrapText className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(item.formatted, `history-${index}`)}
                              >
                                {copied === `history-${index}` ? '✓' : <Copy className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="examples" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Code Examples</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">JavaScript Function</div>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
{`function calculateSum(a, b) {
return a + b;
}`}
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setCode(`function calculateSum(a, b) {\nreturn a + b;\n}`)
                          updateOption('language', 'javascript')
                        }}
                      >
                        Use Example
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">Python Class</div>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
{`class Calculator:
def add(self, a, b):
return a + b`}
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setCode(`class Calculator:\n    def add(self, a, b):\n        return a + b`)
                          updateOption('language', 'python')
                        }}
                      >
                        Use Example
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">JSON Object</div>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
{`{"name":"John","age":30,"city":"New York"}`}
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setCode(`{"name":"John","age":30,"city":"New York"}`)
                          updateOption('language', 'json')
                        }}
                      >
                        Use Example
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">CSS Styles</div>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
{`.container{max-width:1200px;margin:0 auto}`}
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setCode(`.container{\nmax-width:1200px;\nmargin:0 auto\n}`)
                          updateOption('language', 'css')
                        }}
                      >
                        Use Example
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}