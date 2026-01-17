## 2024-05-23 - Shared IntersectionObserver for FadeInSection
**Learning:** The codebase previously instantiated a new `IntersectionObserver` for every `FadeInSection` component. This created unnecessary memory overhead and main-thread processing, as each observer operates independently.
**Action:** Implemented a singleton `IntersectionObserver` pattern. A single observer is shared across all instances, using a `WeakMap` to route intersection events to the correct component callback. This scales $O(1)$ instead of $O(N)$ for observer instances.
