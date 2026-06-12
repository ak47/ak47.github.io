/**
 * Family archive API client (spec 002, US2/US3) — mirrors the admin client in
 * digitalTwinApi.js. Contract: specs/002-site-refresh/contracts/family-api.md
 * All calls use credentials: include (signed dt_family cookie, same API base).
 */

import { getApiBase } from "./digitalTwinApi"

export { getApiBase }

async function familyFetch(apiBase, path, options = {}) {
  const headers = { ...(options.headers || {}) }
  if (options.body != null && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json"
  }
  return fetch(`${apiBase}${path}`, {
    ...options,
    credentials: "include",
    headers,
  })
}

async function familyJson(apiBase, path, options = {}) {
  const res = await familyFetch(apiBase, path, options)
  if (!res.ok) {
    let detail = `Request failed (${res.status})`
    try {
      const err = await res.json()
      if (err?.detail) detail = String(err.detail)
    } catch {
      // ignore
    }
    const error = new Error(detail)
    error.status = res.status
    throw error
  }
  if (res.status === 204) return null
  const text = await res.text()
  if (!text) return null
  return JSON.parse(text)
}

/**
 * Whether the API has Google OAuth wired for family sign-in.
 * @returns {Promise<{ ok: true }|{ ok: false, detail: string }>}
 */
export async function checkFamilySignInAvailable(apiBase) {
  const res = await fetch(`${apiBase}/family/login`, {
    redirect: "manual",
    credentials: "include",
  })
  // Cross-origin OAuth start returns a redirect to Google; fetch exposes that
  // as an opaque redirect (status 0), not the real 3xx code.
  if (
    res.type === "opaqueredirect" ||
    (res.status >= 300 && res.status < 400)
  ) {
    return { ok: true }
  }
  if (res.status === 503) {
    let detail = "Family sign-in is not configured on the API."
    try {
      const body = await res.json()
      if (body?.detail) detail = String(body.detail)
    } catch {
      // ignore
    }
    return { ok: false, detail }
  }
  if (!res.ok) {
    return { ok: false, detail: `Sign-in unavailable (${res.status}).` }
  }
  return { ok: true }
}

/** Redirect browser to Google OAuth (backend enforces the allowlist). */
export function familySignIn(apiBase) {
  if (typeof window === "undefined") return
  window.location.href = `${apiBase}/family/login`
}

/** @returns {Promise<{ email: string, allowed: boolean }|null>} null = signed out */
export async function familyMe(apiBase) {
  const res = await familyFetch(apiBase, "/family/me")
  if (res.status === 401) return null
  if (!res.ok) {
    throw new Error(`GET /family/me failed (${res.status})`)
  }
  return res.json()
}

/** @returns {Promise<Array<{ name, title, description, count }>>} */
export async function familyListGalleries(apiBase) {
  const data = await familyJson(apiBase, "/family/galleries")
  return Array.isArray(data?.galleries) ? data.galleries : []
}

/**
 * Gallery items carry short-lived signed URLs (~15 min) — fetch on open, and
 * re-fetch to refresh expired links.
 */
export async function familyGetGallery(apiBase, name) {
  return familyJson(apiBase, `/family/galleries/${encodeURIComponent(name)}`)
}

/** @returns {Promise<Array<{ title, description, date, video_url, poster_url }>>} */
export async function familyListVideos(apiBase) {
  const data = await familyJson(apiBase, "/family/videos")
  return Array.isArray(data?.videos) ? data.videos : []
}

export async function familyLogout(apiBase) {
  return familyJson(apiBase, "/family/logout", { method: "POST" })
}
