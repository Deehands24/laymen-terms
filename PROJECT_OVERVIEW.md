# Medical Terms Translator - Project Overview & Directions

**Last Updated:** 2026-01-21
**Project Status:** 85% Complete - Production Ready (with fixes)
**Current Branch:** `claude/review-stripe-groq-setup-Io2wQ`

---

## Executive Summary

**MedTerms** is a SaaS web application that translates complex medical terminology into simple, understandable language for patients and non-medical professionals. Built with Next.js 15, Supabase, Stripe, and Groq AI, this passive income product uses subscription-based monetization with tiered access.

**Core Value Proposition:**
- Medical jargon → Plain English translations using AI
- Privacy-first: No email required (medical confidentiality)
- Usage-based subscription tiers
- Translation history tracking

---

## Critical Issues Requiring Immediate Attention

### 🔴 PRIORITY 1: API Configuration

1. **Stripe Setup is Broken**
   - Current webhook handler has incomplete configuration
   - Hardcoded test key fallback in `/app/subscription/page.tsx:117`
   - Billing meter errors logged but not handled
   - Missing email notifications for payment failures

   **Action Required:**
   - Update Stripe webhook secret
   - Configure Stripe product IDs in `subscription_plans` table
   - Test webhook endpoints with Stripe CLI
   - Remove hardcoded `pk_test_...` fallback

2. **Groq API Key Needs Replacement**
   - Environment variable: `GROQ_API_KEY`
   - Used for all medical text translations
   - Current key may be expired/invalid

   **Action Required:**
   - Get new API key from Groq console
   - Update `.env` and Vercel environment variables

### 🟡 PRIORITY 2: Security & Production Readiness

3. **Debug Code in Production**
   - "Debug: Clear Data" button visible in navigation (`/components/navigation.tsx:43-55`)
   - Debug endpoint exposed at `/api/debug-auth`
   - Legacy SQL Server env checks in auth route (`/app/api/auth/route.ts:25-30`)

   **Action Required:**
   - Remove or hide debug features behind environment check
   - Delete unused debug endpoints

4. **Security Vulnerabilities**
   - No rate limiting on API endpoints
   - CORS set to `*` (allows all origins)
   - Client-side auth storage (localStorage, vulnerable to XSS)
   - No input sanitization on medical text

   **Action Required:**
   - Implement rate limiting middleware
   - Restrict CORS to production domain
   - Migrate auth to HTTP-only cookies
   - Add input validation/sanitization

5. **No Password Recovery**
   - Username-only auth (no email)
   - Users who forget passwords cannot recover accounts

   **Action Required:**
   - Implement security questions or backup recovery codes

### 🟢 PRIORITY 3: Missing Features

6. **Incomplete Subscription Management**
   - No cancellation UI (users must use Stripe portal)
   - No upgrade/downgrade flow
   - Hardcoded plans in frontend (should fetch from database)
   - Features listed but not implemented:
     - PDF export (Premium/Professional plans)
     - API access (Professional plan)
     - Custom terminology (Enterprise plan)
     - Medical diagrams (Professional plan)

7. **No Admin Dashboard**
   - Cannot view users, revenue, or analytics
   - No user management interface

8. **Code Quality Issues**
   - TypeScript errors ignored in build config
   - ESLint errors ignored
   - Type safety disabled

---

## Environment Configuration

### Required Environment Variables

```env
# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Required for admin operations

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# AI Service (NEEDS UPDATE)
GROQ_API_KEY=gsk_your_groq_api_key

# Stripe Payments (NEEDS CONFIGURATION)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Optional
NODE_ENV=production
VERCEL_ENV=production
```

### Deployment Settings

**Vercel Configuration (`vercel.json`):**
- Function timeouts:
  - `/api/translate`: 30 seconds
  - `/api/auth`: 10 seconds
  - `/api/history`: 10 seconds
  - `/api/stripe-webhook`: 10 seconds
- CORS headers: Currently set to `*` (NEEDS RESTRICTION)

---

## Architecture Overview

### Tech Stack

**Frontend:**
- Next.js 15.2.4 (App Router)
- React 19
- Tailwind CSS 3.4.17
- Radix UI component library
- React Hook Form + Zod validation

**Backend:**
- Next.js API Routes (serverless)
- Supabase (PostgreSQL)
- Custom JWT authentication (bcrypt + jsonwebtoken)

**External Services:**
- Groq AI (llama3-70b-8192, llama3-8b-8192, mixtral-8x7b-32768, gemma-7b-it)
- Stripe (Checkout + Webhooks)

### Database Schema

**Core Tables:**
1. `users` - User accounts (username, password_hash, no email)
2. `submissions` - Medical text submissions
3. `laymen_terms` - AI-generated translations
4. `subscription_plans` - Subscription tiers and pricing
5. `user_subscriptions` - User subscription status and usage tracking
6. `billing_errors` - Stripe webhook error logging

**Subscription Tiers:**
- **Free:** $0/month, 5 translations
- **Basic:** $7.99/month, 50 translations
- **Premium:** $14.99/month, 200 translations
- **Professional:** $29.99/month, unlimited translations

**Views:**
- `user_laymen_terms_view` - Joins users, submissions, and translations for history
- `user_activity_summary` - User statistics aggregation

**Security:** Row Level Security (RLS) enabled on all user-facing tables

### File Structure

```
/
├── app/                              # Next.js App Router
│   ├── page.tsx                      # Home (auth + translator)
│   ├── dashboard/page.tsx            # Translation history
│   ├── subscription/page.tsx         # Subscription management
│   └── api/                          # API Routes
│       ├── auth/route.ts             # Login/Register
│       ├── translate/route.ts        # Translation endpoint
│       ├── history/route.ts          # Get user translations
│       ├── models/route.ts           # Available AI models
│       ├── create-checkout-session/route.ts  # Stripe checkout
│       ├── stripe-webhook/route.ts   # Stripe webhooks
│       ├── test-groq/route.ts        # Groq connection test
│       └── debug-auth/route.ts       # Debug (REMOVE IN PROD)
│
├── components/
│   ├── ui/                           # 50+ Radix UI components
│   ├── auth-form.tsx                 # Login/Register form
│   ├── translation-form.tsx          # Main translation interface
│   ├── results-table.tsx             # History table
│   ├── navigation.tsx                # Navigation bar (HAS DEBUG BUTTON)
│   ├── loading-indicator.tsx         # Loading animation
│   ├── model-info.tsx                # AI model information
│   └── fade-in-section.tsx           # Animation wrapper
│
├── lib/
│   ├── db.ts                         # Supabase client setup
│   ├── auth.ts                       # Auth logic (register/login)
│   ├── ai-service.ts                 # Groq AI integration
│   ├── subscription-service.ts       # Subscription logic
│   ├── data-access.ts                # Database queries
│   ├── utils.ts                      # Utility functions
│   └── logger.ts                     # Logging utility
│
├── scripts/
│   └── init-db.ts                    # Database initialization
│
├── DATABASE_SCHEMA.md                # Complete DB documentation
├── LAUNCH_PREPARATION_REPORT.md      # Launch readiness checklist
└── vercel-setup.md                   # Deployment guide
```

---

## User Flows

### 1. Registration & First Translation

1. User lands on home page
2. Clicks "Register" tab in auth form
3. Enters username + password (no email required)
4. System creates user account + free subscription (5 translations/month)
5. User enters medical text
6. Selects AI model (optional, defaults to llama3-70b-8192)
7. Clicks "Translate"
8. AI returns simple explanation
9. Usage counter decrements (4 remaining)

### 2. Subscription Upgrade

1. User navigates to `/subscription`
2. Views 4 subscription tiers with features
3. Clicks "Subscribe" on desired plan
4. Redirected to Stripe Checkout (hosted page)
5. Completes payment
6. Stripe webhook updates database:
   - Creates/updates `user_subscriptions` record
   - Sets `stripe_customer_id` and `stripe_subscription_id`
   - Activates subscription
   - Resets usage counters
7. User redirected back to app
8. New translation limit applied

### 3. Translation History

1. User navigates to `/dashboard`
2. System fetches all past translations via `user_laymen_terms_view`
3. Displays paginated table with:
   - Original medical text
   - Simple explanation
   - Date/time of translation
4. User can review past translations

---

## API Documentation

### Authentication

**POST /api/auth**

Request:
```json
{
  "action": "login" | "register",
  "username": "string (min 3 chars)",
  "password": "string (min 6 chars)"
}
```

Response:
```json
{
  "data": {
    "userId": "uuid",
    "username": "string"
  }
}
```

Notes:
- Registration auto-creates free subscription
- Password hashed with bcrypt (10 rounds)
- JWT token returned (24h expiry)
- No email required (medical privacy)

---

### Translation

**POST /api/translate**

Request:
```json
{
  "userId": "uuid",
  "medicalText": "string",
  "model": "llama3-70b-8192" | "llama3-8b-8192" | "mixtral-8x7b-32768" | "gemma-7b-it"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "explanation": "Simple language translation",
    "subscription": {
      "remaining": 4,
      "limit": 5
    }
  }
}
```

Notes:
- Checks subscription limits before translation
- Increments usage counter
- Falls back to smaller model on error
- Returns mock translation in dev/preview environments

---

### History

**GET /api/history?userId={userId}**

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": "uuid",
      "username": "johndoe",
      "submittedText": "Medical jargon here",
      "explanation": "Simple explanation",
      "submittedAt": "2026-01-20T12:00:00Z",
      "returnedAt": "2026-01-20T12:00:05Z"
    }
  ]
}
```

---

### Stripe Checkout

**POST /api/create-checkout-session**

Request:
```json
{
  "planId": 2,
  "userId": "uuid"
}
```

Response:
```json
{
  "sessionId": "cs_test_..."
}
```

Notes:
- Creates Stripe checkout session
- No customer email (privacy)
- Supports promotion codes
- 30-second timeout configured

---

### Stripe Webhook

**POST /api/stripe-webhook**

Handles Events:
- `checkout.session.completed` - Activates subscription after payment
- `customer.subscription.created` - Creates subscription record
- `customer.subscription.updated` - Updates subscription status
- `customer.subscription.deleted` - Cancels subscription
- `invoice.payment_succeeded` - Resets usage counters for new period
- `invoice.payment_failed` - Marks subscription as past_due
- `v1.billing.meter.error_report_triggered` - Logs billing errors

Notes:
- Verifies webhook signature
- Updates `user_subscriptions` table
- Logs errors to `billing_errors` table

---

## Groq AI Integration

### Configuration

**API Key:** `GROQ_API_KEY` environment variable
**SDK:** `@ai-sdk/groq` (Vercel AI SDK)
**Primary Model:** `llama3-70b-8192` (70 billion parameters)
**Fallback Model:** `llama3-8b-8192` (8 billion parameters)

### Available Models

1. **llama3-70b-8192** (Default)
   - Most accurate
   - Best for complex medical terminology
   - Context window: 8,192 tokens

2. **llama3-8b-8192**
   - Faster, lighter
   - Used as fallback on errors
   - Context window: 8,192 tokens

3. **mixtral-8x7b-32768**
   - Alternative model
   - Larger context window: 32,768 tokens

4. **gemma-7b-it**
   - Google's Gemma model
   - Instruction-tuned

### System Prompt

```
You are an expert medical translator. Your job is to take complex medical terminology
and explain it in simple, easy-to-understand language that a 12-year-old could
comprehend. Follow these guidelines:

1. Avoid medical jargon - use everyday words
2. Use analogies and examples when helpful
3. Keep explanations concise but complete
4. Maintain medical accuracy
5. Format in clear paragraphs
6. Highlight important warnings or concerns

Input: {medicalText}
Output: Simple, clear explanation
```

### Translation Configuration

```javascript
{
  model: groq("llama3-70b-8192"),
  temperature: 0.3,  // Lower = more consistent/deterministic
  system: "Expert medical translator...",
  prompt: "Translate to simple language: {medicalText}"
}
```

### Error Handling

1. Primary translation attempt with main model
2. On error, fallback to `llama3-8b-8192`
3. On final error, return original text with error message
4. Never throws errors to user

### Environment Behavior

- **Production:** Uses actual Groq API
- **Development/Preview:** Returns mock translations (no API calls)

### Cost Considerations

- Groq pricing applies per API call
- No caching implemented
- Each translation = new API call
- Monitor usage via Groq dashboard

---

## Stripe Integration Details

### Setup Required

1. **Create Products in Stripe Dashboard:**
   - Basic Plan: $7.99/month recurring
   - Premium Plan: $14.99/month recurring
   - Professional Plan: $29.99/month recurring

2. **Copy Product IDs to Database:**
   Update `subscription_plans` table with Stripe product IDs:
   ```sql
   UPDATE subscription_plans
   SET stripe_product_id = 'prod_xxxxx'
   WHERE id = 'pro';
   ```

3. **Configure Webhook Endpoint:**
   - URL: `https://your-domain.com/api/stripe-webhook`
   - Events to listen:
     - `checkout.session.completed`
     - `customer.subscription.*`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `v1.billing.meter.error_report_triggered`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

4. **Test Webhook Locally:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   stripe trigger checkout.session.completed
   ```

### Current Issues

- Hardcoded test key in subscription page (line 117)
- No email notifications for failed payments
- No refund handling
- Missing subscription upgrade/downgrade UI
- Billing meter errors logged but not acted upon

### Payment Flow

```
User → Subscribe Button
  → /api/create-checkout-session
  → Stripe Checkout (hosted)
  → Payment Completed
  → Stripe Webhook → /api/stripe-webhook
  → Database Updated
  → User Redirected to Success Page
```

---

## Database Operations

### Initial Setup

1. Run database initialization script:
   ```bash
   npm run init-db
   ```

2. Verify tables created:
   - users
   - submissions
   - laymen_terms
   - subscription_plans
   - user_subscriptions
   - billing_errors

3. Enable Row Level Security (RLS) on all tables

4. Create views:
   - user_laymen_terms_view
   - user_activity_summary

### Common Queries

**Check User Subscription:**
```sql
SELECT
  us.status,
  us.translations_used_this_period,
  sp.translations_per_month,
  sp.name as plan_name
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = 'user-uuid';
```

**Get Translation History:**
```sql
SELECT * FROM user_laymen_terms_view
WHERE "userId" = 'user-uuid'
ORDER BY "submittedAt" DESC
LIMIT 20;
```

**Reset Usage for New Period:**
```sql
UPDATE user_subscriptions
SET translations_used_this_period = 0
WHERE stripe_customer_id = 'cus_xxxxx';
```

### Backup Strategy

- Supabase automatic daily backups
- Manual backups before schema changes
- Export user data regularly for GDPR compliance

---

## Development Roadmap

### Phase 1: Critical Fixes (Complete Before Launch)

- [ ] Fix Stripe configuration and test webhooks
- [ ] Replace Groq API key
- [ ] Remove debug button from navigation
- [ ] Delete `/api/debug-auth` endpoint
- [ ] Remove legacy SQL Server env checks in auth route
- [ ] Implement rate limiting on API endpoints
- [ ] Restrict CORS to production domain only
- [ ] Migrate auth from localStorage to HTTP-only cookies
- [ ] Add input sanitization on medical text
- [ ] Fix TypeScript errors and enable strict mode
- [ ] Add error tracking (Sentry or similar)
- [ ] Create healthcheck endpoint at `/api/health`

### Phase 2: Essential Features

- [ ] Implement password recovery (security questions or codes)
- [ ] Add subscription cancellation UI
- [ ] Fetch subscription plans from database (remove hardcoded)
- [ ] Build admin dashboard (user management, revenue analytics)
- [ ] Add email notifications for payment failures
- [ ] Implement subscription upgrade/downgrade flow
- [ ] Add refund handling
- [ ] Create error boundaries in frontend

### Phase 3: Feature Completion

- [ ] Implement PDF export for translations
- [ ] Build API access for Professional tier
- [ ] Add custom terminology feature
- [ ] Integrate medical diagrams
- [ ] Develop mobile app (React Native or PWA)
- [ ] Add priority support system
- [ ] Implement translation caching for cost optimization
- [ ] Build user feedback/rating system

### Phase 4: Scale & Optimize

- [ ] Add database indexes for performance
- [ ] Implement database migrations (Prisma or similar)
- [ ] Add CDN for static assets
- [ ] Optimize bundle size (code splitting)
- [ ] Add offline support (PWA)
- [ ] Implement analytics dashboard
- [ ] Add A/B testing framework
- [ ] Build referral/affiliate system

---

## Testing Strategy

### Manual Testing Checklist

**Authentication:**
- [ ] Register new account
- [ ] Login with existing account
- [ ] Verify free subscription created
- [ ] Test invalid credentials
- [ ] Test duplicate username registration

**Translation:**
- [ ] Translate medical text with default model
- [ ] Test all 4 AI models
- [ ] Verify usage counter decrements
- [ ] Hit translation limit (should show upgrade prompt)
- [ ] Test with very long text (>1000 words)

**Subscription:**
- [ ] View subscription plans
- [ ] Subscribe to Basic plan
- [ ] Verify Stripe checkout works
- [ ] Confirm subscription activated via webhook
- [ ] Test translation limit increased
- [ ] Attempt subscription while already subscribed

**History:**
- [ ] View translation history
- [ ] Verify pagination works
- [ ] Check date formatting
- [ ] Test with no history (empty state)

**Stripe Webhooks:**
- [ ] Test checkout.session.completed
- [ ] Test invoice.payment_succeeded
- [ ] Test invoice.payment_failed
- [ ] Test subscription cancellation
- [ ] Verify database updates correctly

### Automated Testing (Not Implemented)

Future: Add Jest + React Testing Library for component tests

---

## Deployment Guide

### Vercel Deployment

1. **Connect Repository:**
   ```bash
   vercel link
   ```

2. **Set Environment Variables:**
   Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all variables from `.env`
   - Ensure `GROQ_API_KEY` is updated
   - Ensure `STRIPE_WEBHOOK_SECRET` is production secret

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Verify Deployment:**
   - Visit production URL
   - Test authentication
   - Perform translation
   - Check Stripe webhook logs

### Database Setup (Supabase)

1. Create project in Supabase dashboard
2. Run SQL from `DATABASE_SCHEMA.md`
3. Enable RLS on all tables
4. Copy connection strings to environment variables
5. Test connection via `/api/debug-auth`

### Stripe Setup

1. Create products in Stripe dashboard
2. Configure webhook endpoint (production URL)
3. Test webhooks with Stripe CLI
4. Update `subscription_plans` table with product IDs
5. Verify checkout flow end-to-end

### Domain Configuration

1. Add custom domain in Vercel
2. Update CORS settings in `vercel.json`
3. Update Stripe redirect URLs
4. Test SSL certificate

---

## Monitoring & Maintenance

### What to Monitor

1. **Groq API Usage:**
   - Monthly API call volume
   - Cost per translation
   - Error rates by model

2. **Stripe Metrics:**
   - Monthly Recurring Revenue (MRR)
   - Churn rate
   - Failed payment rate
   - Subscription distribution by plan

3. **Application Health:**
   - API response times
   - Error rates by endpoint
   - User registration rate
   - Translation success rate

4. **Database:**
   - Query performance
   - Table sizes
   - Connection pool usage

### Log Locations

- **Application Logs:** Vercel Dashboard → Deployments → Logs
- **Stripe Webhooks:** Stripe Dashboard → Developers → Webhooks
- **Database Logs:** Supabase Dashboard → Logs
- **Billing Errors:** `billing_errors` table in database

### Maintenance Tasks

**Daily:**
- Check error logs for critical issues
- Monitor Stripe webhook failures

**Weekly:**
- Review Groq API costs
- Check for failed payments
- Monitor user growth

**Monthly:**
- Database backup verification
- Security updates (dependencies)
- Review and clean up old translations (if storage becomes issue)

---

## Known Limitations

1. **No Email System:** Cannot send password resets, notifications, or receipts
2. **Client-Side Auth:** Vulnerable to XSS attacks (needs migration to cookies)
3. **No Rate Limiting:** API endpoints can be abused
4. **No Caching:** Every translation hits Groq API (costs add up)
5. **Hardcoded Plans:** Subscription plans not fetched from database dynamically
6. **No Admin Tools:** Cannot manage users or view analytics without direct DB access
7. **English Only:** No multi-language support for UI or translations
8. **No Offline Mode:** Requires internet connection
9. **Limited Error Recovery:** Some errors crash entire app (no error boundaries)
10. **No A/B Testing:** Cannot test pricing or features experimentally

---

## Support & Documentation

### Internal Documentation
- `DATABASE_SCHEMA.md` - Complete database structure
- `LAUNCH_PREPARATION_REPORT.md` - Pre-launch checklist
- `vercel-setup.md` - Deployment instructions
- This file (`PROJECT_OVERVIEW.md`) - Complete project guide

### External Resources
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
- Groq Docs: https://console.groq.com/docs

### Getting Help
- Create issues in GitHub repository
- Check Vercel deployment logs
- Review Stripe webhook logs
- Query Supabase logs

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Initialize database
npm run init-db

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

---

## Final Notes

This project is **85% complete** and ready for launch after addressing critical fixes in Phase 1. The core functionality works well, but security and production readiness issues must be resolved first.

**Estimated Time to Launch:** 2-3 days of focused work on Phase 1 tasks.

**Revenue Potential:** With 4 subscription tiers and working Stripe integration, this can generate passive income once marketed effectively.

**Next Steps:**
1. Fix Stripe configuration (update webhook secret, test payments)
2. Replace Groq API key
3. Remove all debug code
4. Implement security fixes (rate limiting, CORS, auth migration)
5. Add error tracking
6. Soft launch to small audience
7. Monitor metrics and iterate

---

**Document Version:** 1.0
**Last Updated:** 2026-01-21
**Maintained By:** Development Team
