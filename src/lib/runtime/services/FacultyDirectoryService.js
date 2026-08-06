/**
 * Faculty Directory Service — Find Lecturers & Staff
 *
 * Finds faculty members by subject, course, or department. Returns
 * lecturers with their courses, office hours, and contact information.
 *
 * Flow: Nexus → CampusIntelligenceEngine → FacultyDirectoryService
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { BaseService } from './BaseService';

class FacultyDirectoryService extends BaseService {
  constructor() {
    super({
      id: 'facultyDirectory',
      version: '1.0.0',
      dependencies: ['identity'],
      capabilities: ['find_faculty', 'find_lecturer'],
    });
  }

  async _onInit() {
    logger.info('FacultyDirectoryService initialized');
  }

  async _onHealth() {
    const available = !!base44.entities?.Staff;
    return { healthy: available, detail: available ? 'Staff entity available' : 'Staff entity missing' };
  }

  /**
   * Find faculty members matching the given criteria.
   * @param {{ subject?, courseCode?, department?, institutionId? }} criteria
   * @returns {Promise<Array>} Faculty candidates with courses and office hours
   */
  async findFaculty({ subject, courseCode, department, institutionId }) {
    const start = Date.now();
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      const staff = await base44.entities.Staff.filter(filter, '-created_date', 20);

      // Also check CourseCatalogEntry for lecturer info
      let catalogEntries = [];
      try {
        catalogEntries = await base44.entities.CourseCatalogEntry.filter(filter, '-created_date', 20);
      } catch { /* CourseCatalogEntry might not exist */ }

      const candidates = staff
        .map((s) => this._scoreStaff(s, { subject, courseCode, department }))
        .filter((s) => s.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);

      // Enrich with office hours
      const enriched = await Promise.all(
        candidates.slice(0, 10).map(async (s) => {
          const officeHours = await this._getOfficeHours(s.id, institutionId);
          return { ...s, officeHours };
        })
      );

      this._recordRequest(Date.now() - start);
      return enriched;
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Faculty directory search failed', { error: e.message });
      return [];
    }
  }

  _scoreStaff(staff, { subject, courseCode, department }) {
    let matchScore = 0;
    const staffSubject = (staff.subject || staff.specialization || '').toLowerCase();
    const staffDept = (staff.department || '').toLowerCase();
    const staffCourses = (staff.courses || []).join(' ').toLowerCase();

    if (subject && (staffSubject.includes(subject.toLowerCase()) || staffCourses.includes(subject.toLowerCase()))) {
      matchScore += 50;
    }

    if (courseCode && staffCourses.includes(courseCode.toLowerCase())) {
      matchScore += 40;
    }

    if (department && staffDept.includes(department.toLowerCase())) {
      matchScore += 20;
    }

    return {
      id: staff.id,
      name: staff.full_name || staff.name || 'Faculty Member',
      type: 'faculty',
      title: staff.title || staff.role,
      department: staff.department,
      courses: staff.courses || [],
      contactEmail: staff.contact_email || staff.email,
      contactPhone: staff.contact_phone || staff.phone,
      image: staff.image || staff.profile_image,
      matchScore,
    };
  }

  async _getOfficeHours(staffId, institutionId) {
    try {
      const filter = { staff_id: staffId };
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.OfficeHoursSlot.filter(filter, '-created_date', 10);
    } catch {
      return [];
    }
  }
}

export const facultyDirectoryService = new FacultyDirectoryService();
export default facultyDirectoryService;