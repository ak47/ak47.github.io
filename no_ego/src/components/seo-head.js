import * as React from "react"
import PropTypes from "prop-types"
import { useStaticQuery, graphql } from "gatsby"

export function SeoHead({ title, description, lang = "en", meta = [] }) {
  const { site } = useStaticQuery(
    graphql`
      query SeoHeadSite {
        site {
          siteMetadata {
            title
            description
            author
          }
        }
      }
    `
  )

  const metaDescription = description || site.siteMetadata.description
  const siteTitle = site.siteMetadata.title

  return (
    <>
      <html lang={lang} />
      <title>{title} | {siteTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:creator" content={site.siteMetadata.author} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={metaDescription} />
      {meta.map((m, i) => {
        if (m.name) {
          return <meta key={i} name={m.name} content={m.content} />
        }
        if (m.property) {
          return <meta key={i} property={m.property} content={m.content} />
        }
        return null
      })}
    </>
  )
}

SeoHead.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.arrayOf(PropTypes.object),
}
