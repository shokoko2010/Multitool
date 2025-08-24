"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tool } from '@/types/tool'
import { ArrowRight } from 'lucide-react'
import { getIconComponent } from '@/lib/icon-mapping'

interface ToolsGridProps {
  tools: Tool[]
  onToolClick?: (tool: Tool) => void
  loading?: boolean
}

export function ToolsGrid({ tools, onToolClick, loading = false }: ToolsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg p-4 h-48"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tools.map((tool, index) => {
        const IconComponent = typeof tool.icon === 'string' ? getIconComponent(tool.icon) : tool.icon
        return (
          <div
            key={tool.href}
            className="group"
          >
            <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="text-primary">
                      {typeof tool.icon === 'string' ? (
                        <IconComponent className="h-5 w-5" />
                      ) : (
                        <tool.icon className="h-5 w-5" />
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {tool.category}
                    </Badge>
                  </div>
                  {tool.featured && (
                    <Badge variant="default" className="text-xs">
                      Featured
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg leading-tight">
                  {tool.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {tool.description}
                </CardDescription>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={() => onToolClick?.(tool)}
                >
                  Open Tool
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}