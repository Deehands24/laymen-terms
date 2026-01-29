## 2024-05-23 - Memory vs Reality: Stripe Script
**Learning:** Project memory stated the Stripe script was already lazy-loaded in `app/subscription/page.tsx`, but `grep` revealed it was blocking in `app/layout.tsx`.
**Action:** Always verify historical context/memory against the actual codebase using search tools (`grep`, `find`) before assuming the state of the code. Trust code over comments/memory.
