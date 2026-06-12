/**
 * Copy-level assertions for the landing and About pages (spec 002, US1).
 * The Jest environment here is node-only (no JSX transform / jsdom), so these
 * tests assert on page source content rather than rendered output.
 */
const fs = require("fs")
const path = require("path")

const read = (name) => fs.readFileSync(path.join(__dirname, name), "utf8")

describe("landing page (index.js)", () => {
  const src = read("index.js")

  test("hero introduces Andrew Koch, staff software engineer", () => {
    expect(src).toContain("Andrew Koch")
    expect(src).toContain("Staff software engineer")
    expect(src).toContain("building production software since 1999")
  })

  test("hero links to twin chat, LinkedIn, and GitHub", () => {
    expect(src).toContain('to="/about/"')
    expect(src).toContain("https://www.linkedin.com/in/papanomad/")
    expect(src).toContain("https://github.com/ak47")
  })

  test("no joke/placeholder copy remains above the fold", () => {
    expect(src).not.toContain("Cute Xi Pandas")
    expect(src).not.toContain("transitive closure")
    expect(src).not.toContain("mock content")
  })

  test("journal list stays below the hero", () => {
    expect(src).toContain("Journal &amp; experiments")
    const hero = src.indexOf("Andrew Koch")
    const journal = src.indexOf("Journal &amp; experiments")
    expect(hero).toBeGreaterThan(-1)
    expect(journal).toBeGreaterThan(hero)
    expect(src).toContain("allMarkdownRemark")
  })
})

describe("family page (family.js)", () => {
  const src = read("family.js")

  test("covers all client states incl. polite denied state (US3)", () => {
    expect(src).toContain('"signed-out"')
    expect(src).toContain('"denied"')
    expect(src).toContain('"ready"')
    expect(src).toContain('"unavailable"')
    expect(src).toContain("Not on the list")
    expect(src).toContain("Sign in with Google")
  })

  test("uses the family API client and signed-URL-at-open pattern", () => {
    expect(src).toContain("familyGetGallery")
    expect(src).toContain("familyListVideos")
    expect(src).toContain("<video")
    expect(src).toContain("poster=")
  })
})

describe("layout (layout.js)", () => {
  const src = require("fs").readFileSync(
    require("path").join(__dirname, "..", "components", "layout.js"),
    "utf8"
  )

  test("family link lives in the footer, not the nav", () => {
    const navEnd = src.indexOf("</nav>")
    const familyLink = src.indexOf('to="/family/"')
    expect(familyLink).toBeGreaterThan(navEnd)
  })
})

describe("about page (about.js)", () => {
  const src = read("about.js")

  test("joke paragraph replaced with real copy", () => {
    expect(src).not.toContain("∫ß eating lots of food")
    expect(src).toContain("digital twin")
    expect(src).toContain("since 1999")
  })

  test("twin chat, model-info line, and warranty joke are preserved", () => {
    expect(src).toContain("DigitalTwinChat")
    expect(src).toContain("loadLlmModelInfo")
    expect(src).toContain("warranty stays with the mammal")
    expect(src).toContain("https://www.linkedin.com/in/papanomad/")
  })
})
