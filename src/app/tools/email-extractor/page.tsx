'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Copy, Download, FileText, Upload, Trash2, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function EmailExtractor() {
  const [inputText, setInputText] = useState('')
  const [extractedEmails, setExtractedEmails] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const extractEmails = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to extract emails from",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    
    try {
      // Regular expression to match email addresses
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
      const emails = inputText.match(emailRegex) || []
      
      // Remove duplicates while preserving order
      const uniqueEmails = [...new Set(emails)]
      setExtractedEmails(uniqueEmails)
      
      toast({
        title: "Success",
        description: `Found ${uniqueEmails.length} email addresses`,
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract emails. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const extractFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setInputText(content)
    }
    reader.readAsText(file)
  }

  const clearAll = () => {
    setInputText('')
    setExtractedEmails([])
  }

  const copyEmails = () => {
    if (extractedEmails.length === 0) {
      toast({
        title: "No emails",
        description: "No emails to copy",
        variant: "destructive",
      })
      return
    }

    const emailsText = extractedEmails.join('\n')
    navigator.clipboard.writeText(emailsText)
    
    toast({
      title: "Copied!",
      description: `${extractedEmails.length} email addresses copied to clipboard`,
      variant: "default",
    })
  }

  const downloadEmails = () => {
    if (extractedEmails.length === 0) {
      toast({
        title: "No emails",
        description: "No emails to download",
        variant: "destructive",
      })
      return
    }

    const emailsText = extractedEmails.join('\n')
    const blob = new Blob([emailsText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'extracted-emails.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Downloaded!",
      description: "Email addresses downloaded successfully",
      variant: "default",
    })
  }

  const insertSampleText = () => {
    const sampleText = `Contact us at support@example.com or sales@company.com for inquiries.
For technical support, email tech@company.com.
Our CEO can be reached at ceo@company.com.
Marketing inquiries: marketing@company.com
General information: info@company.com
Please note that contact@business.org and admin@domain.net are also available.
Invalid emails: user@.com, @domain.com, user@domain.`
    
    setInputText(sampleText)
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  const getDomainFromEmail = (email: string): string => {
    return email.split('@')[1]
  }

  const domainCounts = extractedEmails.reduce((acc, email) => {
    const domain = getDomainFromEmail(email)
    acc[domain] = (acc[domain] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Email Extractor</h1>
          <p className="text-muted-foreground">Extract email addresses from text files, documents, or web content</p>
        </div>

        <div className="grid gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>Input Text</CardTitle>
              <CardDescription>Enter text or upload a file to extract email addresses from</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={insertSampleText} variant="outline" size="sm">
                  Insert Sample Text
                </Button>
                <Button onClick={clearAll} variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="file-upload">Upload Text File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".txt,.csv,.md"
                    onChange={extractFromFile}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium"
                  />
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Browse
                  </Button>
                </div>
              </div>
              
              <Textarea
                placeholder="Paste your text here or type to extract email addresses..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={6}
                className="resize-none"
              />
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Characters: {inputText.length} | Words: {inputText.trim() ? inputText.trim().split(/\s+/).length : 0}
                </div>
                <Button
                  onClick={extractEmails}
                  disabled={!inputText.trim() || isProcessing}
                  size="sm"
                >
                  {isProcessing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Extract Emails
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {extractedEmails.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Extracted Email Addresses</CardTitle>
                  <CardDescription>
                    Found {extractedEmails.length} unique email addresses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={copyEmails} variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy All
                    </Button>
                    <Button onClick={downloadEmails} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {extractedEmails.map((email, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div className="flex items-center gap-2">
                          <Badge variant={validateEmail(email) ? "default" : "destructive"}>
                            {validateEmail(email) ? "Valid" : "Invalid"}
                          </Badge>
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {email}
                          </code>
                        </div>
                        <Button
                          onClick={() => navigator.clipboard.writeText(email)}
                          variant="ghost"
                          size="sm"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Domain Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Domain Analysis</CardTitle>
                  <CardDescription>Email distribution by domain</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(domainCounts).map(([domain, count]) => (
                      <div key={domain} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <div className="font-medium">{domain}</div>
                          <div className="text-sm text-muted-foreground">{count} email(s)</div>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
              <CardDescription>Best practices for email extraction</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Paste text from documents, emails, or web pages</li>
                <li>• Upload .txt, .csv, or .md files for batch processing</li>
                <li>• The tool removes duplicate emails automatically</li>
                <li>• Invalid emails are marked for easy identification</li>
                <li>• Use the domain analysis to understand email distribution</li>
                <li>• Extracted emails can be copied or downloaded for further use</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}