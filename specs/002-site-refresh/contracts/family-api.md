# Contract: Family API (digital_twin backend)

**Base**: existing Cloud Run service (FE reads base URL from
`GATSBY_DIGITAL_TWIN_API_BASE`). All endpoints under `/family/`.
All browser calls use `credentials: 'include'`. CORS reuses the existing
`cors_allowed_origins` configuration.

**Auth model**: signed `dt_family` cookie (HttpOnly, Secure, SameSite=None).
Allowed = email ∈ `FAMILY_ALLOWED_EMAILS` ∪ admin allowlist.

**Audit**: every content listing (`/family/galleries`,
`/family/galleries/{name}`, `/family/videos`) emits a structured access log
entry — email, resource, timestamp, client IP, user agent, referer (see
data-model.md → Access Log Entry). Missing connection headers never block the
request.

**Error envelope** (non-2xx): `{ "detail": "<human-readable reason>" }`
(FastAPI default).

| Status | Meaning |
|---|---|
| 401 | No/invalid `dt_family` cookie |
| 403 | Authenticated but not allowlisted |
| 404 | Unknown gallery name |

---

## GET /family/login

Starts Google OAuth. Browser navigation (not XHR).

- **Response**: `302` redirect to Google consent screen.

## GET /family/oauth/callback

OAuth redirect target (must be registered on the Google OAuth client —
manual console step, gate C4).

- **Query**: standard OAuth `code`, `state`.
- **Success**: sets `dt_family` cookie; `302` → FE `/family/` page.
  The cookie is set even for non-allowlisted emails (so `/family/me` can
  report the denied state); allowlist is enforced per-request on content
  endpoints.
- **Failure** (denied consent, bad state): `302` → FE `/family/` page with no
  cookie set (FE shows signed-out state).

## GET /family/me

Session probe for the FE state machine.

- **200**: `{ "email": "person@example.com", "allowed": true | false }`
- **401**: no valid cookie.

## GET /family/galleries

Gallery index. **Requires allowed session.** Emits access log entry
(`resource: "index"`).

- **200**:

```json
{
  "galleries": [
    {
      "name": "amsterdam",
      "title": "Amsterdam",
      "description": "…",
      "count": 24
    }
  ]
}
```

Ordered by manifest `order`. Only active galleries exist in the manifest.

## GET /family/galleries/{name}

Single gallery with short-lived signed URLs. **Requires allowed session.**
Emits access log entry (`resource: "<name>"`).

- **200**:

```json
{
  "name": "amsterdam",
  "title": "Amsterdam",
  "description": "…",
  "items": [
    {
      "caption": "Canal at dusk",
      "thumb_url": "https://storage.googleapis.com/…signed…",
      "full_url": "https://storage.googleapis.com/…signed…"
    }
  ]
}
```

- Signed URLs: V4, method **GET only**, expiry **≤ 15 minutes** from issue.
- `caption` may be `null`.
- **404** for names not in the manifest.

## GET /family/videos

Video list with signed URLs. **Requires allowed session.** Emits access log
entry (`resource: "videos"`).

- **200**:

```json
{
  "videos": [
    {
      "title": "Mt. Harvard summit",
      "description": "…",
      "date": "2003-08-09",
      "video_url": "https://storage.googleapis.com/…signed…",
      "poster_url": "https://storage.googleapis.com/…signed…"
    }
  ]
}
```

- Same signed-URL rules. FE fetches this list when the videos section opens
  (so playback expiry starts near click time); re-fetch to refresh expired
  URLs.

## POST /family/logout

- **204**: clears the `dt_family` cookie. Idempotent.

---

## Non-interchangeability requirements (tested)

- A valid `dt_family` cookie presented to any admin-protected endpoint ⇒ 401.
- A valid admin cookie presented to `/family/galleries*`, `/family/videos`,
  `/family/me` ⇒ 401 (admin *emails* are allowed, but only via a family
  cookie obtained through the family flow; the cookies themselves never
  cross).

## Out of contract

- No upload/management endpoints (one-shot script migration only).
- No pagination (largest gallery ≪ 100 items).
- Bucket and object names are internal; clients only ever see signed URLs.
