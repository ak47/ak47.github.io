import * as React from "react"
import { SiteMetadataProvider } from "./src/context/site-metadata"

export const wrapPageElement = ({ element, props }) => {
  const fromQuery = props?.data?.site?.siteMetadata
  return (
    <SiteMetadataProvider value={fromQuery || {}}>{element}</SiteMetadataProvider>
  )
}
