## 2024-05-22 - Parallel Execution Pattern
**Learning:** Independent async operations (e.g., DB writes and AI service calls) in API routes often run sequentially by default, adding unnecessary latency.
**Action:** Always inspect sequential `await` calls in hot paths. If they are independent, use `Promise.all` to execute them concurrently.
