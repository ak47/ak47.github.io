import * as React from "react"
import { css } from "@emotion/react"
import { graphql } from "gatsby"
import DigitalTwinAdminLayout from "../components/digital-twin-admin-layout"
import DigitalTwinAdminThread from "../components/digital-twin-admin-thread"
import { SeoHead } from "../components/seo-head"
import { adminListConversations, getApiBase } from "../utils/digitalTwinApi"
import { rhythm } from "../utils/typography"
import { theme } from "../styles/theme"

const { colors, fonts, radius } = theme

function formatWhen(iso) {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

function AdminConversations() {
  const apiBase = getApiBase()
  const [rows, setRows] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [selectedId, setSelectedId] = React.useState(null)

  const loadInbox = React.useCallback(async () => {
    if (!apiBase) return
    setLoading(true)
    setError(null)
    try {
      const list = await adminListConversations(apiBase)
      const sorted = [...list].sort(
        (a, b) =>
          new Date(b.last_created_at).getTime() -
          new Date(a.last_created_at).getTime()
      )
      setRows(sorted)
    } catch (e) {
      setError(e.message || "Could not load conversations.")
    } finally {
      setLoading(false)
    }
  }, [apiBase])

  React.useEffect(() => {
    if (!apiBase) return undefined
    loadInbox()
    return undefined
  }, [apiBase, loadInbox])

  if (selectedId) {
    return (
      <DigitalTwinAdminThread
        apiBase={apiBase}
        conversationId={selectedId}
        onBack={() => setSelectedId(null)}
        onUpdated={loadInbox}
      />
    )
  }

  return (
    <div>
      <div
        css={css`
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          justify-content: space-between;
          gap: ${rhythm(0.65)};
          margin-bottom: ${rhythm(1)};
        `}
      >
        <p
          css={css`
            margin: 0;
            font-size: 0.92rem;
            color: ${colors.inkMuted};
          `}
        >
          {loading ? "Loading…" : `${rows.length} conversation${rows.length === 1 ? "" : "s"}`}
        </p>
        <button
          type="button"
          disabled={loading}
          onClick={loadInbox}
          css={css`
            font-family: ${fonts.heading};
            font-size: 0.78rem;
            font-weight: 600;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            padding: 0.35rem 0.7rem;
            border-radius: ${radius.sm};
            border: 1px solid ${colors.border};
            background: ${colors.surface};
            color: ${colors.inkMuted};
            cursor: pointer;
            &:hover:not(:disabled) {
              color: ${colors.accent};
            }
            &:disabled {
              opacity: 0.55;
            }
          `}
        >
          Refresh
        </button>
      </div>

      {error ? (
        <p role="alert" css={alertCss}>
          {error}
        </p>
      ) : null}

      {!loading && rows.length === 0 ? (
        <p css={mutedCss}>No conversations yet.</p>
      ) : (
        <div
          css={css`
            overflow-x: auto;
            border: 1px solid ${colors.borderLight};
            border-radius: ${radius.md};
          `}
        >
          <table
            css={css`
              width: 100%;
              border-collapse: collapse;
              font-size: 0.88rem;
              th,
              td {
                padding: ${rhythm(0.55)} ${rhythm(0.65)};
                text-align: left;
                border-bottom: 1px solid ${colors.borderLight};
                vertical-align: top;
              }
              th {
                font-family: ${fonts.heading};
                font-size: 0.72rem;
                font-weight: 600;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: ${colors.inkSubtle};
                background: ${colors.canvas};
              }
              tbody tr {
                cursor: pointer;
                background: ${colors.surface};
                &:hover {
                  background: ${colors.canvas};
                }
              }
              tbody tr:last-child td {
                border-bottom: none;
              }
            `}
          >
            <thead>
              <tr>
                <th>Name</th>
                <th>Preview</th>
                <th>Last activity</th>
                <th>Msgs</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr
                  key={row.conversation_id}
                  onClick={() => setSelectedId(row.conversation_id)}
                >
                  <td>{row.conversation_name?.trim() || "Rando"}</td>
                  <td
                    css={css`
                      max-width: 16rem;
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    `}
                  >
                    {row.preview || "—"}
                  </td>
                  <td>{formatWhen(row.last_created_at)}</td>
                  <td>{row.message_count}</td>
                  <td>
                    <div
                      css={css`
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.35rem;
                      `}
                    >
                      {row.unread ? (
                        <span css={badgeCss(colors.accent)}>Unread</span>
                      ) : null}
                      {row.needs_attention ? (
                        <span css={badgeCss(colors.warn)}>Needs attention</span>
                      ) : null}
                      {!row.unread && !row.needs_attention ? (
                        <span css={mutedCss}>—</span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function DigitalTwinAdminPage() {
  return (
    <DigitalTwinAdminLayout activeTab="conversations">
      <AdminConversations />
    </DigitalTwinAdminLayout>
  )
}

export const Head = ({ data }) => (
  <SeoHead
    title="digital twin admin"
    siteMetadata={data.site.siteMetadata}
    meta={[{ name: "robots", content: "noindex, nofollow" }]}
  />
)

function badgeCss(color) {
  return css`
    display: inline-block;
    font-family: ${fonts.heading};
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.15rem 0.4rem;
    border-radius: ${radius.sm};
    color: ${colors.surface};
    background: ${color};
  `
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

export const query = graphql`
  query {
    site {
      siteMetadata {
        title
        description
        author
      }
    }
  }
`
