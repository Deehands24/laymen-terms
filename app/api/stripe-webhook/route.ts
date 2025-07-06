import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { supabase } from "@/lib/db"

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log(`Webhook received: ${event.type}`)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        await handleCheckoutCompleted(session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object
        await handleSubscriptionUpdate(subscription)
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object
        await handleSubscriptionDeleted(deletedSubscription)
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object
        await handlePaymentSucceeded(invoice)
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object
        await handlePaymentFailed(failedInvoice)
        break

      case 'v1.billing.meter.error_report_triggered':
        const meterError = event.data.object
        console.error('Billing meter error:', meterError)
        // Log this error for monitoring
        await logBillingError(event)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: any) {
  try {
    // Extract user info from metadata
    const userId = session.metadata?.userId
    const planId = session.metadata?.planId

    if (!userId || !planId) {
      console.error('Missing metadata in checkout session')
      return
    }

    // Create or update subscription
    const { error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: parseInt(userId),
        plan_id: planId.toString(),
        tier_id: parseInt(planId), // Keep both for compatibility
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        start_date: new Date().toISOString(),
        is_active: true,
        translations_used: 0,
        translations_used_this_period: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error creating subscription:', error)
    }
  } catch (error) {
    console.error('Error handling checkout completed:', error)
  }
}

async function handleSubscriptionUpdate(subscription: any) {
  try {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        is_active: subscription.status === 'active',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Error updating subscription:', error)
    }
  } catch (error) {
    console.error('Error handling subscription update:', error)
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        is_active: false,
        end_date: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Error deleting subscription:', error)
    }
  } catch (error) {
    console.error('Error handling subscription deletion:', error)
  }
}

async function handlePaymentSucceeded(invoice: any) {
  try {
    // Reset monthly usage counter if it's a recurring payment
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        translations_used: 0,
        translations_used_this_period: 0,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', invoice.customer)
      .eq('is_active', true)

    if (error) {
      console.error('Error resetting usage:', error)
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handlePaymentFailed(invoice: any) {
  try {
    // Log payment failure
    console.error('Payment failed for customer:', invoice.customer)
    
    // You might want to send an email notification here
    // or update the subscription status
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

async function logBillingError(event: any) {
  try {
    // Log billing errors to a separate table for monitoring
    const { error } = await supabase
      .from('billing_errors')
      .insert({
        event_id: event.id,
        event_type: event.type,
        meter_id: event.related_object?.id,
        error_data: event,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error logging billing error:', error)
    }
  } catch (error) {
    console.error('Error in logBillingError:', error)
  }
} 