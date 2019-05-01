import React from 'react';
import PropTypes from 'prop-types';
import PostListItem from './PostListItem';
import PostListItemCompact from './PostListItemCompact';

const PostList = ({ compact = false, items }) =>
  compact ? (
    <ul style={{ paddingLeft: 0 }}>
      {items.map(({ fields, frontmatter }) => (
        <PostListItemCompact
          key={fields.slug}
          slug={fields.slug}
          title={frontmatter.title}
          date={frontmatter.date}
        />
      ))}
    </ul>
  ) : (
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
  compact: PropTypes.bool,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      fields: PropTypes.object.isRequired,
      frontmatter: PropTypes.object.isRequired,
      timeToRead: PropTypes.number,
    })
  ).isRequired,
};

export default PostList;
