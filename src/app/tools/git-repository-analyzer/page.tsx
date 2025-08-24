'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  GitBranch, 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  GitCommit,
  GitPullRequest,
  GitMerge
} from 'lucide-react'

interface GitCommit {
  hash: string
  author: string
  email: string
  date: string
  message: string
  filesChanged: number
  insertions: number
  deletions: number
  branch: string
}

interface GitBranch {
  name: string
  lastCommit: string
  commitCount: number
  author: string
  isProtected: boolean
  isDefault: boolean
}

interface GitContributor {
  name: string
  email: string
  commits: number
  additions: number
  deletions: number
  firstCommit: string
  lastCommit: string
  languages: string[]
}

interface GitRepository {
  name: string
  description: string
  url: string
  isPrivate: boolean
  createdAt: string
  updatedAt: string
  size: number
  stargazers: number
  forks: number
  issues: {
    open: number
    closed: number
  }
  pullRequests: {
    open: number
    closed: number
    merged: number
  }
  languages: Array<{
    name: string
    percentage: number
    color: string
  }>
  branches: GitBranch[]
  contributors: GitContributor[]
  recentCommits: GitCommit[]
  stats: {
    totalCommits: number
    totalContributors: number
    avgCommitsPerDay: number
    codeChurn: number
    busFactor: number
  }
}

interface AnalysisResult {
  repository: GitRepository
  health: {
    score: number
    grade: 'A' | 'B' | 'C' | 'D' | 'F'
    issues: string[]
    recommendations: string[]
  }
  activity: {
    daily: Array<{ date: string; commits: number }>
    weekly: Array<{ week: string; commits: number }>
    monthly: Array<{ month: string; commits: number }>
  }
  insights: {
    mostActiveContributor: string
    mostChangedFile: string
    commitFrequency: string
    collaborationScore: number
  }
}

const sampleRepositories = [
  {
    name: 'my-awesome-project',
    description: 'A comprehensive web application built with modern technologies',
    url: 'https://github.com/user/my-awesome-project',
    isPrivate: false,
    createdAt: '2023-01-15',
    updatedAt: '2024-01-20',
    size: 15420,
    stargazers: 142,
    forks: 28,
    issues: { open: 12, closed: 89 },
    pullRequests: { open: 3, closed: 45, merged: 42 },
    languages: [
      { name: 'JavaScript', percentage: 65, color: '#f1e05a' },
      { name: 'TypeScript', percentage: 20, color: '#3178c6' },
      { name: 'CSS', percentage: 10, color: '#563d7c' },
      { name: 'HTML', percentage: 5, color: '#e34c26' }
    ],
    branches: [
      { name: 'main', lastCommit: 'abc123', commitCount: 156, author: 'John Doe', isProtected: true, isDefault: true },
      { name: 'develop', lastCommit: 'def456', commitCount: 89, author: 'Jane Smith', isProtected: false, isDefault: false },
      { name: 'feature/auth', lastCommit: 'ghi789', commitCount: 23, author: 'Bob Johnson', isProtected: false, isDefault: false }
    ],
    contributors: [
      { name: 'John Doe', email: 'john@example.com', commits: 89, additions: 15420, deletions: 3210, firstCommit: '2023-01-15', lastCommit: '2024-01-18', languages: ['JavaScript', 'TypeScript'] },
      { name: 'Jane Smith', email: 'jane@example.com', commits: 45, additions: 8920, deletions: 1540, firstCommit: '2023-02-20', lastCommit: '2024-01-15', languages: ['TypeScript', 'CSS'] },
      { name: 'Bob Johnson', email: 'bob@example.com', commits: 22, additions: 3420, deletions: 890, firstCommit: '2023-03-10', lastCommit: '2024-01-10', languages: ['JavaScript', 'HTML'] }
    ],
    recentCommits: [
      { hash: 'abc123', author: 'John Doe', email: 'john@example.com', date: '2024-01-20', message: 'feat: Add user authentication system', filesChanged: 12, insertions: 342, deletions: 45, branch: 'main' },
      { hash: 'def456', author: 'Jane Smith', email: 'jane@example.com', date: '2024-01-18', message: 'fix: Resolve login validation issues', filesChanged: 5, insertions: 89, deletions: 23, branch: 'develop' },
      { hash: 'ghi789', author: 'Bob Johnson', email: 'bob@example.com', date: '2024-01-15', message: 'docs: Update API documentation', filesChanged: 8, insertions: 234, deletions: 67, branch: 'feature/auth' }
    ],
    stats: {
      totalCommits: 156,
      totalContributors: 3,
      avgCommitsPerDay: 0.8,
      codeChurn: 0.15,
      busFactor: 2
    }
  }
]

export default function GitRepositoryAnalyzer() {
  const [repositoryUrl, setRepositoryUrl] = useState<string>('')
  const [selectedRepo, setSelectedRepo] = useState<string>('')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)

  const analyzeRepository = async () => {
    setIsAnalyzing(true)
    
    try {
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const repoData = sampleRepositories[0]
      const result = performRepositoryAnalysis(repoData)
      setAnalysisResult(result)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const performRepositoryAnalysis = (repoData: GitRepository): AnalysisResult => {
    // Calculate health score
    let healthScore = 100
    
    // Deduct for issues
    if (repoData.issues.open > 20) healthScore -= 10
    if (repoData.pullRequests.open > 10) healthScore -= 5
    if (repoData.stats.busFactor < 2) healthScore -= 20
    if (repoData.stats.codeChurn > 0.3) healthScore -= 10
    if (repoData.contributors.length < 2) healthScore -= 15
    
    healthScore = Math.max(0, healthScore)
    
    // Determine grade
    let grade: AnalysisResult['health']['grade'] = 'A'
    if (healthScore < 60) grade = 'F'
    else if (healthScore < 70) grade = 'D'
    else if (healthScore < 80) grade = 'C'
    else if (healthScore < 90) grade = 'B'
    
    // Generate issues
    const issues: string[] = []
    if (repoData.issues.open > 20) issues.push('High number of open issues')
    if (repoData.pullRequests.open > 10) issues.push('Many open pull requests')
    if (repoData.stats.busFactor < 2) issues.push('Low bus factor - project risk')
    if (repoData.stats.codeChurn > 0.3) issues.push('High code churn detected')
    if (repoData.contributors.length < 2) issues.push('Single contributor dependency')
    
    // Generate recommendations
    const recommendations: string[] = []
    if (repoData.issues.open > 20) recommendations.push('Address open issues to improve project health')
    if (repoData.pullRequests.open > 10) recommendations.push('Review and merge pending pull requests')
    if (repoData.stats.busFactor < 2) recommendations.push('Encourage more contributors to join the project')
    if (repoData.stats.codeChurn > 0.3) recommendations.push('Review code changes to reduce churn')
    if (repoData.contributors.length < 2) recommendations.push('Document code to attract new contributors')
    
    // Generate activity data
    const dailyActivity = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return {
        date: date.toISOString().split('T')[0],
        commits: Math.floor(Math.random() * 5)
      }
    }).reverse()
    
    const weeklyActivity = Array.from({ length: 12 }, (_, i) => {
      const week = new Date()
      week.setDate(week.getDate() - (i * 7))
      return {
        week: `Week ${12 - i}`,
        commits: Math.floor(Math.random() * 20) + 5
      }
    }).reverse()
    
    const monthlyActivity = Array.from({ length: 12 }, (_, i) => {
      const month = new Date()
      month.setMonth(month.getMonth() - i)
      return {
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        commits: Math.floor(Math.random() * 100) + 20
      }
    }).reverse()
    
    // Calculate insights
    const mostActiveContributor = repoData.contributors.reduce((prev, current) => 
      prev.commits > current.commits ? prev : current
    )
    
    const commitFrequency = repoData.stats.totalCommits > 100 ? 'High' : 
                           repoData.stats.totalCommits > 50 ? 'Medium' : 'Low'
    
    const collaborationScore = Math.min(100, (repoData.contributors.length * 20) + 
                                   (repoData.stats.totalCommits / repoData.contributors.length))
    
    return {
      repository: repoData,
      health: {
        score: healthScore,
        grade,
        issues,
        recommendations
      },
      activity: {
        daily: dailyActivity,
        weekly: weeklyActivity,
        monthly: monthlyActivity
      },
      insights: {
        mostActiveContributor: mostActiveContributor.name,
        mostChangedFile: 'src/components/App.js', // Simplified
        commitFrequency,
        collaborationScore
      }
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 80) return 'text-blue-600 bg-blue-100'
    if (score >= 70) return 'text-yellow-600 bg-yellow-100'
    if (score >= 60) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getHealthIcon = (grade: string) => {
    switch (grade) {
      case 'A':
      case 'B':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'C':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'D':
      case 'F':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  const loadSampleRepository = () => {
    setSelectedRepo(sampleRepositories[0].name)
    setRepositoryUrl(sampleRepositories[0].url)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Git Repository Analyzer</h1>
        <p className="text-muted-foreground">
          Analyze Git repositories for health metrics, contributor activity, and code insights
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Repository Analysis
          </CardTitle>
          <CardDescription>
            Enter a repository URL to analyze its health and activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="repositoryUrl">Repository URL</Label>
              <Input
                id="repositoryUrl"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={loadSampleRepository} variant="outline">
                Load Sample
              </Button>
              <Button onClick={analyzeRepository} disabled={isAnalyzing || !repositoryUrl.trim()}>
                {isAnalyzing ? (
                  <>
                    <GitCommit className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {analysisResult && (
        <div className="grid gap-6 lg:grid-cols-3 mt-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Repository Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    {getHealthIcon(analysisResult.health.grade)}
                    <span className={`text-2xl font-bold ${getHealthColor(analysisResult.health.score).split(' ')[0]}`}>
                      {analysisResult.health.score}/100
                    </span>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${getHealthColor(analysisResult.health.score)}`}>
                    <span className="font-semibold">Grade {analysisResult.health.grade}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Commits:</span>
                    <span className="font-medium">{analysisResult.repository.stats.totalCommits}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Contributors:</span>
                    <span className="font-medium">{analysisResult.repository.stats.totalContributors}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Bus Factor:</span>
                    <span className="font-medium">{analysisResult.repository.stats.busFactor}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Code Churn:</span>
                    <span className="font-medium">{(analysisResult.repository.stats.codeChurn * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Languages</h4>
                  <div className="space-y-2">
                    {analysisResult.repository.languages.map((lang, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: lang.color }}
                          />
                          <span className="text-sm">{lang.name}</span>
                        </div>
                        <span className="text-sm font-medium">{lang.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Repository Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">{analysisResult.repository.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {analysisResult.repository.description}
                  </p>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <GitBranch className="h-4 w-4" />
                      <span>{analysisResult.repository.branches.length} branches</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{analysisResult.repository.contributors.length} contributors</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created {new Date(analysisResult.repository.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{analysisResult.repository.stargazers}</div>
                    <div className="text-sm text-muted-foreground">Stars</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{analysisResult.repository.forks}</div>
                    <div className="text-sm text-muted-foreground">Forks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{analysisResult.repository.size} KB</div>
                    <div className="text-sm text-muted-foreground">Size</div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2">Issues</h4>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-green-600 font-medium">{analysisResult.repository.issues.closed}</span>
                        <span className="text-muted-foreground"> closed</span>
                      </div>
                      <div>
                        <span className="text-red-600 font-medium">{analysisResult.repository.issues.open}</span>
                        <span className="text-muted-foreground"> open</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Pull Requests</h4>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-green-600 font-medium">{analysisResult.repository.pullRequests.merged}</span>
                        <span className="text-muted-foreground"> merged</span>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">{analysisResult.repository.pullRequests.closed}</span>
                        <span className="text-muted-foreground"> closed</span>
                      </div>
                      <div>
                        <span className="text-red-600 font-medium">{analysisResult.repository.pullRequests.open}</span>
                        <span className="text-muted-foreground"> open</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {analysisResult && (
        <Tabs defaultValue="activity" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="contributors">Contributors</TabsTrigger>
            <TabsTrigger value="health">Health Details</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Commit Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="daily" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="daily">Daily</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  </TabsList>

                  <TabsContent value="daily" className="space-y-4">
                    <div className="space-y-2">
                      {analysisResult.activity.daily.slice(-7).map((day, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{day.date}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${(day.commits / 5) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8">{day.commits}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="weekly" className="space-y-4">
                    <div className="space-y-2">
                      {analysisResult.activity.weekly.map((week, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{week.week}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${(week.commits / 25) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8">{week.commits}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="monthly" className="space-y-4">
                    <div className="space-y-2">
                      {analysisResult.activity.monthly.map((month, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{month.month}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-40 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full" 
                                style={{ width: `${(month.commits / 120) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12">{month.commits}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Commits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisResult.repository.recentCommits.map((commit, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-sm">{commit.message}</div>
                          <div className="text-xs text-muted-foreground">
                            {commit.author} • {new Date(commit.date).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge variant="outline">{commit.branch}</Badge>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>{commit.filesChanged} files changed</span>
                        <span className="text-green-600">+{commit.insertions}</span>
                        <span className="text-red-600">-{commit.deletions}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contributors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contributor Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.repository.contributors.map((contributor, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{contributor.name}</h4>
                          <p className="text-sm text-muted-foreground">{contributor.email}</p>
                        </div>
                        <Badge variant="secondary">
                          {contributor.commits} commits
                        </Badge>
                      </div>
                      
                      <div className="grid gap-3 md:grid-cols-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Additions:</span>
                          <span className="ml-2 font-medium text-green-600">+{contributor.additions}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Deletions:</span>
                          <span className="ml-2 font-medium text-red-600">-{contributor.deletions}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">First Commit:</span>
                          <span className="ml-2 font-medium">{new Date(contributor.firstCommit).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {contributor.languages.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm text-muted-foreground">Languages:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {contributor.languages.map((lang, langIndex) => (
                              <Badge key={langIndex} variant="outline" className="text-xs">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Health Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisResult.health.issues.length > 0 ? (
                    <div className="space-y-3">
                      {analysisResult.health.issues.map((issue, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border border-red-200 bg-red-50 rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                          <span className="text-sm text-red-800">{issue}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p className="text-green-600 font-medium">No health issues detected!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisResult.health.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border border-blue-200 bg-blue-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span className="text-sm text-blue-800">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-1">Most Active Contributor</h4>
                      <p className="text-sm text-muted-foreground">{analysisResult.insights.mostActiveContributor}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Commit Frequency</h4>
                      <p className="text-sm text-muted-foreground">{analysisResult.insights.commitFrequency}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Collaboration Score</h4>
                      <div className="flex items-center gap-2">
                        <Progress value={analysisResult.insights.collaborationScore} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{analysisResult.insights.collaborationScore.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Branch Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisResult.repository.branches.map((branch, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          {branch.isDefault && <Badge variant="default">Default</Badge>}
                          {branch.isProtected && <Badge variant="secondary">Protected</Badge>}
                          <span className="font-medium">{branch.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {branch.commitCount} commits
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}