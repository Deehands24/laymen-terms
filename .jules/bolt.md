## 2024-05-23 - Lazy Loading Stripe
**Learning:** Heavy third-party scripts (like Stripe) in `layout.tsx` block initial load for all pages.
**Action:** Move them to the specific page component (e.g., `SubscriptionPage`) using `next/script` to load only when needed.
