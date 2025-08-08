'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Phone, MessageCircle, Globe, Copy, ExternalLink, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function WhatsAppLink() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('')
  const [countryCode, setCountryCode] = useState('1')
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState('')
  const { toast } = useToast()

  const countryCodes = [
    { code: '1', name: 'United States', dialing: '+1', flag: '🇺🇸' },
    { code: '44', name: 'United Kingdom', dialing: '+44', flag: '🇬🇧' },
    { code: '91', name: 'India', dialing: '+91', flag: '🇮🇳' },
    { code: '86', name: 'China', dialing: '+86', flag: '🇨🇳' },
    { code: '49', name: 'Germany', dialing: '+49', flag: '🇩🇪' },
    { code: '33', name: 'France', dialing: '+33', flag: '🇫🇷' },
    { code: '81', name: 'Japan', dialing: '+81', flag: '🇯🇵' },
    { code: '55', name: 'Brazil', dialing: '+55', flag: '🇧🇷' },
    { code: '52', name: 'Mexico', dialing: '+52', flag: '🇲🇽' },
    { code: '61', name: 'Australia', dialing: '+61', flag: '🇦🇺' },
    { code: '7', name: 'Russia', dialing: '+7', flag: '🇷🇺' },
    { code: '82', name: 'South Korea', dialing: '+82', flag: '🇰🇷' },
  ]

  const sampleMessages = [
    "Hello! I'm interested in your products/services.",
    "Hi, I have a question about your business.",
    "Can you provide more information about your offerings?",
    "Hello, I'd like to schedule a consultation.",
    "Hi, I found your business online and would like to learn more.",
  ]

  const generateWhatsAppLink = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      })
      return
    }

    // Remove all non-digit characters from phone number
    const cleanNumber = phoneNumber.replace(/\D/g, '')
    
    if (cleanNumber.length < 7) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive",
      })
      return
    }

    const selectedCountry = countryCodes.find(c => c.code === countryCode)
    const fullNumber = selectedCountry ? selectedCountry.dialing + cleanNumber : cleanNumber
    
    // URL encode the message
    const encodedMessage = message ? encodeURIComponent(message) : ''
    const whatsappUrl = `https://wa.me/${fullNumber}${encodedMessage ? '?text=' + encodedMessage : ''}`
    
    setGeneratedLink(whatsappUrl)
    
    toast({
      title: "Success!",
      description: "WhatsApp link generated successfully",
      variant: "default",
    })
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
      variant: "default",
    })
    
    setTimeout(() => setCopied(''), 2000)
  }

  const openWhatsApp = () => {
    if (generatedLink) {
      window.open(generatedLink, '_blank')
    }
  }

  const insertSampleMessage = () => {
    setMessage(sampleMessages[Math.floor(Math.random() * sampleMessages.length)])
  }

  const clearAll = () => {
    setPhoneNumber('')
    setMessage('')
    setCountryCode('1')
    setGeneratedLink('')
    setCopied('')
  }

  const validatePhoneNumber = (number: string): boolean => {
    // Remove all non-digit characters
    const cleanNumber = number.replace(/\D/g, '')
    return cleanNumber.length >= 7 && cleanNumber.length <= 15
  }

  const formatPhoneNumber = (number: string): string => {
    // Remove all non-digit characters
    const cleanNumber = number.replace(/\D/g, '')
    
    // Format based on length
    if (cleanNumber.length <= 3) {
      return cleanNumber
    } else if (cleanNumber.length <= 6) {
      return `(${cleanNumber.slice(0, 3)}) ${cleanNumber.slice(3)}`
    } else if (cleanNumber.length <= 10) {
      return `(${cleanNumber.slice(0, 3)}) ${cleanNumber.slice(3, 6)}-${cleanNumber.slice(6)}`
    } else {
      return `+${cleanNumber.slice(0, 1)} (${cleanNumber.slice(1, 4)}) ${cleanNumber.slice(4, 7)}-${cleanNumber.slice(7, 11)}`
    }
  }

  const selectedCountry = countryCodes.find(c => c.code === countryCode)

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">WhatsApp Link Generator</h1>
          <p className="text-muted-foreground">Create clickable WhatsApp links for easy messaging</p>
        </div>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate Link</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            {/* Phone Number Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Phone Number
                </CardTitle>
                <CardDescription>Enter the recipient's phone number</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country-code">Country Code</Label>
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryCodes.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <span className="mr-2">{country.flag}</span>
                            {country.name} ({country.dialing})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone-number">Phone Number</Label>
                    <Input
                      id="phone-number"
                      type="tel"
                      placeholder="Enter phone number without country code"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>
                
                {phoneNumber && (
                  <div className="text-sm text-muted-foreground">
                    Formatted: {selectedCountry?.flag} {selectedCountry?.dialing} {formatPhoneNumber(phoneNumber)}
                  </div>
                )}
                
                {phoneNumber && !validatePhoneNumber(phoneNumber) && (
                  <p className="text-sm text-destructive">
                    Please enter a valid phone number (7-15 digits)
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Message Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Message (Optional)
                </CardTitle>
                <CardDescription>Pre-fill a message for the recipient</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={insertSampleMessage} variant="outline" size="sm">
                    Insert Sample Message
                  </Button>
                  <Button onClick={() => setMessage('')} variant="outline" size="sm">
                    Clear Message
                  </Button>
                </div>
                
                <Textarea
                  placeholder="Enter your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                
                <div className="text-sm text-muted-foreground">
                  Characters: {message.length} | Words: {message.trim() ? message.trim().split(/\s+/).length : 0}
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Card>
              <CardHeader>
                <CardTitle>Generate WhatsApp Link</CardTitle>
                <CardDescription>Create your clickable WhatsApp link</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={generateWhatsAppLink} 
                  disabled={!phoneNumber.trim() || !validatePhoneNumber(phoneNumber)}
                  className="w-full"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Generate WhatsApp Link
                </Button>
              </CardContent>
            </Card>

            {/* Generated Link */}
            {generatedLink && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Generated WhatsApp Link
                    </span>
                    <div className="flex gap-2">
                      <Button onClick={openWhatsApp} variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open WhatsApp
                      </Button>
                      <Button 
                        onClick={() => copyToClipboard(generatedLink, 'Link')}
                        variant="outline"
                        size="sm"
                        disabled={copied === 'Link'}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>Your clickable WhatsApp link</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-sm break-all">{generatedLink}</code>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Phone Number</div>
                      <div className="text-muted-foreground">
                        {selectedCountry?.flag} {selectedCountry?.dialing} {phoneNumber}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Message</div>
                      <div className="text-muted-foreground">
                        {message || 'No message'}
                      </div>
                    </div>
                  </div>
                  
                  {message && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="font-medium text-blue-900 mb-1">Preview Message:</div>
                      <div className="text-blue-700 text-sm">{message}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp Business Features
                </CardTitle>
                <CardDescription>Advanced WhatsApp Business functionality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    WhatsApp Business features coming soon!
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This section will include business API integration, quick replies, and business profile features.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Tips for Using WhatsApp Links</CardTitle>
            <CardDescription>Best practices for WhatsApp messaging</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Best Practices</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Always include country code for international numbers</li>
                    <li>• Keep messages concise and to the point</li>
                    <li>• Use clear call-to-action in your messages</li>
                    <li>• Test links before sharing them widely</li>
                    <li>• Respect privacy and only message with consent</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Common Use Cases</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Customer support and inquiries</li>
                    <li>• Sales and lead generation</li>
                    <li>• Appointment scheduling</li>
                    <li>• Order confirmations and updates</li>
                    <li>• Marketing campaigns and promotions</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Important Notes</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• WhatsApp links work on both mobile and desktop</li>
                  <li>• The recipient must have WhatsApp installed</li>
                  <li>• Messages are limited to 1024 characters</li>
                  <li>• URLs in messages should be properly encoded</li>
                  <li>• Always include the country code for international numbers</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}