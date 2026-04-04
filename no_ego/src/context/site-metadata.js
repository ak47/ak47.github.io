import * as React from "react"
import { SITE_DEFAULTS } from "../site-defaults"

export const SiteMetadataContext = React.createContext(SITE_DEFAULTS)

export function SiteMetadataProvider({ value, children }) {
  const merged = { ...SITE_DEFAULTS, ...value }
  return (
    <SiteMetadataContext.Provider value={merged}>
      {children}
    </SiteMetadataContext.Provider>
  )
}
