"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  count: number
  icon: any
  description: string
}

interface CategoryNavigationProps {
  categories: Category[]
  selectedCategory: string
  onCategorySelect: (categoryId: string) => void
  className?: string
}

export function CategoryNavigation({ 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  className 
}: CategoryNavigationProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <AnimatePresence mode="wait">
          {categories.map((category) => {
            const IconComponent = category.icon
            const isSelected = selectedCategory === category.id
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <button
                  onClick={() => onCategorySelect(category.id)}
                  className={cn(
                    "relative group w-full p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg",
                    isSelected 
                      ? "bg-primary text-primary-foreground border-primary shadow-lg" 
                      : "bg-background border-border hover:border-primary/50 hover:bg-primary/5"
                  )}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className={cn(
                      "p-3 rounded-lg transition-colors duration-300",
                      isSelected 
                        ? "bg-primary/10 text-primary" 
                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    )}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    
                    <div className="text-center space-y-1 w-full">
                      <h3 className={cn(
                        "font-semibold text-sm leading-tight transition-colors duration-300",
                        isSelected 
                          ? "text-primary-foreground" 
                          : "text-foreground group-hover:text-primary"
                      )}>
                        {category.name}
                      </h3>
                      <p className={cn(
                        "text-xs leading-tight transition-colors duration-300",
                        isSelected 
                          ? "text-primary-foreground/70" 
                          : "text-muted-foreground group-hover:text-primary/70"
                      )}>
                        {category.count} tools
                      </p>
                    </div>
                  </div>
                  
                  {/* Selection indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId="categorySelection"
                      className="absolute inset-0 rounded-xl border-2 border-primary pointer-events-none"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      }}
                    />
                  )}
                </button>
                
                {/* Hover effect */}
                {!isSelected && (
                  <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-primary/50 opacity-0 group-hover:opacity-100 pointer-events-none"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}