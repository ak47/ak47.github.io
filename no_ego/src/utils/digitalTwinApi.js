/**
 * Digital twin Cloud Run API — GET/POST /api/chat, X-Session-Id, SSE on POST.
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

function sessionHeaders() {
  if (typeof window === "undefined") return {}
  const sid = window.localStorage.getItem(SESSION_STORAGE_KEY) || ""
  if (!sid) return {}
  return { "X-Session-Id": sid }
}

export function rememberSessionFromResponse(res) {
  if (typeof window === "undefined") return
  const sid = res.headers.get("X-Session-Id")
  if (sid) window.localStorage.setItem(SESSION_STORAGE_KEY, sid)
}

export async function loadChatHistory(apiBase) {
  const res = await fetch(`${apiBase}/api/chat`, {
    headers: { ...sessionHeaders() },
  })
  rememberSessionFromResponse(res)
  if (!res.ok) {
    throw new Error(`GET /api/chat failed (${res.status})`)
  }
  const data = await res.json()
  return Array.isArray(data.messages) ? data.messages : []
}

/**
 * @param {string} apiBase
 * @param {string} prompt
 * @param {(chunk: string) => void} onTextChunk
 */
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
