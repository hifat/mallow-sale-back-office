---
trigger: always_on
---

# Windsurf Rules for Mallow-Sale-Backoffice

## Project Structure & Organization

1. **Imports**: Use absolute imports (e.g., `@/lib/feature-api`) for all top-level modules, not relative paths.

2. **File Organization**:
   - API integration code → `/lib/*-api.ts`
   - Type definitions → `/types`
   - Reusable UI components → `/components/ui`
   - Feature-specific components → `/components/feature-name`

3. **Type Management**: Define all shared types/interfaces in `/types`. Never re-declare types in multiple locations. Import and reuse centralized types.

## API Integration

4. **API Wrappers**: All network calls must go through `/lib/*-api.ts` wrappers. Never fetch data directly inside UI components or hooks.

5. **API Configuration**: Keep `API_BASE` in environment variables. Never hardcode URLs in components.

6. **Error Handling**: Handle all async operations with proper error/success feedback via toast or dialog. Never swallow errors silently.

## Form Handling & Validation

7. **Validation Framework**: Use `zod` schemas for all form and API payload validations. Co-locate schemas with forms or feature APIs.

8. **Schema Pattern**:
```ts
import { z } from "zod"

export const featureSchema = z.object({
  field: z.string().min(1, "Field is required"),
})
export type FeatureInput = z.infer<typeof featureSchema>
```

9. **Client-Side Validation**: Provide immediate validation feedback with user-friendly error messages. Validate before API calls.

10. **Form State**: Control forms with `useState` and reflect validation states visually in UI.

## UI/UX Consistency

11. **Input Styling**:
    - Default: `border-yellow-200`
    - Focus: `focus:border-yellow-500`
    - Error: `border-red-500`

12. **Error Display**: Show errors as `text-sm text-red-600` directly beneath the related input field.

13. **Shared Components**: Use provided UI components for common patterns:
    - Notifications → toast component
    - Confirmations → dialog component
    - Actions → `FormActionRow`, `ModalCard`, `DeleteConfirmDialog`

14. **Loading States**: Show clear loading/disabled states during async operations.

## Code Quality & Style

15. **Naming Conventions**: Use explicit, domain-meaningful names for variables, props, and types (e.g., `purchaseQuantity`, `costPercentage`, not `qty`, `pct`).

16. **Type Safety**: 
    - Avoid `any` types; use precise types
    - Use discriminated unions for variant states
    - Infer types from Zod schemas to prevent drift

17. **Code Clarity**:
    - Prefer guard clauses over deep nesting
    - Multi-line clarity over compact one-liners
    - No 1-2 character variable names

18. **Avoid Magic Values**: Extract constants, enums, or lookup tables. Never duplicate arrays of options across files.

## Performance Optimization

19. **Search & Filtering**: Debounce user input for live lookups and dynamic searches.

20. **List Rendering**: Limit dropdown options and paginate server queries when applicable.

## Internationalization

21. **Translation Files**: All user-facing text must be externalized to `/locales/[lang].json` files (e.g., `/locales/en.json`, `/locales/th.json`).

22. **Translation Keys**:
    - Use the `t('[word_name]')` function to access translations
    - Before adding new keys, check if the word/phrase already exists in the locale file
    - Never duplicate translation keys

23. **Key Organization**: Organize translation keys by feature or category using dot notation:
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "staff": {
    "title": "Staff Management",
    "addNew": "Add New Staff",
    "firstName": "First Name"
  },
  "validation": {
    "required": "This field is required",
    "invalidEmail": "Invalid email format"
  }
}
```

24. **Translation Usage Pattern**:
```tsx
// Use the translation hook/context
const { t } = useTranslation()

// Access translations
<button>{t('common.save')}</button>
<h1>{t('staff.title')}</h1>
<span>{t('validation.required')}</span>
```

25. **Naming Conventions for Keys**:
    - Use camelCase for translation keys
    - Group by feature/module (e.g., `inventory.`, `recipe.`, `staff.`)
    - Use `common.` prefix for shared UI elements
    - Use `validation.` prefix for validation messages
    - Use `error.` prefix for error messages

26. **Language**: Write all new code, comments, and documentation in English for cross-team contribution.

## Development Workflow

23. **Linting & Formatting**: Always adhere to lint and formatting tools configured for the project.

24. **Documentation**: Document new architectural patterns or significant changes in `README.md` or relevant documentation files.

25. **Data Fetching**: Pages must use data-fetching through the respective API wrapper in `/lib`.

## Navigation

26. **Sidebar Entries**: When adding a feature page, add a nav item in `components/app-sidebar.tsx` with matching i18n keys (`navigation.*`) and an appropriate icon.

## Package Management

27. **Package Management**: Use `pnpm` for package management. Never use `npm` or `yarn`.

## Anti-Patterns (Do NOT Do)

- ❌ Ad-hoc validation logic without Zod
- ❌ Duplicating types/interfaces inside components or APIs
- ❌ Direct `fetch` inside components
- ❌ Using `any` or unsafe type casts
- ❌ Hardcoding API URLs or magic strings
- ❌ Inconsistent input styles or error messaging
- ❌ Swallowing errors without user feedback
- ❌ Overfetching on every keystroke without debounce
- ❌ Copying and pasting code instead of creating reusable components
- ❌ Hardcoding user-facing text instead of using translation keys
- ❌ Duplicating translation keys across locale files
- ❌ Using raw strings in UI components instead of `t()` function

## Feature Development Checklist

When implementing a new feature, ensure:

- [ ] API wrapper created in `/lib/feature-api.ts`
- [ ] Types defined in `/types/feature.ts`
- [ ] Zod schema created for form validation
- [ ] Form uses centralized UI components
- [ ] Error handling and user feedback implemented
- [ ] Loading states handled appropriately
- [ ] Search/filters debounced if applicable
- [ ] All user-facing text added to `/locales/[lang].json`
- [ ] Translation keys organized by feature/category
- [ ] No hardcoded text in UI components
- [ ] Documentation updated