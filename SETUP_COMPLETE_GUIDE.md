# 🚀 Complete Setup Guide - Medical Terms Translator

## ✅ What I've Done For You

### 1. Fixed AI Translations ✓
- Removed development environment block
- Added proper error handling
- Improved logging

### 2. Added Comprehensive SEO ✓
- Metadata, Open Graph, Twitter Cards
- robots.txt, sitemap.xml
- Structured data (Schema.org)
- SEO-rich content

### 3. Configuration Files ✓
- `.env.example` with all variables
- Vercel environment variables guide
- Database check script

---

## 📋 YOUR IMMEDIATE ACTION ITEMS

### Step 1: Add Environment Variables to Vercel

Go to: **https://vercel.com/dashboard** → Your Project → Settings → Environment Variables

#### ✅ Supabase (READY - Copy from below)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://bwzadcndzreqgeuvcqrk.supabase.co
```
```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3emFkY25kenJlcWdldXZjcXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNDk4MjcsImV4cCI6MjA2NTYyNTgyN30.mVPglQniY-oQKIHnTi13UvwGshEYWiW7CpGDIiyjNX8
```
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3emFkY25kenJlcWdldXZjcXJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA0OTgyNywiZXhwIjoyMDY1NjI1ODI3fQ.iyMv3y3hgaUtNr6AdNC1CCh7OQMXSUB0fF3P3SxbOiM
```

#### ✅ JWT Secret (GENERATED FOR YOU - Copy from below)

```bash
JWT_SECRET=/VpWBG1GLIVzetNoK6tgw1zkCw67y0OpWLnsd9FVo1U=
```

#### ⚠️ Groq API Key (YOU NEED TO GET THIS)

```bash
GROQ_API_KEY=gsk_[YOUR_KEY_HERE]
```

**How to get:**
1. Go to: https://console.groq.com/keys
2. Sign up (it's FREE!)
3. Click "Create API Key"
4. Copy the key
5. Add to Vercel as `GROQ_API_KEY`

**IMPORTANT:** Without this, AI translations will NOT work!

#### ⚠️ Stripe Keys (YOU NEED TO GET THIS)

Start with TEST mode:

```bash
STRIPE_SECRET_KEY=sk_test_[GET_FROM_STRIPE]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_[GET_FROM_STRIPE]
STRIPE_WEBHOOK_SECRET=whsec_[GET_AFTER_WEBHOOK]
```

**How to get:**
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy "Publishable key" → Add as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Copy "Secret key" → Add as `STRIPE_SECRET_KEY`
4. For webhook (do this after deployment):
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Click "Add endpoint"
   - URL: `https://[your-vercel-url].vercel.app/api/stripe-webhook`
   - Events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy "Signing secret" → Add as `STRIPE_WEBHOOK_SECRET`

#### ℹ️ Domain (Optional - Add after first deployment)

```bash
NEXT_PUBLIC_DOMAIN=https://your-site.vercel.app
```

---

### Step 2: Verify Supabase Database

Your Supabase project: https://supabase.com/dashboard/project/bwzadcndzreqgeuvcqrk

#### Check if tables exist:
1. Go to Supabase Dashboard
2. Click "Table Editor" in left sidebar
3. Check if these tables exist:
   - ✓ `users`
   - ✓ `submissions`
   - ✓ `laymen_terms`
   - ✓ `user_subscriptions`
   - ✓ `subscription_plans`

#### If tables don't exist:
1. Click "SQL Editor" in left sidebar
2. Copy and run the SQL from `DATABASE_SCHEMA.md`
3. Verify tables were created

#### Check subscription plans:
1. Go to "Table Editor" → `subscription_plans`
2. Should have 4 rows:
   - Free ($0, 5 translations)
   - Basic ($7.99, 50 translations)
   - Premium ($14.99, 200 translations)
   - Professional ($29.99, unlimited)

If empty, run the INSERT statements from `DATABASE_SCHEMA.md`

---

### Step 3: Merge the PR and Deploy

1. **Merge PR #6**: https://github.com/Deehands24/laymen-terms/pull/6
   - Go to the PR
   - Review changes
   - Click "Merge pull request"

2. **Vercel will auto-deploy**
   - Wait for deployment to complete (~2-3 minutes)
   - Note your deployment URL

3. **Add webhook to Stripe** (see Step 1 for details)

4. **Redeploy** (to pick up all env variables)
   - Go to Vercel → Deployments
   - Click "..." on latest
   - Click "Redeploy"

---

### Step 4: Test Everything

#### Test Checklist:

1. **Homepage loads** ✓
   - Visit your Vercel URL
   - Should see "Medical Terms Translator"
   - Should see registration form

2. **Registration works** ✓
   - Create test account (username + password)
   - Should redirect to translation form

3. **AI Translation works** ✓
   - Enter medical text like "myocardial infarction"
   - Click translate
   - Should get plain language explanation (not error!)
   - Check Vercel Function logs if error

4. **Dashboard works** ✓
   - Go to /dashboard
   - Should see your translation history

5. **Subscription page works** ✓
   - Go to /subscription
   - Should see 4 pricing tiers
   - Click "Subscribe" on Basic plan

6. **Stripe checkout works** ✓
   - Should redirect to Stripe checkout
   - Use test card: `4242 4242 4242 4242`
   - Complete payment
   - Should redirect back to your site

7. **Subscription activates** ✓
   - Check Supabase `user_subscriptions` table
   - Should see your subscription with `is_active = true`
   - Try translating more than 5 times (free limit)

8. **SEO works** ✓
   - Visit `/sitemap.xml` - Should see sitemap
   - Visit `/robots.txt` - Should see robots file
   - Share URL on Twitter/Slack - Should show preview image

---

## 🚨 Common Issues & Solutions

### "API key not configured" error
- ✓ Add `GROQ_API_KEY` to Vercel
- ✓ Redeploy app
- ✓ Check Vercel Function logs

### "Database connection error"
- ✓ Verify Supabase keys in Vercel
- ✓ Check Supabase project is not paused
- ✓ Verify tables exist

### "Stripe checkout not working"
- ✓ Verify Stripe keys are TEST keys (start with `sk_test_`)
- ✓ Check webhook is created and pointing to correct URL
- ✓ Verify webhook secret matches

### "Subscription not activating"
- ✓ Check Stripe webhook events in dashboard
- ✓ Verify webhook is receiving events
- ✓ Check Vercel Function logs for `/api/stripe-webhook`

---

## 📊 Summary

### ✅ READY NOW (4/8 variables):
- Supabase URL ✓
- Supabase Anon Key ✓
- Supabase Service Key ✓
- JWT Secret ✓ (generated for you)

### ⚠️ YOU NEED TO GET (4/8 variables):
- Groq API Key (for AI translations)
- Stripe Secret Key (for payments)
- Stripe Publishable Key (for payments)
- Stripe Webhook Secret (after webhook setup)

### 📝 Next Steps:
1. Add all 8 environment variables to Vercel
2. Merge PR #6
3. Verify Supabase database has tables
4. Test the complete flow
5. Switch Stripe to LIVE mode when ready

### ⏱️ Estimated Time: 1-2 hours

---

## 💰 Revenue Potential

With your pricing:
- Free tier gets people in the door
- Basic ($7.99) = **$7.25 profit** per month
- Premium ($14.99) = **$14.25 profit** per month ⭐ Promote this!
- Pro ($29.99) = **$29.13 profit** per month

**Goal:** 100 paying customers = $1,000-$2,000 MRR 🎯

---

## 🎉 You're Almost There!

The hardest work is done. Just need to:
1. Get Groq API key (5 minutes)
2. Get Stripe keys (10 minutes)
3. Add to Vercel (15 minutes)
4. Test everything (30 minutes)
5. Launch! 🚀

**Questions?** Check the ClickUp tasks for detailed instructions:
- https://app.clickup.com/t/86dy3endc (Launch Checklist)
- https://app.clickup.com/t/86dy3endm (Environment Variables)
- https://app.clickup.com/t/86dy3endq (Stripe Setup)

Good luck! 💪💰
