import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Scale, Globe, Users, Zap, Shield, Heart } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service - Free Online Tools Platform',
  description: 'Read our terms of service for using our free online tools. Understand your rights and responsibilities when using our platform.',
  keywords: ['terms of service', 'terms', 'conditions', 'online tools', 'platform usage'],
  openGraph: {
    title: 'Terms of Service - Free Online Tools Platform',
    description: 'Read our terms of service for using our free online tools.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service - Free Online Tools Platform',
    description: 'Read our terms of service for using our free online tools.',
  },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center space-y-6 mb-16">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            <Scale className="w-4 h-4 mr-2" />
            Legal Terms
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Welcome to our multi-tool platform. Please read these terms carefully before using any of our tools.
          </p>
        </section>

        {/* Acceptance Section */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-6 h-6" />
                <span>Acceptance of Terms</span>
              </CardTitle>
              <CardDescription>
                By accessing and using our platform, you accept and agree to be bound by the terms and provision of this agreement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                If you do not agree to these terms, please do not use our tools. These terms constitute a legally binding agreement 
                between you and our platform. These terms affect your rights and obligations, and include limitations of liability 
                and dispute resolution provisions.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Main Terms */}
        <section className="space-y-12">
          <div>
            <h2 className="text-2xl font-bold mb-4">1. Use of Our Platform</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Permitted Use</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Use our tools for legitimate purposes</li>
                      <li>• Respect intellectual property rights</li>
                      <li>• Not attempt to harm our platform or interfere with its proper functioning</li>
                      <li>• Comply with all applicable laws and regulations</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Prohibited Use</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Using our tools for illegal activities</li>
                      <li>• Violating intellectual property rights</li>
                      <li>• Attempting to reverse engineer or extract source code</li>
                      <li>• Overloading our servers with excessive requests</li>
                      <li>• Using automated tools to scrape our content</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">2. Tool Usage and Accuracy</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Tool Availability</h3>
                    <p className="text-muted-foreground">
                      We strive to keep all our tools available and functioning properly. However, we reserve the right to:
                    </p>
                    <ul className="space-y-2 text-muted-foreground mt-2">
                      <li>• Temporarily or permanently discontinue any tool</li>
                      <li>• Modify or update tools without notice</li>
                      <li>• Limit access to certain tools based on usage patterns</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Accuracy and Reliability</h3>
                    <p className="text-muted-foreground">
                      While we make every effort to ensure our tools are accurate and reliable, we cannot guarantee:
                    </p>
                    <ul className="space-y-2 text-muted-foreground mt-2">
                      <li>• That results will be error-free</li>
                      <li>• That tools will meet your specific requirements</li>
                      <li>• That tools will be available 100% of the time</li>
                      <li>• The accuracy of generated content or data</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">3. Intellectual Property</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Our Rights</h3>
                    <p className="text-muted-foreground">
                      All content, features, and functionality on our platform are owned by us and are protected by 
                      international copyright, trademark, and other intellectual property laws.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Your Rights</h3>
                    <p className="text-muted-foreground">
                      You retain all rights to any content you create or upload through our tools. However, by using 
                      our platform, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, 
                      modify, and display your content for the purpose of providing and improving our services.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">4. User-Generated Content</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Content Responsibility</h3>
                    <p className="text-muted-foreground">
                      You are solely responsible for any content you create, upload, or input through our tools. You agree not to:
                    </p>
                    <ul className="space-y-2 text-muted-foreground mt-2">
                      <li>• Upload content that infringes on third-party rights</li>
                      <li>• Upload content that is illegal, harmful, or offensive</li>
                      <li>• Upload content that contains viruses or malicious code</li>
                      <li>• Impersonate others or provide false information</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Content Removal</h3>
                    <p className="text-muted-foreground">
                      We reserve the right to remove any content that violates these terms or is otherwise objectionable, 
                      without prior notice.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">5. Privacy and Data</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Our Privacy Commitment</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <span>No data collection</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <span>Local processing only</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <span>No tracking or analytics</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <span>Complete privacy protection</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Your Data Responsibility</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span>You control your data</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span>Back up important results</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span>Use tools appropriately</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span>Respect third-party rights</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">6. Disclaimers and Limitations</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">"AS IS" Basis</h3>
                    <p className="text-muted-foreground">
                      Our platform is provided on an "as is" and "as available" basis. We make no warranties, expressed or implied, 
                      and hereby disclaim and negate all other warranties including without limitation, implied warranties or 
                      conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property 
                      or other violation of rights.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Limitation of Liability</h3>
                    <p className="text-muted-foreground">
                      In no event shall our platform be liable for any indirect, incidental, special, consequential, or punitive 
                      damages, including without limitation, loss of profits, data, or other intangible losses, resulting from:
                    </p>
                    <ul className="space-y-2 text-muted-foreground mt-2">
                      <li>• Your use or inability to use our platform</li>
                      <li>• Any unauthorized access to or use of our servers</li>
                      <li>• Any interruption or cessation of transmission to or from our platform</li>
                      <li>• Any bugs, viruses, or other harmful components</li>
                      <li>• Any errors or omissions in content or materials</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">7. Changes to Terms</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  We reserve the right to modify these terms at any time. When we do, we will post the updated terms on this page 
                  and update the "Last Updated" date. Your continued use of the platform after any such changes constitutes your 
                  acceptance of the new terms.
                </p>
                <p className="text-muted-foreground mt-4">
                  <strong>Last Updated:</strong> December 2024
                </p>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">8. Contact Information</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p><strong>Email:</strong> support@yourdomain.com</p>
                  <p className="mt-2"><strong>Address:</strong> 123 Terms Street, Terms City, TC 12345</p>
                  <p className="mt-2"><strong>Phone:</strong> +1 (555) 123-4567</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}