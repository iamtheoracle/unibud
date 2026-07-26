/**
 * Search Service — centralized search across students, courses, notes,
 * assignments, communities, events, marketplace, campus businesses, and
 * files. Future My Realm applications reuse this engine.
 */
const SOURCES = [
  { kind: "communities", entity: "Community", pick: (it) => it.name },
  { kind: "courses", entity: "Course", pick: (it) => it.course_code || it.title || it.name },
  { kind: "events", entity: "CampusEvent", pick: (it) => it.title },
  { kind: "marketplace", entity: "MarketplaceListing", pick: (it) => it.title },
  { kind: "notes", entity: "Note", pick: (it) => it.title },
  { kind: "assignments", entity: "Assignment", pick: (it) => it.title },
  { kind: "posts", entity: "QuadPost", pick: (it) => it.content },
  { kind: "groups", entity: "StudyGroup", pick: (it) => it.name },
];

export function searchService(base44) {
  return {
    search: async ({ query, kinds, limit = 5 }) => {
      const q = (query || "").toLowerCase().trim();
      if (!q) return {};
      const sources = SOURCES.filter((s) => !kinds || kinds.includes(s.kind));
      const results = await Promise.all(
        sources.map(async (s) => {
          try {
            const items = await base44.entities[s.entity].list("-created_date", 24);
            const matched = items
              .filter((it) => String(s.pick(it) || "").toLowerCase().includes(q))
              .slice(0, limit)
              .map((it) => ({ id: it.id, title: s.pick(it), kind: s.kind, raw: it }));
            return [s.kind, matched];
          } catch {
            return [s.kind, []];
          }
        })
      );
      return Object.fromEntries(results);
    },
    availableKinds: () => SOURCES.map((s) => s.kind),
  };
}