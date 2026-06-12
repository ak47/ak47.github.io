/**
 * Koch snowflake site mark (spec 002, US4 / FR-004) — the 2005 site's
 * identity, generated programmatically rather than copied from the old GIF.
 * Geometry lives in utils/kochCurve.js (unit-tested there).
 */
import * as React from "react"
import { kochSnowflakePath } from "../utils/kochCurve"
import { theme } from "../styles/theme"

const { colors } = theme

const VIEWBOX = 32
const ITERATIONS = 3

export default function KochMark({ size = 18, title = "Koch snowflake mark" }) {
  const d = React.useMemo(() => kochSnowflakePath(ITERATIONS, VIEWBOX), [])
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <path
        d={d}
        fill="none"
        stroke={colors.heritage}
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
    </svg>
  )
}
