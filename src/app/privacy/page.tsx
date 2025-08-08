import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Lock, Eye, Database, Globe, Heart } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy - Free Online Tools Platform',
  description: 'Learn how we protect your privacy and handle your data when using our free online tools. Our commitment to security and user privacy.',
  keywords: ['privacy policy', 'data protection', 'privacy', 'security', 'online tools'],
  openGraph: {
    title: 'Privacy Policy - Free Online Tools Platform',
    description: 'Learn how we protect your privacy and handle your data when using our tools.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy - Free Online Tools Platform',
    description: 'Learn how we protect your privacy and handle your data.',
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center space-y-6 mb-16">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            <Shield className="w-4 h-4 mr-2" />
            Privacy First
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your privacy is our priority. We're committed to protecting your data and ensuring 
            a safe, secure experience when using our tools.
          </p>
        </section>

        {/* Key Principles */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Privacy Principles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <Lock className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle className="mb-2">No Data Collection</CardTitle>
              <CardDescription>
                We don't collect, store, or process any of your personal data or tool usage information.
              </CardDescription>
            </Card>
            <Card className="text-center p-6">
              <Eye className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle className="mb-2">100% Private</CardTitle>
              <CardDescription>
                All tools run locally in your browser. Your data never leaves your device.
              </CardDescription>
            </Card>
            <Card className="text-center p-6">
              <Database className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle className="mb-2">No Tracking</CardTitle>
              <CardDescription>
                No cookies, no analytics, no tracking. Just pure, private functionality.
              </CardDescription>
            </Card>
            <Card className="text-center p-6">
              <Globe className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle className="mb-2">GDPR Compliant</CardTitle>
              <CardDescription>
                Built with privacy regulations in mind. Full compliance with GDPR standards.
              </CardDescription>
            </Card>
          </div>
        </section>

        {/* Detailed Policy */}
        <section className="space-y-12">
          <div>
            <h2 className="text-2xl font-bold mb-4">Information We Don't Collect</h2>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <span><strong>Personal Information:</strong> We don't ask for or collect your name, email, address, or any other personal details.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <span><strong>Usage Data:</strong> We don't track which tools you use, how often you use them, or what results you generate.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <span><strong>IP Addresses:</strong> We don't log or store your IP address when you use our tools.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <span><strong>Browser Information:</strong> We don't collect data about your browser, device, or operating system.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <span><strong>Content Data:</strong> Any data you process through our tools stays on your device and is never transmitted to our servers.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">How Our Tools Work</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Local Processing</h3>
                    <p className="text-muted-foreground">
                      All our tools are designed to run locally in your browser. This means that when you use any tool, 
                      the processing happens on your device, not on our servers. Your data never leaves your computer.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">No Server-Side Storage</h3>
                    <p className="text-muted-foreground">
                      We don't maintain any servers that store or process user data. Our platform is built on a 
                      serverless architecture that ensures maximum privacy and security.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Open Source Transparency</h3>
                    <p className="text-muted-foreground">
                      Our tools are open source, meaning you can inspect the code to verify that we're not collecting 
                      any data. We believe in transparency and trust.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Third-Party Services</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  We use minimal third-party services to enhance your experience:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <span><strong>Vercel Analytics:</strong> We use Vercel Analytics to monitor basic performance metrics like page load times and error rates. This data is anonymous and doesn't include any personal information.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <span><strong>Font Services:</strong> We use Google Fonts for typography. These services may collect minimal data about font usage, but no personal information.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <span><strong>CDN Services:</strong> Our static assets are served through a Content Delivery Network (CDN) for better performance. These services don't collect personal data.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">As a User, You Have The Right To:</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-primary" />
                        <span>Use our tools completely anonymously</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-primary" />
                        <span>Access our tools without providing any personal information</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-primary" />
                        <span>Use our tools without being tracked or monitored</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-primary" />
                        <span>Request deletion of any data we might hold (though we don't collect any)</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Data Protection</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center space-x-2">
                        <Lock className="w-4 h-4 text-primary" />
                        <span>Full control over your data</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Lock className="w-4 h-4 text-primary" />
                        <span>Complete transparency about data practices</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Lock className="w-4 h-4 text-primary" />
                        <span>Right to be forgotten</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Lock className="w-4 h-4 text-primary" />
                        <span>Right to data portability</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  Our platform is not directed to children under the age of 13. We do not knowingly collect 
                  personal information from children under 13. If you believe we have collected such information, 
                  please contact us immediately, and we will delete it.
                </p>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  We may update this privacy policy from time to time. When we do, we will post the new policy 
                  on this page and update the "Last Updated" date at the top. We encourage you to review this 
                  privacy policy periodically for any changes.
                </p>
                <p className="text-muted-foreground mt-4">
                  <strong>Last Updated:</strong> December 2024
                </p>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p><strong>Email:</strong> privacy@yourdomain.com</p>
                  <p className="mt-2"><strong>Address:</strong> 123 Privacy Street, Privacy City, PC 12345</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}