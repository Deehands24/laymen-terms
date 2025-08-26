import { createClient } from '@supabase/supabase-js'
import { logger } from "./logger"

// Prefer server-only SUPABASE_URL; fall back to NEXT_PUBLIC_SUPABASE_URL for local/dev convenience
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl) {
  // Fail fast with a clear message instead of let createClient raise a cryptic error later
  const msg = 'Supabase URL is missing. Set SUPABASE_URL (server) or NEXT_PUBLIC_SUPABASE_URL (public) in your environment.'
  logger.error(msg)
  throw new Error(msg)
}

if (!supabaseAnonKey) {
  logger.info('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Public client operations may fail in the browser.')
}

if (!supabaseServiceKey) {
  logger.info('SUPABASE_SERVICE_ROLE_KEY is not set. Admin operations that require the service role key will fail.')
}

// Create Supabase client for public operations (may be used in server-rendered pages)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create Supabase client with service role for admin operations when key is present
export const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : (null as any)

logger.debug('Supabase initialized:', { url: supabaseUrl ? 'configured' : 'missing', hasAnonKey: !!supabaseAnonKey, hasServiceKey: !!supabaseServiceKey })

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Check if users table exists by trying to query it
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (error && error.code === '42P01') {
      // Table doesn't exist, create it
      logger.debug('Creating database tables...')
      
      // Note: In Supabase, you typically create tables through the dashboard
      // or using migrations. This is just for reference.
      logger.debug('Please create tables through Supabase dashboard or migrations')
    } else if (error) {
      console.error('Database check error:', error)
      throw error
    } else {
      logger.debug('Database initialized successfully')
    }
  } catch (err) {
    console.error('Failed to initialize database:', err)
    throw err
  }
}

// Export for backward compatibility
export { supabase as getConnection }
