## 2024-05-23 - [Select Projection Optimization]
**Learning:** Selecting only necessary fields from Supabase (instead of `select('*')`) and defining a strict subset interface (`TranslationHistoryItem`) significantly reduces payload size for list views, especially when large text fields (like `submittedText` or `explanation`) are present but truncated or unused in the view.
**Action:** Always verify if `select('*')` is fetching unused data, especially for table or list components. Define explicit interfaces for component props that match the required data subset.
