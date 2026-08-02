import { base44 } from "@/api/base44Client";

/**
 * Entity fetchers — each domain agent can optionally fetch real entity data
 * to ground its analysis in the student's actual academic/social/campus life.
 * Results are cached in SharedMemory to prevent duplicate fetches within the
 * same conversation turn.
 */

const safeList = (entityName, sortField, limit) =>
  base44.entities[entityName]?.list?.(sortField, limit).catch(() => []) || Promise.resolve([]);

const FETCHERS = {
  academic: async () => {
    const [assignments, courses, exams, timetable] = await Promise.allSettled([
      base44.entities.Assignment?.list?.("-due_date", 5).catch(() => []),
      base44.entities.Course?.list?.("-created_date", 5).catch(() => []),
      base44.entities.Exam?.list?.("-created_date", 3).catch(() => []),
      base44.entities.TimetableEntry?.list?.("-created_date", 5).catch(() => []),
    ]);
    const parts = [];
    const a = assignments.value || [];
    if (a.length) parts.push("Assignments: " + a.map(x => `${x.title || "Untitled"} (due ${x.due_date || "N/A"}, ${x.status || "pending"})`).join("; "));
    const c = courses.value || [];
    if (c.length) parts.push("Courses: " + c.map(x => x.code || x.title || "Unknown").join(", "));
    const e = exams.value || [];
    if (e.length) parts.push("Exams: " + e.map(x => `${x.title || "Exam"} ${x.date ? "on " + x.date : ""}`).join("; "));
    const t = timetable.value || [];
    if (t.length) parts.push("Today's classes: " + t.map(x => `${x.course_code || x.title || "Class"} at ${x.start_time || ""}`).join("; "));
    return parts.join("\n");
  },

  campus: async () => {
    const [events, clubs] = await Promise.allSettled([
      base44.entities.CampusEvent?.list?.("-created_date", 5).catch(() => []),
      base44.entities.Club?.list?.("-created_date", 5).catch(() => []),
    ]);
    const parts = [];
    const ev = events.value || [];
    if (ev.length) parts.push("Events: " + ev.map(x => `${x.title} ${x.date ? "on " + x.date : ""}`).join("; "));
    const cl = clubs.value || [];
    if (cl.length) parts.push("Clubs: " + cl.map(x => x.name).join(", "));
    return parts.join("\n");
  },

  social: async () => {
    const [posts, communities] = await Promise.allSettled([
      base44.entities.QuadPost?.list?.("-created_date", 5).catch(() => []),
      base44.entities.Community?.list?.("-created_date", 3).catch(() => []),
    ]);
    const parts = [];
    const p = posts.value || [];
    if (p.length) parts.push("Recent posts: " + p.map(x => `${x.author_name}: "${(x.content || "").slice(0, 60)}"`).join("; "));
    const cm = communities.value || [];
    if (cm.length) parts.push("Communities: " + cm.map(x => x.name).join(", "));
    return parts.join("\n");
  },

  productivity: async () => {
    const [events, tasks] = await Promise.allSettled([
      base44.entities.CalendarEvent?.list?.("-date", 5).catch(() => []),
      base44.entities.TaskManagement?.list?.("-created_date", 5).catch(() => []),
    ]);
    const parts = [];
    const ev = events.value || [];
    if (ev.length) parts.push("Calendar: " + ev.map(x => `${x.title} ${x.date ? "on " + x.date : ""}`).join("; "));
    const t = tasks.value || [];
    if (t.length) parts.push("Tasks: " + t.map(x => `${x.title || "Task"} (${x.status || "open"})`).join("; "));
    return parts.join("\n");
  },

  career: async () => {
    const [opps, scholarships] = await Promise.allSettled([
      base44.entities.Opportunity?.list?.("-created_date", 5).catch(() => []),
      base44.entities.Scholarship?.list?.("-created_date", 3).catch(() => []),
    ]);
    const parts = [];
    const o = opps.value || [];
    if (o.length) parts.push("Opportunities: " + o.map(x => `${x.title} at ${x.company || "N/A"}`).join("; "));
    const s = scholarships.value || [];
    if (s.length) parts.push("Scholarships: " + s.map(x => x.name || x.title || "Scholarship").join(", "));
    return parts.join("\n");
  },

  marketplace: async () => {
    const listings = await base44.entities.MarketplaceListing?.list?.("-created_date", 5).catch(() => []);
    if (!listings?.length) return "";
    return "Listings: " + listings.map(x => `${x.title} - ${x.price || "N/A"}`).join("; ");
  },

  knowledge: async () => {
    const [articles, resources] = await Promise.allSettled([
      base44.entities.HelpArticle?.list?.("-created_date", 3).catch(() => []),
      base44.entities.LibraryResource?.list?.("-created_date", 3).catch(() => []),
    ]);
    const parts = [];
    const a = articles.value || [];
    if (a.length) parts.push("Help articles: " + a.map(x => x.title).join(", "));
    const r = resources.value || [];
    if (r.length) parts.push("Library: " + r.map(x => `${x.title} by ${x.author || "N/A"}`).join("; "));
    return parts.join("\n");
  },
};

/**
 * Fetches entity context for a domain agent, with SharedMemory caching.
 */
export async function getAgentEntityContext(agentId, memory) {
  if (memory?.getCached(agentId)) return memory.getCached(agentId);

  const fetcher = FETCHERS[agentId];
  if (!fetcher) return "";

  try {
    const result = await fetcher();
    memory?.setCached(agentId, result);
    return result;
  } catch {
    return "";
  }
}