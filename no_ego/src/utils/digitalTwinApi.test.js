import { getApiBase, normalizeApiMessage } from "./digitalTwinApi"

describe("normalizeApiMessage", () => {
  it("maps visitor role to user", () => {
    expect(normalizeApiMessage({ role: "visitor", content: "hi" })).toEqual({
      id: null,
      role: "user",
      text: "hi",
      createdAt: null,
    })
  })

  it("maps twin role to assistant", () => {
    expect(
      normalizeApiMessage({ id: 1, role: "twin", content: "hello", created_at: "2026-01-01" })
    ).toEqual({
      id: 1,
      role: "assistant",
      text: "hello",
      createdAt: "2026-01-01",
    })
  })

  it("supports legacy user/assistant/text shape", () => {
    expect(normalizeApiMessage({ role: "user", text: "legacy" })).toEqual({
      id: null,
      role: "user",
      text: "legacy",
      createdAt: null,
    })
  })

  it("maps owner and human roles to owner", () => {
    expect(normalizeApiMessage({ role: "owner", content: "reply" }).role).toBe("owner")
    expect(normalizeApiMessage({ role: "human", content: "reply" }).role).toBe("owner")
  })
})

describe("getApiBase", () => {
  const savedBase = process.env.GATSBY_DIGITAL_TWIN_API_BASE
  const savedNodeEnv = process.env.NODE_ENV

  afterEach(() => {
    if (savedBase === undefined) delete process.env.GATSBY_DIGITAL_TWIN_API_BASE
    else process.env.GATSBY_DIGITAL_TWIN_API_BASE = savedBase
    process.env.NODE_ENV = savedNodeEnv
  })

  it("returns trimmed env value without trailing slash", () => {
    process.env.GATSBY_DIGITAL_TWIN_API_BASE = "  https://api.example.com/  "
    expect(getApiBase()).toBe("https://api.example.com")
  })

  it("falls back to production default when env is unset in production", () => {
    delete process.env.GATSBY_DIGITAL_TWIN_API_BASE
    process.env.NODE_ENV = "production"
    expect(getApiBase()).toBe("https://digital-twin.no-ego.net")
  })

  it("returns empty string in non-production when env is unset", () => {
    delete process.env.GATSBY_DIGITAL_TWIN_API_BASE
    process.env.NODE_ENV = "test"
    expect(getApiBase()).toBe("")
  })
})
