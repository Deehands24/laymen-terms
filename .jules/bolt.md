## 2026-01-19 - Intl.DateTimeFormat Invalid Date Handling
**Learning:** `Intl.DateTimeFormat.format()` throws a `RangeError` on invalid dates, whereas `Date.prototype.toLocaleDateString()` returns "Invalid Date" gracefully. Swapping them for performance requires adding manual validity checks (e.g., `isNaN(date.getTime())`).
**Action:** Always wrap `Intl.DateTimeFormat` usage with an invalid date check when optimizing legacy date formatting code.
