import { base44 } from "@/api/base44Client";
import { getRandomPersona } from "./personas";
import { getRandomComment } from "./templates";

/**
 * Living Campus Engagement Simulator
 *
 * Simulates organic engagement patterns — realistic likes, comments, and
 * reactions on existing content. Mirrors how a real campus social feed
 * evolves with natural engagement timing.
 */

const MAX_ENGAGEMENT_PER_CYCLE = 5;

/**
 * Adds organic engagement to recent posts.
 * Picks random posts and adds realistic like/comment increases.
 */
export async function simulateEngagement() {
  try {
    const posts = await base44.entities.QuadPost.list("-created_date", 30);
    if (!posts?.length) return;

    // Pick 2-5 random posts to receive engagement
    const count = Math.min(MAX_ENGAGEMENT_PER_CYCLE, Math.floor(Math.random() * 4) + 2);
    const shuffled = [...posts].sort(() => Math.random() - 0.5).slice(0, count);

    for (const post of shuffled) {
      const likeIncrease = Math.floor(Math.random() * 6) + 1;
      const shouldComment = Math.random() > 0.6;

      try {
        await base44.entities.QuadPost.update(post.id, {
          likes_count: (post.likes_count || 0) + likeIncrease,
          comments_count: shouldComment
            ? (post.comments_count || 0) + 1
            : post.comments_count || 0,
        });
      } catch {}

      // Occasionally create an actual comment
      if (shouldComment && Math.random() > 0.5) {
        await createComment(post.id);
      }
    }
  } catch {}
}

async function createComment(postId) {
  try {
    const persona = getRandomPersona("student");
    const content = getRandomComment();

    // Try to create a QuadComment record
    if (base44.entities.QuadComment) {
      await base44.entities.QuadComment.create({
        post_id: postId,
        content,
        author_name: persona.name,
        author_role: persona.role,
        author_handle: persona.handle,
        is_seed_content: true,
      });
    }
  } catch {}
}

/**
 * Simulates a trending lifecycle — boosts engagement on posts
 * that are already popular (mimicking viral content).
 */
export async function simulateTrending() {
  try {
    const posts = await base44.entities.QuadPost.list("-likes_count", 10);
    if (!posts?.length) return;

    // Pick the top 2 most-liked posts and boost them
    const trending = posts.slice(0, 2);
    for (const post of trending) {
      const boost = Math.floor(Math.random() * 10) + 5;
      try {
        await base44.entities.QuadPost.update(post.id, {
          likes_count: (post.likes_count || 0) + boost,
          shares_count: (post.shares_count || 0) + Math.floor(boost / 3),
        });
      } catch {}
    }
  } catch {}
}