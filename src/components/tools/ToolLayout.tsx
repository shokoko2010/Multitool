'use client'

import { ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useToolAccess, ToolAccessInfo } from '@/hooks/useToolAccess'
import { 
  Settings, 
  Lock, 
  Zap, 
  AlertTriangle, 
  ArrowLeft, 
  ExternalLink,
  BarChart3,
  Clock,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

interface ToolLayoutProps {
  toolId: string
  toolName: string
  toolDescription: string
  toolCategory: string
  toolIcon: React.ReactNode
  children: ReactNode
  action?: {
    label: string
    onClick: () => Promise<void> | void
    loading?: boolean
    disabled?: boolean
  }
  showUsage?: boolean
}

export function ToolLayout({
  toolId,
  toolName,
  toolDescription,
  toolCategory,
  toolIcon,
  children,
  action,
  showUsage = true
}: ToolLayoutProps) {
  const { data: session } = useSession()
  const { accessInfo, loading, error, hasAccess, canUseTool, usagePercentage } = useToolAccess(toolId)

  const getAccessTypeIcon = (accessType: string) => {
    switch (accessType) {
      case 'UNLIMITED':
        return <Zap className="w-4 h-4 text-green-600" />
      case 'LIMITED':
        return <BarChart3 className="w-4 h-4 text-yellow-600" />
      case 'BLOCKED':
        return <Lock className="w-4 h-4 text-red-600" />
      default:
        return <Settings className="w-4 h-4" />
    }
  }

  const getAccessTypeColor = (accessType: string) => {
    switch (accessType) {
      case 'UNLIMITED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'LIMITED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'BLOCKED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please sign in to access this tool
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
              <Button variant="ghost" asChild className="w-full">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Tool Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" asChild>
                <Link href="/tools">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Tools
                </Link>
              </Button>
              <Badge variant="outline">{toolCategory}</Badge>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-primary">
                    {toolIcon}
                  </div>
                  <h1 className="text-3xl font-bold">{toolName}</h1>
                </div>
                <p className="text-muted-foreground text-lg mb-4">
                  {toolDescription}
                </p>
              </div>
              
              {/* Access Status */}
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-20 w-48 bg-muted rounded-lg"></div>
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Error checking access permissions
                  </AlertDescription>
                </Alert>
              ) : accessInfo && (
                <Card className="w-64">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {getAccessTypeIcon(accessInfo.accessType)}
                      Access Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <Badge className={getAccessTypeColor(accessInfo.accessType)}>
                        {accessInfo.hasAccess ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Access Granted
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Access Denied
                          </div>
                        )}
                      </Badge>
                    </div>
                    
                    {showUsage && accessInfo.hasAccess && accessInfo.accessType === 'LIMITED' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Usage</span>
                          <span>{accessInfo.currentUsage} / {accessInfo.maxUsage === -1 ? '∞' : accessInfo.maxUsage}</span>
                        </div>
                        <Progress 
                          value={usagePercentage} 
                          className="h-2"
                        />
                        <div className="text-xs text-muted-foreground">
                          {accessInfo.remainingUsage === -1 ? 'Unlimited' : `${accessInfo.remainingUsage} uses remaining`}
                        </div>
                      </div>
                    )}
                    
                    {!hasAccess && (
                      <Button asChild className="w-full" size="sm">
                        <Link href="/subscription">
                          Upgrade Plan
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Tool Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {!hasAccess ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Lock className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Access Restricted</h3>
                    <p className="text-muted-foreground text-center mb-6">
                      This tool requires a higher subscription plan. Please upgrade your subscription to access this feature.
                    </p>
                    <Button asChild>
                      <Link href="/subscription">
                        View Subscription Plans
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {children}
                  
                  {/* Action Button */}
                  {action && (
                    <div className="flex justify-center">
                      <Button
                        onClick={action.onClick}
                        disabled={action.disabled || !canUseTool || action.loading}
                        size="lg"
                        className="px-8"
                      >
                        {action.loading ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Processing...
                          </>
                        ) : (
                          action.label
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Tool Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    <span>Category: {toolCategory}</span>
                  </div>
                  {accessInfo && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Type: {accessInfo.accessType.toLowerCase()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Usage Stats */}
              {showUsage && accessInfo && accessInfo.hasAccess && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Usage Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Total Uses</span>
                      <span className="font-medium">{accessInfo.currentUsage}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Limit</span>
                      <span className="font-medium">
                        {accessInfo.maxUsage === -1 ? 'Unlimited' : accessInfo.maxUsage}
                      </span>
                    </div>
                    {accessInfo.accessType === 'LIMITED' && (
                      <div className="pt-2 border-t">
                        <Progress value={usagePercentage} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1">
                          {usagePercentage}% used
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Help */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Documentation
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}