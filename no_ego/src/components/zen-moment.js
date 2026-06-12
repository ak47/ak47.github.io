/**
 * Footer zen moment (spec 002, US4 / FR-005): one random quote per page load
 * from the 33 recovered 2005 zen_moments (long ones excluded from rotation).
 * SSR-safe: picks only after mount, rendering nothing during hydration so the
 * server and client markup never diverge (research.md R2).
 */
import * as React from "react"
import { css } from "@emotion/react"
import { pickZenMoment } from "../data/zen-moments"
import { rhythm } from "../utils/typography"
import { theme } from "../styles/theme"

const { colors, fonts } = theme

export default function ZenMoment() {
  const [moment, setMoment] = React.useState(null)

  React.useEffect(() => {
    setMoment(pickZenMoment())
  }, [])

  if (!moment) return null

  return (
    <blockquote
      css={css`
        margin: 0;
        font-family: ${fonts.body};
        font-size: 0.85rem;
        font-style: italic;
        line-height: 1.5;
        color: ${colors.inkSubtle};
        border-left: 2px solid ${colors.heritage};
        padding-left: ${rhythm(0.5)};
        max-width: 44em;
      `}
    >
      {moment.text}
      {moment.author ? (
        <cite
          css={css`
            display: block;
            margin-top: 0.2rem;
            font-style: normal;
            font-size: 0.78rem;
          `}
        >
          — {moment.author}
        </cite>
      ) : null}
    </blockquote>
  )
}
