'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Copy, Download, RefreshCw, ExternalLink, CheckCircle, Globe, FileText, Image, Video, Article, Person, Organization, Product } from 'lucide-react'
import { toast } from 'sonner'

interface StructuredDataConfig {
  type: string
  title: string
  description: string
  author: string
  publisher: string
  url: string
  image: string
  datePublished: string
  dateModified: string
  logo: string
  price: string
  currency: string
  availability: string
  rating: string
  reviewCount: string
  videoUrl: string
  duration: string
  uploadDate: string
}

const SCHEMA_TYPES = [
  { value: 'article', label: 'Article', icon: FileText },
  { value: 'blog', label: 'Blog Post', icon: FileText },
  { value: 'news', label: 'News Article', icon: FileText },
  { value: 'product', label: 'Product', icon: Product },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'person', label: 'Person', icon: Person },
  { value: 'organization', label: 'Organization', icon: Organization },
  { value: 'website', label: 'Website', icon: Globe },
  { value: 'localbusiness', label: 'Local Business', icon: Organization },
  { value: 'recipe', label: 'Recipe', icon: FileText }
]

const AVAILABILITY_OPTIONS = [
  { value: 'https://schema.org/InStock', label: 'In Stock' },
  { value: 'https://schema.org/OutOfStock', label: 'Out of Stock' },
  { value: 'https://schema.org/PreOrder', label: 'Pre Order' },
  { value: 'https://schema.org/Discontinued', label: 'Discontinued' }
]

export default function StructuredDataGenerator() {
  const [selectedType, setSelectedType] = useState('article')
  const [formData, setFormData] = useState<StructuredDataConfig>({
    type: 'article',
    title: '',
    description: '',
    author: '',
    publisher: '',
    url: '',
    image: '',
    datePublished: '',
    dateModified: '',
    logo: '',
    price: '',
    currency: 'USD',
    availability: 'https://schema.org/InStock',
    rating: '',
    reviewCount: '',
    videoUrl: '',
    duration: '',
    uploadDate: ''
  })
  
  const [generatedSchema, setGeneratedSchema] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleInputChange = (field: keyof StructuredDataConfig, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateSchema = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title')
      return
    }

    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      let schema: any = {
        '@context': 'https://schema.org',
        '@type': formData.type
      }

      // Common properties for all types
      if (formData.title) schema.name = formData.title
      if (formData.description) schema.description = formData.description
      if (formData.url) schema.url = formData.url
      if (formData.image) schema.image = formData.image

      // Type-specific properties
      switch (formData.type) {
        case 'article':
        case 'blog':
        case 'news':
          if (formData.author) schema.author = {
            '@type': 'Person',
            name: formData.author
          }
          if (formData.publisher) schema.publisher = {
            '@type': 'Organization',
            name: formData.publisher,
            logo: formData.logo || {
              '@type': 'ImageObject',
              url: formData.logo || formData.image
            }
          }
          if (formData.datePublished) schema.datePublished = formData.datePublished
          if (formData.dateModified) schema.dateModified = formData.dateModified
          break

        case 'product':
          if (formData.price) schema.offers = {
            '@type': 'Offer',
            price: formData.price,
            priceCurrency: formData.currency,
            availability: formData.availability
          }
          if (formData.rating) schema.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: formData.rating,
            reviewCount: formData.reviewCount || '0'
          }
          break

        case 'video':
          if (formData.uploadDate) schema.uploadDate = formData.uploadDate
          if (formData.duration) schema.duration = formData.duration
          if (formData.thumbnailUrl) schema.thumbnailUrl = formData.thumbnailUrl
          break

        case 'person':
          if (formData.jobTitle) schema.jobTitle = formData.jobTitle
          if (formData.worksFor) schema.worksFor = {
            '@type': 'Organization',
            name: formData.worksFor
          }
          break

        case 'organization':
          if (formData.logo) schema.logo = {
            '@type': 'ImageObject',
            url: formData.logo
          }
          break

        case 'recipe':
          if (formData.recipeInstructions) schema.recipeInstructions = formData.recipeInstructions
          if (formData.recipeIngredient) schema.recipeIngredient = formData.recipeIngredient
          if (formData.cookTime) schema.cookTime = formData.cookTime
          if (formData.prepTime) schema.prepTime = formData.prepTime
          break
      }

      const schemaString = JSON.stringify(schema, null, 2)
      setGeneratedSchema(schemaString)
      toast.success('Structured data generated successfully!')
    } catch (error) {
      toast.error('Failed to generate structured data')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const downloadAsFile = () => {
    const blob = new Blob([generatedSchema], { type: 'application/ld+json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `structured-data-${formData.type}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Structured data downloaded!')
  }

  const previewSchema = () => {
    const previewWindow = window.open('', '_blank')
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Structured Data Preview</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .schema-preview { background: #f8f9fa; padding: 20px; border-radius: 8px; }
            .json-viewer { background: #2d3748; color: #e2e8f0; padding: 20px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 14px; white-space: pre-wrap; overflow-x: auto; }
          </style>
        </head>
        <body>
          <h1>Structured Data Preview</h1>
          <div class="schema-preview">
            <h2>JSON-LD Structured Data</h2>
            <div class="json-viewer">${JSON.stringify(JSON.parse(generatedSchema), null, 2)}</div>
          </div>
        </body>
        </html>
      `)
      previewWindow.document.close()
    }
  }

  const renderTypeSpecificFields = () => {
    switch (selectedType) {
      case 'article':
      case 'blog':
      case 'news':
        return (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Author</label>
                <Input
                  placeholder="Author name"
                  value={formData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Publisher</label>
                <Input
                  placeholder="Publisher name"
                  value={formData.publisher}
                  onChange={(e) => handleInputChange('publisher', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Date Published</label>
                <Input
                  type="date"
                  value={formData.datePublished}
                  onChange={(e) => handleInputChange('datePublished', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Date Modified</label>
                <Input
                  type="date"
                  value={formData.dateModified}
                  onChange={(e) => handleInputChange('dateModified', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Publisher Logo URL</label>
                <Input
                  placeholder="https://example.com/logo.png"
                  value={formData.logo}
                  onChange={(e) => handleInputChange('logo', e.target.value)}
                />
              </div>
            </div>
          </>
        )

      case 'product':
        return (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Price</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="29.99"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Currency</label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="AUD">AUD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Availability</label>
                <Select value={formData.availability} onValueChange={(value) => handleInputChange('availability', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABILITY_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Rating (1-5)</label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  placeholder="4.5"
                  value={formData.rating}
                  onChange={(e) => handleInputChange('rating', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Review Count</label>
                <Input
                  type="number"
                  placeholder="125"
                  value={formData.reviewCount}
                  onChange={(e) => handleInputChange('reviewCount', e.target.value)}
                />
              </div>
            </div>
          </>
        )

      case 'video':
        return (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Video URL</label>
                <Input
                  placeholder="https://example.com/video.mp4"
                  value={formData.videoUrl}
                  onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Duration (PT format)</label>
                <Input
                  placeholder="PT5M30S"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Upload Date</label>
                <Input
                  type="date"
                  value={formData.uploadDate}
                  onChange={(e) => handleInputChange('uploadDate', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Thumbnail URL</label>
                <Input
                  placeholder="https://example.com/thumbnail.jpg"
                  value={formData.thumbnailUrl || ''}
                  onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
                />
              </div>
            </div>
          </>
        )

      case 'person':
        return (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Job Title</label>
                <Input
                  placeholder="Software Engineer"
                  value={formData.jobTitle || ''}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Works For</label>
                <Input
                  placeholder="Company Name"
                  value={formData.worksFor || ''}
                  onChange={(e) => handleInputChange('worksFor', e.target.value)}
                />
              </div>
            </div>
          </>
        )

      case 'organization':
        return (
          <div>
            <label className="text-sm font-medium mb-2 block">Logo URL</label>
            <Input
              placeholder="https://example.com/logo.png"
              value={formData.logo}
              onChange={(e) => handleInputChange('logo', e.target.value)}
            />
          </div>
        )

      case 'recipe':
        return (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Recipe Instructions (one per line)</label>
                <Textarea
                  placeholder="1. Preheat oven to 350°F&#10;2. Mix ingredients&#10;3. Bake for 30 minutes"
                  value={formData.recipeInstructions || ''}
                  onChange={(e) => handleInputChange('recipeInstructions', e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Recipe Ingredients (one per line)</label>
                <Textarea
                  placeholder="2 cups flour&#10;1 cup sugar&#10;3 eggs"
                  value={formData.recipeIngredient || ''}
                  onChange={(e) => handleInputChange('recipeIngredient', e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Prep Time (PT format)</label>
                <Input
                  placeholder="PT15M"
                  value={formData.prepTime || ''}
                  onChange={(e) => handleInputChange('prepTime', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Cook Time (PT format)</label>
                <Input
                  placeholder="PT30M"
                  value={formData.cookTime || ''}
                  onChange={(e) => handleInputChange('cookTime', e.target.value)}
                />
              </div>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Structured Data Generator</h1>
        <p className="text-muted-foreground">
          Generate JSON-LD structured data for better search engine visibility
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Schema Type Selection</CardTitle>
            <CardDescription>Choose the type of structured data you want to generate</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCHEMA_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential information for all structured data types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Title *</label>
                <Input
                  placeholder="Enter your title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">URL</label>
                <Input
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Enter a brief description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Image URL</label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedType && (
          <Card>
            <CardHeader>
              <CardTitle>{SCHEMA_TYPES.find(t => t.value === selectedType)?.label} Specific Fields</CardTitle>
              <CardDescription>Additional fields specific to {selectedType} structured data</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTypeSpecificFields()}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Generate Structured Data</CardTitle>
            <CardDescription>Click the button to generate JSON-LD structured data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={generateSchema}
              disabled={isGenerating || !formData.title.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Structured Data...
                </>
              ) : (
                'Generate Structured Data'
              )}
            </Button>
          </CardContent>
        </Card>

        {generatedSchema && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Structured Data</CardTitle>
              <CardDescription>Your JSON-LD structured data will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    JSON-LD Schema Generated
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={previewSchema}
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button 
                      onClick={() => copyToClipboard(generatedSchema)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button 
                      onClick={downloadAsFile}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    {generatedSchema}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Structured Data Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">JSON-LD</div>
                <div className="text-sm mt-2">Use JSON-LD format for best SEO results</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">Rich Results</div>
                <div className="text-sm mt-2">Improve chances of rich results in search</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">Validation</div>
                <div className="text-sm mt-2">Always validate your structured data</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">Testing</div>
                <div className="text-sm mt-2">Test with Google's Rich Results Test</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}