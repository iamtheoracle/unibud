import { base44 } from "@/api/base44Client";
import { getRandomPersona } from "./personas";
import {
  getRandomSocialPost,
  getRandomAcademicPost,
  getRandomAchievementPost,
  getRandomAnnouncement,
  getRandomEvent,
  getRandomMarketplaceListing,
} from "./templates";

/**
 * Living Campus Activity Generator
 *
 * Generates realistic university activity and creates entity records.
 * Uses a hybrid approach: template-based generation (fast, frequent)
 * + LLM-generated batches (fresh, unique, every few cycles).
 */

const generatedContent = new Set();
const MAX_TRACKED = 200;

function track(content) {
  generatedContent.add(content);
  if (generatedContent.size > MAX_TRACKED) {
    const arr = Array.from(generatedContent);
    generatedContent.clear();
    arr.slice(-100).forEach((c) => generatedContent.add(c));
  }
}

function isDuplicate(content) {
  return generatedContent.has(content);
}

// ── LLM Batch Generation (for freshness) ──

let llmBatch = [];
let cycleCount = 0;

async function refreshLLMBatch() {
  try {
    const res = await base44.integrations.Core.InvokeLLM({
      prompt:
        "Generate 5 realistic, diverse social media posts from Nigerian university students. " +
        "Mix of academic life, campus social life, humor, and achievements. " +
        "Each post should be unique, authentic, and under 100 characters. " +
        "No hashtags. No repetition. Return as a JSON array of strings.",
      response_json_schema: {
        type: "object",
        properties: {
          posts: { type: "array", items: { type: "string" } },
        },
      },
    });
    llmBatch = res?.posts || [];
  } catch {
    llmBatch = [];
  }
}

function getContentFromBatch() {
  if (llmBatch.length > 0) {
    return llmBatch.pop();
  }
  return null;
}

// ── Entity Creation ──

async function createPost(persona, content, type = "text") {
  if (isDuplicate(content)) return null;
  track(content);

  try {
    const post = await base44.entities.QuadPost.create({
      content,
      author_name: persona.name,
      author_role: persona.role,
      author_handle: persona.handle,
      type,
      likes_count: Math.floor(Math.random() * 12),
      comments_count: Math.floor(Math.random() * 4),
      shares_count: Math.floor(Math.random() * 3),
      is_seed_content: true,
      seed_batch: "living_campus",
      draft_status: "published",
      visibility: "campus",
    });
    return post;
  } catch {
    return null;
  }
}

async function createEvent(template) {
  try {
    const persona = getRandomPersona("club");
    const today = new Date();
    const eventDate = new Date(today.getTime() + (1 + Math.floor(Math.random() * 7)) * 24 * 60 * 60 * 1000);

    await base44.entities.CampusEvent.create({
      title: template.title,
      description: template.description,
      location: template.location,
      date: eventDate.toISOString().split("T")[0],
      organizer: persona.name,
      is_seed_content: true,
    });
  } catch {}
}

async function createMarketplaceListing(template) {
  try {
    const persona = getRandomPersona("student");
    await base44.entities.MarketplaceListing.create({
      title: template.title,
      description: template.description,
      price: template.price,
      category: template.category,
      seller_name: persona.name,
      is_seed_content: true,
    });
  } catch {}
}

// ── Public Activity Generators ──

export async function generateSocialActivity(timePeriod) {
  cycleCount++;

  // Refresh LLM batch every 5 cycles
  if (cycleCount % 5 === 0 && llmBatch.length === 0) {
    await refreshLLMBatch();
  }

  const persona = getRandomPersona("student");
  let content = getContentFromBatch();

  if (!content) {
    // Use template-based content based on time period
    const rand = Math.random();
    if (rand < 0.15) {
      content = getRandomAchievementPost();
    } else if (rand < 0.35) {
      content = getRandomAcademicPost();
    } else {
      content = getRandomSocialPost();
    }
  }

  await createPost(persona, content, "text");
}

export async function generateAcademicActivity() {
  const persona = getRandomPersona("lecturer");
  const content = getRandomAnnouncement();
  await createPost(persona, content, "news");
}

export async function generateMarketplaceActivity() {
  const listing = getRandomMarketplaceListing();
  await createMarketplaceListing(listing);
}

export async function generateEventActivity() {
  const event = getRandomEvent();
  await createEvent(event);
}

export async function generateClubActivity() {
  const persona = getRandomPersona("club");
  const announcements = [
    "Recruitment is open! Join us this semester for amazing events and networking opportunities.",
    "General meeting this Thursday. New members welcome! See you there.",
    "Big event coming up next week. Follow us for updates!",
    "Applications for executive positions are now open. Step up and lead!",
    "Thank you to everyone who came to our last event. Stay tuned for more!",
  ];
  const content = announcements[Math.floor(Math.random() * announcements.length)];
  await createPost(persona, content, "club_update");
}