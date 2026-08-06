/**
 * Resource Recommendation Service — Academic Materials Discovery
 *
 * Recommends academic resources: lecture notes, past questions,
 * textbooks, study guides, course materials, and exam papers.
 * Searches across multiple resource entities to find the best
 * materials for a student's topic or course.
 *
 * Flow: Nexus → CampusIntelligenceEngine → ResourceRecommendationService
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { BaseService } from './BaseService';

class ResourceRecommendationService extends BaseService {
  constructor() {
    super({
      id: 'resourceRecommendation',
      version: '1.0.0',
      dependencies: ['identity'],
      capabilities: ['find_resources', 'recommend_materials'],
    });
  }

  async _onInit() {
    logger.info('ResourceRecommendationService initialized');
  }

  async _onHealth() {
    const available = !!base44.entities?.LibraryResource;
    return { healthy: available, detail: available ? 'LibraryResource available' : 'LibraryResource missing' };
  }

  /**
   * Find academic resources matching the given criteria.
   * @param {{ subject?, courseCode?, topic?, resourceType?, institutionId? }} criteria
   * @returns {Promise<Array>} Resource candidates
   */
  async findResources({ subject, courseCode, topic, resourceType, institutionId }) {
    const start = Date.now();
    try {
      // Search across multiple resource entities in parallel
      const [libraryResources, academicFiles, groupResources, courseMaterials, examPapers] = await Promise.all([
        this._queryLibrary(institutionId),
        this._queryAcademicFiles(courseCode, institutionId),
        this._queryGroupResources(subject, courseCode, institutionId),
        this._queryCourseMaterials(courseCode, institutionId),
        this._queryExamPapers(courseCode, institutionId),
      ]);

      // Score and merge all resources
      const allCandidates = [
        ...libraryResources.map((r) => this._scoreLibrary(r, { subject, courseCode, topic })),
        ...academicFiles.map((r) => this._scoreAcademicFile(r, { subject, courseCode, topic })),
        ...groupResources.map((r) => this._scoreGroupResource(r, { subject, courseCode, topic })),
        ...courseMaterials.map((r) => this._scoreCourseMaterial(r, { subject, courseCode, topic })),
        ...examPapers.map((r) => this._scoreExamPaper(r, { subject, courseCode, topic })),
      ]
        .filter((r) => r.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10);

      this._recordRequest(Date.now() - start);
      return allCandidates;
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Resource recommendation failed', { error: e.message });
      return [];
    }
  }

  async _queryLibrary(institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.LibraryResource.filter(filter, '-created_date', 15);
    } catch { return []; }
  }

  async _queryAcademicFiles(courseCode, institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      if (courseCode) filter.course_code = courseCode;
      return await base44.entities.AcademicFile.filter(filter, '-created_date', 15);
    } catch { return []; }
  }

  async _queryGroupResources(subject, courseCode, institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      if (courseCode) filter.course_code = courseCode;
      return await base44.entities.StudyGroupResource.filter(filter, '-created_date', 15);
    } catch { return []; }
  }

  async _queryCourseMaterials(courseCode, institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      if (courseCode) filter.course_code = courseCode;
      return await base44.entities.CourseMaterial.filter(filter, '-created_date', 15);
    } catch { return []; }
  }

  async _queryExamPapers(courseCode, institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      if (courseCode) filter.course_code = courseCode;
      return await base44.entities.ExamPaper.filter(filter, '-created_date', 10);
    } catch { return []; }
  }

  _scoreLibrary(resource, { subject, courseCode, topic }) {
    let score = 0;
    const title = (resource.title || '').toLowerCase();
    const tags = (resource.tags || []).join(' ').toLowerCase();
    if (subject && (title.includes(subject.toLowerCase()) || tags.includes(subject.toLowerCase()))) score += 50;
    if (courseCode && title.includes(courseCode.toLowerCase())) score += 30;
    if (topic && title.includes(topic.toLowerCase())) score += 20;
    return {
      id: resource.id, name: resource.title || 'Library Resource', type: 'resource',
      resourceType: resource.type || 'library', subject: resource.subject,
      courseCode: resource.course_code, url: resource.url || resource.file_url,
      description: resource.description, matchScore: score,
    };
  }

  _scoreAcademicFile(file, { subject, courseCode, topic }) {
    let score = 0;
    const title = (file.title || '').toLowerCase();
    if (courseCode && file.course_code?.toLowerCase().includes(courseCode.toLowerCase())) score += 50;
    if (subject && title.includes(subject.toLowerCase())) score += 30;
    if (topic && title.includes(topic.toLowerCase())) score += 20;
    return {
      id: file.id, name: file.title || 'Academic File', type: 'resource',
      resourceType: 'file', courseCode: file.course_code, url: file.file_url,
      description: file.description, matchScore: score,
    };
  }

  _scoreGroupResource(resource, { subject, courseCode, topic }) {
    let score = 0;
    const title = (resource.title || '').toLowerCase();
    if (courseCode && resource.course_code?.toLowerCase().includes(courseCode.toLowerCase())) score += 40;
    if (subject && title.includes(subject.toLowerCase())) score += 30;
    if (topic && title.includes(topic.toLowerCase())) score += 20;
    return {
      id: resource.id, name: resource.title || 'Shared Resource', type: 'resource',
      resourceType: resource.file_type || 'shared', courseCode: resource.course_code,
      url: resource.file_url || resource.external_url, description: resource.description,
      matchScore: score,
    };
  }

  _scoreCourseMaterial(material, { subject, courseCode, topic }) {
    let score = 0;
    const title = (material.title || '').toLowerCase();
    if (courseCode && material.course_code?.toLowerCase().includes(courseCode.toLowerCase())) score += 50;
    if (subject && title.includes(subject.toLowerCase())) score += 30;
    if (topic && title.includes(topic.toLowerCase())) score += 20;
    return {
      id: material.id, name: material.title || 'Course Material', type: 'resource',
      resourceType: material.type || 'material', courseCode: material.course_code,
      url: material.file_url, description: material.description, matchScore: score,
    };
  }

  _scoreExamPaper(paper, { subject, courseCode, topic }) {
    let score = 0;
    if (courseCode && paper.course_code?.toLowerCase().includes(courseCode.toLowerCase())) score += 60;
    if (subject && (paper.title || '').toLowerCase().includes(subject.toLowerCase())) score += 20;
    return {
      id: paper.id, name: paper.title || 'Past Exam Paper', type: 'resource',
      resourceType: 'exam_paper', courseCode: paper.course_code,
      url: paper.file_url, description: paper.description, matchScore: score,
    };
  }
}

export const resourceRecommendationService = new ResourceRecommendationService();
export default resourceRecommendationService;