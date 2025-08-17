import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { 
  User, 
  Plan, 
  Subscription, 
  PlanTool, 
  Usage, 
  UserRole,
  PlanStatus,
  ToolAccessType,
  CreateUserData,
  CreatePlanData,
  CreateSubscriptionData,
  UpdatePlanToolData,
  UserWithSubscription,
  SubscriptionWithPlan,
  PlanWithTools,
  ToolAccessInfo,
  PlanFeatures
} from './types'

export class UserService {
  static async createUser(data: CreateUserData): Promise<User> {
    const { email, name, password, role = UserRole.USER } = data
    
    return await db.user.create({
      data: {
        email,
        name,
        passwordHash: password ? await this.hashPassword(password) : null,
        role
      }
    })
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    return await db.user.findUnique({
      where: { email },
      include: {
        subscriptions: {
          include: {
            plan: true
          }
        },
        usage: true
      }
    })
  }

  static async getUserById(id: string): Promise<UserWithSubscription | null> {
    const user = await db.user.findUnique({
      where: { id },
      include: {
        subscriptions: {
          include: {
            plan: true
          },
          where: {
            status: PlanStatus.ACTIVE
          },
          orderBy: {
            plan: {
              priority: 'desc'
            }
          },
          take: 1
        }
      }
    })

    if (!user) return null

    return {
      ...user,
      subscription: user.subscriptions[0] || null
    }
  }

  static async updateUser(id: string, data: Partial<User>): Promise<User> {
    return await db.user.update({
      where: { id },
      data
    })
  }

  static async getAllUsers(): Promise<User[]> {
    return await db.user.findMany({
      orderBy: { createdAt: 'desc' }
    })
  }

  static async deleteUser(id: string): Promise<void> {
    await db.user.delete({
      where: { id }
    })
  }

  private static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12)
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }
}

export class PlanService {
  static async createPlan(data: CreatePlanData): Promise<Plan> {
    const { name, description, price, maxTools, maxUsage, features, priority } = data
    
    return await db.plan.create({
      data: {
        name,
        description,
        price,
        maxTools,
        maxUsage,
        features: JSON.stringify(features),
        priority
      }
    })
  }

  static async getPlanById(id: string): Promise<PlanWithTools | null> {
    return await db.plan.findUnique({
      where: { id },
      include: {
        planTools: true
      }
    }) as PlanWithTools | null
  }

  static async getAllPlans(): Promise<Plan[]> {
    return await db.plan.findMany({
      where: { status: PlanStatus.ACTIVE },
      orderBy: { priority: 'desc' }
    })
  }

  static async updatePlan(id: string, data: Partial<Plan>): Promise<Plan> {
    return await db.plan.update({
      where: { id },
      data
    })
  }

  static async deletePlan(id: string): Promise<void> {
    await db.plan.delete({
      where: { id }
    })
  }

  static async getPlanFeatures(plan: Plan): Promise<PlanFeatures> {
    return JSON.parse(plan.features) as PlanFeatures
  }

  static async updatePlanFeatures(planId: string, features: PlanFeatures): Promise<Plan> {
    return await db.plan.update({
      where: { id: planId },
      data: {
        features: JSON.stringify(features)
      }
    })
  }
}

export class SubscriptionService {
  static async createSubscription(data: CreateSubscriptionData): Promise<Subscription> {
    const { userId, planId, endsAt } = data
    
    return await db.subscription.create({
      data: {
        userId,
        planId,
        endsAt
      }
    })
  }

  static async getUserSubscription(userId: string): Promise<SubscriptionWithPlan | null> {
    return await db.subscription.findFirst({
      where: {
        userId,
        status: PlanStatus.ACTIVE
      },
      include: {
        plan: true
      },
      orderBy: {
        plan: {
          priority: 'desc'
        }
      }
    }) as SubscriptionWithPlan | null
  }

  static async cancelSubscription(userId: string, subscriptionId: string): Promise<Subscription> {
    return await db.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: PlanStatus.CANCELLED,
        cancelledAt: new Date()
      }
    })
  }

  static async expireSubscription(userId: string, subscriptionId: string): Promise<Subscription> {
    return await db.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: PlanStatus.EXPIRED
      }
    })
  }
}

export class PlanToolService {
  static async addToolToPlan(planId: string, toolId: string, data: UpdatePlanToolData): Promise<PlanTool> {
    const { accessType, maxUsage, features } = data
    
    return await db.planTool.upsert({
      where: {
        planId_toolId: {
          planId,
          toolId
        }
      },
      update: {
        accessType,
        maxUsage,
        features: JSON.stringify(features)
      },
      create: {
        planId,
        toolId,
        accessType,
        maxUsage,
        features: JSON.stringify(features)
      }
    })
  }

  static async removeToolFromPlan(planId: string, toolId: string): Promise<void> {
    await db.planTool.delete({
      where: {
        planId_toolId: {
          planId,
          toolId
        }
      }
    })
  }

  static async getPlanTools(planId: string): Promise<PlanTool[]> {
    return await db.planTool.findMany({
      where: { planId }
    })
  }

  static async getToolAccessInfo(userId: string, toolId: string): Promise<ToolAccessInfo> {
    const user = await UserService.getUserById(userId)
    if (!user) {
      return {
        hasAccess: false,
        accessType: ToolAccessType.BLOCKED,
        maxUsage: 0,
        currentUsage: 0,
        remainingUsage: 0,
        features: {}
      }
    }

    // Admin has access to everything
    if (user.role === UserRole.ADMIN) {
      return {
        hasAccess: true,
        accessType: ToolAccessType.UNLIMITED,
        maxUsage: -1,
        currentUsage: 0,
        remainingUsage: -1,
        features: {}
      }
    }

    if (!user.subscription) {
      return {
        hasAccess: false,
        accessType: ToolAccessType.BLOCKED,
        maxUsage: 0,
        currentUsage: 0,
        remainingUsage: 0,
        features: {}
      }
    }

    const plan = await PlanService.getPlanById(user.subscription.planId)
    if (!plan) {
      return {
        hasAccess: false,
        accessType: ToolAccessType.BLOCKED,
        maxUsage: 0,
        currentUsage: 0,
        remainingUsage: 0,
        features: {}
      }
    }

    const planTool = plan.planTools.find(pt => pt.toolId === toolId)
    const planFeatures = await PlanService.getPlanFeatures(plan)

    // Check if user can access all tools
    if (planFeatures.canAccessAllTools && !planTool) {
      return {
        hasAccess: true,
        accessType: ToolAccessType.UNLIMITED,
        maxUsage: plan.maxUsage,
        currentUsage: 0,
        remainingUsage: plan.maxUsage,
        features: planFeatures.customFeatures || {}
      }
    }

    if (!planTool) {
      return {
        hasAccess: false,
        accessType: ToolAccessType.BLOCKED,
        maxUsage: 0,
        currentUsage: 0,
        remainingUsage: 0,
        features: {}
      }
    }

    const usage = await UsageService.getUsage(userId, toolId)
    const remainingUsage = planTool.maxUsage === -1 ? -1 : Math.max(0, planTool.maxUsage - usage.count)

    return {
      hasAccess: planTool.accessType !== ToolAccessType.BLOCKED,
      accessType: planTool.accessType,
      maxUsage: planTool.maxUsage,
      currentUsage: usage.count,
      remainingUsage,
      features: JSON.parse(planTool.features) || {}
    }
  }
}

export class UsageService {
  static async incrementUsage(userId: string, toolId: string): Promise<void> {
    await db.usage.upsert({
      where: {
        userId_toolId: {
          userId,
          toolId
        }
      },
      update: {
        count: {
          increment: 1
        },
        lastUsed: new Date()
      },
      create: {
        userId,
        toolId,
        count: 1,
        lastUsed: new Date()
      }
    })
  }

  static async getUsage(userId: string, toolId: string): Promise<Usage> {
    return await db.usage.upsert({
      where: {
        userId_toolId: {
          userId,
          toolId
        }
      },
      update: {},
      create: {
        userId,
        toolId,
        count: 0
      }
    })
  }

  static async getUserUsage(userId: string): Promise<Usage[]> {
    return await db.usage.findMany({
      where: { userId },
      orderBy: { lastUsed: 'desc' }
    })
  }

  static async resetUsage(userId: string, toolId: string): Promise<void> {
    await db.usage.update({
      where: {
        userId_toolId: {
          userId,
          toolId
        }
      },
      data: {
        count: 0
      }
    })
  }

  static async resetAllUserUsage(userId: string): Promise<void> {
    await db.usage.updateMany({
      where: { userId },
      data: {
        count: 0
      }
    })
  }
}