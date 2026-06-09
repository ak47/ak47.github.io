<!--
Sync Impact Report
- Version change: unratified template → 1.0.0
- Modified principles: (initial ratification — no prior principles)
  - I. Simplicity Over Perfection
  - II. Static-First Delivery
  - III. Incremental, Independently Testable Stories
  - IV. Build & Deploy Integrity
  - V. Graceful External Integration
- Added sections: Technology Stack & Structure; Spec-Driven Development Workflow
- Removed sections: none
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (Constitution Check gates)
  - ✅ .specify/templates/tasks-template.md (no_ego/ path conventions)
  - ✅ .specify/templates/spec-template.md (no changes required)
  - ✅ .specify/templates/checklist-template.md (no changes required)
  - ✅ no_ego/README.md (no changes required — deployment docs already present)
  - ✅ .cursor/rules/specify-rules.mdc (no changes required — plan-driven context)
- Follow-up TODOs: none
-->

# nO EgO Site Constitution

## Core Principles

### I. Simplicity Over Perfection

Every change MUST be the smallest correct diff that solves the stated problem.
Features MUST NOT add speculative abstractions, premature generalization, or
organizational-only code. Complexity beyond what the spec requires MUST be
justified in the plan's Complexity Tracking table before implementation begins.

**Rationale**: The site exists to explore ideas without perfectionism blocking
good work. Small, focused changes are easier to review, deploy, and revert.

### II. Static-First Delivery

The site is a Gatsby 5 static site. Application source lives under `no_ego/`.
Data and content SHOULD be resolved at build time unless runtime interactivity
is an explicit requirement. Client-side JavaScript MUST only be added when it
delivers direct user-facing value (for example, the digital-twin chat widget).

**Rationale**: Static generation keeps the site fast, cheap to host on GitHub
Pages, and simple to reason about.

### III. Incremental, Independently Testable Stories

Features MUST be decomposed into prioritized user stories (P1, P2, P3…) that
each deliver standalone value. Every story MUST define independent acceptance
criteria so it can be implemented, verified, and demonstrated on its own. Work
MUST follow MVP-first delivery: complete P1 before lower-priority stories unless
the plan documents a justified exception.

**Rationale**: Independent stories prevent large risky changes and keep each
deploy increment meaningful.

### IV. Build & Deploy Integrity

`yarn build` in `no_ego/` MUST succeed before any change merges to `main`.
Deployment MUST continue to flow through the GitHub Actions **Deploy Pages**
workflow. Environment-specific values (for example `GATSBY_DIGITAL_TWIN_API_BASE`)
MUST be documented in `no_ego/README.md` and supplied via `.env.development`
locally or GitHub Actions variables in CI — never committed as secrets.

**Rationale**: A green build and a working deploy pipeline are the minimum bar
for shipping a static site safely.

### V. Graceful External Integration

Integrations with external services (for example the digital-twin Cloud Run API)
MUST degrade gracefully when the service is unavailable or misconfigured. The UI
MUST show a clear, user-friendly fallback instead of broken or blank states.
API base URLs and session identifiers MUST use documented `GATSBY_*` environment
variables; credentials and secrets MUST NOT be stored in the repository.

**Rationale**: The site must remain usable even when optional external features
fail, and configuration must stay portable across local and production builds.

## Technology Stack & Structure

- **Runtime**: Node.js >= 18, Yarn classic (v1), Gatsby 5, React 18
- **Styling**: Emotion, Typography.js (via `gatsby-plugin-typography`)
- **Formatting**: Prettier (`yarn format` in `no_ego/`)
- **Source layout**:
  - `no_ego/src/pages/` — routes and MD content
  - `no_ego/src/components/` — reusable UI
  - `no_ego/src/utils/` — shared helpers
  - `no_ego/gatsby-config.js` — site metadata and plugins
- **Deployment**: GitHub Pages via `.github/workflows/deploy-pages.yml`; artifact
  path `no_ego/public`
- **Feature documentation**: Spec Kit artifacts under `specs/<feature>/`

## Spec-Driven Development Workflow

1. **Specify** — `/speckit-specify` produces `specs/<feature>/spec.md` with
   prioritized user stories and acceptance scenarios.
2. **Plan** — `/speckit-plan` produces `plan.md` with a Constitution Check
   gate that MUST pass before implementation.
3. **Tasks** — `/speckit-tasks` produces dependency-ordered `tasks.md` grouped
   by user story.
4. **Implement** — `/speckit-implement` executes tasks; verify locally with
   `yarn develop` and `yarn build` in `no_ego/`.
5. **Review** — Changes MUST be reviewed against this constitution before merge.

Runtime agent guidance: read the current feature plan at the path referenced in
`.cursor/rules/specify-rules.mdc` when implementing.

## Governance

This constitution supersedes ad-hoc practices for features managed through Spec
Kit. Amendments MUST be made via `/speckit-constitution`, include a version
bump with rationale, and propagate consistency updates to dependent templates.

**Versioning policy**:

- **MAJOR**: Removing or redefining a core principle incompatibly with prior work
- **MINOR**: Adding a principle or materially expanding governance guidance
- **PATCH**: Clarifications, wording fixes, non-semantic refinements

**Compliance**: Every `plan.md` Constitution Check section MUST list pass/fail
for each principle. Violations MUST be documented in Complexity Tracking with
an explicit justification. PRs and `/speckit-analyze` reviews MUST treat
constitution MUST statements as non-negotiable unless amended here first.

**Version**: 1.0.0 | **Ratified**: 2026-06-09 | **Last Amended**: 2026-06-09
