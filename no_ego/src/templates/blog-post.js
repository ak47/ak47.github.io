import React from "react"
import { css } from "@emotion/core"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm } from "../utils/typography"
import { theme } from "../styles/theme"

const { colors, fonts, radius, shadow } = theme

export default ({ data }) => {
  const post = data.markdownRemark
  return (
    <Layout>
      <SEO title={post.frontmatter.title} description={post.excerpt} />
      <article
        css={css`
          background: ${colors.surface};
          border: 1px solid ${colors.borderLight};
          border-radius: ${radius.lg};
          box-shadow: ${shadow.md};
          padding: ${rhythm(1.75)} ${rhythm(1.5)} ${rhythm(2)};
        `}
      >
        <header
          css={css`
            margin-bottom: ${rhythm(1.5)};
            padding-bottom: ${rhythm(1.25)};
            border-bottom: 1px solid ${colors.borderLight};
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
            Post
          </p>
          <h1
            css={css`
              margin-bottom: ${rhythm(0.35)};
            `}
          >
            {post.frontmatter.title}
          </h1>
        </header>
        <div
          css={css`
            & iframe {
              max-width: 100%;
              border-radius: ${radius.sm};
            }
            & p:last-child {
              margin-bottom: 0;
            }
          `}
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </article>
    </Layout>
  )
}

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
      }
      excerpt
    }
  }
`
