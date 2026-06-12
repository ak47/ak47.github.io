/**
 * familyApi client tests (spec 002, US2) — mirrors digitalTwinApi.test.js.
 * Contract: specs/002-site-refresh/contracts/family-api.md
 */
import {
  familyMe,
  familyListGalleries,
  familyGetGallery,
  familyListVideos,
  familyLogout,
  checkFamilySignInAvailable,
} from "./familyApi"

const API = "https://digital-twin.example"

function mockFetchOnce(response) {
  global.fetch = jest.fn().mockResolvedValue(response)
}

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    type: "basic",
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(JSON.stringify(body)),
  }
}

afterEach(() => {
  jest.restoreAllMocks()
  delete global.fetch
})

describe("credentials handling", () => {
  test("every family call sends credentials: include", async () => {
    mockFetchOnce(
      jsonResponse(200, { email: "fam@example.com", allowed: true })
    )
    await familyMe(API)
    expect(global.fetch).toHaveBeenCalledWith(
      `${API}/family/me`,
      expect.objectContaining({ credentials: "include" })
    )
  })
})

describe("familyMe", () => {
  test("returns session info when authenticated", async () => {
    mockFetchOnce(
      jsonResponse(200, { email: "fam@example.com", allowed: true })
    )
    const me = await familyMe(API)
    expect(me).toEqual({ email: "fam@example.com", allowed: true })
  })

  test("returns null on 401 (signed out)", async () => {
    mockFetchOnce(jsonResponse(401, { detail: "Not authenticated" }))
    expect(await familyMe(API)).toBeNull()
  })

  test("reports allowed: false for denied accounts", async () => {
    mockFetchOnce(jsonResponse(200, { email: "x@example.com", allowed: false }))
    const me = await familyMe(API)
    expect(me.allowed).toBe(false)
  })
})

describe("galleries", () => {
  test("familyListGalleries returns the gallery array", async () => {
    mockFetchOnce(
      jsonResponse(200, {
        galleries: [{ name: "amsterdam", title: "Amsterdam", count: 2 }],
      })
    )
    const galleries = await familyListGalleries(API)
    expect(galleries).toHaveLength(1)
    expect(galleries[0].name).toBe("amsterdam")
  })

  test("familyGetGallery returns items with signed URLs", async () => {
    mockFetchOnce(
      jsonResponse(200, {
        name: "amsterdam",
        title: "Amsterdam",
        items: [
          { caption: null, thumb_url: "https://s/t", full_url: "https://s/f" },
        ],
      })
    )
    const gallery = await familyGetGallery(API, "amsterdam")
    expect(gallery.items[0].full_url).toBe("https://s/f")
    expect(global.fetch).toHaveBeenCalledWith(
      `${API}/family/galleries/amsterdam`,
      expect.objectContaining({ credentials: "include" })
    )
  })

  test("errors carry status and detail (403 not on the list)", async () => {
    mockFetchOnce(jsonResponse(403, { detail: "Email not on the family list" }))
    await expect(familyListGalleries(API)).rejects.toMatchObject({
      status: 403,
      message: "Email not on the family list",
    })
  })

  test("unknown gallery surfaces 404", async () => {
    mockFetchOnce(jsonResponse(404, { detail: "Unknown gallery" }))
    await expect(familyGetGallery(API, "nope")).rejects.toMatchObject({
      status: 404,
    })
  })
})

describe("videos", () => {
  test("familyListVideos returns the video array", async () => {
    mockFetchOnce(
      jsonResponse(200, {
        videos: [
          {
            title: "Honey Plays Ball",
            video_url: "https://s/v.mp4",
            poster_url: "https://s/p.jpg",
          },
        ],
      })
    )
    const videos = await familyListVideos(API)
    expect(videos[0].title).toBe("Honey Plays Ball")
  })
})

describe("logout", () => {
  test("posts to /family/logout and tolerates 204", async () => {
    mockFetchOnce({
      ok: true,
      status: 204,
      type: "basic",
      text: jest.fn().mockResolvedValue(""),
    })
    await expect(familyLogout(API)).resolves.toBeNull()
    expect(global.fetch).toHaveBeenCalledWith(
      `${API}/family/logout`,
      expect.objectContaining({ method: "POST", credentials: "include" })
    )
  })
})

describe("checkFamilySignInAvailable", () => {
  test("opaque redirect means OAuth is wired", async () => {
    mockFetchOnce({ ok: false, status: 0, type: "opaqueredirect" })
    expect(await checkFamilySignInAvailable(API)).toEqual({ ok: true })
  })

  test("503 surfaces the configuration detail", async () => {
    mockFetchOnce(jsonResponse(503, { detail: "OAuth not configured" }))
    expect(await checkFamilySignInAvailable(API)).toEqual({
      ok: false,
      detail: "OAuth not configured",
    })
  })
})
