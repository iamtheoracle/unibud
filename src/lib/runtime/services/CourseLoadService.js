/**
 * Course Load Service — Academic Workload Analysis
 *
 * Calculates a student's current academic workload from enrolled courses,
 * pending assignments, upcoming exams, and weekly timetable hours.
 * Used by the Student Routing Engine to avoid recommending additional
 * study groups when the student is already overloaded.
 *
 * Flow: Oracle → Nexus → StudentRoutingService → CourseLoadService
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { BaseService } from './BaseService';

const WORKLOAD_THRESHOLDS = {
  light: 3,      // < 3 active items
  moderate: 6,   // 3-5
  heavy: 9,      // 6-8
  // 9+ = overloaded
};

class CourseLoadService extends BaseService {
  constructor() {
    super({
      id: 'courseLoad',
      version: '1.0.0',
      dependencies: ['identity'],
      capabilities: ['calculate_workload'],
    });
  }

  async _onInit() {
    logger.info('CourseLoadService initialized');
  }

  async _onHealth() {
    const available = !!base44.entities?.Course;
    return { healthy: available, detail: available ? 'Course entity available' : 'Course entity missing' };
  }

  /**
   * Calculate the student's current academic workload.
   * @param {string} userId
   * @param {string} institutionId
   * @returns {Promise<{ totalCourses, pendingAssignments, upcomingExams, weeklyHours, workloadLevel, workloadScore, items }>}
   */
  async calculateWorkload(userId, institutionId) {
    const start = Date.now();
    try {
      const now = new Date();
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

      // Query in parallel: courses, assignments, exams, timetable
      const [courses, assignments, exams, timetable] = await Promise.all([
        this._queryCourses(userId, institutionId),
        this._queryAssignments(userId, institutionId, sevenDaysLater),
        this._queryExams(institutionId, fourteenDaysLater),
        this._queryTimetable(userId, institutionId),
      ]);

      const pendingAssignments = assignments.length;
      const upcomingExams = exams.length;
      const totalCourses = courses.length;
      const weeklyHours = timetable.length;

      // Active items = assignments due soon + upcoming exams
      const activeItems = pendingAssignments + upcomingExams;
      const workloadScore = Math.min(100, activeItems * 12 + Math.max(0, totalCourses - 3) * 5);

      let workloadLevel;
      if (activeItems < WORKLOAD_THRESHOLDS.light) workloadLevel = 'light';
      else if (activeItems < WORKLOAD_THRESHOLDS.moderate) workloadLevel = 'moderate';
      else if (activeItems < WORKLOAD_THRESHOLDS.heavy) workloadLevel = 'heavy';
      else workloadLevel = 'overloaded';

      const result = {
        totalCourses,
        pendingAssignments,
        upcomingExams,
        weeklyHours,
        workloadLevel,
        workloadScore,
        items: { assignments, exams },
      };

      this._recordRequest(Date.now() - start);
      return result;
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('CourseLoad calculation failed', { error: e.message });
      return { totalCourses: 0, pendingAssignments: 0, upcomingExams: 0, weeklyHours: 0, workloadLevel: 'light', workloadScore: 0, items: {} };
    }
  }

  async _queryCourses(userId, institutionId) {
    try {
      const filter = {};
      if (userId) filter.created_by_id = userId;
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.Course.filter(filter, '-created_date', 20);
    } catch { return []; }
  }

  async _queryAssignments(userId, institutionId, dueBefore) {
    try {
      const filter = { status: 'pending' };
      if (institutionId) filter.institution_id = institutionId;
      const all = await base44.entities.Assignment.filter(filter, '-due_date', 30);
      // Filter to assignments due within 7 days
      return all.filter((a) => {
        if (!a.due_date) return false;
        const due = new Date(a.due_date);
        return due <= dueBefore && due >= new Date();
      });
    } catch { return []; }
  }

  async _queryExams(institutionId, beforeDate) {
    try {
      const filter = { status: 'scheduled' };
      if (institutionId) filter.institution_id = institutionId;
      const all = await base44.entities.ExamSchedule.filter(filter, '-date', 20);
      return all.filter((e) => e.date && new Date(e.date) <= beforeDate);
    } catch { return []; }
  }

  async _queryTimetable(userId, institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.TimetableEntry.filter(filter, '-created_date', 30);
    } catch { return []; }
  }
}

export const courseLoadService = new CourseLoadService();
export default courseLoadService;