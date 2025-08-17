'use client'

import { useToolAccess } from '@/hooks/useToolAccess'
import { useSession } from 'next-auth/react'
import { useEffect, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lock, Shield, AlertTriangle, Zap } from 'lucide-react'
import Link from 'next/link'

interface ToolProtectionProps {
  toolId: string
  toolName: string
  children: ReactNode
  fallback?: ReactNode
}

export function ToolProtection({ 
  toolId, 
  toolName, 
  children, 
  fallback 
}: ToolProtectionProps) {
  const { data: session } = useSession()
  const { canAccess, accessInfo, isLoading, checkAccess } = useToolAccess()

  useEffect(() => {
    if (session) {
      checkAccess(toolId)
    }
  }, [session, toolId, checkAccess])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3">Checking access...</span>
      </div>
    )
  }

  if (!session) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Authentication Required
          </CardTitle>
          <CardDescription>
            Please sign in to access the {toolName} tool
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create an account or sign in to use this tool and track your usage.
          </p>
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!canAccess || !accessInfo) {
    return fallback || (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Access Denied
          </CardTitle>
          <CardDescription>
            You don't have access to the {toolName} tool
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium">Upgrade Required</span>
          </div>
          
          {accessInfo && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Access Type:</span>
                <Badge variant={accessInfo.accessType === 'BLOCKED' ? 'destructive' : 'secondary'}>
                  {accessInfo.accessType}
                </Badge>
              </div>
              
              {accessInfo.maxUsage > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Usage Limit:</span>
                    <span>{accessInfo.currentUsage} / {accessInfo.maxUsage}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ 
                        width: `${(accessInfo.currentUsage / accessInfo.maxUsage) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/subscription">
                <Zap className="mr-2 h-4 w-4" />
                Upgrade Your Plan
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/subscription">View Plans</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (accessInfo.accessType === 'LIMITED' && accessInfo.remainingUsage <= 0) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Usage Limit Reached
          </CardTitle>
          <CardDescription>
            You've reached your usage limit for the {toolName} tool
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current Usage:</span>
              <span className="font-medium">{accessInfo.currentUsage} / {accessInfo.maxUsage}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ 
                  width: `${(accessInfo.currentUsage / accessInfo.maxUsage) * 100}%` 
                }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/subscription">
                <Zap className="mr-2 h-4 w-4" />
                Upgrade for Unlimited Access
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/subscription">View Other Plans</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}