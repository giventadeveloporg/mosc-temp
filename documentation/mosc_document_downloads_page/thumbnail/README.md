# Official document per-file thumbnails

## Database

| Column | Type | Purpose |
|--------|------|---------|
| `thumbnail_url` | `varchar(2048)` | Stable S3 URL for preview image |
| `thumbnail_pre_signed_url` | `varchar(2048)` | Cached presigned URL (optional) |
| `thumbnail_pre_signed_url_expires_at` | `timestamp` | Presign expiry |

**Apply on deployed databases:**

```bash
psql -f documentation/mosc_document_downloads_page/thumbnail/migration_event_media_thumbnail.sql
```

**Canonical schema:** columns are in `CREATE TABLE public.event_media` in [`Latest_Schema_Post__Blob_Claude_12.sql`](../../../code_html_template/SQLS/Current_Sqls/Latest_Schema_Post__Blob_Claude_12.sql). Follow [database_schema_guidelines.mdc](../../../.cursor/rules/database_schema_guidelines.mdc): incremental `ALTER` for existing DBs, `CREATE TABLE` update for canonical dump.

**Liquibase (Spring):** `malayalees-us-site-boot` → `20260530120000_add_event_media_thumbnail_columns.xml`

## API (Spring)

| Endpoint | `thumbnailFile` |
|----------|-----------------|
| `POST /api/event-medias/upload/tenant-official-document` | Optional image |
| `POST /api/event-medias/upload/bulk-tenant-official` | Optional image (same thumbnail applied to every file in batch) |
| `POST /api/event-medias/{id}/upload-official-document-thumbnail` | Required image (attach/replace after upload) |

S3 path: `{profile}/media/tenantId/{tenantId}/official_document/{slug}/{year}/thumbnails/{name}_{ts}_{uuid}.ext`

DTO fields (camelCase): `thumbnailUrl`, `thumbnailPreSignedUrl`, `thumbnailPreSignedUrlExpiresAt`

## Display rule (Next.js)

`getEventMediaDisplayThumbnailUrl()` in [`src/lib/officialDocumentThumbnail.ts`](../../../src/lib/officialDocumentThumbnail.ts):

1. If main file is `image/*` → use `fileUrl`
2. Else if `thumbnailUrl` → use it
3. Else → MIME/extension placeholder (public downloads)

## Deploy order

1. PostgreSQL migration  
2. Spring backend (Liquibase + deploy)  
3. Next.js (`mosc-temp`)

## Scope

- **v1 upload UI:** `/admin/official-documents` only  
- **Not required:** separate thumbnail on event image uploads (use `fileUrl` as preview)
