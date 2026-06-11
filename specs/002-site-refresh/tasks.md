# Tasks: nO EgO Site Refresh — Professional Calling Card with 2005 Heritage

**Input**: Design documents from `/specs/002-site-refresh/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included — the spec/plan define an explicit testing strategy (Jest FE, pytest BE). Test tasks precede their implementation tasks.

**Organization**: Tasks are grouped by user story (US1–US5 from spec.md). Stories map to plan streams: US1→Stream A (copy), US4→Stream A (heritage), US2/US3→Streams C+B (family BE+FE), US5→Stream D (RAG).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)

## Path Conventions

- **Frontend (this repo)**: `no_ego/src/…`, `no_ego/gatsby-config.js`; commands run in `no_ego/` with Yarn (research.md R9)
- **Backend (`digital_twin:` prefix)**: repo at `/Users/andy/werk/my_gits/projects/digital_twin` — `src/digital_twin/…`, `scripts/…`, `terraform/…`, `rag-sources/…`, `tests/…`
- Jest tests colocate with their module per existing repo convention (e.g. `digitalTwinApi.test.js`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm both toolchains are green pre-change and capture the baselines the success criteria compare against

- [ ] T001 Verify FE toolchain baseline: `yarn install && yarn test && yarn build` green in `no_ego/`
- [ ] T002 [P] Verify BE toolchain baseline: `uv sync --extra dev && uv run pytest -q` green in digital_twin repo
- [ ] T003 [P] Capture pre-refresh Lighthouse performance/accessibility baseline for `/` and `/about/` (local `yarn build && yarn serve`); record scores in `specs/002-site-refresh/baseline.md` (needed for SC-002 at V1/V6)
- [ ] T004 [P] Inventory source material: confirm old repo at `/Users/andy/Documents/rails/no_ego` (gallery dirs under `public/images/{GIFs,JPGs}/`, 28 `public/video/*.MPG`) and dump at `/Users/andy/Documents/rails/thorondor.sql.zip.sql` (`photo_galleries`, `photos`, `videos`, `zen_moments` tables); record counts in `specs/002-site-refresh/baseline.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**No foundational tasks.** The four plan streams are mutually independent (plan.md → Implementation Streams); there is no shared code that blocks every story. Cross-repo sequencing that matters (B-after-C2, same-file `layout.js` ordering) is captured in Dependencies below.

**Checkpoint**: After Phase 1, all five user stories may start (subject to per-story dependencies below)

---

## Phase 3: User Story 1 - Professional First Impression (Priority: P1) 🎯 MVP

**Goal**: Real hero + About copy; no joke/placeholder copy above the fold; twin chat untouched (FR-001..003)

**Independent Test**: Load `/` and `/about/` — real introduction, working twin/LinkedIn/GitHub links, journal below fold, About joke paragraph replaced, chat + model-info + warranty joke intact. No dependency on any other story.

### Implementation for User Story 1

- [ ] T005 [P] [US1] Rework hero in `no_ego/src/pages/index.js`: draft v1 copy from spec (name, role, positioning paragraph, links to twin chat / LinkedIn / GitHub); move journal list below the fold under a "Journal & experiments" heading; panda placeholder posts untouched (FR-001, FR-002)
- [ ] T006 [P] [US1] Replace the joke paragraph in `no_ego/src/pages/about.js` with real professional copy; preserve twin chat, model-info line, and LinkedIn warranty joke (FR-003)
- [ ] T007 [US1] Update/add Jest coverage for the changed pages per existing repo convention (assert hero copy renders, no placeholder text above fold, About retains chat component) in `no_ego/src/pages/`
- [ ] T008 [US1] Verify checkpoint V1 (copy half): `yarn test && yarn build` green; visual pass via `yarn develop`; Lighthouse ≥ T003 baseline. **GATE: Andy approves hero copy** (may land with draft v1 per spec assumption)

**Checkpoint**: US1 fully functional and shippable on its own — this is the MVP

---

## Phase 4: User Story 2 - Family Member Browses the Private Archive (Priority: P2)

**Goal**: Google sign-in → gallery index → photos with captions → in-page videos, backed by private bucket + signed URLs (FR-007..010, FR-012, FR-016..018)

**Independent Test**: Allowlisted account signs in on `/family/`, browses a gallery to a full-size photo, plays a video (quickstart → V4 step 1).

### Tests for User Story 2 (write first, ensure they FAIL)

- [ ] T009 [P] [US2] pytest allowlist matrix (allowlisted / admin-implicit / denied / empty list, case-insensitive match) in digital_twin: `tests/test_family_auth.py`
- [ ] T010 [P] [US2] pytest family routes against fake GCS client: gallery index order/fields, single gallery items, videos list, signed-URL parameters (V4, method GET only, expiry ≤ 15 min), 404 unknown gallery — per `contracts/family-api.md` — in digital_twin: `tests/test_family_routes.py`
- [ ] T011 [P] [US2] pytest dump-parse/reconciliation unit tests with a small SQL fixture (active-flag skip, title suffix strip, DB-orphan drop + report, file-orphan append caption-less, thumb fallback to full) in digital_twin: `tests/test_migrate_family_media.py`

### Implementation for User Story 2 — backend (Stream C)

- [ ] T012 [US2] Add `family_allowed_emails` + `family_media_bucket` settings in digital_twin: `src/digital_twin/settings.py` (env-sourced via `get_settings()`, documented, never committed)
- [ ] T013 [US2] Implement `family_auth.py` modeled on `admin_auth.py`: Google OAuth helpers, `dt_family` cookie with distinct itsdangerous salt, `SameSite=None; Secure; HttpOnly`, admin emails implicitly allowed — in digital_twin: `src/digital_twin/family_auth.py` (makes T009 pass; research.md R6, R8)
- [ ] T014 [US2] Implement `family_routes.py` per `contracts/family-api.md` (login, oauth/callback, me, galleries, galleries/{name}, videos, logout) with V4 signed URLs via IAM signBlob impersonated signing (research.md R1); mount router in `src/digital_twin/main.py` — in digital_twin: `src/digital_twin/family_routes.py` (makes T010 pass)
- [ ] T015 [US2] Implement one-shot migration script in digital_twin: `scripts/migrate_family_media.py` — parse dump (CLI `--dump` path, never committed), reconcile filesystem per research.md R7, transcode 28 MPGs with ffmpeg per research.md R4 (+ poster at ~1 s), idempotent upload to `galleries/`+`videos/`, write `manifest.json` per `contracts/media-manifest.md`, print reconciliation report (makes T011 pass)
- [ ] T016 [US2] Terraform in digital_twin: `terraform/` — private bucket (uniform bucket-level access, no public IAM), Cloud Run SA `roles/storage.objectViewer` + `iam.serviceAccountTokenCreator` on itself, `family_allowed_emails` variable wired to Cloud Run env, `TF_FAMILY_ALLOWED_EMAILS` in `.github/workflows/terraform.yml`
- [ ] T017 [US2] **GATE (Andy)**: review `terraform plan` output, apply, add `/family/oauth/callback` redirect URI to the Google OAuth client in GCP console, set `TF_FAMILY_ALLOWED_EMAILS` values
- [ ] T018 [US2] Run migration against the new bucket; verify checkpoint V3: report counts match T004 inventory (21 active galleries, 418 photos reconciled, 28 videos + 28 posters), sample transcodes play in Chrome + Safari, rerun is a no-op (idempotent)

### Implementation for User Story 2 — frontend (Stream B, may start once T014's contract is merged, against a local backend)

- [ ] T019 [P] [US2] Jest tests for the family API client (mirrors `digitalTwinApi.test.js`: base URL config, `credentials: 'include'`, per-endpoint shapes, error mapping 401/403/404) in `no_ego/src/utils/familyApi.test.js`
- [ ] T020 [US2] Implement `no_ego/src/utils/familyApi.js` mirroring `digitalTwinApi.js` (makes T019 pass)
- [ ] T021 [US2] Implement `no_ego/src/pages/family.js`: state machine signed-out (Google button → `/family/login`) → index (21 galleries, titles/descriptions) → gallery grid (thumbs) → full-image view (caption) → videos section (poster grid, `<video controls>`, signed URL fetched at open); service-unavailable fallback per Principle V; Emotion `css` + theme tokens
- [ ] T022 [US2] Add small family footer link in `no_ego/src/components/layout.js` (FR-012; coordinate with T037 which restructures the same footer)
- [ ] T023 [US2] Verify US2 happy path end-to-end (quickstart → V4 step 1): allowlisted login → index → photo → video playback; `yarn test && yarn build` green

**Checkpoint**: US2 delivers the full family-archive value for allowlisted users

---

## Phase 5: User Story 3 - Unauthorized Access Is Refused (Priority: P2)

**Goal**: Polite refusal for non-allowlisted accounts; media unreachable without fresh signed URLs; family/admin sessions non-interchangeable; every access audited with connection details (FR-011, FR-013..015)

**Independent Test**: Non-allowlisted sign-in shows "not on the list"; direct bucket GET → 403; expired signed URL refused; audit entries in Cloud Logging (quickstart → V4 steps 2–5). Depends on US2's infrastructure existing, but verifies its own distinct requirements.

### Tests for User Story 3 (write first where logic is new)

- [ ] T024 [P] [US3] pytest cookie non-interchangeability both directions (valid `dt_family` → admin endpoint = 401; valid admin cookie → family content endpoints = 401) in digital_twin: `tests/test_family_auth.py`
- [ ] T025 [P] [US3] pytest content endpoints return 403 for authenticated non-allowlisted email and with empty/unset allowlist (admin-implicit still passes); `/family/me` reports `allowed: false`; callback still sets cookie for denied emails — in digital_twin: `tests/test_family_routes.py`
- [ ] T026 [P] [US3] pytest audit-log emission on every listing: fields `email`, `resource`, `timestamp`, `ip` (first `X-Forwarded-For` hop), `user_agent` (truncated 256), `referer`; nullable fields never block request or log (data-model.md → Access Log Entry) — in digital_twin: `tests/test_family_routes.py`

### Implementation for User Story 3

- [ ] T027 [US3] Implement structured audit logging in digital_twin: `src/digital_twin/family_routes.py` via existing `structured_logging` module, emitting the data-model.md Access Log Entry fields on `/family/galleries`, `/family/galleries/{name}`, `/family/videos` (makes T026 pass; T024/T025 should already pass from T013/T014 — fix there if not)
- [ ] T028 [US3] Implement signed-in-denied "not on the list" state in `no_ego/src/pages/family.js` (driven by `/family/me` → `allowed: false`), with sign-out affordance; Jest test for the denied state (FR-011)
- [ ] T029 [US3] Verify quickstart → V4 steps 2–5 against deployed stack: non-allowlisted refusal; `curl` direct bucket object + `manifest.json` → 403; signed URL refused after 15 min; Cloud Logging shows entries with email/resource/timestamp/IP/user-agent and geo resolvable from IP

**Checkpoint**: Privacy/audit requirements proven; US2+US3 together complete the family archive

---

## Phase 6: User Story 4 - Heritage Identity Elements (Priority: P3)

**Goal**: Koch mark, footer zen moments, spaced wordmark, heritage accent, est. 2005 + build-date stamp (FR-004..006)

**Independent Test**: Load any page — mark in header+footer, quote varies across reloads with no raw HTML, wordmark/accent/stamp/build date correct. No dependency on other stories (touches `layout.js` after T022 if US2 ran first).

### Tests for User Story 4 (write first, ensure they FAIL)

- [ ] T030 [P] [US4] Jest Koch generator tests (segment count = 4^n per iteration, well-formed SVG path data) in `no_ego/src/components/koch-mark.test.js`
- [ ] T031 [P] [US4] Jest zen-moment tests: data cleanliness (33 entries; none match `/<[a-z]+/i` or contain backslash escapes), pick logic uniform over rotation pool, rotation excludes `long: true` in `no_ego/src/components/zen-moment.test.js`

### Implementation for User Story 4

- [ ] T032 [P] [US4] Add `colors.heritage` (`#FF8003`) to `no_ego/src/styles/theme.js`
- [ ] T033 [P] [US4] Extract + clean the 33 `zen_moments` rows from the dump into `no_ego/src/data/zen-moments.js` (strip `<i>`/`<br/>`, unescape SQL artifacts, keep attribution, flag > ~280 chars `long: true`) per research.md R10 (helps T031 pass)
- [ ] T034 [US4] Implement `no_ego/src/components/koch-mark.js`: recursive Koch segment subdivision → inline SVG path, stroke `colors.heritage`, size prop (makes T030 pass; research.md R5)
- [ ] T035 [US4] Implement `no_ego/src/components/zen-moment.js`: random pick on mount only (SSR-safe — render nothing until mounted), muted italic line with heritage-accent rule (makes T031 pass; research.md R2)
- [ ] T036 [P] [US4] Add `buildTime` to `siteMetadata` in `no_ego/gatsby-config.js` (research.md R3)
- [ ] T037 [US4] Restructure `no_ego/src/components/layout.js`: Koch mark beside header wordmark; footer = zen moment + spaced `n o - e g o` wordmark + `est. 2005 · originally Rails 1.0` + build date (GraphQL `siteMetadata.buildTime`) + existing copyright + family link slot (theme tokens only; coordinates with T022)
- [ ] T038 [US4] Verify checkpoint V1 (full): `yarn test && yarn build` green; reload several times in `yarn develop` to see quote rotation; Lighthouse ≥ T003 baseline

**Checkpoint**: Heritage identity complete; all FE stories done

---

## Phase 7: User Story 5 - Twin Answers 2005-Era Questions (Priority: P3)

**Goal**: RAG corpus augmented with 2005-site history + UCCS coursework; existing corpus untouched (FR-019)

**Independent Test**: Ask the twin coursework/2005-site questions → correct answers; ask a pre-existing-corpus question → unchanged answer (quickstart → V5).

### Implementation for User Story 5

- [ ] T039 [P] [US5] Write digital_twin: `rag-sources/personal-history-2005-website.md` (Rails 1.0 story, Koch curve identity, zen moments, no-ego ethos, Colorado Springs era; source: old repo views)
- [ ] T040 [P] [US5] Write digital_twin: `rag-sources/education-uccs-coursework.md` (compilers, algorithm analysis, graphics, numerical computing, OS, automata, databases, architecture; source: old academics page + resume education)
- [ ] T041 [US5] **GATE (Andy)**: review both files — content feeds the public twin
- [ ] T042 [US5] Run existing ingest (GitHub Action or `uv run python scripts/ingest_rag_corpus.py …`); no API redeploy
- [ ] T043 [US5] Verify checkpoint V5: twin answers "what did Andy study?" and "what was this site in 2005?" correctly; a pre-existing-corpus question (e.g. resume content) answers unchanged

**Checkpoint**: All five user stories independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T044 [P] Document new BE env vars (`FAMILY_ALLOWED_EMAILS`, `FAMILY_MEDIA_BUCKET`) in digital_twin README / `.env.example`; confirm no FE env additions needed (`GATSBY_DIGITAL_TWIN_API_BASE` reused, already documented in `no_ego/README.md`)
- [ ] T045 [P] `yarn format` in `no_ego/` and final FE cleanup (theme tokens everywhere, no stray inline hex)
- [ ] T046 Full suites green: `yarn test && yarn build` in `no_ego/`; `uv run pytest -q` in digital_twin
- [ ] T047 Ship checkpoint V6: deploy FE via the **Deploy Pages** GitHub Actions workflow; full manual quickstart pass (V1 + V4 + V5) on https://no-ego.net

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: empty — stories may start after Setup
- **US1 (Phase 3)**: independent — MVP, ship first
- **US2 (Phase 4)**: BE tasks independent; FE tasks T019–T023 need T014's contract merged (local backend OK before T017's Terraform gate); T018 needs T015–T017
- **US3 (Phase 5)**: needs US2's T013/T014 (auth+routes exist) and, for T029, T017/T018 (deployed bucket)
- **US4 (Phase 6)**: independent; T037 touches `layout.js` — sequence with T022 (whichever runs second rebases)
- **US5 (Phase 7)**: independent; T042 gated by T041
- **Polish (Phase 8)**: after all desired stories

### Story completion order

```
Setup ─┬─ US1 (P1, MVP) ──────────────────────────┐
       ├─ US2-BE → [GATE T017] → T018 ─┐          │
       │       └─ US2-FE (after T014) ─┴─ US3 ────┤→ Polish (V6)
       ├─ US4 ────────────────────────────────────┤
       └─ US5 → [GATE T041] → T042–T043 ──────────┘
```

### Within Each User Story

- Tests written first and failing before their implementation task
- Settings/auth before routes; routes (contract) before FE client; client before page
- Gates requiring Andy: T008 (hero copy), T017 (Terraform apply + OAuth URI + allowlist values), T041 (RAG content)

### Parallel Opportunities

- Phase 1: T002, T003, T004 in parallel after/alongside T001
- Streams in parallel sessions: US1, US2-BE, US4, US5 can all proceed simultaneously after Setup
- Within US2: T009, T010, T011 together; T019 alongside BE work once contract is fixed
- Within US3: T024, T025, T026 together
- Within US4: T030, T031 together; then T032, T033, T036 together
- Within US5: T039, T040 together

## Parallel Example: User Story 2

```bash
# Failing tests first, in parallel (different files):
Task: "pytest allowlist matrix in digital_twin tests/test_family_auth.py"        # T009
Task: "pytest family routes + signed-URL params in tests/test_family_routes.py"  # T010
Task: "pytest dump-parse/reconciliation in tests/test_migrate_family_media.py"   # T011

# After T014 merges the contract, FE proceeds in parallel with BE infra:
Task: "Jest familyApi tests in no_ego/src/utils/familyApi.test.js"               # T019
Task: "Terraform bucket + IAM in digital_twin terraform/"                        # T016
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 (Setup, incl. Lighthouse baseline)
2. Phase 3 (US1: hero + About) → validate independently (T008) → **deployable MVP**: the site is already a credible calling card

### Incremental Delivery

1. US1 → deploy (MVP)
2. US4 → deploy (heritage polish — pure FE, low risk)
3. US2-BE → gate → migrate → US2-FE → US3 verification → deploy (family archive)
4. US5 → gate → ingest → verify
5. Polish + V6 ship

### Parallel Sessions Strategy

Per plan.md: Streams A (US1+US4), C (US2-BE), D (US5) in parallel sessions; B (US2-FE) joins once the T014 contract merges. Human gates (T008, T017, T041) are the only cross-session sync points.

---

## Notes

- PR slicing (plan.md): FE PR1 = US1+US4, FE PR2 = US2-FE+US3-FE; BE PR1 = T012–T015 + tests, BE PR2 = T016, BE PR3 = US5
- Never commit: dump file, allowlist emails, family media, secrets (FR-018, Boundaries)
- Commit after each task or logical group; stop at any checkpoint to validate the story independently
