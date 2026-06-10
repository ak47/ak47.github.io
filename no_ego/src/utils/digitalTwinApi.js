/**
 * Digital twin Cloud Run API — public chat + admin (feature 001).
 * Contract: digital_twin/specs/001-conversation-persistence-admin/contracts/openapi.yaml
 * Build with GATSBY_DIGITAL_TWIN_API_BASE=https://digital-twin.no-ego.net (no trailing slash).
 */

export const SESSION_STORAGE_KEY = "digital_twin_session_id"

/** Production default when CI omits GATSBY_DIGITAL_TWIN_API_BASE (matches custom domain). */
const PRODUCTION_API_BASE = "https://digital-twin.no-ego.net"

export function getApiBase() {
  const raw = (process.env.GATSBY_DIGITAL_TWIN_API_BASE || "").trim()
  const fromEnv = raw.replace(/\/$/, "")
  if (fromEnv) return fromEnv
  if (process.env.NODE_ENV === "production") return PRODUCTION_API_BASE
  return ""
}

export function getConversationId() {
  if (typeof window === "undefined") return ""
  return window.localStorage.getItem(SESSION_STORAGE_KEY) || ""
}

function sessionHeaders() {
  if (typeof window === "undefined") return {}
  const sid = getConversationId()
  if (!sid) return {}
  return { "X-Session-Id": sid }
}

export function rememberSessionFromResponse(res) {
  if (typeof window === "undefined") return
  const sid = res.headers.get("X-Session-Id")
  if (sid) window.localStorage.setItem(SESSION_STORAGE_KEY, sid)
}

/**
 * Map API message to UI shape. Supports legacy user/assistant/text and 001 visitor/twin/owner/content.
 * @returns {{ id: number|string|null, role: 'user'|'assistant'|'owner', text: string, createdAt: string|null }}
 */
export function normalizeApiMessage(raw) {
  const apiRole = String(raw?.role || "").toLowerCase()
  let role = "assistant"
  if (apiRole === "visitor" || apiRole === "user") role = "user"
  else if (apiRole === "owner" || apiRole === "human") role = "owner"
  else if (apiRole === "twin" || apiRole === "assistant") role = "assistant"

  const text = String(raw?.content ?? raw?.text ?? "")
  const id = raw?.id != null ? raw.id : null
  const createdAt = raw?.created_at || null
  return { id, role, text, createdAt }
}

function clientIdForMessage(m, index) {
  if (m.id != null) return `m-${m.id}`
  return `h-${index}`
}

export async function loadChatHistory(apiBase) {
  const conversationId = getConversationId()
  if (conversationId) {
    try {
      const thread = await fetchConversationThread(apiBase, conversationId)
      return thread.messages.map((m, i) => ({
        ...normalizeApiMessage(m),
        id: clientIdForMessage(m, i),
        serverId: m.id != null ? m.id : null,
      }))
    } catch {
      // Fall through to legacy GET /api/chat
    }
  }

  const res = await fetch(`${apiBase}/api/chat`, {
    headers: { ...sessionHeaders() },
  })
  rememberSessionFromResponse(res)
  if (!res.ok) {
    throw new Error(`GET /api/chat failed (${res.status})`)
  }
  const data = await res.json()
  const rows = Array.isArray(data.messages) ? data.messages : []
  return rows.map((m, i) => ({
    ...normalizeApiMessage(m),
    id: clientIdForMessage(m, i),
    serverId: m.id != null ? m.id : null,
  }))
}

async function fetchConversationThread(apiBase, conversationId, afterId) {
  const qs = afterId != null ? `?after=${encodeURIComponent(afterId)}` : ""
  const res = await fetch(
    `${apiBase}/api/conversations/${encodeURIComponent(conversationId)}${qs}`
  )
  if (!res.ok) {
    throw new Error(`GET /api/conversations/${conversationId} failed (${res.status})`)
  }
  return res.json()
}

/**
 * Incremental poll for owner/twin messages after last server message id.
 * @param {string} apiBase
 * @param {string} conversationId
 * @param {number|null} afterId
 */
export async function pollMessages(apiBase, conversationId, afterId) {
  const thread = await fetchConversationThread(apiBase, conversationId, afterId)
  const rows = Array.isArray(thread.messages) ? thread.messages : []
  return rows.map((m, i) => ({
    ...normalizeApiMessage(m),
    id: clientIdForMessage(m, i),
    serverId: m.id != null ? m.id : null,
  }))
}

/**
 * @param {string} apiBase
 * @returns {Promise<{ modelId: string, provider: string }>}
 */
export async function loadLlmModelInfo(apiBase) {
  const res = await fetch(`${apiBase}/`)
  if (!res.ok) {
    throw new Error(`GET / failed (${res.status})`)
  }
  const data = await res.json()
  const modelId = String(data.llm_model || "").trim()
  const provider = String(data.llm_provider || "vertex").trim()
  return { modelId, provider }
}

export async function sendChatPrompt(apiBase, prompt, onTextChunk) {
  const res = await fetch(`${apiBase}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...sessionHeaders(),
    },
    body: JSON.stringify({ prompt }),
  })
  rememberSessionFromResponse(res)
  if (!res.ok) {
    throw new Error(`POST /api/chat failed (${res.status})`)
  }
  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = ""
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    for (;;) {
      const idx = buf.indexOf("\n\n")
      if (idx < 0) break
      const block = buf.slice(0, idx)
      buf = buf.slice(idx + 2)
      for (const line of block.split("\n")) {
        const trimmed = line.trim()
        if (!trimmed.startsWith("data:")) continue
        let payload
        try {
          payload = JSON.parse(trimmed.slice(5).trim())
        } catch {
          continue
        }
        if (payload.text) onTextChunk(payload.text)
      }
    }
  }
}

// --- Admin API (credentials: include) — openapi.yaml /admin/*

async function adminFetch(apiBase, path, options = {}) {
  const headers = { ...(options.headers || {}) }
  if (options.body != null && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json"
  }
  const res = await fetch(`${apiBase}${path}`, {
    ...options,
    credentials: "include",
    headers,
  })
  return res
}

async function adminJson(apiBase, path, options = {}) {
  const res = await adminFetch(apiBase, path, options)
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
 * Whether the API has Google OAuth wired for admin sign-in.
 * @returns {Promise<{ ok: true }|{ ok: false, detail: string }>}
 */
export async function checkAdminSignInAvailable(apiBase) {
  const res = await fetch(`${apiBase}/admin/auth/google`, {
    redirect: "manual",
    credentials: "include",
  })
  if (res.status === 302 || res.status === 301) return { ok: true }
  if (res.status === 503) {
    let detail = "Admin sign-in is not configured on the API."
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

/** Redirect browser to Google OAuth (backend handles allowlist). */
export function adminGoogleSignIn(apiBase) {
  if (typeof window === "undefined") return
  window.location.href = `${apiBase}/admin/auth/google`
}

export async function adminLogout(apiBase) {
  return adminJson(apiBase, "/admin/logout", { method: "POST" })
}

/** @returns {Promise<{ authenticated: boolean, email?: string }|null>} */
export async function adminMe(apiBase) {
  const res = await adminFetch(apiBase, "/admin/me")
  if (res.status === 401) return null
  if (!res.ok) {
    throw new Error(`GET /admin/me failed (${res.status})`)
  }
  return res.json()
}

export async function adminListConversations(apiBase) {
  const rows = await adminJson(apiBase, "/admin/conversations")
  return Array.isArray(rows) ? rows : []
}

export async function adminGetConversation(apiBase, conversationId) {
  return adminJson(
    apiBase,
    `/admin/conversations/${encodeURIComponent(conversationId)}`
  )
}

export async function adminPostReply(apiBase, conversationId, content) {
  return adminJson(
    apiBase,
    `/admin/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ content }),
    }
  )
}

export async function adminResolve(apiBase, conversationId) {
  return adminJson(
    apiBase,
    `/admin/conversations/${encodeURIComponent(conversationId)}/resolve`,
    { method: "POST" }
  )
}
