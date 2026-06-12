/** Zen moments data + pick logic tests (spec 002, US4 / FR-005). */
import { ZEN_MOMENTS, rotationPool, pickZenMoment } from "./zen-moments"

describe("zen moments data", () => {
  test("all 33 recovered quotes are present", () => {
    expect(ZEN_MOMENTS).toHaveLength(33)
  })

  test("no entry contains HTML tags or SQL escape artifacts", () => {
    for (const z of ZEN_MOMENTS) {
      expect(z.text).not.toMatch(/<[a-z/][^>]*>/i)
      expect(z.text).not.toMatch(/\\['"nrt]/)
      expect(z.text).not.toMatch(/&[a-z]+;/i)
    }
  })

  test("every entry has text and an author", () => {
    for (const z of ZEN_MOMENTS) {
      expect(typeof z.text).toBe("string")
      expect(z.text.length).toBeGreaterThan(0)
      expect(typeof z.author).toBe("string")
    }
  })

  test("entries longer than 280 chars are flagged long and kept", () => {
    for (const z of ZEN_MOMENTS) {
      if (z.text.length > 280) {
        expect(z.long).toBe(true)
      } else {
        expect(z.long).toBeUndefined()
      }
    }
    // The Thoreau/Watts walls of text exist — the flag must be exercised
    expect(ZEN_MOMENTS.some((z) => z.long)).toBe(true)
  })
})

describe("rotation pool", () => {
  test("excludes long entries but keeps them in the data", () => {
    const pool = rotationPool()
    expect(pool.length).toBeLessThan(ZEN_MOMENTS.length)
    expect(pool.length).toBeGreaterThan(0)
    expect(pool.every((z) => !z.long)).toBe(true)
  })
})

describe("pickZenMoment", () => {
  test("returns a pool entry driven by the random source", () => {
    expect(pickZenMoment(() => 0)).toEqual(rotationPool()[0])
    expect(pickZenMoment(() => 0.999999)).toEqual(
      rotationPool()[rotationPool().length - 1]
    )
  })

  test("never returns a long entry", () => {
    for (let i = 0; i < 50; i++) {
      expect(pickZenMoment().long).toBeUndefined()
    }
  })
})
