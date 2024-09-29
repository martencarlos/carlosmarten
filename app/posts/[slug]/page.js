// app/posts/[slug]/page.js

import styles from './page.module.css';
import Image from 'next/image';

async function getPost(slug) {
  try {
    const res = await fetch(`https://www.carlosmarten.com/wp-json/wp/v2/posts?slug=${slug}&_embed`, { next: { revalidate: 60 } });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch post. Status: ${res.status}`);
    }
    
    const posts = await res.json();
    
    if (posts.length === 0) {
      throw new Error('Post not found');
    }
    
    return posts[0];
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
}

export default async function BlogPost({ params }) {
  try {
    const post = await getPost(params.slug);
    const featuredImage = post._embedded['wp:featuredmedia']?.[0]?.source_url;

    return (
      <div className={styles.container}>
        <article className={styles.article}>
          {featuredImage && (
            <div className={styles.featuredImageContainer}>
              <Image
                src={featuredImage}
                alt={post.title.rendered}
                layout="fill"
                objectFit="cover"
                className={styles.featuredImage}
              />
            </div>
          )}
          <h1 className={styles.title}>{post.title.rendered}</h1>
          <div 
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: post.content.rendered }} 
          />
        </article>
      </div>
    );
  } catch (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h1>Error</h1>
          <p>Failed to load the blog post. Please try again later.</p>
        </div>
      </div>
    );
  }
}