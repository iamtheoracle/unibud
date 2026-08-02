import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * useUniversalSearch — searches across all major UNIBUD entities in parallel.
 * Returns grouped results by entity type.
 */
export function useUniversalSearch() {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const enabled = q.length >= 2;

  const { data, isLoading } = useQuery({
    queryKey: ["universalSearch", q],
    queryFn: async () => {
      const results = {};

      // Run all searches in parallel
      const [
        posts, events, clubs, communities, marketplace,
        studyGroups, opportunities, scholarships, courses, research,
      ] = await Promise.allSettled([
        base44.entities.QuadPost.filter({}, "-created_date", 30),
        base44.entities.CampusEvent.filter({}, "-created_date", 30),
        base44.entities.Club.list("-created_date", 30),
        base44.entities.Community.list("-created_date", 30),
        base44.entities.MarketplaceListing.filter({}, "-created_date", 30),
        base44.entities.StudyGroup.list("-created_date", 30),
        base44.entities.Opportunity.list("-created_date", 30),
        base44.entities.Scholarship.list("-created_date", 30),
        base44.entities.Course.list("-created_date", 30),
        base44.entities.ResearchProject.list("-created_date", 30),
      ]);

      const match = (text) => (text || "").toLowerCase().includes(q);
      const unwrap = (r) => (r.status === "fulfilled" ? (r.value || []) : []);

      const postsData = unwrap(posts).filter(p => match(p.content) || match(p.author_name));
      if (postsData.length) results.posts = postsData;

      const eventsData = unwrap(events).filter(e => match(e.title) || match(e.description) || match(e.location));
      if (eventsData.length) results.events = eventsData;

      const clubsData = unwrap(clubs).filter(c => match(c.name) || match(c.description) || match(c.category));
      if (clubsData.length) results.clubs = clubsData;

      const communitiesData = unwrap(communities).filter(c => match(c.name) || match(c.description));
      if (communitiesData.length) results.communities = communitiesData;

      const marketData = unwrap(marketplace).filter(m => match(m.title) || match(m.description) || match(m.category));
      if (marketData.length) results.marketplace = marketData;

      const sgData = unwrap(studyGroups).filter(s => match(s.name) || match(s.subject) || match(s.description));
      if (sgData.length) results.studyGroups = sgData;

      const oppData = unwrap(opportunities).filter(o => match(o.title) || match(o.company) || match(o.description));
      if (oppData.length) results.opportunities = oppData;

      const scholData = unwrap(scholarships).filter(s => match(s.name) || match(s.provider) || match(s.description));
      if (scholData.length) results.scholarships = scholData;

      const courseData = unwrap(courses).filter(c => match(c.title) || match(c.course_code) || match(c.department));
      if (courseData.length) results.courses = courseData;

      const researchData = unwrap(research).filter(r => match(r.title) || match(r.abstract) || match(r.author));
      if (researchData.length) results.research = researchData;

      return results;
    },
    enabled,
    staleTime: 15000,
  });

  const clear = useCallback(() => setQuery(""), []);

  useEffect(() => {
    return () => setQuery("");
  }, []);

  return { query, setQuery, results: data || {}, isLoading: enabled && isLoading, clear };
}