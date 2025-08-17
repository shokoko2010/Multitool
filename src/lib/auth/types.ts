// Import types from Prisma client
import { User, Plan, Subscription, PlanTool, Usage } from '@prisma/client'

// Define enums locally since they might not be exported properly
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum PlanStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export enum ToolAccessType {
  UNLIMITED = 'UNLIMITED',
  LIMITED = 'LIMITED',
  BLOCKED = 'BLOCKED'
}

export type { User, Plan, Subscription, PlanTool, Usage }

export interface UserWithSubscription extends User {
  subscription?: SubscriptionWithPlan
}

export interface SubscriptionWithPlan extends Subscription {
  plan: Plan
}

export interface PlanWithTools extends Plan {
  planTools: PlanTool[]
}

export interface ToolAccessInfo {
  hasAccess: boolean
  accessType: ToolAccessType
  maxUsage: number
  currentUsage: number
  remainingUsage: number
  features: Record<string, any>
}

export interface PlanFeatures {
  canAccessAllTools: boolean
  maxToolsPerDay: number
  maxUsagePerTool: number
  advancedFeatures: string[]
  customFeatures: Record<string, any>
}

export interface CreateUserData {
  email: string
  name?: string
  password?: string
  role?: UserRole
}

export interface CreatePlanData {
  name: string
  description?: string
  price: number
  maxTools: number
  maxUsage: number
  features: PlanFeatures
  priority: number
}

export interface CreateSubscriptionData {
  userId: string
  planId: string
  endsAt?: Date
}

export interface UpdatePlanToolData {
  accessType: ToolAccessType
  maxUsage: number
  features: Record<string, any>
}