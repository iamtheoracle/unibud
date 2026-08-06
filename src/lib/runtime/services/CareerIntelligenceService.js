/**
 * Career Intelligence Service — Skills, Certifications & Alumni Network
 *
 * Answers career questions: skill gaps, recommended certifications,
 * alumni at specific companies, and career path matching.
 *
 * Flow: Nexus → StudentIntelligenceLayer → CareerIntelligenceService
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { BaseService } from './BaseService';

class CareerIntelligenceService extends BaseService {
  constructor() {
    super({
      id: 'careerIntelligence',
      version: '1.0.0',
      dependencies: ['identity'],
      capabilities: ['analyze_skill_gaps', 'recommend_certifications', 'find_alumni', 'match_career_path'],
    });
  }

  async _onInit() { logger.info('CareerIntelligenceService initialized'); }

  async _onHealth() {
    const available = !!base44.entities?.CompanyPage;
    return { healthy: available, detail: available ? 'CompanyPage available' : 'CompanyPage missing' };
  }

  async analyzeSkillGaps({ userId, targetRole, institutionId }) {
    const start = Date.now();
    try {
      const [portfolio, grades, research] = await Promise.all([
        this._queryPortfolio(userId),
        this._queryGrades(userId, institutionId),
        this._queryResearch(userId, institutionId),
      ]);

      // Skills from portfolio items
      const currentSkills = new Set();
      portfolio.forEach((p) => {
        (p.skills || p.tags || []).forEach((s) => currentSkills.add(s?.toLowerCase()));
      });
      grades.forEach((g) => {
        if (g.course_title) currentSkills.add(g.course_title.toLowerCase());
      });

      // Target role skills (simplified — in production, would use a skills database)
      const targetSkills = this._getRoleSkills(targetRole);
      const missing = targetSkills.filter((s) => !currentSkills.has(s.toLowerCase()));
      const has = targetSkills.filter((s) => currentSkills.has(s.toLowerCase()));

      this._recordRequest(Date.now() - start);
      return {
        targetRole,
        currentSkills: Array.from(currentSkills),
        targetSkills,
        hasSkills: has,
        missingSkills: missing,
        completionRate: targetSkills.length > 0 ? Math.round((has.length / targetSkills.length) * 100) : 0,
        detail: `You have ${has.length} of ${targetSkills.length} skills needed for ${targetRole}. Missing: ${missing.slice(0, 5).join(', ')}.`,
      };
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Skill gap analysis failed', { error: e.message });
      return { targetRole, currentSkills: [], missingSkills: [], completionRate: 0 };
    }
  }

  async recommendCertifications({ targetRole, interests }) {
    try {
      // In production, this would query a certifications database
      const certMap = {
        'data science': ['AWS Machine Learning', 'Google Data Analytics', 'IBM Data Science'],
        'software engineering': ['AWS Solutions Architect', 'Azure Developer', 'MongoDB Developer'],
        'cybersecurity': ['CompTIA Security+', 'CISSP', 'CEH (Certified Ethical Hacker)'],
        'product management': ['Google Project Management', 'Scrum Master (PSM I)', 'Product Analytics'],
        'finance': ['CFA Level I', 'ACCA', 'Financial Modeling (FMVA)'],
        'marketing': ['Google Ads', 'HubSpot Inbound', 'Meta Blueprint'],
      };

      const key = (targetRole || interests?.[0] || '').toLowerCase();
      const certs = Object.entries(certMap).find(([role]) => key.includes(role))?.[1] || [];

      return certs.map((c) => ({ name: c, type: 'certification', matchScore: 60 }));
    } catch (e) {
      logger.error('Certification recommendation failed', { error: e.message });
      return [];
    }
  }

  async findAlumniAtCompany({ companyName, institutionId }) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      const companies = await base44.entities.CompanyPage.filter(filter, '-created_date', 20);

      const matching = companies.filter((c) =>
        (c.name || '').toLowerCase().includes(companyName?.toLowerCase())
      );

      return matching.map((c) => ({
        id: c.id, name: c.name, type: 'company',
        industry: c.industry, description: c.description,
        website: c.website, matchScore: 70,
      }));
    } catch (e) {
      logger.error('Alumni search failed', { error: e.message });
      return [];
    }
  }

  async matchCareerPath({ userId, institutionId }) {
    try {
      const grades = await this._queryGrades(userId, institutionId);
      const cgpa = this._estimateCGPA(grades);

      // Determine strong subjects
      const subjectGrades = {};
      grades.forEach((g) => {
        const subject = g.course_title || g.course_code;
        const point = { A: 5, B: 4, C: 3, D: 2, F: 0 }[g.grade?.toUpperCase()] || 0;
        if (!subjectGrades[subject]) subjectGrades[subject] = [];
        subjectGrades[subject].push(point);
      });

      const strongSubjects = Object.entries(subjectGrades)
        .map(([subj, points]) => ({ subject: subj, avg: points.reduce((a, b) => a + b, 0) / points.length }))
        .filter((s) => s.avg >= 4)
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 5);

      // Map strong subjects to career paths
      const careerMap = {
        'programming': 'Software Engineer', 'computer': 'Software Engineer',
        'mathematics': 'Data Analyst', 'statistics': 'Data Scientist',
        'chemistry': 'Research Chemist', 'physics': 'Research Physicist',
        'finance': 'Financial Analyst', 'accounting': 'Accountant',
        'marketing': 'Marketing Specialist', 'management': 'Business Consultant',
      };

      const careerPaths = strongSubjects
        .map((s) => {
          const key = Object.keys(careerMap).find((k) => s.subject?.toLowerCase().includes(k));
          return key ? { career: careerMap[key], relatedSubject: s.subject, strength: s.avg } : null;
        })
        .filter(Boolean)
        .slice(0, 3);

      return {
        cgpa: cgpa.toFixed(2),
        strongSubjects: strongSubjects.map((s) => s.subject),
        careerPaths,
        detail: careerPaths.length > 0
          ? `Based on your strong performance in ${strongSubjects.map((s) => s.subject).join(', ')}, consider: ${careerPaths.map((c) => c.career).join(', ')}`
          : 'Not enough grade data to determine career paths.',
      };
    } catch (e) {
      logger.error('Career path matching failed', { error: e.message });
      return { careerPaths: [], detail: 'Analysis failed' };
    }
  }

  _getRoleSkills(role) {
    const skillsMap = {
      'data science': ['Python', 'SQL', 'Statistics', 'Machine Learning', 'Data Visualization'],
      'software engineering': ['Programming', 'Algorithms', 'Git', 'System Design', 'Testing'],
      'cybersecurity': ['Network Security', 'Cryptography', 'Risk Assessment', 'Python', 'Linux'],
      'product management': ['Strategy', 'Analytics', 'User Research', 'Communication', 'Agile'],
      'finance': ['Financial Modeling', 'Excel', 'Accounting', 'Valuation', 'Risk Management'],
      'marketing': ['SEO', 'Content Strategy', 'Analytics', 'Social Media', 'Copywriting'],
    };
    const key = (role || '').toLowerCase();
    return Object.entries(skillsMap).find(([r]) => key.includes(r))?.[1] || ['Communication', 'Teamwork', 'Problem Solving'];
  }

  _estimateCGPA(grades) {
    if (!grades?.length) return 0;
    const points = { A: 5, B: 4, C: 3, D: 2, F: 0 };
    let total = 0, count = 0;
    grades.forEach((g) => { total += points[g.grade?.toUpperCase()] || 0; count++; });
    return count > 0 ? total / count : 0;
  }

  async _queryPortfolio(userId) {
    try { return await base44.entities.PortfolioItem.filter({ created_by_id: userId }, '-created_date', 20); }
    catch { return []; }
  }
  async _queryGrades(userId, institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.StudentGrade.filter(filter, '-created_date', 50);
    } catch { return []; }
  }
  async _queryResearch(userId, institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.ResearchProject.filter(filter, '-created_date', 10);
    } catch { return []; }
  }
}

export const careerIntelligenceService = new CareerIntelligenceService();
export default careerIntelligenceService;