# Plan 002: nO EgO site refresh — implementation plan

Spec: [002-site-refresh-spec.md](002-site-refresh-spec.md)
Status: DRAFT — awaiting review
Date: 2026-06-11

## Components and dependency order

The work splits into four streams. Streams A, C, and D are independent of
each other; Stream B (family gallery FE) depends on Stream C (family
backend) for anything beyond UI scaffolding.

```
Stream A: FE heritage + copy        (no external dependencies)
Stream C: BE family auth/media      (Terraform gate: bucket + env)
Stream B: FE family gallery page    (depends on C's API contract)
Stream D: RAG corpus content        (independent; ingest gate)
```

### Stream A — Frontend heritage and copy (FE repo only)

Order:
1. **Theme + footer scaffolding** — add `colors.heritage` (#FF8003) to
   `theme.js`; restructure the footer in `layout.js` to hold: zen moment,
   spaced wordmark, est. 2005 + build-date stamp, family link placeholder.
2. **Koch mark component** — `koch-mark.js`: recursive Koch segment
   generator → inline SVG path; place in header (next to wordmark) and
   footer. Jest test: segment count = 4^n, path well-formed.
3. **Zen moment component** — `zen-moments.js` data extracted from the 33
   `zen_moments` rows in the 2006 dump
   (`/Users/andy/Documents/rails/thorondor.sql.zip.sql`), cleaned of
   embedded HTML (`<i>`, `<br/>`) and SQL escape artifacts; entries > ~280
   chars flagged `long: true` and excluded from footer rotation.
   `zen-moment.js` component (random pick on mount, SSR-safe: render
   nothing until mounted to avoid hydration mismatch). Jest tests: pick
   logic, no entry contains HTML tags or backslash escapes.
4. **Landing page** — rework `index.js` hero with approved copy (spec draft
   pending Andy's edit); journal list moves below the fold under "Journal &
   experiments"; panda posts untouched.
5. **About copy** — replace joke paragraph in `about.js`; twin chat and
   model-info untouched.

Build-date stamp: use Gatsby build-time (`new Date()` in `gatsby-config.js`
siteMetadata or a `buildTime` field) — no runtime clock.

### Stream C — Backend family auth + media (BE repo)

Order (API contract first, infra gated):
1. **Settings + auth module** — `family_allowed_emails`,
   `family_media_bucket` in `settings.py`; `family_auth.py` modeled on
   `admin_auth.py`: `dt_family` cookie, distinct itsdangerous salt, admin
   emails implicitly allowed. Tests: allowlist matrix, cookie separation
   (family cookie rejected by admin dependency and vice versa).
2. **Routes** — `family_routes.py`: login/callback/me/logout (reuse the
   OAuth flow helpers), `GET /family/galleries` (manifest read),
   `GET /family/galleries/{name}` (objects + V4 signed URLs, 15 min, GET
   only), `GET /family/videos` (signed video + poster URLs). Structured
   access log per request (email, gallery/video). Tests with a fake GCS
   client.
3. **Manifest + migration script** — `scripts/migrate_family_media.py`:
   parse `photo_galleries` (skip `active = 0`) and `photos` INSERT rows
   from the 2006 dump (`/Users/andy/Documents/rails/thorondor.sql.zip.sql`,
   path passed as a CLI arg, never committed) for titles, descriptions,
   `list_order`, and per-photo captions; walk old repo
   `public/images/{GIFs,JPGs}/<gallery>/` pairing thumb/image files by the
   stems recorded in the `photos` rows; upload to
   `gs://<bucket>/galleries/<gallery>/`; write `manifest.json` (ordered
   galleries with title/description, items with caption + thumb/full keys)
   to the bucket root. Idempotent (skip already-uploaded objects). Report:
   DB rows with missing files, files with no DB row (include caption-less
   at end of gallery).
   **Videos:** parse the dump's `videos` table (28 rows, all matching files
   present); transcode each `public/video/*.MPG` with local ffmpeg 8
   (`-c:v libx264 -crf 23 -preset medium -c:a aac -movflags +faststart`,
   scale to even dimensions) and extract a poster JPEG (frame at ~1s);
   upload to `videos/` prefix; manifest `videos` section carries title
   (size suffix like "(5mb)" stripped), description, original date.
   Transcode outputs go to a local temp dir; originals untouched.
4. **Terraform** — private bucket (uniform access, no public IAM),
   service-account `roles/storage.objectViewer` + signing permission
   (`iam.serviceAccountTokenCreator` on itself if needed for V4 signing on
   Cloud Run), `family_allowed_emails` variable, env wiring in
   `cloud_run.tf`; `TF_FAMILY_ALLOWED_EMAILS` in
   `.github/workflows/terraform.yml`.
   **GATE: Andy reviews plan output and applies** (billable resources, GCP
   console OAuth redirect URI addition for `/family/oauth/callback`).
5. **Migration run** — execute the script against the new bucket (one-shot;
   ~42 MB images + transcoded videos, expect roughly 100–200 MB total).
   Verify object counts match local inventory (images) and 28 videos + 28
   posters; spot-check several transcoded videos play locally before
   upload.

### Stream B — Frontend family gallery (FE repo, after C step 2 contract)

1. **API client** — `familyApi.js` mirroring `digitalTwinApi.js`
   (credentials: include, base URL from same config). Jest tests.
2. **Family page** — `/family/`: states = signed-out (Google button →
   `/family/login`), signed-in-denied ("not on the list"), gallery index,
   gallery grid (GIF thumbs), full-image lightbox/link, and a Videos
   section (poster grid → in-page `<video controls>` playback, signed URL
   fetched when a video is opened so the 15-min expiry starts at click).
   Footer link added in `layout.js`.
3. Can be developed against a locally run backend before Terraform applies.

### Stream D — RAG corpus (BE repo, independent)

1. Write `rag-sources/personal-history-2005-website.md` (Rails 1.0 story,
   Koch curve identity, zen moments, no-ego ethos, Colorado Springs era)
   and `rag-sources/education-uccs-coursework.md` (from old academics page).
   Source: old repo views + resume education section.
2. **GATE: Andy reviews content** (it feeds the public twin).
3. Upload to corpus bucket + run existing ingest action.
4. Verify with twin queries ("what did Andy study", "what was the 2005
   site").

## Verification checkpoints

| Checkpoint | After | Evidence |
|---|---|---|
| V1 | Stream A | `npm test` + `npm run build` green; visual pass in `develop`; hero copy approved by Andy |
| V2 | C steps 1–2 | `uv run pytest -q` green incl. new auth/route tests |
| V3 | C step 4–5 | Terraform applied; bucket private (direct GET 403); image counts match local; 28 videos + 28 posters uploaded; sample transcodes play in Chrome + Safari |
| V4 | Stream B | Allowlisted login sees 21 active galleries + videos section; videos play in-page; non-allowlisted denied; signed URL expires; access log lines visible in Cloud Logging |
| V5 | Stream D | Twin answers coursework/2005 questions correctly |
| V6 | Ship | FE deployed to Pages; full manual pass on no-ego.net |

## Risks and mitigations

1. **V4 URL signing on Cloud Run** — the runtime SA has no private key;
   signing needs the IAM signBlob path (`iam.serviceAccountTokenCreator`
   on its own SA) or impersonated credentials. Mitigation: implement with
   `google.auth` impersonated signing as used widely on Cloud Run; covered
   by an integration check at V3. (Fallback: stream bytes through the API —
   simpler, slightly more egress through Cloud Run, fine at 42 MB scale.)
2. **OAuth redirect URI** — Google OAuth client needs the new
   `/family/oauth/callback` URI added in the GCP console (manual, gated
   with Terraform apply step).
3. **Hydration mismatch for random zen quote** — render after mount only
   (client-side pick), or pick per build. Decided: per page load, after
   mount.
4. **CORS + cookies cross-origin** (Pages FE → Cloud Run BE) — admin already
   does this (`credentials: include`, `cors_allowed_origins`); family
   routes reuse the same CORS config. Verify SameSite=None; Secure on the
   new cookie matches admin cookie settings.
5. **Photo metadata drift** — the dump is from Dec 2006 and the filesystem
   may have diverged (DB rows pointing at missing files, files never
   registered in the DB). Migration script reconciles both directions and
   reports; DB-orphaned rows are dropped, file-orphans are appended
   caption-less. Unpaired full images use the full image as thumb,
   CSS-scaled.
6. **Transcode quality / playback** — MPEG-1/2 sources are low-res
   (camera-phone/camcorder era); H.264 CRF 23 preserves what's there.
   Verify a sample plays in Chrome and Safari before the full batch; keep
   `+faststart` so `<video>` can stream via range requests against the
   signed URL. Originals stay on disk untouched as the archival master.
7. **Video signed-URL expiry mid-playback** — a 15-min URL could expire
   during a long pause; all clips are short (1–14 MB), and the FE fetches a
   fresh URL each time a video is opened, so this is acceptable. Re-open to
   resume is the documented behavior.

## Parallelism

- A, C, D can run in parallel sessions.
- B starts once C's route contract (step C2) is merged, using a local
  backend.
- Gates requiring Andy: hero copy approval (A4), Terraform apply + OAuth
  console change (C4), RAG content review (D2), allowlist variable values.

## Suggested commit/PR slicing

- FE repo: PR1 = Stream A (heritage + copy), PR2 = Stream B (family page).
- BE repo: PR1 = C1–C3 (code + script + tests), PR2 = C4 (terraform),
  PR3 = D (rag-sources).
