// Stripe Payment Integration for Medical Terms Translator
// This handles subscription payments for passive income

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Subscription Plans Configuration
const SUBSCRIPTION_PLANS = {
  basic: {
    priceId: 'price_basic_monthly', // You'll get this from Stripe dashboard
    amount: 799, // $7.99 in cents
    interval: 'month',
    translationsPerMonth: 50
  },
  premium: {
    priceId: 'price_premium_monthly',
    amount: 1499, // $14.99 in cents
    interval: 'month',
    translationsPerMonth: 200
  },
  professional: {
    priceId: 'price_professional_monthly',
    amount: 2999, // $29.99 in cents
    interval: 'month',
    translationsPerMonth: -1 // Unlimited
  }
};

// Create Checkout Session
async function createCheckoutSession(planType, userId, userEmail) {
  const plan = SUBSCRIPTION_PLANS[planType];
  
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.DOMAIN}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.DOMAIN}/subscription/cancelled`,
    customer_email: userEmail,
    metadata: {
      userId: userId,
      planType: planType
    },
    subscription_data: {
      metadata: {
        userId: userId,
        planType: planType
      }
    }
  });

  return session;
}

// Handle Webhook Events (for passive income tracking)
async function handleWebhook(request) {
  const sig = request.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCancelled(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
  }

  return { received: true };
}

// Revenue Tracking Functions
async function handleSubscriptionCreated(subscription) {
  const userId = subscription.metadata.userId;
  const planType = subscription.metadata.planType;
  
  // Update user subscription in database
  await updateUserSubscription(userId, {
    stripeSubscriptionId: subscription.id,
    planType: planType,
    status: 'active',
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    translationsUsed: 0
  });

  // Track revenue for passive income monitoring
  await trackRevenue({
    userId,
    planType,
    amount: SUBSCRIPTION_PLANS[planType].amount,
    type: 'subscription_created',
    date: new Date()
  });
}

async function handlePaymentSucceeded(invoice) {
  // Track monthly recurring revenue
  await trackRevenue({
    subscriptionId: invoice.subscription,
    amount: invoice.amount_paid,
    type: 'monthly_payment',
    date: new Date()
  });
  
  // Reset translation usage for the new billing period
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = subscription.metadata.userId;
  
  await resetMonthlyUsage(userId);
}

// Revenue Analytics for Passive Income Tracking
async function getRevenueAnalytics() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  return {
    monthlyRecurringRevenue: await calculateMRR(),
    totalActiveSubscriptions: await getActiveSubscriptionCount(),
    churnRate: await calculateChurnRate(),
    lifetimeValue: await calculateLTV(),
    dailyRevenue: await getDailyRevenue(thirtyDaysAgo, today)
  };
}

module.exports = {
  createCheckoutSession,
  handleWebhook,
  getRevenueAnalytics,
  SUBSCRIPTION_PLANS
}; 