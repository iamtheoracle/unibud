import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { DEFAULT_PREFS } from "./budPrefsDefaults";

const PREF_KEY = ["BudNotificationPrefs"];

/**
 * useBudNotificationPrefs — the single source of truth for the user's Bud
 * notification preferences. Loads the one NotificationPreference record owned
 * by the user, merges it with defaults, and exposes a savePrefs(patch) that
 * deep-merges nested categories/delivery objects.
 */
export function useBudNotificationPrefs() {
  const qc = useQueryClient();
  const prefQ = useQuery({
    queryKey: PREF_KEY,
    queryFn: async () => {
      const list = await base44.entities.NotificationPreference.filter({}, "-created_date", 1);
      return list[0] || null;
    },
  });

  const stored = prefQ.data || {};
  const prefs = {
    ...DEFAULT_PREFS,
    ...stored,
    categories: { ...DEFAULT_PREFS.categories, ...(stored.categories || {}) },
    delivery: { ...DEFAULT_PREFS.delivery, ...(stored.delivery || {}) },
  };

  const savePrefs = useMutation({
    mutationFn: (patch) => {
      const merged = {
        ...prefs,
        ...patch,
        categories: { ...prefs.categories, ...(patch.categories || {}) },
        delivery: { ...prefs.delivery, ...(patch.delivery || {}) },
      };
      if (stored.id) return base44.entities.NotificationPreference.update(stored.id, merged);
      return base44.entities.NotificationPreference.create(merged);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PREF_KEY }),
  });

  return {
    prefs,
    prefId: stored.id,
    savePrefs: savePrefs.mutate,
    saving: savePrefs.isPending,
    loading: prefQ.isLoading,
  };
}