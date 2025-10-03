// app/(official)/posts/[slug]/page.js
import { notFound } from "next/navigation";
import Post from "components/Article/Post/Post";
import styles from "./page.module.css";
import { Suspense } from "react";
import PostSkeleton from "components/Article/Post/PostSkeleton";
import { sql } from "@vercel/postgres";

async function getPost(slug) {
  console.log("fetching post loaded");
  const siteUrl = process.env.NEXT_PUBLIC_WP_URL;
  const res = await fetch(
    `https://${siteUrl}/wp-json/wp/v2/posts?slug=${slug}&_embed`,
    {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch post. Status: ${res.status}`);
  }

  const posts = await res.json();


  if (posts.length === 0) {
    notFound();
  }

  const post = posts[0];

  // Fetch audio URL from your database
  const { rows } = await sql`
    SELECT audio_url FROM posts WHERE id = ${post.id}
  `;
  const audioUrl = rows[0]?.audio_url || null;

  return {
    title: post.title.rendered,
    content: post.content.rendered,
    author: post._embedded["author"][0].name,
    featuredImage: post._embedded["wp:featuredmedia"]?.[0]?.source_url,
    create_date: new Date(post.date),
    last_modified: new Date(post.modified),
    pinned: post.sticky,
    categories:
      post._embedded?.["wp:term"]?.[0]?.map((category) => category.name) || [],
    tags: post._embedded["wp:term"]
      .flat()
      .filter((term) => term.taxonomy === "post_tag")
      .map((tag) => tag.name),
    audioUrl,
  };
}

export default async function BlogPost({ params }) {
  console.log("BlogPost loaded");

  const { slug } = await params;

  const post = await getPost(slug);

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className={styles.container}>
      <Suspense fallback={<PostSkeleton />}>
        <Post post={post} />
      </Suspense>
    </div>
  );
}