import { supabase } from "./db"

export interface SubscriptionPlan {
  id: number
  name: string
  monthlyPrice: number
  translationsPerMonth: number
  features: string[]
}

export interface UserSubscription {
  userId: number
  tierId: number
  startDate: Date
  endDate: Date | null
  isActive: boolean
  translationsUsed: number
}

export async function getUserSubscription(userId: number): Promise<UserSubscription | null> {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error("Error fetching user subscription:", error)
      return null
    }

    if (!data) {
      // Return free tier if no subscription
      return {
        userId,
        tierId: 1,
        startDate: new Date(),
        endDate: null,
        isActive: true,
        translationsUsed: 0,
      }
    }

    return {
      userId: data.user_id,
      tierId: data.tier_id,
      startDate: new Date(data.start_date),
      endDate: data.end_date ? new Date(data.end_date) : null,
      isActive: data.is_active,
      translationsUsed: data.translations_used
    }
  } catch (error) {
    console.error("Error fetching user subscription:", error)
    // Return free tier as fallback
    return {
      userId,
      tierId: 1,
      startDate: new Date(),
      endDate: null,
      isActive: true,
      translationsUsed: 0,
    }
  }
}

export async function getSubscriptionPlan(planId: number): Promise<SubscriptionPlan | null> {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (error) {
      console.error("Error fetching subscription tier:", error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      monthlyPrice: data.monthly_price,
      translationsPerMonth: data.translations_per_month,
      features: data.features || []
    }
  } catch (error) {
    console.error("Error fetching subscription tier:", error)
    // Return free tier as fallback
    return {
      id: 1,
      name: "Free",
      monthlyPrice: 0,
      translationsPerMonth: 5,
      features: ["5 translations per month"],
    }
  }
}

export async function incrementTranslationUsage(userId: number): Promise<boolean> {
  try {
    // First, get current usage
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('translations_used')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    const currentUsage = subscription?.translations_used || 0

    // Update usage count
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ translations_used: currentUsage + 1 })
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) {
      console.error("Error incrementing translation usage:", error)
      return true // Return success anyway to not block the user
    }

    return true
  } catch (error) {
    console.error("Error incrementing translation usage:", error)
    return true // Return success anyway to not block the user
  }
}

export async function checkTranslationLimit(userId: number): Promise<{
  canTranslate: boolean
  remaining: number
  limit: number
}> {
  try {
    const subscription = await getUserSubscription(userId)

    // If no subscription, use free tier limit (5 translations)
    if (!subscription) {
      const freeUsage = await getFreeUsage(userId)
      return {
        canTranslate: freeUsage < 5,
        remaining: Math.max(0, 5 - freeUsage),
        limit: 5,
      }
    }

    const tier = await getSubscriptionPlan(subscription.tierId)

    if (!tier) {
      throw new Error("Subscription tier not found")
    }

    // If unlimited (-1), always allow
    if (tier.translationsPerMonth === -1) {
      return {
        canTranslate: true,
        remaining: -1,
        limit: -1,
      }
    }

    const remaining = tier.translationsPerMonth - subscription.translationsUsed

    return {
      canTranslate: remaining > 0,
      remaining: Math.max(0, remaining),
      limit: tier.translationsPerMonth,
    }
  } catch (error) {
    console.error("Error checking translation limit:", error)
    // Allow translations in case of error
    return {
      canTranslate: true,
      remaining: 5,
      limit: 5,
    }
  }
}

async function getFreeUsage(userId: number): Promise<number> {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const { data, error } = await supabase
      .from('submissions')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('submitted_at', startOfMonth.toISOString())

    if (error) {
      console.error("Error getting free usage:", error)
      return 0
    }

    return data?.length || 0
  } catch (error) {
    console.error("Error getting free usage:", error)
    return 0 // Return 0 in case of error to allow translations
  }
}
