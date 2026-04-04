import Typography from "typography"

const theme = {
  title: "nO EgO web typography",
  baseFontSize: "18px",
  baseLineHeight: 1.65,
  scaleRatio: 2,
  googleFonts: [
    { name: "Outfit", styles: ["500", "600", "700"] },
    { name: "Source Sans 3", styles: ["400", "500", "600", "400i"] },
  ],
  headerFontFamily: ["Outfit", "system-ui", "sans-serif"],
  bodyFontFamily: ["Source Sans 3", "Georgia", "serif"],
  headerWeight: 600,
  bodyWeight: 400,
  boldWeight: 600,
  headerColor: "hsl(222 40% 10%)",
  bodyColor: "hsl(218 14% 30%)",
  overrideStyles: ({ rhythm }) => ({
    body: {
      fontFeatureSettings: '"kern" 1, "liga" 1',
    },
    a: {
      color: "#1b4d7a",
      textDecoration: "none",
      borderBottom: "1px solid rgba(27, 77, 122, 0.35)",
    },
    "a:hover": {
      color: "#163d62",
      borderBottomColor: "rgba(22, 61, 98, 0.55)",
    },
    blockquote: {
      borderLeft: `4px solid #d1dae6`,
      paddingLeft: rhythm(3 / 4),
      marginLeft: 0,
      fontStyle: "normal",
      color: "hsl(218 12% 38%)",
    },
    "blockquote > :last-child": {
      marginBottom: 0,
    },
    hr: {
      background: "#e9eef5",
    },
    "h1,h2,h3,h4,h5,h6": {
      letterSpacing: "-0.02em",
    },
  }),
}

const typography = new Typography(theme)

export default typography
export const rhythm = typography.rhythm
