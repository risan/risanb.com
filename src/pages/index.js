import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/Layout';
import PostList from '../components/PostList';

import './index.scss';

export default ({ data }) => (
  <Layout
    title="Risan Bagja's Blog - Journal of a Passionate Coder"
    disableTitleTemplate
    className="home"
  >
    <section>
      <h1>Welcome to My Blog!</h1>
      <p>
        My name is Risan Bagja. I code for fun, seriously. I enjoy spending time
        writing clean and maintainable code. This blog serves as a journal to
        document things I learn as an avid programmer. Here you'll find
        articles, tutorials, and some quick tips about programming.
      </p>
    </section>

    <section>
      <h2>Recent Posts</h2>
      <PostList items={data.allMarkdownRemark.nodes} />
    </section>
  </Layout>
);

export const query = graphql`
  {
    allMarkdownRemark(
      limit: 3
      sort: { fields: frontmatter___date, order: DESC }
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
