import * as React from "react"
import { css } from "@emotion/react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import { SeoHead } from "../components/seo-head"
import { rhythm } from "../utils/typography"
import { theme } from "../styles/theme"

const { colors, fonts, radius, shadow } = theme

export default function AboutPage({ data }) {
  return (
    <Layout>
      <article
        css={css`
          background: ${colors.surface};
          border: 1px solid ${colors.borderLight};
          border-radius: ${radius.lg};
          box-shadow: ${shadow.md};
          padding: ${rhythm(1.75)} ${rhythm(1.5)} ${rhythm(2)};
        `}
      >
        <p
          css={css`
            font-family: ${fonts.heading};
            font-size: 0.72rem;
            font-weight: 600;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: ${colors.accent};
            margin-bottom: ${rhythm(0.5)};
          `}
        >
          About
        </p>
        <h1
          css={css`
            margin-bottom: ${rhythm(1)};
          `}
        >
          About {data.site.siteMetadata.title}
        </h1>
        <p
          css={css`
            color: ${colors.inkMuted};
            max-width: 38em;
          `}
        >
          We&apos;re the only site running on your computer dedicated to showing the
          best photos and videos of ∫ß eating lots of food.
        </p>
      </article>
    </Layout>
  )
}

export const Head = ({ data }) => (
  <SeoHead title="about" siteMetadata={data.site.siteMetadata} />
)

export const query = graphql`
  query {
    site {
      siteMetadata {
        title
        description
        author
      }
    }
  }
`
