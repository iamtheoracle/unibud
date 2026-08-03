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

class MediaService {
  constructor() { this._ready = false; }

  async init() {
    this._ready = true;
    logger.info('MediaService initialized');
  }

  /** Upload a file and return its public URL. */
  async upload(file) {
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      eventBus.publish({ type: 'media.uploaded', category: 'media', payload: { fileUrl: result?.file_url } });
      return result;
    } catch (e) {
      logger.error('Media upload failed', { error: e.message });
      throw e;
    }
  }

  /** Generate an image from a prompt. */
  async generateImage(prompt, existingImageUrls) {
    try {
      const result = await base44.integrations.Core.GenerateImage({ prompt, existing_image_urls: existingImageUrls });
      eventBus.publish({ type: 'media.image_generated', category: 'media', payload: { url: result?.url } });
      return result;
    } catch (e) {
      logger.error('Image generation failed', { error: e.message });
      throw e;
    }
  }

  /** Generate a video from a prompt. */
  async generateVideo(prompt, options = {}) {
    try {
      const result = await base44.integrations.Core.GenerateVideo({
        prompt,
        aspect_ratio: options.aspectRatio || '16:9',
        duration: options.duration || 6,
      });
      eventBus.publish({ type: 'media.video_generated', category: 'media', payload: { url: result?.url } });
      return result;
    } catch (e) {
      logger.error('Video generation failed', { error: e.message });
      throw e;
    }
  }

  /** Generate speech audio from text. */
  async generateSpeech(text, voice, languageCode) {
    try {
      const result = await base44.integrations.Core.GenerateSpeech({ text, voice, language_code: languageCode });
      eventBus.publish({ type: 'media.speech_generated', category: 'media', payload: { url: result?.url } });
      return result;
    } catch (e) {
      logger.error('Speech generation failed', { error: e.message });
      throw e;
    }
  }

  /** Transcribe an audio file to text. */
  async transcribe(audioUrl) {
    try {
      const result = await base44.integrations.Core.TranscribeAudio({ audio_url: audioUrl });
      eventBus.publish({ type: 'media.transcribed', category: 'media', payload: { audioUrl } });
      return result;
    } catch (e) {
      logger.error('Transcription failed', { error: e.message });
      throw e;
    }
  }

  /** Extract structured data from an uploaded file. */
  async extractData(fileUrl, jsonSchema) {
    try {
      return await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: fileUrl,
        json_schema: jsonSchema,
      });
    } catch (e) {
      logger.error('Data extraction failed', { error: e.message });
      throw e;
    }
  }

  get ready() { return this._ready; }
}

export const mediaService = new MediaService();
export default mediaService;