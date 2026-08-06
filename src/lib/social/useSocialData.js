/**
 * UNIBUD Social — React Query state layer.
 *
 * One hook per social domain, all backed by the mock socialApi. Swapping in
 * real entity-backed APIs later requires no consumer changes.
 */
import { useQuery } from "@tanstack/react-query";
import { socialApi } from "./socialApi";

const STALE = 5 * 60 * 1000;

export function useSocialProfiles() {
  return useQuery({ queryKey: ["social", "profiles"], queryFn: socialApi.getProfiles, staleTime: STALE });
}
export function useSocialProfile(id) {
  return useQuery({ queryKey: ["social", "profile", id], queryFn: () => socialApi.getProfile(id), enabled: !!id, staleTime: STALE });
}
export function useSocialPosts() {
  return useQuery({ queryKey: ["social", "posts"], queryFn: socialApi.getPosts, staleTime: 60 * 1000 });
}
export function useSocialComments(postId) {
  return useQuery({ queryKey: ["social", "comments", postId], queryFn: () => socialApi.getComments(postId), enabled: !!postId, staleTime: 60 * 1000 });
}
export function useCommunities() {
  return useQuery({ queryKey: ["social", "communities"], queryFn: socialApi.getCommunities, staleTime: STALE });
}
export function useClubs() {
  return useQuery({ queryKey: ["social", "clubs"], queryFn: socialApi.getClubs, staleTime: STALE });
}
export function useOrganizations() {
  return useQuery({ queryKey: ["social", "organizations"], queryFn: socialApi.getOrganizations, staleTime: STALE });
}
export function useSocialConversations() {
  return useQuery({ queryKey: ["social", "conversations"], queryFn: socialApi.getConversations, staleTime: 60 * 1000 });
}
export function useFollowing() {
  return useQuery({ queryKey: ["social", "following"], queryFn: socialApi.getFollowing, staleTime: STALE });
}
export function useSocialReactions() {
  return useQuery({ queryKey: ["social", "reactions"], queryFn: socialApi.getReactions, staleTime: STALE });
}
export function useSocialLiveActivity() {
  return useQuery({ queryKey: ["social", "live"], queryFn: socialApi.getLiveActivity, staleTime: 30 * 1000 });
}
export function useSocialDiscover() {
  return useQuery({ queryKey: ["social", "discover"], queryFn: socialApi.getDiscoverBundle, staleTime: STALE });
}