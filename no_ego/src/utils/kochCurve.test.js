/** Koch curve generator tests (spec 002, US4 / FR-004). */
import { kochSegments, kochSnowflakePath } from "./kochCurve"

describe("kochSegments", () => {
  test("segment count is 4^n per iteration", () => {
    for (let n = 0; n <= 4; n++) {
      expect(kochSegments(n)).toHaveLength(4 ** n)
    }
  })

  test("curve endpoints are preserved", () => {
    const segs = kochSegments(3)
    expect(segs[0][0]).toEqual({ x: 0, y: 0 })
    expect(segs[segs.length - 1][1]).toEqual({ x: 1, y: 0 })
  })

  test("segments are contiguous", () => {
    const segs = kochSegments(2)
    for (let i = 1; i < segs.length; i++) {
      expect(segs[i][0]).toEqual(segs[i - 1][1])
    }
  })
})

describe("kochSnowflakePath", () => {
  test("produces a well-formed closed SVG path", () => {
    const d = kochSnowflakePath(2, 32)
    expect(d).toMatch(/^M /)
    expect(d.trim()).toMatch(/Z$/)
    // Only M/L commands, numbers, separators — no NaN or undefined
    expect(d).not.toMatch(/NaN|undefined/)
    expect(d).toMatch(/^[MLZ0-9 .,-]+$/)
  })

  test("snowflake has 3 * 4^n line segments", () => {
    const n = 2
    const d = kochSnowflakePath(n, 32)
    const lineCount = (d.match(/L /g) || []).length
    // 3 edges of 4^n segments; first point is the M, closing handled by Z
    expect(lineCount).toBe(3 * 4 ** n - 1)
  })

  test("all points stay within the viewbox", () => {
    const size = 32
    const d = kochSnowflakePath(3, size)
    const nums = d.match(/-?\d+(\.\d+)?/g).map(Number)
    for (const v of nums) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(size)
    }
  })
})
