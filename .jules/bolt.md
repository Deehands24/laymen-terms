## 2024-05-23 - Parallelizing Serverless Functions
**Learning:** Next.js API routes often perform independent IO operations serially. Parallelizing them (e.g., DB insert + LLM call) using `Promise.all` can significantly reduce latency (100ms+), but care must be taken to handle partial failures (e.g., orphan DB records if API fails).
**Action:** Always audit API routes for independent `await` calls that can be batched.
