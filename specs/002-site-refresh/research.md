# Research: nO EgO Site Refresh (002)

**Date**: 2026-06-11 · **Plan**: [plan.md](plan.md)

No `NEEDS CLARIFICATION` markers existed in the Technical Context — all
decisions below were pre-resolved in the draft plan
(`docs/002-site-refresh-plan.md`) and the approved draft spec
(`docs/002-site-refresh-spec.md`, "Resolved decisions 2026-06-11"). This
document formalizes them with rationale and alternatives.

## R1 — Signed media URLs on Cloud Run

**Decision**: V4 signed GCS URLs (~15 min, GET only) generated via IAM
signBlob using impersonated credentials (`google.auth` impersonated signing;
service account granted `iam.serviceAccountTokenCreator` on itself).

**Rationale**: The Cloud Run runtime SA has no exportable private key, so
classic key-based signing is unavailable; the signBlob path is the standard
Cloud Run approach and needs no key material. Signed URLs keep media bytes off
the API path and let `<video>` stream via range requests directly from GCS.

**Alternatives considered**: (a) Exported SA key — rejected: key management
risk for zero benefit. (b) Streaming media bytes through FastAPI — viable
fallback at this scale (~42 MB images), kept as the documented fallback if
signBlob proves troublesome at checkpoint V3, but adds Cloud Run egress and
removes native range-request streaming. (c) Public bucket with obscure names —
forbidden (FR-013).

## R2 — Random zen moment without hydration mismatch

**Decision**: Pick the quote client-side after mount (`useEffect`); render
nothing (or a stable placeholder) during SSR/hydration. One pick per page load.

**Rationale**: Gatsby pre-renders HTML; a random pick at render time produces
server/client markup divergence and React hydration errors. Mount-gating is
the smallest correct fix and satisfies "random per page load" (FR-005).

**Alternatives considered**: (a) Pick per build — rejected: every visitor sees
the same quote until the next deploy, weaker experience. (b) Suppress
hydration warnings — rejected: masks a real mismatch.

## R3 — Build-date stamp source

**Decision**: `buildTime` field in `gatsby-config.js` `siteMetadata`
(evaluated once at build), queried via GraphQL in the footer.

**Rationale**: Static-first (Principle II): the "last updated" date is a
build-time fact; no runtime clock, no hydration concerns.

**Alternatives considered**: (a) Runtime `new Date()` — wrong semantics (shows
visit date, not update date) and hydration-unsafe. (b) Git commit date via
plugin — extra dependency for no added value.

## R4 — Video transcode format & settings

**Decision**: Local one-shot ffmpeg 8 transcode of the 28 `.MPG`
(MPEG-1/2) files to MP4: `-c:v libx264 -crf 23 -preset medium -c:a aac
-movflags +faststart`, scaled to even dimensions; poster JPEG extracted at
~1 s per video. Originals never uploaded; they remain on disk as archival
masters.

**Rationale**: MPEG-1/2 doesn't play natively in modern browsers (spec edge
case); H.264/AAC MP4 plays natively in both Chrome and Safari (SC-003);
`+faststart` moves the moov atom up so `<video>` can stream via range requests
against a signed URL; CRF 23 preserves the quality of low-res
camcorder/camera-phone sources without bloating size.

**Alternatives considered**: (a) VP9/AV1 WebM — historically weaker Safari
support and slower encode for zero benefit at this resolution. (b) Cloud
transcoding service — billable infrastructure for a 28-file one-shot job.

## R5 — Koch mark rendering

**Decision**: Programmatic recursive Koch segment subdivision producing an
inline SVG path in a React component (`koch-mark.js`); stroke uses
`colors.heritage`. No animation in v1 (hover iteration = nice-to-have).

**Rationale**: Crisp at any size, themeable via tokens, no asset request, and
unit-testable (segment count = 4^n per iteration; path well-formedness) —
unlike copying the 2005 raster GIF.

**Alternatives considered**: (a) Recreated static SVG asset — not testable,
not themeable. (b) Canvas rendering — runtime JS for a static mark violates
static-first.

## R6 — Family auth pattern

**Decision**: Clone the proven `admin_auth.py` pattern: Google OAuth flow,
itsdangerous-signed `dt_family` cookie with a distinct salt, separate
`FAMILY_ALLOWED_EMAILS` allowlist (admin emails implicitly allowed), delivered
via GitHub Actions variable `TF_FAMILY_ALLOWED_EMAILS` → Terraform
`family_allowed_emails` → Cloud Run env.

**Rationale**: Reuses an audited, working flow (Principle I); distinct cookie
name + salt makes family/admin sessions cryptographically non-interchangeable
(FR-014); env-var delivery keeps addresses out of git (FR-008).

**Alternatives considered**: (a) Shared cookie with role claim — rejected: one
bug away from family→admin escalation; spec mandates separation. (b) New IdP /
Firebase Auth — new dependency and console surface for no gain.

## R7 — Archive metadata source & drift reconciliation

**Decision**: Parse the recovered 2006 MySQL dump
(`/Users/andy/Documents/rails/thorondor.sql.zip.sql`, path passed as CLI arg,
never committed) for `photo_galleries` (skip `active = 0`), 418 `photos`
rows, 28 `videos` rows, and 33 `zen_moments` rows. The migration script
reconciles DB ↔ filesystem in both directions: DB rows with missing files are
dropped and reported; files with no DB row are appended caption-less at the
end of their gallery; unpaired full images reuse the full image as the
thumbnail (CSS-scaled). Output: `manifest.json` at the bucket root
([contracts/media-manifest.md](contracts/media-manifest.md)); script is
idempotent (skips already-uploaded objects). Video titles strip stale
"(5mb)"-style suffixes.

**Rationale**: The dump is the only source of real titles, descriptions,
ordering, active flags, and captions (resolved decision #5); the filesystem
may have diverged since Dec 2006, so silent mismatch handling would lose
photos or break galleries.

**Alternatives considered**: (a) Filesystem-only with directory names as
titles — loses all captions/descriptions/ordering. (b) Hand-built manifest —
418 photos is too many to curate by hand reliably.

## R8 — Cross-origin auth (Pages FE → Cloud Run BE)

**Decision**: Reuse the existing CORS configuration (`cors_allowed_origins`)
and cookie attributes proven by the admin flow: `credentials: 'include'` on
the FE client, `SameSite=None; Secure` on the `dt_family` cookie, matching
admin cookie settings exactly.

**Rationale**: The admin flow already works cross-origin from GitHub Pages to
Cloud Run; deviating invites subtle cookie-rejection bugs.

**Alternatives considered**: Token-in-localStorage — rejected: XSS-exfiltrable
and diverges from the established signed-cookie pattern.

## R9 — Frontend package manager / commands

**Decision**: Use `yarn` (classic v1) for all `no_ego/` commands
(`yarn develop`, `yarn test`, `yarn build`, `yarn format`), per the
constitution. The draft docs' `npm run …` forms are superseded. Deployment
flows through the GitHub Actions **Deploy Pages** workflow, not local
`gh-pages` pushes.

**Rationale**: Constitution (Technology Stack & Structure; Principle IV) is
authoritative for this repo and post-dates the draft spec's command table.

**Alternatives considered**: npm — contradicts the constitution; mixing
lockfiles causes drift.

## R10 — Zen moment data cleanup

**Decision**: One-time extraction of the 33 `zen_moments` rows into
`no_ego/src/data/zen-moments.js`: strip embedded HTML (`<i>`, `<br/>`),
unescape SQL artifacts, keep attribution; entries longer than ~280 chars get
`long: true` and are excluded from footer rotation but retained in the file.
Jest asserts no entry contains HTML tags or backslash escapes.

**Rationale**: Static data resolved at build time (Principle II); keeping long
entries preserves the archive while protecting footer layout (FR-005).

**Alternatives considered**: Serving quotes from the backend — runtime
dependency for static content; pointless.
