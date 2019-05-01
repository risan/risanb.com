module.exports = {
  siteMetadata: {
    title: 'Risan Bagja',
    description: 'Programming journal of Risan Bagja Pradana. A passionate coder who writes codes for fun. Seriously.',
    siteUrl: 'https://risan.netlify.com',
    lang: 'en',
    locale: 'en_US',
    twitter: '@risanbagja',
    disqusShortname: 'risanb',
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-feed',
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query }) => query.allMarkdownRemark.nodes.map(node => ({
              ...node.frontmatter,
              url: query.site.siteMetadata.site_url + node.fields.slug,
              guid: query.site.siteMetadata.site_url + node.fields.slug,
              custom_elements: [{ "content:encoded": node.html }],
            })),
            query: `
              {
                allMarkdownRemark(
                  sort: { order: DESC, fields: [frontmatter___date] },
                ) {
                  nodes {
                    html
                    fields {
                      slug
                    }
                    frontmatter {
                      title
                      date
                      description
                    }
                  }
                }
              }
            `,
            output: '/rss.xml',
            title: "Your Site's RSS Feed",
          },
        ],
      },
    },
    {
      resolve: 'gatsby-plugin-google-analytics',
      options: {
        trackingId: 'UA-27136969-15',
        anonymize: true,
        respectDNT: true,
      },
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'Risan Bagja',
        short_name: 'risanb.com',
        start_url: '/',
        background_color: '#ffffff',
        theme_color: '#212529',
        display: 'minimal-ui',
        icon: 'content/img/earth.png',
      },
    },
    {
      resolve: 'gatsby-plugin-sass',
      options: {
        implementation: require('sass'),
      },
    },
    'gatsby-plugin-sharp',
    'gatsby-plugin-sitemap',
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'src',
        path: `${__dirname}/src/`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'content',
        path: `${__dirname}/content/`,
      },
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 656,
              showCaptions: true,
              tracedSVG: true,
            },
          },
          'gatsby-remark-autolink-headers', // Must be placed before prismjs
          'gatsby-remark-prismjs',
        ],
      },
    },
    'gatsby-transformer-sharp',
  ],
}
