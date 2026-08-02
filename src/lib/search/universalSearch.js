import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Universal Campus Search — searches across all UNIBUD entity types in parallel.
 * Returns categorized results for people, posts, events, courses, clubs, marketplace, and more.
 */

const SEARCH_ENTITIES = [
  { key: "people", entity: "User", fields: ["full_name", "email"], limit: 6, icon: "Users", label: "People" },
  { key: "posts", entity: "QuadPost", fields: ["content", "author_name"], limit: 8, icon: "MessageCircle", label: "Posts" },
  { events: true, entity: "CampusEvent", fields: ["title", "description", "location"], limit: 6, icon: "Calendar", label: "Events" },
  { key: "courses", entity: "Course", fields: ["title", "course_code", "description"], limit: 6, icon: "BookOpen", label: "Courses" },
  { key: "clubs", entity: "Club", fields: ["name", "description"], limit: 5, icon: "Users", label: "Clubs" },
  { key: "marketplace", entity: "MarketplaceListing", fields: ["title", "description"], limit: 6, icon: "ShoppingBag", label: "Marketplace" },
  { key: "opportunities", entity: "Opportunity", fields: ["title", "description", "company"], limit: 5, icon: "Briefcase", label: "Opportunities" },
  { key: "scholarships", entity: "Scholarship", fields: ["title", "description", "provider"], limit: 5, icon: "Award", label: "Scholarships" },
  { key: "communities", entity: "Community", fields: ["name", "description"], limit: 5, icon: "Users", label: "Communities" },
  { key: "studyGroups", entity: "StudyGroup", fields: ["title", "description", "subject"], limit: 5, icon: "GraduationCap", label: "Study Groups" },
  { key: "research", entity: "ResearchProject", fields: ["title", "abstract"], limit: 5, icon: "FlaskConical", label: "Research" },
  { key: "library", entity: "LibraryResource", fields: ["title", "author", "description"], limit: 6, icon: "BookOpen", label: "Library" },
];

const RECENT_KEY = "unibud_recent_searches";
const MAX_RECENT = 8;

export function getRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addRecentSearch(term) {
  const trimmed = term.trim();
  if (!trimmed) return;
  try {
    const existing = getRecentSearches();
    const filtered = existing.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {}
}

export function clearRecentSearches() {
  try { localStorage.removeItem(RECENT_KEY); } catch {}
}

/**
 * Perform a search across all entities. Uses a text search approach
 * by filtering with a regex-like match on key fields.
 */
async function searchEntity(entityName, fields, limit, query) {
  try {
    const results = await base44.entities[entityName].list("-updated_date", limit * 2);
    if (!results || !Array.isArray(results)) return [];
    const lower = query.toLowerCase();
    return results
      .filter((item) =>
        fields.some((f) => {
          const val = item[f];
          return val && typeof val === "string" && val.toLowerCase().includes(lower);
        })
      )
      .slice(0, limit)
      .map((item) => ({ ...item, _entityType: entityName }));
  } catch {
    return [];
  }
}

export function useUniversalSearch(query, enabled = true) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ["universalSearch", trimmed],
    queryFn: async () => {
      if (!trimmed || trimmed.length < 2) return { categories: [], total: 0 };

      const searches = SEARCH_ENTITIES.map(async (config) => {
        const results = await searchEntity(config.entity, config.fields, config.limit, trimmed);
        return { key: config.key, label: config.label, icon: config.icon, entity: config.entity, results };
      });

      const settled = await Promise.all(searches);
      const categories = settled.filter((c) => c.results.length > 0);
      const total = categories.reduce((sum, c) => sum + c.results.length, 0);
      return { categories, total };
    },
    enabled: enabled && trimmed.length >= 2,
    staleTime: 30000,
    gcTime: 60000,
  });
}

/**
 * AI-powered semantic search — uses InvokeLLM to understand natural language queries
 * and route to the right content or answer directly.
 */
export function useSemanticSearch(query, enabled = true) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ["semanticSearch", trimmed],
    queryFn: async () => {
      if (!trimmed || trimmed.length < 3) return null;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `A student searched for "${trimmed}" on the UNIBUD university platform. ` +
          "Based on this search, suggest the 3 most relevant pages or actions they might want. " +
          "Return as JSON with format: { suggestions: [{ label, description, route }] }",
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  description: { type: "string" },
                  route: { type: "string" },
                },
              },
            },
          },
        },
      });

      return res?.suggestions || [];
    },
    enabled: enabled && trimmed.length >= 3,
    staleTime: 60000,
    gcTime: 120000,
  });
}

const TRENDING_SEARCHES = [
  "Scholarships",
  "Study groups",
  "Campus events",
  "Past questions",
  "Internships",
  "Clubs",
];

export function getTrendingSearches() {
  return TRENDING_SEARCHES;
}