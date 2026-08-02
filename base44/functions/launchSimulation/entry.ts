import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';
import { generatePost, generateComment, generateStory, generateNotification, SIM_AUTHORS } from '../../shared/launchContent.ts';

function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[randInt(0, arr.length - 1)]; }

export default async function(req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { intensity } = body as { intensity?: 'low' | 'normal' | 'high' };

    const config = {
      low: { posts: 3, comments: 8, stories: 1, notifications: 1 },
      normal: { posts: 6, comments: 15, stories: 2, notifications: 2 },
      high: { posts: 12, comments: 30, stories: 4, notifications: 4 },
    }[intensity || 'normal'];

    const results: Record<string, number> = {};

    // 1. Generate new posts
    const postsToCreate = Array.from({ length: config.posts }, () => generatePost());
    const createdPosts = await base44.asServiceRole.entities.QuadPost.bulkCreate(postsToCreate);
    results.posts = (createdPosts || []).length;

    // 2. Add comments to existing recent posts + newly created ones
    let commentCount = 0;
    const recentPosts = await base44.asServiceRole.entities.QuadPost.filter({ draft_status: 'published' }, '-created_date', 20);
    const allPosts = [...(createdPosts || []), ...(recentPosts || [])];
    for (let i = 0; i < config.comments; i++) {
      const post = pick(allPosts);
      if (post) {
        try {
          const comment = generateComment(post);
          await base44.asServiceRole.entities.QuadComment.create(comment);
          commentCount++;
          // Bump comment count on post
          await base44.asServiceRole.entities.QuadPost.update(post.id, {
            comments_count: (post.comments_count || 0) + 1,
          });
        } catch {}
      }
    }
    results.comments = commentCount;

    // 3. Generate new stories
    const storiesToCreate = Array.from({ length: config.stories }, () => generateStory());
    const createdStories = await base44.asServiceRole.entities.Story.bulkCreate(storiesToCreate);
    results.stories = (createdStories || []).length;

    // 4. Generate notifications
    const notifsToCreate = Array.from({ length: config.notifications }, () => generateNotification());
    const createdNotifs = await base44.asServiceRole.entities.Notification.bulkCreate(notifsToCreate);
    results.notifications = (createdNotifs || []).length;

    // 5. Occasionally boost reactions on existing posts (simulates engagement)
    const boostCount = randInt(5, 15);
    let boosted = 0;
    for (let i = 0; i < boostCount && i < (recentPosts || []).length; i++) {
      const post = (recentPosts as any[])[i];
      try {
        const addLikes = randInt(1, 5);
        const newCount = (post.likes_count || 0) + addLikes;
        const reactions = post.reactions || {};
        const rKeys = Object.keys(reactions);
        if (rKeys.length > 0) {
          reactions[pick(rKeys)] = (reactions[rKeys[0]] || 0) + addLikes;
        }
        await base44.asServiceRole.entities.QuadPost.update(post.id, {
          likes_count: newCount,
          reactions,
        });
        boosted++;
      } catch {}
    }
    results.reactionsBoosted = boosted;

    console.log(`[Launch Simulation] Generated ${results.posts} posts, ${results.comments} comments, ${results.stories} stories, ${results.notifications} notifications, boosted ${boosted} post reactions`);

    return Response.json({
      status: 'success',
      intensity: intensity || 'normal',
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Launch Simulation] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}