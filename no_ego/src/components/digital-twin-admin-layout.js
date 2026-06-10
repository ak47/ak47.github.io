import * as React from "react"
import { css } from "@emotion/react"
import { Link } from "gatsby"
import Layout from "./layout"
import { rhythm } from "../utils/typography"
import { theme } from "../styles/theme"
import {
  adminGoogleSignIn,
  adminLogout,
  adminMe,
  checkAdminSignInAvailable,
  getApiBase,
} from "../utils/digitalTwinApi"

const { colors, fonts, radius, shadow } = theme

const TABS = [
  { key: "conversations", label: "Conversations", to: "/digital-twin-admin/" },
  {
    key: "instructions",
    label: "Instructions",
    to: "/digital-twin-admin-instructions/",
    disabled: true,
  },
  {
    key: "archive",
    label: "Archive",
    to: "/digital-twin-admin-archive/",
    disabled: true,
  },
]

function parseAuthError() {
  if (typeof window === "undefined") return null
  const params = new URLSearchParams(window.location.search)
  const err = params.get("auth_error")
  if (err === "allowlist") {
    return "Your Google account is not on the admin allowlist."
  }
  return null
}

export default function DigitalTwinAdminLayout({ activeTab, title, children }) {
  const apiBase = getApiBase()
  const [session, setSession] = React.useState(undefined)
  const [authError, setAuthError] = React.useState(() => parseAuthError())
  const [signInReady, setSignInReady] = React.useState(undefined)
  const [busy, setBusy] = React.useState(false)

  React.useEffect(() => {
    if (!apiBase) {
      setSession(null)
      setSignInReady(false)
      return undefined
    }
    let cancelled = false
    adminMe(apiBase)
      .then(me => {
        if (!cancelled) setSession(me)
      })
      .catch(e => {
        if (!cancelled) {
          setSession(null)
          setAuthError(e.message || "Could not verify admin session.")
        }
      })
    return () => {
      cancelled = true
    }
  }, [apiBase])

  React.useEffect(() => {
    if (!apiBase || session) return undefined
    let cancelled = false
    checkAdminSignInAvailable(apiBase)
      .then(result => {
        if (cancelled) return
        setSignInReady(result.ok)
        if (!result.ok) setAuthError(result.detail)
      })
      .catch(() => {
        // Probe inconclusive — keep sign-in enabled; navigation surfaces real errors.
        if (!cancelled) setSignInReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [apiBase, session])

  async function onLogout() {
    if (!apiBase || busy) return
    setBusy(true)
    try {
      await adminLogout(apiBase)
      setSession(null)
    } catch (e) {
      setAuthError(e.message || "Logout failed.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Layout contentMaxWidth={theme.space.wideMax}>
      <div
        css={css`
          background: ${colors.surface};
          border: 1px solid ${colors.borderLight};
          border-radius: ${radius.lg};
          box-shadow: ${shadow.md};
          padding: ${rhythm(1.5)} ${rhythm(1.25)} ${rhythm(2)};
        `}
      >
        <header
          css={css`
            display: flex;
            flex-wrap: wrap;
            align-items: flex-start;
            justify-content: space-between;
            gap: ${rhythm(1)};
            margin-bottom: ${rhythm(1.25)};
          `}
        >
          <div>
            <h1
              css={css`
                margin: 0 0 ${rhythm(0.35)};
                font-family: ${fonts.heading};
                font-size: 1.35rem;
              `}
            >
              Digital twin admin
            </h1>
            {title ? (
              <p
                css={css`
                  margin: 0;
                  color: ${colors.inkMuted};
                  font-size: 0.92rem;
                `}
              >
                {title}
              </p>
            ) : null}
          </div>
          {session?.email ? (
            <div
              css={css`
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: ${rhythm(0.65)};
                font-size: 0.88rem;
                color: ${colors.inkMuted};
              `}
            >
              <span>{session.email}</span>
              <button
                type="button"
                disabled={busy}
                onClick={onLogout}
                css={buttonCss(false)}
              >
                Sign out
              </button>
            </div>
          ) : null}
        </header>

        {!apiBase ? (
          <p css={alertCss(colors.inkMuted)}>
            Admin UI requires{" "}
            <code css={monoCss}>GATSBY_DIGITAL_TWIN_API_BASE</code> at build time.
          </p>
        ) : session === undefined ? (
          <p css={mutedCss}>Checking session…</p>
        ) : !session ? (
          <div
            css={css`
              max-width: 28rem;
            `}
          >
            {authError ? (
              <p role="alert" css={alertCss(colors.accentHover)}>
                {authError}
              </p>
            ) : null}
            <p css={mutedCss}>
              Sign in with a Google account on the admin allowlist to manage
              visitor conversations.
            </p>
            <button
              type="button"
              disabled={signInReady === false}
              onClick={() => adminGoogleSignIn(apiBase)}
              css={buttonCss(true)}
            >
              Sign in with Google
            </button>
          </div>
        ) : (
          <>
            <nav
              aria-label="Admin sections"
              css={css`
                display: flex;
                flex-wrap: wrap;
                gap: 0.35rem;
                margin-bottom: ${rhythm(1.5)};
                padding-bottom: ${rhythm(0.75)};
                border-bottom: 1px solid ${colors.borderLight};
              `}
            >
              {TABS.map(tab => {
                const isActive = tab.key === activeTab
                if (tab.disabled) {
                  return (
                    <span
                      key={tab.key}
                      css={css`
                        font-family: ${fonts.heading};
                        font-size: 0.82rem;
                        font-weight: 600;
                        letter-spacing: 0.05em;
                        text-transform: uppercase;
                        padding: 0.45rem 0.75rem;
                        border-radius: ${radius.sm};
                        color: ${colors.inkSubtle};
                        opacity: 0.65;
                      `}
                      title="Coming soon"
                    >
                      {tab.label}
                    </span>
                  )
                }
                return (
                  <Link
                    key={tab.key}
                    to={tab.to}
                    css={css`
                      font-family: ${fonts.heading};
                      font-size: 0.82rem;
                      font-weight: 600;
                      letter-spacing: 0.05em;
                      text-transform: uppercase;
                      padding: 0.45rem 0.75rem;
                      border-radius: ${radius.sm};
                      text-decoration: none;
                      border-bottom: none;
                      color: ${isActive ? colors.accent : colors.inkMuted};
                      background: ${isActive ? colors.accentMuted : "transparent"};
                      &:hover {
                        color: ${colors.accent};
                        background: ${colors.accentMuted};
                      }
                    `}
                  >
                    {tab.label}
                  </Link>
                )
              })}
            </nav>
            {children}
          </>
        )}
      </div>
    </Layout>
  )
}

const monoCss = css`
  font-family: ${fonts.mono};
  font-size: 0.9em;
`

const mutedCss = css`
  color: ${colors.inkMuted};
  font-size: 0.92rem;
  margin: 0 0 ${rhythm(1)};
`

function alertCss(color) {
  return css`
    margin: 0 0 ${rhythm(0.85)};
    padding: ${rhythm(0.55)} ${rhythm(0.7)};
    border-radius: ${radius.md};
    background: ${colors.accentMuted};
    color: ${color};
    font-size: 0.9rem;
  `
}

function buttonCss(primary) {
  return css`
    font-family: ${fonts.heading};
    font-weight: 600;
    font-size: 0.82rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 0.55rem 1.1rem;
    border-radius: ${radius.md};
    border: 1px solid ${primary ? "transparent" : colors.border};
    cursor: pointer;
    background: ${primary ? colors.accent : colors.surface};
    color: ${primary ? colors.surface : colors.ink};
    &:hover:not(:disabled) {
      background: ${primary ? colors.accentHover : colors.canvas};
    }
    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
  `
}
