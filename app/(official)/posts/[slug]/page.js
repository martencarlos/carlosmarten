// app/posts/[slug]/page.js
import { notFound } from "next/navigation";
import Post from "components/Article/Post/Post";
import styles from "./page.module.css";
import BackButton from "components/Article/BackButton/BackButton";

import { s3Client } from "@lib/aws-config";
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

async function getAudioUrl(postId) {
  try {
    // Check if audio file exists
    const headCommand = new HeadObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `audio/${postId}.mp3`,
    });

    try {
      await s3Client.send(headCommand);
    } catch (error) {
      if (error.name === "NotFound") {
        return null;
      }
      throw error;
    }

    // Generate presigned URL
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `audio/${postId}.mp3`,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
  } catch (error) {
    console.error("Error getting audio URL:", error);
    return null;
  }
}

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
  };
}

export default async function BlogPost({ params }) {
  console.log("BlogPost loaded");

  const { slug } = await params;

  const [post, audioUrl] = await Promise.all([
    getPost(slug), // Your existing post fetching function
    getAudioUrl(slug),
  ]);

  if (!post) {
    <div>Post not found</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.backbuttonContainer}>
        <BackButton />
      </div>
      <Post post={post} audioUrl={audioUrl} />
    </div>
  );
}
