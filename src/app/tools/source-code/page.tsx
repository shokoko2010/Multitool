'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Globe, Download, Copy, Eye, Code } from 'lucide-react'

export default function GetSourceCode() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [sourceCode, setSourceCode] = useState('')
  const [error, setError] = useState('')
  const [stats, setStats] = useState<any>(null)

  const getSourceCode = async () => {
    if (!url) {
      setError('Please enter a URL')
      return
    }

    setLoading(true)
    setError('')
    setSourceCode('')

    try {
      // Validate URL
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
      
      // Simulate API call to fetch source code
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock HTML source code for demonstration
      const mockSourceCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Example Website</title>
    <meta name="description" content="A sample website for demonstration purposes">
    <link rel="stylesheet" href="styles.css">
    <script src="script.js"></script>
</head>
<body>
    <header>
        <nav>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section id="home">
            <h1>Welcome to Our Website</h1>
            <p>This is a sample website created for demonstration purposes.</p>
        </section>
        
        <section id="about">
            <h2>About Us</h2>
            <p>We are a company dedicated to providing excellent services.</p>
        </section>
        
        <section id="services">
            <h2>Our Services</h2>
            <ul>
                <li>Web Development</li>
                <li>Mobile App Development</li>
                <li>UI/UX Design</li>
                <li>Digital Marketing</li>
            </ul>
        </section>
        
        <section id="contact">
            <h2>Contact Us</h2>
            <form>
                <input type="text" placeholder="Your Name" required>
                <input type="email" placeholder="Your Email" required>
                <textarea placeholder="Your Message" rows="4" required></textarea>
                <button type="submit">Send Message</button>
            </form>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 Example Website. All rights reserved.</p>
    </footer>
</body>
</html>`

      // Calculate statistics
      const lines = mockSourceCode.split('\n').length
      const size = new Blob([mockSourceCode]).size
      const tags = (mockSourceCode.match(/<[^>]+>/g) || []).length
      const scripts = (mockSourceCode.match(/<script[^>]*>/g) || []).length
      const styles = (mockSourceCode.match(/<link[^>]*stylesheet|<style[^>]*>/g) || []).length
      const images = (mockSourceCode.match(/<img[^>]*>/g) || []).length

      setSourceCode(mockSourceCode)
      setStats({
        url: urlObj.href,
        lines,
        size: `${(size / 1024).toFixed(2)} KB`,
        tags,
        scripts,
        styles,
        images,
        loadTime: '1.2s',
        wordCount: mockSourceCode.split(/\s+/).length
      })
    } catch (err) {
      setError('Failed to fetch source code. Please check the URL and try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sourceCode)
  }

  const downloadSourceCode = () => {
    const blob = new Blob([sourceCode], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'source-code.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Get Source Code
          </CardTitle>
          <CardDescription>
            View and download the HTML source code of any website. 
            Analyze the structure, scripts, and styles used.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter URL (e.g., example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={getSourceCode} disabled={loading}>
              {loading ? 'Fetching...' : 'Get Source Code'}
            </Button>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.lines}</div>
                  <div className="text-xs text-muted-foreground">Lines</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.size}</div>
                  <div className="text-xs text-muted-foreground">File Size</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.tags}</div>
                  <div className="text-xs text-muted-foreground">HTML Tags</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.scripts}</div>
                  <div className="text-xs text-muted-foreground">Scripts</div>
                </CardContent>
              </Card>
            </div>
          )}

          {sourceCode && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
                <Button onClick={downloadSourceCode} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download HTML
                </Button>
              </div>

              <Tabs defaultValue="source" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="source">Source Code</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                </TabsList>
                
                <TabsContent value="source" className="space-y-4">
                  <div className="relative">
                    <Textarea
                      value={sourceCode}
                      readOnly
                      className="min-h-[400px] font-mono text-xs"
                    />
                    <Badge className="absolute top-2 right-2">
                      {stats?.size}
                    </Badge>
                  </div>
                </TabsContent>
                
                <TabsContent value="preview" className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-2 border-b">
                      <span className="text-sm text-gray-600">Website Preview</span>
                    </div>
                    <iframe
                      srcDoc={sourceCode}
                      className="w-full h-96 border-0"
                      title="Website Preview"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="analysis" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Content Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Word Count</span>
                          <span className="font-medium">{stats?.wordCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">HTML Tags</span>
                          <span className="font-medium">{stats?.tags}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Lines of Code</span>
                          <span className="font-medium">{stats?.lines}</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Resources</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">External Scripts</span>
                          <span className="font-medium">{stats?.scripts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Stylesheets</span>
                          <span className="font-medium">{stats?.styles}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Images</span>
                          <span className="font-medium">{stats?.images}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Load Time</span>
                        <span className="font-medium">{stats?.loadTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">File Size</span>
                        <span className="font-medium">{stats?.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">URL</span>
                        <span className="font-medium text-blue-600">{stats?.url}</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}