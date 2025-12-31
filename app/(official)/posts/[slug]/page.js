// Path: app/(official)/posts/[slug]/page.js
import { notFound } from "next/navigation";
import Post from "components/Article/Post/Post";
import styles from "./page.module.css";
import { Suspense } from "react";
import PostSkeleton from "components/Article/Post/PostSkeleton";
import { sql } from "@vercel/postgres";
import { getSinglePostViewCount } from "@actions/viewCounter";

// Enable streaming and ISR
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every 60 seconds

async function getPost(slug) {
  console.log("fetching post loaded");
  const siteUrl = process.env.NEXT_PUBLIC_WP_URL;

  try {
    const res = await fetch(
      `https://${siteUrl}/wp-json/wp/v2/posts?slug=${slug}&_embed`,
      {
        next: { revalidate: 60 }, // Cache for 60 seconds
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
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

    // Fetch audio URL in parallel
    const audioPromise = sql`
      SELECT audio_url FROM posts WHERE id = ${post.id}
    `.catch(() => ({ rows: [] }));

    const { rows } = await audioPromise;
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
  } catch (error) {
    console.error("Error fetching post:", error);
    notFound();
  }
}

// Add metadata generation for better SEO and loading
export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const post = await getPost(slug);
    return {
      title: post.title,
      description: post.content.substring(0, 160),
    };
  } catch {
    return {
      title: 'Post Not Found',
    };
  }
}

export default async function BlogPost({ params }) {
  console.log("BlogPost loaded");

  const { slug } = await params;

  // Fetch post and views in parallel
  const [post, initialViews] = await Promise.all([
    getPost(slug),
    getSinglePostViewCount(slug)
  ]);

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className={styles.container}>
      <Suspense fallback={<PostSkeleton />}>
        <Post post={post} initialViews={initialViews} slug={slug} />
      </Suspense>
    </div>
  );
}