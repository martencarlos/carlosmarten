'use server';

import { sql } from '@vercel/postgres';

// Increment view count for a specific slug
export async function incrementView(slug) {
    try {
        // Insert a new row or update existing count
        await sql`
      INSERT INTO post_views (slug, count)
      VALUES (${slug}, 1)
      ON CONFLICT (slug)
      DO UPDATE SET count = post_views.count + 1
    `;
        // We intentionally do NOT revalidatePath here to avoid purging the cache 
        // and regenerating the static page on every single view, which saves resources.
    } catch (error) {
        console.error('Error incrementing view:', error);
    }
}

// Get dictionary of all view counts: { 'slug': count, ... }
export async function getViewsCount() {
    try {
        const { rows } = await sql`SELECT slug, count FROM post_views`;
        const views = {};
        rows.forEach((row) => {
            views[row.slug] = row.count;
        });
        return views;
    } catch (error) {
        console.error('Error fetching views:', error);
        return {};
    }
}

// Get count for a single post
export async function getSinglePostViewCount(slug) {
    try {
        const { rows } = await sql`SELECT count FROM post_views WHERE slug = ${slug}`;
        return rows[0]?.count || 0;
    } catch (error) {
        console.error('Error fetching single view:', error);
        return 0;
    }
}