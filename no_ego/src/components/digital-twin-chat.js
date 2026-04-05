import * as React from "react"
import { css } from "@emotion/react"
import { rhythm } from "../utils/typography"
import { theme } from "../styles/theme"
import {
  getApiBase,
  loadChatHistory,
  sendChatPrompt,
} from "../utils/digitalTwinApi"

const { colors, fonts, radius, shadow } = theme

export default function DigitalTwinChat() {
  const apiBase = getApiBase()
  const [messages, setMessages] = React.useState([])
  const [input, setInput] = React.useState("")
  const [loadingHistory, setLoadingHistory] = React.useState(false)
  const [sending, setSending] = React.useState(false)
  const [error, setError] = React.useState(null)
  const bottomRef = React.useRef(null)

  React.useEffect(() => {
    if (!apiBase || typeof window === "undefined") return undefined
    let cancelled = false
    setLoadingHistory(true)
    setError(null)
    loadChatHistory(apiBase)
      .then(rows => {
        if (!cancelled) {
          setMessages(
            rows.map((m, i) => ({
              id: `h-${i}`,
              role: m.role === "assistant" ? "assistant" : "user",
              text: String(m.text || ""),
            }))
          )
        }
      })
      .catch(e => {
        if (!cancelled) setError(e.message || "Could not load chat history.")
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false)
      })
    return () => {
      cancelled = true
    }
  }, [apiBase])

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, sending])

  async function onSubmit(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || !apiBase || sending) return

    setInput("")
    setError(null)
    const userId = `u-${Date.now()}`
    setMessages(prev => [...prev, { id: userId, role: "user", text }])

    const asstId = `a-${Date.now()}`
    setMessages(prev => [...prev, { id: asstId, role: "assistant", text: "" }])
    setSending(true)

    let acc = ""
    try {
      await sendChatPrompt(apiBase, text, chunk => {
        acc += chunk
        setMessages(prev =>
          prev.map(m => (m.id === asstId ? { ...m, text: acc } : m))
        )
      })
    } catch (err) {
      setError(err.message || "Request failed.")
      setMessages(prev => prev.filter(m => m.id !== asstId))
    } finally {
      setSending(false)
    }
  }

  if (!apiBase) {
    return (
      <aside
        css={css`
          margin-top: ${rhythm(2)};
          padding: ${rhythm(1)} ${rhythm(1.25)};
          border-radius: ${radius.lg};
          border: 1px dashed ${colors.border};
          background: ${colors.canvas};
          color: ${colors.inkMuted};
          font-family: ${fonts.body};
          font-size: 0.9rem;
        `}
      >
        <strong css={css`font-family: ${fonts.heading};`}>Resume chat</strong>{" "}
        is not configured for this build. Set{" "}
        <code
          css={css`
            font-family: ${fonts.mono};
            font-size: 0.82em;
          `}
        >
          GATSBY_DIGITAL_TWIN_API_BASE
        </code>{" "}
        (e.g. to{" "}
        <code css={css`font-family: ${fonts.mono}; font-size: 0.82em;`}>
          https://digital-twin.no-ego.net
        </code>
        ) when running <code css={css`font-family: ${fonts.mono};`}>gatsby build</code>.
      </aside>
    )
  }

  return (
    <section
      css={css`
        margin-top: ${rhythm(2)};
        background: ${colors.surface};
        border: 1px solid ${colors.borderLight};
        border-radius: ${radius.lg};
        box-shadow: ${shadow.md};
        padding: ${rhythm(1.25)} ${rhythm(1.25)} ${rhythm(1.5)};
        display: flex;
        flex-direction: column;
        max-height: min(70vh, 520px);
      `}
    >
      <h2
        css={css`
          font-family: ${fonts.heading};
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: ${colors.accent};
          margin: 0 0 ${rhythm(0.75)};
        `}
      >
        Ask about this site
      </h2>
      <p
        css={css`
          margin: 0 0 ${rhythm(1)};
          font-family: ${fonts.body};
          font-size: 0.88rem;
          color: ${colors.inkMuted};
          line-height: 1.45;
        `}
      >
        Powered by the digital-twin API. Your thread is saved per browser via{" "}
        <code css={css`font-family: ${fonts.mono}; font-size: 0.85em;`}>
          X-Session-Id
        </code>
        .
      </p>

      {error && (
        <p
          role="alert"
          css={css`
            margin: 0 0 ${rhythm(0.75)};
            padding: ${rhythm(0.5)} ${rhythm(0.65)};
            border-radius: ${radius.md};
            background: ${colors.accentMuted};
            color: ${colors.accentHover};
            font-size: 0.88rem;
          `}
        >
          {error}
        </p>
      )}

      <div
        css={css`
          flex: 1;
          overflow-y: auto;
          margin-bottom: ${rhythm(1)};
          padding: ${rhythm(0.5)} 0;
          display: flex;
          flex-direction: column;
          gap: ${rhythm(0.65)};
          min-height: 120px;
        `}
      >
        {loadingHistory && (
          <p
            css={css`
              color: ${colors.inkSubtle};
              font-size: 0.88rem;
            `}
          >
            Loading conversation…
          </p>
        )}
        {!loadingHistory && messages.length === 0 && (
          <p
            css={css`
              color: ${colors.inkSubtle};
              font-size: 0.88rem;
            `}
          >
            Say hello to start.
          </p>
        )}
        {messages.map(m => (
          <div
            key={m.id}
            css={css`
              align-self: ${m.role === "user" ? "flex-end" : "flex-start"};
              max-width: 92%;
              padding: ${rhythm(0.55)} ${rhythm(0.75)};
              border-radius: ${radius.md};
              font-family: ${fonts.body};
              font-size: 0.9rem;
              line-height: 1.5;
              white-space: pre-wrap;
              word-break: break-word;
              background: ${m.role === "user"
                ? colors.accentMuted
                : colors.canvas};
              color: ${colors.ink};
              border: 1px solid
                ${m.role === "user" ? colors.borderLight : colors.border};
            `}
          >
            {m.text || (m.role === "assistant" && sending ? "…" : "")}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={onSubmit}
        css={css`
          display: flex;
          flex-direction: column;
          gap: ${rhythm(0.65)};
        `}
      >
        <label
          htmlFor="digital-twin-chat-input"
          css={css`
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            border: 0;
          `}
        >
          Message
        </label>
        <textarea
          id="digital-twin-chat-input"
          rows={3}
          value={input}
          disabled={sending || loadingHistory}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a question…"
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
            color: ${colors.ink};
            &:focus {
              outline: 2px solid ${colors.accentMuted};
              border-color: ${colors.accent};
            }
            &:disabled {
              opacity: 0.65;
            }
          `}
        />
        <button
          type="submit"
          disabled={sending || loadingHistory || !input.trim()}
          css={css`
            align-self: flex-start;
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
            transition: background 0.15s ease;
            &:hover:not(:disabled) {
              background: ${colors.accentHover};
            }
            &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
          `}
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
    </section>
  )
}
