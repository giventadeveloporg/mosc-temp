# Static → Dynamic Gallery Porting

Bulk-import MOSC static gallery albums (29 albums, ~315 photos) into the dynamic `gallery_album` + `event_media` API **without backend code changes**.

## Prerequisites

1. `.env.local` with:
   - `NEXT_PUBLIC_API_BASE_URL`
   - `NEXT_PUBLIC_TENANT_ID`
   - `API_JWT_USER` / `API_JWT_PASS`
2. SQL migrations applied (optional but recommended):
   - `documentation/gallery_album_category_year_enhancements/migrations/001` … `002` (schema + categories)
3. For `--media-mode file`: Next.js dev server running (`npm run dev`) and image files under `public/images/mosc/gallery/`

## Quick start

```bash
# 1. Extract manifest from static TS pages
npm run gallery:extract-manifest

# 2. Dry-run full import
npm run gallery:import:dry

# 3. Import albums + photos (URL mode — references existing /images/... paths)
npm run gallery:import

# 4. Or split phases
npm run gallery:import:albums
npm run gallery:import:media
```

## Scripts

| Script | Purpose |
|--------|---------|
| `extract-static-gallery-manifest.mjs` | Parse `moscStaticAlbums.ts` + per-album `page.tsx` → JSON manifest |
| `import-static-gallery-to-api.mjs` | POST albums + event media via service JWT |
| `gallery-porting-lib.mjs` | Shared auth, parsing, category map |

## Flags (import)

| Flag | Description |
|------|-------------|
| `--dry-run` | Log actions only |
| `--albums-only` | Create album rows, skip photos |
| `--media-only` | Attach photos to existing albums (match `static_slug=` in description) |
| `--slug <id>` | Single album, e.g. `russia-visit` |
| `--limit N` | First N albums only |
| `--batch-size N` | Photos per batch (default 8) |
| `--media-mode url` | POST `event_media` with `fileUrl` (default) |
| `--media-mode file` | Multipart upload via Next proxy (needs local files + running app) |
| `--force` | Re-import even if album/media exists |
| `--manifest path` | Use pre-generated JSON instead of live parse |

## Output

- `static-gallery-manifest.json` — extracted source data
- `import-report.json` — per-album results (ids, counts, errors)

See **documentation/gallery_porting/GALLERY_STATIC_TO_DYNAMIC_PORTING_GUIDE.html** for full guide.
