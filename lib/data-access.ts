import { supabase } from "./db"
import { logger } from "./logger"

export interface User {
  id: number
  username: string
}

export interface Submission {
  id: number
  userId: number
  submittedText: string
  submittedAt: Date
}

export interface LaymenTerm {
  id: number
  submissionId: number
  explanation: string
  returnedAt: Date
}

export interface UserLaymenTermsView {
  userId: number
  username: string
  submissionId: number
  submittedText: string
  submittedAt: Date
  laymenTermId: number
  explanation: string
  returnedAt: Date
}

export interface UserActivitySummary {
  userId: number
  username: string
  submissionCount: number
  explanationCount: number
  usageLogCount: number
}

// Get user translations history
export async function getUserTranslations(userId: number): Promise<UserLaymenTermsView[]> {
  try {
    const { data, error } = await supabase
      .from('user_laymen_terms_view')
      .select('*')
      .eq('userId', userId)
      .order('submittedAt', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    logger.error("Error fetching user translations:", error)
    return []
  }
}

// Get user activity summary
export async function getUserActivitySummary(userId: number): Promise<UserActivitySummary | null> {
  try {
    const { data, error } = await supabase
      .from('user_activity_summary')
      .select('*')
      .eq('userId', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    logger.error("Error fetching user activity summary:", error)
    return null
  }
}

// Submit new medical text for translation
export async function submitMedicalText(userId: number, text: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .insert({
        userId,
        submittedText: text,
        submittedAt: new Date().toISOString()
      })
      .select('id')
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    logger.error("Error submitting medical text:", error)
    throw error
  }
}

// Save laymen terms explanation
export async function saveLaymenTerms(submissionId: number, explanation: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('laymen_terms')
      .insert({
        submissionId,
        explanation,
        returnedAt: new Date().toISOString()
      })
      .select('id')
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    logger.error("Error saving laymen terms:", error)
    throw error
  }
}

// Get user by username
export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username')
      .eq('username', username)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned"
    return data
  } catch (error) {
    logger.error("Error fetching user:", error)
    return null
  }
}

// Create new user
export async function createUser(username: string, password: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        username,
        password_hash: password // Note: In production, this should be hashed
      })
      .select('id')
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    logger.error("Error creating user:", error)
    throw error
  }
}
