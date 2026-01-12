# Bolt's Journal

## 2025-05-23 - Parallelizing Independent DB Operations

**Learning:** In the translation API flow, we were performing sequential DB operations that were independent of each other (saving the result and incrementing the usage counter). This added unnecessary latency to the user's request. Additionally, we were re-fetching the subscription limit at the end of the request, which is redundant since we already have the initial state and know the operation we just performed.

**Action:**
1. Identify independent async operations and use `Promise.all` to execute them in parallel.
2. Maintain local state of data to avoid redundant re-fetching at the end of a transaction, provided the logic is deterministic (e.g., decrementing a counter).
