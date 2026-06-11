# Feature Specification: nO EgO Site Refresh — Professional Calling Card with 2005 Heritage

**Feature Branch**: `002-site-refresh`

**Created**: 2026-06-11

**Status**: Draft

**Input**: User description: "convert docs/002-site-refresh-spec.md into properly configured/formatted spec"

## Overview

Update no-ego.net into a professional-but-simple business calling card that keeps
the digital-twin chat as its centerpiece and deliberately incorporates identity
elements from the original 2005 site. Add a private, sign-in-gated family photo
and video gallery serving the 2005 media archive to an allowlist of family
emails. Feed the 2005-era personal history into the digital twin's knowledge
corpus so the twin can answer questions about it.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Professional First Impression (Priority: P1)

A visitor (recruiter, client, peer) lands on no-ego.net and immediately sees who
Andy Koch is, what he does, and how to reach him (twin chat, LinkedIn, GitHub).
The site feels personal but professional — no joke placeholder copy anywhere
above the fold or on the About page.

**Why this priority**: This is the core purpose of the refresh — the site is a
professional calling card. Every other story builds on a credible first
impression.

**Independent Test**: Can be fully tested by loading the home and About pages
and verifying real introduction copy, working contact/chat links, and the
absence of placeholder/joke copy — with no dependency on the gallery or
heritage work.

**Acceptance Scenarios**:

1. **Given** a first-time visitor, **When** they load the home page, **Then**
   they see Andy's name, role, a one-paragraph professional positioning
   statement, and links to the twin chat, LinkedIn, and GitHub — with no mock
   or joke copy above the fold.
2. **Given** a visitor on the home page, **When** they scroll below the fold,
   **Then** the journal post list appears below the introduction (existing
   placeholder posts remain until replaced with real writing).
3. **Given** a visitor on the About page, **When** the page loads, **Then**
   the former joke paragraph is replaced with real professional copy, while
   the twin chat, the model-info line, and the LinkedIn warranty joke remain.

---

### User Story 2 - Family Member Browses the Private Archive (Priority: P2)

A family member opens the Family page, signs in with their Google account, and
browses the 2005 photo galleries (Amsterdam, Mt. Harvard, Xmas 2003, …) and the
family videos, all with their original titles, descriptions, and captions.

**Why this priority**: The private archive is the second major deliverable and
the only way family can reach this media; it is independent of the landing-page
work.

**Independent Test**: Sign in with an allowlisted Google account, open the
gallery index, browse one gallery to full-size photos, and play one video —
delivers the full family-archive value on its own.

**Acceptance Scenarios**:

1. **Given** an allowlisted family member, **When** they open the Family page
   and sign in with Google, **Then** they see the gallery index listing all
   active galleries with original titles and descriptions in their original
   order.
2. **Given** a signed-in family member viewing a gallery, **When** they select
   a thumbnail, **Then** the full-size photo opens with its original caption.
3. **Given** a signed-in family member on the videos section, **When** they
   select a video, **Then** it plays in the page with a poster image and its
   original title and description (stale file-size suffixes removed).
4. **Given** any visitor, **When** they scan the main navigation header,
   **Then** the Family page is not listed there — it is reachable only via a
   small footer link.

---

### User Story 3 - Unauthorized Access Is Refused (Priority: P2)

A stranger tries the Family page, signs in with Google, and is politely refused
because their email is not on the allowlist. The media files themselves are not
guessable or publicly fetchable, and every successful archive access is
recorded.

**Why this priority**: Privacy of the family archive is a hard requirement —
the gallery must not ship without it. It is paired with User Story 2 but
independently verifiable.

**Independent Test**: Sign in with a non-allowlisted account and verify the
refusal state; attempt to fetch a media file directly without a valid link and
verify it fails; confirm an access-log entry exists for an allowlisted view.

**Acceptance Scenarios**:

1. **Given** a signed-in user whose email is not on the family allowlist,
   **When** they open the Family page, **Then** they see a clear, polite
   "not on the list" message and no gallery content.
2. **Given** any unauthenticated party, **When** they attempt to fetch a media
   file directly without a valid time-limited link, **Then** the request is
   refused.
3. **Given** a previously issued media link, **When** it is used after its
   expiry window (≤ 15 minutes), **Then** the request is refused.
4. **Given** a valid family session, **When** it is presented to
   admin-only functionality, **Then** access is denied (and vice versa) —
   family and admin sessions are non-interchangeable.
5. **Given** an allowlisted family member viewing a gallery, **When** the
   listing is served, **Then** an audit record is written containing the
   viewer's email, the gallery name, a timestamp, and connection details
   (IP address and browser user agent when available).

---

### User Story 4 - Heritage Identity Elements (Priority: P3)

A visitor notices subtle nods to the site's 2005 origins: the Koch curve mark
beside the header wordmark and in the footer, a random "zen moment" quote in
the footer, the spaced `n o - e g o` letterform, a heritage orange accent, and
an `est. 2005 · originally Rails 1.0` stamp with a build-date line.

**Why this priority**: Identity polish that differentiates the site, but the
calling card and family archive deliver value without it.

**Independent Test**: Load any page and verify the mark, footer quote rotation
across reloads, wordmark, accent color, and stamp render correctly — no
dependency on other stories.

**Acceptance Scenarios**:

1. **Given** any page, **When** it loads, **Then** the Koch curve mark renders
   as a crisp, scalable graphic beside the header wordmark and in the footer.
2. **Given** any page load, **When** the footer renders, **Then** it shows one
   quote selected at random from the 33 recovered original zen moments, with
   legacy markup artifacts cleaned and quotes longer than ~280 characters
   excluded from the rotation (but retained in the source data).
3. **Given** the footer, **When** it renders, **Then** it shows the spaced
   `n o - e g o` letterform, the heritage orange accent, the
   `est. 2005 · originally Rails 1.0` line, and a correct last-updated date
   produced at build time.

---

### User Story 5 - Twin Answers 2005-Era Questions (Priority: P3)

A twin user asks "what did Andy study?" and the twin answers from the UCCS
coursework history (compilers, algorithms, graphics, numerical computing)
ingested from the 2005 site — in addition to all existing corpus content
(resume, profile, project write-ups), which remains in place and unchanged.

**Why this priority**: Enriches the twin but the chat already works; this
augments, replaces nothing.

**Independent Test**: After ingesting the new material, ask the twin
coursework and 2005-site questions and verify correct answers; ask a question
answered by the pre-existing corpus and verify it still answers correctly.

**Acceptance Scenarios**:

1. **Given** the augmented corpus, **When** a user asks about Andy's
   university coursework, **Then** the twin answers correctly from the UCCS
   coursework history.
2. **Given** the augmented corpus, **When** a user asks about the 2005 site,
   the Koch curve identity, or the no-ego ethos, **Then** the twin answers
   from the ingested personal-history material.
3. **Given** the augmented corpus, **When** a user asks a question covered by
   the pre-existing corpus, **Then** the answer quality is unchanged.

---

### Edge Cases

- Family allowlist is empty or unset: no family member can sign in, but
  admin emails remain implicitly allowed; the refusal state must still be
  polite and clear.
- User cancels or denies the Google sign-in consent screen: they return to the
  signed-out Family page state without an error wall.
- A previously copied media link is shared or reused after expiry: the fetch
  fails; the page recovers by issuing fresh links on demand.
- The backend service is unavailable or misconfigured: the Family page and twin
  chat degrade gracefully with a clear, user-friendly fallback (no blank or
  broken states).
- Inactive galleries from the original archive (e.g., the old `test` gallery)
  never appear in the index.
- A photo has no caption in the recovered metadata: it displays without a
  caption rather than with placeholder text.
- Videos must play in current Chrome and Safari; the original archived format
  is not browser-playable, so the migrated copies must be in a format both
  browsers play natively.
- A zen moment contains legacy embedded markup or escape artifacts: the
  displayed text is cleaned; raw artifacts never render.

## Requirements *(mandatory)*

### Functional Requirements

**Professional calling card**

- **FR-001**: The home page MUST present a real professional introduction —
  name, role, one-paragraph positioning — with links to the twin chat,
  LinkedIn, and GitHub, and no placeholder or joke copy above the fold.
- **FR-002**: The journal post list MUST remain on the home page below the
  introduction; existing placeholder posts are retained (flagged, not deleted)
  until real writing replaces them.
- **FR-003**: The About page MUST replace the joke paragraph with real
  professional copy while preserving the twin chat, the model-info line, and
  the LinkedIn warranty joke.

**Heritage elements**

- **FR-004**: The site MUST display a Koch curve mark — generated
  programmatically as a scalable graphic, not a copy of the old raster image —
  beside the header wordmark and in the footer. No animation is required.
- **FR-005**: The footer MUST display one zen moment selected at random per
  page load from the 33 recovered original quotes; quote text MUST be cleaned
  of legacy markup and escape artifacts, and quotes longer than ~280 characters
  MUST be excluded from the rotation while remaining in the source data.
- **FR-006**: The footer MUST render the spaced `n o - e g o` letterform, use
  the 2005 heritage orange (`#FF8003`) as a small accent via the site's theme,
  and show `est. 2005 · originally Rails 1.0` plus a build-time last-updated
  date alongside the existing copyright.

**Family archive access**

- **FR-007**: The Family page MUST require Google sign-in and admit only
  accounts whose email is on the family allowlist; admin emails are implicitly
  allowed.
- **FR-008**: The family allowlist MUST be configurable at deploy time and
  MUST never be committed to a repository; it MUST be separate from the admin
  allowlist.
- **FR-009**: Allowlisted users MUST be able to browse a gallery index (active
  galleries only, in their original order, with original titles and
  descriptions), open a gallery of thumbnails, and view full-size photos with
  their original captions.
- **FR-010**: Allowlisted users MUST be able to play all 28 family videos
  in-page, each with a poster image and its original title and description
  (stale "(5mb)"-style size suffixes removed).
- **FR-011**: Signed-in users not on the allowlist MUST see a clear, polite
  refusal state instead of gallery content.
- **FR-012**: The Family page MUST NOT appear in the main navigation header;
  it is reached via a small footer link.

**Family archive privacy & audit**

- **FR-013**: All family media MUST be stored privately; direct retrieval
  without a valid time-limited link MUST fail, and issued links MUST expire
  within 15 minutes.
- **FR-014**: Family sessions and admin sessions MUST be separate and
  non-interchangeable: a family session never grants admin access and vice
  versa.
- **FR-015**: Every gallery or photo listing access MUST produce an audit
  record containing the authenticated email, the gallery name, a timestamp,
  and available connection details (client IP address, browser user agent,
  referer when present, with geolocation derivable from the IP), retrievable
  by the site owner. Missing connection details MUST NOT block access or
  logging.

**Archive migration**

- **FR-016**: A one-time migration MUST move the 2005 photo archive
  (22 galleries, 418 photos, ~42 MB) and the 28 family videos into private
  storage, preserving the gallery structure and attaching titles,
  descriptions, ordering, active flags, and per-photo captions recovered from
  the 2006 database dump; inactive galleries are skipped.
- **FR-017**: The migrated videos MUST be converted to a format playable
  natively in current Chrome and Safari, each with an extracted poster image;
  the original non-playable files are not published.
- **FR-018**: The recovered database dump itself MUST never be committed; only
  derived metadata (the archive manifest and the cleaned zen-moment quotes) may
  enter a repository.

**Twin knowledge**

- **FR-019**: The twin's knowledge corpus MUST be augmented with the 2005-site
  personal history (site story, Koch curve identity, zen moments, no-ego
  ethos) and the UCCS coursework summary; all existing corpus content remains
  in place and unchanged.

### Key Entities

- **Gallery**: A named collection of photos from the 2005 archive — title,
  description, display order, active flag. 22 recovered; only active galleries
  (21) are shown.
- **Photo**: An image in a gallery — thumbnail and full-size versions plus an
  optional original caption (418 recovered).
- **Video**: A family video — playable file, poster image, original title and
  description (28 recovered).
- **Zen Moment**: A short quote with attribution (Thoreau, Watts, Chomsky,
  Kerouac, Einstein, Turing, Snyder, Monty Python, et al.) — 33 recovered;
  cleaned text plus a length-based rotation eligibility.
- **Family Allowlist Entry**: An email address permitted to view the family
  archive; maintained outside the repository, separate from the admin
  allowlist.
- **Access Log Entry**: An audit record of an archive view — viewer email,
  gallery name, timestamp, plus connection details when available (client IP
  address, browser user agent, referer; geolocation derivable from the IP).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can identify who Andy is, what he does, and
  how to reach him from the home page without scrolling; no placeholder or
  joke copy appears above the fold or on the About page.
- **SC-002**: Page performance and accessibility scores do not regress from
  the current pre-refresh baseline.
- **SC-003**: An allowlisted family member can sign in and reach a full-size
  photo in any of the 21 active galleries, and play any of the 28 videos
  in-browser (Chrome and Safari) with poster images.
- **SC-004**: A non-allowlisted signed-in account is refused 100% of the time;
  direct media retrieval without a valid link fails 100% of the time; issued
  media links stop working within 15 minutes.
- **SC-005**: 100% of gallery accesses produce an audit record with the
  viewer's email, gallery name, timestamp, and available connection details
  (IP address, browser user agent).
- **SC-006**: The twin correctly answers questions about UCCS coursework and
  the 2005 site after ingest, and answers to pre-existing corpus questions are
  unchanged.
- **SC-007**: The twin chat and all other existing site functionality work
  unchanged after the refresh.

## Out of Scope

- Comments board, contact form, role-based admin UI, or any other 2005 feature
  not listed above.
- Theme redesign — the current warm-paper/terracotta theme stays the base.
- Native photo upload/management UI — the archive is migrated once by script.
- Removing the panda placeholder journal posts (kept until real writing
  exists).
- Public exposure of any family media, in any form.

## Assumptions

- The source material is available locally: the 2005 site archive (photos,
  videos) and the recovered 2006 database dump providing gallery, photo,
  video, and zen-moment metadata.
- Actual allowlist email addresses are supplied at deploy time by the site
  owner and never committed.
- The hero introduction copy exists as an approved draft (v1) pending the site
  owner's final edit; shipping with the draft is acceptable until edited.
- The existing admin sign-in flow is the model for the family sign-in
  experience; family consent was resolved by keeping galleries private,
  allowlisted, and access-logged with no public exposure.
- The Family page's only discoverability is the footer link; the sign-in gate
  itself is the access control, so being discovered is acceptable.
- This feature spans two repositories (this site and the digital-twin backend
  service); the backend work is part of this feature's scope and is specified
  here at the requirement level.
- Detailed implementation notes (endpoints, file layout, commands, migration
  mechanics) from the original draft remain available in
  `docs/002-site-refresh-spec.md` and `docs/002-site-refresh-plan.md` as
  planning input.

## Dependencies

- Google OAuth sign-in availability (already used by the existing admin flow).
- The digital-twin backend service and its existing knowledge-corpus ingest
  process.
- The 2005 media archive and recovered database dump on the site owner's
  machine.
