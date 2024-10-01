// app/posts/[slug]/page.js

import Post from '@/app/components/Post/Post';
import styles from './page.module.css';


var blogPost = {};

async function getPost(slug) {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_WP_URL;
   
    const res = await fetch(`https://${siteUrl}/wp-json/wp/v2/posts?slug=${slug}&_embed`, { next: { revalidate: 60 } });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch post. Status: ${res.status}`);
    }
    
    const posts = await res.json();
    
    if (posts.length === 0) {
      throw new Error('Post not found');
    }

    blogPost.title = posts[0].title.rendered
    blogPost.content = posts[0].content.rendered
    blogPost.author = posts[0]._embedded['author'][0].name;
    blogPost.featuredImage = posts[0]._embedded['wp:featuredmedia']?.[0]?.source_url

    blogPost.create_date = new Date(posts[0].date)
    blogPost.last_modified = new Date(posts[0].modified)
    blogPost.pinned = posts[0].sticky
    blogPost.categories = posts[0]._embedded['wp:term']
    .flat()
    .filter(term => term.taxonomy === 'category')
    .map(category => category.name);
    blogPost.tags = posts[0]._embedded['wp:term']
    .flat()
    .filter(term => term.taxonomy === 'post_tag')
    .map(tag => tag.name);
    
    return blogPost;
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
}

export default async function BlogPost({ params }) {
 
  try {
    const post = await getPost(params.slug);

    return (
      <div className={styles.container}>
      <Post 
        post= {post}
      />
        
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