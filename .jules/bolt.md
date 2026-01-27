## 2024-05-23 - API Latency Optimization
**Learning:** Sequential await calls in API routes are a common source of unnecessary latency. In `app/api/translate/route.ts`, the DB write (`submitMedicalText`) and external AI service call (`translateMedicalText`) were sequential.
**Action:** Identify independent async operations and use `Promise.all` to run them in parallel. This directly reduces user wait time by overlapping the I/O bound operations.
