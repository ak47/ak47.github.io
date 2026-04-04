import * as React from "react"
import { css } from "@emotion/react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import { SeoHead } from "../components/seo-head"
import { rhythm } from "../utils/typography"

export default function NotFoundPage() {
  return (
    <Layout>
      <h1>Page not found</h1>
      <p
        css={css`
          margin-bottom: ${rhythm(1)};
        `}
      >
        That URL does not exist. Try the home page from the header.
      </p>
    </Layout>
  )
}

export const Head = ({ data }) => (
  <SeoHead title="404" siteMetadata={data.site.siteMetadata} />
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
