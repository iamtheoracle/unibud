import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';
import { AUTHORS, POSTS, SEED_OPPORTUNITIES, SEED_SCHOLARSHIPS, COMMENT_TEMPLATES } from './data.ts';
import { CONVERSATIONS, CAMPUS_EVENTS, CLUBS, MARKETPLACE_LISTINGS, STORIES, STUDY_GROUPS, COMMUNITIES, SHORT_VIDEOS, LOST_FOUND_ITEMS, NOTIFICATIONS, RESEARCH_PROJECTS, SEED_FLAG } from './socialData.ts';

const SEED_BATCH = 'launch_v1';
const CHUNK_SIZE = 50;

const REACTION_TYPES = ['like', 'love', 'celebrate', 'insightful', 'funny'];

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function distributeReactions(total) {
  const r = {}; let remaining = total;
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
    ...authorFields(p.a), type: p.t, content: p.c, hashtags: p.tags || [], tags: p.cats || [],
    likes_count: likes, comments_count: comments, shares_count: shares, reactions: distributeReactions(likes),
    draft_status: 'published', visibility: 'campus', ...SEED_FLAG,
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
    const key = studentKeys[randInt(0, studentKeys.length - 1)];
    comments.push({ ...authorFields(key), content: templates[i], ...SEED_FLAG, likes_count: randInt(2, 15) });
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

async function deleteSeed(client, entityName) {
  const records = await client.entities[entityName].filter({ is_seed_content: true }, '-created_date', 200);
  let deleted = 0;
  for (const r of records || []) {
    try { await client.entities[entityName].delete(r.id); deleted++; } catch {}
  }
  return deleted;
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
      const existing = await base44.asServiceRole.entities.QuadPost.filter({ seed_batch: SEED_BATCH });
      if ((existing || []).length > 0) {
        return Response.json({ status: 'already_seeded', message: `Launch content already exists (${existing.length} posts). Use 'clear' first.`, count: existing.length });
      }

      const results = {};

      // 1. Posts
      const postsToCreate = POSTS.map(buildPost);
      const createdPosts = await chunkedCreate(base44.asServiceRole, 'QuadPost', postsToCreate);
      results.posts = createdPosts.length;

      // 2. Comments on posts
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
      results.comments = commentCount;

      // 3. Stories
      const storiesToCreate = STORIES.map(s => ({ ...s, ...SEED_FLAG }));
      results.stories = (await chunkedCreate(base44.asServiceRole, 'Story', storiesToCreate)).length;

      // 4. Conversations + Messages
      const convData = CONVERSATIONS.map(c => ({
        type: c.type, title: c.title, avatar_url: c.avatar_url || '', participants: c.participants || [],
        last_message: c.last_message || {}, is_pinned: c.is_pinned || false,
        university: c.university, faculty: c.faculty, department: c.department, course_code: c.course_code,
        shared_files_count: randInt(0, 5), ...SEED_FLAG,
      }));
      const createdConvs = await chunkedCreate(base44.asServiceRole, 'Conversation', convData);
      results.conversations = createdConvs.length;

      // Messages for each conversation
      let msgCount = 0;
      for (let i = 0; i < createdConvs.length; i++) {
        const conv = createdConvs[i];
        const convDef = CONVERSATIONS[i];
        if (convDef.messages && convDef.messages.length > 0) {
          const msgs = convDef.messages.map(m => ({
            ...m, conversation_id: conv.id, status: 'read', ...SEED_FLAG,
          }));
          await chunkedCreate(base44.asServiceRole, 'Message', msgs);
          msgCount += msgs.length;
        }
      }
      results.messages = msgCount;

      // 5. Campus Events
      const eventData = CAMPUS_EVENTS.map(e => ({ ...e, ...SEED_FLAG }));
      results.events = (await chunkedCreate(base44.asServiceRole, 'CampusEvent', eventData)).length;

      // 6. Clubs
      const clubData = CLUBS.map(c => ({ ...c, ...SEED_FLAG }));
      results.clubs = (await chunkedCreate(base44.asServiceRole, 'Club', clubData)).length;

      // 7. Marketplace
      const marketData = MARKETPLACE_LISTINGS.map(m => ({ ...m, ...SEED_FLAG }));
      results.marketplace = (await chunkedCreate(base44.asServiceRole, 'MarketplaceListing', marketData)).length;

      // 8. Study Groups
      const sgData = STUDY_GROUPS.map(s => ({ ...s, ...SEED_FLAG }));
      results.studyGroups = (await chunkedCreate(base44.asServiceRole, 'StudyGroup', sgData)).length;

      // 9. Communities
      const commData = COMMUNITIES.map(c => ({ ...c, ...SEED_FLAG }));
      results.communities = (await chunkedCreate(base44.asServiceRole, 'Community', commData)).length;

      // 10. Short Videos
      const svData = SHORT_VIDEOS.map(v => ({ ...v, ...SEED_FLAG }));
      results.shortVideos = (await chunkedCreate(base44.asServiceRole, 'ShortVideo', svData)).length;

      // 11. Lost & Found
      const lfData = LOST_FOUND_ITEMS.map(l => ({ ...l, ...SEED_FLAG }));
      results.lostFound = (await chunkedCreate(base44.asServiceRole, 'LostFoundItem', lfData)).length;

      // 12. Notifications
      const notifData = NOTIFICATIONS.map(n => ({ ...n, ...SEED_FLAG }));
      results.notifications = (await chunkedCreate(base44.asServiceRole, 'Notification', notifData)).length;

      // 13. Research Projects
      const rpData = RESEARCH_PROJECTS.map(r => ({ ...r, ...SEED_FLAG }));
      results.research = (await chunkedCreate(base44.asServiceRole, 'ResearchProject', rpData)).length;

      // 14. Opportunities
      const oppData = SEED_OPPORTUNITIES.map(o => ({ ...o, ...SEED_FLAG }));
      results.opportunities = (await chunkedCreate(base44.asServiceRole, 'Opportunity', oppData)).length;

      // 15. Scholarships
      const scholData = SEED_SCHOLARSHIPS.map(s => ({ ...s, ...SEED_FLAG }));
      results.scholarships = (await chunkedCreate(base44.asServiceRole, 'Scholarship', scholData)).length;

      return Response.json({ status: 'success', batch: SEED_BATCH, results });
    }

    // ── clear ──
    if (action === 'clear') {
      const entities = ['QuadPost', 'QuadComment', 'Story', 'Conversation', 'Message', 'CampusEvent', 'Club', 'MarketplaceListing', 'StudyGroup', 'Community', 'ShortVideo', 'LostFoundItem', 'Notification', 'ResearchProject', 'Opportunity', 'Scholarship'];
      const deleted = {};
      for (const e of entities) {
        try { deleted[e] = await deleteSeed(base44.asServiceRole, e); } catch { deleted[e] = 0; }
      }
      return Response.json({ status: 'success', deleted });
    }

    // ── status ──
    if (action === 'status') {
      const counts = {};
      const entities = ['QuadPost', 'Story', 'Conversation', 'Message', 'CampusEvent', 'Club', 'MarketplaceListing', 'StudyGroup', 'Community', 'ShortVideo', 'LostFoundItem', 'Notification', 'Opportunity', 'Scholarship'];
      for (const e of entities) {
        try {
          const seed = await base44.asServiceRole.entities[e].filter({ is_seed_content: true }, '-created_date', 1);
          counts[e] = seed ? seed.length : 0;
        } catch { counts[e] = 0; }
      }

      const seedPosts = counts.QuadPost || 0;
      const realPosts = await base44.asServiceRole.entities.QuadPost.filter({ is_seed_content: { $ne: true } }, '-created_date', 1).then(r => r ? r.length : 0).catch(() => 0);

      let phase = 'seeded';
      if (seedPosts === 0) phase = 'empty';
      else if (realPosts >= 100) phase = 'replaced';
      else if (realPosts >= 50) phase = 'transitioning';
      else if (realPosts >= 20) phase = 'growing';

      return Response.json({ status: 'success', counts, seedPosts, realPosts, phase, batch: SEED_BATCH });
    }

    // ── archive ──
    if (action === 'archive') {
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
    console.error('seedCampusFeed error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}