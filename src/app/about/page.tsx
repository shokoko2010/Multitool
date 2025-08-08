import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Globe, Shield, Zap, Users, Award, Heart, Github, Twitter, Mail } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'About Us - Free Online Tools Platform',
  description: 'Learn about our mission to provide free, powerful online tools for SEO, development, design, and productivity. Discover our story, team, and commitment to excellence.',
  keywords: ['about us', 'our mission', 'team', 'free online tools', 'seo tools', 'development tools'],
  openGraph: {
    title: 'About Us - Free Online Tools Platform',
    description: 'Learn about our mission to provide free, powerful online tools for professionals and beginners.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'About Us - Free Online Tools Platform',
    description: 'Learn about our mission to provide free, powerful online tools.',
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center space-y-6 mb-16">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            <Award className="w-4 h-4 mr-2" />
            Our Story
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            About Our Multi-Tool Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're on a mission to provide free, powerful online tools that help professionals and beginners 
            accomplish their goals faster and more efficiently.
          </p>
        </section>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-6">
                To democratize access to powerful online tools by providing them completely free of charge. 
                We believe everyone should have access to the tools they need to succeed, regardless of their budget.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Free forever - No hidden costs</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Privacy-focused - No data collection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Professional-grade tools for everyone</span>
                </div>
              </div>
            </div>
            <Card className="p-6">
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">235+</div>
                <div className="text-sm text-muted-foreground">Free Tools Available</div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                <div>
                  <div className="text-2xl font-bold">50K+</div>
                  <div className="text-xs text-muted-foreground">Daily Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">1M+</div>
                  <div className="text-xs text-muted-foreground">Tools Used</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">4.9</div>
                  <div className="text-xs text-muted-foreground">User Rating</div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Platform?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle className="mb-2">Secure & Private</CardTitle>
              <CardDescription>
                All tools run locally in your browser. We don't collect or store any of your data.
              </CardDescription>
            </Card>
            <Card className="text-center p-6">
              <Zap className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle className="mb-2">Lightning Fast</CardTitle>
              <CardDescription>
                Optimized for performance with instant results and minimal loading times.
              </CardDescription>
            </Card>
            <Card className="text-center p-6">
              <Globe className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle className="mb-2">Cross-Platform</CardTitle>
              <CardDescription>
                Works perfectly on desktop, tablet, and mobile devices. No installation required.
              </CardDescription>
            </Card>
          </div>
        </section>

        {/* Categories Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Tool Categories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'SEO Tools', count: 15, description: 'Search engine optimization tools' },
              { name: 'Network Tools', count: 8, description: 'Network diagnostics and analysis' },
              { name: 'Security Tools', count: 12, description: 'Security and vulnerability checking' },
              { name: 'Text Utilities', count: 10, description: 'Text processing and manipulation' },
              { name: 'Image Tools', count: 8, description: 'Image processing and conversion' },
              { name: 'Development Tools', count: 15, description: 'Coding and development utilities' },
              { name: 'AI Tools', count: 8, description: 'Artificial intelligence and automation' },
              { name: 'Converters', count: 6, description: 'Unit and data conversion tools' },
              { name: 'Cryptography', count: 5, description: 'Encryption and hashing utilities' },
            ].map((category) => (
              <Link key={category.name} href={`/categories/${category.name.toLowerCase().replace(' ', '-')}`}>
                <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold mb-1">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                      <Badge variant="outline">{category.count} tools</Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="mb-2">Development Team</CardTitle>
              <CardDescription>
                Passionate developers working around the clock to build and maintain our tools.
              </CardDescription>
            </Card>
            <Card className="text-center p-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Heart className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="mb-2">Design Team</CardTitle>
              <CardDescription>
                Creative designers ensuring our tools are beautiful and user-friendly.
              </CardDescription>
            </Card>
            <Card className="text-center p-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Award className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="mb-2">Quality Assurance</CardTitle>
              <CardDescription>
                Dedicated QA team ensuring every tool works perfectly and meets high standards.
              </CardDescription>
            </Card>
          </div>
        </section>

        {/* Contact Section */}
        <section className="text-center space-y-8">
          <h2 className="text-3xl font-bold">Get In Touch</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have questions, suggestions, or feedback? We'd love to hear from you! 
            Our team is always working to improve our tools and user experience.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="sm">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
            <Button variant="outline" size="sm">
              <Twitter className="w-4 h-4 mr-2" />
              Twitter
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}