/**
 * Opportunity Engine — Scholarships, Internships & Competitions
 *
 * Continuously discovers and recommends opportunities: scholarships,
 * internships, competitions, hackathons, research positions, campus jobs,
 * exchange programs, fellowships, and grants.
 *
 * Flow: Nexus → StudentIntelligenceLayer → OpportunityEngineService
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { BaseService } from './BaseService';

class OpportunityEngineService extends BaseService {
  constructor() {
    super({
      id: 'opportunityEngine',
      version: '1.0.0',
      dependencies: ['identity'],
      capabilities: ['find_opportunities', 'recommend_opportunities', 'deadline_alerts'],
    });
  }

  async _onInit() { logger.info('OpportunityEngineService initialized'); }

  async _onHealth() {
    const available = !!base44.entities?.Opportunity;
    return { healthy: available, detail: available ? 'Opportunity entity available' : 'Opportunity entity missing' };
  }

  async findOpportunities({ type, interests, institutionId, userId }) {
    const start = Date.now();
    try {
      const [opportunities, scholarships, applications] = await Promise.all([
        this._queryOpportunities(type, institutionId),
        this._queryScholarships(institutionId),
        userId ? this._queryApplications(userId) : Promise.resolve([]),
      ]);

      const appliedIds = new Set(applications.map((a) => a.opportunity_id));

      const allCandidates = [
        ...opportunities.map((o) => this._scoreOpportunity(o, { interests, appliedIds })),
        ...scholarships.map((s) => this._scoreScholarship(s, { interests, appliedIds })),
      ]
        .filter((o) => o.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10);

      this._recordRequest(Date.now() - start);
      return allCandidates;
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Opportunity search failed', { error: e.message });
      return [];
    }
  }

  async getDeadlineAlerts({ userId, institutionId }) {
    try {
      const opportunities = await this._queryOpportunities(null, institutionId);
      const now = new Date();
      const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      return opportunities
        .filter((o) => o.deadline && new Date(o.deadline) <= weekLater && new Date(o.deadline) >= now)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 5)
        .map((o) => ({
          id: o.id, name: o.title, type: o.type, deadline: o.deadline,
          organization: o.organization, amount: o.amount, link: o.link,
          daysLeft: Math.ceil((new Date(o.deadline) - now) / (1000 * 60 * 60 * 24)),
        }));
    } catch (e) {
      logger.error('Deadline alert failed', { error: e.message });
      return [];
    }
  }

  _scoreOpportunity(opp, { interests, appliedIds }) {
    let score = 20;
    if (appliedIds?.has(opp.id)) score = 0; // already applied
    if (interests && opp.tags) {
      const interestMatch = interests.filter((i) =>
        opp.tags.some((t) => t?.toLowerCase().includes(i?.toLowerCase()))
      );
      score += interestMatch.length * 20;
    }
    // Urgency bonus
    if (opp.deadline) {
      const daysLeft = Math.ceil((new Date(opp.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 7 && daysLeft > 0) score += 15;
    }
    return {
      id: opp.id, name: opp.title, type: 'opportunity',
      opportunityType: opp.type, organization: opp.organization,
      deadline: opp.deadline, amount: opp.amount, link: opp.link,
      eligibility: opp.eligibility, tags: opp.tags,
      isApplied: appliedIds?.has(opp.id) || false, matchScore: score,
    };
  }

  _scoreScholarship(sch, { interests, appliedIds }) {
    let score = 25;
    if (interests && sch.tags) {
      const interestMatch = interests.filter((i) =>
        sch.tags.some((t) => t?.toLowerCase().includes(i?.toLowerCase()))
      );
      score += interestMatch.length * 20;
    }
    return {
      id: sch.id, name: sch.title || sch.name, type: 'opportunity',
      opportunityType: 'scholarship', organization: sch.organization || sch.provider,
      deadline: sch.deadline, amount: sch.amount, link: sch.link,
      eligibility: sch.eligibility, tags: sch.tags,
      isApplied: false, matchScore: score,
    };
  }

  async _queryOpportunities(type, institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      if (type) filter.type = type;
      return await base44.entities.Opportunity.filter(filter, '-created_date', 30);
    } catch { return []; }
  }
  async _queryScholarships(institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.Scholarship.filter(filter, '-created_date', 20);
    } catch { return []; }
  }
  async _queryApplications(userId) {
    try {
      return await base44.entities.ApplicationTracker.filter({ created_by_id: userId }, '-created_date', 20);
    } catch { return []; }
  }
}

export const opportunityEngineService = new OpportunityEngineService();
export default opportunityEngineService;