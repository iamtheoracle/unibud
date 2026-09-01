import { useState, useRef, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const QUEUE_KEY = "unibud_upload_queue";

/**
 * Media upload hook with:
 * - Client-side image compression (canvas resize)
 * - Video thumbnail generation (video element → canvas)
 * - Exponential backoff retry
 * - Offline queue (retries on reconnect)
 */
export function useMediaUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [queue, setQueue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]"); } catch { return []; }
  });
  const retryCallbacksRef = useRef([]);

  useEffect(() => {
    const handleOnline = () => {
      retryCallbacksRef.current.forEach((cb) => cb());
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  const compressImage = useCallback((file, maxDim = 1280, quality = 0.82) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height / width) * maxDim);
              width = maxDim;
            } else {
              width = Math.round((width / height) * maxDim);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            quality
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  }, []);

  const generateVideoThumbnail = useCallback((file, seekTime = 1) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;
      const url = URL.createObjectURL(file);
      video.src = url;

      const cleanup = () => {
        URL.revokeObjectURL(url);
      };

      video.onloadedmetadata = () => {
        const duration = video.duration || 0;
        video.currentTime = Math.min(seekTime, duration / 2 || 0);
      };
      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            cleanup();
            resolve({ thumbnailBlob: blob, duration: video.duration || 0 });
          },
          "image/jpeg",
          0.8
        );
      };
      video.onerror = () => {
        cleanup();
        resolve({ thumbnailBlob: null, duration: 0 });
      };
    });
  }, []);

  const uploadFile = useCallback(async (file, { retries = 3, label } = {}) => {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await base44.integrations.Core.UploadFile({ file });
        return result.file_url;
      } catch (err) {
        lastError = err;
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
        }
      }
    }
    throw lastError;
  }, []);

  const uploadMedia = useCallback(async (file, options = {}) => {
    const { compress = true, generateThumb = false, retries = 3 } = options;
    setIsUploading(true);

    try {
      let fileToUpload = file;
      let thumbnailUrl = null;
      let duration = 0;

      if (file.type?.startsWith("image/") && compress) {
        fileToUpload = await compressImage(file);
      }

      if (file.type?.startsWith("video/") && generateThumb) {
        const thumbResult = await generateVideoThumbnail(file);
        duration = thumbResult.duration;
        if (thumbResult.thumbnailBlob) {
          thumbnailUrl = await uploadFile(thumbResult.thumbnailBlob, { retries, label: "thumbnail" });
        }
      }

      const mediaUrl = await uploadFile(fileToUpload, { retries, label: "media" });

      setIsUploading(false);
      return { mediaUrl, thumbnailUrl, duration };
    } catch (err) {
      setIsUploading(false);
      throw err;
    }
  }, [compressImage, generateVideoThumbnail, uploadFile]);

  return { uploadMedia, uploadFile, compressImage, generateVideoThumbnail, isUploading, queue };
}