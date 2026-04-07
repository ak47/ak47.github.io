import * as React from "react"
import { css, keyframes } from "@emotion/react"
import { rhythm } from "../utils/typography"
import { theme } from "../styles/theme"
import {
  getApiBase,
  loadChatHistory,
  sendChatPrompt,
} from "../utils/digitalTwinApi"

const { colors, fonts, radius } = theme

const dotBounce = keyframes`
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.28;
  }
  40% {
    transform: translateY(-3px);
    opacity: 1;
  }
`

const mirrorShimmer = keyframes`
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
`

const cursorPulse = keyframes`
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
`

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
        margin-top: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        min-height: min(52vh, 480px);
        max-height: min(calc(100vh - 9.5rem), 860px);
        padding: 0;

        @media (max-width: 640px) {
          min-height: min(50vh, 440px);
          max-height: min(calc(100vh - 8rem), 780px);
        }
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
          margin: 0 0 ${rhythm(0.65)};
        `}
      >
        Petition the twin in the dark mirror
      </h2>

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
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: auto;
          margin-bottom: ${rhythm(1)};
          padding: ${rhythm(0.65)} ${rhythm(0.35)};
          display: flex;
          flex-direction: column;
          gap: ${rhythm(0.65)};
          border-radius: ${radius.md};
          background: ${colors.canvas};
          border: 1px solid ${colors.borderLight};
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
        {messages.map(m => {
          const isActiveAssistant =
            sending &&
            m.role === "assistant" &&
            messages.length > 0 &&
            messages[messages.length - 1]?.id === m.id
          const showPendingDots = isActiveAssistant && !m.text
          const showStreamCursor = isActiveAssistant && Boolean(m.text)

          return (
            <div
              key={m.id}
              css={css`
                align-self: ${m.role === "user" ? "flex-end" : "flex-start"};
                max-width: 92%;
                padding: ${showPendingDots
                  ? `${rhythm(1)} ${rhythm(1.1)}`
                  : `${rhythm(0.55)} ${rhythm(0.75)}`};
                border-radius: ${radius.md};
                font-family: ${fonts.body};
                font-size: 0.9rem;
                line-height: 1.5;
                white-space: ${showPendingDots ? "normal" : "pre-wrap"};
                overflow-wrap: anywhere;
                word-break: break-word;
                box-sizing: border-box;
                ${showPendingDots
                  ? `
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  min-height: ${rhythm(4.25)};
                  overflow: visible;
                `
                  : ""}
                background: ${m.role === "user"
                  ? colors.accentMuted
                  : showPendingDots
                    ? `linear-gradient(
                    105deg,
                    ${colors.canvas} 0%,
                    ${colors.accentMuted} 42%,
                    ${colors.canvas} 84%
                  )`
                    : colors.canvas};
                background-size: ${showPendingDots ? "200% 100%" : "auto"};
                animation: ${showPendingDots
                  ? `${mirrorShimmer} 2.8s ease-in-out infinite`
                  : "none"};
                color: ${colors.ink};
                border: 1px solid
                  ${m.role === "user" ? colors.borderLight : colors.border};

                @media (prefers-reduced-motion: reduce) {
                  animation: none;
                  background: ${m.role === "user"
                    ? colors.accentMuted
                    : colors.canvas};
                  background-size: auto;
                }

                @media (max-width: 640px) {
                  align-self: stretch;
                  max-width: none;
                  width: 100%;
                  box-sizing: border-box;
                  padding: ${showPendingDots
                    ? `${rhythm(0.95)} ${rhythm(0.85)}`
                    : `${rhythm(0.5)} ${rhythm(0.6)}`};
                  font-size: 0.95rem;
                  border-left-width: 3px;
                  border-left-color: ${m.role === "user"
                    ? colors.accent
                    : colors.border};
                }
              `}
            >
              {showPendingDots ? (
                <div
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  css={css`
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: ${rhythm(0.65)};
                    width: 100%;
                    text-align: center;
                  `}
                >
                  <span
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
                    Assistant is composing a response.
                  </span>
                  <span
                    css={css`
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      gap: 0.35rem;
                      flex-shrink: 0;
                    `}
                  >
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        css={css`
                          display: inline-block;
                          width: 7px;
                          height: 7px;
                          border-radius: 50%;
                          background: ${colors.accent};
                          animation: ${dotBounce} 1.05s ease-in-out infinite;
                          animation-delay: ${i * 0.14}s;

                          @media (prefers-reduced-motion: reduce) {
                            animation: none;
                            opacity: ${0.45 + i * 0.15};
                          }
                        `}
                      />
                    ))}
                  </span>
                  <span
                    css={css`
                      display: block;
                      font-size: 0.82rem;
                      line-height: 1.45;
                      color: ${colors.inkMuted};
                      font-style: italic;
                      letter-spacing: 0.02em;
                      max-width: 18em;
                    `}
                  >
                    The mirror confers…
                  </span>
                </div>
              ) : (
                <>
                  {m.text}
                  {showStreamCursor ? (
                    <span
                      aria-hidden
                      css={css`
                        display: inline-block;
                        margin-left: 1px;
                        width: 0.12em;
                        height: 1em;
                        vertical-align: text-bottom;
                        background: ${colors.accent};
                        animation: ${cursorPulse} 0.85s ease-in-out infinite;

                        @media (prefers-reduced-motion: reduce) {
                          animation: none;
                          opacity: 0.85;
                        }
                      `}
                    />
                  ) : null}
                </>
              )}
            </div>
          )
        })}
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
          rows={2}
          value={input}
          disabled={sending || loadingHistory}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a question…"
          css={css`
            width: 100%;
            resize: vertical;
            min-height: 52px;
            max-height: 160px;
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
