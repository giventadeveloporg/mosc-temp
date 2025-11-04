# Event Sponsors Management - Product Requirements Document (PRD)

## Document Information
- **Version**: 1.0
- **Date**: 2025-01-03
- **Status**: Implementation Ready
- **Project Phase**: Mid-Development (Infrastructure Complete)

---

## 1. Executive Summary

### 1.1 Purpose
This document outlines the requirements for implementing comprehensive CRUD (Create, Read, Update, Delete) operations for event sponsors management, including image upload functionality for sponsor logos, hero images, and banners. The system supports multi-tenant domain-agnostic authentication using Clerk satellite domain features.

### 1.2 Scope
- Full CRUD operations for event sponsors
- Image upload functionality for sponsor media (logo, hero, banner)
- Event-sponsor association management (many-to-many relationship)
- Multi-tenant support with tenant isolation
- Admin interface following established UI/UX patterns

### 1.3 Out of Scope
- Infrastructure setup (database, authentication, API framework)
- Basic development toolset configuration
- Database schema design (already exists)
- JSON schema definition (already exists in Swagger docs)
- Backend API implementation (backend project exists separately)

---

## 2. Current State Assessment

### 2.1 What's Already Implemented

#### ✅ Backend Infrastructure
- **Database Schema**: `event_sponsors` and `event_sponsors_join` tables exist in `Latest_Schema_Post__Blob_Claude_11.sql`
- **Backend API**: REST endpoints available (backend project at `E:\project_workspace\malayalees-us-site-boot`)
- **API Documentation**: Swagger/OpenAPI schema available at `documentation/Swagger_API_Docs/api-docs.json`
- **Proxy Routes**: API proxy handlers exist at:
  - `src/pages/api/proxy/event-sponsors/index.ts`
  - `src/pages/api/proxy/event-sponsors/[...slug].ts`

#### ✅ Frontend Components
- **Admin Page**: `/admin/event-sponsors` page exists with basic CRUD operations
- **Event-Specific Sponsors Page**: `/admin/events/[id]/sponsors` exists with full functionality
- **API Server Actions**: `src/app/admin/event-sponsors/ApiServerActions.ts` with CRUD functions
- **DTO Types**: `EventSponsorsDTO` and `EventSponsorsJoinDTO` defined in `src/types/index.ts`
- **ImageUpload Component**: `src/components/ui/ImageUpload.tsx` exists and supports sponsor entity type

#### ✅ Database Schema Details
```sql
-- event_sponsors table
CREATE TABLE public.event_sponsors (
    id bigint PRIMARY KEY,
    tenant_id varchar(255),
    event_id int8 NULL,  -- Optional direct event association
    name varchar(255) NOT NULL,
    type varchar(100) NOT NULL,
    company_name varchar(255),
    tagline varchar(500),
    description text,
    website_url varchar(1024),
    contact_email varchar(255),
    contact_phone varchar(50),
    logo_url varchar(1024),
    hero_image_url varchar(1024),
    banner_image_url varchar(1024),
    is_active boolean DEFAULT true NOT NULL,
    priority_ranking int4 DEFAULT 0 NOT NULL,
    facebook_url varchar(1024),
    twitter_url varchar(1024),
    linkedin_url varchar(1024),
    instagram_url varchar(1024),
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
);

-- event_sponsors_join table (many-to-many relationship)
CREATE TABLE public.event_sponsors_join (
    id bigint PRIMARY KEY,
    tenant_id varchar(255),
    event_id bigint NOT NULL,
    sponsor_id bigint NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    UNIQUE (event_id, sponsor_id)
);
```

### 2.2 What's Missing or Needs Enhancement

#### ❌ Main Sponsors Page Image Upload
- **Current**: `/admin/event-sponsors` page uses URL input fields for images
- **Required**: Replace URL inputs with `ImageUpload` component for logo, hero, and banner images
- **Impact**: Users must manually upload images elsewhere and paste URLs, reducing usability

#### ❌ DTO Field Mismatch
- **Issue**: Database schema includes `event_id` in `event_sponsors` table, but DTO doesn't include it
- **Required**: Verify if `event_id` should be optional in DTO or if it's legacy field
- **Note**: Many-to-many relationship via `event_sponsors_join` is the primary association method

#### ❌ Form Field Alignment
- **Current**: Form uses different field names (`sponsorName`, `contactPerson`, `sponsorshipLevel`, `sponsorshipAmount`, `benefits`, `displayOrder`)
- **Required**: Align form fields with DTO schema (`name`, `type`, `companyName`, `tagline`, `priorityRanking`)
- **Impact**: Form data may not map correctly to backend DTO

#### ❌ UI/UX Consistency
- **Current**: Main sponsors page doesn't follow established UI patterns
- **Required**: Apply UI style guide standards from `@ui_style_guide.mdc`
- **Required**: Match styling and layout patterns from event-specific sponsors page

---

## 3. Requirements

### 3.1 Functional Requirements

#### FR-1: Sponsor CRUD Operations
**Priority**: High

**Description**: Complete CRUD operations for event sponsors with all required fields.

**Acceptance Criteria**:
- [ ] Create new sponsor with all required fields (`name`, `type`)
- [ ] Read/list all sponsors with pagination and search
- [ ] Update existing sponsor (partial updates via PATCH)
- [ ] Delete sponsor (soft delete via `isActive` flag or hard delete)
- [ ] View sponsor details in modal or detail page
- [ ] All operations respect tenant isolation

**Fields Required**:
- **Required**: `name` (string, max 255), `type` (string, max 100)
- **Optional**: `companyName`, `tagline`, `description`, `websiteUrl`, `contactEmail`, `contactPhone`, `logoUrl`, `heroImageUrl`, `bannerImageUrl`, `facebookUrl`, `twitterUrl`, `linkedinUrl`, `instagramUrl`
- **System**: `isActive` (boolean, default true), `priorityRanking` (integer, default 0), `tenantId`, `createdAt`, `updatedAt`

#### FR-2: Image Upload Functionality
**Priority**: High

**Description**: Upload sponsor images (logo, hero, banner) directly from the admin interface.

**Acceptance Criteria**:
- [ ] Upload logo image using `ImageUpload` component
- [ ] Upload hero image using `ImageUpload` component
- [ ] Upload banner image using `ImageUpload` component
- [ ] Display image preview after upload
- [ ] Support image replacement (delete old, upload new)
- [ ] Images uploaded to AWS S3 via backend API
- [ ] Image URLs automatically populated in sponsor record
- [ ] Validation: Only image file types (jpg, png, gif, webp)

**Image Types**:
- **Logo**: Square format, recommended 512x512px
- **Hero Image**: Landscape format, recommended 1920x1080px
- **Banner Image**: Wide format, recommended 1600x400px

**Technical Implementation**:
- Use existing `ImageUpload` component: `src/components/ui/ImageUpload.tsx`
- API endpoint: `/api/proxy/event-medias/upload/sponsor?eventId={eventId}&entityId={sponsorId}&imageType={logo|hero|banner}`
- Entity type: `sponsor`
- Image types: `logo`, `hero`, `banner`

#### FR-3: Event-Sponsor Association
**Priority**: High

**Description**: Associate sponsors with events using many-to-many relationship.

**Acceptance Criteria**:
- [ ] Assign existing sponsor to event via `event_sponsors_join` table
- [ ] Remove sponsor from event
- [ ] View all sponsors for a specific event
- [ ] View all events for a specific sponsor
- [ ] Prevent duplicate associations (enforced by UNIQUE constraint)
- [ ] Cascade delete when event or sponsor is deleted

**Implementation**:
- Use `event_sponsors_join` API endpoints
- Endpoints: `GET /api/event-sponsors-join`, `POST /api/event-sponsors-join`, `DELETE /api/event-sponsors-join/{id}`
- Filter by `eventId.equals` for event-specific queries

#### FR-4: Search and Filter
**Priority**: Medium

**Description**: Search and filter sponsors by various criteria.

**Acceptance Criteria**:
- [ ] Search by sponsor name
- [ ] Filter by sponsor type
- [ ] Filter by active/inactive status
- [ ] Sort by priority ranking
- [ ] Sort by name (alphabetical)
- [ ] Pagination support (page, size)

**Backend API Support**:
- Spring Data REST criteria queries
- Example: `?name.contains=sponsor&isActive.equals=true&sort=priorityRanking,desc`

#### FR-5: Multi-Tenant Support
**Priority**: High

**Description**: All operations must respect tenant isolation.

**Acceptance Criteria**:
- [ ] All API calls include `tenantId` in request body
- [ ] Backend automatically filters by tenant
- [ ] Tenant ID sourced from `NEXT_PUBLIC_TENANT_ID` environment variable
- [ ] Use `withTenantId` utility for payload injection
- [ ] Tenant isolation enforced at database level

**Implementation**:
- Use `withTenantId` from `@/lib/withTenantId`
- Apply to all POST/PATCH/PUT requests
- Tenant ID automatically injected by proxy handlers

### 3.2 Non-Functional Requirements

#### NFR-1: Authentication & Authorization
**Priority**: High

**Description**: All operations require Clerk authentication.

**Acceptance Criteria**:
- [ ] Admin pages protected by Clerk middleware
- [ ] Only authenticated users can access sponsor management
- [ ] Multi-domain support via Clerk satellite domain features
- [ ] Session management handled by Clerk

**Implementation**:
- Use `useAuth()` hook from `@clerk/nextjs`
- Middleware configuration in `src/middleware.ts`
- Satellite domain support configured

#### NFR-2: UI/UX Consistency
**Priority**: High

**Description**: Follow established UI style guide and patterns.

**Acceptance Criteria**:
- [ ] Use sacred design system colors and typography
- [ ] Match admin page styling patterns
- [ ] Consistent form layouts and spacing
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Loading states and error handling
- [ ] Toast notifications for success/error messages

**Style Guide Reference**:
- Follow `@ui_style_guide.mdc` for color palette, typography, spacing
- Use established component patterns from other admin pages
- Match event-specific sponsors page styling

#### NFR-3: Performance
**Priority**: Medium

**Description**: Efficient data loading and image handling.

**Acceptance Criteria**:
- [ ] Pagination for large sponsor lists
- [ ] Lazy loading for images
- [ ] Optimized image uploads (compression if needed)
- [ ] Efficient API calls (no unnecessary requests)

#### NFR-4: Error Handling
**Priority**: High

**Description**: Graceful error handling and user feedback.

**Acceptance Criteria**:
- [ ] Validation errors displayed inline
- [ ] Network errors shown in toast notifications
- [ ] 404/500 errors handled gracefully
- [ ] Image upload errors displayed clearly
- [ ] Form validation before submission

### 3.3 API Requirements

#### API-1: REST API Compliance
**Priority**: High

**Description**: Follow REST API patterns and Next.js API route rules.

**Acceptance Criteria**:
- [ ] Use proxy endpoints (`/api/proxy/event-sponsors`)
- [ ] All server actions use `fetchWithJwtRetry` from `@/lib/proxyHandler`
- [ ] PATCH requests use `Content-Type: application/merge-patch+json`
- [ ] GET requests properly handle query parameters
- [ ] Error responses return proper HTTP status codes

**Rules Reference**:
- Follow `nextjs_api_routes.mdc` cursor rules
- Use `createProxyHandler` for proxy routes
- JWT authentication handled by proxy handlers

#### API-2: Backend API Endpoints
**Priority**: High

**Description**: Use existing backend API endpoints.

**Endpoints Available**:
```
GET    /api/event-sponsors                      - List all sponsors
GET    /api/event-sponsors/{id}                 - Get sponsor by ID
POST   /api/event-sponsors                      - Create new sponsor
PUT    /api/event-sponsors/{id}                 - Update sponsor
PATCH  /api/event-sponsors/{id}                 - Partial update sponsor
DELETE /api/event-sponsors/{id}                 - Delete sponsor
GET    /api/event-sponsors/count                - Count sponsors
GET    /api/event-sponsors/active               - Get active sponsors

GET    /api/event-sponsors-join                 - List all sponsor relationships
GET    /api/event-sponsors-join/{id}            - Get relationship by ID
POST   /api/event-sponsors-join                 - Create relationship
DELETE /api/event-sponsors-join/{id}            - Delete relationship
```

**Swagger Schema Reference**:
- See `documentation/Swagger_API_Docs/api-docs.json` for complete schema
- DTO structure matches backend OpenAPI specification

---

## 4. Implementation Details

### 4.1 File Structure

```
src/
├── app/
│   └── admin/
│       ├── event-sponsors/
│       │   ├── page.tsx                    # Main sponsors management page (NEEDS UPDATE)
│       │   └── ApiServerActions.ts         # Server actions (EXISTS, VERIFY)
│       └── events/
│           └── [id]/
│               └── sponsors/
│                   ├── page.tsx            # Event-specific sponsors (EXISTS, GOOD)
│                   └── ApiServerActions.ts # Event-specific actions (EXISTS)
├── components/
│   └── ui/
│       ├── ImageUpload.tsx                 # Image upload component (EXISTS)
│       └── DataTable.tsx                   # Data table component (EXISTS)
├── pages/
│   └── api/
│       └── proxy/
│           └── event-sponsors/
│               ├── index.ts                # Proxy handler (EXISTS)
│               └── [...slug].ts            # Dynamic proxy handler (EXISTS)
└── types/
    └── index.ts                            # DTO types (EXISTS, VERIFY)
```

### 4.2 Key Components to Update

#### 4.2.1 Main Sponsors Page (`src/app/admin/event-sponsors/page.tsx`)

**Current Issues**:
1. Uses URL input fields instead of `ImageUpload` component
2. Form fields don't match DTO schema (`sponsorName` vs `name`, `sponsorshipLevel` vs `type`)
3. Missing social media fields (facebookUrl, twitterUrl, linkedinUrl, instagramUrl)
4. Missing `companyName` and `tagline` fields

**Required Changes**:
1. Replace URL inputs with `ImageUpload` component for logo, hero, and banner
2. Align form field names with DTO schema:
   - `sponsorName` → `name`
   - `sponsorshipLevel` → `type`
   - `displayOrder` → `priorityRanking`
   - Remove `sponsorshipAmount` and `benefits` (not in DTO)
3. Add missing fields: `companyName`, `tagline`, `facebookUrl`, `twitterUrl`, `linkedinUrl`, `instagramUrl`
4. Update form submission to match DTO structure
5. Apply UI style guide patterns

**Example Form Structure**:
```typescript
interface SponsorFormData {
  name: string;              // Required
  type: string;              // Required (e.g., "Platinum", "Gold", "Silver")
  companyName?: string;
  tagline?: string;
  description?: string;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;         // Set by ImageUpload component
  heroImageUrl?: string;     // Set by ImageUpload component
  bannerImageUrl?: string;   // Set by ImageUpload component
  isActive: boolean;
  priorityRanking: number;
  facebookUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
}
```

#### 4.2.2 ImageUpload Component Integration

**Usage Example**:
```typescript
<ImageUpload
  entityId={formData.id || 0}  // Use 0 for new sponsors
  entityType="sponsor"
  imageType="logo"  // or "hero" or "banner"
  eventId={eventId || 0}  // May need to handle when eventId is not available
  currentImageUrl={formData.logoUrl}
  onImageUploaded={(url) => setFormData(prev => ({ ...prev, logoUrl: url }))}
  onError={(error) => setToastMessage({ type: 'error', message: error })}
  disabled={loading}
/>
```

**Note**: The `ImageUpload` component requires an `eventId`. For the main sponsors page (not event-specific), consider:
- Option 1: Make `eventId` optional in `ImageUpload` component
- Option 2: Use a default event ID or create a separate upload endpoint
- Option 3: Only allow image upload after sponsor is created and associated with an event

#### 4.2.3 DTO Type Verification

**Verify `EventSponsorsDTO` matches backend schema**:
```typescript
export interface EventSponsorsDTO {
  id?: number;
  tenantId?: string;
  name: string;                    // Required
  type: string;                    // Required
  companyName?: string;
  tagline?: string;
  description?: string;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  bannerImageUrl?: string;
  isActive: boolean;
  priorityRanking: number;         // Required (default 0)
  facebookUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  createdAt: string;
  updatedAt: string;
  // Note: event_id exists in database but not in DTO (many-to-many via join table)
}
```

### 4.3 Implementation Steps

#### Step 1: Update Main Sponsors Page Form
1. Replace URL input fields with `ImageUpload` components
2. Align form field names with DTO schema
3. Add missing fields (companyName, tagline, social media URLs)
4. Update form validation
5. Update form submission handler

#### Step 2: Verify and Update API Server Actions
1. Verify `createEventSponsorServer` matches DTO structure
2. Verify `updateEventSponsorServer` uses PATCH correctly
3. Ensure `withTenantId` is applied to all mutations
4. Add error handling improvements

#### Step 3: Image Upload Handling
1. Determine how to handle `eventId` requirement for main sponsors page
2. Update `ImageUpload` component if needed (make eventId optional)
3. Test image upload flow for all three image types
4. Verify image URLs are correctly saved to sponsor record

#### Step 4: UI/UX Enhancements
1. Apply UI style guide patterns
2. Match styling with event-specific sponsors page
3. Add loading states and error handling
4. Improve responsive design
5. Add toast notifications

#### Step 5: Testing
1. Test CRUD operations
2. Test image uploads (logo, hero, banner)
3. Test event-sponsor associations
4. Test multi-tenant isolation
5. Test form validation
6. Test error handling

### 4.4 Database Schema Notes

**Important**: The `event_sponsors` table has an `event_id` column, but:
- The DTO doesn't include `event_id`
- The primary association method is via `event_sponsors_join` (many-to-many)
- The `event_id` in `event_sponsors` may be:
  - Legacy field (deprecated)
  - Optional direct association (for single-event sponsors)
  - Not used in current implementation

**Recommendation**: Verify with backend team if `event_id` in `event_sponsors` should be:
- Ignored (use only join table)
- Optional (for single-event sponsors)
- Removed (if legacy)

---

## 5. UI/UX Specifications

### 5.1 Design System

**Colors** (from `@ui_style_guide.mdc`):
- Background: `#F5F1E8` (soft cream)
- Foreground: `#2D2A26` (near-black with warm undertones)
- Primary: `#8B7D6B` (warm earth tone)
- Card: `#FFFFFF` (pure white)
- Borders: `rgba(139, 125, 107, 0.2)`

**Typography**:
- Headings: `font-heading` (Crimson Text, serif)
- Body: `font-body` (Source Sans Pro, sans-serif)
- Caption: `font-caption` (Lato, sans-serif)

**Spacing**:
- Container: `max-w-7xl mx-auto`
- Padding: `px-4 sm:px-6 lg:px-8`
- Sacred spacing: `space-sacred` (2rem)

### 5.2 Page Layout

**Main Sponsors Page**:
```
┌─────────────────────────────────────────────────┐
│  Header with Navigation                         │
├─────────────────────────────────────────────────┤
│  Page Title: "Event Sponsors"                  │
│  [Add Sponsor] Button                          │
│  [Search] Input                                 │
├─────────────────────────────────────────────────┤
│  DataTable with Sponsors                        │
│  - Name | Type | Company | Status | Actions   │
│  - Pagination Controls                         │
└─────────────────────────────────────────────────┘
```

**Sponsor Form Modal**:
```
┌─────────────────────────────────────────────────┐
│  Create/Edit Sponsor                            │
├─────────────────────────────────────────────────┤
│  Basic Information                              │
│  - Name *                                       │
│  - Type *                                       │
│  - Company Name                                 │
│  - Tagline                                      │
│  - Description                                  │
├─────────────────────────────────────────────────┤
│  Contact Information                            │
│  - Email                                        │
│  - Phone                                        │
│  - Website                                      │
├─────────────────────────────────────────────────┤
│  Images                                         │
│  - Logo Upload                                  │
│  - Hero Image Upload                            │
│  - Banner Image Upload                          │
├─────────────────────────────────────────────────┤
│  Social Media                                   │
│  - Facebook URL                                 │
│  - Twitter URL                                  │
│  - LinkedIn URL                                 │
│  - Instagram URL                                │
├─────────────────────────────────────────────────┤
│  Settings                                       │
│  - Active Status                                │
│  - Priority Ranking                             │
├─────────────────────────────────────────────────┤
│  [Cancel] [Save]                                │
└─────────────────────────────────────────────────┘
```

### 5.3 Component Patterns

**Use Existing Components**:
- `DataTable` for sponsor listing
- `Modal` for create/edit forms
- `ImageUpload` for image uploads
- `Button` with proper variants
- Toast notifications for feedback

**Follow Patterns From**:
- Event-specific sponsors page (`/admin/events/[id]/sponsors`)
- Other admin pages (events, media, etc.)

---

## 6. Testing Requirements

### 6.1 Functional Testing

**Test Cases**:
1. **Create Sponsor**:
   - Create sponsor with all required fields
   - Create sponsor with minimal fields
   - Create sponsor with image uploads
   - Verify tenant isolation

2. **Read Sponsors**:
   - List all sponsors
   - Filter by type
   - Filter by active status
   - Search by name
   - Pagination

3. **Update Sponsor**:
   - Update sponsor details
   - Replace images
   - Change active status
   - Update priority ranking

4. **Delete Sponsor**:
   - Soft delete (set isActive = false)
   - Hard delete (if implemented)
   - Verify cascade delete in join table

5. **Image Upload**:
   - Upload logo image
   - Upload hero image
   - Upload banner image
   - Replace existing image
   - Handle upload errors

6. **Event Association**:
   - Assign sponsor to event
   - Remove sponsor from event
   - Prevent duplicate associations
   - View sponsors by event

### 6.2 Non-Functional Testing

**Performance**:
- Page load time < 2 seconds
- Image upload < 5 seconds
- API response time < 500ms

**Security**:
- Authentication required for all operations
- Tenant isolation enforced
- Input validation on all fields
- SQL injection prevention (handled by backend)

**Usability**:
- Responsive design (mobile, tablet, desktop)
- Clear error messages
- Loading states
- Intuitive form layout

---

## 7. Dependencies

### 7.1 Frontend Dependencies
- Next.js 15+
- React 18+
- Clerk (authentication)
- Tailwind CSS (styling)
- react-icons (icons)
- date-fns (date formatting)

### 7.2 Backend Dependencies
- Spring Boot (backend framework)
- PostgreSQL (database)
- AWS S3 (image storage)
- JHipster/Spring Data REST (API framework)

### 7.3 Environment Variables
- `NEXT_PUBLIC_TENANT_ID` (tenant identification)
- `NEXT_PUBLIC_API_BASE_URL` (backend API URL)
- `NEXT_PUBLIC_APP_URL` (frontend app URL)
- Clerk authentication variables

---

## 8. Risk Assessment

### 8.1 Technical Risks

**Risk 1**: ImageUpload component requires eventId
- **Impact**: Medium
- **Mitigation**: Make eventId optional or provide default value
- **Probability**: High

**Risk 2**: Form field mismatch with DTO
- **Impact**: High
- **Mitigation**: Align form fields with DTO schema during implementation
- **Probability**: Medium

**Risk 3**: Tenant isolation issues
- **Impact**: High
- **Mitigation**: Verify `withTenantId` is applied to all mutations
- **Probability**: Low

### 8.2 Business Risks

**Risk 1**: User confusion with image upload
- **Impact**: Low
- **Mitigation**: Clear UI instructions and error messages
- **Probability**: Medium

**Risk 2**: Performance issues with large image files
- **Impact**: Medium
- **Mitigation**: Implement image compression and lazy loading
- **Probability**: Low

---

## 9. Success Criteria

### 9.1 Functional Success
- ✅ All CRUD operations work correctly
- ✅ Image uploads function for all three image types
- ✅ Event-sponsor associations work correctly
- ✅ Search and filter work as expected
- ✅ Tenant isolation is enforced

### 9.2 Non-Functional Success
- ✅ UI matches style guide standards
- ✅ Page loads in < 2 seconds
- ✅ Responsive design works on all devices
- ✅ Error handling is user-friendly
- ✅ Authentication works correctly

### 9.3 User Acceptance
- ✅ Admins can easily create and manage sponsors
- ✅ Image upload is intuitive and works reliably
- ✅ Sponsor information is displayed correctly
- ✅ No confusion with form fields or workflow

---

## 10. References

### 10.1 Documentation
- **UI Style Guide**: `@ui_style_guide.mdc`
- **API Routes Rules**: `nextjs_api_routes.mdc`
- **Swagger API Docs**: `documentation/Swagger_API_Docs/api-docs.json`
- **Database Schema**: `code_html_template/SQLS/Latest_Schema_Post__Blob_Claude_11.sql`

### 10.2 Related Files
- **Main Sponsors Page**: `src/app/admin/event-sponsors/page.tsx`
- **Event-Specific Sponsors Page**: `src/app/admin/events/[id]/sponsors/page.tsx`
- **ImageUpload Component**: `src/components/ui/ImageUpload.tsx`
- **API Server Actions**: `src/app/admin/event-sponsors/ApiServerActions.ts`
- **Proxy Handlers**: `src/pages/api/proxy/event-sponsors/`
- **DTO Types**: `src/types/index.ts`

### 10.3 Backend Project
- **Location**: `E:\project_workspace\malayalees-us-site-boot`
- **Framework**: Spring Boot
- **Database**: PostgreSQL

---

## 11. Appendices

### Appendix A: API Endpoint Examples

**Create Sponsor**:
```typescript
POST /api/proxy/event-sponsors
Content-Type: application/json

{
  "tenantId": "tenant_demo_001",
  "name": "Acme Corporation",
  "type": "Platinum",
  "companyName": "Acme Corp",
  "tagline": "Your Trusted Partner",
  "description": "Leading provider of...",
  "websiteUrl": "https://acme.com",
  "contactEmail": "sponsor@acme.com",
  "contactPhone": "+1-555-0123",
  "isActive": true,
  "priorityRanking": 1
}
```

**Upload Logo Image**:
```typescript
POST /api/proxy/event-medias/upload/sponsor?eventId=1&entityId=123&imageType=logo
Content-Type: multipart/form-data

file: [image file]
```

**Assign Sponsor to Event**:
```typescript
POST /api/proxy/event-sponsors-join
Content-Type: application/json

{
  "tenantId": "tenant_demo_001",
  "event": { "id": 1 },
  "sponsor": { "id": 123 }
}
```

### Appendix B: Form Field Mapping

**Current Form Fields → DTO Fields**:
- `sponsorName` → `name` ✅
- `sponsorshipLevel` → `type` ✅
- `contactPerson` → (remove, not in DTO) ❌
- `contactEmail` → `contactEmail` ✅
- `contactPhone` → `contactPhone` ✅
- `website` → `websiteUrl` ✅
- `description` → `description` ✅
- `logoUrl` → `logoUrl` ✅
- `heroImageUrl` → `heroImageUrl` ✅
- `bannerImageUrl` → `bannerImageUrl` ✅
- `sponsorshipAmount` → (remove, not in DTO) ❌
- `benefits` → (remove, not in DTO) ❌
- `isActive` → `isActive` ✅
- `displayOrder` → `priorityRanking` ✅

**Missing Fields to Add**:
- `companyName` ❌
- `tagline` ❌
- `facebookUrl` ❌
- `twitterUrl` ❌
- `linkedinUrl` ❌
- `instagramUrl` ❌

---

## Document Approval

**Prepared By**: AI Assistant
**Date**: 2025-01-03
**Status**: Ready for Implementation
**Next Steps**: Review with team, begin implementation

---

**End of Document**

