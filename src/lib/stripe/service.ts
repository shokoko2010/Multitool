import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export interface StripeProduct {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
}

export interface CreateCheckoutSessionParams {
  userId: string
  planId: string
  planName: string
  price: number
  successUrl: string
  cancelUrl: string
}

export interface CreatePortalSessionParams {
  customerId: string
  returnUrl: string
}

export class StripeService {
  static async createProductsAndPrices() {
    const products = [
      {
        name: 'Free Plan',
        description: 'Basic access to essential tools',
        price: 0,
        currency: 'usd',
        interval: 'month' as const,
      },
      {
        name: 'Pro Plan',
        description: 'Advanced access to all tools with higher limits',
        price: 999, // $9.99 in cents
        currency: 'usd',
        interval: 'month' as const,
      },
      {
        name: 'Enterprise Plan',
        description: 'Full access with custom features and dedicated support',
        price: 9999, // $99.99 in cents
        currency: 'usd',
        interval: 'month' as const,
      },
    ]

    const createdProducts: StripeProduct[] = []

    for (const productData of products) {
      // Check if product already exists
      const existingProducts = await stripe.products.list({
        active: true,
        limit: 100,
      })

      let existingProduct = existingProducts.data.find(
        (p) => p.name === productData.name
      )

      if (!existingProduct) {
        // Create new product
        existingProduct = await stripe.products.create({
          name: productData.name,
          description: productData.description,
          metadata: {
            plan_id: productData.name.toLowerCase().replace(' ', '-'),
          },
        })
      }

      // Check if price exists
      const prices = await stripe.prices.list({
        product: existingProduct.id,
        active: true,
        limit: 100,
      })

      let existingPrice = prices.data.find(
        (p) => 
          p.unit_amount === productData.price && 
          p.recurring?.interval === productData.interval
      )

      if (!existingPrice && productData.price > 0) {
        // Create new price
        existingPrice = await stripe.prices.create({
          product: existingProduct.id,
          unit_amount: productData.price,
          currency: productData.currency,
          recurring: {
            interval: productData.interval,
          },
        })
      }

      createdProducts.push({
        id: existingProduct.id,
        name: existingProduct.name,
        description: existingProduct.description || '',
        price: productData.price,
        currency: productData.currency,
        interval: productData.interval,
      })
    }

    return createdProducts
  }

  static async createCheckoutSession(params: CreateCheckoutSessionParams) {
    const { userId, planId, planName, price, successUrl, cancelUrl } = params

    // For free plans, return a mock session
    if (price === 0) {
      return {
        id: `free_${Date.now()}`,
        url: successUrl,
      }
    }

    // Create or get Stripe customer
    let customer = await this.getOrCreateCustomer(userId)

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planName,
              description: `${planName} subscription`,
              metadata: {
                plan_id: planId,
              },
            },
            unit_amount: price,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: userId,
        plan_id: planId,
      },
    })

    return session
  }

  static async createPortalSession(params: CreatePortalSessionParams) {
    const { customerId, returnUrl } = params

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return session
  }

  static async getOrCreateCustomer(userId: string, email?: string) {
    try {
      // Try to find existing customer by metadata
      const customers = await stripe.customers.list({
        email,
        limit: 1,
      })

      if (customers.data.length > 0) {
        // Update customer metadata if needed
        const customer = customers.data[0]
        if (!customer.metadata?.user_id) {
          await stripe.customers.update(customer.id, {
            metadata: { user_id: userId },
          })
        }
        return customer
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email,
        metadata: {
          user_id: userId,
        },
      })

      return customer
    } catch (error) {
      console.error('Error creating Stripe customer:', error)
      throw error
    }
  }

  static async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      )

      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session
          await this.handleCheckoutSessionCompleted(session)
          break

        case 'customer.subscription.created':
          const subscription = event.data.object as Stripe.Subscription
          await this.handleSubscriptionCreated(subscription)
          break

        case 'customer.subscription.updated':
          const updatedSubscription = event.data.object as Stripe.Subscription
          await this.handleSubscriptionUpdated(updatedSubscription)
          break

        case 'customer.subscription.deleted':
          const deletedSubscription = event.data.object as Stripe.Subscription
          await this.handleSubscriptionDeleted(deletedSubscription)
          break

        case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice
          await this.handleInvoicePaymentSucceeded(invoice)
          break

        case 'invoice.payment_failed':
          const failedInvoice = event.data.object as Stripe.Invoice
          await this.handleInvoicePaymentFailed(failedInvoice)
          break

        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      return { received: true }
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      throw new Error('Invalid webhook signature')
    }
  }

  private static async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.user_id
    const planId = session.metadata?.plan_id

    if (!userId || !planId) {
      console.error('Missing metadata in checkout session:', session.id)
      return
    }

    // Here you would update the user's subscription in your database
    console.log(`Checkout session completed for user ${userId}, plan ${planId}`)
  }

  private static async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string
    const priceId = subscription.items.data[0]?.price?.id

    // Get customer to find user ID
    const customer = await stripe.customers.retrieve(customerId)
    const userId = customer.metadata?.user_id

    if (!userId || !priceId) {
      console.error('Missing data in subscription creation:', subscription.id)
      return
    }

    // Here you would create/update the subscription in your database
    console.log(`Subscription created for user ${userId}`)
  }

  private static async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string
    
    // Get customer to find user ID
    const customer = await stripe.customers.retrieve(customerId)
    const userId = customer.metadata?.user_id

    if (!userId) {
      console.error('Missing user ID in subscription update:', subscription.id)
      return
    }

    // Here you would update the subscription in your database
    console.log(`Subscription updated for user ${userId}`)
  }

  private static async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string
    
    // Get customer to find user ID
    const customer = await stripe.customers.retrieve(customerId)
    const userId = customer.metadata?.user_id

    if (!userId) {
      console.error('Missing user ID in subscription deletion:', subscription.id)
      return
    }

    // Here you would cancel/delete the subscription in your database
    console.log(`Subscription deleted for user ${userId}`)
  }

  private static async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string
    
    if (!subscriptionId) {
      console.error('Missing subscription ID in invoice payment succeeded:', invoice.id)
      return
    }

    // Here you would update the subscription status in your database
    console.log(`Invoice payment succeeded for subscription ${subscriptionId}`)
  }

  private static async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string
    
    if (!subscriptionId) {
      console.error('Missing subscription ID in invoice payment failed:', invoice.id)
      return
    }

    // Here you would handle failed payment in your database
    console.log(`Invoice payment failed for subscription ${subscriptionId}`)
  }
}