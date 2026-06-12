/**
 * Private family photo/video archive (spec 002, US2/US3).
 * Google sign-in gated; allowlist enforced by the API. Signed media URLs are
 * fetched when a gallery/video is opened so the ~15 min expiry starts then;
 * re-opening refreshes expired links. Not listed in the main nav (footer link).
 */
import * as React from "react"
import { css } from "@emotion/react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import { SeoHead } from "../components/seo-head"
import { rhythm } from "../utils/typography"
import { theme } from "../styles/theme"
import {
  getApiBase,
  checkFamilySignInAvailable,
  familySignIn,
  familyMe,
  familyListGalleries,
  familyGetGallery,
  familyListVideos,
  familyLogout,
} from "../utils/familyApi"

const { colors, fonts, radius, shadow } = theme

const card = css`
  background: ${colors.surface};
  border: 1px solid ${colors.borderLight};
  border-radius: ${radius.lg};
  box-shadow: ${shadow.md};
  padding: ${rhythm(1.5)} ${rhythm(1.25)};
`

const button = css`
  font-family: ${fonts.heading};
  font-size: 0.85rem;
  font-weight: 600;
  color: ${colors.surface};
  background: ${colors.accent};
  border: none;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: ${radius.sm};
`

const subtleButton = css`
  ${button};
  color: ${colors.accent};
  background: ${colors.accentMuted};
`

const muted = css`
  color: ${colors.inkMuted};
  max-width: 36em;
`

function SignedOut({ apiBase, availability }) {
  return (
    <section css={card}>
      <h1>Family photos &amp; videos</h1>
      <p css={muted}>
        The family archive from the 2005 site — galleries and home videos for
        family only. Sign in with the Google account on the family list.
      </p>
      {availability && availability.ok === false ? (
        <p css={muted}>{availability.detail}</p>
      ) : (
        <button
          type="button"
          css={button}
          onClick={() => familySignIn(apiBase)}
        >
          Sign in with Google
        </button>
      )}
    </section>
  )
}

function Denied({ me, onSignOut }) {
  return (
    <section css={card}>
      <h1>Not on the list</h1>
      <p css={muted}>
        You&apos;re signed in as <strong>{me.email}</strong>, but that account
        isn&apos;t on the family list. If it should be, ask Andy to add it.
      </p>
      <button type="button" css={subtleButton} onClick={onSignOut}>
        Sign out
      </button>
    </section>
  )
}

function Unavailable() {
  return (
    <section css={card}>
      <h1>Family photos &amp; videos</h1>
      <p css={muted}>
        The archive can&apos;t be reached right now. Please try again later.
      </p>
    </section>
  )
}

function PhotoView({ photo, onClose }) {
  return (
    <div>
      <button type="button" css={subtleButton} onClick={onClose}>
        ← Back to gallery
      </button>
      <figure
        css={css`
          margin: ${rhythm(1)} 0 0;
        `}
      >
        <img
          src={photo.full_url}
          alt={photo.caption || "Family photo"}
          css={css`
            max-width: 100%;
            border-radius: ${radius.md};
            box-shadow: ${shadow.md};
          `}
        />
        {photo.caption ? (
          <figcaption
            css={css`
              margin-top: ${rhythm(0.5)};
              color: ${colors.inkMuted};
            `}
          >
            {photo.caption}
          </figcaption>
        ) : null}
      </figure>
    </div>
  )
}

function GalleryView({ apiBase, name, onBack }) {
  const [gallery, setGallery] = React.useState(null)
  const [photo, setPhoto] = React.useState(null)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    familyGetGallery(apiBase, name)
      .then((g) => {
        if (!cancelled) setGallery(g)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [apiBase, name])

  if (error) return <Unavailable />
  if (!gallery) return <p css={muted}>Loading…</p>
  if (photo) return <PhotoView photo={photo} onClose={() => setPhoto(null)} />

  return (
    <div>
      <button type="button" css={subtleButton} onClick={onBack}>
        ← All galleries
      </button>
      <h2
        css={css`
          margin: ${rhythm(0.75)} 0 ${rhythm(0.25)};
        `}
      >
        {gallery.title}
      </h2>
      {gallery.description ? <p css={muted}>{gallery.description}</p> : null}
      <ul
        css={css`
          list-style: none;
          margin: ${rhythm(1)} 0 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: ${rhythm(0.5)};
        `}
      >
        {gallery.items.map((item, i) => (
          <li key={`${gallery.name}-${i}`}>
            <button
              type="button"
              onClick={() => setPhoto(item)}
              css={css`
                border: 1px solid ${colors.borderLight};
                border-radius: ${radius.sm};
                background: ${colors.surface};
                padding: 0.25rem;
                cursor: pointer;
                width: 100%;
              `}
            >
              <img
                src={item.thumb_url}
                alt={item.caption || "Photo thumbnail"}
                loading="lazy"
                css={css`
                  width: 100%;
                  display: block;
                  border-radius: ${radius.sm};
                `}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function VideosView({ apiBase, onBack }) {
  const [videos, setVideos] = React.useState(null)
  const [playing, setPlaying] = React.useState(null)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    // Fetched at open so the signed-URL expiry window starts near click time.
    familyListVideos(apiBase)
      .then((v) => {
        if (!cancelled) setVideos(v)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [apiBase])

  if (error) return <Unavailable />
  if (!videos) return <p css={muted}>Loading…</p>

  if (playing) {
    return (
      <div>
        <button
          type="button"
          css={subtleButton}
          onClick={() => setPlaying(null)}
        >
          ← All videos
        </button>
        <h2
          css={css`
            margin: ${rhythm(0.75)} 0 ${rhythm(0.25)};
          `}
        >
          {playing.title}
        </h2>
        {playing.description ? <p css={muted}>{playing.description}</p> : null}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          controls
          autoPlay
          poster={playing.poster_url}
          src={playing.video_url}
          css={css`
            width: 100%;
            max-width: 720px;
            border-radius: ${radius.md};
            box-shadow: ${shadow.md};
          `}
        />
      </div>
    )
  }

  return (
    <div>
      <button type="button" css={subtleButton} onClick={onBack}>
        ← All galleries
      </button>
      <h2
        css={css`
          margin: ${rhythm(0.75)} 0 ${rhythm(0.5)};
        `}
      >
        Videos
      </h2>
      <ul
        css={css`
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: ${rhythm(0.75)};
        `}
      >
        {videos.map((video, i) => (
          <li key={`video-${i}`}>
            <button
              type="button"
              onClick={() => setPlaying(video)}
              css={css`
                border: 1px solid ${colors.borderLight};
                border-radius: ${radius.md};
                background: ${colors.surface};
                padding: 0.35rem;
                cursor: pointer;
                width: 100%;
                text-align: left;
              `}
            >
              <img
                src={video.poster_url}
                alt={video.title || "Video poster"}
                loading="lazy"
                css={css`
                  width: 100%;
                  display: block;
                  border-radius: ${radius.sm};
                `}
              />
              <span
                css={css`
                  display: block;
                  padding: 0.35rem 0.2rem 0.1rem;
                  font-family: ${fonts.heading};
                  font-size: 0.85rem;
                  color: ${colors.ink};
                `}
              >
                {video.title}
              </span>
              {video.date ? (
                <span
                  css={css`
                    display: block;
                    padding: 0 0.2rem;
                    font-family: ${fonts.mono};
                    font-size: 0.72rem;
                    color: ${colors.inkSubtle};
                  `}
                >
                  {video.date}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Archive({ apiBase, me, onSignOut }) {
  const [galleries, setGalleries] = React.useState(null)
  const [view, setView] = React.useState({ kind: "index" })
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    familyListGalleries(apiBase)
      .then((g) => {
        if (!cancelled) setGalleries(g)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [apiBase])

  return (
    <section css={card}>
      <div
        css={css`
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: ${rhythm(0.5)};
          flex-wrap: wrap;
          margin-bottom: ${rhythm(1)};
        `}
      >
        <h1
          css={css`
            margin-bottom: 0;
          `}
        >
          Family archive
        </h1>
        <span
          css={css`
            font-family: ${fonts.mono};
            font-size: 0.78rem;
            color: ${colors.inkSubtle};
          `}
        >
          {me.email} ·{" "}
          <button
            type="button"
            onClick={onSignOut}
            css={css`
              font: inherit;
              color: ${colors.accent};
              background: none;
              border: none;
              cursor: pointer;
              padding: 0;
            `}
          >
            sign out
          </button>
        </span>
      </div>

      {error ? <Unavailable /> : null}
      {!error && view.kind === "gallery" ? (
        <GalleryView
          apiBase={apiBase}
          name={view.name}
          onBack={() => setView({ kind: "index" })}
        />
      ) : null}
      {!error && view.kind === "videos" ? (
        <VideosView
          apiBase={apiBase}
          onBack={() => setView({ kind: "index" })}
        />
      ) : null}
      {!error && view.kind === "index" ? (
        galleries == null ? (
          <p css={muted}>Loading…</p>
        ) : (
          <ul
            css={css`
              list-style: none;
              margin: 0;
              padding: 0;
              display: flex;
              flex-direction: column;
              gap: ${rhythm(0.5)};
            `}
          >
            <li>
              <button
                type="button"
                onClick={() => setView({ kind: "videos" })}
                css={css`
                  width: 100%;
                  text-align: left;
                  cursor: pointer;
                  background: ${colors.accentMuted};
                  border: 1px solid ${colors.borderLight};
                  border-radius: ${radius.md};
                  padding: ${rhythm(0.6)} ${rhythm(0.8)};
                  font-family: ${fonts.heading};
                  font-size: 1rem;
                  color: ${colors.ink};
                `}
              >
                🎞 Videos
              </button>
            </li>
            {galleries.map((g) => (
              <li key={g.name}>
                <button
                  type="button"
                  onClick={() => setView({ kind: "gallery", name: g.name })}
                  css={css`
                    width: 100%;
                    text-align: left;
                    cursor: pointer;
                    background: ${colors.surface};
                    border: 1px solid ${colors.borderLight};
                    border-radius: ${radius.md};
                    padding: ${rhythm(0.6)} ${rhythm(0.8)};
                  `}
                >
                  <span
                    css={css`
                      font-family: ${fonts.heading};
                      font-size: 1rem;
                      color: ${colors.ink};
                    `}
                  >
                    {g.title}
                  </span>
                  <span
                    css={css`
                      float: right;
                      font-family: ${fonts.mono};
                      font-size: 0.75rem;
                      color: ${colors.inkSubtle};
                    `}
                  >
                    {g.count} photos
                  </span>
                  {g.description ? (
                    <span
                      css={css`
                        display: block;
                        margin-top: 0.2rem;
                        font-size: 0.85rem;
                        color: ${colors.inkMuted};
                      `}
                    >
                      {g.description}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </section>
  )
}

export default function FamilyPage() {
  // checking → signed-out | denied | ready | unavailable
  const [state, setState] = React.useState({ kind: "checking" })
  const apiBase = getApiBase()

  const refresh = React.useCallback(() => {
    if (!apiBase) {
      setState({ kind: "unavailable" })
      return
    }
    familyMe(apiBase)
      .then((me) => {
        if (me == null) {
          checkFamilySignInAvailable(apiBase)
            .then((availability) =>
              setState({ kind: "signed-out", availability })
            )
            .catch(() => setState({ kind: "signed-out", availability: null }))
        } else if (!me.allowed) {
          setState({ kind: "denied", me })
        } else {
          setState({ kind: "ready", me })
        }
      })
      .catch(() => setState({ kind: "unavailable" }))
  }, [apiBase])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  const signOut = React.useCallback(() => {
    familyLogout(apiBase)
      .catch(() => {})
      .then(() => refresh())
  }, [apiBase, refresh])

  return (
    <Layout>
      {state.kind === "checking" ? <p css={muted}>Loading…</p> : null}
      {state.kind === "unavailable" ? <Unavailable /> : null}
      {state.kind === "signed-out" ? (
        <SignedOut apiBase={apiBase} availability={state.availability} />
      ) : null}
      {state.kind === "denied" ? (
        <Denied me={state.me} onSignOut={signOut} />
      ) : null}
      {state.kind === "ready" ? (
        <Archive apiBase={apiBase} me={state.me} onSignOut={signOut} />
      ) : null}
    </Layout>
  )
}

export const Head = ({ data }) => (
  <SeoHead title="family" siteMetadata={data.site.siteMetadata} />
)

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
