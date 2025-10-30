I want to implement a new **shopping** feature in the Mallow-Sale-Backoffice project.

### API Specification
**API Base URL**: `shopping`

**Endpoints**:

All endpoints have default error is:  
HTTP status 500
```
{
    code: "INTERNAL_SERVER_ERROR"
    message: "internal server error"
}
```

- List all shoppings
GET /shoppings  
Response:
```
{
  "items": [
    {
      "id": "string",
      "isComplete": true,
      "name": "string",
      "purchaseQuantity": 0,
      "purchaseUnit": {
        "code": "string",
        "name": "string"
      }
    }
  ],
  "meta": {
    "total": 0
  }
}
```

- Create new shopping
POST /shoppings  
Body:
```
{
  "isComplete": true,
  "name": "string",
  "purchaseQuantity": 0,
  "purchaseUnit": {
    "code": "string"
  }
}
```

error code:

HTTP status 400
```
{
    code: "INVALID_USAGE_UNIT"
    message: "invalid usage unit"
}
```


- Update shopping
PATCH  /shoppings/:id/is-complete  
Body:
```
{
  "isComplete": true
}
```

error code:

HTTP status 404
```
{
    code: "RECORD_NOT_FOUND"
    message: "record not found"
}
```

- Delete shopping
DELETE /shoppings/:id

error code:

HTTP status 404
```
{
    code: "RECORD_NOT_FOUND"
    message: "record not found"
}
```

### Feature Requirements

**Core Functionality**:
- [ ] List view 
- [ ] Create new shopping
- [ ] Update is complete shopping
- [ ] Delete shopping

**Business Logic**:
- All inventory items have a shopping button icon
- When I click shopping button create shopping and "name" is "inventoryName"
- There is shopping feature in inventory feature page

**UI/UX Requirements**:
- Inspire by todo list app

### Implementation Requirements

Please implement this feature following the project's Cursor Rules:

1. **API Integration**: Create `/lib/shopping-api.ts` with all CRUD operations
2. **Types**: Define all types in `/types/shopping.ts`
3. **Validation**: Create Zod schema for form validation
4. **Components**: 
   - List view component in `/components/shopping-list.tsx`
   - Form component in `/components/shopping-form.tsx`
5. **UI Consistency**: Use established patterns (border-yellow-200, FormActionRow, etc.)
6. **Error Handling**: Implement proper error/success feedback via toast
7. **Loading States**: Add loading indicators for all async operations