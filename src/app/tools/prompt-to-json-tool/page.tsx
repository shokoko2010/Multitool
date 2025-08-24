'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, FileText, Wand2, AlertCircle, CheckCircle } from 'lucide-react'

interface PromptTemplate {
  id: string
  name: string
  description: string
  prompt: string
}

export default function PromptToJSONTool() {
  const [inputPrompt, setInputPrompt] = useState('')
  const [outputJson, setOutputJson] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const promptTemplates: PromptTemplate[] = [
    {
      id: 'user-profile',
      name: 'User Profile',
      description: 'Generate structured user profile data',
      prompt: 'Extract user information from the following text and format it as JSON with fields: name, age, email, city, occupation, interests (array), and bio.'
    },
    {
      id: 'product-info',
      name: 'Product Information',
      description: 'Extract product details and specifications',
      prompt: 'Parse the following product description and create JSON with: productName, price, category, features (array), specifications (object), and availability.'
    },
    {
      id: 'event-details',
      name: 'Event Details',
      description: 'Extract event information and schedule',
      prompt: 'Convert the following event description to JSON containing: eventName, date, time, location, attendees (array), agenda (array of objects with time and activity), and contactInfo.'
    },
    {
      id: 'company-data',
      name: 'Company Data',
      description: 'Extract company and business information',
      prompt: 'Extract company information from the text and format as JSON with: companyName, industry, foundedYear, employees, headquarters, services (array), and keyMetrics (object).'
    },
    {
      id: 'recipe-data',
      name: 'Recipe Data',
      description: 'Parse recipe information into structured format',
      prompt: 'Convert the following recipe to JSON with: recipeName, prepTime, cookTime, servings, ingredients (array of objects with name and quantity), instructions (array of steps), and difficulty.'
    }
  ]

  const convertPromptToJson = useCallback(async () => {
    if (!inputPrompt.trim()) {
      setError('Please enter a prompt or text to convert')
      return
    }

    setIsProcessing(true)
    setError('')
    setSuccess('')

    try {
      let systemPrompt = selectedTemplate 
        ? promptTemplates.find(t => t.id === selectedTemplate)?.prompt || ''
        : 'Convert the following text into well-structured JSON format. Ensure the JSON is valid and properly formatted.'

      const fullPrompt = `${systemPrompt}\n\nText to convert:\n${inputPrompt}`

      const response = await fetch('/api/tools/prompt-to-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          systemPrompt: 'You are a helpful assistant that converts text to JSON. Always respond with valid JSON only, no additional text or explanations.'
        })
      })

      if (response.ok) {
        const data = await response.json()
        let jsonContent = data.jsonContent || ''
        
        // Clean up the response to ensure it's valid JSON
        jsonContent = jsonContent.trim()
        
        // Remove any markdown code block markers
        if (jsonContent.startsWith('```json')) {
          jsonContent = jsonContent.replace(/```json\n?/, '').replace(/\n?```$/, '')
        } else if (jsonContent.startsWith('```')) {
          jsonContent = jsonContent.replace(/```\n?/, '').replace(/\n?```$/, '')
        }

        // Validate JSON
        try {
          JSON.parse(jsonContent)
          setOutputJson(jsonContent)
          setSuccess('Successfully converted to JSON!')
        } catch (parseError) {
          setError('The response was not valid JSON. Please try again or modify your input.')
          console.error('JSON parse error:', parseError)
        }
      } else {
        setError('Failed to convert prompt to JSON. Please try again.')
      }

    } catch (apiError) {
      setError(`Error: ${apiError instanceof Error ? apiError.message : 'Failed to process request'}`)
      console.error('API error:', apiError)
    } finally {
      setIsProcessing(false)
    }
  }, [inputPrompt, selectedTemplate])

  const handleCopy = async () => {
    if (outputJson) {
      await navigator.clipboard.writeText(outputJson)
    }
  }

  const handleDownload = () => {
    if (outputJson) {
      const blob = new Blob([outputJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'converted-data.json'
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
        setInputPrompt(content)
      }
      reader.readAsText(file)
    }
  }

  const handleClear = () => {
    setInputPrompt('')
    setOutputJson('')
    setError('')
    setSuccess('')
    setSelectedTemplate('')
  }

  const applyTemplate = (templateId: string) => {
    const template = promptTemplates.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setInputPrompt(`Using template: ${template.name}\n\n${template.prompt}\n\nEnter your text here...`)
    }
  }

  const formatJson = () => {
    if (outputJson) {
      try {
        const parsed = JSON.parse(outputJson)
        const formatted = JSON.stringify(parsed, null, 2)
        setOutputJson(formatted)
      } catch (error) {
        setError('Invalid JSON format')
      }
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Prompt to JSON
          </CardTitle>
          <CardDescription>
            Convert natural language prompts and text into structured JSON format using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-select">Choose a Template (Optional)</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template or use custom prompt" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Custom Prompt</SelectItem>
                    {promptTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplate && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {promptTemplates.find(t => t.id === selectedTemplate)?.description}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="input-prompt">Input Text or Prompt</Label>
                <Textarea
                  id="input-prompt"
                  placeholder="Enter your text or prompt to convert to JSON..."
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={convertPromptToJson} 
                  disabled={isProcessing || !inputPrompt.trim()}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Convert to JSON
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
                <input
                  type="file"
                  accept=".txt,.md"
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
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Quick Templates</Label>
                <div className="space-y-2">
                  {promptTemplates.map(template => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplate(template.id)}
                      className="w-full justify-start text-left h-auto p-3"
                    >
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">{success}</span>
              </div>
            </div>
          )}

          {outputJson && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Generated JSON</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={formatJson}>
                    Format
                  </Button>
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
                value={outputJson}
                readOnly
                rows={12}
                className="font-mono text-sm resize-none"
              />
            </div>
          )}

          <div className="mt-6 space-y-4">
            <Tabs defaultValue="tips" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tips">Usage Tips</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
                <TabsTrigger value="formats">Supported Formats</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tips" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Tips for Better Results</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Be specific about the JSON structure you want</li>
                    <li>• Use templates for common data types</li>
                    <li>• Provide clear, well-organized input text</li>
                    <li>• Include examples of the desired output format</li>
                    <li>• For complex data, break it into smaller chunks</li>
                    <li>• Review and validate the generated JSON</li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="examples" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Example Prompts</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="font-medium">User Profile Example:</div>
                      <div className="text-muted-foreground">
                        "John Doe is a 28-year-old software engineer living in San Francisco. He enjoys hiking, photography, and cooking. His email is john.doe@email.com."
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Product Example:</div>
                      <div className="text-muted-foreground">
                        "The iPhone 15 Pro costs $999, features a titanium design, A17 Pro chip, and advanced camera system. Available in Space Black, Silver, Gold, and Deep Purple."
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="formats" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Supported Data Types</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="font-medium">Primitive Types:</div>
                      <ul className="text-muted-foreground">
                        <li>• String</li>
                        <li>• Number</li>
                        <li>• Boolean</li>
                        <li>• Null</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-medium">Complex Types:</div>
                      <ul className="text-muted-foreground">
                        <li>• Object</li>
                        <li>• Array</li>
                        <li>• Nested structures</li>
                        <li>• Mixed data types</li>
                      </ul>
                    </div>
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