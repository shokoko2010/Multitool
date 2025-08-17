import { PrismaClient } from '@prisma/client'
import { UserService, PlanService } from './src/lib/auth/services'
import { UserRole } from './src/lib/auth/types'

const prisma = new PrismaClient()

interface PlanFeatures {
  canAccessAllTools: boolean
  maxToolsPerDay: number
  maxUsagePerTool: number
  advancedFeatures: string[]
  customFeatures: Record<string, any>
}

async function seedDatabase() {
  try {
    console.log('Seeding database...')

    // Create admin user if not exists
    let adminUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    })

    if (!adminUser) {
      adminUser = await UserService.createUser({
        email: 'admin@example.com',
        name: 'Admin User',
        password: 'admin123',
        role: UserRole.ADMIN
      })
      console.log('Created admin user:', adminUser.email)
    } else {
      console.log('Admin user already exists:', adminUser.email)
    }

    // Create subscription plans if they don't exist
    let freePlan = await prisma.plan.findFirst({
      where: { name: 'Free' }
    })

    if (!freePlan) {
      freePlan = await PlanService.createPlan({
        name: 'Free',
        description: 'Basic access to essential tools',
        price: 0,
        maxTools: 50,
        maxUsage: 100,
        features: {
          canAccessAllTools: false,
          maxToolsPerDay: 50,
          maxUsagePerTool: 100,
          advancedFeatures: ['basic_tools'],
          customFeatures: {}
        },
        priority: 1
      })
      console.log('Created Free plan:', freePlan.name)
    } else {
      console.log('Free plan already exists:', freePlan.name)
    }

    let proPlan = await prisma.plan.findFirst({
      where: { name: 'Pro' }
    })

    if (!proPlan) {
      proPlan = await PlanService.createPlan({
        name: 'Pro',
        description: 'Advanced access to all tools with higher limits',
        price: 9.99,
        maxTools: -1, // Unlimited
        maxUsage: -1, // Unlimited
        features: {
          canAccessAllTools: true,
          maxToolsPerDay: -1,
          maxUsagePerTool: -1,
          advancedFeatures: ['all_tools', 'priority_support', 'api_access'],
          customFeatures: {
            apiRateLimit: 1000,
            prioritySupport: true
          }
        },
        priority: 2
      })
      console.log('Created Pro plan:', proPlan.name)
    } else {
      console.log('Pro plan already exists:', proPlan.name)
    }

    let enterprisePlan = await prisma.plan.findFirst({
      where: { name: 'Enterprise' }
    })

    if (!enterprisePlan) {
      enterprisePlan = await PlanService.createPlan({
        name: 'Enterprise',
        description: 'Full access with custom features and dedicated support',
        price: 99.99,
        maxTools: -1, // Unlimited
        maxUsage: -1, // Unlimited
        features: {
          canAccessAllTools: true,
          maxToolsPerDay: -1,
          maxUsagePerTool: -1,
          advancedFeatures: ['all_tools', 'priority_support', 'api_access', 'custom_integrations', 'dedicated_support'],
          customFeatures: {
            apiRateLimit: -1, // Unlimited
            prioritySupport: true,
            dedicatedSupport: true,
            customIntegrations: true,
            whiteLabel: true
          }
        },
        priority: 3
      })
      console.log('Created Enterprise plan:', enterprisePlan.name)
    } else {
      console.log('Enterprise plan already exists:', enterprisePlan.name)
    }

    console.log('Database seeded successfully!')
    console.log('Admin credentials:')
    console.log('Email: admin@example.com')
    console.log('Password: admin123')

  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDatabase()