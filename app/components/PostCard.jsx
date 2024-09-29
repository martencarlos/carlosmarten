

import React from 'react';
import Link from 'next/link';

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

  const cardStyle = {
    maxWidth: '400px',
    margin: '20px auto',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white',
    fontFamily: 'Arial, sans-serif',
  };

  const titleStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  };

  const summaryStyle = {
    fontSize: '1rem',
    lineHeight: '1.5',
    color: '#666',
  };

  return (
    <div style={cardStyle}>
      <Link href={`/posts/${post.slug}`}>
        <h2 style={titleStyle}>{post.title.rendered}</h2>
        <p style={summaryStyle}>{author}</p>
      </Link>
    </div>
  );
};

export default PostCard;