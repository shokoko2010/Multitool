'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Zap, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Users,
  Server,
  Database,
  Shield
} from 'lucide-react'

interface RateLimitConfig {
  requestsPerMinute: number
  requestsPerHour: number
  requestsPerDay: number
  burstLimit: number
  timeWindow: 'minute' | 'hour' | 'day'
  algorithm: 'fixed-window' | 'sliding-window' | 'token-bucket' | 'leaky-bucket'
}

interface RateLimitResult {
  currentRequests: number
  remainingRequests: number
  resetTime: Date
  isLimited: boolean
  waitTime: number
  utilization: number
  recommendations: string[]
}

interface UsagePattern {
  time: string
  requests: number
  cumulative: number
}

export default function APIRateLimitCalculator() {
  const [config, setConfig] = useState<RateLimitConfig>({
    requestsPerMinute: 60,
    requestsPerHour: 3600,
    requestsPerDay: 86400,
    burstLimit: 10,
    timeWindow: 'minute',
    algorithm: 'token-bucket'
  })

  const [currentUsage, setCurrentUsage] = useState<number>(0)
  const [result, setResult] = useState<RateLimitResult | null>(null)
  const [usagePattern, setUsagePattern] = useState<UsagePattern[]>([])
  const [simulationTime, setSimulationTime] = useState<number>(0)

  const calculateRateLimit = () => {
    const now = new Date()
    let resetTime = new Date(now)
    let limit = 0
    let remaining = 0
    let utilization = 0

    switch (config.timeWindow) {
      case 'minute':
        resetTime.setMinutes(resetTime.getMinutes() + 1)
        limit = config.requestsPerMinute
        break
      case 'hour':
        resetTime.setHours(resetTime.getHours() + 1)
        limit = config.requestsPerHour
        break
      case 'day':
        resetTime.setDate(resetTime.getDate() + 1)
        limit = config.requestsPerDay
        break
    }

    remaining = Math.max(0, limit - currentUsage)
    utilization = (currentUsage / limit) * 100

    const isLimited = remaining === 0
    const waitTime = isLimited ? Math.ceil((resetTime.getTime() - now.getTime()) / 1000) : 0

    const recommendations = generateRecommendations(utilization, config.algorithm, currentUsage, limit)

    setResult({
      currentRequests: currentUsage,
      remainingRequests: remaining,
      resetTime,
      isLimited,
      waitTime,
      utilization,
      recommendations
    })
  }

  const generateRecommendations = (
    utilization: number, 
    algorithm: string, 
    current: number, 
    limit: number
  ): string[] => {
    const recommendations: string[] = []

    if (utilization > 90) {
      recommendations.push('High utilization detected - consider increasing rate limits')
      recommendations.push('Implement caching to reduce API calls')
      recommendations.push('Use webhooks for real-time updates instead of polling')
    } else if (utilization > 70) {
      recommendations.push('Moderate utilization - monitor usage patterns')
      recommendations.push('Consider implementing request batching')
    }

    if (algorithm === 'fixed-window') {
      recommendations.push('Consider upgrading to sliding-window for smoother rate limiting')
    }

    if (current > limit * 0.8) {
      recommendations.push('Approaching rate limit - implement client-side throttling')
    }

    if (utilization < 20) {
      recommendations.push('Low utilization - consider reducing rate limits to save costs')
    }

    return recommendations
  }

  const simulateUsage = () => {
    const patterns: UsagePattern[] = []
    let cumulative = 0
    
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0') + ':00'
      // Simulate realistic usage patterns (higher during business hours)
      const baseRequests = config.requestsPerHour / 24
      const businessMultiplier = (i >= 9 && i <= 17) ? 2 : 0.5
      const randomFactor = 0.8 + Math.random() * 0.4
      const requests = Math.round(baseRequests * businessMultiplier * randomFactor)
      
      cumulative += requests
      
      patterns.push({
        time: hour,
        requests,
        cumulative
      })
    }
    
    setUsagePattern(patterns)
    setSimulationTime(Date.now())
  }

  const getAlgorithmDescription = (algorithm: string) => {
    switch (algorithm) {
      case 'fixed-window':
        return 'Resets request count at fixed intervals (e.g., every minute)'
      case 'sliding-window':
        return 'Tracks requests in a sliding time window for smoother limiting'
      case 'token-bucket':
        return 'Uses tokens that accumulate over time, allowing burst requests'
      case 'leaky-bucket':
        return 'Processes requests at a constant rate, queueing excess requests'
      default:
        return 'Unknown algorithm'
    }
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 90) return 'text-red-600'
    if (utilization > 70) return 'text-yellow-600'
    if (utilization > 50) return 'text-blue-600'
    return 'text-green-600'
  }

  const getUtilizationIcon = (utilization: number) => {
    if (utilization > 90) return <AlertTriangle className="h-5 w-5 text-red-500" />
    if (utilization > 70) return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    if (utilization > 50) return <TrendingUp className="h-5 w-5 text-blue-500" />
    return <CheckCircle className="h-5 w-5 text-green-500" />
  }

  useEffect(() => {
    calculateRateLimit()
  }, [config, currentUsage])

  useEffect(() => {
    simulateUsage()
  }, [config])

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Rate Limit Calculator</h1>
        <p className="text-muted-foreground">
          Calculate and optimize API rate limits with usage analysis and recommendations
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Rate Limit Configuration
            </CardTitle>
            <CardDescription>
              Configure your API rate limiting parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="requestsPerMinute">Requests per Minute</Label>
                <Input
                  id="requestsPerMinute"
                  type="number"
                  value={config.requestsPerMinute}
                  onChange={(e) => setConfig(prev => ({ ...prev, requestsPerMinute: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requestsPerHour">Requests per Hour</Label>
                <Input
                  id="requestsPerHour"
                  type="number"
                  value={config.requestsPerHour}
                  onChange={(e) => setConfig(prev => ({ ...prev, requestsPerHour: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="requestsPerDay">Requests per Day</Label>
                <Input
                  id="requestsPerDay"
                  type="number"
                  value={config.requestsPerDay}
                  onChange={(e) => setConfig(prev => ({ ...prev, requestsPerDay: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="burstLimit">Burst Limit</Label>
                <Input
                  id="burstLimit"
                  type="number"
                  value={config.burstLimit}
                  onChange={(e) => setConfig(prev => ({ ...prev, burstLimit: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="timeWindow">Primary Time Window</Label>
                <Select value={config.timeWindow} onValueChange={(value: any) => setConfig(prev => ({ ...prev, timeWindow: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minute">Per Minute</SelectItem>
                    <SelectItem value="hour">Per Hour</SelectItem>
                    <SelectItem value="day">Per Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="algorithm">Rate Limiting Algorithm</Label>
                <Select value={config.algorithm} onValueChange={(value: any) => setConfig(prev => ({ ...prev, algorithm: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed-window">Fixed Window</SelectItem>
                    <SelectItem value="sliding-window">Sliding Window</SelectItem>
                    <SelectItem value="token-bucket">Token Bucket</SelectItem>
                    <SelectItem value="leaky-bucket">Leaky Bucket</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentUsage">Current Usage (Current {config.timeWindow})</Label>
              <Input
                id="currentUsage"
                type="number"
                value={currentUsage}
                onChange={(e) => setCurrentUsage(parseInt(e.target.value) || 0)}
                placeholder="Current number of requests"
              />
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Algorithm:</strong> {config.algorithm.replace('-', ' ').toUpperCase()}
              </p>
              <p className="text-sm text-muted-foreground">
                {getAlgorithmDescription(config.algorithm)}
              </p>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Rate Limit Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    {getUtilizationIcon(result.utilization)}
                    <span className={`text-2xl font-bold ${getUtilizationColor(result.utilization)}`}>
                      {result.utilization.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Utilization Rate
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Requests:</span>
                    <span className="font-medium">{result.currentRequests}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Remaining Requests:</span>
                    <span className={`font-medium ${result.remainingRequests === 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {result.remainingRequests}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Reset Time:</span>
                    <span className="font-medium">{result.resetTime.toLocaleTimeString()}</span>
                  </div>
                  {result.isLimited && (
                    <div className="flex justify-between text-sm">
                      <span>Wait Time:</span>
                      <span className="font-medium text-red-600">{result.waitTime}s</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant={result.isLimited ? "destructive" : "default"}>
                      {result.isLimited ? 'Rate Limited' : 'Available'}
                    </Badge>
                  </div>
                  <Progress value={result.utilization} className="h-2" />
                </div>

                {result.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Recommendations</h4>
                    <div className="space-y-1">
                      {result.recommendations.map((rec, index) => (
                        <div key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Zap className="h-3 w-3 mt-0.5 text-blue-500" />
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Usage Pattern Analysis</CardTitle>
          <CardDescription>
            Simulated 24-hour usage pattern based on your rate limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chart">Hourly Usage</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="space-y-4">
              <div className="space-y-2">
                {usagePattern.map((point, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-16 text-sm text-muted-foreground">{point.time}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-6 bg-blue-500 rounded transition-all duration-300"
                          style={{ 
                            width: `${(point.requests / Math.max(...usagePattern.map(p => p.requests))) * 100}%` 
                          }}
                        />
                        <span className="text-sm font-medium">{point.requests}</span>
                      </div>
                    </div>
                    <div className="w-20 text-sm text-muted-foreground">
                      {point.cumulative.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {usagePattern.reduce((sum, p) => sum + p.requests, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Daily Requests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(usagePattern.reduce((sum, p) => sum + p.requests, 0) / 24)}
                  </div>
                  <div className="text-sm text-muted-foreground">Average per Hour</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.max(...usagePattern.map(p => p.requests))}
                  </div>
                  <div className="text-sm text-muted-foreground">Peak Hour</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Peak Hours</h4>
                <div className="flex flex-wrap gap-2">
                  {usagePattern
                    .filter(p => p.requests > usagePattern.reduce((sum, p) => sum + p.requests, 0) / 24)
                    .map((point, index) => (
                      <Badge key={index} variant="secondary">
                        {point.time} ({point.requests})
                      </Badge>
                    ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Rate Limiting Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Implementation Tips</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Use HTTP headers (X-RateLimit-Limit, X-RateLimit-Remaining)</li>
                <li>• Implement exponential backoff for retry logic</li>
                <li>• Provide clear error messages for rate limits</li>
                <li>• Consider different limits for different user tiers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Algorithm Selection</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Token Bucket: Good for burst traffic</li>
                <li>• Sliding Window: More accurate rate limiting</li>
                <li>• Fixed Window: Simple to implement</li>
                <li>• Leaky Bucket: Smooths out traffic spikes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}