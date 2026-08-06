/**
 * Classmate Discovery Service — Find Students by Course & Department
 *
 * Finds classmates enrolled in the same course, department, or level.
 * Uses the social graph to identify connected students and surfaces
 * those with matching academic profiles.
 *
 * Flow: Nexus → CampusIntelligenceEngine → ClassmateDiscoveryService
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { BaseService } from './BaseService';

class ClassmateDiscoveryService extends BaseService {
  constructor() {
    super({
      id: 'classmateDiscovery',
      version: '1.0.0',
      dependencies: ['identity'],
      capabilities: ['find_classmates', 'find_project_partner'],
    });
  }

  async _onInit() {
    logger.info('ClassmateDiscoveryService initialized');
  }

  async _onHealth() {
    const available = !!base44.entities?.StudentRecord;
    return { healthy: available, detail: available ? 'StudentRecord available' : 'StudentRecord missing' };
  }

  /**
   * Find classmates matching the given criteria.
   * @param {{ courseCode?, department?, level?, institutionId?, userId? }} criteria
   * @returns {Promise<Array>} Classmate candidates with match info
   */
  async findClassmates({ courseCode, department, level, institutionId, userId }) {
    const start = Date.now();
    try {
      // Query StudentRecord for students in the same course/department
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      const students = await base44.entities.StudentRecord.filter(filter, '-created_date', 30);

      // Also check social connections for relationship scoring
      let following = [];
      try {
        const followRecords = await base44.entities.Follow.filter(
          userId ? { follower_id: userId } : {},
          '-created_date',
          50
        );
        following = followRecords.map((f) => f.following_id || f.followed_id).filter(Boolean);
      } catch { /* Follow entity might not exist */ }

      const candidates = students
        .filter((s) => s.created_by_id !== userId) // exclude self
        .map((s) => this._scoreClassmate(s, { courseCode, department, level, following }))
        .filter((s) => s.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10);

      this._recordRequest(Date.now() - start);
      return candidates;
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Classmate discovery failed', { error: e.message });
      return [];
    }
  }

  _scoreClassmate(student, { courseCode, department, level, following }) {
    let matchScore = 0;

    // Course match
    const studentCourses = student.courses || [];
    if (courseCode && studentCourses.some((c) => c?.toLowerCase().includes(courseCode.toLowerCase()))) {
      matchScore += 50;
    }

    // Department match
    if (department && student.department?.toLowerCase().includes(department.toLowerCase())) {
      matchScore += 25;
    }

    // Level match
    if (level && student.level === level) {
      matchScore += 15;
    }

    // Social connection bonus
    const isFollowing = following.includes(student.created_by_id || student.user_id);
    if (isFollowing) matchScore += 10;

    return {
      id: student.id,
      name: student.full_name || student.name || 'Classmate',
      type: 'classmate',
      department: student.department,
      level: student.level,
      courses: studentCourses,
      isFollowing,
      matchScore,
    };
  }
}

export const classmateDiscoveryService = new ClassmateDiscoveryService();
export default classmateDiscoveryService;