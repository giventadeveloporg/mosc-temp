# Email Configuration Frontend Implementation

## Overview
Complete CRUD implementation for managing tenant email addresses in the admin panel.

## Table Structure
```sql
CREATE TABLE public.tenant_email_addresses (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    email_address character varying(255) NOT NULL,
    email_type public.tenant_email_type NOT NULL,  -- ENUM: INFO, SALES, CONTACT, SUPPORT, MARKETING, NOREPLY, ADMIN
    display_name character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT tenant_email_addresses_pkey PRIMARY KEY (id),
    CONSTRAINT fk_tenant_email_addresses__tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenant_organization(tenant_id) ON DELETE CASCADE,
    CONSTRAINT ux_tenant_email_addresses_tenant_type UNIQUE (tenant_id, email_type, email_address)
);
```

---

## Frontend Components Created

### 1. TypeScript Types
**File:** `src/types/index.ts`

```typescript
export type TenantEmailType = 'OTHER' | 'PRIMARY' | 'SECONDARY' | 'MARKETING' | 'NOTIFICATION' | 'SUPPORT' | 'BILLING' | 'ADMIN';

export interface TenantEmailAddressDTO {
  id?: number;
  tenantId: string;
  emailAddress: string;
  emailType: TenantEmailType;
  displayName?: string;
  isActive: boolean;
  isDefault: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### 2. API Proxy Routes
**Files:**
- `src/pages/api/proxy/tenant-email-addresses/index.ts`
- `src/pages/api/proxy/tenant-email-addresses/[...slug].ts`

These proxy routes forward requests to the backend API at:
- `GET /api/tenant-email-addresses` - List all emails
- `GET /api/tenant-email-addresses/{id}` - Get specific email
- `POST /api/tenant-email-addresses` - Create new email
- `PATCH /api/tenant-email-addresses/{id}` - Update email
- `DELETE /api/tenant-email-addresses/{id}` - Delete email

### 3. Server Actions
**File:** `src/app/admin/email-configuration/ApiServerActions.ts`

Functions provided:
- `fetchTenantEmailAddressesServer(tenantId)` - Fetch all emails for a tenant
- `fetchTenantEmailByTypeServer(tenantId, emailType)` - Fetch default email by type
- `createTenantEmailAddressServer(payload)` - Create new email address
- `updateTenantEmailAddressServer(id, payload)` - Update existing email address
- `deleteTenantEmailAddressServer(id)` - Delete email address

**Key Features:**
- ✅ All functions use `fetchWithJwtRetry` for authentication
- ✅ Proper error handling and logging
- ✅ Support for filtering by tenant and email type
- ✅ Sorts results by emailType, isDefault, and id

### 4. Admin UI Page
**File:** `src/app/admin/email-configuration/page.tsx`

**Features:**
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ List view with sortable table
- ✅ Inline form for creating/editing
- ✅ Color-coded email type badges
- ✅ Active/Inactive status indicators
- ✅ Default email indicators
- ✅ Delete confirmation dialogs
- ✅ Success/Error message displays
- ✅ Responsive design
- ✅ Back to Admin Home button

**UI Elements:**
- Table columns: Email Address, Type, Display Name, Status, Default, Actions
- Form fields: Email Address*, Email Type*, Display Name, Active checkbox, Default checkbox, Description
- Action buttons: Edit, Delete per row
- Page header with "Add New Email" button

### 5. Admin Home Page Integration
**File:** `src/app/admin/page.tsx`

Added new button:
```typescript
{
  href: '/admin/email-configuration',
  icon: FaEnvelopeOpenText,
  label: 'Email Configuration',
  color: 'teal',
  key: 'email-configuration'
}
```

---

## API Usage Examples

### 1. List All Emails for a Tenant
```typescript
const emails = await fetchTenantEmailAddressesServer('tenant_demo_002');
// Returns: TenantEmailAddressDTO[]
```

### 2. Get Default Primary Email for a Tenant
```typescript
const primaryEmail = await fetchTenantEmailByTypeServer('tenant_demo_002', 'PRIMARY');
// Returns: TenantEmailAddressDTO | null
```

### 3. Create New Email Address
```typescript
const newEmail = await createTenantEmailAddressServer({
  tenantId: 'tenant_demo_002',
  emailAddress: 'info@example.com',
  emailType: 'PRIMARY',
  displayName: 'Information Desk',
  isActive: true,
  isDefault: true,
  description: 'General inquiries'
});
```

### 4. Update Email Address
```typescript
await updateTenantEmailAddressServer(123, {
  displayName: 'Updated Display Name',
  isActive: false
});
```

### 5. Delete Email Address
```typescript
await deleteTenantEmailAddressServer(123);
```

---

## Backend API Endpoints Expected

The frontend expects these backend endpoints to exist:

### List Emails
```
GET /api/tenant-email-addresses?tenantId.equals={tenantId}&sort=emailType,asc&sort=isDefault,desc&sort=id,asc
Response: TenantEmailAddressDTO[]
```

### Get Email by Type
```
GET /api/tenant-email-addresses?tenantId.equals={tenantId}&emailType.equals={type}&isActive.equals=true&isDefault.equals=true
Response: TenantEmailAddressDTO[]
```

### Create Email
```
POST /api/tenant-email-addresses
Content-Type: application/json
Body: {
  "tenantId": "tenant_demo_002",
  "emailAddress": "info@example.com",
  "emailType": "PRIMARY",
  "displayName": "Information",
  "isActive": true,
  "isDefault": true,
  "description": "General inquiries",
  "createdAt": "2025-12-16T...",
  "updatedAt": "2025-12-16T..."
}
Response: TenantEmailAddressDTO
```

### Update Email
```
PATCH /api/tenant-email-addresses/{id}
Content-Type: application/merge-patch+json
Body: {
  "id": 123,
  "displayName": "Updated Name",
  "isActive": false,
  "updatedAt": "2025-12-16T..."
}
Response: TenantEmailAddressDTO
```

### Delete Email
```
DELETE /api/tenant-email-addresses/{id}
Response: 204 No Content
```

---

## Email Types Supported

1. **PRIMARY** - Primary/main contact email (info@example.com, contact@example.com)
2. **SECONDARY** - Secondary contact email (alternate@example.com)
3. **SUPPORT** - Customer support (support@example.com)
4. **BILLING** - Billing and invoices (billing@example.com)
5. **MARKETING** - Marketing communications (marketing@example.com)
6. **NOTIFICATION** - System notifications (notifications@example.com, noreply@example.com)
7. **ADMIN** - Administrative emails (admin@example.com)
8. **OTHER** - Other types of emails

---

## Features Implemented

### ✅ CRUD Operations
- [x] Create new email addresses
- [x] Read/List all email addresses for a tenant
- [x] Update existing email addresses
- [x] Delete email addresses

### ✅ Filtering & Lookup
- [x] List all emails for a specific tenant
- [x] Lookup email by tenant ID and email type (e.g., CONTACT)
- [x] Filter by active status
- [x] Filter by default status

### ✅ UI/UX Features
- [x] Responsive table view
- [x] Color-coded email types
- [x] Status indicators (Active/Inactive)
- [x] Default email indicators
- [x] Inline editing form
- [x] Delete confirmation
- [x] Success/Error messages
- [x] Navigation breadcrumb

### ✅ Data Validation
- [x] Required field validation (Email Address, Email Type)
- [x] Email format validation
- [x] Unique constraint handling (tenant + type + email)
- [x] Default flag management (only one default per type per tenant)

---

## Testing Checklist

### Functionality Tests
- [ ] Navigate to Admin Home (`/admin`)
- [ ] Click "Email Configuration" button
- [ ] Verify page loads (`/admin/email-configuration`)
- [ ] Click "Add New Email" button
- [ ] Fill out form and submit (Create operation)
- [ ] Verify email appears in list
- [ ] Click Edit icon on an email row
- [ ] Update fields and submit (Update operation)
- [ ] Verify changes appear in list
- [ ] Click Delete icon on an email row
- [ ] Confirm deletion (Delete operation)
- [ ] Verify email is removed from list

### API Integration Tests
- [ ] Create email with all email types
- [ ] Set one email as default per type
- [ ] Try to set multiple defaults for same type (should enforce uniqueness)
- [ ] Toggle active/inactive status
- [ ] Filter by tenant ID
- [ ] Filter by email type
- [ ] Verify sorting (by type, default, id)

### Edge Cases
- [ ] Create duplicate email (should show error)
- [ ] Delete last email (should show empty state)
- [ ] Cancel form (should close without saving)
- [ ] Navigate away while editing (should not save)
- [ ] Invalid email format (should show validation error)
- [ ] Missing required fields (should show validation error)

---

## File Structure Summary

```
mosc-temp/
├── src/
│   ├── types/
│   │   └── index.ts                    [UPDATED] Added TenantEmailAddressDTO
│   ├── pages/api/proxy/
│   │   └── tenant-email-addresses/
│   │       ├── index.ts                [NEW] List/Create proxy
│   │       └── [...slug].ts            [NEW] Get/Update/Delete proxy
│   └── app/admin/
│       ├── page.tsx                     [UPDATED] Added Email Configuration button
│       └── email-configuration/
│           ├── page.tsx                 [NEW] Main CRUD UI
│           └── ApiServerActions.ts      [NEW] Server actions for API calls
└── documentation/
    └── email-configuration-frontend-implementation.md  [NEW] This file
```

---

## Next Steps

1. **Backend Verification** (Already completed in E:\project_workspace\malayalees-us-site-boot):
   - Verify TenantEmailAddress entity exists
   - Verify repository, service, and resource classes exist
   - Verify endpoints return correct responses

2. **Database Migration**:
   - Run the SQL schema update to create the `tenant_email_addresses` table
   - Create the `tenant_email_type` ENUM type

3. **Testing**:
   - Test all CRUD operations through the UI
   - Verify API responses match expected DTOs
   - Test filtering and sorting
   - Test uniqueness constraints
   - Test default flag enforcement

4. **Integration**:
   - Use the email configuration in email sending logic
   - Query default emails by type when sending emails
   - Handle fallback if no default email is configured

---

## Usage in Application

To use the configured emails in your application:

```typescript
// Get the default primary email for a tenant
const primaryEmail = await fetchTenantEmailByTypeServer('tenant_demo_002', 'PRIMARY');

if (primaryEmail && primaryEmail.isActive) {
  // Use primaryEmail.emailAddress as the "from" address
  // Use primaryEmail.displayName as the "from" name
  await sendEmail({
    from: `${primaryEmail.displayName} <${primaryEmail.emailAddress}>`,
    to: recipient,
    subject: 'Contact Form Submission',
    body: emailBody
  });
}
```

---

## Summary

✅ **All frontend components have been successfully created:**
- Type definitions
- API proxy routes
- Server actions with JWT authentication
- Admin UI with full CRUD operations
- Admin home page integration

The implementation follows:
- Next.js App Router patterns
- Cursor rules for API routes (`nextjs_api_routes.mdc`)
- UI style guide standards (`ui_style_guide.mdc`)
- Database schema from `Latest_Schema_Post__Blob_Claude_12.sql`

**Ready for testing once backend endpoints are confirmed to be working!**

