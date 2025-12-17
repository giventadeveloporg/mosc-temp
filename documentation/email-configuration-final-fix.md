# Email Configuration - Final Fix (Database Schema Match)

## Database Schema (Source of Truth)

```sql
CREATE TYPE public.tenant_email_type AS ENUM (
    'INFO',
    'SALES',
    'TICKETS',
    'CONTACT',
    'SUPPORT',
    'MARKETING',
    'NOREPLY',
    'ADMIN'
);
```

## Frontend Updated to Match

### TypeScript Type Definition
```typescript
export type TenantEmailType = 'INFO' | 'SALES' | 'TICKETS' | 'CONTACT' | 'SUPPORT' | 'MARKETING' | 'NOREPLY' | 'ADMIN';
```

### Dropdown Options (UI)
```typescript
const EMAIL_TYPES: TenantEmailType[] = [
  'INFO',      // Information/General inquiries
  'SALES',     // Sales inquiries
  'TICKETS',   // Event tickets/ticketing
  'CONTACT',   // Contact form/General contact
  'SUPPORT',   // Customer support
  'MARKETING', // Marketing/Promotions
  'NOREPLY',   // No-reply automated emails
  'ADMIN'      // Administrative emails
];
```

### Color Badge Mapping
```typescript
const colorMap: Record<TenantEmailType, string> = {
  INFO:      'bg-blue-100 text-blue-800',      // Blue
  SALES:     'bg-green-100 text-green-800',    // Green
  TICKETS:   'bg-indigo-100 text-indigo-800',  // Indigo
  CONTACT:   'bg-purple-100 text-purple-800',  // Purple
  SUPPORT:   'bg-orange-100 text-orange-800',  // Orange
  MARKETING: 'bg-pink-100 text-pink-800',      // Pink
  NOREPLY:   'bg-gray-100 text-gray-800',      // Gray
  ADMIN:     'bg-red-100 text-red-800',        // Red
};
```

## Email Type Usage Guide

| Type | Purpose | Example Email | Use Case |
|------|---------|---------------|----------|
| **INFO** | General information | info@example.com | General inquiries, information requests |
| **SALES** | Sales inquiries | sales@example.com | Sales team, product inquiries |
| **TICKETS** | Event ticketing | tickets@example.com | Ticket confirmations, ticket-related emails |
| **CONTACT** | Contact form | contact@example.com | Contact form submissions |
| **SUPPORT** | Customer support | support@example.com | Customer service, help desk |
| **MARKETING** | Marketing | marketing@example.com | Newsletters, promotions |
| **NOREPLY** | System notifications | noreply@example.com | Automated system emails |
| **ADMIN** | Administrative | admin@example.com | Internal admin communications |

## Important Note: Backend Enum Mismatch

⚠️ **There appears to be a mismatch between the database schema and the backend Java enum.**

**Database has:**
```
INFO, SALES, TICKETS, CONTACT, SUPPORT, MARKETING, NOREPLY, ADMIN
```

**Backend error showed:**
```
OTHER, PRIMARY, SECONDARY, MARKETING, NOTIFICATION, SUPPORT, BILLING, ADMIN
```

### Action Required:

The backend Java enum file needs to be updated to match the database schema:

**File:** `E:\project_workspace\malayalees-us-site-boot\src\main\java\com\nextjstemplate\domain\enumeration\TenantEmailType.java`

**Should contain:**
```java
package com.nextjstemplate.domain.enumeration;

/**
 * The TenantEmailType enumeration.
 */
public enum TenantEmailType {
    INFO,
    SALES,
    TICKETS,
    CONTACT,
    SUPPORT,
    MARKETING,
    NOREPLY,
    ADMIN,
}
```

## Testing Checklist

### 1. Frontend Validation ✅
- [x] TypeScript enum matches database
- [x] Dropdown shows all 8 types
- [x] Default value is 'INFO'
- [x] Color badges work for all types

### 2. Backend Validation (Required)
- [ ] Update Java enum to match database
- [ ] Rebuild backend application
- [ ] Restart backend server
- [ ] Test API endpoint

### 3. Integration Testing
After backend is fixed:
- [ ] Create email with type 'INFO'
- [ ] Create email with type 'SALES'
- [ ] Create email with type 'TICKETS'
- [ ] Create email with type 'CONTACT'
- [ ] Create email with type 'SUPPORT'
- [ ] Create email with type 'MARKETING'
- [ ] Create email with type 'NOREPLY'
- [ ] Create email with type 'ADMIN'
- [ ] Verify all types save correctly
- [ ] Verify lookup by type works
- [ ] Verify list displays all types correctly

## Example API Calls

### Create Email (TICKETS type)
```json
POST /api/tenant-email-addresses
{
  "tenantId": "tenant_demo_002",
  "emailAddress": "tickets@example.com",
  "emailType": "TICKETS",
  "displayName": "Event Tickets",
  "isActive": true,
  "isDefault": true,
  "description": "For event ticket-related communications",
  "createdAt": "2025-12-16T22:10:00Z",
  "updatedAt": "2025-12-16T22:10:00Z"
}
```

### Get Default Contact Email
```typescript
const contactEmail = await fetchTenantEmailByTypeServer('tenant_demo_002', 'CONTACT');

if (contactEmail && contactEmail.isActive) {
  console.log(`Contact Email: ${contactEmail.emailAddress}`);
  // Use: contact@example.com
}
```

### Get Tickets Email for Event Confirmations
```typescript
const ticketsEmail = await fetchTenantEmailByTypeServer('tenant_demo_002', 'TICKETS');

if (ticketsEmail && ticketsEmail.isActive) {
  await sendTicketEmail({
    from: `${ticketsEmail.displayName} <${ticketsEmail.emailAddress}>`,
    to: customer.email,
    subject: 'Your Event Tickets',
    body: ticketEmailBody
  });
}
```

## Files Updated (Frontend)

1. ✅ `src/types/index.ts` - TypeScript type definition
2. ✅ `src/app/admin/email-configuration/page.tsx` - UI component
3. ✅ `documentation/email-configuration-final-fix.md` - This document

## Files to Update (Backend)

1. ⚠️ `src/main/java/com/nextjstemplate/domain/enumeration/TenantEmailType.java` - Java enum (must match database)

## Summary

✅ **Frontend is now correctly configured to match the database schema.**

⚠️ **Backend Java enum must be updated to match the database schema to avoid deserialization errors.**

Once the backend is updated and restarted, the application will work correctly!

---

## Quick Reference

**All 8 Email Types (in order):**
1. INFO
2. SALES
3. TICKETS *(Note: This is specific to your event management system)*
4. CONTACT
5. SUPPORT
6. MARKETING
7. NOREPLY
8. ADMIN


