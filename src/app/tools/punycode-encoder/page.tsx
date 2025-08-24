'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Copy, Download, FileText } from 'lucide-react'

export default function PunycodeEncoder() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  // Punycode parameters
  const BASE = 36
  const TMIN = 1
  const TMAX = 26
  const SKEW = 38
  const DAMP = 700
  const INITIAL_BIAS = 72
  const INITIAL_N = 0x80
  const DELIMITER = '-'

  const adapt = (delta: number, numpoints: number, first: boolean): number => {
    if (first) {
      delta = Math.floor(delta / DAMP)
    } else {
      delta = Math.floor(delta / 2)
    }
    delta += Math.floor(delta / numpoints)
    let k = 0
    while (delta > ((BASE - TMIN) * TMAX) / 2) {
      delta = Math.floor(delta / (BASE - TMIN))
      k += BASE
    }
    return Math.floor(k + ((BASE - TMIN + 1) * delta) / (delta + SKEW))
  }

  const encodePunycode = (text: string): string => {
    if (!text) return ''
    
    // Check if already ASCII
    if (/^[\x00-\x7F]*$/.test(text)) {
      return text
    }
    
    const input = text.split('')
    let output = []
    
    // Copy all ASCII characters
    let h = 0
    for (let i = 0; i < input.length; i++) {
      const charCode = input[i].charCodeAt(0)
      if (charCode < 0x80) {
        output.push(input[i])
        h++
      }
    }
    
    if (h > 0) {
      output.push(DELIMITER)
    }
    
    let n = INITIAL_N
    let delta = 0
    let bias = INITIAL_BIAS
    
    // Encode non-ASCII characters
    for (const m of input) {
      const mCode = m.charCodeAt(0)
      if (mCode >= 0x80) {
        delta += (mCode - n) * (h + 1)
        n = mCode
        
        for (const c of input) {
          const cCode = c.charCodeAt(0)
          if (cCode < n || cCode >= 0x80) {
            delta++
          }
          
          if (cCode === n) {
            let q = delta
            for (let k = BASE; ; k += BASE) {
              const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias
              if (q < t) break
              output.push(String.fromCharCode(48 + Math.floor((q - t) / (BASE - t))))
              q = Math.floor((q - t) / (BASE - t))
            }
            output.push(String.fromCharCode(48 + q))
            bias = adapt(delta, h + 1, h === 0)
            delta = 0
            h++
          }
        }
        delta++
        n++
      }
    }
    
    return 'xn--' + output.join('')
  }

  const decodePunycode = (punycode: string): string => {
    if (!punycode) return ''
    
    // Remove ACE prefix if present
    let input = punycode
    if (input.startsWith('xn--')) {
      input = input.substring(4)
    }
    
    // Split on delimiter
    const delimiterPos = input.indexOf(DELIMITER)
    let output: string[] = []
    
    if (delimiterPos > -1) {
      output = input.substring(0, delimiterPos).split('')
      input = input.substring(delimiterPos + 1)
    }
    
    if (input.length === 0) {
      return output.join('')
    }
    
    let n = INITIAL_N
    let bias = INITIAL_BIAS
    let pos = 0
    
    while (pos < input.length) {
      let oldi = 0
      let w = 1
      
      for (let k = BASE; ; k += BASE) {
        if (pos >= input.length) {
          throw new Error('Invalid Punycode')
        }
        
        const charCode = input.charCodeAt(pos++)
        const digit = charCode - 48 < 10 ? charCode - 22 : 
                      charCode - 65 < 26 ? charCode - 65 : 
                      charCode - 97 < 26 ? charCode - 97 : BASE
        
        if (digit > (Math.pow(2, 31) - 1 - oldi) / w) {
          throw new Error('Overflow in Punycode decoding')
        }
        
        oldi += digit * w
        const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias
        
        if (digit < t) {
          break
        }
        
        if (w > Math.pow(2, 31) - 1 / (BASE - t)) {
          throw new Error('Overflow in Punycode decoding')
        }
        
        w *= (BASE - t)
      }
      
      bias = adapt(oldi, output.length + 1, output.length === 0)
      
      if (oldi > Math.pow(2, 31) - 1 - n) {
        throw new Error('Overflow in Punycode decoding')
      }
      
      n += oldi
      const q = Math.floor(n / (output.length + 1))
      n = n % (output.length + 1)
      output.splice(n, 0, String.fromCharCode(q))
      n++
    }
    
    return output.join('')
  }

  const handleEncode = () => {
    try {
      const encoded = encodePunycode(input)
      setOutput(encoded)
    } catch (error) {
      setOutput('Error: ' + (error as Error).message)
    }
  }

  const handleDecode = () => {
    try {
      const decoded = decodePunycode(input)
      setOutput(decoded)
    } catch (error) {
      setOutput('Error: ' + (error as Error).message)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  const downloadFile = () => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'punycode-result.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Punycode Encoder/Decoder
          </CardTitle>
          <CardDescription>
            Convert internationalized domain names (IDN) to and from Punycode encoding. Used for non-ASCII domain names.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="encode" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="encode">Encode</TabsTrigger>
              <TabsTrigger value="decode">Decode</TabsTrigger>
            </TabsList>
            
            <TabsContent value="encode" className="space-y-4">
              <div>
                <Label htmlFor="encode-input">International Domain Name</Label>
                <Textarea
                  id="encode-input"
                  placeholder="Enter international domain name (e.g., café.com, 测试.com)..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-32"
                />
              </div>
              <Button onClick={handleEncode} className="w-full">
                Encode to Punycode
              </Button>
            </TabsContent>
            
            <TabsContent value="decode" className="space-y-4">
              <div>
                <Label htmlFor="decode-input">Punycode Domain</Label>
                <Textarea
                  id="decode-input"
                  placeholder="Enter Punycode domain (e.g., xn--caf-dma.com, xn--0zwm56d.com)..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-32"
                />
              </div>
              <Button onClick={handleDecode} className="w-full">
                Decode from Punycode
              </Button>
            </TabsContent>
          </Tabs>
          
          {output && (
            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="output">Result</Label>
                <Textarea
                  id="output"
                  value={output}
                  readOnly
                  className="min-h-32 font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button onClick={downloadFile} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">About Punycode</h3>
            <p className="text-sm text-muted-foreground">
              Punycode is a encoding syntax used to convert Unicode strings to ASCII for use in internationalized domain names (IDN). 
              It allows domain names with non-ASCII characters (like café.com or 测试.com) to be represented in ASCII format (xn--caf-dma.com). 
              This is essential for DNS compatibility.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}