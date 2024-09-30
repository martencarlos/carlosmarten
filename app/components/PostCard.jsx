

import React from 'react';
import Link from 'next/link';
import styles from './postcard.module.css'

const PostCard = ({post})  => {

  const date = new Date(post.date);
  
 
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
        <h2 className={styles.card_title} >{post.title.rendered}</h2>
        <p className={styles.card_summary} >{author}</p>
      </Link>
    </div>
  );
};

export default PostCard;