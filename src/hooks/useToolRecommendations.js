import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { detectRecommendations, computeStats } from "@/lib/spark/recommendations/sparkRecommendations";

const PREFS_KEY = ["spark", "recommendation_prefs"];
const FEEDBACK_KEY = ["spark", "recommendation_feedback"];

/**
 * useToolRecommendations — fetches prefs + past feedback, computes the
 * learned helpfulness stats, and exposes the current ranked suggestions
 * plus accept/dismiss/disable actions that persist feedback so Spark
 * keeps improving.
 */
export function useToolRecommendations(context) {
  const qc = useQueryClient();
  const [hidden, setHidden] = useState({});

  const prefsQ = useQuery({
    queryKey: PREFS_KEY,
    queryFn: async () => {
      const list = await base44.entities.RecommendationPreference.list();
      if (list && list.length) return list[0];
      return base44.entities.RecommendationPreference.create({
        enabled: true,
        disabled_types: [],
        cooldown_minutes: 60,
        last_dismissed: {},
      });
    },
    staleTime: 30000,
  });

  const feedbackQ = useQuery({
    queryKey: FEEDBACK_KEY,
    queryFn: async () => base44.entities.ToolRecommendation.list("-created_date", 200),
    staleTime: 30000,
  });

  const prefs = prefsQ.data;
  const feedback = feedbackQ.data || [];
  const stats = useMemo(() => computeStats(feedback), [feedback]);

  const recommendations = useMemo(() => {
    if (!prefs) return [];
    return detectRecommendations(context || {}, prefs, stats).filter((r) => !hidden[r.type]);
  }, [context, prefs, stats, hidden]);

  // Reset local hidden state when the context meaningfully changes.
  const surfKey = JSON.stringify(context);
  useEffect(() => { setHidden({}); }, [surfKey]);

  const record = useMutation({
    mutationFn: async ({ rec, status }) =>
      base44.entities.ToolRecommendation.create({
        recommendation_type: rec.type,
        surface: rec.surface,
        title: rec.title,
        description: rec.description,
        suggested_tool: rec.suggested_tool,
        suggested_route: rec.suggested_route,
        context: rec.context,
        status,
        priority: rec.priority,
        confidence: rec.confidence,
        helpfulness: rec.helpfulness,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: FEEDBACK_KEY }),
  });

  const updatePrefs = useMutation({
    mutationFn: async (patch) => {
      if (!prefs?.id) return null;
      return base44.entities.RecommendationPreference.update(prefs.id, patch);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PREFS_KEY }),
  });

  const accept = useCallback((rec, navigate) => {
    record.mutate({ rec, status: "accepted" });
    setHidden((h) => ({ ...h, [rec.type]: true }));
    if (navigate && rec.suggested_route) navigate(rec.suggested_route);
  }, [record]);

  const dismiss = useCallback((rec) => {
    record.mutate({ rec, status: "dismissed" });
    const last = prefs?.last_dismissed || {};
    updatePrefs.mutate({ last_dismissed: { ...last, [rec.type]: new Date().toISOString() } });
    setHidden((h) => ({ ...h, [rec.type]: true }));
  }, [record, updatePrefs, prefs]);

  const disable = useCallback((rec) => {
    record.mutate({ rec, status: "disabled" });
    const dt = prefs?.disabled_types || [];
    if (!dt.includes(rec.type)) updatePrefs.mutate({ disabled_types: [...dt, rec.type] });
    setHidden((h) => ({ ...h, [rec.type]: true }));
  }, [record, updatePrefs, prefs]);

  const setEnabled = useCallback((enabled) => updatePrefs.mutate({ enabled }), [updatePrefs]);

  const reenableType = useCallback((type) => {
    const dt = prefs?.disabled_types || [];
    updatePrefs.mutate({ disabled_types: dt.filter((t) => t !== type) });
  }, [updatePrefs, prefs]);

  return {
    recommendations,
    prefs,
    stats,
    accept,
    dismiss,
    disable,
    setEnabled,
    reenableType,
    loading: prefsQ.isLoading,
  };
}