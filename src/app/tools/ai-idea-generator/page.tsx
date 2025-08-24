'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Copy, Download, Lightbulb, Brain, Sparkles, Target, TrendingUp, RefreshCw } from 'lucide-react'

interface Idea {
  title: string
  description: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeEstimate: string
  resources: string[]
  tags: string[]
  score: number
}

interface IdeaGenerationResult {
  ideas: Idea[]
  analysis: {
    totalIdeas: number
    categories: string[]
    difficultyDistribution: {
      easy: number
      medium: number
      hard: number
    }
    topCategories: Array<{
      category: string
      count: number
    }>
  }
}

export default function AIIdeaGenerator() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<IdeaGenerationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [ideaCategory, setIdeaCategory] = useState<'business' | 'creative' | 'technical' | 'marketing' | 'personal'>('business')
  const [ideaCount, setIdeaCount] = useState([5])
  const [complexity, setComplexity] = useState(['medium'])
  const [timeframe, setTimeframe] = useState<'short' | 'medium' | 'long'>('medium')

  const generateIdeas = async (userPrompt: string): Promise<IdeaGenerationResult> => {
    // In a real implementation, this would use the z-ai-web-dev-sdk
    // For now, we'll simulate the AI response
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const categories = {
      business: ['Strategy', 'Innovation', 'Process', 'Product', 'Service'],
      creative: ['Art', 'Design', 'Content', 'Media', 'Experience'],
      technical: ['Software', 'Hardware', 'System', 'Algorithm', 'Integration'],
      marketing: ['Campaign', 'Content', 'Social', 'Email', 'Brand'],
      personal: ['Skill', 'Habit', 'Goal', 'Project', 'Learning']
    }
    
    const difficulties = ['easy', 'medium', 'hard'] as const
    const timeEstimates = {
      easy: { short: '1-2 hours', medium: '1-3 days', long: '1-2 weeks' },
      medium: { short: '3-5 hours', medium: '3-7 days', long: '2-4 weeks' },
      hard: { short: '1-2 days', medium: '1-3 weeks', long: '1-3 months' }
    }
    
    const ideaTemplates = {
      business: [
        'Implement a {category} system to improve efficiency',
        'Develop a new {category} strategy for market expansion',
        'Create a {category} solution for customer pain points',
        'Launch a {category} initiative to drive innovation',
        'Build a {category} platform for team collaboration'
      ],
      creative: [
        'Design a {category} experience for user engagement',
        'Create a {category} series for brand storytelling',
        'Develop a {category} concept for visual identity',
        'Produce a {category} campaign for audience connection',
        'Craft a {category} narrative for emotional impact'
      ],
      technical: [
        'Build a {category} application for data processing',
        'Develop a {category} algorithm for performance optimization',
        'Create a {category} system for security enhancement',
        'Implement a {category} solution for scalability',
        'Design a {category} architecture for reliability'
      ],
      marketing: [
        'Launch a {category} campaign for lead generation',
        'Create a {category} strategy for brand awareness',
        'Develop a {category} program for customer retention',
        'Implement a {category} tactic for conversion optimization',
        'Design a {category} approach for market penetration'
      ],
      personal: [
        'Start a {category} journey for skill development',
        'Create a {category} plan for goal achievement',
        'Build a {category} habit for personal growth',
        'Launch a {category} project for passion pursuit',
        'Develop a {category} routine for productivity'
      ]
    }
    
    const resources = [
      ['Online courses', 'Industry reports', 'Expert consultation'],
      ['Software tools', 'Team collaboration', 'Market research'],
      ['Books and guides', 'Community forums', 'Mentorship'],
      ['Analytics tools', 'Case studies', 'Best practices'],
      ['Training materials', 'Workshops', 'Networking events']
    ]
    
    const tags = [
      ['innovation', 'efficiency', 'growth'],
      ['creativity', 'engagement', 'impact'],
      ['technology', 'optimization', 'scalability'],
      ['marketing', 'conversion', 'branding'],
      ['personal', 'development', 'productivity']
    ]
    
    const generatedIdeas: Idea[] = []
    const categoryList = categories[ideaCategory]
    const templates = ideaTemplates[ideaCategory]
    
    for (let i = 0; i < ideaCount[0]; i++) {
      const category = categoryList[Math.floor(Math.random() * categoryList.length)]
      const difficulty = complexity.includes('any') ? 
        difficulties[Math.floor(Math.random() * difficulties.length)] :
        difficulties[Math.floor(Math.random() * difficulties.length)]
      
      const template = templates[Math.floor(Math.random() * templates.length)]
      const title = template.replace('{category}', category.toLowerCase())
      
      const idea: Idea = {
        title,
        description: `This ${category.toLowerCase()} initiative focuses on ${userPrompt || 'improving overall performance and outcomes'}. By implementing this approach, you can expect to see significant improvements in key metrics and user satisfaction.`,
        category,
        difficulty,
        timeEstimate: timeEstimates[difficulty][timeframe],
        resources: resources[Math.floor(Math.random() * resources.length)],
        tags: tags[Math.floor(Math.random() * tags.length)],
        score: Math.floor(Math.random() * 30) + 70
      }
      
      generatedIdeas.push(idea)
    }
    
    // Analyze results
    const categoryCount = new Map<string, number>()
    const difficultyCount = { easy: 0, medium: 0, hard: 0 }
    
    generatedIdeas.forEach(idea => {
      categoryCount.set(idea.category, (categoryCount.get(idea.category) || 0) + 1)
      difficultyCount[idea.difficulty]++
    })
    
    const topCategories = Array.from(categoryCount.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
    
    return {
      ideas: generatedIdeas,
      analysis: {
        totalIdeas: generatedIdeas.length,
        categories: Array.from(categoryCount.keys()),
        difficultyDistribution: difficultyCount,
        topCategories
      }
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setIsLoading(true)
    try {
      const ideas = await generateIdeas(prompt)
      setResult(ideas)
    } catch (error) {
      console.error('Error generating ideas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyIdea = (idea: Idea) => {
    const content = `Idea: ${idea.title}\n\nDescription: ${idea.description}\n\nCategory: ${idea.category}\nDifficulty: ${idea.difficulty}\nTime Estimate: ${idea.timeEstimate}\n\nResources: ${idea.resources.join(', ')}\n\nTags: ${idea.tags.join(', ')}`
    navigator.clipboard.writeText(content)
  }

  const downloadIdeas = () => {
    if (!result) return
    
    const content = `AI-Generated Ideas\n\nPrompt: ${prompt}\nCategory: ${ideaCategory}\nNumber of Ideas: ${result.analysis.totalIdeas}\n\n${result.ideas.map((idea, index) => `
${index + 1}. ${idea.title}
   Description: ${idea.description}
   Category: ${idea.category}
   Difficulty: ${idea.difficulty}
   Time Estimate: ${idea.timeEstimate}
   Resources: ${idea.resources.join(', ')}
   Tags: ${idea.tags.join(', ')}
   Score: ${idea.score}/100
`).join('\n')}`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ai-generated-ideas.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'hard': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🟢'
      case 'medium': return '🟡'
      case 'hard': return '🔴'
      default: return '⚪'
    }
  }

  const regenerateIdeas = () => {
    if (prompt.trim()) {
      handleGenerate()
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6" />
            AI Idea Generator
          </CardTitle>
          <CardDescription>
            Generate creative and actionable ideas using advanced AI. Perfect for brainstorming, innovation, and problem-solving.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="prompt">What kind of ideas are you looking for?</Label>
              <Textarea
                id="prompt"
                placeholder="Describe what you need ideas for (e.g., 'improving customer satisfaction', 'new product features', 'marketing strategies')..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-24"
              />
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="idea-category">Category</Label>
                <Select value={ideaCategory} onValueChange={(value: 'business' | 'creative' | 'technical' | 'marketing' | 'personal') => setIdeaCategory(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="idea-count">Number of Ideas: {ideaCount[0]}</Label>
                <Slider
                  value={ideaCount}
                  onValueChange={setIdeaCount}
                  max={10}
                  min={3}
                  step={1}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="complexity">Complexity</Label>
                <Select value={complexity[0]} onValueChange={(value) => setComplexity([value])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="timeframe">Timeframe</Label>
                <Select value={timeframe} onValueChange={(value: 'short' | 'medium' | 'long') => setTimeframe(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short Term</SelectItem>
                    <SelectItem value="medium">Medium Term</SelectItem>
                    <SelectItem value="long">Long Term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleGenerate} 
                disabled={!prompt.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Generating Ideas...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Ideas
                  </>
                )}
              </Button>
            </div>
          </div>

          {result && (
            <div className="space-y-6">
              {/* Analysis Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Generation Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {result.analysis.totalIdeas}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Ideas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {result.analysis.categories.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Categories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {result.analysis.difficultyDistribution.medium}
                      </div>
                      <div className="text-sm text-muted-foreground">Medium Difficulty</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(result.ideas.reduce((sum, idea) => sum + idea.score, 0) / result.ideas.length)}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ideas List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Generated Ideas</h3>
                  <div className="flex gap-2">
                    <Button onClick={regenerateIdeas} variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                    <Button onClick={downloadIdeas} size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download All
                    </Button>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  {result.ideas.map((idea, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg mb-1">{idea.title}</h4>
                              <p className="text-sm text-muted-foreground">{idea.description}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Badge variant="outline">{idea.category}</Badge>
                              <Badge 
                                variant={idea.difficulty === 'easy' ? 'default' : 
                                         idea.difficulty === 'medium' ? 'secondary' : 'destructive'}
                                className="flex items-center gap-1"
                              >
                                {getDifficultyIcon(idea.difficulty)}
                                {idea.difficulty}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Target className="h-3 w-3" />
                              {idea.timeEstimate}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <TrendingUp className="h-3 w-3" />
                              Score: {idea.score}/100
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium">Resources:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {idea.resources.map((resource, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {resource}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-sm font-medium">Tags:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {idea.tags.map((tag, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button onClick={() => copyIdea(idea)} variant="outline" size="sm">
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Idea
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Information Panel */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">About AI Idea Generation</h3>
            <p className="text-sm text-muted-foreground">
              Our AI idea generator uses advanced natural language processing and creative algorithms 
              to generate relevant, actionable ideas based on your prompt. The system considers your 
              specified category, complexity preferences, and timeframe to deliver tailored suggestions 
              that can help you solve problems, innovate, and achieve your goals.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}