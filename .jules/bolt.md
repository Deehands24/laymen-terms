## 2024-03-24 - N+1 Bottleneck in History Fetch
**Learning:** The `getUserTranslations` function in `lib/data-access.ts` fetches all user history in a single query without pagination. This is causing performance degradation as user history grows.
**Action:** In future updates, implement pagination (limit/offset) in both the API and frontend to handle large datasets efficiently.
