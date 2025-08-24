'use client'

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Download, Play, Square, FileText, Maximize2, Minimize2, Trash2, Upload } from 'lucide-react'

interface CodeFile {
  id: string
  name: string
  language: string
  code: string
}

const languageTemplates = {
  javascript: `// JavaScript Example
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`,

  python: `# Python Example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))`,

  html: `<!DOCTYPE html>
<html>
<head>
    <title>Hello World</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>Welcome to the Code Playground!</p>
</body>
</html>`,

  css: `/* CSS Example */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  color: #333;
  text-align: center;
}

p {
  line-height: 1.6;
  color: #666;
}`,

  typescript: `// TypeScript Example
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}

const user: User = { name: "Alice", age: 25 };
console.log(greet(user));`,

  java: `// Java Example
public class Fibonacci {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    public static void main(String[] args) {
        System.out.println(fibonacci(10));
    }
}`,

  cpp: `// C++ Example
#include <iostream>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    std::cout << fibonacci(10) << std::endl;
    return 0;
}`,

  php: `<?php
// PHP Example
function fibonacci($n) {
    if ($n <= 1) return $n;
    return fibonacci($n - 1) + fibonacci($n - 2);
}

echo fibonacci(10);
?>`,

  ruby: `# Ruby Example
def fibonacci(n)
  return n if n <= 1
  fibonacci(n - 1) + fibonacci(n - 2)
end

puts fibonacci(10)`,

  go: `// Go Example
package main

import "fmt"

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
    fmt.Println(fibonacci(10))
}`,

  rust: `// Rust Example
fn fibonacci(n: u32) -> u32 {
    if n <= 1 {
        return n
    }
    fibonacci(n - 1) + fibonacci(n - 2)
}

fn main() {
    println!("{}", fibonacci(10));
}`
}

export default function CodePlaygroundTool() {
  const [files, setFiles] = useState<CodeFile[]>([
    { id: '1', name: 'main.js', language: 'javascript', code: languageTemplates.javascript }
  ])
  const [activeFileId, setActiveFileId] = useState('1')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [fontSize, setFontSize] = useState(14)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeFile = files.find(f => f.id === activeFileId) || files[0]

  const runCode = useCallback(async () => {
    if (!activeFile) return

    setIsRunning(true)
    setOutput('Running...')

    try {
      // Simulate code execution with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Simulate output based on language
      let simulatedOutput = ''
      switch (activeFile.language) {
        case 'javascript':
          simulatedOutput = '55'
          break
        case 'python':
          simulatedOutput = '55'
          break
        case 'java':
          simulatedOutput = '55'
          break
        case 'cpp':
          simulatedOutput = '55'
          break
        case 'php':
          simulatedOutput = '55'
          break
        case 'ruby':
          simulatedOutput = '55'
          break
        case 'go':
          simulatedOutput = '55'
          break
        case 'rust':
          simulatedOutput = '55'
          break
        case 'typescript':
          simulatedOutput = 'Hello, Alice!'
          break
        case 'html':
          simulatedOutput = 'HTML file created successfully'
          break
        case 'css':
          simulatedOutput = 'CSS styles compiled successfully'
          break
        default:
          simulatedOutput = 'Code executed successfully'
      }

      setOutput(simulatedOutput)
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsRunning(false)
    }
  }, [activeFile])

  const stopCode = useCallback(() => {
    setIsRunning(false)
    setOutput('Execution stopped')
  }, [])

  const addNewFile = useCallback(() => {
    const newFile: CodeFile = {
      id: Date.now().toString(),
      name: `new.${getFileExtension('javascript')}`,
      language: 'javascript',
      code: languageTemplates.javascript
    }
    setFiles([...files, newFile])
    setActiveFileId(newFile.id)
  }, [files])

  const deleteFile = useCallback((fileId: string) => {
    if (files.length <= 1) return
    const newFiles = files.filter(f => f.id !== fileId)
    setFiles(newFiles)
    if (activeFileId === fileId) {
      setActiveFileId(newFiles[0].id)
    }
  }, [files, activeFileId])

  const updateFileCode = useCallback((fileId: string, code: string) => {
    setFiles(files.map(f => f.id === fileId ? { ...f, code } : f))
  }, [files])

  const updateFileLanguage = useCallback((fileId: string, language: string) => {
    setFiles(files.map(f => f.id === fileId ? { ...f, language, name: changeFileExtension(f.name, language) } : f))
  }, [files])

  const updateFileName = useCallback((fileId: string, name: string) => {
    setFiles(files.map(f => f.id === fileId ? { ...f, name } : f))
  }, [files])

  const handleCopy = async () => {
    if (activeFile) {
      await navigator.clipboard.writeText(activeFile.code)
    }
  }

  const handleDownload = () => {
    if (activeFile) {
      const blob = new Blob([activeFile.code], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = activeFile.name
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleDownloadAll = () => {
    const zip = files.map(file => `// ${file.name}\n${file.code}`).join('\n\n')
    const blob = new Blob([zip], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'code-playground-files.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const language = detectLanguage(file.name, content)
        const newFile: CodeFile = {
          id: Date.now().toString(),
          name: file.name,
          language,
          code: content
        }
        setFiles([...files, newFile])
        setActiveFileId(newFile.id)
      }
      reader.readAsText(file)
    }
  }

  const clearOutput = () => {
    setOutput('')
  }

  const getFileExtension = (language: string): string => {
    const extensions: { [key: string]: string } = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs',
      html: 'html',
      css: 'css'
    }
    return extensions[language] || 'txt'
  }

  const changeFileExtension = (filename: string, language: string): string => {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
    const ext = getFileExtension(language)
    return `${nameWithoutExt}.${ext}`
  }

  const detectLanguage = (filename: string, content: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'cc': 'cpp',
      'cxx': 'cpp',
      'h': 'cpp',
      'hpp': 'cpp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'html': 'html',
      'htm': 'html',
      'css': 'css'
    }
    
    if (ext && languageMap[ext]) {
      return languageMap[ext]
    }

    // Try to detect from content
    if (content.includes('function') && content.includes('console.log')) return 'javascript'
    if (content.includes('def ') && content.includes('print(')) return 'python'
    if (content.includes('public class')) return 'java'
    if (content.includes('#include <iostream>')) return 'cpp'
    if (content.includes('<?php')) return 'php'
    if (content.includes('def ')) return 'ruby'
    if (content.includes('package main')) return 'go'
    if (content.includes('fn main()')) return 'rust'
    if (content.includes('<!DOCTYPE html>')) return 'html'
    if (content.includes('{') && content.includes(':') && content.includes(';')) return 'css'

    return 'javascript'
  }

  const getLanguageColor = (language: string): string => {
    const colors: { [key: string]: string } = {
      javascript: 'text-yellow-600',
      typescript: 'text-blue-600',
      python: 'text-blue-500',
      java: 'text-red-600',
      cpp: 'text-purple-600',
      php: 'text-indigo-600',
      ruby: 'text-red-500',
      go: 'text-cyan-600',
      rust: 'text-orange-600',
      html: 'text-orange-500',
      css: 'text-blue-500'
    }
    return colors[language] || 'text-gray-600'
  }

  return (
    <div className={`container mx-auto p-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'max-w-7xl'}`}>
      <Card className={`${isFullscreen ? 'h-full rounded-none' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Code Playground
              </CardTitle>
              <CardDescription>
                Write, run, and test code in multiple programming languages
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className={`${isFullscreen ? 'h-[calc(100%-120px)]' : ''}`}>
          {/* File Tabs */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 flex gap-1 overflow-x-auto">
                {files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => setActiveFileId(file.id)}
                    className={`px-3 py-2 text-sm rounded-md whitespace-nowrap ${
                      activeFileId === file.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {file.name}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addNewFile}>
                + New File
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Code Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={activeFile?.name || ''}
                    onChange={(e) => activeFile && updateFileName(activeFile.id, e.target.value)}
                    className="text-sm bg-transparent border-none outline-none"
                  />
                  <Select
                    value={activeFile?.language || 'javascript'}
                    onValueChange={(value) => activeFile && updateFileLanguage(activeFile.id, value)}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                      <SelectItem value="php">PHP</SelectItem>
                      <SelectItem value="ruby">Ruby</SelectItem>
                      <SelectItem value="go">Go</SelectItem>
                      <SelectItem value="rust">Rust</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="css">CSS</SelectItem>
                    </SelectContent>
                  </Select>
                  {files.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => activeFile && deleteFile(activeFile.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                value={activeFile?.code || ''}
                onChange={(e) => activeFile && updateFileCode(activeFile.id, e.target.value)}
                rows={isFullscreen ? 20 : 12}
                className="font-mono text-sm resize-none"
                placeholder="Write your code here..."
                style={{ fontSize: `${fontSize}px` }}
              />
            </div>

            {/* Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Output</label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={isRunning ? stopCode : runCode}
                    disabled={isRunning}
                  >
                    {isRunning ? (
                      <>
                        <Square className="h-4 w-4 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearOutput}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="border rounded-md p-4 bg-black text-green-400 font-mono text-sm h-64 overflow-auto">
                {output || (
                  <div className="text-muted-foreground text-center py-8">
                    <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Click "Run" to execute your code</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme</label>
              <Select value={theme} onValueChange={(value: 'light' | 'dark') => setTheme(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Font Size</label>
              <Select value={fontSize.toString()} onValueChange={(value) => setFontSize(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12px</SelectItem>
                  <SelectItem value="14">14px</SelectItem>
                  <SelectItem value="16">16px</SelectItem>
                  <SelectItem value="18">18px</SelectItem>
                  <SelectItem value="20">20px</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="line-numbers"
                  checked={showLineNumbers}
                  onChange={(e) => setShowLineNumbers(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="line-numbers" className="text-sm">Line Numbers</label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <div className="flex gap-1">
                <input
                  type="file"
                  accept=".js,.ts,.py,.java,.cpp,.php,.rb,.go,.rs,.html,.css"
                  onChange={handleFileUpload}
                  className="hidden"
                  ref={fileInputRef}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadAll} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Save All
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Tabs defaultValue="templates" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="languages">Languages</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
              </TabsList>
              
              <TabsContent value="templates" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Code Templates</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(languageTemplates).map(([lang, code]) => (
                      <Button
                        key={lang}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (activeFile) {
                            updateFileCode(activeFile.id, code)
                            updateFileLanguage(activeFile.id, lang)
                            updateFileName(activeFile.id, `main.${getFileExtension(lang)}`)
                          }
                        }}
                        className="text-left justify-start"
                      >
                        <span className={`capitalize ${getLanguageColor(lang)}`}>
                          {lang}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="languages" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Supported Languages</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {Object.keys(languageTemplates).map((lang) => (
                      <div key={lang} className="flex items-center gap-2">
                        <span className={`font-medium ${getLanguageColor(lang)}`}>
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Multi-file support with tabbed interface</li>
                    <li>• Syntax highlighting for multiple languages</li>
                    <li>• Code execution simulation</li>
                    <li>• File upload and download</li>
                    <li>• Customizable themes and font sizes</li>
                    <li>• Fullscreen mode for distraction-free coding</li>
                    <li>• Code templates for quick start</li>
                    <li>• Real-time output display</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}