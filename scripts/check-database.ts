import { createClient } from '@supabase/supabase-js'

// Use your Supabase credentials
const supabaseUrl = 'https://bwzadcndzreqgeuvcqrk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3emFkY25kenJlcWdldXZjcXJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA0OTgyNywiZXhwIjoyMDY1NjI1ODI3fQ.iyMv3y3hgaUtNr6AdNC1CCh7OQMXSUB0fF3P3SxbOiM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('🔍 Checking Supabase Database Schema...\n')

  const requiredTables = [
    'users',
    'submissions',
    'laymen_terms',
    'user_subscriptions',
    'subscription_plans',
  ]

  let allTablesExist = true
  let hasData = false

  for (const table of requiredTables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .limit(1)

      if (error) {
        if (error.code === '42P01') {
          console.log(`❌ Table "${table}" does NOT exist`)
          allTablesExist = false
        } else {
          console.log(`⚠️  Table "${table}" - Error: ${error.message}`)
        }
      } else {
        console.log(`✅ Table "${table}" exists ${count !== null ? `(${count} rows)` : ''}`)
        if (count && count > 0) {
          hasData = true
        }
      }
    } catch (err) {
      console.log(`❌ Error checking table "${table}":`, err)
      allTablesExist = false
    }
  }

  console.log('\n📊 Database Status:')
  console.log(`   Tables: ${allTablesExist ? '✅ All required tables exist' : '❌ Some tables missing'}`)
  console.log(`   Data: ${hasData ? '✅ Database has data' : 'ℹ️  Database is empty (this is normal for new setup)'}`)

  if (!allTablesExist) {
    console.log('\n🔧 Next Steps:')
    console.log('   1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/bwzadcndzreqgeuvcqrk')
    console.log('   2. Click "SQL Editor" in the left sidebar')
    console.log('   3. Run the SQL from DATABASE_SCHEMA.md to create tables')
    console.log('   4. Run this script again to verify')
  } else {
    console.log('\n🎉 Database is ready! You can start using the app.')
  }

  // Check subscription plans specifically
  console.log('\n🔍 Checking Subscription Plans...')
  try {
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('id, name, monthly_price, translations_per_month')

    if (error) {
      console.log('❌ Error fetching subscription plans:', error.message)
    } else if (!plans || plans.length === 0) {
      console.log('⚠️  No subscription plans found!')
      console.log('   You need to insert default plans. Run the SQL from DATABASE_SCHEMA.md')
    } else {
      console.log(`✅ Found ${plans.length} subscription plan(s):`)
      plans.forEach(plan => {
        console.log(`   - ${plan.name}: $${plan.monthly_price}/month, ${plan.translations_per_month === -1 ? 'Unlimited' : plan.translations_per_month} translations`)
      })
    }
  } catch (err) {
    console.log('❌ Could not check subscription plans')
  }
}

checkDatabase().catch(console.error)
