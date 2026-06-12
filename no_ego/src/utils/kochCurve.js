/**
 * Koch curve / snowflake generators (spec 002, US4 / FR-004).
 * Pure geometry, kept JSX-free so it is unit-testable in the node Jest env;
 * the koch-mark component renders the path this module produces.
 */

const SIN60 = Math.sqrt(3) / 2

/**
 * Subdivide the unit segment (0,0)→(1,0) `iterations` times.
 * @returns {Array<[{x,y},{x,y}]>} 4^iterations contiguous segments
 */
export function kochSegments(iterations) {
  let segments = [
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ],
  ]
  for (let i = 0; i < iterations; i++) {
    const next = []
    for (const [p, q] of segments) {
      const dx = (q.x - p.x) / 3
      const dy = (q.y - p.y) / 3
      const a = { x: p.x + dx, y: p.y + dy }
      const b = { x: p.x + 2 * dx, y: p.y + 2 * dy }
      // Outward peak: rotate the middle third by -60° around a
      const peak = {
        x: a.x + dx * 0.5 + dy * SIN60,
        y: a.y + dy * 0.5 - dx * SIN60,
      }
      next.push([p, a], [a, peak], [peak, b], [b, q])
    }
    segments = next
  }
  return segments
}

function edgePoints(from, to, iterations) {
  // Map the unit-curve points onto the edge from→to (excluding the endpoint,
  // which the next edge supplies).
  const dx = to.x - from.x
  const dy = to.y - from.y
  return kochSegments(iterations).map(([p]) => ({
    x: from.x + p.x * dx - p.y * dy,
    y: from.y + p.x * dy + p.y * dx,
  }))
}

/**
 * Closed Koch snowflake path fitted into a size×size viewbox.
 * @returns {string} SVG path data (M/L/Z)
 */
export function kochSnowflakePath(iterations, size) {
  // Equilateral triangle, centered horizontally; snowflake bumps extend
  // outward by 1/sqrt(3) of the edge, so inset accordingly.
  const inset = size / 6
  const side = size - 2 * inset
  const height = side * SIN60
  const top = (size - height) / 2 + height // triangle baseline placement
  const vertices = [
    { x: inset, y: top - height },
    { x: size - inset, y: top - height },
    { x: size / 2, y: top },
  ]
  const points = [
    ...edgePoints(vertices[0], vertices[1], iterations),
    ...edgePoints(vertices[1], vertices[2], iterations),
    ...edgePoints(vertices[2], vertices[0], iterations),
  ]
  const round = (v) => {
    const r = Math.round(v * 100) / 100
    return Math.min(size, Math.max(0, r))
  }
  const [first, ...rest] = points
  return (
    `M ${round(first.x)} ${round(first.y)} ` +
    rest.map((p) => `L ${round(p.x)} ${round(p.y)}`).join(" ") +
    " Z"
  )
}
