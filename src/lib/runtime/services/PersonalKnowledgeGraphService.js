/**
 * Personal Knowledge Graph Service — Student's Private Intelligence Graph
 *
 * Builds and maintains a private knowledge graph for each student
 * connecting: goals, habits, interests, strengths, weaknesses, friends,
 * projects, and preferred learning style. The recommendation engine
 * uses this graph to personalize assistance over time.
 *
 * Flow: Nexus → StudentIntelligenceLayer → PersonalKnowledgeGraphService
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { BaseService } from './BaseService';

class PersonalKnowledgeGraphService extends BaseService {
  constructor() {
    super({
      id: 'personalKnowledgeGraph',
      version: '1.0.0',
      dependencies: ['identity'],
      capabilities: ['get_knowledge_graph', 'get_strengths', 'get_weaknesses', 'get_learning_style', 'add_goal'],
    });
  }

  async _onInit() { logger.info('PersonalKnowledgeGraphService initialized'); }

  async _onHealth() {
    const available = !!base44.entities?.StudentGoal || !!base44.entities?.WellnessEntry;
    return { healthy: available, detail: available ? 'Knowledge graph entities available' : 'Entities missing' };
  }

  /**
   * Build the student's personal knowledge graph from all available data.
   */
  async getKnowledgeGraph({ userId, institutionId }) {
    const start = Date.now();
    try {
      const [goals, wellness, grades, follows, notes, projects, interests] = await Promise.all([
        this._queryGoals(userId),
        this._queryWellness(userId),
        this._queryGrades(userId, institutionId),
        this._queryFollows(userId),
        this._queryNotes(userId),
        this._queryProjects(userId),
        this._queryInterests(userId),
      ]);

      const strengths = this._identifyStrengths(grades);
      const weaknesses = this._identifyWeaknesses(grades);
      const learningStyle = this._determineLearningStyle(wellness, notes, projects);
      const habits = this._extractHabits(wellness);
      const socialGraph = follows.map((f) => ({
        id: f.id,
        name: f.following_name || f.name || 'Connection',
        type: f.relationship || 'friend',
      }));

      this._recordRequest(Date.now() - start);

      return {
        goals: goals.map((g) => ({ id: g.id, title: g.title || g.name, status: g.status, progress: g.progress || 0 })),
        habits,
        interests: interests.map((i) => typeof i === 'string' ? i : i.name || i),
        strengths,
        weaknesses,
        socialGraph,
        projects: projects.map((p) => ({ id: p.id, title: p.title, status: p.status })),
        learningStyle,
        nodeCount: goals.length + wellness.length + grades.length + follows.length + notes.length + projects.length,
        detail: `Your knowledge graph has ${goals.length} goals, ${strengths.length} strengths, ${weaknesses.length} areas for improvement, and ${follows.length} connections.`,
      };
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Knowledge graph build failed', { error: e.message });
      return { goals: [], strengths: [], weaknesses: [], learningStyle: 'unknown', nodeCount: 0 };
    }
  }

  async getStrengths({ userId, institutionId }) {
    try {
      const grades = await this._queryGrades(userId, institutionId);
      return this._identifyStrengths(grades);
    } catch (e) {
      logger.error('Strengths analysis failed', { error: e.message });
      return [];
    }
  }

  async getWeaknesses({ userId, institutionId }) {
    try {
      const grades = await this._queryGrades(userId, institutionId);
      return this._identifyWeaknesses(grades);
    } catch (e) {
      logger.error('Weaknesses analysis failed', { error: e.message });
      return [];
    }
  }

  async getLearningStyle({ userId }) {
    try {
      const [wellness, notes, projects] = await Promise.all([
        this._queryWellness(userId),
        this._queryNotes(userId),
        this._queryProjects(userId),
      ]);
      return this._determineLearningStyle(wellness, notes, projects);
    } catch (e) {
      logger.error('Learning style analysis failed', { error: e.message });
      return 'unknown';
    }
  }

  async addGoal({ userId, title, category }) {
    try {
      const goal = await base44.entities.StudentGoal.create({
        title, category: category || 'academic', status: 'active', progress: 0,
      });
      return { id: goal.id, status: 'created', detail: `Goal "${title}" added to your knowledge graph.` };
    } catch (e) {
      logger.error('Goal creation failed', { error: e.message });
      return { id: null, status: 'failed', detail: 'Could not add goal' };
    }
  }

  // ── Private analysis methods ──

  _identifyStrengths(grades) {
    const gradePoint = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
    const subjectGrades = {};
    grades.forEach((g) => {
      const subject = g.course_title || g.course_code;
      if (!subject) return;
      if (!subjectGrades[subject]) subjectGrades[subject] = [];
      subjectGrades[subject].push(gradePoint[g.grade?.toUpperCase()] || 0);
    });

    return Object.entries(subjectGrades)
      .map(([subject, points]) => ({
        subject, avgScore: points.reduce((a, b) => a + b, 0) / points.length,
      }))
      .filter((s) => s.avgScore >= 4)
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5)
      .map((s) => ({ subject: s.subject, level: 'strong', score: s.avgScore }));
  }

  _identifyWeaknesses(grades) {
    const gradePoint = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
    const subjectGrades = {};
    grades.forEach((g) => {
      const subject = g.course_title || g.course_code;
      if (!subject) return;
      if (!subjectGrades[subject]) subjectGrades[subject] = [];
      subjectGrades[subject].push(gradePoint[g.grade?.toUpperCase()] || 0);
    });

    return Object.entries(subjectGrades)
      .map(([subject, points]) => ({
        subject, avgScore: points.reduce((a, b) => a + b, 0) / points.length,
      }))
      .filter((s) => s.avgScore <= 2.5)
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 5)
      .map((s) => ({ subject: s.subject, level: 'needs_improvement', score: s.avgScore }));
  }

  _determineLearningStyle(wellness, notes, projects) {
    // Heuristic: if student has many visual notes (images, diagrams), prefer visual
    // If many text notes, prefer reading/writing
    // If many projects (hands-on), prefer kinesthetic
    // If wellness entries mention discussion, prefer auditory/social
    if (projects.length > notes.length && projects.length > 3) return 'kinesthetic';
    if (notes.length > 10) return 'reading_writing';
    const socialEntries = wellness.filter((w) => (w.mood || '').includes('social') || (w.notes || '').includes('discuss'));
    if (socialEntries.length > 2) return 'social';
    return 'visual';
  }

  _extractHabits(wellness) {
    const habits = [];
    const studyEntries = wellness.filter((w) => (w.activity || w.category || '').includes('study'));
    if (studyEntries.length > 3) habits.push({ name: 'regular studying', frequency: studyEntries.length });
    const exerciseEntries = wellness.filter((w) => (w.activity || w.category || '').includes('exercise'));
    if (exerciseEntries.length > 2) habits.push({ name: 'exercise', frequency: exerciseEntries.length });
    return habits;
  }

  // ── Entity queries ──
  async _queryGoals(userId) {
    try { return await base44.entities.StudentGoal.filter({ created_by_id: userId }, '-created_date', 20); }
    catch { return []; }
  }
  async _queryWellness(userId) {
    try { return await base44.entities.WellnessEntry.filter({ created_by_id: userId }, '-created_date', 30); }
    catch { return []; }
  }
  async _queryGrades(userId, institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.StudentGrade.filter(filter, '-created_date', 50);
    } catch { return []; }
  }
  async _queryFollows(userId) {
    try { return await base44.entities.Follow.filter({ follower_id: userId }, '-created_date', 30); }
    catch { return []; }
  }
  async _queryNotes(userId) {
    try { return await base44.entities.Note.filter({ created_by_id: userId }, '-created_date', 20); }
    catch { return []; }
  }
  async _queryProjects(userId) {
    try { return await base44.entities.Project.filter({ created_by_id: userId }, '-created_date', 10); }
    catch { return []; }
  }
  async _queryInterests(userId) {
    try {
      const records = await base44.entities.StudentRecord.filter({ created_by_id: userId }, '-created_date', 5);
      return records[0]?.interests || [];
    } catch { return []; }
  }
}

export const personalKnowledgeGraphService = new PersonalKnowledgeGraphService();
export default personalKnowledgeGraphService;