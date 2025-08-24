'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tool } from '@/types/tool'
import { Star, Clock, Eye, Tag } from 'lucide-react'

interface SearchResultsProps {
  tools: Tool[]
  viewMode: 'grid' | 'list'
  onToolClick?: (tool: Tool) => void
  className?: string
}

export function SearchResults({ tools, viewMode, onToolClick, className }: SearchResultsProps) {
  const getIconComponent = (iconName: string) => {
    // This would normally import from lucide-react, but we'll use a placeholder
    return <div className="w-6 h-6 bg-primary/20 rounded" />
  }

  if (tools.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="mb-4">
          <Eye className="w-16 h-16 mx-auto text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No tools found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria or filters
        </p>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className={`space-y-4 ${className}`}>
        {tools.map((tool) => (
          <Card 
            key={tool.id} 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
            onClick={() => onToolClick?.(tool)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-primary group-hover:scale-110 transition-transform">
                    {getIconComponent(tool.icon)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                      {tool.featured && (
                        <Badge className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-3">
                      {tool.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {tool.category}
                      </Badge>
                      {tool.tags && tool.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          <span>{tool.tags.length} tags</span>
                        </div>
                      )}
                    </div>
                    {tool.tags && tool.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {tool.tags.slice(0, 5).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {tool.tags.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{tool.tags.length - 5}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToolClick?.(tool)
                  }}
                >
                  Open Tool
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Grid view
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {tools.map((tool) => (
        <Card 
          key={tool.id} 
          className="hover:shadow-lg transition-all duration-200 cursor-pointer group hover:-translate-y-1"
          onClick={() => onToolClick?.(tool)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="text-primary group-hover:scale-110 transition-transform">
                {getIconComponent(tool.icon)}
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                  {tool.name}
                </CardTitle>
                <Badge variant="secondary" className="text-xs mt-1">
                  {tool.category}
                </Badge>
              </div>
              {tool.featured && (
                <Badge className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm line-clamp-2 mb-3">
              {tool.description}
            </CardDescription>
            {tool.tags && tool.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {tool.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {tool.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{tool.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
            <Button 
              className="w-full" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onToolClick?.(tool)
              }}
            >
              Open Tool
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}