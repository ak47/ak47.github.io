# Pre-Refresh Baselines (T003 / T004)

**Captured**: 2026-06-11, local `yarn build` + `gatsby serve`, Lighthouse 12
(headless new Chrome), categories performance + accessibility. Compare V1/V6
runs against these (SC-002: must not regress).

## Lighthouse (T003)

| Page | Performance | Accessibility | Notes |
|---|---|---|---|
| `/` | 90 | 92 | clean run |
| `/about/` | n/a (see note) | 96 | perf score uncomputable locally — Lighthouse 12 trace-engine crash on this page (twin chat widget trace); raw metrics: FCP 2.9 s, CLS 0, Speed Index 3.0 s |

Note: for `/about/` perf comparisons, use the raw metric values above (FCP,
CLS, Speed Index) or re-measure with the same Lighthouse version; the
category score could not be computed in headless on the baseline machine.

## Source material inventory (T004)

| Item | Count / Size | Source |
|---|---|---|
| Gallery dirs (GIFs) | 22 | `~/Documents/rails/no_ego/public/images/GIFs/` |
| Gallery dirs (JPGs) | 22 | `…/public/images/JPGs/` |
| GIF files (thumbs) | 460 | |
| JPG files (full) | 469 | |
| Images size | 42 MB | |
| Video files | 28 (25 `.MPG` + 3 lowercase `.mpg`) | `…/public/video/` — **migration must match extension case-insensitively** |
| Videos size | 122 MB | |
| Dump `photo_galleries` rows | 22 | `~/Documents/rails/thorondor.sql.zip.sql` |
| Dump `photos` rows | 418 | |
| Dump `videos` rows | 28 | path, title, description, stem, date columns confirmed |
| Dump `zen_moments` rows | 33 | |

All dump counts match spec expectations (22 galleries, 418 photos, 28 videos,
33 zen moments). Photo file counts (460/469) exceed the 418 DB rows —
file-orphans expected; reconciliation per research.md R7.

## Toolchain baselines (T001 / T002)

- FE: `yarn install` + `yarn test` (1 suite, 7 tests) + `yarn build` (87 s) — green
- BE: `uv sync --extra dev` + `uv run pytest -q` (54 passed) — green
