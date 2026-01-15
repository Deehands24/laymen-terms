## 2024-05-23 - Backend Parallelization Safety
**Learning:** Parallelizing database operations to improve performance must be done with caution regarding error handling and business logic. Specifically, parallelizing "save result" and "charge user" operations can lead to a state where a user is charged even if the result saving fails (race condition where charging succeeds but saving fails).
**Action:** Always verify dependencies and error handling flows when using `Promise.all`. Keep billing/usage increment logic sequential to service delivery unless transactional integrity is guaranteed.
