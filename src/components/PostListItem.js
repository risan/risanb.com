import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import { formatDate } from '../utils/helpers';
import styles from './PostListItem.module.scss';

const PostListItem = ({ date, description, slug, timeToRead, title }) => (
  <article className={styles.item}>
    <h3 className={styles.title}>
      <Link to={slug}>{title}</Link>
    </h3>
    <p className={styles.description}>{description}</p>
    <p className={styles.info}>
      <span>{formatDate(date)}</span>
      <span>&middot;</span>
      <span>{timeToRead} min read</span>
    </p>
  </article>
);

PostListItem.propTypes = {
  date: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  timeToRead: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
};

export default PostListItem;
