/**
 * Academic Planning Service — Degree Audit, Prerequisites & CGPA Projection
 *
 * Reasons about graduation requirements, prerequisite chains, CGPA
 * projections, course registration recommendations, and timetable
 * optimization. Powers questions like "If I fail CSC302, how does it
 * affect graduation?"
 *
 * Flow: Nexus → StudentIntelligenceLayer → AcademicPlanningService
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { BaseService } from './BaseService';

class AcademicPlanningService extends BaseService {
  constructor() {
    super({
      id: 'academicPlanning',
      version: '1.0.0',
      dependencies: ['identity'],
      capabilities: ['degree_audit', 'check_prerequisites', 'project_cgpa', 'recommend_courses', 'optimize_timetable'],
    });
  }

  async _onInit() { logger.info('AcademicPlanningService initialized'); }

  async _onHealth() {
    const available = !!base44.entities?.CourseCatalogEntry;
    return { healthy: available, detail: available ? 'CourseCatalogEntry available' : 'CourseCatalogEntry missing' };
  }

  async getDegreeAudit({ userId, institutionId }) {
    const start = Date.now();
    try {
      const [grades, catalog, studentRecord] = await Promise.all([
        this._queryGrades(userId, institutionId),
        this._queryCatalog(institutionId),
        this._queryStudentRecord(userId, institutionId),
      ]);

      const completedCourses = new Set(grades.map((g) => g.course_code?.toLowerCase()).filter(Boolean));
      const requiredCourses = catalog.filter((c) => !c.is_elective);
      const completed = requiredCourses.filter((c) => completedCourses.has(c.code?.toLowerCase()));
      const remaining = requiredCourses.filter((c) => !completedCourses.has(c.code?.toLowerCase()));
      const electiveGrades = grades.filter((g) => catalog.find((c) => c.code === g.course_code)?.is_elective);

      const totalRequired = requiredCourses.length;
      const completionRate = totalRequired > 0 ? Math.round((completed.length / totalRequired) * 100) : 0;

      // CGPA calculation
      const cgpa = this._calculateCGPA(grades);

      this._recordRequest(Date.now() - start);
      return {
        completionRate,
        completedCount: completed.length,
        remainingCount: remaining.length,
        totalRequired,
        cgpa,
        completedCourses: completed.map((c) => c.code),
        remainingCourses: remaining.map((c) => ({ code: c.code, title: c.title, credits: c.credits })),
        electiveCount: electiveGrades.length,
        totalCredits: grades.reduce((sum, g) => {
          const cat = catalog.find((c) => c.code === g.course_code);
          return sum + (cat?.credits || 0);
        }, 0),
      };
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Degree audit failed', { error: e.message });
      return { completionRate: 0, completedCount: 0, remainingCount: 0, cgpa: 0 };
    }
  }

  async checkPrerequisites({ courseCode, userId, institutionId }) {
    try {
      const catalog = await this._queryCatalog(institutionId);
      const course = catalog.find((c) => c.code?.toLowerCase() === courseCode?.toLowerCase());
      if (!course) return { met: false, missing: [], detail: 'Course not found' };

      const grades = await this._queryGrades(userId, institutionId);
      const completedCodes = new Set(grades.map((g) => g.course_code?.toLowerCase()).filter(Boolean));

      const prerequisites = course.prerequisites || [];
      const missing = prerequisites.filter((p) => !completedCodes.has(p.toLowerCase()));

      return {
        met: missing.length === 0,
        missing,
        prerequisites,
        detail: missing.length === 0 ? 'All prerequisites met' : `Missing: ${missing.join(', ')}`,
      };
    } catch (e) {
      logger.error('Prerequisite check failed', { error: e.message });
      return { met: false, missing: [], detail: 'Check failed' };
    }
  }

  async projectCGPA({ userId, institutionId, targetGrade }) {
    try {
      const grades = await this._queryGrades(userId, institutionId);
      const currentCGPA = this._calculateCGPA(grades);
      const totalCredits = grades.reduce((sum, g) => sum + (g.credit_units || 3), 0);

      // Project: if student gets targetGrade in next 5 courses (3 credits each)
      const gradeToPoint = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
      const targetPoint = gradeToPoint[targetGrade?.toUpperCase()] || 4;
      const projectedCredits = totalCredits + 15; // 5 courses * 3 credits
      const projectedPoints = (currentCGPA * totalCredits) + (targetPoint * 15);
      const projectedCGPA = projectedCredits > 0 ? projectedPoints / projectedCredits : 0;

      return {
        currentCGPA: currentCGPA.toFixed(2),
        projectedCGPA: projectedCGPA.toFixed(2),
        trend: projectedCGPA >= currentCGPA ? 'improving' : 'declining',
        detail: `If you score ${targetGrade || 'B'} in your next 5 courses, your CGPA would be ${projectedCGPA.toFixed(2)}`,
      };
    } catch (e) {
      logger.error('CGPA projection failed', { error: e.message });
      return { currentCGPA: 0, projectedCGPA: 0, detail: 'Projection failed' };
    }
  }

  async recommendCourses({ userId, institutionId }) {
    try {
      const [catalog, grades] = await Promise.all([
        this._queryCatalog(institutionId),
        this._queryGrades(userId, institutionId),
      ]);
      const completedCodes = new Set(grades.map((g) => g.course_code?.toLowerCase()).filter(Boolean));

      const eligible = catalog.filter((c) => {
        if (completedCodes.has(c.code?.toLowerCase())) return false;
        if (!c.is_active) return false;
        const prereqs = c.prerequisites || [];
        return prereqs.every((p) => completedCodes.has(p.toLowerCase()));
      });

      return eligible.slice(0, 10).map((c) => ({
        code: c.code, title: c.title, credits: c.credits,
        level: c.level, isElective: c.is_elective,
      }));
    } catch (e) {
      logger.error('Course recommendation failed', { error: e.message });
      return [];
    }
  }

  async analyzeImpact({ courseCode, outcome, userId, institutionId }) {
    try {
      const audit = await this.getDegreeAudit({ userId, institutionId });
      const prereqs = await this._queryCatalog(institutionId);
      const course = prereqs.find((c) => c.code?.toLowerCase() === courseCode?.toLowerCase());

      const dependentCourses = prereqs.filter((c) =>
        (c.prerequisites || []).some((p) => p.toLowerCase() === courseCode?.toLowerCase())
      );

      const impact = {
        course: courseCode,
        outcome,
        dependentCourses: dependentCourses.map((c) => c.code),
        detail: '',
      };

      if (outcome === 'fail') {
        impact.detail = `Failing ${courseCode} would block ${dependentCourses.length} course(s): ${dependentCourses.map((c) => c.code).join(', ') || 'none'}. `;
        if (course && !course.is_elective) {
          impact.detail += `You would need to retake ${courseCode} as it's a required course. `;
        }
        impact.detail += `Your projected graduation may be delayed by one semester.`;
      } else {
        impact.detail = `Passing ${courseCode} unlocks ${dependentCourses.length} course(s): ${dependentCourses.map((c) => c.code).join(', ') || 'none'}.`;
      }

      return impact;
    } catch (e) {
      logger.error('Impact analysis failed', { error: e.message });
      return { course: courseCode, outcome, detail: 'Analysis failed' };
    }
  }

  _calculateCGPA(grades) {
    if (!grades || grades.length === 0) return 0;
    const gradeToPoint = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
    let totalPoints = 0, totalCredits = 0;
    for (const g of grades) {
      const point = gradeToPoint[g.grade?.toUpperCase()] || 0;
      const credits = g.credit_units || 3;
      totalPoints += point * credits;
      totalCredits += credits;
    }
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  }

  async _queryGrades(userId, institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.StudentGrade.filter(filter, '-created_date', 50);
    } catch { return []; }
  }
  async _queryCatalog(institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.CourseCatalogEntry.filter(filter, '-created_date', 50);
    } catch { return []; }
  }
  async _queryStudentRecord(userId, institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.StudentRecord.filter(filter, '-created_date', 5);
    } catch { return []; }
  }
}

export const academicPlanningService = new AcademicPlanningService();
export default academicPlanningService;