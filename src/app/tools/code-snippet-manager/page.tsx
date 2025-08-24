'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Save, 
  Search, 
  Copy, 
  Edit, 
  Trash2, 
  Plus,
  Code,
  Tag,
  Calendar,
  Star,
  Download,
  Upload
} from 'lucide-react'

interface CodeSnippet {
  id: string
  title: string
  description: string
  code: string
  language: string
  tags: string[]
  category: string
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  usageCount: number
}

const languages = [
  'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'html', 'css', 'sql', 'json', 'xml', 'yaml', 'markdown'
]

const categories = [
  'Utility Functions', 'API Integration', 'Data Processing', 'UI Components', 'Algorithms', 'Database', 'Authentication', 'File Operations', 'Network', 'Testing', 'Configuration', 'Other'
]

const sampleSnippets: CodeSnippet[] = [
  {
    id: '1',
    title: 'Debounce Function',
    description: 'A utility function to debounce function calls',
    code: `function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Usage example
const debouncedSearch = debounce((searchTerm) => {
  console.log('Searching for:', searchTerm);
}, 300);`,
    language: 'javascript',
    tags: ['utility', 'performance', 'function'],
    category: 'Utility Functions',
    isFavorite: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    usageCount: 45
  },
  {
    id: '2',
    title: 'API Request Handler',
    description: 'Generic API request handler with error handling',
    code: `async function apiRequest(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Usage example
try {
  const data = await apiRequest('https://api.example.com/data');
  console.log(data);
} catch (error) {
  console.error('Failed to fetch data:', error);
}`,
    language: 'javascript',
    tags: ['api', 'http', 'async'],
    category: 'API Integration',
    isFavorite: false,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-12',
    usageCount: 32
  },
  {
    id: '3',
    title: 'Quick Sort Algorithm',
    description: 'Implementation of the quick sort algorithm',
    code: `function quickSort(arr) {
  if (arr.length <= 1) {
    return arr;
  }

  const pivot = arr[0];
  const left = [];
  const right = [];

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }

  return [...quickSort(left), pivot, ...quickSort(right)];
}

// Usage example
const numbers = [64, 34, 25, 12, 22, 11, 90];
console.log(quickSort(numbers)); // [11, 12, 22, 25, 34, 64, 90]`,
    language: 'javascript',
    tags: ['algorithm', 'sorting', 'performance'],
    category: 'Algorithms',
    isFavorite: true,
    createdAt: '2024-01-08',
    updatedAt: '2024-01-08',
    usageCount: 28
  }
]

export default function CodeSnippetManager() {
  const [snippets, setSnippets] = useState<CodeSnippet[]>(sampleSnippets)
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showFavorites, setShowFavorites] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editForm, setEditForm] = useState<Partial<CodeSnippet>>({})
  const [newSnippet, setNewSnippet] = useState<Partial<CodeSnippet>>({
    title: '',
    description: '',
    code: '',
    language: 'javascript',
    tags: [],
    category: 'Utility Functions',
    isFavorite: false
  })

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = searchTerm === '' || 
      snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesLanguage = selectedLanguage === 'all' || snippet.language === selectedLanguage
    const matchesCategory = selectedCategory === 'all' || snippet.category === selectedCategory
    const matchesFavorites = !showFavorites || snippet.isFavorite

    return matchesSearch && matchesLanguage && matchesCategory && matchesFavorites
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const toggleFavorite = (snippetId: string) => {
    setSnippets(prev => prev.map(snippet => 
      snippet.id === snippetId 
        ? { ...snippet, isFavorite: !snippet.isFavorite }
        : snippet
    ))
  }

  const deleteSnippet = (snippetId: string) => {
    setSnippets(prev => prev.filter(snippet => snippet.id !== snippetId))
    if (selectedSnippet?.id === snippetId) {
      setSelectedSnippet(null)
    }
  }

  const incrementUsage = (snippetId: string) => {
    setSnippets(prev => prev.map(snippet => 
      snippet.id === snippetId 
        ? { ...snippet, usageCount: snippet.usageCount + 1 }
        : snippet
    ))
  }

  const startEdit = (snippet: CodeSnippet) => {
    setEditForm(snippet)
    setIsEditing(true)
  }

  const saveEdit = () => {
    if (editForm.id && editForm.title && editForm.code) {
      setSnippets(prev => prev.map(snippet => 
        snippet.id === editForm.id 
          ? { 
              ...snippet, 
              ...editForm, 
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : snippet
      ))
      setIsEditing(false)
      setEditForm({})
    }
  }

  const createSnippet = () => {
    if (newSnippet.title && newSnippet.code) {
      const snippet: CodeSnippet = {
        id: Math.random().toString(36).substring(7),
        title: newSnippet.title || '',
        description: newSnippet.description || '',
        code: newSnippet.code || '',
        language: newSnippet.language || 'javascript',
        tags: newSnippet.tags || [],
        category: newSnippet.category || 'Utility Functions',
        isFavorite: newSnippet.isFavorite || false,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        usageCount: 0
      }
      setSnippets(prev => [...prev, snippet])
      setNewSnippet({
        title: '',
        description: '',
        code: '',
        language: 'javascript',
        tags: [],
        category: 'Utility Functions',
        isFavorite: false
      })
    }
  }

  const exportSnippets = () => {
    const data = {
      snippets,
      exportTime: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `code_snippets_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importSnippets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          if (data.snippets && Array.isArray(data.snippets)) {
            setSnippets(prev => [...prev, ...data.snippets])
          }
        } catch (error) {
          console.error('Failed to import snippets:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Code Snippet Manager</h1>
        <p className="text-muted-foreground">
          Organize, manage, and reuse your code snippets efficiently
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Snippet Library
            </CardTitle>
            <CardDescription>
              Browse and manage your code snippets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Snippets</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, description, or tags..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    {languages.map(lang => (
                      <SelectItem key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={showFavorites ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFavorites(!showFavorites)}
              >
                <Star className={`h-4 w-4 mr-2 ${showFavorites ? 'fill-current' : ''}`} />
                Favorites
              </Button>
              <div className="text-sm text-muted-foreground">
                {filteredSnippets.length} snippet{filteredSnippets.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredSnippets.map(snippet => (
                <div
                  key={snippet.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                    selectedSnippet?.id === snippet.id ? 'bg-muted border-primary' : ''
                  }`}
                  onClick={() => setSelectedSnippet(snippet)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{snippet.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {snippet.description}
                      </p>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(snippet.id)
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      <Star className={`h-4 w-4 ${snippet.isFavorite ? 'fill-current text-yellow-500' : ''}`} />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">
                        {snippet.language}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {snippet.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(snippet.updatedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    New Snippet
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Snippet</DialogTitle>
                    <DialogDescription>
                      Add a new code snippet to your library
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={newSnippet.title || ''}
                          onChange={(e) => setNewSnippet(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Snippet title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select 
                          value={newSnippet.language} 
                          onValueChange={(value) => setNewSnippet(prev => ({ ...prev, language: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map(lang => (
                              <SelectItem key={lang} value={lang}>
                                {lang.charAt(0).toUpperCase() + lang.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={newSnippet.description || ''}
                        onChange={(e) => setNewSnippet(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={newSnippet.category} 
                        onValueChange={(value) => setNewSnippet(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">Code</Label>
                      <Textarea
                        id="code"
                        value={newSnippet.code || ''}
                        onChange={(e) => setNewSnippet(prev => ({ ...prev, code: e.target.value }))}
                        placeholder="Your code here..."
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>
                    <Button onClick={createSnippet} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Create Snippet
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={exportSnippets} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={importSnippets}
                  className="hidden"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Snippet Details</CardTitle>
            <CardDescription>
              {selectedSnippet ? selectedSnippet.title : 'Select a snippet to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedSnippet ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{selectedSnippet.title}</h3>
                    <p className="text-muted-foreground">{selectedSnippet.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => toggleFavorite(selectedSnippet.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Star className={`h-4 w-4 ${selectedSnippet.isFavorite ? 'fill-current text-yellow-500' : ''}`} />
                    </Button>
                    <Button
                      onClick={() => startEdit(selectedSnippet)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => deleteSnippet(selectedSnippet.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Badge variant="outline">{selectedSnippet.language}</Badge>
                  <Badge variant="secondary">{selectedSnippet.category}</Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(selectedSnippet.updatedAt)}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    {selectedSnippet.usageCount} uses
                  </div>
                </div>

                {selectedSnippet.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedSnippet.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Code</Label>
                    <Button
                      onClick={() => {
                        copyToClipboard(selectedSnippet.code)
                        incrementUsage(selectedSnippet.id)
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy & Use
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm font-mono">{selectedSnippet.code}</code>
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Select a snippet from the library to view its details
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isEditing && editForm.id && (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Snippet</DialogTitle>
              <DialogDescription>
                Modify the selected code snippet
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-language">Language</Label>
                  <Select 
                    value={editForm.language} 
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => (
                        <SelectItem key={lang} value={lang}>
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-code">Code</Label>
                <Textarea
                  id="edit-code"
                  value={editForm.code || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, code: e.target.value }))}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveEdit} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}