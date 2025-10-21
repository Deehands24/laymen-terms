# Vercel Environment Variables Configuration

## 🚨 IMPORTANT: Add these to Vercel Dashboard

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

## ✅ Supabase Configuration (READY)

```bash
# Supabase URL
NEXT_PUBLIC_SUPABASE_URL=https://bwzadcndzreqgeuvcqrk.supabase.co

# Supabase Anon Key (Public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3emFkY25kenJlcWdldXZjcXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNDk4MjcsImV4cCI6MjA2NTYyNTgyN30.mVPglQniY-oQKIHnTi13UvwGshEYWiW7CpGDIiyjNX8

# Supabase Service Role Key (Server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3emFkY25kenJlcWdldXZjcXJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA0OTgyNywiZXhwIjoyMDY1NjI1ODI3fQ.iyMv3y3hgaUtNr6AdNC1CCh7OQMXSUB0fF3P3SxbOiM
```

## ⚠️ TODO: Get These Keys

### 1. Groq API Key (REQUIRED for AI translations)
```bash
GROQ_API_KEY=gsk_[YOUR_KEY_HERE]
```
**How to get:**
1. Go to: https://console.groq.com/keys
2. Sign up (free tier available)
3. Create API key
4. Copy and paste above

### 2. JWT Secret (REQUIRED for authentication)
```bash
JWT_SECRET=[GENERATE_SECURE_KEY]
```
**How to generate:**
Run this command in your terminal:
```bash
openssl rand -base64 32
```
Copy the output and use as JWT_SECRET

### 3. Stripe Keys (REQUIRED for payments)
```bash
# Use TEST keys first!
STRIPE_SECRET_KEY=sk_test_[YOUR_TEST_KEY]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_[YOUR_TEST_KEY]
STRIPE_WEBHOOK_SECRET=whsec_[GET_AFTER_CREATING_WEBHOOK]
```
**How to get:**
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy "Publishable key" and "Secret key"
3. For webhook secret:
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Click "Add endpoint"
   - URL: `https://your-domain.vercel.app/api/stripe-webhook`
   - Select events (see ClickUp task for details)
   - Copy "Signing secret"

### 4. Domain (OPTIONAL but recommended)
```bash
NEXT_PUBLIC_DOMAIN=https://medicalterms.vercel.app
```
Update this once you have your Vercel deployment URL

---

## 📋 Environment Variables Checklist

For each variable in Vercel:
- [ ] Check: **Production** ✓
- [ ] Check: **Preview** ✓  
- [ ] Check: **Development** ✓

This ensures variables work in all environments.

---

## 🚀 After Adding Variables

1. **Redeploy your app**:
   - Go to: Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

2. **Test that it works**:
   - Visit your site
   - Try creating an account
   - Try translating medical text
   - Check Vercel Function Logs for any errors

---

## 🐛 Troubleshooting

If you see "API key not configured" error:
1. Verify `GROQ_API_KEY` is added in Vercel
2. Check it's enabled for Production/Preview/Development
3. Redeploy the app
4. Check Vercel Function logs for detailed error messages

If Supabase connection fails:
1. Verify the URL and keys are exactly as shown above
2. Check Supabase project is not paused
3. Verify database tables exist (see DATABASE_SCHEMA.md)

---

## ✅ Summary

**READY NOW:**
- ✅ Supabase URL
- ✅ Supabase Anon Key
- ✅ Supabase Service Role Key

**YOU NEED TO GET:**
- ⚠️ Groq API Key (for AI translations)
- ⚠️ JWT Secret (generate with openssl)
- ⚠️ Stripe Keys (for payments)
- ℹ️ Domain (update after deployment)

**Total Variables Needed: 8**
**You Have: 3**
**Still Need: 5**

Once you add all variables and redeploy, your app will be fully functional! 🚀
