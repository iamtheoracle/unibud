/**
 * Mentorship Service — Mentor Discovery & Matching
 *
 * Finds mentors with matching expertise, availability, and ratings.
 * Used by the Student Routing Engine to recommend individual mentoring
 * sessions when group study isn't the right fit.
 *
 * Flow: Oracle → Nexus → StudentRoutingService → MentorshipService
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { BaseService } from './BaseService';

class MentorshipService extends BaseService {
  constructor() {
    super({
      id: 'mentorship',
      version: '1.0.0',
      dependencies: ['identity'],
      capabilities: ['find_mentors', 'get_mentor_rating'],
    });
  }

  async _onInit() {
    logger.info('MentorshipService initialized');
  }

  async _onHealth() {
    const available = !!base44.entities?.Mentor;
    return { healthy: available, detail: available ? 'Mentor entity available' : 'Mentor entity missing' };
  }

  /**
   * Find mentors matching the given criteria.
   * @param {{ subject?, courseCode?, department?, institutionId? }} criteria
   * @returns {Promise<Array>} Mentor candidates with expertise, rating, availability
   */
  async findMentors({ subject, courseCode, department, institutionId }) {
    const start = Date.now();
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;

      const mentors = await base44.entities.Mentor.filter(filter, '-rating', 20);

      // Also check TutorProfile for additional candidates
      let tutors = [];
      try {
        tutors = await base44.entities.TutorProfile.filter(filter, '-rating', 20);
      } catch { /* TutorProfile might not exist */ }

      // Score and filter mentors by match
      const candidates = mentors
        .map((m) => this._scoreMentor(m, { subject, courseCode, department }))
        .filter((m) => m.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);

      // Score and filter tutors
      const tutorCandidates = tutors
        .map((t) => this._scoreTutor(t, { subject, courseCode, department }))
        .filter((t) => t.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);

      const results = [...candidates, ...tutorCandidates].slice(0, 10);

      this._recordRequest(Date.now() - start);
      return results;
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Mentor search failed', { error: e.message });
      return [];
    }
  }

  _scoreMentor(mentor, { subject, courseCode, department }) {
    let matchScore = 0;
    const subjects = mentor.subjects || [];
    const expertise = mentor.expertise || [];

    if (subject) {
      const subjectLower = subject.toLowerCase();
      if (subjects.some((s) => s?.toLowerCase().includes(subjectLower))) matchScore += 50;
      if (expertise.some((e) => e?.toLowerCase().includes(subjectLower))) matchScore += 20;
    }

    if (courseCode) {
      if (subjects.some((s) => s?.toLowerCase().includes(courseCode.toLowerCase()))) matchScore += 30;
    }

    if (department && mentor.department?.toLowerCase().includes(department.toLowerCase())) {
      matchScore += 15;
    }

    return {
      id: mentor.id,
      name: mentor.name || 'Mentor',
      type: 'mentor',
      image: mentor.image,
      subjects,
      expertise,
      department: mentor.department,
      rating: mentor.rating || 0,
      reviewsCount: mentor.reviews_count || 0,
      availability: mentor.availability || [],
      matchScore,
    };
  }

  _scoreTutor(tutor, { subject, courseCode, department }) {
    let matchScore = 0;
    const subjects = tutor.subjects || [];
    const courseCodes = tutor.course_codes || [];

    if (subject) {
      const subjectLower = subject.toLowerCase();
      if (subjects.some((s) => s?.toLowerCase().includes(subjectLower))) matchScore += 50;
    }

    if (courseCode) {
      const codeLower = courseCode.toLowerCase();
      if (courseCodes.some((c) => c?.toLowerCase().includes(codeLower))) matchScore += 40;
    }

    if (department && tutor.department?.toLowerCase().includes(department.toLowerCase())) {
      matchScore += 15;
    }

    return {
      id: tutor.id,
      name: tutor.tutor_name || 'Tutor',
      type: 'tutor',
      image: tutor.tutor_image,
      subjects,
      courseCodes,
      department: tutor.department,
      rating: tutor.rating || 0,
      reviewsCount: tutor.reviews_count || 0,
      hourlyRate: tutor.hourly_rate || 0,
      isFree: tutor.is_free || false,
      availability: tutor.availability || [],
      matchScore,
    };
  }
}

export const mentorshipService = new MentorshipService();
export default mentorshipService;