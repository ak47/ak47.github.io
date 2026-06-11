# Spec 002: nO EgO site refresh — professional calling card with 2005 heritage

Status: APPROVED with decisions resolved (2026-06-11) — hero copy pending Andy's edit
Date: 2026-06-11
Repos: `ak47.github.io` (frontend, this repo) and `digital_twin` (backend, `/Users/andy/werk/my_gits/projects/digital_twin`)
Source material: 2005 Rails 1.x site at `/Users/andy/Documents/rails/no_ego`

## Objective

Update no-ego.net into a professional-but-simple business calling card that
keeps the digital-twin chat as its centerpiece and deliberately incorporates
identity elements from the original 2005 Rails site. Add a private,
Google-auth-gated family photo gallery serving the 2005 photo archive to an
allowlist of family emails. Feed the 2005-era personal history into the
digital twin's RAG corpus so the twin can answer questions about it.

Success looks like: a visitor (recruiter, client, peer) lands on a clean page
that says who Andy is and what he does, can chat with the twin, and never sees
joke placeholder copy; a family member can sign in with Google and browse the
old photo galleries; nobody else can.

### User stories

1. **Visitor**: I land on no-ego.net and immediately see who Andy Koch is,
   what he does, and how to reach him (twin chat, LinkedIn). The site feels
   personal but professional.
2. **Family member**: I open the Family page, sign in with my Google account,
   and browse the 2005 photo galleries (Amsterdam, Mt. Harvard, Xmas 2003, …).
3. **Stranger**: I try the Family page, sign in, and am politely refused —
   my email is not on the allowlist. The media URLs themselves are not
   guessable or publicly fetchable.
4. **Twin user**: I ask the twin "what did Andy study?" and it answers from
   the UCCS coursework history (compilers, algorithms, graphics, numerical
   computing) ingested from the 2005 site — in addition to all existing
   corpus content (resume, profile, project write-ups, etc.), which remains
   in place and unchanged. The 2005 material augments the corpus; it
   replaces nothing.

## Scope

### In scope — frontend (`ak47.github.io/no_ego`)

1. **Home page → professional landing.** Hero becomes a real introduction
   (name, role, one-paragraph positioning, links to About/twin and LinkedIn).
   Journal list stays below the fold. Existing panda placeholder posts remain
   until replaced with real writing (flagged, not deleted).
2. **About page copy.** Replace the "∫ß eating lots of food" joke paragraph
   with real professional copy. Keep the twin chat, the model-info line, and
   the LinkedIn warranty joke (it fits the voice).
3. **Heritage elements** (from the 2005 site):
   - **Koch curve mark** — small inline SVG Koch snowflake/curve as the site
     mark next to the header wordmark and in the footer. Generated
     programmatically (recursive segment subdivision), not a raster copy of
     the old GIF. Subtle; no animation required for v1 (hover iteration is a
     nice-to-have).
   - **Zen moment in footer** — a quotes module seeded from the 33 original
     `zen_moments` rows recovered from the 2006 MySQL dump
     (`/Users/andy/Documents/rails/thorondor.sql.zip.sql`): Thoreau, Watts,
     Chomsky, Kerouac, Einstein, Turing, Snyder, Monty Python, et al. One
     picked at random per page load, rendered as a muted line in the footer.
     Source text needs cleanup (embedded `<i>`/`<br/>` HTML and SQL escape
     artifacts); entries longer than ~280 chars are kept in the data file
     but excluded from the footer rotation.
   - **Heritage accent + wordmark** — add 2005 orange `#FF8003` to the theme
     as `colors.heritage` for small accents (e.g., the zen-moment rule or the
     Koch mark stroke); render the footer site name as the spaced
     `n o - e g o` letterform.
   - **est. 2005 stamp** — footer line: `est. 2005 · originally Rails 1.0`,
     plus a build-time "last updated" date (replaces nothing; sits next to
     the copyright).
4. **Family gallery page** (`/family/`):
   - Google sign-in (same OAuth flow style as `/digital-twin-admin/`).
   - Gallery index → gallery view → photo view (GIF thumbnails link to JPG
     full images), mirroring the old thumb/full structure.
   - **Videos section**: the 28 family videos from the old site, playable
     in-page (`<video controls>` with poster frame, signed URL fetched on
     demand), with the original titles/descriptions from the dump's
     `videos` table.
   - Signed-in-but-not-allowlisted users get a clear "not on the list" state.
   - Not listed in the main nav header; reached via a small footer link.

### In scope — backend (`digital_twin`)

1. **Family auth + media endpoints.** Extend the existing admin OAuth pattern
   (`admin_auth.py`) with a *separate* allowlist:
   - `FAMILY_ALLOWED_EMAILS` env var (admin emails implicitly allowed).
     Configured exactly like the admin allowlist: GitHub Actions repository
     variable `TF_FAMILY_ALLOWED_EMAILS` → Terraform `family_allowed_emails`
     variable → Cloud Run env. Never committed to git.
   - Separate signed cookie (`dt_family`) so family sessions never grant
     admin.
   - Endpoints: `GET /family/login`, `GET /family/oauth/callback`,
     `GET /family/me`, `GET /family/galleries`,
     `GET /family/galleries/{name}` (items + short-lived signed GCS URLs),
     `GET /family/videos` (video list with signed video + poster URLs),
     `POST /family/logout`.
   - Media lives in a **private GCS bucket** (no public access, uniform
     bucket-level access). The API returns V4 signed URLs with ~15 min
     expiry; the bucket is never exposed directly.
   - **Tracked access:** every gallery/photo listing emits a structured log
     line (authenticated email, gallery name, timestamp) via the existing
     `structured_logging` module, so access to the private archive is
     auditable in Cloud Logging.
   - Terraform: new bucket + IAM for the Cloud Run service account +
     `family_allowed_emails` variable.
2. **Media migration script.** One-shot script to upload
   `public/images/GIFs/**` and `public/images/JPGs/**` from the old repo to
   the bucket, preserving the gallery-directory structure (~42 MB, 22
   galleries). Gallery and photo metadata comes from the recovered 2006
   MySQL dump (`thorondor.sql.zip.sql`): the script parses the
   `photo_galleries` rows (title, description, `list_order`, `active` —
   inactive galleries like `test` are skipped) and the 418 `photos` rows
   (per-photo caption + thumb/image file stems), producing a
   `manifest.json` stored in the bucket. The dump itself is never
   committed; only the generated manifest of the photo archive metadata.
   **Videos:** the 28 `public/video/*.MPG` files (~122 MB, MPEG-1/2 — not
   playable in modern browsers) are transcoded locally with ffmpeg to MP4
   (H.264/AAC, `+faststart` for streaming) and a poster JPEG is extracted
   per video; both upload under `videos/` in the bucket. Titles and
   descriptions come from the dump's `videos` table (the stale "(5mb)"
   size suffixes in titles are stripped). Original MPGs are not uploaded.
3. **RAG corpus additions.** New markdown files in `rag-sources/`:
   - `personal-history-2005-website.md` — the Rails 1.0 site story, the Koch
     curve identity, zen moments, the no-ego ethos.
   - `education-uccs-coursework.md` — UCCS CS coursework summary extracted
     from the old academics page (compilers, algorithm analysis, graphics,
     numerical computing, OS, automata, databases, architecture).
   - Ingest via the existing "Ingest RAG corpus" GitHub Action / script. No
     API redeploy needed.

### Out of scope

- Comments board, contact form, RBAC admin, or any other 2005 feature.
- Theme redesign — current warm-paper/terracotta theme stays the base.
- Native photo upload/management UI — the archive is migrated once by
  script.
- Removing the panda placeholder posts (kept until real writing exists).

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | Gatsby 5, React 18, Emotion (`css` prop), gatsby-transformer-remark, Jest |
| Backend | Python 3.12, FastAPI, uv, Alembic/PostgreSQL (sessions), GCS, Vertex AI (Gemini + RAG Engine), Terraform, Cloud Run |
| Auth | Google OAuth (google-auth-oauthlib), itsdangerous signed cookies, email allowlists via env |
| Hosting | GitHub Pages (FE, `npm run deploy`), Cloud Run (BE) |

## Commands

Frontend (`ak47.github.io/no_ego`):

```
Dev:    npm run develop
Build:  npm run build
Test:   npm test
Format: npm run format
Deploy: npm run deploy        # gatsby build && gh-pages -d public -b main
```

Backend (`digital_twin`):

```
Setup:  uv sync --extra dev
Test:   uv run pytest -q
Lint:   (per repo CI config — .github/workflows/ci.yml)
Local:  uv run uvicorn digital_twin.main:app --reload  (env from .env.example)
Infra:  terraform -chdir=terraform plan / apply
Ingest: uv run python scripts/ingest_rag_corpus.py … --skip-upload
```

## Project structure (files touched)

Frontend:

```
no_ego/src/styles/theme.js              → add colors.heritage (#FF8003)
no_ego/src/components/layout.js         → header Koch mark; footer: zen moment,
                                          spaced wordmark, est. 2005 + updated stamp
no_ego/src/components/koch-mark.js      → NEW: generated Koch SVG component
no_ego/src/components/zen-moment.js     → NEW: random footer quote
no_ego/src/data/zen-moments.js          → NEW: quotes list
no_ego/src/pages/index.js               → professional landing hero
no_ego/src/pages/about.js               → real copy
no_ego/src/pages/family.js              → NEW: gated gallery (sign-in, index,
                                          gallery, lightbox states)
no_ego/src/utils/familyApi.js           → NEW: family endpoints client
docs/002-site-refresh-spec.md           → this spec
```

Backend:

```
src/digital_twin/family_auth.py         → NEW (modeled on admin_auth.py)
src/digital_twin/family_routes.py       → NEW (galleries + signed URLs)
src/digital_twin/settings.py            → FAMILY_ALLOWED_EMAILS, bucket name
src/digital_twin/main.py                → mount family routes
scripts/migrate_family_media.py         → NEW: one-shot GCS upload + manifest
terraform/…                             → family media bucket + IAM + env
rag-sources/personal-history-2005-website.md   → NEW
rag-sources/education-uccs-coursework.md       → NEW
tests/…                                 → family auth + routes tests
```

## Code style

Match each repo's existing idiom. Frontend example (Emotion `css` prop, theme
tokens, no inline hex):

```jsx
const zenLine = css`
  font-family: ${fonts.body};
  font-size: 0.85rem;
  font-style: italic;
  color: ${colors.inkSubtle};
  border-left: 2px solid ${colors.heritage};
  padding-left: 0.75rem;
`
```

Backend: typed, settings via `get_settings()`, dataclasses, no new framework
patterns — `family_auth.py` should read like `admin_auth.py` with the
allowlist/cookie names swapped.

## Testing strategy

- **FE (Jest):** unit tests for Koch SVG generation (segment count per
  iteration), zen-moment pick logic, `familyApi` client (mirrors
  `digitalTwinApi.test.js`). Visual checks via `npm run develop`.
- **BE (pytest):** family allowlist logic (allowlisted / admin-implicit /
  denied / empty list), cookie separation (family cookie cannot reach admin
  routes and vice versa), gallery listing against a fake GCS client, signed
  URL parameters (expiry, method GET only).
- **Manual gate before deploy:** sign in with an allowlisted account and a
  non-allowlisted account; verify a copied signed URL stops working after
  expiry; verify the bucket rejects unauthenticated direct access.

## Boundaries

- **Always:** run FE `npm test` + `npm run build` and BE `uv run pytest -q`
  before committing; keep all media in the private bucket; keep family and
  admin cookies/allowlists separate; use theme tokens for all colors.
- **Ask first:** Terraform `apply` (creates billable resources), DNS/OAuth
  client changes in GCP console, RAG ingest runs, adding npm/python
  dependencies, deploying to Pages/Cloud Run, deleting or rewriting any
  existing journal post.
- **Never:** commit family photos, secrets, or allowlist emails to either
  repo; make the media bucket public; expose family media URLs without auth;
  publish the old videos; remove the twin chat or admin functionality.

## Success criteria

1. Home page presents a real professional introduction; no mock copy above
   the fold; Lighthouse perf/a11y do not regress from current baseline.
2. About page has real copy; twin chat works unchanged.
3. Koch mark renders in header + footer as inline SVG; zen moment shows a
   random quote per load; footer shows `n o - e g o`, `#FF8003` accent,
   `est. 2005`, and a correct build date.
4. `/family/`: allowlisted Google account sees all 21 active galleries and
   can open full-size photos, and all 28 videos play in-browser (Chrome,
   Safari) with posters; non-allowlisted account is refused; direct GCS
   object GET without a signed URL returns 403; signed URLs expire ≤ 15
   min.
5. Family and admin sessions are non-interchangeable (tested), and every
   gallery access produces a structured log entry with the viewer's email.
6. Twin answers UCCS-coursework and 2005-site questions correctly after
   ingest.
7. All existing FE and BE tests still pass; new code has tests per the
   strategy above.

## Resolved decisions (2026-06-11)

1. **Family allowlist emails** — set as GitHub Actions repository variable
   `TF_FAMILY_ALLOWED_EMAILS`, flowing through Terraform to the Cloud Run
   env, mirroring `TF_ADMIN_ALLOWED_EMAILS`. Actual addresses are set at
   deploy time by Andy; never committed.
2. **Family page discoverability** — small footer link; the page itself is
   the gate.
3. **Landing copy** — Claude drafts from the resume; Andy edits. Draft below.
4. **Family consent** — galleries remain private with
   authenticated, allowlisted, and access-logged viewing only; no public
   exposure. (Tracked-access requirement added to backend scope.)
5. **Gallery titles** — RESOLVED via the recovered MySQL dump at
   `/Users/andy/Documents/rails/thorondor.sql.zip.sql`: real gallery titles,
   descriptions, ordering, active flags, and 418 per-photo captions feed the
   manifest. The dump also recovered all 33 original zen moments (used in
   the footer module).

## Landing hero copy (draft v1 — for Andy's edit)

> **Andrew Koch**
> Staff software engineer
>
> I've been building production software since 1999 — data platforms moving
> 100M+ records a week, payment-critical integrations, and the on-call,
> observability, and incident practices that keep them honest. These days my
> focus is AI-fluent engineering: using the new tools well, with the
> judgment of someone who has carried a pager.
>
> This site has been my sandbox since 2005, when it ran Rails 1.0. The
> About page can answer questions about me — ask it anything.
>
> [Ask the twin] · [LinkedIn] · [GitHub]

Tone target: plain, concrete, lightly self-deprecating — "no ego." No
buzzword stacking; numbers over adjectives.
