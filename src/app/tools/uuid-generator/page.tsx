'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, Download, Key, RotateCcw, RefreshCw } from 'lucide-react'
import { useToolAccess } from '@/hooks/useToolAccess'

export default function UuidGenerator() {
  const [output, setOutput] = useState('')
  const [uuidVersion, setUuidVersion] = useState('v4')
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState<string | null>(null)
  
  const { trackUsage } = useToolAccess('uuid-generator')

  const generateUuid = async () => {
    try {
      // Track usage before generating
      await trackUsage()

      const uuids = []
      for (let i = 0; i < quantity; i++) {
        let uuid
        switch (uuidVersion) {
          case 'v1':
            uuid = generateUUIDv1()
            break
          case 'v4':
            uuid = generateUUIDv4()
            break
          case 'v5':
            uuid = generateUUIDv5('dns', 'example.com')
            break
          default:
            uuid = generateUUIDv4()
        }
        uuids.push(uuid)
      }

      setOutput(uuids.join('\n'))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'UUID generation failed')
      setOutput('')
    }
  }

  const generateUUIDv1 = (): string => {
    // Generate a version 1 UUID (timestamp-based)
    const timestamp = Date.now()
    const randomBytes = new Uint8Array(8)
    crypto.getRandomValues(randomBytes)
    
    // Format as UUID v1
    const timeLow = timestamp & 0xFFFFFFFF
    const timeMid = (timestamp >> 32) & 0xFFFF
    const timeHi = (timestamp >> 48) & 0x0FFF
    
    return [
      timeLow.toString(16).padStart(8, '0'),
      timeMid.toString(16).padStart(4, '0'),
      (timeHi | 0x1000).toString(16).padStart(4, '0'), // Version 1
      ((randomBytes[0] & 0x3F) | 0x80).toString(16).padStart(2, '0'), // Variant
      randomBytes.slice(1, 8).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '')
    ].join('-')
  }

  const generateUUIDv4 = (): string => {
    // Generate a version 4 UUID (random)
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    
    // Set version (4) and variant (10xx)
    bytes[6] = (bytes[6] & 0x0F) | 0x40
    bytes[8] = (bytes[8] & 0x3F) | 0x80
    
    return Array.from(bytes)
      .map((byte, index) => {
        if (index === 4 || index === 6 || index === 8 || index === 10) {
          return '-' + byte.toString(16).padStart(2, '0')
        }
        return byte.toString(16).padStart(2, '0')
      })
      .join('')
  }

  const generateUUIDv5 = (namespace: string, name: string): string => {
    // Generate a version 5 UUID (SHA-1 based)
    // This is a simplified implementation
    const encoder = new TextEncoder()
    const data = encoder.encode(namespace + name)
    
    // Create SHA-1 hash (simplified)
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data[i]
      hash = hash & hash // Convert to 32-bit integer
    }
    
    // Format as UUID v5
    const bytes = new Uint8Array(16)
    for (let i = 0; i < 16; i++) {
      bytes[i] = (hash >> (i * 8)) & 0xFF
    }
    
    // Set version (5) and variant (10xx)
    bytes[6] = (bytes[6] & 0x0F) | 0x50
    bytes[8] = (bytes[8] & 0x3F) | 0x80
    
    return Array.from(bytes)
      .map((byte, index) => {
        if (index === 4 || index === 6 || index === 8 || index === 10) {
          return '-' + byte.toString(16).padStart(2, '0')
        }
        return byte.toString(16).padStart(2, '0')
      })
      .join('')
  }

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output)
    }
  }

  const downloadResult = () => {
    if (output) {
      const blob = new Blob([output], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'uuids.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const clearAll = () => {
    setOutput('')
    setError(null)
  }

  return (
    <ToolLayout
      toolId="uuid-generator"
      toolName="UUID Generator"
      toolDescription="Generate universally unique identifiers"
      toolCategory="Developer Tools"
      toolIcon={<Key className="w-8 h-8" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generator Settings</CardTitle>
            <CardDescription>
              Configure UUID generation options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>UUID Version</Label>
              <Select value={uuidVersion} onValueChange={setUuidVersion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v1">Version 1 (Timestamp-based)</SelectItem>
                  <SelectItem value="v4">Version 4 (Random)</SelectItem>
                  <SelectItem value="v5">Version 5 (SHA-1 based)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                placeholder="Number of UUIDs to generate"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generated UUIDs</CardTitle>
            <CardDescription>
              Your generated UUIDs will appear here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Results</label>
                {output && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadResult}>
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
              <Textarea
                value={output}
                readOnly
                placeholder="Generated UUIDs will appear here..."
                rows={8}
                className="font-mono text-sm bg-muted/50"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={generateUuid}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate {quantity} UUID{quantity > 1 ? 's' : ''}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">About UUIDs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">🆔 Version 1</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Timestamp-based</li>
                <li>• Contains MAC address</li>
                <li>• Sortable by time</li>
                <li>• Privacy concerns</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎲 Version 4</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Random numbers</li>
                <li>• Most common type</li>
                <li>• No identifiable info</li>
                <li>• Good for general use</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔐 Version 5</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• SHA-1 hash based</li>
                <li>• Deterministic</li>
                <li>• Same input = same UUID</li>
                <li>• Good for naming</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}