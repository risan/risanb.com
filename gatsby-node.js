const path = require('path');
const { createFilePath } = require('gatsby-source-filesystem');
const _ = require('lodash');
const { siteMetadata } = require('./gatsby-config');

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;

  if (node.internal.type === 'MarkdownRemark') {
    createNodeField({
      node,
      name: 'slug',
      value: createFilePath({ node, getNode }),
    });

    createNodeField({
      node,
      name: 'comments',
      value: _.has(siteMetadata, 'disqusShortname')
        && _.get(node, 'frontmatter.comments', true),
    });
  }
};

exports.createPages = async ({ graphql, actions }) => {
  const { data } = await graphql(`
    {
      allMarkdownRemark {
        nodes {
          fields {
            slug
          }
        }
      }
    }
  `);

  const component = path.resolve('./src/templates/post.js');

  data.allMarkdownRemark.nodes.forEach(node => {
    actions.createPage({
      path: node.fields.slug,
      component,
      context: {
        slug: node.fields.slug,
      },
    });
  });
};
