/**
 * Visual theme — tweak colors, radii, and shadows here to try new directions.
 * Accent pairs: swap `accent` + `accentMuted` for different brand moods.
 */
export const theme = {
  colors: {
    ink: "#0c1222",
    inkMuted: "#5a6578",
    inkSubtle: "#8b95a5",
    surface: "#ffffff",
    canvas: "#e8ecf2",
    canvasDeep: "#dce2eb",
    accent: "#1b4d7a",
    accentHover: "#163d62",
    accentMuted: "#e3eef8",
    border: "#d1dae6",
    borderLight: "#e9eef5",
    success: "#1d6b4a",
    warn: "#b45309",
  },
  fonts: {
    heading: `"Outfit", system-ui, -apple-system, sans-serif`,
    body: `"Source Sans 3", "Segoe UI", Georgia, serif`,
    mono: `"SF Mono", ui-monospace, Consolas, monospace`,
  },
  radius: {
    sm: "6px",
    md: "10px",
    lg: "14px",
    xl: "20px",
  },
  shadow: {
    sm: "0 1px 2px rgba(12, 18, 34, 0.05)",
    md: "0 4px 14px rgba(12, 18, 34, 0.07)",
    lg: "0 12px 40px rgba(12, 18, 34, 0.1)",
  },
  space: {
    headerH: "64px",
    maxContent: "760px",
    wideMax: "1100px",
  },
}
