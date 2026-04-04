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
  headerColor: "hsl(24 18% 14%)",
  bodyColor: "hsl(24 12% 28%)",
  overrideStyles: ({ rhythm }) => ({
    body: {
      fontFeatureSettings: '"kern" 1, "liga" 1',
    },
    a: {
      color: "#b54a32",
      textDecoration: "none",
      borderBottom: "1px solid rgba(181, 74, 50, 0.4)",
    },
    "a:hover": {
      color: "#923b29",
      borderBottomColor: "rgba(146, 59, 41, 0.55)",
    },
    blockquote: {
      borderLeft: `4px solid #ddd0c4`,
      paddingLeft: rhythm(3 / 4),
      marginLeft: 0,
      fontStyle: "normal",
      color: "hsl(24 10% 36%)",
    },
    "blockquote > :last-child": {
      marginBottom: 0,
    },
    hr: {
      background: "#ebe3da",
    },
    "h1,h2,h3,h4,h5,h6": {
      letterSpacing: "-0.02em",
    },
  }),
}

const typography = new Typography(theme)

export default typography
export const rhythm = typography.rhythm
