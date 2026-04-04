module.exports = {
  siteMetadata: {
    title: `nO EgO`,
    description: `A simple site to explore things without the ego demanding perfection decimate goodness`,
    author: `developer of no-ego.net`,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `no-ego.net`,
        short_name: `no ego : humility is a virtue`,
        start_url: `/`,
        background_color: `#f3ece4`,
        theme_color: `#b54a32`,
        display: `standalone`,
        icon: `src/images/icon.png`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `src`,
        path: `${__dirname}/src/`,
      },
    },
    `gatsby-transformer-remark`,
    `gatsby-plugin-emotion`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
    `gatsby-plugin-offline`,
  ],
}
