import React from 'react';
import PropTypes from 'prop-types';
import PostListItem from './PostListItem';

const PostList = ({ items }) => (
  <div>
    {items.map(({ fields, frontmatter, timeToRead }) => (
      <PostListItem
        key={fields.slug}
        slug={fields.slug}
        title={frontmatter.title}
        description={frontmatter.description}
        date={frontmatter.date}
        timeToRead={timeToRead}
      />
    ))}
  </div>
);

PostList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      fields: PropTypes.object.isRequired,
      frontmatter: PropTypes.object.isRequired,
      timeToRead: PropTypes.number,
    })
  ).isRequired,
};

export default PostList;
