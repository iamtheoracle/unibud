/**
 * Seed Content Service — manages launch content for the Campus Feed.
 *
 * - seed: generate realistic posts, comments, opportunities, and scholarships
 * - clear: remove all seed content
 * - status: check seed vs real content ratio and Orbit replacement phase
 * - archive: gradually replace seed content as real activity grows
 */
import { base44 } from "@/api/base44Client";

export async function seedFeed() {
  const res = await base44.functions.invoke("seedCampusFeed", { action: "seed" });
  return res.data;
}

export async function clearSeedContent() {
  const res = await base44.functions.invoke("seedCampusFeed", { action: "clear" });
  return res.data;
}

export async function getSeedStatus() {
  const res = await base44.functions.invoke("seedCampusFeed", { action: "status" });
  return res.data;
}

export async function archiveSeedContent() {
  const res = await base44.functions.invoke("seedCampusFeed", { action: "archive" });
  return res.data;
}