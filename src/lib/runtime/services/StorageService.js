/**
 * Storage Service — File Storage & Signed URLs
 *
 * Wraps UploadFile, UploadPrivateFile, and CreateFileSignedUrl. Agents and
 * experiences use this service — they never call storage integrations directly.
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { eventBus } from '../eventBus';

class StorageService {
  constructor() { this._ready = false; }

  async init() {
    this._ready = true;
    logger.info('StorageService initialized');
  }

  /** Upload a file to public storage. Returns { file_url }. */
  async upload(file) {
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      eventBus.publish({ type: 'storage.uploaded', category: 'storage', payload: { fileUrl: result?.file_url } });
      return result;
    } catch (e) {
      logger.error('Storage upload failed', { error: e.message });
      throw e;
    }
  }

  /** Upload a file to private storage. Returns { file_uri }. */
  async uploadPrivate(file) {
    try {
      const result = await base44.integrations.Core.UploadPrivateFile({ file });
      eventBus.publish({ type: 'storage.private_uploaded', category: 'storage', payload: { fileUri: result?.file_uri } });
      return result;
    } catch (e) {
      logger.error('Private storage upload failed', { error: e.message });
      throw e;
    }
  }

  /** Create a time-limited signed download URL for a private file. */
  async createSignedUrl(fileUri, expiresIn = 300) {
    try {
      return await base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: expiresIn });
    } catch (e) {
      logger.error('Signed URL creation failed', { error: e.message });
      throw e;
    }
  }

  get ready() { return this._ready; }
}

export const storageService = new StorageService();
export default storageService;