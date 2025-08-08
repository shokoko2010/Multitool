'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Download, Copy, Edit, Shield, Globe, Mail, Phone, MapPin } from 'lucide-react'

export default function PrivacyPolicyGenerator() {
  const [companyName, setCompanyName] = useState('')
  const [website, setWebsite] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [country, setCountry] = useState('United States')
  const [loading, setLoading] = useState(false)
  const [policyContent, setPolicyContent] = useState('')
  const [error, setError] = useState('')

  const generatePrivacyPolicy = async () => {
    if (!companyName || !website) {
      setError('Please fill in company name and website URL')
      return
    }

    setLoading(true)
    setError('')
    setPolicyContent('')

    try {
      // Simulate policy generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock privacy policy content
      const mockPolicyContent = `# Privacy Policy

**Last Updated:** ${new Date().toLocaleDateString()}

## 1. Introduction

Welcome to ${companyName} ("we," "our," or "us"). We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at ${website}.

## 2. Information We Collect

### 2.1 Personal Information
We may collect personal information that you voluntarily provide to us when you:
- Register for an account
- Contact us through forms or email
- Subscribe to our newsletter
- Purchase our products or services

### 2.2 Automatically Collected Information
We may automatically collect certain information when you visit our website, including:
- IP address and browser type
- Device information and operating system
- Pages visited and time spent on our site
- Referring website addresses
- Technical information about your connection

## 3. How We Use Your Information

We use the information we collect to:
- Provide, maintain, and improve our services
- Process transactions and send related information
- Send technical notices and support messages
- Respond to comments and questions
- Provide customer service
- Gather analysis to improve our products, services, website experience, and marketing efforts

## 4. Data Sharing and Disclosure

### 4.1 Service Providers
We may share your information with trusted third-party service providers who assist us in operating our business, such as:
- Payment processing companies
- Email marketing services
- Web hosting providers
- Analytics and advertising services

### 4.2 Legal Requirements
We may disclose your information when we believe in good faith that disclosure is necessary to:
- Comply with legal obligations
- Protect and defend the rights or property of ${companyName}
- Protect the personal safety of users of the site or the public
- Take action regarding suspected illegal activities

## 5. Data Security

We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
- Secure data encryption
- Access controls and authentication
- Regular security audits
- Employee training on data protection

## 6. Your Rights

Depending on your location, you may have certain rights regarding your personal information, including:
- The right to access and obtain a copy of your personal information
- The right to rectify inaccurate personal information
- The right to erase personal information under certain conditions
- The right to restrict processing of your personal information
- The right to data portability
- The right to object to certain processing activities

## 7. Cookies and Tracking Technologies

We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand user behavior. You can control cookie preferences through your browser settings.

## 8. International Data Transfers

If you are located outside ${country} and choose to provide information to us, please note that we transfer the information to ${country} and process it there.

## 9. Children's Privacy

Our website is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us.

## 10. Links to Third-Party Sites

Our website may contain links to third-party websites that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites.

## 11. Changes to This Privacy Policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top.

## 12. Contact Us

If you have any questions about this Privacy Policy, please contact us:

**Company:** ${companyName}
**Website:** ${website}
${email ? `**Email:** ${email}\n` : ''}${phone ? `**Phone:** ${phone}\n` : ''}${address ? `**Address:** ${address}\n` : ''}**Country:** ${country}

---

*This privacy policy template is provided for informational purposes only and should not be considered legal advice. Please consult with a legal professional to ensure compliance with applicable laws and regulations in your jurisdiction.*`

      setPolicyContent(mockPolicyContent)
    } catch (err) {
      setError('Failed to generate privacy policy. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(policyContent)
  }

  const downloadPolicy = () => {
    const blob = new Blob([policyContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'privacy-policy.md'
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
            <Shield className="h-5 w-5" />
            Privacy Policy Generator
          </CardTitle>
          <CardDescription>
            Generate a comprehensive privacy policy for your website. 
            Customize with your company information and download in multiple formats.
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
          
          <Button onClick={generatePrivacyPolicy} disabled={loading} className="w-full">
            {loading ? 'Generating Policy...' : 'Generate Privacy Policy'}
          </Button>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {policyContent && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={downloadPolicy} className="flex-1">
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
                      <CardTitle className="text-lg">Privacy Policy Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                          {policyContent}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="sections" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Policy Sections</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">Introduction</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">Information Collection</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">Information Usage</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">Data Sharing</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">Data Security</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">User Rights</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">Cookies</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">International Transfers</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">Children's Privacy</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">Third-Party Links</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">Policy Updates</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">Contact Information</span>
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
                            <p>Compliance: GDPR Ready</p>
                            <p>Format: Markdown</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Additional Sections</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">CCPA Compliance</Badge>
                          <Badge variant="outline">Cookie Consent</Badge>
                          <Badge variant="outline">Data Processing Agreement</Badge>
                          <Badge variant="outline">Retention Policy</Badge>
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