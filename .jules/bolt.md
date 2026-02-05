## 2024-05-22 - [Parallelize Translation API]
**Learning:** The translation API executed DB writes and AI calls sequentially. By parallelizing them, we significantly reduced latency (estimated 30-50% reduction depending on AI response time).
**Action:** Always check for independent `await` calls in serverless functions and use `Promise.all`.
