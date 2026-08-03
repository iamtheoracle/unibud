/**
 * Cross-Space Intelligence Service — Platform-Wide Recommendations
 *
 * Connects intelligence across every UNIBUD domain: Finance,
 * Marketplace, Events, Housing, Health, Clubs, Careers, and Creator.
 * Enables recommendations that span the whole platform.
 *
 * Flow: Nexus → StudentIntelligenceLayer → CrossSpaceIntelligenceService
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { BaseService } from './BaseService';

class CrossSpaceIntelligenceService extends BaseService {
  constructor() {
    super({
      id: 'crossSpaceIntelligence',
      version: '1.0.0',
      dependencies: ['identity'],
      capabilities: ['integrated_recommendations', 'finance_insights', 'marketplace_insights', 'wellness_insights', 'club_recommendations'],
    });
  }

  async _onInit() { logger.info('CrossSpaceIntelligenceService initialized'); }

  async _onHealth() {
    const available = !!base44.entities?.Club || !!base44.entities?.MarketplaceListing;
    return { healthy: available, detail: available ? 'Cross-space entities available' : 'Cross-space entities missing' };
  }

  async getIntegratedRecommendations({ userId, institutionId }) {
    const start = Date.now();
    try {
      const [clubs, events, marketplace, wellness, wallet] = await Promise.all([
        this._queryClubs(institutionId),
        this._queryEvents(institutionId),
        this._queryMarketplace(institutionId),
        this._queryWellness(userId),
        this._queryWallet(userId),
      ]);

      const recommendations = [];

      // Club recommendations
      if (clubs.length > 0) {
        recommendations.push({
          type: 'club', source: 'social',
          name: clubs[0].name, detail: `${clubs[0].category} · ${clubs[0].members_count || 0} members`,
          score: 60, reason: 'matches your interests',
        });
      }

      // Event recommendations
      const upcomingEvents = events.filter((e) => e.start_date && new Date(e.start_date) > new Date());
      if (upcomingEvents.length > 0) {
        recommendations.push({
          type: 'event', source: 'campus',
          name: upcomingEvents[0].title, detail: `happening soon at ${upcomingEvents[0].location || 'campus'}`,
          score: 55, reason: 'upcoming and relevant',
        });
      }

      // Marketplace recommendations
      const activeListings = marketplace.filter((m) => m.status === 'active');
      if (activeListings.length > 0) {
        recommendations.push({
          type: 'marketplace', source: 'marketplace',
          name: activeListings[0].title, detail: `${activeListings[0].category} · ${activeListings[0].price || 'Free'}`,
          score: 40, reason: 'available on campus',
        });
      }

      // Wellness check
      const recentWellness = wellness.slice(0, 3);
      if (recentWellness.length > 0 && recentWellness[0].mood === 'stressed') {
        recommendations.push({
          type: 'wellness', source: 'health',
          name: 'Take a break', detail: 'Your recent wellness entries show stress',
          score: 70, reason: 'wellbeing priority',
        });
      }

      // Finance insight
      if (wallet) {
        recommendations.push({
          type: 'finance', source: 'finance',
          name: 'Wallet check', detail: `Balance: ${wallet.currency || 'NGN'} ${wallet.balance || 0}`,
          score: 30, reason: 'financial awareness',
        });
      }

      this._recordRequest(Date.now() - start);
      return recommendations.sort((a, b) => b.score - a.score).slice(0, 8);
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Cross-space recommendations failed', { error: e.message });
      return [];
    }
  }

  async getFinanceInsights({ userId }) {
    try {
      const wallet = await this._queryWallet(userId);
      if (!wallet) return { hasWallet: false, detail: 'No wallet found' };
      return {
        hasWallet: true,
        balance: wallet.balance,
        currency: wallet.currency || 'NGN',
        detail: `Your wallet balance is ${wallet.currency || 'NGN'} ${wallet.balance || 0}.`,
      };
    } catch (e) {
      logger.error('Finance insights failed', { error: e.message });
      return { hasWallet: false };
    }
  }

  async getClubRecommendations({ userId, institutionId, interests }) {
    try {
      const clubs = await this._queryClubs(institutionId);
      return clubs
        .map((c) => {
          let score = 20;
          if (interests && c.tags) {
            const matchCount = interests.filter((i) => c.tags.some((t) => t?.toLowerCase().includes(i?.toLowerCase()))).length;
            score += matchCount * 25;
          }
          if (c.is_recruiting) score += 15;
          return {
            id: c.id, name: c.name, type: 'club',
            category: c.category, membersCount: c.members_count || 0,
            isRecruiting: c.is_recruiting, matchScore: score,
          };
        })
        .filter((c) => c.matchScore > 20)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);
    } catch (e) {
      logger.error('Club recommendations failed', { error: e.message });
      return [];
    }
  }

  async _queryClubs(institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.Club.filter(filter, '-members_count', 20);
    } catch { return []; }
  }
  async _queryEvents(institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.CampusEvent.filter(filter, '-start_date', 15);
    } catch { return []; }
  }
  async _queryMarketplace(institutionId) {
    try {
      return await base44.entities.MarketplaceListing.filter({ status: 'active' }, '-created_date', 10);
    } catch { return []; }
  }
  async _queryWellness(userId) {
    try { return await base44.entities.WellnessEntry.filter({ created_by_id: userId }, '-created_date', 5); }
    catch { return []; }
  }
  async _queryWallet(userId) {
    try {
      const wallets = await base44.entities.Wallet.filter({ created_by_id: userId }, '-created_date', 1);
      return wallets[0] || null;
    } catch { return null; }
  }
}

export const crossSpaceIntelligenceService = new CrossSpaceIntelligenceService();
export default crossSpaceIntelligenceService;