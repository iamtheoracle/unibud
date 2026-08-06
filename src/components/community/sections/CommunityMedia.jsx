import React from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, FileText, Download } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { Image } from "@/components/ui/image";

/**
 * CommunityMedia — media gallery compiled from posts with images and
 * shared files within the community.
 */
export default function CommunityMedia({ posts, accentColor }) {
  const accent = accentColor || "0 0% 100%";
  const media = [];

  (posts || []).forEach((post) => {
    (post.media || post.images || []).forEach((url) => {
      if (url) media.push({ url, type: "image", postId: post.id });
    });
    if (post.file_url) media.push({ url: post.file_url, type: "file", name: post.title || "File", postId: post.id });
  });

  if (media.length === 0) {
    return (
      <EmptyState
        icon={ImageIcon}
        title="No media yet"
        description="Photos and files shared in this community will appear here."
      />
    );
  }

  const images = media.filter((m) => m.type === "image");
  const files = media.filter((m) => m.type === "file");

  return (
    <div className="space-y-5">
      {images.length > 0 && (
        <div>
          <p className="text-[12px] font-semibold text-muted-foreground mb-2">Photos</p>
          <div className="grid grid-cols-3 gap-1.5">
            {images.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="aspect-square rounded-[12px] overflow-hidden glass"
              >
                <Image src={m.url} alt="" fittingType="fill" className="w-full h-full" />
              </motion.div>
            ))}
          </div>
        </div>
      )}
      {files.length > 0 && (
        <div>
          <p className="text-[12px] font-semibold text-muted-foreground mb-2">Files</p>
          <div className="space-y-2">
            {files.map((f, i) => (
              <a
                key={i}
                href={f.url}
                target="_blank"
                rel="noreferrer"
                className="crystal-card p-3 flex items-center gap-3 hover-lift spring-tap edge-light"
              >
                <div className="w-10 h-10 rounded-[14px] flex items-center justify-center" style={{ background: `hsl(${accent} / 0.12)` }}>
                  <FileText className="w-5 h-5" style={{ color: `hsl(${accent})` }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-[12px] text-foreground truncate">{f.name}</p>
                  <p className="text-[10px] text-muted-foreground">Tap to download</p>
                </div>
                <Download className="w-4 h-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}