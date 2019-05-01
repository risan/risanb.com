import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../../components/Layout';
import PostList from '../../components/PostList';

export default ({ data }) => (
  <Layout
    title="Programming Tips"
    slug="/tips/"
  >
    <section>
      <h1>All Tips</h1>
      <PostList items={data.allMarkdownRemark.nodes} compact />
    </section>
  </Layout>
);

export const query = graphql`
  {
    allMarkdownRemark(
      sort: { fields: frontmatter___date, order: DESC }
      filter: { fields: { slug: { regex: "/^\/tips\//" } } }
    ) {
      nodes {
        fields {
          slug
        }
        frontmatter {
          title
          date
        }
      }
    }
  }
`;
