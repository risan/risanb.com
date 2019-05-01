import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../../components/Layout';
import PostList from '../../components/PostList';

export default ({ data }) => (
  <Layout
    title="Programming Articles and Tutorials"
    slug="/blog/"
  >
    <section>
      <h1>All Posts</h1>
      <PostList items={data.allMarkdownRemark.nodes} />
    </section>
  </Layout>
);

export const query = graphql`
  {
    allMarkdownRemark(
      sort: { fields: frontmatter___date, order: DESC }
      filter: { fields: { slug: { regex: "/^\/blog\//" } } }
    ) {
      nodes {
        fields {
          slug
        }
        frontmatter {
          title
          date
          description
        }
        timeToRead
      }
    }
  }
`;
