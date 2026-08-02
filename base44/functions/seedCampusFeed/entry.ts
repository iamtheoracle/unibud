import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { AUTHORS, POSTS, SEED_OPPORTUNITIES, SEED_SCHOLARSHIPS, COMMENT_TEMPLATES } from './data.ts';

const SEED_BATCH = 'launch_v1';
const CHUNK_SIZE = 50;

const REACTION_TYPES = ['like', 'love', 'celebrate', 'insightful', 'funny'];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function distributeReactions(total) {
  const r = {};
  let remaining = total;
  for (let i = 0; i < REACTION_TYPES.length && remaining > 0; i++) {
    const v = i === REACTION_TYPES.length - 1 ? remaining : Math.floor(Math.random() * (remaining + 1));
    if (v > 0) r[REACTION_TYPES[i]] = v;
    remaining -= v;
  }
  return r;
}

function authorFields(key) {
  const a = AUTHORS[key] || AUTHORS.student1;
  return { author_name: a.name, author_handle: a.handle, author_role: a.role, is_verified: a.verified, author_image: a.image || '' };
}

function buildPost(p) {
  const likes = randInt(p.lo, p.hi);
  const comments = p.extra?.comments ?? Math.floor(likes * (0.2 + Math.random() * 0.2));
  const shares = p.extra?.shares ?? Math.floor(likes * (0.1 + Math.random() * 0.15));

  const post = {
    ...authorFields(p.a),
    type: p.t,
    content: p.c,
    hashtags: p.tags || [],
    tags: p.cats || [],
    likes_count: likes,
    comments_count: comments,
    shares_count: shares,
    reactions: distributeReactions(likes),
    draft_status: 'published',
    visibility: 'campus',
    is_seed_content: true,
    seed_batch: SEED_BATCH,
  };

  if (p.extra?.media) { post.media_urls = p.extra.media; post.media_types = ['image']; }
  if (p.extra?.poll) { post.poll_data = p.extra.poll; post.type = 'poll'; }
  if (p.extra?.event) { post.event_data = p.extra.event; post.type = 'event'; }
  if (p.extra?.pinned) { post.is_pinned = true; }

  return post;
}

function generateComments(post, count) {
  const studentKeys = ['student1','student2','student3','student4','student5','student6','student7','student8','student9','student10','student11','student12'];
  const templates = COMMENT_TEMPLATES[post.type] || COMMENT_TEMPLATES.news;
  const comments = [];

  for (let i = 0; i < Math.min(count, templates.length); i++) {
    const commenter = AUTHORS[studentKeys[randInt(0, studentKeys.length - 1)]];
    comments.push({
      ...authorFields(studentKeys[randInt(0, studentKeys.length - 1)]),
      content: templates[i],
      is_seed_content: true,
      seed_batch: SEED_BATCH,
      likes_count: randInt(2, 15),
    });
  }
  return comments;
}

async function chunkedCreate(client, entityName, items) {
  let created = [];
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    const result = await client.entities[entityName].bulkCreate(chunk);
    created = created.concat(result || []);
  }
  return created;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // ── seed ──
    if (action === 'seed') {
      if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

      const existing = await base44.asServiceRole.entities.QuadPost.filter({ seed_batch: SEED_BATCH });
      if ((existing || []).length > 0) {
        return Response.json({ status: 'already_seeded', message: `Launch content already exists (${existing.length} posts). Use 'clear' first.`, count: existing.length });
      }

      const postsToCreate = POSTS.map(buildPost);
      const createdPosts = await chunkedCreate(base44.asServiceRole, 'QuadPost', postsToCreate);

      // Create comments on engaging posts
      let commentCount = 0;
      for (const post of (createdPosts || [])) {
        if (post.comments_count > 0) {
          const comments = generateComments(post, Math.min(post.comments_count, 5));
          if (comments.length > 0) {
            const commentData = comments.map(c => ({ ...c, post_id: post.id }));
            await chunkedCreate(base44.asServiceRole, 'QuadComment', commentData);
            commentCount += commentData.length;
          }
        }
      }

      // Create opportunities
      const opportunityCount = (await chunkedCreate(base44.asServiceRole, 'Opportunity', SEED_OPPORTUNITIES)).length;

      // Create scholarships
      const scholarshipCount = (await chunkedCreate(base44.asServiceRole, 'Scholarship', SEED_SCHOLARSHIPS)).length;

      return Response.json({
        status: 'success',
        posts: createdPosts.length,
        comments: commentCount,
        opportunities: opportunityCount,
        scholarships: scholarshipCount,
        batch: SEED_BATCH,
      });
    }

    // ── clear ──
    if (action === 'clear') {
      if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

      const seedPosts = await base44.asServiceRole.entities.QuadPost.filter({ is_seed_content: true });
      let deletedPosts = 0;
      for (const post of seedPosts || []) {
        await base44.asServiceRole.entities.QuadPost.delete(post.id);
        deletedPosts++;
      }

      const seedComments = await base44.asServiceRole.entities.QuadComment.filter({ is_seed_content: true });
      let deletedComments = 0;
      for (const c of seedComments || []) {
        await base44.asServiceRole.entities.QuadComment.delete(c.id);
        deletedComments++;
      }

      return Response.json({ status: 'success', deletedPosts, deletedComments });
    }

    // ── status ──
    if (action === 'status') {
      const seedPosts = await base44.asServiceRole.entities.QuadPost.filter({ is_seed_content: true });
      const realPosts = await base44.asServiceRole.entities.QuadPost.filter({ is_seed_content: { $ne: true } });

      const totalReal = (realPosts || []).length;
      const totalSeed = (seedPosts || []).length;

      let phase = 'seeded';
      if (totalSeed === 0) phase = 'empty';
      else if (totalReal >= 100) phase = 'replaced';
      else if (totalReal >= 50) phase = 'transitioning';
      else if (totalReal >= 20) phase = 'growing';

      return Response.json({ status: 'success', seedPosts: totalSeed, realPosts: totalReal, phase, batch: SEED_BATCH });
    }

    // ── archive ──
    if (action === 'archive') {
      if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

      const realPosts = await base44.asServiceRole.entities.QuadPost.filter({ is_seed_content: { $ne: true } });
      const realCount = (realPosts || []).length;

      if (realCount < 30) {
        return Response.json({ status: 'insufficient_real_content', message: `Need 30+ real posts. Currently: ${realCount}` });
      }

      const seedPosts = await base44.asServiceRole.entities.QuadPost.filter({ is_seed_content: true }, 'created_date', 200);
      const sorted = (seedPosts || []).sort((a, b) => new Date(a.created_date || 0).getTime() - new Date(b.created_date || 0).getTime());
      const toArchive = sorted.slice(0, Math.floor(sorted.length / 2));

      let archived = 0;
      for (const post of toArchive) {
        const comments = await base44.asServiceRole.entities.QuadComment.filter({ post_id: post.id });
        for (const c of comments || []) await base44.asServiceRole.entities.QuadComment.delete(c.id);
        await base44.asServiceRole.entities.QuadPost.delete(post.id);
        archived++;
      }

      return Response.json({ status: 'success', archived, remaining: sorted.length - archived, realPosts: realCount });
    }

    return Response.json({ error: 'Unknown action. Use seed, clear, status, or archive.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}