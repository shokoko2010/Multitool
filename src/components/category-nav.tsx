"use client"

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ToolCategory } from '@/types/tool'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface CategoryNavProps {
  categories: ToolCategory[]
  selectedCategory: string
  onCategoryChange: (categoryId: string) => void
}

const categoryVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.2 }
  }
}

export function CategoryNav({ categories, selectedCategory, onCategoryChange }: CategoryNavProps) {
  return (
    <nav className="hidden lg:block">
      <ScrollArea className="w-64 h-[calc(100vh-4rem)]">
        <div className="p-4 space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Categories
          </h3>
          <div className="space-y-1">
            {categories.map((category) => (
              <motion.div
                key={category.id}
                variants={categoryVariants}
                initial="hidden"
                animate="visible"
              >
                <Button
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start text-left h-auto p-3",
                    selectedCategory === category.id 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted"
                  )}
                  onClick={() => onCategoryChange(category.id)}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="text-primary">
                      {typeof category.icon === 'function' ? 
                        <category.icon className="h-4 w-4" /> : 
                        category.icon
                      }
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{category.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {category.count} tools
                      </div>
                    </div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </nav>
  )
}