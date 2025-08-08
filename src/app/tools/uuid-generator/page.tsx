'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, RefreshCw, Hash } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function UUIDGeneratorTool() {
  const [uuids, setUuids] = useState<string[]>([])
  const [uuidVersion, setUuidVersion] = useState('4')
  const [count, setCount] = useState(1)
  const { toast } = useToast()

  const generateUUID = (version: number = 4): string => {
    if (version === 4) {
      // Generate UUID v4
      const cryptoObj = window.crypto || (window as any).msCrypto
      const buffer = new Uint8Array(16)
      cryptoObj.getRandomValues(buffer)
      
      // Set version bits (4) and variant bits (8, 9, A, or B)
      buffer[6] = (buffer[6] & 0x0f) | 0x40
      buffer[8] = (buffer[8] & 0x3f) | 0x80
      
      const hex = Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('')
      return [
        hex.substr(0, 8),
        hex.substr(8, 4),
        hex.substr(12, 4),
        hex.substr(16, 4),
        hex.substr(20, 12)
      ].join('-')
    } else {
      // For other versions, generate a placeholder
      return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, () => {
        const r = Math.floor(Math.random() * 16)
        return r.toString(16)
      })
    }
  }

  const generateMultipleUUIDs = () => {
    const newUuids = []
    for (let i = 0; i < count; i++) {
      newUuids.push(generateUUID(parseInt(uuidVersion)))
    }
    setUuids(newUuids)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const copyAllToClipboard = () => {
    const allUuids = uuids.join('\n')
    navigator.clipboard.writeText(allUuids)
    toast({
      title: "Copied!",
      description: "All UUIDs copied to clipboard",
    })
  }

  const clearAll = () => {
    setUuids([])
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">UUID Generator</h1>
        <p className="text-muted-foreground">
          Generate UUIDs (Universally Unique Identifiers) for your applications
        </p>
      </div>

      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generator">Generator</TabsTrigger>
          <TabsTrigger value="info">Information</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generator" className="space-y-6">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Generator Settings
              </CardTitle>
              <CardDescription>
                Configure UUID generation options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>UUID Version</Label>
                  <select 
                    value={uuidVersion}
                    onChange={(e) => setUuidVersion(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="4">Version 4 (Random)</option>
                    <option value="1">Version 1 (Time-based)</option>
                    <option value="3">Version 3 (Name-based, MD5)</option>
                    <option value="5">Version 5 (Name-based, SHA-1)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Number of UUIDs</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <div className="flex gap-2">
                    <Button onClick={generateMultipleUUIDs} className="flex-1">
                      Generate UUIDs
                    </Button>
                    <Button onClick={clearAll} variant="outline">
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {uuids.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Generated UUIDs ({uuids.length})
                  </span>
                  <Button onClick={copyAllToClipboard} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </Button>
                </CardTitle>
                <CardDescription>
                  Click on any UUID to copy it individually
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {uuids.map((uuid, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg group">
                      <code className="font-mono text-sm select-all cursor-pointer hover:bg-muted/80 transition-colors p-2 rounded">
                        {uuid}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(uuid, `UUID #${index + 1}`)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Generate common UUID formats quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setUuidVersion('4')
                    setCount(1)
                    generateMultipleUUIDs()
                  }}
                >
                  Generate 1 UUID v4
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setUuidVersion('4')
                    setCount(5)
                    generateMultipleUUIDs()
                  }}
                >
                  Generate 5 UUIDs v4
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setUuidVersion('4')
                    setCount(10)
                    generateMultipleUUIDs()
                  }}
                >
                  Generate 10 UUIDs v4
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setUuidVersion('4')
                    setCount(25)
                    generateMultipleUUIDs()
                  }}
                >
                  Generate 25 UUIDs v4
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* UUID Versions */}
            <Card>
              <CardHeader>
                <CardTitle>UUID Versions</CardTitle>
                <CardDescription>
                  Different UUID versions and their purposes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="font-semibold">Version 1 (Time-based)</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Generated from the current time and a node identifier. Can be predictable and contains timing information.
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="font-semibold">Version 3 (Name-based, MD5)</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Generated from a namespace identifier and a name (MD5 hash). Same inputs always produce the same UUID.
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="font-semibold">Version 4 (Random)</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Generated using random or pseudo-random numbers. Most commonly used version. Cryptographically strong.
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="font-semibold">Version 5 (Name-based, SHA-1)</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Generated from a namespace identifier and a name (SHA-1 hash). Same inputs always produce the same UUID.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* UUID Format */}
            <Card>
              <CardHeader>
                <CardTitle>UUID Format</CardTitle>
                <CardDescription>
                  Structure and components of a UUID
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg font-mono text-sm">
                  8-4-4-4-12
                  <br />
                  <span className="text-muted-foreground">
                    xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span><strong>Time low (8 hex digits):</strong> Most significant 32 bits of the timestamp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span><strong>Time mid (4 hex digits):</strong> Next 16 bits of the timestamp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span><strong>Time high (4 hex digits):</strong> Least significant 12 bits of the timestamp + version</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span><strong>Clock sequence (4 hex digits):</strong> Clock sequence + variant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span><strong>Node (12 hex digits):</strong> Usually the MAC address</span>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p><strong>Total:</strong> 122 bits of data + 6 bits for version and variant information</p>
                  <p><strong>Total length:</strong> 36 characters (32 hex digits + 4 hyphens)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Use Cases */}
          <Card>
            <CardHeader>
              <CardTitle>Common Use Cases</CardTitle>
              <CardDescription>
                When and why to use UUIDs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Database Primary Keys', description: 'Generate unique IDs for database records without database sequences' },
                  { title: 'API Identifiers', description: 'Create unique resource identifiers for REST APIs' },
                  { title: 'Session Tokens', description: 'Generate unique session identifiers for user authentication' },
                  { title: 'File Names', description: 'Create unique filenames to avoid conflicts' },
                  { title: 'Distributed Systems', description: 'Generate unique IDs across multiple servers without coordination' },
                  { title: 'Cache Keys', description: 'Create unique keys for caching mechanisms' }
                ].map((useCase, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <div className="font-semibold">{useCase.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{useCase.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}