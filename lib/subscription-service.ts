import { sql, poolPromise } from "./db"

export interface SubscriptionTier {
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
    const pool = await poolPromise
    const result = await pool
      .request()
      .input("UserId", sql.Int, userId)
      .query(`
        SELECT * FROM [dbo].[UserSubscriptions] 
        WHERE UserId = @UserId AND IsActive = 1
      `)

    return result.recordset[0] || null
  } catch (error) {
    console.error("Error fetching user subscription:", error)
    throw error
  }
}

export async function getSubscriptionTier(tierId: number): Promise<SubscriptionTier | null> {
  try {
    const pool = await poolPromise
    const result = await pool
      .request()
      .input("TierId", sql.Int, tierId)
      .query(`
        SELECT * FROM [dbo].[SubscriptionPlans] 
        WHERE Id = @TierId
      `)

    return result.recordset[0] || null
  } catch (error) {
    console.error("Error fetching subscription tier:", error)
    throw error
  }
}

export async function incrementTranslationUsage(userId: number): Promise<boolean> {
  try {
    const pool = await poolPromise
    await pool
      .request()
      .input("UserId", sql.Int, userId)
      .query(`
        UPDATE [dbo].[UserSubscriptions]
        SET TranslationsUsed = TranslationsUsed + 1
        WHERE UserId = @UserId AND IsActive = 1
      `)

    return true
  } catch (error) {
    console.error("Error incrementing translation usage:", error)
    throw error
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

    const tier = await getSubscriptionTier(subscription.tierId)

    if (!tier) {
      throw new Error("Subscription tier not found")
    }

    const remaining = tier.translationsPerMonth - subscription.translationsUsed

    return {
      canTranslate: remaining > 0,
      remaining: Math.max(0, remaining),
      limit: tier.translationsPerMonth,
    }
  } catch (error) {
    console.error("Error checking translation limit:", error)
    throw error
  }
}

async function getFreeUsage(userId: number): Promise<number> {
  try {
    const pool = await poolPromise
    const result = await pool
      .request()
      .input("UserId", sql.Int, userId)
      .query(`
        SELECT COUNT(*) AS UsageCount FROM [dbo].[Submissions]
        WHERE UserId = @UserId AND DATEPART(month, SubmittedAt) = DATEPART(month, GETDATE())
        AND DATEPART(year, SubmittedAt) = DATEPART(year, GETDATE())
      `)

    return result.recordset[0]?.UsageCount || 0
  } catch (error) {
    console.error("Error getting free usage:", error)
    throw error
  }
}
