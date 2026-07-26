/**
 * Media Service — AI image/video/speech generation and audio transcription,
 * shared across My Realm apps.
 */
export function mediaService(base44) {
  return {
    generateImage: (prompt, existing_image_urls) =>
      base44.integrations.Core.GenerateImage({ prompt, existing_image_urls }),
    generateVideo: (opts) => base44.integrations.Core.GenerateVideo(opts),
    generateSpeech: (opts) => base44.integrations.Core.GenerateSpeech(opts),
    transcribe: (audio_url) => base44.integrations.Core.TranscribeAudio({ audio_url }),
  };
}