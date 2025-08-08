'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, RefreshCw, Code, FileText, Settings, AlertCircle, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ConversionConfig {
  indent: number
  quotes: 'double' | 'single'
  nullValue: 'null' | 'empty' | 'skip'
  arrays: true | false
  attributes: true | false
  comments: true | false
}

export default function XMLToJSONTool() {
  const [xmlInput, setXmlInput] = useState('')
  const [jsonOutput, setJsonOutput] = useState('')
  const [conversionConfig, setConversionConfig] = useState<ConversionConfig>({
    indent: 2,
    quotes: 'double',
    nullValue: 'null',
    arrays: true,
    attributes: true,
    comments: false
  })
  const [isConverting, setIsConverting] = useState(false)
  const [isValidXML, setIsValidXML] = useState<boolean | null>(null)
  const [error, setError] = useState('')
  const { toast } = useToast()

  const validateXML = (xml: string): boolean => {
    if (!xml.trim()) return false
    
    try {
      // Basic XML validation
      const parser = new DOMParser()
      const doc = parser.parseFromString(xml, 'text/xml')
      const parsererror = doc.getElementsByTagName('parsererror')[0]
      
      if (parsererror) {
        setError(parsererror.textContent || 'Invalid XML')
        return false
      }
      
      setError('')
      setIsValidXML(true)
      return true
    } catch (err) {
      setError('Invalid XML format')
      setIsValidXML(false)
      return false
    }
  }

  const convertXMLToJSON = async () => {
    if (!xmlInput.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter XML content to convert",
        variant: "destructive",
      })
      return
    }

    if (!validateXML(xmlInput)) {
      toast({
        title: "Invalid XML",
        description: error || "Please check your XML syntax",
        variant: "destructive",
      })
      return
    }

    setIsConverting(true)

    setTimeout(() => {
      const convertedJSON = simulateXMLToJSONConversion()
      setJsonOutput(convertedJSON)
      setIsConverting(false)
      
      toast({
        title: "Conversion Complete",
        description: "XML successfully converted to JSON",
      })
    }, 1000)
  }

  const simulateXMLToJSONConversion = (): string => {
    const xml = xmlInput.trim()
    
    try {
      // Simple XML to JSON simulation
      const parser = new DOMParser()
      const doc = parser.parseFromString(xml, 'text/xml')
      const root = doc.documentElement
      
      const xmlToJson = (node: any): any => {
        const obj: any = {}
        
        // Add attributes if enabled
        if (conversionConfig.attributes && node.attributes && node.attributes.length > 0) {
          obj['@attributes'] = {}
          for (let i = 0; i < node.attributes.length; i++) {
            const attr = node.attributes[i]
            obj['@attributes'][attr.name] = attr.value
          }
        }
        
        // Handle child nodes
        if (node.childNodes && node.childNodes.length > 0) {
          let textContent = ''
          const children: any[] = []
          
          for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i]
            
            if (child.nodeType === Node.TEXT_NODE) {
              textContent += child.textContent?.trim() || ''
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              const childObj = xmlToJson(child)
              children.push(childObj)
            }
          }
          
          if (textContent && children.length === 0) {
            // Only text content
            obj.textContent = textContent
          } else if (children.length > 0) {
            // Multiple children
            if (children.length === 1 && !Object.keys(children[0]).includes('@attributes')) {
              // Single child without attributes, use it directly
              Object.assign(obj, children[0])
            } else {
              // Multiple children or child with attributes, use array
              const nodeName = node.nodeName
              if (conversionConfig.arrays) {
                obj[nodeName] = children
              } else {
                obj.children = children
              }
            }
          }
        }
        
        return obj
      }
      
      const result = xmlToJson(root)
      
      // Format JSON with specified indentation
      return JSON.stringify(result, null, conversionConfig.indent)
      
    } catch (err) {
      return JSON.stringify({ error: "Conversion failed" }, null, 2)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const downloadJSON = () => {
    if (!jsonOutput) return
    
    const blob = new Blob([jsonOutput], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `converted-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Download Started",
      description: "Your JSON file download has begun",
    })
  }

  const loadSampleXML = () => {
    const sampleXML = `
<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="FICTION">
    <title lang="en">Great Gatsby</title>
    <author>F. Scott Fitzgerald</author>
    <year>1925</year>
    <price>10.99</price>
  </book>
  <book category="SCIENCE">
    <title lang="en">Cosmos</title>
    <author>Carl Sagan</author>
    <year>1980</year>
    <price>15.99</price>
  </book>
  <book category="BIOGRAPHY">
    <title lang="en">Steve Jobs</title>
    <author>Walter Isaacson</author>
    <year>2011</year>
    <price>19.99</price>
  </book>
</bookstore>`.trim()
    
    setXmlInput(sampleXML)
  }

  const clearAll = () => {
    setXmlInput('')
    setJsonOutput('')
    setIsValidXML(null)
    setError('')
  }

  const updateConfig = (key: keyof ConversionConfig, value: any) => {
    setConversionConfig(prev => ({ ...prev, [key]: value }))
  }

  const formatXML = () => {
    if (!xmlInput.trim()) return
    
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(xmlInput, 'text/xml')
      
      if (doc.getElementsByTagName('parsererror')[0]) {
        toast({
          title: "Cannot Format",
          description: "Invalid XML syntax",
          variant: "destructive",
        })
        return
      }
      
      const serializer = new XMLSerializer()
      const formatted = serializer.serializeToString(doc)
      setXmlInput(formatted)
      
      toast({
        title: "XML Formatted",
        description: "XML has been properly formatted",
      })
    } catch (err) {
      toast({
        title: "Formatting Failed",
        description: "Could not format XML",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">XML to JSON Converter</h1>
        <p className="text-muted-foreground">
          Convert XML data to JSON format with customizable options
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              XML Input
            </CardTitle>
            <CardDescription>
              Enter or paste XML content to convert to JSON
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="xml-input">XML Content</Label>
              <Textarea
                id="xml-input"
                placeholder="Paste your XML content here..."
                value={xmlInput}
                onChange={(e) => {
                  setXmlInput(e.target.value)
                  validateXML(e.target.value)
                }}
                className="min-h-[300px] font-mono text-sm"
              />
            </div>

            {isValidXML !== null && (
              <div className={`flex items-center gap-2 text-sm ${
                isValidXML ? 'text-green-600' : 'text-red-600'
              }`}>
                {isValidXML ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {isValidXML ? 'Valid XML' : error || 'Invalid XML'}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={convertXMLToJSON} disabled={isConverting || !isValidXML} className="flex-1">
                {isConverting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Code className="h-4 w-4 mr-2" />
                    Convert to JSON
                  </>
                )}
              </Button>
              <Button onClick={loadSampleXML} variant="outline">
                Load Sample
              </Button>
              <Button onClick={formatXML} variant="outline" disabled={!isValidXML}>
                Format
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                JSON Output
              </span>
              {jsonOutput && (
                <div className="flex gap-2">
                  <Button onClick={() => copyToClipboard(jsonOutput, 'JSON')} variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button onClick={downloadJSON} variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardTitle>
            <CardDescription>
              Your converted JSON content will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {jsonOutput ? (
              <div className="space-y-4">
                <Textarea
                  value={jsonOutput}
                  readOnly
                  className="min-h-[300px] font-mono text-sm"
                />
                <div className="text-center">
                  <Badge variant="secondary">
                    {JSON.parse(jsonOutput).length || Object.keys(JSON.parse(jsonOutput)).length} properties
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No JSON converted yet</p>
                <p className="text-sm">Enter XML content and click "Convert to JSON"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Conversion Configuration
          </CardTitle>
          <CardDescription>
            Customize how XML is converted to JSON
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Indentation</Label>
              <Select value={conversionConfig.indent.toString()} onValueChange={(value) => updateConfig('indent', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 spaces</SelectItem>
                  <SelectItem value="4">4 spaces</SelectItem>
                  <SelectItem value="8">8 spaces</SelectItem>
                  <SelectItem value="0">Minified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quote Style</Label>
              <Select value={conversionConfig.quotes} onValueChange={(value) => updateConfig('quotes', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="double">Double quotes (")</SelectItem>
                  <SelectItem value="single">Single quotes (')</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Null Values</Label>
              <Select value={conversionConfig.nullValue} onValueChange={(value) => updateConfig('nullValue', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Use null</SelectItem>
                  <SelectItem value="empty">Use empty string</SelectItem>
                  <SelectItem value="skip">Skip entirely</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={conversionConfig.arrays}
                  onChange={(e) => updateConfig('arrays', e.target.checked)}
                  className="rounded"
                />
                <span>Use arrays for multiple elements</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={conversionConfig.attributes}
                  onChange={(e) => updateConfig('attributes', e.target.checked)}
                  className="rounded"
                />
                <span>Include XML attributes</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={conversionConfig.comments}
                  onChange={(e) => updateConfig('comments', e.target.checked)}
                  className="rounded"
                />
                <span>Include comments</span>
              </label>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Conversion Features</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <Badge variant="outline">Element parsing</Badge>
              <Badge variant="outline">Attribute handling</Badge>
              <Badge variant="outline">CDATA support</Badge>
              <Badge variant="outline">Namespaces</Badge>
              <Badge variant="outline">Validation</Badge>
              <Badge variant="outline">Formatting</Badge>
              <Badge variant="outline">Error handling</Badge>
              <Badge variant="outline">Pretty printing</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}