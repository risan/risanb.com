import React from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import { graphql, StaticQuery } from 'gatsby';

const SiteMetadata = ({
  description,
  disableTitleTemplate,
  image,
  slug,
  title,
  websiteType,
}) => (
  <StaticQuery
    query={graphql`
      {
        site {
          siteMetadata {
            title
            description
            siteUrl
            lang
            locale
            twitter
          }
        }
        file(relativePath: { eq: "img/default-og.jpg" }) {
          childImageSharp {
            resize(width: 1200, cropFocus: CENTER) {
              src
              width
              height
            }
          }
        }
      }
    `}
    render={({ file, site }) => {
      const { siteMetadata } = site;

      const url = siteMetadata.siteUrl + slug;
      const metaDescription = description || siteMetadata.description;
      const img = image || file.childImageSharp.resize;

      return (
        <Helmet
          titleTemplate={
            disableTitleTemplate ? null : `%s | ${siteMetadata.title}`
          }
          defaultTitle={siteMetadata.title}
        >
          <html lang={siteMetadata.lang} />
          <title>{title}</title>
          <meta name="description" content={metaDescription} />

          <meta property="og:title" content={title} />
          <meta property="og:description" content={metaDescription} />
          <meta
            property="og:type"
            content={websiteType ? 'website' : 'article'}
          />
          <meta property="og:site_name" content={siteMetadata.title} />
          <meta property="og:locale" content={siteMetadata.locale} />
          <meta property="og:url" content={url} />
          <meta property="og:image" content={siteMetadata.siteUrl + img.src} />
          <meta property="og:image:width" content={img.width} />
          <meta property="og:image:height" content={img.height} />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content={siteMetadata.twitter} />
          <meta name="twitter:creator" content={siteMetadata.twitter} />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={metaDescription} />
          <meta name="twitter:image" content={siteMetadata.siteUrl + img.src} />

          <link rel="canonical" href={url} />
        </Helmet>
      );
    }}
  />
);

SiteMetadata.propTypes = {
  description: PropTypes.string,
  disableTitleTemplate: PropTypes.bool,
  image: PropTypes.shape({
    src: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
  }),
  slug: PropTypes.string,
  title: PropTypes.string,
  websiteType: PropTypes.bool,
};

SiteMetadata.defaultProps = {
  disableTitleTemplate: false,
  slug: '',
  websiteType: false,
};

export default SiteMetadata;
