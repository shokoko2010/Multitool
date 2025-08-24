import { db } from '@/lib/db'

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  notifications: boolean
  newsletter: boolean
  preferredCategories: string[]
  favoriteTools: string[]
  recentTools: string[]
}

export class UserPreferencesService {
  static async getPreferences(userId: string): Promise<UserPreferences> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        throw new Error('User not found')
      }

      return {
        theme: user.theme as 'light' | 'dark' | 'system',
        language: user.language,
        timezone: user.timezone,
        notifications: user.notifications,
        newsletter: user.newsletter,
        preferredCategories: JSON.parse(user.preferredCategories || '[]'),
        favoriteTools: JSON.parse(user.favoriteTools || '[]'),
        recentTools: JSON.parse(user.recentTools || '[]')
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error)
      throw error
    }
  }

  static async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const currentPreferences = await this.getPreferences(userId)
      const updatedPreferences = { ...currentPreferences, ...preferences }

      const updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          theme: updatedPreferences.theme,
          language: updatedPreferences.language,
          timezone: updatedPreferences.timezone,
          notifications: updatedPreferences.notifications,
          newsletter: updatedPreferences.newsletter,
          preferredCategories: JSON.stringify(updatedPreferences.preferredCategories),
          favoriteTools: JSON.stringify(updatedPreferences.favoriteTools),
          recentTools: JSON.stringify(updatedPreferences.recentTools)
        }
      })

      return {
        theme: updatedUser.theme as 'light' | 'dark' | 'system',
        language: updatedUser.language,
        timezone: updatedUser.timezone,
        notifications: updatedUser.notifications,
        newsletter: updatedUser.newsletter,
        preferredCategories: JSON.parse(updatedUser.preferredCategories || '[]'),
        favoriteTools: JSON.parse(updatedUser.favoriteTools || '[]'),
        recentTools: JSON.parse(updatedUser.recentTools || '[]')
      }
    } catch (error) {
      console.error('Error updating user preferences:', error)
      throw error
    }
  }

  static async addToFavorites(userId: string, toolId: string): Promise<UserPreferences> {
    try {
      const preferences = await this.getPreferences(userId)
      
      if (!preferences.favoriteTools.includes(toolId)) {
        preferences.favoriteTools.push(toolId)
        return await this.updatePreferences(userId, { favoriteTools: preferences.favoriteTools })
      }
      
      return preferences
    } catch (error) {
      console.error('Error adding to favorites:', error)
      throw error
    }
  }

  static async removeFromFavorites(userId: string, toolId: string): Promise<UserPreferences> {
    try {
      const preferences = await this.getPreferences(userId)
      preferences.favoriteTools = preferences.favoriteTools.filter(id => id !== toolId)
      return await this.updatePreferences(userId, { favoriteTools: preferences.favoriteTools })
    } catch (error) {
      console.error('Error removing from favorites:', error)
      throw error
    }
  }

  static async addToRecentTools(userId: string, toolId: string): Promise<UserPreferences> {
    try {
      const preferences = await this.getPreferences(userId)
      
      // Remove if already exists
      preferences.recentTools = preferences.recentTools.filter(id => id !== toolId)
      
      // Add to beginning
      preferences.recentTools.unshift(toolId)
      
      // Keep only last 10
      preferences.recentTools = preferences.recentTools.slice(0, 10)
      
      return await this.updatePreferences(userId, { recentTools: preferences.recentTools })
    } catch (error) {
      console.error('Error adding to recent tools:', error)
      throw error
    }
  }

  static async addPreferredCategory(userId: string, category: string): Promise<UserPreferences> {
    try {
      const preferences = await this.getPreferences(userId)
      
      if (!preferences.preferredCategories.includes(category)) {
        preferences.preferredCategories.push(category)
        return await this.updatePreferences(userId, { preferredCategories: preferences.preferredCategories })
      }
      
      return preferences
    } catch (error) {
      console.error('Error adding preferred category:', error)
      throw error
    }
  }

  static async removePreferredCategory(userId: string, category: string): Promise<UserPreferences> {
    try {
      const preferences = await this.getPreferences(userId)
      preferences.preferredCategories = preferences.preferredCategories.filter(cat => cat !== category)
      return await this.updatePreferences(userId, { preferredCategories: preferences.preferredCategories })
    } catch (error) {
      console.error('Error removing preferred category:', error)
      throw error
    }
  }
}