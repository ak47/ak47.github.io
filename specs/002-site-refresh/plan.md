# Implementation Plan: nO EgO Site Refresh — Professional Calling Card with 2005 Heritage

**Branch**: `main` (no feature branch; small PRs per stream) | **Date**: 2026-06-11 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-site-refresh/spec.md`; prior draft plan `docs/002-site-refresh-plan.md` (incorporated)

## Summary

Turn no-ego.net into a professional calling card (real hero + About copy) with
2005 heritage elements (generated Koch mark, footer zen moments, spaced
wordmark, `est. 2005` stamp), add a Google-auth-gated private family
photo/video gallery backed by the digital-twin backend and a private GCS
bucket with short-lived signed URLs and audited access, and augment the twin's
RAG corpus with 2005-era personal history. Work splits into four streams —
A: FE heritage/copy, B: FE family page, C: BE family auth/media, D: RAG
content — where A, C, D are independent and B depends on C's API contract.

## Technical Context

**Language/Version**: Frontend: JavaScript (Node.js ≥ 18, React 18, Gatsby 5). Backend: Python 3.12.

**Primary Dependencies**: FE: Gatsby 5, Emotion (`css` prop), gatsby-transformer-remark, gh-pages. BE: FastAPI, google-auth-oauthlib, itsdangerous (signed cookies), google-cloud-storage, Vertex AI (Gemini + RAG Engine), Terraform. Tooling: ffmpeg 8 (local, one-shot transcode). No new FE npm dependencies expected; BE additions limited to what GCS signing requires (already present via google-cloud-storage / google-auth).

**Storage**: New private GCS bucket (uniform bucket-level access, no public IAM) holding `galleries/<name>/…`, `videos/…`, and `manifest.json`. Existing PostgreSQL (twin sessions) unchanged. RAG corpus bucket (existing) gains two markdown sources.

**Testing**: FE: Jest (`yarn test` in `no_ego/`). BE: pytest (`uv run pytest -q`) with a fake GCS client for route tests. Manual verification gates V1–V6 (see quickstart.md).

**Target Platform**: Static site on GitHub Pages (FE, deployed via the Deploy Pages workflow) + existing Cloud Run service (BE).

**Project Type**: Web — static frontend (this repo, `no_ego/`) + API backend in a second repository (`digital_twin` at `/Users/andy/werk/my_gits/projects/digital_twin`).

**Performance Goals**: Lighthouse performance/accessibility must not regress from the pre-refresh baseline (SC-002). Media archive is small (~42 MB images; ~100–200 MB after video transcode), one-shot migration.

**Constraints**: All family media private; signed URLs ≤ 15 min, GET only; family (`dt_family`) and admin cookies/allowlists strictly separate; no secrets/allowlist emails/dump committed to either repo; every gallery listing access logged (email, gallery, timestamp, client IP, user agent — see data-model.md); theme tokens for all colors (no inline hex outside `theme.js`).

**Scale/Scope**: 22 galleries (21 active), 418 photos, 28 videos, 33 zen moments; single-owner low-traffic site; 2 repos, ~8 new files FE, ~4 new files + Terraform BE.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Pre-design | Post-design |
|-----------|------|-----------|-------------|
| I. Simplicity Over Perfection | Scope is minimal; no speculative abstractions | PASS — reuses existing admin OAuth pattern, existing chat/API client idioms; no new frameworks; one-shot migration script instead of upload UI | PASS |
| II. Static-First Delivery | Changes fit the Gatsby static model under `no_ego/` unless justified | PASS with documented exception — heritage/copy/zen data are build-time/static; the family page requires runtime JS (auth + on-demand signed URLs) which is an explicit requirement (private media cannot be statically published). See Complexity Tracking. | PASS |
| III. Incremental Stories | Independently testable, prioritized stories, P1 first | PASS — spec defines P1–P3 stories; streams map to them (A→US1/US4, B+C→US2/US3, D→US5); P1 (Stream A items 4–5) has no dependency on B/C/D | PASS |
| IV. Build & Deploy Integrity | `yarn build` verification; env vars documented | PASS — V1/V6 checkpoints require `yarn test` + `yarn build`; FE introduces no new env vars (family API uses existing `GATSBY_DIGITAL_TWIN_API_BASE`); BE env (`FAMILY_ALLOWED_EMAILS`, bucket name) documented and supplied via Terraform/Actions variables, never committed | PASS |
| V. Graceful External Integration | External APIs degrade gracefully; no secrets in repo | PASS — family page renders clear signed-out/denied/unavailable states; reuses documented `GATSBY_*` base URL; allowlists and dump never committed | PASS |

## Project Structure

### Documentation (this feature)

```text
specs/002-site-refresh/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/
│   ├── family-api.md    # Backend family endpoints contract
│   └── media-manifest.md# manifest.json schema (bucket)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
# Frontend — this repo (ak47.github.io)
no_ego/
├── gatsby-config.js                    # + siteMetadata.buildTime (build-date stamp)
├── src/
│   ├── styles/theme.js                 # + colors.heritage (#FF8003)
│   ├── components/
│   │   ├── layout.js                   # header Koch mark; footer: zen moment,
│   │   │                               #   spaced wordmark, est. 2005 + build date,
│   │   │                               #   family footer link
│   │   ├── koch-mark.js                # NEW: generated Koch SVG component
│   │   └── zen-moment.js               # NEW: random footer quote (mount-gated)
│   ├── data/zen-moments.js             # NEW: 33 cleaned quotes (long ones flagged)
│   ├── pages/
│   │   ├── index.js                    # professional landing hero
│   │   ├── about.js                    # real copy (twin chat untouched)
│   │   └── family.js                   # NEW: gated gallery page (all states)
│   └── utils/familyApi.js              # NEW: family endpoints client
└── (Jest tests colocated per existing convention)

# Backend — digital_twin repo (/Users/andy/werk/my_gits/projects/digital_twin)
src/digital_twin/
├── family_auth.py                      # NEW: modeled on admin_auth.py
│                                       #   (dt_family cookie, distinct salt)
├── family_routes.py                    # NEW: login/callback/me/galleries/videos/logout
├── settings.py                         # + family_allowed_emails, family_media_bucket
└── main.py                             # mount family routes
scripts/migrate_family_media.py         # NEW: one-shot dump-parse + upload + manifest
terraform/                              # NEW bucket + IAM + family_allowed_emails var
rag-sources/
├── personal-history-2005-website.md    # NEW (Stream D)
└── education-uccs-coursework.md        # NEW (Stream D)
tests/                                  # family auth + route tests (fake GCS)
```

**Structure Decision**: Two existing codebases, no new projects. FE changes
stay inside `no_ego/src` per constitution layout; BE mirrors the established
`admin_auth.py`/route-module pattern. Spec Kit artifacts live in this repo
under `specs/002-site-refresh/` and govern both repos.

## Implementation Streams & Dependency Order

```
Stream A: FE heritage + copy        (no external dependencies)        → US1, US4
Stream C: BE family auth/media      (Terraform gate: bucket + env)    → US2, US3 (server side)
Stream B: FE family gallery page    (depends on C's API contract)     → US2, US3 (client side)
Stream D: RAG corpus content        (independent; ingest gate)        → US5
```

### Stream A — Frontend heritage and copy (FE repo only)

1. **Theme + footer scaffolding** — add `colors.heritage` to `theme.js`;
   restructure footer in `layout.js`: zen moment slot, spaced wordmark,
   `est. 2005 · originally Rails 1.0` + build-date stamp, family link
   placeholder. Build date from `siteMetadata.buildTime` (no runtime clock).
2. **Koch mark component** — recursive segment generator → inline SVG path;
   header + footer placement. Jest: segment count = 4^n, well-formed path.
3. **Zen moment component** — `zen-moments.js` data (33 cleaned rows from the
   2006 dump; `long: true` flag excludes >~280 chars from rotation);
   `zen-moment.js` picks randomly on mount (SSR-safe: render nothing until
   mounted). Jest: pick logic; no entry contains HTML tags or escape artifacts.
4. **Landing page** — rework `index.js` hero with approved copy (draft v1
   pending Andy's edit); journal list below the fold; panda posts untouched.
5. **About copy** — replace joke paragraph only; chat + model-info untouched.

### Stream C — Backend family auth + media (BE repo)

1. **Settings + auth** — `family_allowed_emails`, `family_media_bucket` in
   settings; `family_auth.py` clones `admin_auth.py` shape: `dt_family`
   cookie, distinct itsdangerous salt, admin emails implicitly allowed.
   Tests: allowlist matrix, cookie separation both directions.
2. **Routes** — per [contracts/family-api.md](contracts/family-api.md);
   structured access log per gallery/video listing. Tests with fake GCS.
3. **Migration script** — parse dump (CLI arg path, never committed):
   `photo_galleries` (skip `active = 0`), `photos` (418), `videos` (28);
   pair files in old repo `public/images/{GIFs,JPGs}/<gallery>/`; transcode
   videos (see research.md R4); upload; write `manifest.json`
   (per [contracts/media-manifest.md](contracts/media-manifest.md)).
   Idempotent; reconciliation report (see research.md R7).
4. **Terraform** — private bucket, SA `roles/storage.objectViewer` +
   `iam.serviceAccountTokenCreator` on itself (V4 signing), variable + env
   wiring, `TF_FAMILY_ALLOWED_EMAILS` in the workflow.
   **GATE: Andy reviews plan output and applies** (billable; manual OAuth
   redirect URI addition for `/family/oauth/callback` in GCP console).
5. **Migration run** — one-shot; verify counts (images match inventory; 28
   videos + 28 posters); spot-check transcodes in Chrome + Safari first.

### Stream B — Frontend family gallery (after C2 contract merges)

1. **API client** — `familyApi.js` mirrors `digitalTwinApi.js`
   (`credentials: 'include'`, same base URL config). Jest tests.
2. **Family page** — states: signed-out (Google button → `/family/login`),
   signed-in-denied, gallery index, gallery grid, full-image view, videos
   section (poster grid → in-page `<video controls>`; signed URL fetched at
   open so expiry starts at click). Footer link in `layout.js`.
3. Developable against a locally run backend before Terraform applies.

### Stream D — RAG corpus (BE repo, independent)

1. Write the two `rag-sources/` markdown files (source: old repo views +
   resume education section).
2. **GATE: Andy reviews content** (feeds the public twin).
3. Upload + run existing ingest action (no API redeploy).
4. Verify with twin queries.

### Verification checkpoints

| Checkpoint | After | Evidence |
|---|---|---|
| V1 | Stream A | `yarn test` + `yarn build` green in `no_ego/`; visual pass in `yarn develop`; hero copy approved by Andy |
| V2 | C1–C2 | `uv run pytest -q` green incl. new auth/route tests |
| V3 | C4–C5 | Terraform applied; direct bucket GET 403; image counts match; 28 videos + 28 posters; samples play in Chrome + Safari |
| V4 | Stream B | Allowlisted login sees 21 galleries + videos; non-allowlisted denied; signed URL expires; access logs in Cloud Logging |
| V5 | Stream D | Twin answers coursework/2005 questions; pre-existing answers unchanged |
| V6 | Ship | FE deployed via Deploy Pages workflow; full manual pass on no-ego.net |

### Gates requiring Andy

Hero copy approval (A4) · Terraform apply + OAuth console change (C4) ·
RAG content review (D2) · allowlist variable values · any new dependency.

### Suggested PR slicing

- FE repo: PR1 = Stream A (heritage + copy), PR2 = Stream B (family page).
- BE repo: PR1 = C1–C3 (code + script + tests), PR2 = C4 (Terraform), PR3 = D.

## Risks & Mitigations

1. **V4 URL signing on Cloud Run** — runtime SA has no private key; use IAM
   signBlob via impersonated credentials (research.md R1); integration check
   at V3. Fallback: stream bytes through the API (fine at this scale).
2. **OAuth redirect URI** — manual GCP console addition, bundled with the C4
   gate.
3. **Hydration mismatch (random quote)** — client-side pick after mount only
   (research.md R2).
4. **CORS + cross-origin cookies** (Pages → Cloud Run) — reuse admin CORS
   config; verify `SameSite=None; Secure` matches admin cookie settings.
5. **Photo metadata drift** (Dec-2006 dump vs. filesystem) — script
   reconciles both directions and reports (research.md R7).
6. **Transcode quality/playback** — H.264 CRF 23, `+faststart` for range
   requests; sample-verify in both browsers before full batch; originals
   untouched as archival masters.
7. **Signed-URL expiry mid-playback** — clips are short (1–14 MB); FE fetches
   a fresh URL per open; re-open to resume is documented behavior.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Runtime client-side JS + backend dependency for `/family/` (Principle II static-first) | Private media gated by per-user auth and short-lived signed URLs cannot be baked into a public static build | Static publication (even obscured URLs) would expose family media publicly — explicitly forbidden by the spec (FR-013, Out of Scope) |
| Work spans a second repository (`digital_twin`) | Auth, signed-URL issuance, and audit logging must live server-side; the existing backend already owns OAuth, sessions, and GCP infra | Duplicating an auth stack in this repo (e.g., serverless functions) would add a new deployment surface and violate Simplicity (Principle I) |
