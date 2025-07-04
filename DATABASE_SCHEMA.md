# Database Schema Documentation

## Overview
This document describes the complete database schema for the Medical Terms Translator application using Supabase.

## Tables

### 1. users
Stores user account information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, references auth.users |
| username | TEXT | Unique username |
| email | TEXT | User email (unique) |
| password_hash | TEXT | Hashed password for custom auth |
| avatar_url | TEXT | User avatar URL |
| full_name | TEXT | User's full name |
| created_at | TIMESTAMPTZ | Account creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- `idx_users_email` on (email)
- `idx_users_username` on (username)

**RLS Policies:**
- Users can view their own profile
- Users can update their own profile
- Users can insert their own profile

### 2. submissions
Stores medical text submissions by users.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key (auto-increment) |
| user_id | UUID | Foreign key to users.id |
| submitted_text | TEXT | The medical text to translate |
| submitted_at | TIMESTAMPTZ | Submission timestamp |
| created_at | TIMESTAMPTZ | Record creation timestamp |

**Indexes:**
- `idx_submissions_user_id` on (user_id)
- `idx_submissions_submitted_at` on (submitted_at)
- `idx_submissions_user_date` on (user_id, submitted_at DESC)

**RLS Policies:**
- Users can view their own submissions
- Users can create their own submissions

### 3. laymen_terms
Stores the simplified explanations for submissions.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key (auto-increment) |
| submission_id | BIGINT | Foreign key to submissions.id |
| explanation | TEXT | The simplified explanation |
| returned_at | TIMESTAMPTZ | When the explanation was generated |
| created_at | TIMESTAMPTZ | Record creation timestamp |

**Indexes:**
- `idx_laymen_terms_submission_id` on (submission_id)

**RLS Policies:**
- Users can view laymen terms for their own submissions

### 4. subscription_plans
Stores available subscription tiers.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key |
| name | TEXT | Plan name (unique) |
| description | TEXT | Plan description |
| monthly_price | NUMERIC | Monthly price in USD |
| translations_per_month | INTEGER | Translation limit (-1 for unlimited) |
| features | JSONB | Array of feature descriptions |
| stripe_product_id | TEXT | Stripe product ID |
| active | BOOLEAN | Whether plan is available |

**RLS Policies:**
- Anyone can view subscription plans

### 5. user_subscriptions
Stores user subscription information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users.id |
| plan_id | TEXT | Foreign key to subscription_plans.id |
| tier_id | INTEGER | Legacy tier ID |
| stripe_customer_id | TEXT | Stripe customer ID (unique) |
| stripe_subscription_id | TEXT | Stripe subscription ID (unique) |
| status | subscription_status | Subscription status enum |
| current_period_start | TIMESTAMPTZ | Current billing period start |
| current_period_end | TIMESTAMPTZ | Current billing period end |
| cancel_at_period_end | BOOLEAN | Whether to cancel at period end |
| canceled_at | TIMESTAMPTZ | Cancellation timestamp |
| trial_start | TIMESTAMPTZ | Trial period start |
| trial_end | TIMESTAMPTZ | Trial period end |
| translations_used_this_period | INTEGER | Translations used in current period |
| translations_used | INTEGER | Legacy translations counter |
| start_date | TIMESTAMPTZ | Subscription start date |
| end_date | TIMESTAMPTZ | Subscription end date |
| is_active | BOOLEAN | Whether subscription is active |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- `idx_user_subscriptions_user_id` on (user_id)
- `idx_user_subscriptions_stripe_customer` on (stripe_customer_id)
- `idx_user_subscriptions_active` on (is_active)
- `idx_user_subs_active_user` on (user_id, is_active) WHERE is_active = true

**RLS Policies:**
- Users can view their own subscriptions
- Service role can manage all subscriptions

### 6. billing_errors
Logs Stripe webhook errors for debugging.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| event_id | TEXT | Stripe event ID |
| event_type | TEXT | Type of event |
| meter_id | TEXT | Billing meter ID |
| error_data | JSONB | Full error details |
| created_at | TIMESTAMPTZ | Error timestamp |

**RLS Policies:**
- Only service role can access

## Views

### user_laymen_terms_view
Joins users, submissions, and laymen_terms for easy querying.

### user_activity_summary
Aggregates user activity statistics.

## Functions

### authenticate_user(username, password_hash)
Authenticates a user with custom auth.

### register_user(username, email, password_hash)
Registers a new user and creates default free subscription.

### handle_new_user()
Trigger function that syncs auth.users with public.users.

### reset_monthly_translation_usage()
Resets translation counters at the end of billing periods.

## Enums

### subscription_status
- active
- trialing
- past_due
- canceled
- unpaid
- incomplete
- incomplete_expired

## Row Level Security (RLS)

All tables have RLS enabled with appropriate policies to ensure users can only access their own data. The only exceptions are:
- `subscription_plans` table (public read access)
- Service role has full access to all tables

## Authentication

The application supports two authentication methods:
1. **Supabase Auth**: Using the built-in auth.users table
2. **Custom Auth**: Using username/password_hash in the public.users table

The `handle_new_user()` trigger ensures both systems stay in sync.

## Default Data

### Subscription Plans
1. **Free** (ID: 1)
   - Price: $0/month
   - Limit: 10 translations/month
   - Features: Basic medical term translations, Standard AI model

2. **Pro** (ID: 2)
   - Price: $9.99/month
   - Limit: 100 translations/month
   - Features: Advanced translations, Premium AI model, Translation history, Export to PDF

3. **Enterprise** (ID: 3)
   - Price: $29.99/month
   - Limit: Unlimited
   - Features: Unlimited translations, Premium AI model, Priority support, API access, Custom terminology
