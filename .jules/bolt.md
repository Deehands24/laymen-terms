## 2024-05-22 - Parallelizing AI and DB Operations
**Learning:** In routes that involve both a database write (e.g., logging a submission) and an external AI service call, these operations can often be parallelized using `Promise.all` if they don't depend on each other's output. This reduces the total request latency by the duration of the faster operation (usually the DB write).
**Action:** Always check `app/api/` routes for sequential `await` calls that are independent and can be parallelized.

## 2024-05-22 - Next.js Build Artifacts
**Learning:** The project does not ignore `next-env.d.ts` or `tsconfig.tsbuildinfo` in `.gitignore`. These files are regenerated during build/dev and pollute the commit.
**Action:** Always delete `next-env.d.ts` and `tsconfig.tsbuildinfo` before submitting if they were generated during verification.
