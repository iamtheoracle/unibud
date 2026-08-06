/**
 * Student Success Prediction Service — Risk, Burnout & Performance Analysis
 *
 * Predicts academic risk before it occurs: risk of failing, burnout,
 * attendance problems, declining performance, and workload overload.
 * Uses attendance records, grades, wellness entries, and study sessions
 * to identify early warning signs.
 *
 * Flow: Nexus → StudentIntelligenceLayer → StudentSuccessPredictionService
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { BaseService } from './BaseService';

class StudentSuccessPredictionService extends BaseService {
  constructor() {
    super({
      id: 'studentSuccessPrediction',
      version: '1.0.0',
      dependencies: ['identity', 'courseLoad'],
      capabilities: ['predict_risk', 'predict_burnout', 'analyze_attendance', 'analyze_performance'],
    });
  }

  async _onInit() { logger.info('StudentSuccessPredictionService initialized'); }

  async _onHealth() {
    const available = !!base44.entities?.AttendanceRecord || !!base44.entities?.StudentGrade;
    return { healthy: available, detail: available ? 'Prediction entities available' : 'Prediction entities missing' };
  }

  async predictRisk({ userId, institutionId }) {
    const start = Date.now();
    try {
      const [grades, attendance, workload] = await Promise.all([
        this._queryGrades(userId, institutionId),
        this._queryAttendance(userId, institutionId),
        this._getWorkload(userId, institutionId),
      ]);

      let riskScore = 0;
      const riskFactors = [];

      // Grade-based risk
      const failCount = grades.filter((g) => g.grade?.toUpperCase() === 'F').length;
      if (failCount > 0) {
        riskScore += failCount * 20;
        riskFactors.push(`${failCount} failed course(s)`);
      }

      const lowGrades = grades.filter((g) => ['D', 'E', 'F'].includes(g.grade?.toUpperCase()));
      if (lowGrades.length >= 2) {
        riskScore += 15;
        riskFactors.push('multiple low grades (D or below)');
      }

      // Attendance-based risk
      const absentCount = attendance.filter((a) => a.status === 'absent').length;
      const totalAttendance = attendance.length;
      if (totalAttendance > 0) {
        const absentRate = absentCount / totalAttendance;
        if (absentRate > 0.3) {
          riskScore += 20;
          riskFactors.push(`high absenteeism (${Math.round(absentRate * 100)}%)`);
        }
      }

      // Workload-based risk
      if (workload.workloadLevel === 'overloaded') {
        riskScore += 15;
        riskFactors.push('overloaded workload');
      }

      const level = riskScore >= 60 ? 'high' : riskScore >= 30 ? 'moderate' : 'low';

      this._recordRequest(Date.now() - start);
      return {
        riskScore: Math.min(100, riskScore),
        riskLevel: level,
        riskFactors,
        detail: riskFactors.length > 0
          ? `Risk level: ${level}. Contributing factors: ${riskFactors.join(', ')}.`
          : 'No significant risk factors detected. You are on track.',
      };
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Risk prediction failed', { error: e.message });
      return { riskScore: 0, riskLevel: 'unknown', riskFactors: [] };
    }
  }

  async predictBurnout({ userId, institutionId }) {
    try {
      const [wellness, workload, studySessions] = await Promise.all([
        this._queryWellness(userId),
        this._getWorkload(userId, institutionId),
        this._queryStudySessions(userId, institutionId),
      ]);

      let burnoutScore = 0;
      const factors = [];

      // Wellness indicators
      const recentWellness = wellness.slice(0, 7);
      const lowMoodCount = recentWellness.filter((w) => w.mood === 'low' || w.mood === 'stressed').length;
      if (lowMoodCount >= 3) {
        burnoutScore += 25;
        factors.push('low mood reported frequently');
      }

      // Workload pressure
      if (workload.workloadLevel === 'overloaded') {
        burnoutScore += 30;
        factors.push('overloaded workload');
      } else if (workload.workloadLevel === 'heavy') {
        burnoutScore += 15;
        factors.push('heavy workload');
      }

      // Study session frequency (too much or too little)
      const recentSessions = studySessions.filter((s) => {
        if (!s.created_date) return false;
        const daysAgo = (Date.now() - new Date(s.created_date).getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo <= 7;
      });
      if (recentSessions.length >= 10) {
        burnoutScore += 20;
        factors.push('excessive study sessions without breaks');
      } else if (recentSessions.length === 0) {
        burnoutScore += 10;
        factors.push('no study sessions recorded recently');
      }

      const level = burnoutScore >= 50 ? 'high' : burnoutScore >= 25 ? 'moderate' : 'low';

      return {
        burnoutScore: Math.min(100, burnoutScore),
        burnoutLevel: level,
        factors,
        detail: level === 'high'
          ? `Burnout risk is high. Consider: taking a break, reducing commitments, talking to a counselor. Factors: ${factors.join(', ')}.`
          : level === 'moderate'
            ? `Some burnout indicators detected: ${factors.join(', ')}. Consider lighter study days.`
            : 'Burnout risk is low. Keep maintaining balance.',
      };
    } catch (e) {
      logger.error('Burnout prediction failed', { error: e.message });
      return { burnoutScore: 0, burnoutLevel: 'unknown', factors: [] };
    }
  }

  async analyzePerformance({ userId, institutionId }) {
    try {
      const grades = await this._queryGrades(userId, institutionId);

      // Sort by date and check for declining trend
      const sorted = [...grades].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      const gradePoint = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };

      const points = sorted.map((g) => gradePoint[g.grade?.toUpperCase()] || 0);
      let trend = 'stable';
      if (points.length >= 4) {
        const firstHalf = points.slice(0, Math.floor(points.length / 2));
        const secondHalf = points.slice(Math.floor(points.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        if (secondAvg < firstAvg - 0.5) trend = 'declining';
        else if (secondAvg > firstAvg + 0.5) trend = 'improving';
      }

      const currentCGPA = points.length > 0 ? points.reduce((a, b) => a + b, 0) / points.length : 0;

      return {
        trend,
        currentCGPA: currentCGPA.toFixed(2),
        totalCourses: grades.length,
        detail: trend === 'declining'
          ? 'Your performance is declining compared to earlier courses. Consider seeking academic support.'
          : trend === 'improving'
            ? 'Your performance is improving. Keep up the good work!'
            : 'Your performance is stable.',
      };
    } catch (e) {
      logger.error('Performance analysis failed', { error: e.message });
      return { trend: 'unknown', currentCGPA: 0 };
    }
  }

  async _getWorkload(userId, institutionId) {
    try {
      const { courseLoadService } = await import('./CourseLoadService');
      return await courseLoadService.calculateWorkload(userId, institutionId);
    } catch { return { workloadLevel: 'light', workloadScore: 0 }; }
  }

  async _queryGrades(userId, institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.StudentGrade.filter(filter, '-created_date', 50);
    } catch { return []; }
  }
  async _queryAttendance(userId, institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.AttendanceRecord.filter(filter, '-created_date', 30);
    } catch { return []; }
  }
  async _queryWellness(userId) {
    try { return await base44.entities.WellnessEntry.filter({ created_by_id: userId }, '-created_date', 14); }
    catch { return []; }
  }
  async _queryStudySessions(userId, institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.StudySession.filter(filter, '-created_date', 20);
    } catch { return []; }
  }
}

export const studentSuccessPredictionService = new StudentSuccessPredictionService();
export default studentSuccessPredictionService;