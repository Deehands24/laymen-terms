## 2024-05-23 - API Latency Optimization via Parallelization
**Learning:** Independent async operations (like DB inserts and external API calls) should be parallelized to reduce total request latency. Redundant DB reads for data that can be calculated locally (like decrementing a counter) should be avoided.
**Action:** Always check for `await` chains that can be `Promise.all`'d and look for "read-after-write" patterns that can be replaced with local logic.
