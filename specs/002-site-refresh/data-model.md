# Data Model: nO EgO Site Refresh (002)

**Date**: 2026-06-11 · **Plan**: [plan.md](plan.md) · **Spec entities**: [spec.md → Key Entities](spec.md#key-entities)

There is no new relational storage. Data lives in three places:

1. **`manifest.json`** in the private GCS media bucket (galleries, photos,
   videos) — produced once by the migration script, read by the family API.
   Wire schema: [contracts/media-manifest.md](contracts/media-manifest.md).
2. **`no_ego/src/data/zen-moments.js`** — static quote data, build-time only.
3. **Runtime/config state** — family session cookie, allowlist env var,
   structured access-log entries (Cloud Logging; no new tables).

## Entities

### Gallery

| Field | Type | Source | Notes |
|---|---|---|---|
| `name` | string | directory name in old repo | URL-safe key, e.g. `amsterdam`; unique |
| `title` | string | dump `photo_galleries.title` | display title |
| `description` | string \| null | dump `photo_galleries.description` | optional |
| `order` | int | dump `photo_galleries.list_order` | index sort key |
| `active` | bool | dump `photo_galleries.active` | inactive galleries (e.g. `test`) are **excluded at migration time** — they never enter the manifest |
| `items` | Photo[] | join | ordered as in dump, file-orphans appended last |

Validation: 22 galleries in dump → 21 active in manifest. `name` unique.

### Photo

| Field | Type | Source | Notes |
|---|---|---|---|
| `caption` | string \| null | dump `photos.caption` | null for file-orphans (rendered without caption, FR edge case) |
| `thumb` | string (object key) | file stem from dump + `GIFs/` walk | `galleries/<name>/thumbs/<stem>.gif`; falls back to `full` key when unpaired (CSS-scaled) |
| `full` | string (object key) | file stem from dump + `JPGs/` walk | `galleries/<name>/full/<stem>.jpg` |

Validation: 418 dump rows reconciled against filesystem (research.md R7);
rows with missing files dropped + reported; keys must exist in bucket.

### Video

| Field | Type | Source | Notes |
|---|---|---|---|
| `title` | string | dump `videos` table | stale "(5mb)"-style suffix stripped |
| `description` | string \| null | dump `videos` table | |
| `date` | string (ISO) \| null | dump `videos` table | original date if present |
| `video` | string (object key) | transcoded MP4 | `videos/<stem>.mp4` (H.264/AAC, +faststart) |
| `poster` | string (object key) | extracted frame ~1 s | `videos/<stem>.jpg` |

Validation: exactly 28 videos and 28 posters; each MP4 plays natively in
Chrome and Safari (checkpoint V3).

### Zen Moment (frontend static data)

| Field | Type | Notes |
|---|---|---|
| `text` | string | cleaned: no HTML tags, no SQL escape artifacts |
| `attribution` | string \| null | Thoreau, Watts, Turing, … |
| `long` | bool | `true` when > ~280 chars → excluded from footer rotation, retained in file |

Validation (Jest): 33 entries; no entry matches `/<[a-z]+/i` or `\\`;
rotation pool = entries where `long !== true`.

### Family Allowlist Entry (config, not stored data)

Comma-separated emails in `FAMILY_ALLOWED_EMAILS` env var (GitHub Actions
variable `TF_FAMILY_ALLOWED_EMAILS` → Terraform → Cloud Run). Matching is
case-insensitive exact email. Admin allowlist emails are implicitly allowed.
Never committed. Empty/unset ⇒ only admins pass.

### Family Session (cookie)

itsdangerous-signed cookie `dt_family` carrying the authenticated email;
distinct salt from the admin cookie ⇒ tokens are mutually unverifiable
(family ⇏ admin, admin cookie ⇏ family routes). Attributes: `HttpOnly`,
`Secure`, `SameSite=None` (matches admin cookie). Lifetime matches admin
session conventions.

### Access Log Entry (structured log line, Cloud Logging)

| Field | Type | Notes |
|---|---|---|
| `email` | string | authenticated viewer |
| `resource` | string | gallery name or `videos` |
| `timestamp` | ISO 8601 | emitted by existing `structured_logging` module |
| `ip` | string \| null | client IP — first hop of `X-Forwarded-For` as set by Cloud Run's ingress (never the raw header tail, which is spoofable) |
| `user_agent` | string \| null | `User-Agent` request header, truncated to a sane length (e.g. 256 chars) |
| `referer` | string \| null | `Referer` request header, if present |
| `geo` | object \| null | best-effort `{ country, region, city }` resolved from `ip` at analysis time in Cloud Logging (or offline lookup) — **not** enriched inline; no third-party geo service in the request path |

Emitted on every gallery/photo/video listing response (FR-015). No retention
change — Cloud Logging defaults.

Notes:

- Connection fields are nullable: a missing/garbled header must never block
  the request or the log line.
- Geo stays a derived/analysis-time view rather than a stored enrichment so
  the request path gains no new dependency or latency; the IP itself is the
  durable datum.
- These are audit logs of a private family archive, visible only to the site
  owner in Cloud Logging — no client-facing exposure.

## Relationships

```
Gallery 1 ──< Photo            (manifest, ordered)
Manifest 1 ──< Gallery, Video  (single JSON document at bucket root)
FamilySession ── email ──> AllowlistEntry (membership check per request)
Listing request ──> AccessLogEntry (1:1)
```

## State transitions

- **Family page client states** (Stream B): `signed-out → authenticating →
  signed-in-allowed | signed-in-denied`; `signed-in-* → signed-out` on logout;
  any state → `service-unavailable` fallback on API failure (Principle V).
- **Signed URL**: `issued → expired (≤ 15 min)`; FE requests fresh URLs at
  gallery open / video click; expired URLs are never refreshed server-side.
