import { base44 } from "@/api/base44Client";

/**
 * Authentic Launch Content System
 *
 * Seeds the platform with clearly designated official content from verified
 * university accounts, departments, clubs, and lecturers.
 *
 * Rules:
 *  - All launch content is marked with is_seed_content: true
 *  - All launch content has seed_batch: "launch_v1"
 *  - Launch content is NEVER presented as real user activity
 *  - Admins can remove all launch content at any time
 *  - Launch content is automatically de-emphasized as real activity grows
 *  - Bud, recommendations, trending, and analytics only use authentic data
 */

const LAUNCH_BATCH = "launch_v1";

/**
 * Official verified accounts that create launch content.
 */
export const OFFICIAL_ACCOUNTS = [
  { name: "UNIBUD", role: "admin", handle: "Official Platform" },
  { name: "Student Affairs Office", role: "admin", handle: "Official Student Affairs" },
  { name: "Library Services", role: "admin", handle: "Official Library Account" },
  { name: "Faculty of Engineering", role: "admin", handle: "Official Faculty Account" },
  { name: "Faculty of Science", role: "admin", handle: "Official Faculty Account" },
  { name: "Faculty of Arts", role: "admin", handle: "Official Faculty Account" },
  { name: "Career Services", role: "admin", handle: "Official Career Services" },
  { name: "Health Services", role: "admin", handle: "Official Health Services" },
  { name: "Sports Office", role: "admin", handle: "Official Sports Office" },
  { name: "Tech Society", role: "club", handle: "Official Club" },
  { name: "Debate Club", role: "club", handle: "Official Club" },
  { name: "Red Cross Society", role: "club", handle: "Official Club" },
  { name: "Entrepreneurship Hub", role: "club", handle: "Official Club" },
  { name: "Drama Society", role: "club", handle: "Official Club" },
  { name: "Music Society", role: "club", handle: "Official Club" },
  { name: "Environment Club", role: "club", handle: "Official Club" },
  { name: "Photography Club", role: "club", handle: "Official Club" },
  { name: "Dr. Adebayo Johnson", role: "lecturer", handle: "CS Dept · Lecturer" },
  { name: "Prof. Ngozi Eze", role: "lecturer", handle: "MTH Dept · Professor" },
  { name: "Dr. Ibrahim Musa", role: "lecturer", handle: "ME Dept · Lecturer" },
];

/**
 * Official launch content — created by verified accounts only.
 */
const LAUNCH_CONTENT = [
  {
    author: "UNIBUD",
    role: "admin",
    handle: "Official Platform",
    content: "Welcome to UNIBUD — your campus operating system. Explore academics, connect with your community, and let Bud help you succeed. This is official launch content that will be replaced by real activity as your campus comes alive.",
    type: "news",
  },
  {
    author: "Student Affairs Office",
    role: "admin",
    handle: "Official Student Affairs",
    content: "Welcome back, students! Important dates for the semester are now available on your academic calendar. Visit the Student Affairs office for any registration inquiries.",
    type: "news",
  },
  {
    author: "Library Services",
    role: "admin",
    handle: "Official Library Account",
    content: "The library is open from 8 AM to 10 PM, Monday to Saturday. New study rooms are available for booking through the Campus Services tab.",
    type: "news",
  },
  {
    author: "Faculty of Engineering",
    role: "admin",
    handle: "Official Faculty Account",
    content: "Engineering students: Lab schedules and safety guidelines have been updated. Please review them before your first lab session.",
    type: "news",
  },
  {
    author: "Faculty of Science",
    role: "admin",
    handle: "Official Faculty Account",
    content: "Science students: Course registration for electives closes this Friday. Check the portal for available options.",
    type: "news",
  },
  {
    author: "Career Services",
    role: "admin",
    handle: "Official Career Services",
    content: "Career Fair is coming! Start preparing your CVs. Visit the Career Hub for tips, internship opportunities, and CV building tools.",
    type: "news",
  },
  {
    author: "Health Services",
    role: "admin",
    handle: "Official Health Services",
    content: "Free health screenings available this week at the Medical Center. Blood pressure, glucose, and BMI checks for all students.",
    type: "news",
  },
  {
    author: "Sports Office",
    role: "admin",
    handle: "Official Sports Office",
    content: "Inter-departmental sports tournament registrations are open! Football, basketball, table tennis, and athletics. Sign up at the Sports Office.",
    type: "news",
  },
  {
    author: "Tech Society",
    role: "club",
    handle: "Official Club",
    content: "Join the Tech Society! We're hosting a hackathon next month and recruiting new members. Visit the Clubs tab to sign up.",
    type: "club_update",
  },
  {
    author: "Debate Club",
    role: "club",
    handle: "Official Club",
    content: "The Debate Club welcomes all students interested in public speaking and current affairs. Weekly meetings every Thursday at 4 PM in the Student Center.",
    type: "club_update",
  },
  {
    author: "Red Cross Society",
    role: "club",
    handle: "Official Club",
    content: "Interested in volunteerism and first aid? Join the Red Cross Society! Free first aid certification for all members.",
    type: "club_update",
  },
  {
    author: "Entrepreneurship Hub",
    role: "club",
    handle: "Official Club",
    content: "Got a business idea? The Entrepreneurship Hub offers mentorship, funding connections, and workshops. Join us and build your startup!",
    type: "club_update",
  },
  {
    author: "Drama Society",
    role: "club",
    handle: "Official Club",
    content: "Auditions for the semester production are open! Whether you act, direct, or work backstage, there's a role for you.",
    type: "club_update",
  },
  {
    author: "Music Society",
    role: "club",
    handle: "Official Club",
    content: "Musicians, singers, and producers — the Music Society is recruiting! Weekly jam sessions and performance opportunities.",
    type: "club_update",
  },
  {
    author: "Dr. Adebayo Johnson",
    role: "lecturer",
    handle: "CS Dept · Lecturer",
    content: "Computer Science students: Welcome to the new semester! My office hours are Tuesdays and Thursdays, 2-4 PM. Feel free to reach out about course materials or project ideas.",
    type: "news",
  },
  {
    author: "Prof. Ngozi Eze",
    role: "lecturer",
    handle: "MTH Dept · Professor",
    content: "Mathematics students: Tutorial sessions begin next week. Check the notice board for your group assignment and venue.",
    type: "news",
  },
  {
    author: "Dr. Ibrahim Musa",
    role: "lecturer",
    handle: "ME Dept · Lecturer",
    content: "Mechanical Engineering students: Remember to bring your safety gear to all lab sessions. No exceptions — safety first!",
    type: "news",
  },
];

/**
 * Seeds the platform with official launch content.
 * Only call once during initial deployment setup.
 */
export async function seedLaunchContent() {
  const created = [];
  for (const item of LAUNCH_CONTENT) {
    try {
      const post = await base44.entities.QuadPost.create({
        ...item,
        is_seed_content: true,
        seed_batch: LAUNCH_BATCH,
        draft_status: "published",
        visibility: "campus",
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
      });
      created.push(post);
    } catch {}
  }
  return { seeded: created.length, total: LAUNCH_CONTENT.length };
}

/**
 * Removes ALL seed content from the platform (launch + any simulated content).
 * Admin-only operation.
 */
export async function removeAllSeedContent() {
  try {
    await base44.entities.QuadPost.deleteMany({ is_seed_content: true });
    return { success: true };
  } catch (err) {
    return { success: false, error: err?.message };
  }
}

/**
 * Removes a single seed content item by ID.
 */
export async function removeSeedContent(postId) {
  try {
    await base44.entities.QuadPost.delete(postId);
    return { success: true };
  } catch (err) {
    return { success: false, error: err?.message };
  }
}

/**
 * Fetches all launch/seed content for admin review.
 */
export async function getLaunchContent() {
  try {
    return await base44.entities.QuadPost.filter(
      { is_seed_content: true },
      "-created_date",
      100
    );
  } catch {
    return [];
  }
}

/**
 * Returns the authentic content status — how much real content
 * exists vs launch content. Used to determine when to de-emphasize
 * launch content and when the platform is self-sustaining.
 */
export async function getLaunchContentStatus() {
  try {
    const [launch, real] = await Promise.allSettled([
      base44.entities.QuadPost.filter({ is_seed_content: true }, "-created_date", 1),
      base44.entities.QuadPost.filter({ is_seed_content: false }, "-created_date", 1),
    ]);

    // Use list to get counts (filter returns array)
    const launchCount = launch.status === "fulfilled" ? launch.value?.length || 0 : 0;
    const realCount = real.status === "fulfilled" ? real.value?.length || 0 : 0;
    const total = launchCount + realCount;

    return {
      launchCount,
      realCount,
      total,
      authenticRatio: total > 0 ? realCount / total : 0,
      isSelfSustaining: realCount >= 20,
    };
  } catch {
    return { launchCount: 0, realCount: 0, total: 0, authenticRatio: 0, isSelfSustaining: false };
  }
}