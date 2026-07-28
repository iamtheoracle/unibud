/**
 * UNIBUD Social — mock API service.
 *
 * Returns realistic social data with simulated latency across every social
 * domain. Structured so a real base44 entity-backed implementation can drop in
 * later without changing the hook signatures.
 */
import {
  SOCIAL_PROFILES_MOCK, SOCIAL_POSTS_MOCK, SOCIAL_COMMENTS_MOCK,
  SOCIAL_COMMUNITIES_MOCK, SOCIAL_CLUBS_MOCK, SOCIAL_ORGANIZATIONS_MOCK,
  SOCIAL_CONVERSATIONS_MOCK, SOCIAL_FOLLOWING_MOCK, SOCIAL_REACTIONS_MOCK,
  SOCIAL_LIVE_ACTIVITY_MOCK, DISCOVER_MOCK_BUNDLE,
} from "./mockData";

const LATENCY = 320;
const wait = (ms = LATENCY) => new Promise((r) => setTimeout(r, ms));

export const socialApi = {
  async getProfiles() { await wait(); return SOCIAL_PROFILES_MOCK; },
  async getProfile(id) { await wait(200); return SOCIAL_PROFILES_MOCK.find((p) => p.id === id) || null; },
  async getPosts() { await wait(); return SOCIAL_POSTS_MOCK; },
  async getComments(postId) {
    await wait(220);
    return postId ? (SOCIAL_COMMENTS_MOCK[postId] || []) : Object.values(SOCIAL_COMMENTS_MOCK).flat();
  },
  async getCommunities() { await wait(); return SOCIAL_COMMUNITIES_MOCK; },
  async getClubs() { await wait(); return SOCIAL_CLUBS_MOCK; },
  async getOrganizations() { await wait(); return SOCIAL_ORGANIZATIONS_MOCK; },
  async getConversations() { await wait(240); return SOCIAL_CONVERSATIONS_MOCK; },
  async getFollowing() { await wait(220); return SOCIAL_FOLLOWING_MOCK; },
  async getReactions() { await wait(160); return SOCIAL_REACTIONS_MOCK; },
  async getLiveActivity() { await wait(260); return SOCIAL_LIVE_ACTIVITY_MOCK; },
  async getDiscoverBundle() { await wait(); return DISCOVER_MOCK_BUNDLE; },
};