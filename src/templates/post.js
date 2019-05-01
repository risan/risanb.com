import React, { useState } from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/Layout';
import Disqus from '../components/Disqus';
import { formatDate } from '../utils/helpers';
import styles from './post.module.scss';

export default ({ data, location }) => {
  const { post, site } = data;
  let { html } = post;

  const TOC_SELF_LINK_PATTERN = /(<li>\s?<a href="[\S]*#table-of-contents">\s?Table of Contents\s?<\/a>\s?<\/li>)/im;
  const TOC_HEADING_PATTERN = /(>\s?Table of Contents\s?<\/h2>)/im;

  if (post.tableOfContents) {
    const tocHtml = post.tableOfContents.replace(TOC_SELF_LINK_PATTERN, '');

    html = html.replace(TOC_HEADING_PATTERN, `$1${tocHtml}`);
  }

  const [commentsVisibility, setCommentsVisibility] = useState(false);

  return (
    <Layout
      title={post.frontmatter.title}
      description={post.frontmatter.description}
      image={
        post.frontmatter.image
          ? post.frontmatter.image.childImageSharp.resize
          : null
      }
      slug={post.fields.slug}
    >
      <article>
        <h1>{post.frontmatter.title}</h1>
        <p className={styles.info}>
          <span>{formatDate(post.frontmatter.date)}</span>
          <span>&middot;</span>
          <span>{post.timeToRead} min read</span>
        </p>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>

      {post.fields.comments && (
        <section className={styles.comments}>
          {commentsVisibility ? (
            <>
              <h3>Comments</h3>
              <Disqus
                shortname={site.siteMetadata.disqusShortname}
                pageSlug={post.fields.slug}
                pageTitle={post.frontmatter.title}
                pageUrl={location.href}
              />
            </>
          ) : (
            <button
              type="button"
              className="button button--primary"
              onClick={() => setCommentsVisibility(true)}
            >
              Load Comments
            </button>
          )}
        </section>
      )}
    </Layout>
  );
};

export const query = graphql`
  query($slug: String!) {
    post: markdownRemark(fields: { slug: { eq: $slug } }) {
      fields {
        comments
        slug
      }
      frontmatter {
        title
        date
        description
        image {
          childImageSharp {
            resize(width: 1200, cropFocus: CENTER) {
              src
              width
              height
            }
          }
        }
      }
      timeToRead
      html
      tableOfContents
    }
    site {
      siteMetadata {
        disqusShortname
      }
    }
  }
`;
