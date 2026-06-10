import * as React from "react"
import { css } from "@emotion/react"
import { rhythm } from "../utils/typography"
import { theme } from "../styles/theme"
import {
  adminGetConversation,
  adminPostReply,
  adminResolve,
  normalizeApiMessage,
} from "../utils/digitalTwinApi"

const { colors, fonts, radius } = theme

const ROLE_LABELS = {
  user: "Visitor",
  assistant: "Twin",
  owner: "Owner",
}

function formatWhen(iso) {
  if (!iso) return ""
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export default function DigitalTwinAdminThread({
  apiBase,
  conversationId,
  onBack,
  onUpdated,
}) {
  const [thread, setThread] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [reply, setReply] = React.useState("")
  const [sending, setSending] = React.useState(false)
  const [resolving, setResolving] = React.useState(false)
  const bottomRef = React.useRef(null)

  const loadThread = React.useCallback(async () => {
    if (!apiBase || !conversationId) return
    setLoading(true)
    setError(null)
    try {
      const data = await adminGetConversation(apiBase, conversationId)
      setThread(data)
      onUpdated?.()
    } catch (e) {
      setError(e.message || "Could not load conversation.")
    } finally {
      setLoading(false)
    }
  }, [apiBase, conversationId, onUpdated])

  React.useEffect(() => {
    loadThread()
  }, [loadThread])

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [thread, sending])

  async function onSubmitReply(e) {
    e.preventDefault()
    const text = reply.trim()
    if (!text || sending) return
    setSending(true)
    setError(null)
    try {
      await adminPostReply(apiBase, conversationId, text)
      setReply("")
      await loadThread()
    } catch (err) {
      setError(err.message || "Reply failed.")
    } finally {
      setSending(false)
    }
  }

  async function onResolve() {
    if (resolving) return
    setResolving(true)
    setError(null)
    try {
      await adminResolve(apiBase, conversationId)
      await loadThread()
      onUpdated?.()
    } catch (err) {
      setError(err.message || "Could not mark resolved.")
    } finally {
      setResolving(false)
    }
  }

  const messages = (thread?.messages || []).map(normalizeApiMessage)
  const displayName =
    thread?.conversation_name?.trim() || "Rando"

  return (
    <div>
      <div
        css={css`
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: ${rhythm(0.65)};
          margin-bottom: ${rhythm(1)};
        `}
      >
        <button type="button" onClick={onBack} css={ghostButtonCss}>
          ← Inbox
        </button>
        <h2
          css={css`
            margin: 0;
            flex: 1 1 auto;
            font-family: ${fonts.heading};
            font-size: 1.05rem;
          `}
        >
          {displayName}
        </h2>
        <button
          type="button"
          disabled={resolving || loading}
          onClick={onResolve}
          css={ghostButtonCss}
        >
          {resolving ? "Resolving…" : "Mark resolved"}
        </button>
      </div>

      {error ? (
        <p role="alert" css={alertCss}>
          {error}
        </p>
      ) : null}

      <div
        css={css`
          min-height: 200px;
          max-height: min(52vh, 520px);
          overflow-y: auto;
          margin-bottom: ${rhythm(1)};
          padding: ${rhythm(0.75)};
          border: 1px solid ${colors.borderLight};
          border-radius: ${radius.md};
          background: ${colors.canvas};
          display: flex;
          flex-direction: column;
          gap: ${rhythm(0.65)};
        `}
      >
        {loading && !thread ? (
          <p css={mutedCss}>Loading thread…</p>
        ) : null}
        {!loading && messages.length === 0 ? (
          <p css={mutedCss}>No messages yet.</p>
        ) : null}
        {messages.map((m, i) => (
          <article
            key={m.id != null ? `m-${m.id}` : `i-${i}`}
            css={css`
              align-self: ${m.role === "user" ? "flex-end" : "flex-start"};
              max-width: 92%;
              padding: ${rhythm(0.55)} ${rhythm(0.75)};
              border-radius: ${radius.md};
              background: ${m.role === "owner"
                ? colors.canvasDeep
                : m.role === "user"
                  ? colors.accentMuted
                  : colors.surface};
              border: 1px solid
                ${m.role === "owner" ? colors.warn : colors.border};
              font-size: 0.9rem;
              line-height: 1.5;
              white-space: pre-wrap;
              overflow-wrap: anywhere;
            `}
          >
            <header
              css={css`
                font-family: ${fonts.heading};
                font-size: 0.72rem;
                font-weight: 600;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: ${m.role === "owner" ? colors.warn : colors.inkSubtle};
                margin-bottom: ${rhythm(0.25)};
              `}
            >
              {ROLE_LABELS[m.role] || m.role}
              {m.createdAt ? (
                <span
                  css={css`
                    font-weight: 400;
                    text-transform: none;
                    letter-spacing: normal;
                    margin-left: 0.5rem;
                    color: ${colors.inkSubtle};
                  `}
                >
                  {formatWhen(m.createdAt)}
                </span>
              ) : null}
            </header>
            {m.text}
          </article>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSubmitReply}>
        <label
          htmlFor="admin-reply"
          css={css`
            display: block;
            font-family: ${fonts.heading};
            font-size: 0.78rem;
            font-weight: 600;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: ${colors.inkMuted};
            margin-bottom: ${rhythm(0.4)};
          `}
        >
          Owner reply
        </label>
        <textarea
          id="admin-reply"
          rows={3}
          value={reply}
          disabled={sending || loading}
          onChange={e => setReply(e.target.value)}
          placeholder="Write a reply visible to the visitor…"
          css={css`
            width: 100%;
            resize: vertical;
            min-height: 72px;
            padding: ${rhythm(0.6)} ${rhythm(0.75)};
            border-radius: ${radius.md};
            border: 1px solid ${colors.border};
            font-family: ${fonts.body};
            font-size: 0.95rem;
            line-height: 1.45;
            background: ${colors.surface};
            margin-bottom: ${rhythm(0.65)};
          `}
        />
        <button
          type="submit"
          disabled={sending || loading || !reply.trim()}
          css={primaryButtonCss}
        >
          {sending ? "Sending…" : "Send reply"}
        </button>
      </form>
    </div>
  )
}

const mutedCss = css`
  margin: 0;
  color: ${colors.inkSubtle};
  font-size: 0.88rem;
`

const alertCss = css`
  margin: 0 0 ${rhythm(0.85)};
  padding: ${rhythm(0.55)} ${rhythm(0.7)};
  border-radius: ${radius.md};
  background: ${colors.accentMuted};
  color: ${colors.accentHover};
  font-size: 0.9rem;
`

const ghostButtonCss = css`
  font-family: ${fonts.heading};
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 0.4rem 0.75rem;
  border-radius: ${radius.sm};
  border: 1px solid ${colors.border};
  background: ${colors.surface};
  color: ${colors.inkMuted};
  cursor: pointer;
  &:hover:not(:disabled) {
    color: ${colors.accent};
    border-color: ${colors.accent};
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`

const primaryButtonCss = css`
  font-family: ${fonts.heading};
  font-weight: 600;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.55rem 1.25rem;
  border-radius: ${radius.md};
  border: none;
  cursor: pointer;
  background: ${colors.accent};
  color: ${colors.surface};
  &:hover:not(:disabled) {
    background: ${colors.accentHover};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`
