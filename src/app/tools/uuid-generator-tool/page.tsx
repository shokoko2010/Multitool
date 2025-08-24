'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Download, Hash, RefreshCw } from 'lucide-react'

export default function UUIDGeneratorTool() {
  const [uuids, setUuids] = useState<string[]>([])
  const [count, setCount] = useState(1)
  const [version, setVersion] = useState<'v4'>('v4')
  const [format, setFormat] = useState<'standard' | 'uppercase' | 'no-dashes'>('standard')

  const generateUUID = useCallback(() => {
    const newUuids: string[] = []
    
    for (let i = 0; i < count; i++) {
      const uuid = crypto.randomUUID()
      let formattedUuid = uuid

      switch (format) {
        case 'uppercase':
          formattedUuid = uuid.toUpperCase()
          break
        case 'no-dashes':
          formattedUuid = uuid.replace(/-/g, '')
          break
        default:
          formattedUuid = uuid
      }

      newUuids.push(formattedUuid)
    }

    setUuids(newUuids)
  }, [count, format])

  const handleCopy = async (uuid: string) => {
    await navigator.clipboard.writeText(uuid)
  }

  const handleCopyAll = async () => {
    if (uuids.length > 0) {
      await navigator.clipboard.writeText(uuids.join('\n'))
    }
  }

  const handleDownload = () => {
    if (uuids.length > 0) {
      const blob = new Blob([uuids.join('\n')], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'uuids.txt'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleClear = () => {
    setUuids([])
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            UUID Generator
          </CardTitle>
          <CardDescription>
            Generate universally unique identifiers (UUIDs) for various use cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="count">Number of UUIDs</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Version</Label>
              <Select value={version} onValueChange={(value: 'v4') => setVersion(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v4">Version 4 (Random)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={format} onValueChange={(value: 'standard' | 'uppercase' | 'no-dashes') => setFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (lowercase)</SelectItem>
                  <SelectItem value="uppercase">Uppercase</SelectItem>
                  <SelectItem value="no-dashes">No Dashes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <Button onClick={generateUUID}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate UUID{count > 1 ? 's' : ''}
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>

          {uuids.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Generated UUIDs</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyAll}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {uuids.map((uuid, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <code className="flex-1 font-mono text-sm break-all">{uuid}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(uuid)}
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="about">About UUIDs</TabsTrigger>
                <TabsTrigger value="versions">UUID Versions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">What is a UUID?</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    A UUID (Universally Unique Identifier) is a 128-bit number used to identify information 
                    in computer systems. The standard format is represented as 32 hexadecimal digits, 
                    displayed in five groups separated by hyphens, in the form 8-4-4-4-12.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    UUIDs are designed to have a very low probability of duplication, making them ideal 
                    for use as unique identifiers in distributed systems.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="versions" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">UUID Version 4</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Version 4 UUIDs are generated from random numbers. They provide the best random 
                    characteristics and are suitable for most use cases where uniqueness is required.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx where x is a random hexadecimal digit 
                    and y is one of 8, 9, A, or B.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}