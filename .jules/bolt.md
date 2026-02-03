## 2024-05-23 - Data Access Optimization Patterns
**Learning:** When optimizing Supabase queries by replacing `select('*')` with specific columns, ensure you define a subset type (using `Pick`) and export it. This keeps the component layer type-safe and synchronized with the data access layer.
**Action:** Always create a specific type for optimized query results and update consuming components to use it.
