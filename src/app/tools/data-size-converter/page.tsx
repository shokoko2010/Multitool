'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, HardDrive, Zap } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function DataSizeConverterTool() {
  const [bytes, setBytes] = useState('')
  const [kilobytes, setKilobytes] = useState('')
  const [megabytes, setMegabytes] = useState('')
  const [gigabytes, setGigabytes] = useState('')
  const [terabytes, setTerabytes] = useState('')
  const [petabytes, setPetabytes] = useState('')
  const [exabytes, setExabytes] = useState('')
  const [bits, setBits] = useState('')
  const [kilobits, setKilobits] = useState('')
  const [megabits, setMegabits] = useState('')
  const [gigabits, setGigabits] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [inputUnit, setInputUnit] = useState('megabytes')
  const [binaryPrefix, setBinaryPrefix] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (inputValue) {
      convertFromInput()
    } else {
      clearAll()
    }
  }, [inputValue, inputUnit, binaryPrefix])

  const bytesToKilobytes = (b: number) => binaryPrefix ? b / 1024 : b / 1000
  const bytesToMegabytes = (b: number) => binaryPrefix ? b / (1024 * 1024) : b / (1000 * 1000)
  const bytesToGigabytes = (b: number) => binaryPrefix ? b / (1024 * 1024 * 1024) : b / (1000 * 1000 * 1000)
  const bytesToTerabytes = (b: number) => binaryPrefix ? b / (1024 * 1024 * 1024 * 1024) : b / (1000 * 1000 * 1000 * 1000)
  const bytesToPetabytes = (b: number) => binaryPrefix ? b / (1024 * 1024 * 1024 * 1024 * 1024) : b / (1000 * 1000 * 1000 * 1000 * 1000)
  const bytesToExabytes = (b: number) => binaryPrefix ? b / (1024 * 1024 * 1024 * 1024 * 1024 * 1024) : b / (1000 * 1000 * 1000 * 1000 * 1000 * 1000)
  const bytesToBits = (b: number) => b * 8
  const bytesToKilobits = (b: number) => (b * 8) / (binaryPrefix ? 1024 : 1000)
  const bytesToMegabits = (b: number) => (b * 8) / (binaryPrefix ? 1024 * 1024 : 1000 * 1000)
  const bytesToGigabits = (b: number) => (b * 8) / (binaryPrefix ? 1024 * 1024 * 1024 : 1000 * 1000 * 1000)

  const kilobytesToBytes = (kb: number) => binaryPrefix ? kb * 1024 : kb * 1000
  const megabytesToBytes = (mb: number) => binaryPrefix ? mb * (1024 * 1024) : mb * (1000 * 1000)
  const gigabytesToBytes = (gb: number) => binaryPrefix ? gb * (1024 * 1024 * 1024) : gb * (1000 * 1000 * 1000)
  const terabytesToBytes = (tb: number) => binaryPrefix ? tb * (1024 * 1024 * 1024 * 1024) : tb * (1000 * 1000 * 1000 * 1000)

  const convertFromInput = () => {
    const value = parseFloat(inputValue)
    if (isNaN(value)) {
      clearAll()
      return
    }

    let bytesValue: number

    switch (inputUnit) {
      case 'bytes':
        bytesValue = value
        break
      case 'kilobytes':
        bytesValue = kilobytesToBytes(value)
        break
      case 'megabytes':
        bytesValue = megabytesToBytes(value)
        break
      case 'gigabytes':
        bytesValue = gigabytesToBytes(value)
        break
      case 'terabytes':
        bytesValue = terabytesToBytes(value)
        break
      case 'petabytes':
        bytesValue = value * (binaryPrefix ? Math.pow(1024, 5) : Math.pow(1000, 5))
        break
      case 'exabytes':
        bytesValue = value * (binaryPrefix ? Math.pow(1024, 6) : Math.pow(1000, 6))
        break
      case 'bits':
        bytesValue = value / 8
        break
      case 'kilobits':
        bytesValue = (value * 1000) / 8
        break
      case 'megabits':
        bytesValue = (value * 1000 * 1000) / 8
        break
      case 'gigabits':
        bytesValue = (value * 1000 * 1000 * 1000) / 8
        break
      default:
        bytesValue = value
    }

    setBytes(bytesValue.toFixed(0))
    setKilobytes(bytesToKilobytes(bytesValue).toFixed(6))
    setMegabytes(bytesToMegabytes(bytesValue).toFixed(6))
    setGigabytes(bytesToGigabytes(bytesValue).toFixed(6))
    setTerabytes(bytesToTerabytes(bytesValue).toFixed(6))
    setPetabytes(bytesToPetabytes(bytesValue).toFixed(6))
    setExabytes(bytesToExabytes(bytesValue).toFixed(6))
    setBits(bytesToBits(bytesValue).toFixed(0))
    setKilobits(bytesToKilobits(bytesValue).toFixed(6))
    setMegabits(bytesToMegabits(bytesValue).toFixed(6))
    setGigabits(bytesToGigabits(bytesValue).toFixed(6))
  }

  const clearAll = () => {
    setBytes('')
    setKilobytes('')
    setMegabytes('')
    setGigabytes('')
    setTerabytes('')
    setPetabytes('')
    setExabytes('')
    setBits('')
    setKilobits('')
    setMegabits('')
    setGigabits('')
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const loadSampleValues = () => {
    setInputValue('1')
    setInputUnit('megabytes')
  }

  const getStorageCategory = (sizeBytes: number) => {
    if (sizeBytes < 1000) return { category: 'Bytes', emoji: '📄', color: 'text-blue-600' }
    if (sizeBytes < 1000000) return { category: 'Small File', emoji: '📁', color: 'text-green-600' }
    if (sizeBytes < 1000000000) return { category: 'Medium File', emoji: '🎵', color: 'text-orange-600' }
    if (sizeBytes < 1000000000000) return { category: 'Large File', emoji: '🎬', color: 'text-red-600' }
    if (sizeBytes < 1000000000000000) return { category: 'Very Large', emoji: '💾', color: 'text-purple-600' }
    return { category: 'Massive', emoji: '🌌', color: 'text-red-700' }
  }

  const getDataSizeInfo = () => {
    if (!megabytes) return null
    
    const sizeBytes = parseFloat(bytes) || 0
    const sizeMB = parseFloat(megabytes) || 0
    
    return {
      pages: Math.ceil(sizeBytes / 2000), // Assuming ~2KB per page
      photos: Math.ceil(sizeBytes / 5000000), // Assuming ~5MB per photo
      songs: Math.ceil(sizeBytes / 5000000), // Assuming ~5MB per song
      videos: Math.ceil(sizeBytes / 100000000), // Assuming ~100MB per video
      books: Math.ceil(sizeBytes / 2000000), // Assuming ~2MB per book
      movies: Math.ceil(sizeBytes / 4000000000) // Assuming ~4GB per movie
    }
  }

  const dataSizeInfo = getDataSizeInfo()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Data Size Converter</h1>
        <p className="text-muted-foreground">
          Convert between different data size units
        </p>
      </div>

      <Tabs defaultValue="converter" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="converter">Data Size Converter</TabsTrigger>
          <TabsTrigger value="reference">Data Size Reference</TabsTrigger>
        </TabsList>
        
        <TabsContent value="converter" className="space-y-6">
          {/* Quick Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Conversion
              </CardTitle>
              <CardDescription>
                Enter a data size value and select the unit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="binary-prefix"
                  checked={binaryPrefix}
                  onChange={(e) => setBinaryPrefix(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="binary-prefix" className="text-sm">
                  Use binary prefixes (1024-based) instead of decimal (1000-based)
                </Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Data Size Value</Label>
                  <Input
                    type="number"
                    placeholder="Enter data size"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>From Unit</Label>
                  <select 
                    value={inputUnit}
                    onChange={(e) => setInputUnit(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="bytes">Bytes (B)</option>
                    <option value="kilobytes">Kilobytes (KB)</option>
                    <option value="megabytes">Megabytes (MB)</option>
                    <option value="gigabytes">Gigabytes (GB)</option>
                    <option value="terabytes">Terabytes (TB)</option>
                    <option value="petabytes">Petabytes (PB)</option>
                    <option value="exabytes">Exabytes (EB)</option>
                    <option value="bits">Bits (b)</option>
                    <option value="kilobits">Kilobits (Kb)</option>
                    <option value="megabits">Megabits (Mb)</option>
                    <option value="gigabits">Gigabits (Gb)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <div className="flex gap-2">
                    <Button onClick={loadSampleValues} variant="outline" className="flex-1">
                      Load Sample
                    </Button>
                    <Button onClick={clearAll} variant="outline" className="flex-1">
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Size Display */}
          {megabytes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Data Size Conversions
                </CardTitle>
                <CardDescription>
                  All data size units converted from your input
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { unit: 'Bytes', symbol: 'B', value: bytes, description: 'Basic unit of digital information' },
                    { unit: 'Kilobytes', symbol: 'KB', value: kilobytes, description: binaryPrefix ? '1024 bytes' : '1000 bytes' },
                    { unit: 'Megabytes', symbol: 'MB', value: megabytes, description: binaryPrefix ? '1024 KB' : '1000 KB' },
                    { unit: 'Gigabytes', symbol: 'GB', value: gigabytes, description: binaryPrefix ? '1024 MB' : '1000 MB' },
                    { unit: 'Terabytes', symbol: 'TB', value: terabytes, description: binaryPrefix ? '1024 GB' : '1000 GB' },
                    { unit: 'Petabytes', symbol: 'PB', value: petabytes, description: binaryPrefix ? '1024 TB' : '1000 TB' },
                    { unit: 'Exabytes', symbol: 'EB', value: exabytes, description: binaryPrefix ? '1024 PB' : '1000 PB' },
                    { unit: 'Bits', symbol: 'b', value: bits, description: '8 bits = 1 byte' },
                    { unit: 'Kilobits', symbol: 'Kb', value: kilobits, description: binaryPrefix ? '1024 bits' : '1000 bits' },
                    { unit: 'Megabits', symbol: 'Mb', value: megabits, description: binaryPrefix ? '1024 Kb' : '1000 Kb' },
                    { unit: 'Gigabits', symbol: 'Gb', value: gigabits, description: binaryPrefix ? '1024 Mb' : '1000 Mb' }
                  ].map((size, index) => {
                    const numValue = parseFloat(size.value) || 0
                    const category = getStorageCategory(numValue * (size.symbol === 'B' ? 1 : 
                      size.symbol === 'KB' ? (binaryPrefix ? 1024 : 1000) :
                      size.symbol === 'MB' ? (binaryPrefix ? 1024 * 1024 : 1000 * 1000) :
                      size.symbol === 'GB' ? (binaryPrefix ? 1024 * 1024 * 1024 : 1000 * 1000 * 1000) :
                      size.symbol === 'TB' ? (binaryPrefix ? 1024 * 1024 * 1024 * 1024 : 1000 * 1000 * 1000 * 1000) : 0))
                    
                    return (
                      <div key={index} className="p-4 bg-muted rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{size.unit}</div>
                            <div className="text-sm text-muted-foreground">{size.description}</div>
                          </div>
                          <div className="text-xl">{category.emoji}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className={`text-xl font-bold ${category.color}`}>
                            {size.value}
                          </div>
                          <div className="font-mono text-sm">{size.symbol}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {category.category}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(`${size.value} ${size.symbol}`, `${size.unit}`)}
                          className="w-full"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Real-world Equivalents */}
          {dataSizeInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Real-world Equivalents</CardTitle>
                <CardDescription>
                  What your data size represents in everyday items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <div className="text-2xl mb-1">📄</div>
                    <div className="font-semibold">Pages</div>
                    <div className="text-2xl text-blue-600">{dataSizeInfo.pages}</div>
                    <div className="text-xs text-muted-foreground">of text</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <div className="text-2xl mb-1">📸</div>
                    <div className="font-semibold">Photos</div>
                    <div className="text-2xl text-green-600">{dataSizeInfo.photos}</div>
                    <div className="text-xs text-muted-foreground">high quality</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <div className="text-2xl mb-1">🎵</div>
                    <div className="font-semibold">Songs</div>
                    <div className="text-2xl text-orange-600">{dataSizeInfo.songs}</div>
                    <div className="text-xs text-muted-foreground">3-4 minutes</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <div className="text-2xl mb-1">🎬</div>
                    <div className="font-semibold">Videos</div>
                    <div className="text-2xl text-red-600">{dataSizeInfo.videos}</div>
                    <div className="text-xs text-muted-foreground">HD quality</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <div className="text-2xl mb-1">📚</div>
                    <div className="font-semibold">Books</div>
                    <div className="text-2xl text-purple-600">{dataSizeInfo.books}</div>
                    <div className="text-xs text-muted-foreground">average length</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <div className="text-2xl mb-1">🎞️</div>
                    <div className="font-semibold">Movies</div>
                    <div className="text-2xl text-red-700">{dataSizeInfo.movies}</div>
                    <div className="text-xs text-muted-foreground">2 hours</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conversion Formulas */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Formulas</CardTitle>
              <CardDescription>
                Mathematical formulas for data size conversions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold">Byte Conversions</h3>
                  <div className="text-sm space-y-1">
                    <div><strong>Kilobytes to Bytes:</strong> B = KB × {binaryPrefix ? '1024' : '1000'}</div>
                    <div><strong>Megabytes to Bytes:</strong> B = MB × {binaryPrefix ? '1,048,576' : '1,000,000'}</div>
                    <div><strong>Gigabytes to Bytes:</strong> B = GB × {binaryPrefix ? '1,073,741,824' : '1,000,000,000'}</div>
                    <div><strong>Bytes to Bits:</strong> b = B × 8</div>
                    <div><strong>Bits to Bytes:</strong> B = b ÷ 8</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold">Prefix Systems</h3>
                  <div className="text-sm space-y-1">
                    <div><strong>Decimal (SI):</strong> 1000-based prefixes</div>
                    <div>• 1 KB = 1,000 bytes</div>
                    <div>• 1 MB = 1,000 KB = 1,000,000 bytes</div>
                    <div>• 1 GB = 1,000 MB = 1,000,000,000 bytes</div>
                    <div><strong>Binary (IEC):</strong> 1024-based prefixes</div>
                    <div>• 1 KiB = 1,024 bytes</div>
                    <div>• 1 MiB = 1,024 KiB = 1,048,576 bytes</div>
                    <div>• 1 GiB = 1,024 MiB = 1,073,741,824 bytes</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reference" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Data Size Reference */}
            <Card>
              <CardHeader>
                <CardTitle>Common Data Sizes</CardTitle>
                <CardDescription>
                  Real-world data size examples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { size: 1, unit: '1 B', desc: 'Single character' },
                    { size: 100, unit: '100 B', desc: 'Short email' },
                    { size: 1000, unit: '1 KB', desc: 'Small text file' },
                    { size: 10000, unit: '10 KB', desc: 'Large text file' },
                    { size: 100000, unit: '100 KB', desc: 'Low-resolution image' },
                    { size: 1000000, unit: '1 MB', desc: 'High-quality photo' },
                    { size: 10000000, unit: '10 MB', desc: 'MP3 song (3-4 minutes)' },
                    { size: 100000000, unit: '100 MB', desc: 'HD video (1 minute)' },
                    { size: 1000000000, unit: '1 GB', desc: 'Movie file (2 hours)' },
                    { size: 10000000000, unit: '10 GB', desc: 'Blu-ray movie' },
                    { size: 100000000000, unit: '100 GB', desc: 'Hard drive partition' },
                    { size: 1000000000000, unit: '1 TB', desc: 'Modern hard drive' },
                    { size: 10000000000000, unit: '10 TB', desc: 'High-capacity SSD' },
                    { size: 100000000000000, unit: '100 TB', desc: 'Server storage' },
                    { size: 1000000000000000, unit: '1 PB', desc: 'Large data center' }
                  ].map((ref, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-semibold">{ref.desc}</div>
                        <div className="text-sm text-muted-foreground">{ref.unit}</div>
                      </div>
                      <div className="text-xl font-bold text-blue-600">
                        {ref.size} bytes
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Storage Media */}
            <Card>
              <CardHeader>
                <CardTitle>Storage Media Capacities</CardTitle>
                <CardDescription>
                  Typical capacities of different storage devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="font-semibold">USB Flash Drives</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Range from 8 GB to 1 TB. Common sizes: 16GB, 32GB, 64GB, 128GB, 256GB. Portable and convenient for file transfer.
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="font-semibold">External Hard Drives</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Range from 250 GB to 20 TB. Common sizes: 1TB, 2TB, 4TB, 8TB. Used for backup and large file storage.
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="font-semibold">SSDs (Solid State Drives)</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Range from 128 GB to 8 TB. Common sizes: 256GB, 512GB, 1TB, 2TB. Faster than traditional HDDs, used for system drives.
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="font-semibold">Cloud Storage</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Typically offered in tiers: 5GB, 50GB, 200GB, 2TB. Services like iCloud, Google Drive, Dropbox, OneDrive.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Transfer Speeds */}
          <Card>
            <CardHeader>
              <CardTitle>Data Transfer Speeds</CardTitle>
              <CardDescription>
                Typical transfer speeds for different connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { type: 'USB 2.0', speed: '480 Mbps', capacity: '60 MB/s', desc: 'Older USB standard' },
                  { type: 'USB 3.0', speed: '5 Gbps', capacity: '625 MB/s', desc: 'Current USB standard' },
                  { type: 'USB 3.1', speed: '10 Gbps', capacity: '1.25 GB/s', desc: 'High-speed USB' },
                  { type: 'USB-C', speed: '40 Gbps', capacity: '5 GB/s', desc: 'Latest USB standard' },
                  { type: 'SATA III', speed: '6 Gbps', capacity: '600 MB/s', desc: 'Hard drive interface' },
                  { type: 'NVMe SSD', speed: '32 Gbps', capacity: '4 GB/s', desc: 'High-performance storage' },
                  { type: 'Gigabit Ethernet', speed: '1 Gbps', capacity: '125 MB/s', desc: 'Network connection' },
                  { type: 'Wi-Fi 6', speed: '9.6 Gbps', capacity: '1.2 GB/s', desc: 'Wireless network' },
                  { type: '5G', speed: '20 Gbps', capacity: '2.5 GB/s', desc: 'Mobile network' }
                ].map((connection, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg space-y-2">
                    <div className="font-semibold">{connection.type}</div>
                    <div className="text-sm text-blue-600 font-mono">{connection.speed}</div>
                    <div className="text-sm text-muted-foreground">
                      {connection.capacity} theoretical throughput
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {connection.desc}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Size Fun Facts */}
          <Card>
            <CardHeader>
              <CardTitle>Interesting Data Size Facts</CardTitle>
              <CardDescription>
                  Fascinating facts about digital data sizes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { fact: 'The entire internet', detail: 'Contains an estimated 120 zettabytes (120 × 10²¹ bytes) of data' },
                  { fact: 'Human DNA', detail: 'Contains about 750 megabytes of data when compressed' },
                  { fact: 'Library of Congress', detail: 'Contains about 15 terabytes of text data' },
                  { fact: 'Hubble Space Telescope', detail: 'Has transmitted about 144 terabytes of data since 1990' },
                  { fact: 'World daily data creation', detail: 'Humans create 2.5 quintillion bytes of data every day' },
                  { fact: 'A single grain of sand', detail: 'Contains about 400 quadrillion atoms, more than bytes in 1 petabyte' }
                ].map((fact, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg space-y-1">
                    <div className="font-semibold">{fact.fact}</div>
                    <div className="text-sm text-muted-foreground">{fact.detail}</div>
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