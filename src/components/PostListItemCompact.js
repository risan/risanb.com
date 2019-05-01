import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import { formatDate } from '../utils/helpers';
import styles from './PostListItemCompact.module.scss';

const PostListItemCompact = ({ date, slug, title }) => (
  <li className={styles.item}>
    <Link to={slug}>{title}</Link>
    <span className={styles.date}>{formatDate(date)}</span>
  </li>
);

PostListItemCompact.propTypes = {
  date: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default PostListItemCompact;
