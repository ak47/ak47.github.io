# Quickstart: Validating the nO EgO Site Refresh (002)

How to run and verify each stream. Contracts:
[family-api.md](contracts/family-api.md) ·
[media-manifest.md](contracts/media-manifest.md) · Data:
[data-model.md](data-model.md).

## Prerequisites

- This repo + the backend repo at `/Users/andy/werk/my_gits/projects/digital_twin`
- Node ≥ 18 + Yarn classic (FE); `uv` + Python 3.12 (BE); ffmpeg 8 (migration only)
- Source material (migration only): old site at `/Users/andy/Documents/rails/no_ego`,
  dump at `/Users/andy/Documents/rails/thorondor.sql.zip.sql`
- Gates that need Andy before full validation: hero copy approval, Terraform
  apply + OAuth redirect URI, `TF_FAMILY_ALLOWED_EMAILS` values, RAG content review

## Frontend (this repo, `no_ego/`)

```sh
cd no_ego
yarn install
yarn test          # Jest: koch-mark, zen-moment, familyApi suites green
yarn build         # must succeed (Principle IV) — also produces buildTime stamp
yarn develop       # http://localhost:8000 for visual checks
```

**V1 — heritage + copy (US1, US4)**: on `/` and `/about/` verify: real hero
(name, role, positioning, twin/LinkedIn/GitHub links), journal below fold,
About joke paragraph replaced (chat + warranty joke intact), Koch mark in
header + footer, footer shows a random zen moment (reload several times — it
varies; no raw HTML/escapes ever), `n o - e g o` wordmark, heritage-orange
accent, `est. 2005 · originally Rails 1.0` + today's build date, family footer
link. Run a Lighthouse pass; perf/a11y ≥ pre-refresh baseline (SC-002).

## Backend (digital_twin repo)

```sh
cd /Users/andy/werk/my_gits/projects/digital_twin
uv sync --extra dev
uv run pytest -q                       # V2: incl. family auth/route tests
uv run uvicorn digital_twin.main:app --reload   # local API for Stream B dev
```

**V2 — unit/contract level**: pytest covers the allowlist matrix
(allowlisted / admin-implicit / denied / empty list), cookie
non-interchangeability in both directions, gallery listing against a fake GCS
client, and signed-URL parameters (GET-only, expiry ≤ 15 min).

## Migration (one-shot, after Terraform gate)

```sh
# Gate: terraform -chdir=terraform plan  → Andy reviews → apply
uv run python scripts/migrate_family_media.py \
  --dump /Users/andy/Documents/rails/thorondor.sql.zip.sql \
  --old-repo /Users/andy/Documents/rails/no_ego \
  --bucket <family-media-bucket>
```

**V3 — bucket + media**: script report shows 21 active galleries, 418 photos
reconciled (orphans listed), 28 videos + 28 posters; spot-check transcoded
MP4s play in Chrome and Safari; `curl -i https://storage.googleapis.com/<bucket>/manifest.json`
returns 403 (private bucket); rerunning the script skips existing objects
(idempotent).

## End-to-end family flow

**V4 — gallery (US2, US3)**: against the deployed (or local) stack:

1. Allowlisted Google account → `/family/` → sign in → index shows 21
   galleries → open one → thumbnails → full image with caption → videos
   section → a video plays in-page with poster.
2. Non-allowlisted account → polite "not on the list" state; no content.
3. Copy a signed URL, wait > 15 min, re-fetch → refused.
4. Family cookie against an admin route → 401; admin cookie against
   `/family/galleries` → 401.
5. Cloud Logging shows a structured entry (email, resource, timestamp, client
   IP, user agent) for each listing in step 1 (SC-005); geo is resolvable
   from the logged IP at analysis time.

## RAG corpus (Stream D)

```sh
# After Andy reviews rag-sources/personal-history-2005-website.md
# and rag-sources/education-uccs-coursework.md:
uv run python scripts/ingest_rag_corpus.py …    # or the existing GitHub Action
```

**V5 — twin knowledge (US5)**: ask the twin "what did Andy study?" (expects
UCCS coursework: compilers, algorithms, graphics, numerical computing) and
"what was this site in 2005?" (expects Rails 1.0 story / Koch curve / no-ego
ethos); then ask a pre-existing-corpus question (e.g. resume content) and
confirm the answer is unchanged.

## Ship

**V6**: FE deploys via the **Deploy Pages** GitHub Actions workflow; full
manual pass of V1 + V4 + V5 on https://no-ego.net. Existing FE and BE test
suites green.
