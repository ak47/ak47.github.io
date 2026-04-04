import * as React from "react"
import { css } from "@emotion/react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import { SeoHead } from "../components/seo-head"
import { rhythm } from "../utils/typography"
import { theme } from "../styles/theme"

const { colors, fonts, radius, shadow } = theme

export default function MyFilesPage({ data }) {
  return (
    <Layout>
      <article
        css={css`
          background: ${colors.surface};
          border: 1px solid ${colors.borderLight};
          border-radius: ${radius.lg};
          box-shadow: ${shadow.md};
          padding: ${rhythm(1.75)} ${rhythm(1.25)} ${rhythm(2)};
          overflow-x: auto;
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
          Repository
        </p>
        <h1
          css={css`
            margin-bottom: ${rhythm(1.25)};
          `}
        >
          My Site&apos;s Files
        </h1>
        <table
          css={css`
            width: 100%;
            border-collapse: collapse;
            font-size: 0.92rem;
            font-family: ${fonts.mono};

            th,
            td {
              text-align: left;
              padding: 0.65rem 0.85rem;
              border-bottom: 1px solid ${colors.borderLight};
            }

            th {
              font-family: ${fonts.heading};
              font-size: 0.7rem;
              font-weight: 600;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              color: ${colors.inkMuted};
              background: ${colors.accentMuted};
              border-bottom-color: ${colors.border};
            }

            tbody tr:nth-of-type(even) {
              background: rgba(227, 238, 248, 0.35);
            }

            tbody tr:hover {
              background: ${colors.accentMuted};
            }

            tbody tr:last-child td {
              border-bottom: none;
            }
          `}
        >
          <thead>
            <tr>
              <th>relativePath</th>
              <th>prettySize</th>
              <th>extension</th>
              <th>birthTime</th>
            </tr>
          </thead>
          <tbody>
            {data.allFile.edges.map(({ node }) => (
              <tr key={node.relativePath}>
                <td>{node.relativePath}</td>
                <td>{node.prettySize}</td>
                <td>{node.extension}</td>
                <td>{node.birthTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </Layout>
  )
}

export const Head = ({ data }) => (
  <SeoHead title="files" siteMetadata={data.site.siteMetadata} />
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
    allFile {
      edges {
        node {
          relativePath
          prettySize
          extension
          birthTime(fromNow: true)
        }
      }
    }
  }
`
