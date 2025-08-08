"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Grid3X3, 
  TrendingUp, 
  Brain, 
  Code, 
  Image, 
  Calculator, 
  Hash, 
  Shield, 
  Globe,
  Settings,
  ArrowRight,
  Zap,
  Users,
  Star,
  BarChart3
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function CategoriesPage() {
  const categories = [
    {
      id: 'all',
      name: 'All Tools',
      description: 'Browse all 235+ tools available on our platform',
      icon: Grid3X3,
      count: 235,
      color: 'bg-blue-100 text-blue-800',
      featured: true,
      popular: true,
      tools: [
        'SEO Analyzer', 'Meta Tag Generator', 'Image Optimizer', 'Password Generator',
        'JSON Formatter', 'Base64 Encoder', 'QR Code Generator', 'Text to Speech'
      ]
    },
    {
      id: 'seo',
      name: 'SEO Tools',
      description: 'Search engine optimization tools to improve your website rankings',
      icon: TrendingUp,
      count: 13,
      color: 'bg-green-100 text-green-800',
      featured: true,
      popular: true,
      tools: [
        'SEO Analyzer', 'Keyword Density', 'Meta Tag Generator', 'SERP Checker',
        'Backlink Checker', 'Plagiarism Checker', 'Readability Score', 'Robots.txt Generator'
      ]
    },
    {
      id: 'ai',
      name: 'AI Tools',
      description: 'Artificial intelligence powered tools for content creation and analysis',
      icon: Brain,
      count: 8,
      color: 'bg-purple-100 text-purple-800',
      featured: true,
      popular: true,
      tools: [
        'AI Content Generator', 'AI SEO Title', 'AI SEO Description', 'AI Keyword Cluster',
        'Text Summarizer', 'Sentiment Analyzer', 'Paraphraser'
      ]
    },
    {
      id: 'development',
      name: 'Development Tools',
      description: 'Coding and development utilities for programmers',
      icon: Code,
      count: 15,
      color: 'bg-orange-100 text-orange-800',
      featured: true,
      tools: [
        'JSON Formatter', 'XML Formatter', 'HTML Formatter', 'SQL Formatter',
        'Regex Tester', 'JavaScript Formatter', 'CSS Formatter'
      ]
    },
    {
      id: 'image',
      name: 'Image Tools',
      description: 'Image processing, conversion, and optimization utilities',
      icon: Image,
      count: 10,
      color: 'bg-pink-100 text-pink-800',
      popular: true,
      tools: [
        'Image Converter', 'Image Resizer', 'Image Compressor', 'EXIF Reader',
        'QR Code Generator', 'Color Picker'
      ]
    },
    {
      id: 'converters',
      name: 'Converters',
      description: 'Unit, data, and format conversion tools',
      icon: Calculator,
      count: 8,
      color: 'bg-yellow-100 text-yellow-800',
      tools: [
        'Temperature Converter', 'Distance Converter', 'Weight Converter',
        'Timestamp Converter', 'Data Size Converter'
      ]
    },
    {
      id: 'cryptography',
      name: 'Cryptography',
      description: 'Encryption, hashing, and security tools',
      icon: Hash,
      count: 12,
      color: 'bg-red-100 text-red-800',
      popular: true,
      tools: [
        'MD5 Generator', 'SHA-256 Generator', 'BCrypt Generator', 'UUID Generator',
        'Hash Checker', 'Token Generator'
      ]
    },
    {
      id: 'security',
      name: 'Security Tools',
      description: 'Security analysis and vulnerability checking tools',
      icon: Shield,
      count: 9,
      color: 'bg-gray-100 text-gray-800',
      tools: [
        'Safe URL Checker', 'Password Strength', 'SSL Checker', 'Meta Tags Checker',
        'Whois Lookup', 'Port Scanner'
      ]
    },
    {
      id: 'network',
      name: 'Network Tools',
      description: 'Networking utilities and diagnostics',
      icon: Globe,
      count: 11,
      color: 'bg-cyan-100 text-cyan-800',
      tools: [
        'DNS Lookup', 'IP Lookup', 'Ping Tool', 'HTTP Headers',
        'HTTP Request', 'Reverse IP'
      ]
    },
    {
      id: 'text',
      name: 'Text Utilities',
      description: 'Text processing and manipulation tools',
      icon: Settings,
      count: 18,
      color: 'bg-indigo-100 text-indigo-800',
      popular: true,
      tools: [
        'Text to Speech', 'Case Converter', 'Character Counter', 'Email Extractor',
        'Reverse Text', 'URL Encoder', 'Word Counter'
      ]
    },
    {
      id: 'data',
      name: 'Data Analysis',
      description: 'Data processing, analysis, and visualization tools',
      icon: BarChart3,
      count: 1,
      color: 'bg-purple-100 text-purple-800',
      featured: true,
      tools: [
        'Data Visualization Tool'
      ]
    }
  ]

  const featuredCategories = categories.filter(cat => cat.featured)
  const popularCategories = categories.filter(cat => cat.popular)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Grid3X3 className="w-4 h-4 mr-2" />
              Browse by Category
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold">
              Organized Tools for Every Need
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Find exactly what you're looking for with our well-organized tool categories. 
              Each category contains specialized tools to help you complete tasks efficiently.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Featured Categories</h2>
            <p className="text-muted-foreground text-lg">
              Handpicked categories that our users love most
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => window.location.href = `/categories/${category.id}`}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg ${category.color}`}>
                        <category.icon className="h-6 w-6" />
                      </div>
                      <div className="flex gap-1">
                        {category.featured && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {category.popular && (
                          <Badge variant="default" className="text-xs">
                            Popular
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{category.count} Tools</Badge>
                        <Button variant="ghost" size="sm">
                          View All
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Popular Tools:</h4>
                        <div className="flex flex-wrap gap-1">
                          {category.tools.slice(0, 4).map((tool, toolIndex) => (
                            <Badge key={toolIndex} variant="secondary" className="text-xs">
                              {tool}
                            </Badge>
                          ))}
                          {category.tools.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{category.tools.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Categories Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">All Categories</h2>
            <p className="text-muted-foreground text-lg">
              Browse all available tool categories
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() => window.location.href = `/categories/${category.id}`}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-primary/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        <category.icon className="h-5 w-5" />
                      </div>
                      <Badge variant="outline">{category.count}</Badge>
                    </div>
                    <CardTitle className="text-base leading-tight">{category.name}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {category.featured && (
                          <Badge variant="secondary" className="text-xs">Featured</Badge>
                        )}
                        {category.popular && (
                          <Badge variant="default" className="text-xs">Popular</Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Platform Statistics</h2>
            <p className="text-muted-foreground text-lg">
              See the scale and variety of our tool collection
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center space-y-2"
            >
              <div className="text-4xl font-bold text-primary bg-primary/10 rounded-lg p-4">
                235+
              </div>
              <div className="text-muted-foreground">Total Tools</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center space-y-2"
            >
              <div className="text-4xl font-bold text-primary bg-primary/10 rounded-lg p-4">
                11
              </div>
              <div className="text-muted-foreground">Categories</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center space-y-2"
            >
              <div className="text-4xl font-bold text-primary bg-primary/10 rounded-lg p-4">
                50K+
              </div>
              <div className="text-muted-foreground">Daily Users</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center space-y-2"
            >
              <div className="text-4xl font-bold text-primary bg-primary/10 rounded-lg p-4">
                4.9/5
              </div>
              <div className="text-muted-foreground">Average Rating</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <h2 className="text-3-4xl md:text-4xl font-bold">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-lg text-muted-foreground">
              We're constantly adding new tools to our platform. Let us know what tools you'd like to see next!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-3 text-base">
                Request a Tool
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3 text-base">
                Contact Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}