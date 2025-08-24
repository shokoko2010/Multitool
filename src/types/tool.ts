import { LucideIcon } from 'lucide-react'

export interface Tool {
  name: string
  href: string
  description: string
  category: string
  icon: string | LucideIcon | React.ComponentType<any>
  featured?: boolean
  popular?: boolean
  tags?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

export interface ToolCategory {
  id: string
  name: string
  description: string
  icon: LucideIcon | React.ComponentType<any>
  count: number
  color?: string
}

export interface ToolSearchFilters {
  query: string
  category: string
  tags: string[]
  featuredOnly: boolean
  popularOnly: boolean
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}