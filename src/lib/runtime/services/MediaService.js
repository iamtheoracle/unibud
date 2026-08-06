/**
 * Media Service — Media Operations
 *
 * Wraps all media integrations. Agents and experiences use this service —
 * they never call UploadFile, GenerateImage, GenerateVideo, GenerateSpeech,
 * or TranscribeAudio directly.
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { eventBus } from '../eventBus';
import { BaseService } from './BaseService';

class MediaService extends BaseService {
  constructor() {
    super({
      id: 'media',
      version: '1.0.0',
      dependencies: [],
      capabilities: ['upload', 'generate_image', 'generate_video', 'generate_speech', 'transcribe', 'extract_data'],
    });
  }

  async _onInit() {
    logger.info('MediaService initialized');
  }

  async _onHealth() {
    const available = typeof base44.integrations?.Core?.UploadFile === 'function';
    return { healthy: available, detail: available ? 'Media integration available' : 'Media integration missing' };
  }

  async upload(file) {
    const start = Date.now();
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      this._recordRequest(Date.now() - start);
      eventBus.publish({ type: 'media.uploaded', category: 'media', payload: { fileUrl: result?.file_url } });
      return result;
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Media upload failed', { error: e.message });
      throw e;
    }
  }

  async generateImage(prompt, existingImageUrls) {
    const start = Date.now();
    try {
      const result = await base44.integrations.Core.GenerateImage({ prompt, existing_image_urls: existingImageUrls });
      this._recordRequest(Date.now() - start);
      eventBus.publish({ type: 'media.image_generated', category: 'media', payload: { url: result?.url } });
      return result;
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Image generation failed', { error: e.message });
      throw e;
    }
  }

  async generateVideo(prompt, options = {}) {
    const start = Date.now();
    try {
      const result = await base44.integrations.Core.GenerateVideo({
        prompt,
        aspect_ratio: options.aspectRatio || '16:9',
        duration: options.duration || 6,
      });
      this._recordRequest(Date.now() - start);
      eventBus.publish({ type: 'media.video_generated', category: 'media', payload: { url: result?.url } });
      return result;
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Video generation failed', { error: e.message });
      throw e;
    }
  }

  async generateSpeech(text, voice, languageCode) {
    const start = Date.now();
    try {
      const result = await base44.integrations.Core.GenerateSpeech({ text, voice, language_code: languageCode });
      this._recordRequest(Date.now() - start);
      eventBus.publish({ type: 'media.speech_generated', category: 'media', payload: { url: result?.url } });
      return result;
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Speech generation failed', { error: e.message });
      throw e;
    }
  }

  async transcribe(audioUrl) {
    const start = Date.now();
    try {
      const result = await base44.integrations.Core.TranscribeAudio({ audio_url: audioUrl });
      this._recordRequest(Date.now() - start);
      eventBus.publish({ type: 'media.transcribed', category: 'media', payload: { audioUrl } });
      return result;
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Transcription failed', { error: e.message });
      throw e;
    }
  }

  async extractData(fileUrl, jsonSchema) {
    const start = Date.now();
    try {
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: fileUrl,
        json_schema: jsonSchema,
      });
      this._recordRequest(Date.now() - start);
      return result;
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Data extraction failed', { error: e.message });
      throw e;
    }
  }
}

export const mediaService = new MediaService();
export default mediaService;