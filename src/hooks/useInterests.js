import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * useInterests — loads and saves the student's interest selections
 * to BudMemory (category: preferences, key: interests).
 *
 * Interests persist across devices and feed into Bud's recommendation engine.
 */
export function useInterests() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["bud-memory-interests"],
    queryFn: async () => {
      const records = await base44.entities.BudMemory.filter({ key: "interests" }, "-created_date", 1);
      return records?.[0] || null;
    },
  });

  let interests = [];
  try {
    interests = data?.value ? JSON.parse(data.value) : [];
  } catch {
    interests = [];
  }

  const saveInterests = async (interestIds) => {
    const value = JSON.stringify(interestIds);
    if (data?.id) {
      await base44.entities.BudMemory.update(data.id, { value, source_type: "user" });
    } else {
      await base44.entities.BudMemory.create({
        category: "preferences",
        key: "interests",
        value,
        source_type: "user",
        reason: "Student selected these interests to personalize their community experience",
      });
    }
    qc.invalidateQueries({ queryKey: ["bud-memory-interests"] });
  };

  return { interests, loading: isLoading, saveInterests, hasInterests: interests.length > 0 };
}