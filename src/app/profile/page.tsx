'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Mail, Calendar, Shield, Activity, Settings, Palette, Globe, Bell, Star, Heart } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { UsageService } from '@/lib/auth/services'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { tools } from '@/data/tools'

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  notifications: boolean
  newsletter: boolean
  preferredCategories: string[]
  favoriteTools: string[]
  recentTools: string[]
}

interface ToolRecommendation {
  tool: any
  score: number
  reason: string
}

interface UserProfile {
  id: string
  email: string
  name?: string
  role: string
  createdAt: string
  subscription?: {
    id: string
    plan: {
      name: string
      description: string
      price: number
      features: string
    }
    status: string
    startedAt: string
    endsAt?: string
  }
  usage: Array<{
    id: string
    toolId: string
    count: number
    lastUsed: string
  }>
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      window.location.href = '/auth/signin'
      return
    }

    fetchUserProfile()
  }, [session, status])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setUser(data)
        setFormData({
          name: data.name || '',
          email: data.email
        })
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setUser(prev => prev ? { ...prev, ...formData } : null)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!session || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Profile</h1>
              <p className="text-muted-foreground">
                Manage your account and view your activity
              </p>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="subscription">Subscription</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Profile Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your account details and personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit">Save Changes</Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src="/avatar.jpg" />
                            <AvatarFallback>
                              {user.name?.charAt(0) || user.email.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold">{user.name || 'No name set'}</h3>
                            <p className="text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{user.name || 'No name set'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{user.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                            <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </div>
                        </div>
                        
                        <Button onClick={() => setIsEditing(true)}>
                          Edit Profile
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Tools Used</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{user.usage.length}</div>
                      <p className="text-xs text-muted-foreground">
                        Different tools accessed
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {user.usage.reduce((sum, item) => sum + item.count, 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total tool interactions
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Member Since</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {new Date(user.createdAt).getFullYear()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Account created
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Preferences</CardTitle>
                    <CardDescription>
                      Customize your experience and settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PreferencesTab />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personalized Recommendations</CardTitle>
                    <CardDescription>
                      Tools recommended based on your usage and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecommendationsTab />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subscription" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Subscription</CardTitle>
                    <CardDescription>
                      Manage your subscription and billing information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {user.subscription ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{user.subscription.plan.name}</h3>
                            <p className="text-muted-foreground">{user.subscription.plan.description}</p>
                          </div>
                          <Badge variant={user.subscription.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {user.subscription.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Price:</span> ${user.subscription.plan.price}/month
                          </div>
                          <div>
                            <span className="font-medium">Started:</span> {new Date(user.subscription.startedAt).toLocaleDateString()}
                          </div>
                          {user.subscription.endsAt && (
                            <div>
                              <span className="font-medium">Ends:</span> {new Date(user.subscription.endsAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button asChild>
                            <a href="/subscription">Manage Subscription</a>
                          </Button>
                          <Button variant="outline" asChild>
                            <a href="/subscription">Change Plan</a>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
                        <p className="text-muted-foreground mb-4">
                          Subscribe to a plan to access premium features and tools
                        </p>
                        <Button asChild>
                          <a href="/subscription">View Plans</a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your recent tool usage and activity history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {user.usage.length > 0 ? (
                      <div className="space-y-3">
                        {user.usage.slice(0, 10).map((usage) => (
                          <div key={usage.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Activity className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Tool ID: {usage.toolId}</p>
                                <p className="text-sm text-muted-foreground">
                                  Last used: {new Date(usage.lastUsed).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {usage.count} uses
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No activity yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

function PreferencesTab() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    if (session) {
      fetchPreferences()
    }
  }, [session])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences')
      if (response.ok) {
        const data = await response.json()
        setPreferences(data)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!preferences) return

    try {
      setSaving(true)
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const updated = await response.json()
        setPreferences(updated)
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleFavorite = async (toolId: string) => {
    if (!preferences) return

    try {
      const isFavorite = preferences.favoriteTools.includes(toolId)
      const response = await fetch('/api/user/favorites', {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toolId }),
        ...(isFavorite && {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      })

      if (response.ok) {
        const updatedFavorites = await response.json()
        setPreferences(prev => prev ? { ...prev, favoriteTools: updatedFavorites } : null)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const toggleCategory = async (category: string) => {
    if (!preferences) return

    const isSelected = preferences.preferredCategories.includes(category)
    const updatedCategories = isSelected
      ? preferences.preferredCategories.filter(c => c !== category)
      : [...preferences.preferredCategories, category]

    await updatePreferences({ preferredCategories: updatedCategories })
  }

  if (loading) {
    return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
  }

  if (!preferences) {
    return <div className="text-center text-muted-foreground">Failed to load preferences</div>
  }

  const allCategories = [...new Set(tools.map(tool => tool.category))]

  return (
    <div className="space-y-6">
      {/* Appearance Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Appearance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={preferences.theme}
              onValueChange={(value: 'light' | 'dark' | 'system') => 
                updatePreferences({ theme: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Language</Label>
            <Select
              value={preferences.language}
              onValueChange={(value) => updatePreferences({ language: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select
              value={preferences.timezone}
              onValueChange={(value) => updatePreferences({ timezone: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about your account and tools
              </p>
            </div>
            <Switch
              checked={preferences.notifications}
              onCheckedChange={(checked) => updatePreferences({ notifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Newsletter</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about new tools and features
              </p>
            </div>
            <Switch
              checked={preferences.newsletter}
              onCheckedChange={(checked) => updatePreferences({ newsletter: checked })}
            />
          </div>
        </div>
      </div>

      {/* Preferred Categories */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Star className="w-5 h-5" />
          Preferred Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {allCategories.map(category => (
            <Badge
              key={category}
              variant={preferences.preferredCategories.includes(category) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Favorite Tools */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Favorite Tools
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.slice(0, 10).map(tool => (
            <div
              key={tool.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div>
                <h4 className="font-medium">{tool.name}</h4>
                <p className="text-sm text-muted-foreground">{tool.category}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFavorite(tool.id)}
              >
                <Heart
                  className={`w-4 h-4 ${
                    preferences.favoriteTools.includes(tool.id)
                      ? 'fill-red-500 text-red-500'
                      : 'text-muted-foreground'
                  }`}
                />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RecommendationsTab() {
  const [recommendations, setRecommendations] = useState<ToolRecommendation[]>([])
  const [trending, setTrending] = useState<ToolRecommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      const [personalizedRes, trendingRes] = await Promise.all([
        fetch('/api/user/recommendations?type=personalized'),
        fetch('/api/user/recommendations?type=trending')
      ])

      if (personalizedRes.ok) {
        const personalizedData = await personalizedRes.json()
        setRecommendations(personalizedData)
      }

      if (trendingRes.ok) {
        const trendingData = await trendingRes.json()
        setTrending(trendingData)
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
  }

  return (
    <div className="space-y-6">
      {/* Personalized Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recommended For You</h3>
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{rec.tool.name}</CardTitle>
                  <CardDescription>{rec.tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{rec.tool.category}</Badge>
                    <div className="text-sm text-muted-foreground">
                      Score: {Math.round(rec.score)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {rec.reason}
                  </p>
                  <Button className="w-full mt-3" asChild>
                    <a href={rec.tool.path}>Try Tool</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No personalized recommendations available. Use more tools to get better recommendations!
          </div>
        )}
      </div>

      {/* Trending Tools */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Trending Tools</h3>
        {trending.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trending.slice(0, 6).map((rec, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{rec.tool.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {rec.tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {rec.tool.category}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      Score: {Math.round(rec.score)}
                    </div>
                  </div>
                  <Button className="w-full mt-3" size="sm" asChild>
                    <a href={rec.tool.path}>Try Tool</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No trending tools available at the moment.
          </div>
        )}
      </div>
    </div>
  )
}