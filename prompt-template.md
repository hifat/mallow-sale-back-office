# New Feature Implementation Prompt

Use this prompt when you want to add a new feature to the Mallow-Sale-Backoffice project:

---

## Prompt Template

I want to implement a new **[FEATURE_NAME]** feature in the Mallow-Sale-Backoffice project.

### API Specification
**API Base URL**: `[YOUR_API_BASE_URL]`

**Endpoints**:
```
GET    /api/[feature-name]              - List all [feature items]
GET    /api/[feature-name]/:id          - Get single [feature item]
POST   /api/[feature-name]              - Create new [feature item]
PUT    /api/[feature-name]/:id          - Update [feature item]
DELETE /api/[feature-name]/:id          - Delete [feature item]
```

**Request/Response Structure**:
```json
{
  "field1": "string",
  "field2": "number",
  "field3": "boolean"
}
```

### Feature Requirements

**Core Functionality**:
- [ ] List view with [search/filter/pagination]
- [ ] Create new [feature item]
- [ ] Edit existing [feature item]
- [ ] Delete [feature item]
- [ ] [Any other specific requirements]

**Form Fields**:
1. Field Name (type: text/number/select/etc., required/optional)
2. Field Name (type, validation rules)
3. ...

**Business Logic**:
- [Any specific validation rules]
- [Any calculated fields]
- [Any relationships to other features]

**UI/UX Requirements**:
- [Any specific styling needs]
- [Any custom components needed]
- [Any specific user feedback requirements]

### Implementation Requirements

Please implement this feature following the project's Cursor Rules:

1. **API Integration**: Create `/lib/[feature-name]-api.ts` with all CRUD operations
2. **Types**: Define all types in `/types/[feature-name].ts`
3. **Validation**: Create Zod schema for form validation
4. **Components**: 
   - List view component in `/components/[feature-name]-list.tsx`
   - Form component in `/components/[feature-name]-form.tsx`
5. **UI Consistency**: Use established patterns (border-yellow-200, FormActionRow, etc.)
6. **Error Handling**: Implement proper error/success feedback via toast
7. **Loading States**: Add loading indicators for all async operations

---

## Example: Staff Management Feature

I want to implement a new **Staff Management** feature in the Mallow-Sale-Backoffice project.

### API Specification
**API Base URL**: `https://api.example.com`

**Endpoints**:
```
GET    /api/staff              - List all staff members
GET    /api/staff/:id          - Get single staff member
POST   /api/staff              - Create new staff member
PUT    /api/staff/:id          - Update staff member
DELETE /api/staff/:id          - Delete staff member
```

**Request/Response Structure**:
```json
{
  "id": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "role": "admin | manager | staff",
  "department": "string",
  "status": "active | inactive",
  "hireDate": "ISO8601 date string"
}
```

### Feature Requirements

**Core Functionality**:
- [x] List view with search by name/email and filter by role/status
- [x] Create new staff member
- [x] Edit existing staff member
- [x] Delete staff member with confirmation
- [x] Show active/inactive badge in list view

**Form Fields**:
1. First Name (text, required, min 2 characters)
2. Last Name (text, required, min 2 characters)
3. Email (email, required, valid email format)
4. Role (select: admin/manager/staff, required)
5. Department (text, required)
6. Status (select: active/inactive, required, default: active)
7. Hire Date (date, required)

**Business Logic**:
- Email must be unique across all staff members
- Cannot delete staff with active assignments (show error message)
- Role changes require confirmation dialog

**UI/UX Requirements**:
- Display staff cards with avatar placeholder
- Show role badge with different colors (admin: blue, manager: green, staff: gray)
- Show status badge (active: green, inactive: red)
- Add confirmation dialog for delete and role changes

### Implementation Requirements

Please implement this feature following the project's Cursor Rules:

1. **API Integration**: Create `/lib/staff-api.ts` with all CRUD operations
2. **Types**: Define all types in `/types/staff.ts`
3. **Validation**: Create Zod schema for form validation
4. **Components**: 
   - List view component in `/components/staff-list.tsx`
   - Form component in `/components/staff-form.tsx`
5. **UI Consistency**: Use established patterns (border-yellow-200, FormActionRow, etc.)
6. **Error Handling**: Implement proper error/success feedback via toast
7. **Loading States**: Add loading indicators for all async operations

---

## Quick Checklist Version (Minimal Prompt)

I want to add a **[FEATURE_NAME]** feature.

**API Endpoints**: [Provide Swagger/OpenAPI link or list endpoints]

**Requirements**:
- CRUD operations: [List/Create/Update/Delete]
- Form fields: [List with types and validation]
- Special logic: [Any business rules]

Please implement following the Cursor Rules with:
- API wrapper in `/lib/`
- Types in `/types/`
- Zod validation
- Consistent UI patterns