'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Download, Copy, Gavel, Scale, Globe, Mail, Phone, MapPin } from 'lucide-react'

export default function TermsConditionsGenerator() {
  const [companyName, setCompanyName] = useState('')
  const [website, setWebsite] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [country, setCountry] = useState('United States')
  const [loading, setLoading] = useState(false)
  const [termsContent, setTermsContent] = useState('')
  const [error, setError] = useState('')

  const generateTermsConditions = async () => {
    if (!companyName || !website) {
      setError('Please fill in company name and website URL')
      return
    }

    setLoading(true)
    setError('')
    setTermsContent('')

    try {
      // Simulate terms generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock terms and conditions content
      const mockTermsContent = `# Terms and Conditions

**Last Updated:** ${new Date().toLocaleDateString()}

## 1. Acceptance of Terms

By accessing and using ${website} (the "Website"), you accept and agree to be bound by the terms and provision of this agreement.

## 2. Intellectual Property Rights

Unless otherwise stated, ${companyName} and/or its licensors own the intellectual property rights for all material on ${website}. All intellectual property rights are reserved. You may view, download, and print pages from ${website} for your own personal use subject to restrictions set in these terms and conditions.

## 3. User Account

If you create an account on ${website}, you are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.

## 4. User Conduct

As a condition of your use of the Website, you agree not to:

- Use the Website for any illegal or unauthorized purpose
- Solicit others to perform or participate in any illegal acts
- Post or transmit any unlawful, threatening, abusive, libelous, defamatory, obscene, or profane material
- Post or transmit any material that infringes or violates any patent, trademark, copyright, or other proprietary rights
- Post or transmit any material that contains software viruses or any other computer code, files, or programs designed to interrupt, destroy, or limit the functionality of any computer software or hardware or telecommunications equipment
- Harvest or collect personally identifiable information, including account names, from the Website
- Interfere with, disrupt, or create an undue burden on the Website or the networks or services connected to the Website

## 5. Service Availability

We do not guarantee that the Website will be available at all times. We may suspend, restrict, or discontinue access to all or any part of the Website at any time, with or without notice and without liability to you.

## 6. Product and Service Information

We make every effort to display as accurately as possible the colors, features, specifications, and details of the products and services available on the Website. However, we do not guarantee that the colors, features, specifications, and details will be accurate, complete, reliable, current, or free of other errors, and your electronic display may not accurately reflect the actual colors and details of the products and services.

## 7. Pricing and Payment

- All prices are subject to change without notice
- We are not responsible for typographical errors
- Payment must be received before products are shipped or services are rendered
- We reserve the right to refuse any order placed with us
- We may require additional verification or information before processing any order

## 8. Shipping and Delivery

- Shipping times are estimates and not guaranteed
- We are not responsible for delays caused by the shipping carrier
- International orders may be subject to customs fees and import duties
- Risk of loss and title for all merchandise ordered on this Website pass to you when the merchandise is delivered to the shipping carrier

## 9. Returns and Refunds

- Products must be returned in their original condition with all packaging and accessories
- Refunds will be processed within 14 business days of receiving returned merchandise
- Shipping charges are non-refundable
- Some items may not be returnable due to hygiene or other reasons

## 10. Limitation of Liability

In no event shall ${companyName}, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable to any person for any direct, indirect, incidental, special, punitive, consequential, or other damages arising from the use of, or inability to use, the Website or the content or materials contained on the Website.

## 11. Indemnification

You agree to indemnify, defend, and hold harmless ${companyName}, its affiliates, and all of their respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys' fees and expenses, made by any third party due to or arising out of your breach of these Terms and Conditions or your violation of any law or the rights of a third party.

## 12. Governing Law

These Terms and Conditions and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of ${country}, without regard to its conflict of law provisions.

## 13. Changes to Terms and Conditions

We reserve the right, at our sole discretion, to update, change or replace any part of these Terms and Conditions by posting updates and changes to our Website. It is your responsibility to check our Website periodically for changes.

## 14. Contact Information

Questions about the Terms and Conditions should be sent to us at:

**Company:** ${companyName}
**Website:** ${website}
${email ? `**Email:** ${email}\n` : ''}${phone ? `**Phone:** ${phone}\n` : ''}${address ? `**Address:** ${address}\n` : ''}**Country:** ${country}

---

*This terms and conditions template is provided for informational purposes only and should not be considered legal advice. Please consult with a legal professional to ensure compliance with applicable laws and regulations in your jurisdiction.*`

      setTermsContent(mockTermsContent)
    } catch (err) {
      setError('Failed to generate terms and conditions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(termsContent)
  }

  const downloadTerms = () => {
    const blob = new Blob([termsContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'terms-conditions.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Terms and Conditions Generator
          </CardTitle>
          <CardDescription>
            Generate comprehensive terms and conditions for your business. 
            Customize with your company details and protect your legal interests.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name *</label>
              <Input
                placeholder="Your Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Website URL *</label>
              <Input
                placeholder="https://yourcompany.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Email</label>
              <Input
                placeholder="contact@yourcompany.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Phone</label>
              <Input
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Address</label>
              <Input
                placeholder="123 Main Street, City, State"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
              <Input
                placeholder="United States"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          
          <Button onClick={generateTermsConditions} disabled={loading} className="w-full">
            {loading ? 'Generating Terms...' : 'Generate Terms & Conditions'}
          </Button>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {termsContent && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={downloadTerms} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download Markdown
                </Button>
                <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </Button>
              </div>

              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="sections">Sections</TabsTrigger>
                  <TabsTrigger value="customize">Customize</TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Terms and Conditions Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                          {termsContent}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="sections" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Terms Sections</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Scale className="h-4 w-4" />
                          <span className="text-sm">Acceptance of Terms</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Globe className="h-4 w-4" />
                          <span className="text-sm">Intellectual Property</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">User Account</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Gavel className="h-4 w-4" />
                          <span className="text-sm">User Conduct</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Globe className="h-4 w-4" />
                          <span className="text-sm">Service Availability</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">Product Information</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Scale className="h-4 w-4" />
                          <span className="text-sm">Pricing and Payment</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Globe className="h-4 w-4" />
                          <span className="text-sm">Shipping and Delivery</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Scale className="h-4 w-4" />
                          <span className="text-sm">Returns and Refunds</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Gavel className="h-4 w-4" />
                          <span className="text-sm">Limitation of Liability</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Scale className="h-4 w-4" />
                          <span className="text-sm">Indemnification</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Globe className="h-4 w-4" />
                          <span className="text-sm">Governing Law</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="customize" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Customization Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Company Information</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>Name: {companyName || 'Not specified'}</p>
                            <p>Website: {website || 'Not specified'}</p>
                            <p>Email: {email || 'Not specified'}</p>
                            <p>Phone: {phone || 'Not specified'}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Legal Requirements</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>Country: {country}</p>
                            <p>Last Updated: {new Date().toLocaleDateString()}</p>
                            <p>Compliance: Business Ready</p>
                            <p>Format: Markdown</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Additional Sections</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Privacy Policy</Badge>
                          <Badge variant="outline">Cookie Policy</Badge>
                          <Badge variant="outline">Disclaimer</Badge>
                          <Badge variant="outline">Arbitration Clause</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Export Formats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                          <h5 className="font-medium mb-1">Markdown (.md)</h5>
                          <p className="text-xs text-gray-600">Web-friendly format</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <FileText className="h-8 w-8 mx-auto mb-2 text-green-500" />
                          <h5 className="font-medium mb-1">HTML (.html)</h5>
                          <p className="text-xs text-gray-600">Website ready</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <FileText className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                          <h5 className="font-medium mb-1">PDF (.pdf)</h5>
                          <p className="text-xs text-gray-600">Printable format</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}