'use client'

import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Copy, Download, FileText, Hash } from 'lucide-react'

interface ASCIIEntry {
  decimal: number
  hex: string
  octal: string
  binary: string
  char: string
  description: string
  category: string
}

export default function ASCIITableGeneratorTool() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [rangeStart, setRangeStart] = useState(32)
  const [rangeEnd, setRangeEnd] = useState(127)

  const asciiData: ASCIIEntry[] = useMemo(() => {
    const data: ASCIIEntry[] = []
    
    for (let i = 0; i <= 127; i++) {
      let char = String.fromCharCode(i)
      let description = ''
      let category = ''

      if (i <= 31) {
        // Control characters
        category = 'control'
        const controlNames = [
          'NUL', 'SOH', 'STX', 'ETX', 'EOT', 'ENQ', 'ACK', 'BEL',
          'BS', 'HT', 'LF', 'VT', 'FF', 'CR', 'SO', 'SI',
          'DLE', 'DC1', 'DC2', 'DC3', 'DC4', 'NAK', 'SYN', 'ETB',
          'CAN', 'EM', 'SUB', 'ESC', 'FS', 'GS', 'RS', 'US'
        ]
        description = controlNames[i] || 'Control character'
        char = description
      } else if (i === 32) {
        category = 'space'
        description = 'Space'
      } else if (i === 127) {
        category = 'control'
        description = 'Delete'
        char = 'DEL'
      } else if (i >= 48 && i <= 57) {
        category = 'digit'
        description = `Digit ${char}`
      } else if (i >= 65 && i <= 90) {
        category = 'uppercase'
        description = `Uppercase letter ${char}`
      } else if (i >= 97 && i <= 122) {
        category = 'lowercase'
        description = `Lowercase letter ${char}`
      } else {
        category = 'symbol'
        description = 'Symbol'
      }

      data.push({
        decimal: i,
        hex: i.toString(16).toUpperCase().padStart(2, '0'),
        octal: i.toString(8).padStart(3, '0'),
        binary: i.toString(2).padStart(8, '0'),
        char: i <= 31 || i === 127 ? description : char,
        description,
        category
      })
    }

    return data
  }, [])

  const filteredData = useMemo(() => {
    return asciiData.filter(entry => {
      const matchesSearch = searchTerm === '' || 
        entry.decimal.toString().includes(searchTerm) ||
        entry.hex.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.octal.includes(searchTerm) ||
        entry.binary.includes(searchTerm) ||
        entry.char.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = categoryFilter === 'all' || entry.category === categoryFilter

      const matchesRange = entry.decimal >= rangeStart && entry.decimal <= rangeEnd

      return matchesSearch && matchesCategory && matchesRange
    })
  }, [asciiData, searchTerm, categoryFilter, rangeStart, rangeEnd])

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
  }

  const handleDownload = () => {
    const headers = ['Decimal', 'Hex', 'Octal', 'Binary', 'Char', 'Description']
    const rows = filteredData.map(entry => [
      entry.decimal,
      entry.hex,
      entry.octal,
      entry.binary,
      entry.char,
      entry.description
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ascii-table.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getCategoryStats = () => {
    const stats: { [key: string]: number } = {}
    filteredData.forEach(entry => {
      stats[entry.category] = (stats[entry.category] || 0) + 1
    })
    return stats
  }

  const categoryStats = getCategoryStats()

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            ASCII Table Generator
          </CardTitle>
          <CardDescription>
            Generate and search through ASCII character tables with filtering and export options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="control">Control</SelectItem>
                  <SelectItem value="space">Space</SelectItem>
                  <SelectItem value="digit">Digits</SelectItem>
                  <SelectItem value="uppercase">Uppercase</SelectItem>
                  <SelectItem value="lowercase">Lowercase</SelectItem>
                  <SelectItem value="symbol">Symbols</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="range-start">Range Start</Label>
              <Input
                id="range-start"
                type="number"
                min="0"
                max="127"
                value={rangeStart}
                onChange={(e) => setRangeStart(Math.min(127, Math.max(0, parseInt(e.target.value) || 0)))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="range-end">Range End</Label>
              <Input
                id="range-end"
                type="number"
                min="0"
                max="127"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(Math.min(127, Math.max(0, parseInt(e.target.value) || 0)))}
              />
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </div>

          <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(categoryStats).map(([category, count]) => (
              <div key={category} className="p-2 bg-muted rounded text-sm">
                <span className="font-medium capitalize">{category}:</span> {count}
              </div>
            ))}
            <div className="p-2 bg-muted rounded text-sm">
              <span className="font-medium">Total:</span> {filteredData.length}
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Decimal</TableHead>
                    <TableHead>Hex</TableHead>
                    <TableHead>Octal</TableHead>
                    <TableHead>Binary</TableHead>
                    <TableHead>Char</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((entry) => (
                    <TableRow key={entry.decimal}>
                      <TableCell className="font-mono">{entry.decimal}</TableCell>
                      <TableCell className="font-mono">{entry.hex}</TableCell>
                      <TableCell className="font-mono">{entry.octal}</TableCell>
                      <TableCell className="font-mono">{entry.binary}</TableCell>
                      <TableCell className="font-mono">{entry.char}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell className="capitalize">{entry.category}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(entry.char)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No ASCII characters found matching your criteria.
            </div>
          )}

          <div className="mt-6 space-y-4">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About ASCII</TabsTrigger>
                <TabsTrigger value="ranges">Character Ranges</TabsTrigger>
                <TabsTrigger value="usage">Usage</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">What is ASCII?</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    ASCII (American Standard Code for Information Interchange) is a character 
                    encoding standard for electronic communication. ASCII codes represent text 
                    in computers, telecommunications equipment, and other devices.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ASCII is a 7-bit encoding standard that can represent 128 different characters. 
                    It includes English letters, digits, punctuation marks, and control characters. 
                    ASCII was the basis for many later encoding standards including Unicode.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="ranges" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">ASCII Character Ranges</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <strong>Control Characters (0-31):</strong> Non-printable characters used for device control
                    </div>
                    <div>
                      <strong>Space (32):</strong> Space character
                    </div>
                    <div>
                      <strong>Digits (48-57):</strong> Numbers 0-9
                    </div>
                    <div>
                      <strong>Uppercase Letters (65-90):</strong> A-Z
                    </div>
                    <div>
                      <strong>Lowercase Letters (97-122):</strong> a-z
                    </div>
                    <div>
                      <strong>Delete (127):</strong> Delete character
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="usage" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Common ASCII Usage</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Text file encoding and processing</li>
                    <li>• Network protocols and communication</li>
                    <li>• Character encoding in programming</li>
                    <li>• Terminal and console applications</li>
                    <li>• Legacy systems and compatibility</li>
                    <li>• Data interchange between systems</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}