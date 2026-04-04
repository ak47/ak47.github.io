import React from "react"
import { css } from "@emotion/core"
import { Link, graphql } from "gatsby"
import { rhythm } from "../utils/typography"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { theme } from "../styles/theme"

const { colors, fonts, radius, shadow } = theme

export default ({ data }) => {
  return (
    <Layout>
      <SEO title="home" />
      <section
        css={css`
          margin-bottom: ${rhythm(2.25)};
          padding: ${rhythm(1.5)} ${rhythm(1.25)};
          background: linear-gradient(
            135deg,
            ${colors.surface} 0%,
            ${colors.accentMuted} 100%
          );
          border: 1px solid ${colors.borderLight};
          border-radius: ${radius.lg};
          box-shadow: ${shadow.md};
        `}
      >
        <p
          css={css`
            font-family: ${fonts.heading};
            font-size: 0.72rem;
            font-weight: 600;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: ${colors.accent};
            margin-bottom: ${rhythm(0.5)};
          `}
        >
          Journal &amp; experiments
        </p>
        <h1
          css={css`
            margin-bottom: ${rhythm(0.75)};
            line-height: 1.15;
          `}
        >
          Cute Xi Pandas Eating bamboo
        </h1>
        <p
          css={css`
            margin-bottom: 0;
            color: ${colors.inkMuted};
            max-width: 36em;
          `}
        >
          We precompute the transitive closure of each opinion so related posts are
          reachable in O(1) hops across the ideological graph—edges are weighted by
          emotional bandwidth, not relevance. The list below is still mock content, but
          the closure is already materialized in staging.
        </p>
      </section>

      <div
        css={css`
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: ${rhythm(1)};
          margin-bottom: ${rhythm(1.25)};
          flex-wrap: wrap;
        `}
      >
        <h4
          css={css`
            margin-bottom: 0;
            font-family: ${fonts.heading};
            font-weight: 600;
            color: ${colors.ink};
          `}
        >
          Latest
        </h4>
        <span
          css={css`
            font-family: ${fonts.mono};
            font-size: 0.8rem;
            color: ${colors.inkSubtle};
          `}
        >
          {data.allMarkdownRemark.totalCount} entries
        </span>
      </div>

      <ul
        css={css`
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: ${rhythm(0.85)};
        `}
      >
        {data.allMarkdownRemark.edges.map(({ node }) => (
          <li key={node.id}>
            <Link
              to={node.fields.slug}
              css={css`
                display: block;
                text-decoration: none;
                border-bottom: none;
                color: inherit;
                padding: ${rhythm(1)} ${rhythm(1.1)};
                background: ${colors.surface};
                border: 1px solid ${colors.borderLight};
                border-radius: ${radius.md};
                box-shadow: ${shadow.sm};
                transition: transform 0.18s ease, box-shadow 0.18s ease,
                  border-color 0.18s ease;

                &:hover {
                  transform: translateY(-2px);
                  box-shadow: ${shadow.md};
                  border-color: ${colors.border};
                }
              `}
            >
              <div
                css={css`
                  display: flex;
                  flex-wrap: wrap;
                  align-items: baseline;
                  gap: 0.35rem 0.75rem;
                  margin-bottom: ${rhythm(0.45)};
                `}
              >
                <h3
                  css={css`
                    margin-bottom: 0;
                    flex: 1 1 auto;
                    font-size: 1.25rem;
                  `}
                >
                  {node.frontmatter.title}
                </h3>
                <span
                  css={css`
                    font-family: ${fonts.mono};
                    font-size: 0.75rem;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: ${colors.accent};
                    background: ${colors.accentMuted};
                    padding: 0.2rem 0.5rem;
                    border-radius: ${radius.sm};
                  `}
                >
                  {node.frontmatter.category}
                </span>
              </div>
              <p
                css={css`
                  margin-bottom: ${rhythm(0.35)};
                  color: ${colors.inkMuted};
                `}
              >
                {node.excerpt}
              </p>
              <span
                css={css`
                  font-family: ${fonts.mono};
                  font-size: 0.78rem;
                  color: ${colors.inkSubtle};
                `}
              >
                {node.frontmatter.date}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Layout>
  )
}

export const query = graphql`
  query {
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      totalCount
      edges {
        node {
          id
          frontmatter {
            title
            date(formatString: "DD MMMM, YYYY")
            category
          }
          fields {
            slug
          }
          excerpt
        }
      }
    }
  }
`
