import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play, FileText, Download } from "lucide-react";

/**
 * Media gallery for posts — supports images, videos, and documents.
 * Renders a grid layout (1, 2, 3, or 4+) with lightbox support.
 */
export default function PostMediaGallery({ mediaUrls = [], mediaTypes = [] }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  const getMediaType = (index) => mediaTypes[index] || "image";

  const gridClass =
    mediaUrls.length === 1
      ? "grid-cols-1"
      : mediaUrls.length === 2
      ? "grid-cols-2"
      : mediaUrls.length === 3
      ? "grid-cols-2"
      : "grid-cols-2";

  const getItemClass = (index) => {
    if (mediaUrls.length === 1) return "h-60 sm:h-72";
    if (mediaUrls.length === 2) return "h-40 sm:h-48";
    if (mediaUrls.length === 3) return (index === 0 ? "h-40 sm:h-48 col-span-2" : "h-40 sm:h-48");
    return "h-32 sm:h-36";
  };

  return (
    <>
      <div className={`grid ${gridClass} gap-0.5`}>
        {mediaUrls.map((url, i) => {
          const type = getMediaType(i);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className={`relative overflow-hidden bg-muted cursor-pointer ${getItemClass(i)}`}
              onClick={() => setLightboxIndex(i)}
            >
              {type === "image" && (
                <img
                  src={url}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              )}
              {type === "video" && (
                <div className="relative w-full h-full">
                  <video
                    src={url}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>
                </div>
              )}
              {type === "document" && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-muted/50 p-4">
                  <FileText className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
                  <span className="text-[10px] text-muted-foreground font-medium truncate max-w-full">
                    {url.split("/").pop()}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
            >
              <X className="w-5 h-5" />
            </button>

            {mediaUrls.length > 1 && (
              <>
                <button
                  className="absolute left-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(Math.max(0, lightboxIndex - 1)); }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  className="absolute right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(Math.min(mediaUrls.length - 1, lightboxIndex + 1)); }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="max-w-full max-h-full p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {getMediaType(lightboxIndex) === "image" && (
                <img src={mediaUrls[lightboxIndex]} alt="" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
              )}
              {getMediaType(lightboxIndex) === "video" && (
                <video src={mediaUrls[lightboxIndex]} controls autoPlay className="max-w-full max-h-[85vh] rounded-2xl" />
              )}
              {getMediaType(lightboxIndex) === "document" && (
                <div className="bg-card rounded-2xl p-8 flex flex-col items-center gap-4">
                  <FileText className="w-16 h-16 text-muted-foreground" strokeWidth={1.5} />
                  <a
                    href={mediaUrls[lightboxIndex]}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-[14px] bg-primary text-primary-foreground text-[13px] font-semibold flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}