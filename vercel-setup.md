# Vercel Deployment Guide for Medical Terms Translator

## Prerequisites
1. Vercel account (free tier works)
2. GitHub repository with your code
3. Supabase account and project
4. Stripe account for payments
5. Groq API key

## Step 1: Prepare Your Supabase Database

### Create Tables in Supabase
Go to your Supabase dashboard and create these tables:

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Submissions table
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  submitted_text TEXT NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- Laymen terms table
CREATE TABLE laymen_terms (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER REFERENCES submissions(id),
  explanation TEXT NOT NULL,
  returned_at TIMESTAMP DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  tier_id INTEGER DEFAULT 1,
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  translations_used INTEGER DEFAULT 0,
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255)
);

-- Subscription plans table
CREATE TABLE subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  monthly_price DECIMAL(10,2) NOT NULL,
  translations_per_month INTEGER NOT NULL,
  features JSONB
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, monthly_price, translations_per_month, features) VALUES
('Free', 0, 5, '["5 translations per month", "Basic support"]'),
('Basic', 7.99, 50, '["50 translations per month", "Email support", "History access"]'),
('Premium', 14.99, 200, '["200 translations per month", "Priority support", "Advanced features"]'),
('Professional', 29.99, -1, '["Unlimited translations", "24/7 support", "API access", "Custom models"]');

-- Create a view for user translations history
CREATE VIEW user_laymen_terms_view AS
SELECT 
  u.id as user_id,
  u.username,
  s.id as submission_id,
  s.submitted_text,
  s.submitted_at,
  l.id as laymen_term_id,
  l.explanation,
  l.returned_at
FROM users u
JOIN submissions s ON u.id = s.user_id
JOIN laymen_terms l ON s.id = l.submission_id;
```

## Step 2: Environment Variables

Create a `.env.local` file with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Groq API
GROQ_API_KEY=your_groq_api_key

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Stripe (optional for now)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Step 3: Deploy to Vercel

### Option A: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Option B: Via GitHub Integration
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure environment variables (see Step 4)
4. Deploy

## Step 4: Configure Environment Variables in Vercel

1. Go to your project settings in Vercel Dashboard
2. Navigate to "Environment Variables"
3. Add all required variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GROQ_API_KEY`
   - `JWT_SECRET`
   - `STRIPE_SECRET_KEY` (when ready)
   - `STRIPE_WEBHOOK_SECRET` (when ready)
   - `DOMAIN` (set to your Vercel URL)

## Step 5: Set Up Stripe Webhook (When Ready)

1. Get your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
2. Create the webhook API route first
3. In Stripe Dashboard, add webhook endpoint:
   - Endpoint URL: `https://your-app.vercel.app/api/stripe-webhook`
   - Events to listen for:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

## Step 6: Enable Row Level Security (RLS) in Supabase

For security, enable RLS on your tables:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE laymen_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies (example for submissions)
CREATE POLICY "Users can view own submissions" ON submissions
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own submissions" ON submissions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
```

## Step 7: Monitor and Optimize

1. Use Vercel Analytics to monitor performance
2. Check Vercel Function logs for errors
3. Monitor Supabase dashboard for:
   - Database performance
   - API usage
   - Storage usage

## Revenue Tracking for Passive Income

Since this is a passive income project:

1. **Vercel Analytics**: Track page views and user engagement
2. **Supabase Dashboard**: Monitor API calls and database usage
3. **Stripe Dashboard**: Track revenue and subscriptions
4. **Custom Dashboard**: Build a simple admin page to track:
   - Total users
   - Active subscriptions
   - Monthly recurring revenue (MRR)
   - Translation usage

## Troubleshooting Common Issues

1. **Supabase Connection Issues**: 
   - Check if environment variables are properly set
   - Verify Supabase project is not paused

2. **CORS Issues**: 
   - Already handled in vercel.json
   - Supabase handles CORS automatically

3. **Function Timeouts**: 
   - Free tier: 10 seconds max
   - Pro tier: 60 seconds max

4. **Rate Limiting**:
   - Supabase free tier: 500 requests per hour
   - Consider upgrading if you hit limits

## Estimated Costs
- **Vercel**: Free tier (100GB bandwidth/month)
- **Supabase**: Free tier (500MB database, 2GB bandwidth)
- **Groq**: Check their pricing
- **Total**: $0/month to start, scale as needed

## Next Steps After Deployment
1. Set up custom domain
2. Enable Vercel Analytics
3. Create admin dashboard for monitoring
4. Set up automated backups in Supabase
5. Implement rate limiting for API endpoints 