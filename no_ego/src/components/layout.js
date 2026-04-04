import React, { useState, useEffect, useCallback } from "react"
import { css, Global } from "@emotion/react"
import { useStaticQuery, Link, graphql } from "gatsby"

import { rhythm } from "../utils/typography"
import { theme } from "../styles/theme"
import {
  BG_PALETTE,
  BG_TRANSITION_MS,
  BG_HOLD_MS,
} from "../styles/bgPalette"

const { colors, fonts, radius, shadow, space } = theme

function pickNextBg(current) {
  if (BG_PALETTE.length < 2) return current
  let next = current
  let guard = 0
  while (next === current && guard < 12) {
    next = BG_PALETTE[Math.floor(Math.random() * BG_PALETTE.length)]
    guard += 1
  }
  return next
}

const navLink = css`
  font-family: ${fonts.heading};
  font-weight: 500;
  font-size: 0.92rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: ${colors.inkMuted};
  text-decoration: none;
  border-bottom: none;
  padding: 0.35rem 0.65rem;
  border-radius: ${radius.sm};
  transition: color 0.15s ease, background 0.15s ease;

  &:hover {
    color: ${colors.accent};
    background: ${colors.accentMuted};
  }
`

export default ({ children }) => {
  const [bgColor, setBgColor] = useState(() => BG_PALETTE[0])

  const advanceBg = useCallback(() => {
    setBgColor(prev => pickNextBg(prev))
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return undefined
    const id = window.setInterval(advanceBg, BG_HOLD_MS)
    return () => window.clearInterval(id)
  }, [advanceBg])

  const data = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
      }
    `
  )

  return (
    <>
      <Global
        styles={css`
          html {
            background-color: ${bgColor};
            transition: background-color ${BG_TRANSITION_MS}ms ease-in-out;
            min-height: 100%;
          }
          body {
            min-height: 100%;
          }
          ::selection {
            background: ${colors.accentMuted};
            color: ${colors.ink};
          }
        `}
      />
      <div
        css={css`
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        `}
      >
        <header
          css={css`
            position: sticky;
            top: 0;
            z-index: 40;
            background: ${colors.surface};
            border-bottom: 1px solid ${colors.border};
            box-shadow: ${shadow.sm};
          `}
        >
          <div
            css={css`
              max-width: ${space.wideMax};
              margin: 0 auto;
              padding: 0 ${rhythm(1)};
              height: ${space.headerH};
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: ${rhythm(1)};
            `}
          >
            <Link
              to="/"
              css={css`
                font-family: ${fonts.heading};
                font-weight: 700;
                font-size: 1.05rem;
                letter-spacing: 0.06em;
                color: ${colors.ink};
                text-decoration: none;
                border-bottom: none;
                display: flex;
                align-items: baseline;
                gap: 0.35rem;

                &:hover {
                  color: ${colors.accent};
                }
              `}
            >
              {data.site.siteMetadata.title}
              <span
                css={css`
                  font-weight: 500;
                  font-size: 0.65rem;
                  letter-spacing: 0.12em;
                  text-transform: uppercase;
                  color: ${colors.inkSubtle};
                `}
              >
                studio
              </span>
            </Link>
            <nav
              css={css`
                display: flex;
                align-items: center;
                gap: 0.15rem;
                flex-shrink: 0;
              `}
            >
              <Link to="/about/" css={navLink}>
                About
              </Link>
              <Link to="/my-files/" css={navLink}>
                Files
              </Link>
            </nav>
          </div>
        </header>

        <main
          css={css`
            flex: 1;
            width: 100%;
            max-width: ${space.wideMax};
            margin: 0 auto;
            padding: ${rhythm(2)} ${rhythm(1)} ${rhythm(3)};
          `}
        >
          <div
            css={css`
              max-width: ${space.maxContent};
              margin: 0 auto;
            `}
          >
            {children}
          </div>
        </main>

        <footer
          css={css`
            margin-top: auto;
            border-top: 1px solid ${colors.border};
            background: ${colors.surface};
            padding: ${rhythm(1.25)} ${rhythm(1)};
          `}
        >
          <div
            css={css`
              max-width: ${space.wideMax};
              margin: 0 auto;
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              justify-content: space-between;
              gap: ${rhythm(0.75)};
              font-family: ${fonts.body};
              font-size: 0.88rem;
              color: ${colors.inkSubtle};
            `}
          >
            <span>Web applications and engineering practice</span>
            <span
              css={css`
                font-family: ${fonts.mono};
                font-size: 0.8rem;
              `}
            >
              © {new Date().getFullYear()} {data.site.siteMetadata.title}
            </span>
          </div>
        </footer>
      </div>
    </>
  )
}
