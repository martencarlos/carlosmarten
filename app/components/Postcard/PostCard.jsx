import React from 'react';
import Link from 'next/link';
import styles from './postcard.module.css';

const PostCard = ({ post }) => {
  const createDate = new Date(post.date).toLocaleDateString();
  const lastModified = new Date(post.modified).toLocaleDateString();

  const categories = post._embedded['wp:term']
    .flat()
    .filter(term => term.taxonomy === 'category')
    .map(category => category.name);

  const tags = post._embedded['wp:term']
    .flat()
    .filter(term => term.taxonomy === 'post_tag')
    .map(tag => tag.name);

  const author = post._embedded['author'][0].name;

  return (
    <div className={styles.card}>
      <Link href={`/posts/${post.slug}`}>
        <h2 className={styles.card_title}>{post.title.rendered}</h2>
        <div className={styles.card_taxonomies}>
          <div className={styles.card_categories}>
            {categories.map(category => (
              <span key={category} className={styles.card_tag}>{category}</span>
            ))}
          </div>
          <div className={styles.card_tags}>
            {tags.map(tag => (
              <span key={tag} className={styles.card_tag}>{tag}</span>
            ))}
          </div>
        </div>
        <div className={styles.card_meta}>
          <p className={styles.card_author}>By {author}</p>
          <p className={styles.card_date}>Created: {createDate}</p>
          {/*<p className={styles.card_date}>Last modified: {lastModified}</p>*/}
        </div>
        
      </Link>
    </div>
  );
};

export default PostCard;