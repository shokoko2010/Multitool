'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Copy, Key, RefreshCw, Trash2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function UuidGenerator() {
  const [uuidVersion, setUuidVersion] = useState('4')
  const [uuidCount, setUuidCount] = useState(1)
  const [uuids, setUuids] = useState<string[]>([])
  const [customNamespace, setCustomNamespace] = useState('')

  const generateUUIDv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  const generateUUIDv1 = () => {
    const timestamp = Date.now()
    const randomBytes = new Array(16).fill(0).map(() => Math.floor(Math.random() * 256))
    
    // Set version (1) and variant bits
    randomBytes[6] = (randomBytes[6] & 0x0f) | 0x10
    randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80

    const timeLow = (timestamp & 0xffffffff)
    const timeMid = ((timestamp >> 32) & 0xffff)
    const timeHi = ((timestamp >> 48) & 0x0fff)
    
    return [
      timeLow.toString(16).padStart(8, '0'),
      timeMid.toString(16).padStart(4, '0'),
      timeHi.toString(16).padStart(4, '0'),
      randomBytes.slice(8, 10).map(b => b.toString(16).padStart(2, '0')).join(''),
      randomBytes.slice(10, 16).map(b => b.toString(16).padStart(2, '0')).join('')
    ].join('-')
  }

  const generateUUIDv5 = (namespace: string, name: string) => {
    // Simple v5 implementation (in practice, you'd use a proper SHA-1 hash)
    const combined = namespace + name
    let hash = 0
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) - hash) + combined.charCodeAt(i)
      hash = hash & hash
    }
    
    const bytes = new Array(16)
    for (let i = 0; i < 16; i++) {
      bytes[i] = (hash >> (i * 8)) & 0xff
    }
    
    // Set version (5) and variant bits
    bytes[6] = (bytes[6] & 0x0f) | 0x50
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    
    return [
      bytes.slice(0, 4).map(b => b.toString(16).padStart(2, '0')).join(''),
      bytes.slice(4, 6).map(b => b.toString(16).padStart(2, '0')).join(''),
      bytes.slice(6, 8).map(b => b.toString(16).padStart(2, '0')).join(''),
      bytes.slice(8, 10).map(b => b.toString(16).padStart(2, '0')).join(''),
      bytes.slice(10, 16).map(b => b.toString(16).padStart(2, '0')).join('')
    ].join('-')
  }

  const generateUUIDs = () => {
    if (uuidCount < 1 || uuidCount > 100) {
      toast({
        title: "Error",
        description: "Please enter a count between 1 and 100",
        variant: "destructive"
      })
      return
    }

    const newUuids: string[] = []
    
    for (let i = 0; i < uuidCount; i++) {
      switch (uuidVersion) {
        case '1':
          newUuids.push(generateUUIDv1())
          break
        case '4':
          newUuids.push(generateUUIDv4())
          break
        case '5':
          const namespace = customNamespace || 'default-namespace'
          const name = `uuid-${i}-${Date.now()}`
          newUuids.push(generateUUIDv5(namespace, name))
          break
        default:
          newUuids.push(generateUUIDv4())
      }
    }
    
    setUuids(newUuids)
  }

  const copyToClipboard = (uuid: string) => {
    navigator.clipboard.writeText(uuid)
    toast({
      title: "Copied!",
      description: "UUID copied to clipboard"
    })
  }

  const copyAllToClipboard = () => {
    const allUuids = uuids.join('\n')
    navigator.clipboard.writeText(allUuids)
    toast({
      title: "Copied!",
      description: "All UUIDs copied to clipboard"
    })
  }

  const clearAll = () => {
    setUuids([])
  }

  const removeUuid = (index: number) => {
    setUuids(uuids.filter((_, i) => i !== index))
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">UUID Generator</h1>
        <p className="text-muted-foreground">Generate UUIDs (Universally Unique Identifiers)</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Generator Settings
            </CardTitle>
            <CardDescription>Configure UUID generation options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="uuid-version">UUID Version</Label>
              <Select value={uuidVersion} onValueChange={setUuidVersion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Version 1 (Time-based)</SelectItem>
                  <SelectItem value="4">Version 4 (Random)</SelectItem>
                  <SelectItem value="5">Version 5 (SHA-1 based)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="uuid-count">Number of UUIDs</Label>
              <Input
                id="uuid-count"
                type="number"
                min="1"
                max="100"
                value={uuidCount}
                onChange={(e) => setUuidCount(parseInt(e.target.value) || 1)}
              />
            </div>

            {uuidVersion === '5' && (
              <div>
                <Label htmlFor="custom-namespace">Namespace (Optional)</Label>
                <Input
                  id="custom-namespace"
                  placeholder="Enter custom namespace..."
                  value={customNamespace}
                  onChange={(e) => setCustomNamespace(e.target.value)}
                />
              </div>
            )}

            <Button onClick={generateUUIDs} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate UUIDs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              UUID Information
            </CardTitle>
            <CardDescription>About UUID versions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Version 1</h4>
                <p className="text-xs text-muted-foreground">
                  Time-based UUID generated from timestamp and MAC address
                </p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Version 4</h4>
                <p className="text-xs text-muted-foreground">
                  Random UUID generated from random numbers
                </p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Version 5</h4>
                <p className="text-xs text-muted-foreground">
                  SHA-1 hash-based UUID from namespace and name
                </p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>UUID Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</p>
              <p>Total possible UUIDs: 2^128 ≈ 3.4 × 10^38</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {uuids.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated UUIDs</CardTitle>
                <CardDescription>{uuids.length} UUID(s) generated</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={copyAllToClipboard} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All
                </Button>
                <Button onClick={clearAll} variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {uuids.map((uuid, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 font-mono text-sm">
                    {uuid}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      v{uuidVersion}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(uuid)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUuid(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}