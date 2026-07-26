/**
 * Storage Service — shared storage for images, documents, assignments,
 * music, videos, and attachments across every My Realm application.
 */
export function storageService(base44) {
  return {
    upload: (file) => base44.integrations.Core.UploadFile({ file }),
    uploadPrivate: (file) => base44.integrations.Core.UploadPrivateFile({ file }),
    signedUrl: (file_uri, expires_in) =>
      base44.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in }),
  };
}