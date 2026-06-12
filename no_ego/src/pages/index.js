import * as React from "react"
import { css } from "@emotion/react"
import { Link, graphql } from "gatsby"
import { rhythm } from "../utils/typography"
import Layout from "../components/layout"
import { SeoHead } from "../components/seo-head"
import { theme } from "../styles/theme"

const { colors, fonts, radius, shadow } = theme

export default function IndexPage({ data }) {
  return (
    <Layout>
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
        <h1
          css={css`
            margin-bottom: ${rhythm(0.25)};
            line-height: 1.15;
          `}
        >
          Andrew Koch
        </h1>
        <p
          css={css`
            font-family: ${fonts.heading};
            font-size: 0.85rem;
            font-weight: 600;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: ${colors.accent};
            margin-bottom: ${rhythm(0.75)};
          `}
        >
          Staff software engineer
        </p>
        <p
          css={css`
            margin-bottom: ${rhythm(0.65)};
            color: ${colors.inkMuted};
            max-width: 36em;
          `}
        >
          I&apos;ve been building production software since 1999 — data
          platforms moving 100M+ records a week, payment-critical integrations,
          and the on-call, observability, and incident practices that keep them
          honest. These days my focus is AI-fluent engineering: using the new
          tools well, with the judgment of someone who has carried a pager.
        </p>
        <p
          css={css`
            margin-bottom: ${rhythm(1)};
            color: ${colors.inkMuted};
            max-width: 36em;
          `}
        >
          This site has been my sandbox since 2005, when it ran Rails 1.0. The{" "}
          <Link to="/about/">About page</Link> can answer questions about me —
          ask it anything.
        </p>
        <div
          css={css`
            display: flex;
            flex-wrap: wrap;
            gap: ${rhythm(0.5)};
          `}
        >
          <Link
            to="/about/"
            css={css`
              font-family: ${fonts.heading};
              font-size: 0.85rem;
              font-weight: 600;
              text-decoration: none;
              border-bottom: none;
              color: ${colors.surface};
              background: ${colors.accent};
              padding: 0.45rem 0.9rem;
              border-radius: ${radius.sm};
            `}
          >
            Ask the twin
          </Link>
          <a
            href="https://www.linkedin.com/in/papanomad/"
            target="_blank"
            rel="noopener noreferrer"
            css={css`
              font-family: ${fonts.heading};
              font-size: 0.85rem;
              font-weight: 600;
              text-decoration: none;
              border-bottom: none;
              color: ${colors.accent};
              background: ${colors.accentMuted};
              padding: 0.45rem 0.9rem;
              border-radius: ${radius.sm};
            `}
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/ak47"
            target="_blank"
            rel="noopener noreferrer"
            css={css`
              font-family: ${fonts.heading};
              font-size: 0.85rem;
              font-weight: 600;
              text-decoration: none;
              border-bottom: none;
              color: ${colors.accent};
              background: ${colors.accentMuted};
              padding: 0.45rem 0.9rem;
              border-radius: ${radius.sm};
            `}
          >
            GitHub
          </a>
        </div>
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
          Journal &amp; experiments
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
                transition:
                  transform 0.18s ease,
                  box-shadow 0.18s ease,
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

export const Head = ({ data }) => (
  <SeoHead title="home" siteMetadata={data.site.siteMetadata} />
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
    allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
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
