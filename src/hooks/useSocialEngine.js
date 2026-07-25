import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import * as E from "@/lib/social/engines";

const KEY = "unibud_social_connections";
function readConns() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}

/**
 * useSocialEngine — aggregates campus data and runs it through the Social
 * Intelligence sub-engines, returning a unified, personalized view.
 */
export function useSocialEngine() {
  const me = useQuery({ queryKey: ["se-me"], queryFn: () => base44.auth.me() });
  const quad = useQuery({ queryKey: ["se-quad"], queryFn: () => base44.entities.QuadPost.list("-created_date", 40) });
  const opps = useQuery({ queryKey: ["se-opps"], queryFn: () => base44.entities.Opportunity.list("-created_date", 30) });
  const sch = useQuery({ queryKey: ["se-sch"], queryFn: () => base44.entities.Scholarship.list("-created_date", 30) });
  const events = useQuery({ queryKey: ["se-events"], queryFn: () => base44.entities.CampusEvent.list("date", 30) });
  const groups = useQuery({ queryKey: ["se-groups"], queryFn: () => base44.entities.StudyGroup.list("-created_date", 20) });
  const research = useQuery({ queryKey: ["se-research"], queryFn: () => base44.entities.ResearchProject.list("-created_date", 20) });
  const communities = useQuery({ queryKey: ["se-comm"], queryFn: () => base44.entities.Community.list("-created_date", 20) });

  return useMemo(() => {
    const connections = readConns();
    const identity = E.identityEngine(me.data, connections);
    const feed = E.feedAggregator([
      { type: "campus", items: quad.data || [] },
      { type: "opportunity", items: opps.data || [] },
      { type: "scholarship", items: sch.data || [] },
      { type: "event", items: events.data || [] },
      { type: "group", items: groups.data || [] },
      { type: "research", items: research.data || [] },
      { type: "community", items: communities.data || [] },
    ]);
    const opportunities = E.opportunityEngine(opps.data, sch.data);
    return {
      identity,
      permissions: E.permissionEngine(connections),
      connectors: E.SOCIAL_CONNECTORS,
      feed,
      trends: E.trendEngine(feed),
      recommendations: E.recommendationEngine(feed, identity),
      personalized: E.personalizationEngine(feed, identity),
      events: E.eventEngine(events.data),
      opportunities,
      creators: E.creatorEngine(quad.data),
      safety: E.safetyEngine(feed),
      notifications: E.notificationEngine({ feed, events: events.data, opportunities }),
    };
  }, [me.data, quad.data, opps.data, sch.data, events.data, groups.data, research.data, communities.data]);
}