'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Copy, Download, FileText, Code, AlertCircle } from 'lucide-react'

export default function XmlToJsonConverterTool() {
  const [inputXml, setInputXml] = useState('')
  const [outputJson, setOutputJson] = useState('')
  const [conversionMode, setConversionMode] = useState<'standard' | 'attributes' | 'compact'>('standard')
  const [includeAttributes, setIncludeAttributes] = useState(true)
  const [preserveWhitespace, setPreserveWhitespace] = useState(false)
  const [error, setError] = useState('')

  const convertXmlToJson = useCallback(() => {
    if (!inputXml.trim()) {
      setError('Please enter XML data to convert')
      return
    }

    try {
      const jsonData = parseXml(inputXml, conversionMode, includeAttributes, preserveWhitespace)
      const jsonString = JSON.stringify(jsonData, null, 2)
      setOutputJson(jsonString)
      setError('')
    } catch (parseError) {
      setError(`Conversion error: ${parseError instanceof Error ? parseError.message : 'Parse error'}`)
    }
  }, [inputXml, conversionMode, includeAttributes, preserveWhitespace])

  const parseXml = (xml: string, mode: 'standard' | 'attributes' | 'compact', includeAttrs: boolean, preserveWs: boolean): any => {
    // Remove XML declaration and comments for cleaner parsing
    let cleanXml = xml.replace(/<\?xml[^>]*\?>/g, '').replace(/<!--.*?-->/gs, '')
    
    if (!preserveWs) {
      cleanXml = cleanXml.replace(/\s+/g, ' ').trim()
    }

    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(cleanXml, 'text/xml')
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror')
    if (parseError) {
      throw new Error('Invalid XML: ' + parseError.textContent)
    }

    const rootElement = xmlDoc.documentElement
    return convertNode(rootElement, mode, includeAttrs)
  }

  const convertNode = (node: Node, mode: 'standard' | 'attributes' | 'compact', includeAttrs: boolean): any => {
    if (node.nodeType === Node.TEXT_NODE) {
      const textContent = node.textContent?.trim()
      return textContent || null
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      const result: any = {}

      // Handle attributes
      if (includeAttrs && element.attributes.length > 0) {
        if (mode === 'attributes') {
          result['@attributes'] = {}
          for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i]
            result['@attributes'][attr.name] = attr.value
          }
        } else {
          for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i]
            result[`@${attr.name}`] = attr.value
          }
        }
      }

      // Handle child nodes
      const children = Array.from(element.childNodes)
      const childElements = children.filter(child => child.nodeType === Node.ELEMENT_NODE)
      const textNodes = children.filter(child => child.nodeType === Node.TEXT_NODE)

      // Handle mixed content (text + elements)
      const hasTextContent = textNodes.some(node => node.textContent?.trim())
      const hasElementContent = childElements.length > 0

      if (hasTextContent && !hasElementContent) {
        // Only text content
        const textContent = element.textContent?.trim()
        if (textContent) {
          if (Object.keys(result).length === 0) {
            return textContent
          } else {
            result['#text'] = textContent
          }
        }
      } else if (hasElementContent) {
        // Handle child elements
        const childMap: { [key: string]: any[] } = {}

        childElements.forEach(child => {
          const childName = child.nodeName
          const childResult = convertNode(child, mode, includeAttrs)

          if (!childMap[childName]) {
            childMap[childName] = []
          }
          childMap[childName].push(childResult)
        })

        // Convert arrays to single objects if only one child of that type
        Object.keys(childMap).forEach(key => {
          if (childMap[key].length === 1) {
            result[key] = childMap[key][0]
          } else {
            result[key] = childMap[key]
          }
        })

        // Add text content if present (mixed content)
        if (hasTextContent) {
          const textContent = element.textContent?.trim()
          if (textContent) {
            result['#text'] = textContent
          }
        }
      }

      // Handle empty elements
      if (Object.keys(result).length === 0) {
        return null
      }

      // Compact mode: flatten single key objects
      if (mode === 'compact' && Object.keys(result).length === 1) {
        const onlyKey = Object.keys(result)[0]
        if (!onlyKey.startsWith('@') && onlyKey !== '#text') {
          return result[onlyKey]
        }
      }

      return result
    }

    return null
  }

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
        setInputXml(content)
      }
      reader.readAsText(file)
    }
  }

  const handleClear = () => {
    setInputXml('')
    setOutputJson('')
    setError('')
  }

  const getSampleData = () => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="fiction" id="b001">
    <title lang="en">The Great Gatsby</title>
    <author>F. Scott Fitzgerald</author>
    <year>1925</year>
    <price>12.99</price>
    <available>true</available>
  </book>
  <book category="non-fiction" id="b002">
    <title lang="en">To Kill a Mockingbird</title>
    <author>Harper Lee</author>
    <year>1960</year>
    <price>14.99</price>
    <available>true</available>
  </book>
</bookstore>`
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            XML to JSON Converter
          </CardTitle>
          <CardDescription>
            Convert XML data to JSON format with customizable conversion options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="xml-input">XML Input</Label>
                <Textarea
                  id="xml-input"
                  placeholder="Enter XML data to convert to JSON..."
                  value={inputXml}
                  onChange={(e) => setInputXml(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Conversion Mode</Label>
                  <Select value={conversionMode} onValueChange={(value: 'standard' | 'attributes' | 'compact') => setConversionMode(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="attributes">Attributes Group</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-attributes"
                      checked={includeAttributes}
                      onCheckedChange={(checked) => setIncludeAttributes(checked as boolean)}
                    />
                    <Label htmlFor="include-attributes">Include Attributes</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="preserve-whitespace"
                      checked={preserveWhitespace}
                      onCheckedChange={(checked) => setPreserveWhitespace(checked as boolean)}
                    />
                    <Label htmlFor="preserve-whitespace">Preserve Whitespace</Label>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={convertXmlToJson} disabled={!inputXml.trim()}>
                  <Code className="h-4 w-4 mr-2" />
                  Convert to JSON
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
                <Button variant="outline" onClick={() => setInputXml(getSampleData())}>
                  Load Sample
                </Button>
                <div className="flex-1" />
                <input
                  type="file"
                  accept=".xml"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Upload XML
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Conversion Modes</Label>
                <div className="p-3 bg-muted rounded-lg text-sm space-y-2">
                  <div>
                    <div className="font-medium">Standard:</div>
                    <div className="text-muted-foreground">Attributes prefixed with @</div>
                  </div>
                  <div>
                    <div className="font-medium">Attributes:</div>
                    <div className="text-muted-foreground">Grouped in @attributes object</div>
                  </div>
                  <div>
                    <div className="font-medium">Compact:</div>
                    <div className="text-muted-foreground">Flatten single child elements</div>
                  </div>
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

          {outputJson && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">JSON Output</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download JSON
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
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">About XML to JSON Conversion</h4>
              <p className="text-sm text-muted-foreground mb-2">
                This tool converts XML (eXtensible Markup Language) data to JSON format. 
                XML is a markup language designed to store and transport data, while JSON 
                provides a more lightweight and flexible data interchange format.
              </p>
              <p className="text-sm text-muted-foreground">
                The conversion preserves the hierarchical structure of XML, handles attributes 
                appropriately, and maintains text content. Different conversion modes allow 
                you to customize how the JSON structure is generated.
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Conversion Examples</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-medium">XML Input:</div>
                  <div className="text-muted-foreground font-mono text-xs">
                    {'<book id="b001" category="fiction">Title</book>'}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Standard Mode:</div>
                  <div className="text-muted-foreground font-mono text-xs">
                    {'{"book": {"@id": "b001", "@category": "fiction", "#text": "Title"}}'}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Attributes Mode:</div>
                  <div className="text-muted-foreground font-mono text-xs">
                    {'{"book": {"@attributes": {"id": "b001", "category": "fiction"}, "#text": "Title"}}'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}