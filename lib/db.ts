import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Create Supabase client for public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create Supabase client with service role for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

console.log('Supabase initialized with URL:', supabaseUrl ? 'Configured' : 'Not configured')

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
      console.log('Creating database tables...')
      
      // Note: In Supabase, you typically create tables through the dashboard
      // or using migrations. This is just for reference.
      console.log('Please create tables through Supabase dashboard or migrations')
    } else if (error) {
      console.error('Database check error:', error)
      throw error
    } else {
      console.log('Database initialized successfully')
    }
  } catch (err) {
    console.error('Failed to initialize database:', err)
    throw err
  }
}

// Export for backward compatibility
export { supabase as getConnection }
