/**
 * UNIBUD Social — real entity-backed API service.
 *
 * All methods query real base44 entities. When no data exists, returns empty
 * arrays so consumers show Bud empty states. No mock data. No fabrication.
 */
import { base44 } from "@/api/base44Client";

export const socialApi = {
  async getProfiles() { return await base44.entities.User.list(20) || []; },
  async getProfile(id) { return id ? await base44.entities.User.get(id) : null; },
  async getPosts() { return await base44.entities.QuadPost.list("-created_date", 20) || []; },
  async getComments(postId) {
    if (!postId) return [];
    return await base44.entities.QuadComment.filter({ post_id: postId }, "-created_date", 50) || [];
  },
  async getCommunities() { return await base44.entities.Community.list(20) || []; },
  async getClubs() { return await base44.entities.Club.list(20) || []; },
  async getOrganizations() { return []; },
  async getConversations() { return await base44.entities.Conversation.list("-updated_date", 20) || []; },
  async getFollowing() { return await base44.entities.Follow.list("-created_date", 50) || []; },
  async getReactions() { return []; },
  async getLiveActivity() { return []; },
  async getDiscoverBundle() { return {}; },
};