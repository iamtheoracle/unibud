/**
 * Storage Service — File Storage & Signed URLs
 *
 * Wraps UploadFile, UploadPrivateFile, and CreateFileSignedUrl. Agents and
 * experiences use this service — they never call storage integrations directly.
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { eventBus } from '../eventBus';
import { BaseService } from './BaseService';

class StorageService extends BaseService {
  constructor() {
    super({
      id: 'storage',
      version: '1.0.0',
      dependencies: [],
      capabilities: ['upload', 'upload_private', 'create_signed_url'],
    });
  }

  async _onInit() {
    logger.info('StorageService initialized');
  }

  async _onHealth() {
    const available = typeof base44.integrations?.Core?.UploadFile === 'function';
    return { healthy: available, detail: available ? 'Storage integration available' : 'Storage integration missing' };
  }

  /** Upload a file to public storage. Returns { file_url }. */
  async upload(file) {
    const start = Date.now();
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      this._recordRequest(Date.now() - start);
      eventBus.publish({ type: 'storage.uploaded', category: 'storage', payload: { fileUrl: result?.file_url } });
      return result;
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Storage upload failed', { error: e.message });
      throw e;
    }
  }

  /** Upload a file to private storage. Returns { file_uri }. */
  async uploadPrivate(file) {
    const start = Date.now();
    try {
      const result = await base44.integrations.Core.UploadPrivateFile({ file });
      this._recordRequest(Date.now() - start);
      eventBus.publish({ type: 'storage.private_uploaded', category: 'storage', payload: { fileUri: result?.file_uri } });
      return result;
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Private storage upload failed', { error: e.message });
      throw e;
    }
  }

  /** Create a time-limited signed download URL for a private file. */
  async createSignedUrl(fileUri, expiresIn = 300) {
    const start = Date.now();
    try {
      const result = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: expiresIn });
      this._recordRequest(Date.now() - start);
      return result;
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Signed URL creation failed', { error: e.message });
      throw e;
    }
  }
}

export const storageService = new StorageService();
export default storageService;