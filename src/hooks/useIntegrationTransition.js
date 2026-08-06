import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { INTEGRATION_STATUSES } from "@/lib/content/contentProvenance";

/**
 * useIntegrationTransition — detects temporary external content that
 * is waiting for an official API integration to replace it.
 *
 * Returns content grouped by the integration type that will replace
 * each source. When an integration connects, call useFlagForTransition
 * to mark matching content as pending_transition.
 */
export function useIntegrationTransition() {
  return useQuery({
    queryKey: ["integration-transition", "pending"],
    queryFn: async () => {
      const items = await base44.entities.ExternalContent.filter(
        {
          integration_status: INTEGRATION_STATUSES.TEMPORARY_EXTERNAL,
          is_active: true,
        },
        "-collected_at",
        100
      );

      // Group by the integration that will replace each source
      const byIntegration = {};
      for (const item of items) {
        const key = item.replaces_integration || "unspecified";
        if (!byIntegration[key]) byIntegration[key] = [];
        byIntegration[key].push(item);
      }

      return {
        items,
        byIntegration,
        totalPending: items.length,
        integrationTypes: Object.keys(byIntegration).filter((k) => k !== "unspecified"),
      };
    },
  });
}

/**
 * useFlagForTransition — marks temporary external content as
 * pending_transition when its corresponding official integration
 * has been connected. This is the first step of the seamless
 * transition from temporary external sources to official API data.
 *
 * Bookmarks, reactions, collections, and discussion history are
 * preserved — only the integration_status field changes.
 */
export function useFlagForTransition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (integrationType) => {
      const items = await base44.entities.ExternalContent.filter(
        {
          replaces_integration: integrationType,
          integration_status: INTEGRATION_STATUSES.TEMPORARY_EXTERNAL,
          is_active: true,
        },
        "-collected_at",
        100
      );

      if (items.length === 0) return { updated: 0 };

      const updates = items.map((item) => ({
        id: item.id,
        integration_status: INTEGRATION_STATUSES.PENDING_TRANSITION,
      }));

      await base44.entities.ExternalContent.bulkUpdate(updates);
      return { updated: items.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integration-transition"] });
      queryClient.invalidateQueries({ queryKey: ["external-content"] });
    },
  });
}

/**
 * useMarkMigrated — marks specific external content as migrated
 * after official API data has successfully replaced it.
 * Deactivates the temporary source while preserving all user
 * interactions (bookmarks, reactions, discussions).
 */
export function useMarkMigrated() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentId) => {
      return base44.entities.ExternalContent.update(contentId, {
        integration_status: INTEGRATION_STATUSES.MIGRATED,
        is_active: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integration-transition"] });
      queryClient.invalidateQueries({ queryKey: ["external-content"] });
    },
  });
}