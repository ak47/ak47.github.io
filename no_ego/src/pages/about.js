import * as React from "react"
import { css } from "@emotion/react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import DigitalTwinChat from "../components/digital-twin-chat"
import { SeoHead } from "../components/seo-head"
import { getApiBase, loadLlmModelInfo } from "../utils/digitalTwinApi"
import { rhythm } from "../utils/typography"
import { theme } from "../styles/theme"

const { colors, fonts, radius, shadow, space } = theme

export default function AboutPage({ data }) {
  const [llmInfo, setLlmInfo] = React.useState(null)
  const [llmError, setLlmError] = React.useState(false)

  React.useEffect(() => {
    const base = getApiBase()
    if (!base) {
      setLlmInfo(null)
      setLlmError(false)
      return undefined
    }
    let cancelled = false
    loadLlmModelInfo(base)
      .then((info) => {
        if (!cancelled) {
          setLlmInfo(info)
          setLlmError(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLlmInfo(null)
          setLlmError(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Layout contentMaxWidth={space.wideMax}>
      <article
        css={css`
          background: ${colors.surface};
          border: 1px solid ${colors.borderLight};
          border-radius: ${radius.lg};
          box-shadow: ${shadow.md};
          padding: ${rhythm(1.75)} ${rhythm(1.5)} ${rhythm(2)};
          display: grid;
          grid-template-columns: 1fr;
          gap: ${rhythm(1.75)};
          align-items: start;

          @media (min-width: 900px) {
            grid-template-columns: minmax(240px, 300px) minmax(0, 1fr);
            gap: ${rhythm(2)} ${rhythm(2.5)};
            padding: ${rhythm(1.75)} ${rhythm(1.75)} ${rhythm(2)};
          }

          @media (max-width: 640px) {
            padding: ${rhythm(1.15)} ${rhythm(0.65)} ${rhythm(1.35)};
            border-radius: ${radius.md};
          }
        `}
      >
        <header
          css={css`
            @media (min-width: 900px) {
              position: sticky;
              top: calc(${space.headerH} + ${rhythm(1)});
            }
          `}
        >
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
          <p
            css={css`
              margin: ${rhythm(1)} 0 0;
              max-width: 38em;
              font-family: ${fonts.body};
              font-size: 0.8rem;
              line-height: 1.45;
              color: ${colors.inkSubtle};
            `}
          >
            Powered by the digital-twin API. Your thread is saved per browser via{" "}
            <code css={css`font-family: ${fonts.mono}; font-size: 0.9em;`}>
              X-Session-Id
            </code>
            .
          </p>
          {llmInfo && llmInfo.modelId ? (
            <p
              css={css`
                margin: ${rhythm(0.85)} 0 0;
                max-width: 38em;
                font-family: ${fonts.body};
                font-size: 0.8rem;
                line-height: 1.45;
                color: ${colors.inkSubtle};
              `}
            >
              LLM:{" "}
              <code
                css={css`
                  font-family: ${fonts.mono};
                  font-size: 0.9em;
                `}
              >
                {llmInfo.modelId}
              </code>
              {llmInfo.provider ? ` (${llmInfo.provider})` : ""}
            </p>
          ) : null}
          {llmError ? (
            <p
              css={css`
                margin: ${rhythm(0.85)} 0 0;
                max-width: 38em;
                font-size: 0.8rem;
                color: ${colors.inkMuted};
              `}
            >
              Couldn&apos;t load model info from the API.
            </p>
          ) : null}
          <p
            css={css`
              margin: ${rhythm(0.85)} 0 0;
              max-width: 38em;
              font-family: ${fonts.body};
              font-size: 0.8rem;
              line-height: 1.45;
              color: ${colors.inkSubtle};
            `}
          >
            The mirror runs on tokens; the warranty stays with the mammal on{" "}
            <a
              href="https://www.linkedin.com/in/papanomad/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            .
          </p>
        </header>
        <div
          css={css`
            min-width: 0;
            min-height: min(58vh, 520px);
            display: flex;
            flex-direction: column;

            @media (min-width: 900px) {
              min-height: min(calc(100vh - ${space.headerH} - ${rhythm(5)}), 720px);
              border-left: 1px solid ${colors.borderLight};
              padding-left: ${rhythm(2)};
              margin-left: 0;
            }

            @media (max-width: 899px) {
              padding-top: ${rhythm(0.5)};
              border-top: 1px solid ${colors.borderLight};
            }
          `}
        >
          <DigitalTwinChat />
        </div>
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
