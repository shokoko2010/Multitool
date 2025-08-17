'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, Star, Zap, Shield, Crown } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  maxTools: number
  maxUsage: number
  features: string
  priority: number
}

interface UserSubscription {
  id: string
  plan: Plan
  status: string
  startedAt: string
  endsAt?: string
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession()
  const [plans, setPlans] = useState<Plan[]>([])
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      window.location.href = '/auth/signin'
      return
    }

    fetchPlansAndSubscription()
  }, [session, status])

  const fetchPlansAndSubscription = async () => {
    try {
      const [plansRes, subscriptionRes] = await Promise.all([
        fetch('/api/plans'),
        fetch('/api/user/subscription')
      ])

      if (plansRes.ok) {
        const plansData = await plansRes.json()
        setPlans(plansData)
      }

      if (subscriptionRes.ok) {
        const subscriptionData = await subscriptionRes.json()
        setSubscription(subscriptionData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId: string) => {
    if (!session) return

    const plan = plans.find(p => p.id === planId)
    if (!plan) return

    setUpgrading(planId)
    try {
      // For free plans, use the existing subscription API
      if (plan.price === 0) {
        const response = await fetch('/api/user/subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ planId }),
        })

        if (response.ok) {
          await fetchPlansAndSubscription()
        }
      } else {
        // For paid plans, use Stripe checkout
        const response = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId,
            planName: plan.name,
            price: Math.round(plan.price * 100), // Convert to cents
          }),
        })

        if (response.ok) {
          const { url } = await response.json()
          if (url) {
            // Redirect to Stripe checkout
            window.location.href = url
          }
        }
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error)
    } finally {
      setUpgrading(null)
    }
  }

  const parseFeatures = (featuresString: string) => {
    try {
      return JSON.parse(featuresString)
    } catch {
      return {}
    }
  }

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return <Star className="w-6 h-6" />
      case 'pro':
        return <Zap className="w-6 h-6" />
      case 'enterprise':
        return <Crown className="w-6 h-6" />
      default:
        return <Shield className="w-6 h-6" />
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const sortedPlans = plans.sort((a, b) => b.priority - a.priority)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Select the perfect plan for your needs. Upgrade or downgrade at any time.
              </p>
            </div>

            {/* Current Subscription */}
            {subscription && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Current Subscription</CardTitle>
                  <CardDescription>
                    You are currently subscribed to the {subscription.plan.name} plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getPlanIcon(subscription.plan.name)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{subscription.plan.name}</h3>
                        <p className="text-muted-foreground">{subscription.plan.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        ${subscription.plan.price}
                        <span className="text-sm font-normal text-muted-foreground">/month</span>
                      </div>
                      <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {subscription.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pricing Plans */}
            <Tabs defaultValue="plans" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
                <TabsTrigger value="features">Feature Comparison</TabsTrigger>
              </TabsList>

              <TabsContent value="plans" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {sortedPlans.map((plan) => {
                    const features = parseFeatures(plan.features)
                    const isCurrentPlan = subscription?.plan.id === plan.id
                    const canUpgrade = !isCurrentPlan && plan.priority > (subscription?.plan.priority || 0)

                    return (
                      <Card key={plan.id} className={`relative ${isCurrentPlan ? 'border-primary shadow-lg' : ''}`}>
                        {isCurrentPlan && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-primary text-primary-foreground">
                              Current Plan
                            </Badge>
                          </div>
                        )}
                        
                        <CardHeader className="text-center">
                          <div className="flex justify-center mb-4">
                            {getPlanIcon(plan.name)}
                          </div>
                          <CardTitle className="text-xl">{plan.name}</CardTitle>
                          <CardDescription>{plan.description}</CardDescription>
                          <div className="mt-4">
                            <span className="text-4xl font-bold">${plan.price}</span>
                            <span className="text-muted-foreground">/month</span>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-sm">
                                {plan.maxTools === -1 ? 'Unlimited tools' : `${plan.maxTools} tools`}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-sm">
                                {plan.maxUsage === -1 ? 'Unlimited usage' : `${plan.maxUsage} uses per tool`}
                              </span>
                            </div>
                            {features.advancedFeatures?.map((feature: string, index: number) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Check className="w-4 h-4 text-green-600" />
                                <span className="text-sm capitalize">
                                  {feature.replace(/_/g, ' ')}
                                </span>
                              </div>
                            ))}
                          </div>
                          
                          <Button 
                            className="w-full" 
                            disabled={isCurrentPlan || upgrading === plan.id}
                            onClick={() => handleUpgrade(plan.id)}
                          >
                            {upgrading === plan.id ? (
                              'Processing...'
                            ) : isCurrentPlan ? (
                              'Current Plan'
                            ) : canUpgrade ? (
                              'Upgrade Plan'
                            ) : (
                              'Downgrade Plan'
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Feature Comparison</CardTitle>
                    <CardDescription>
                      Compare features across all subscription plans
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="text-left p-2">Feature</th>
                            {sortedPlans.map((plan) => (
                              <th key={plan.id} className="text-center p-2">
                                {plan.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-2 border-b">Price</td>
                            {sortedPlans.map((plan) => (
                              <td key={plan.id} className="text-center p-2 border-b">
                                ${plan.price}/month
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="p-2 border-b">Tools Access</td>
                            {sortedPlans.map((plan) => (
                              <td key={plan.id} className="text-center p-2 border-b">
                                {plan.maxTools === -1 ? 'Unlimited' : plan.maxTools}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="p-2 border-b">Usage Limit</td>
                            {sortedPlans.map((plan) => (
                              <td key={plan.id} className="text-center p-2 border-b">
                                {plan.maxUsage === -1 ? 'Unlimited' : plan.maxUsage}
                              </td>
                            ))}
                          </tr>
                          {sortedPlans.map((plan, planIndex) => {
                            const features = parseFeatures(plan.features)
                            return features.advancedFeatures?.map((feature: string, featureIndex: number) => (
                              <tr key={`${planIndex}-${featureIndex}`}>
                                <td className="p-2 border-b capitalize">
                                  {feature.replace(/_/g, ' ')}
                                </td>
                                {sortedPlans.map((p) => {
                                  const f = parseFeatures(p.features)
                                  const hasFeature = f.advancedFeatures?.includes(feature)
                                  return (
                                    <td key={p.id} className="text-center p-2 border-b">
                                      {hasFeature ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : '-'}
                                    </td>
                                  )
                                })}
                              </tr>
                            ))
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}