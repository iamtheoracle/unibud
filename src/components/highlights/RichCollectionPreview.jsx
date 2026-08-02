import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, Users, Building2, Globe, ChevronRight } from "lucide-react";
import CollectionCover from "./CollectionCover";
import CollectionPreviewModal from "./CollectionPreviewModal";

const PRIVACY_CONFIG = {
  only_me: { icon: Lock, label: "Private" },
  invited: { icon: Mail, label: "Invited" },
  friends: { icon: Users, label: "Friends" },
  community: { icon: Building2, label: "Community" },
  public: { icon: Globe, label: "Public" },
};

const CATEGORY_LABELS = {
  movie: "Movies", tv_show: "TV Shows", music: "Music", playlist: "Playlists",
  book: "Books", podcast: "Podcasts", youtube_video: "Videos",
  news_article: "News", sports_team: "Sports", match: "Matches",
  scholarship: "Scholarships", internship: "Internships", event: "Events",
  research_paper: "Research", course: "Courses", note: "Notes",
  post: "Social", other: "Mixed",
};

function deriveCategory(items) {
  if (!items?.length) return "Collection";
  const types = [...new Set(items.map((i) => i.content_type))];
  if (types.length === 1) return CATEGORY_LABELS[types[0]] || "Collection";
  return "Mixed";
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return "just now";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  return Math.floor(hrs / 24) + "d ago";
}

/**
 * RichCollectionPreview — premium rich preview card for shared
 * collections. Shown in DMs, group chats, communities, and posts
 * instead of a plain link. Tapping opens a lightweight preview
 * modal before entering the full collection.
 */
export default function RichCollectionPreview({
  folder, items = [], collaborators = [], owner = {}, permissions = {}, updatedAt, onOpenCollection,
}) {
  const [showPreview, setShowPreview] = useState(false);
  const privacy = permissions.view || "invited";
  const privacyCfg = PRIVACY_CONFIG[privacy] || PRIVACY_CONFIG.invited;
  const PrivacyIcon = privacyCfg.icon;
  const category = deriveCategory(items);
  const displayCollabs = collaborators.slice(0, 5);

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => setShowPreview(true)}
        className="w-full text-left crystal-card overflow-hidden spring-tap"
      >
        <CollectionCover coverImage={owner.coverImage} items={items} height="h-28" />
        <div className="p-3.5">
          <div className="flex items-start gap-2 mb-1">
            <h3 className="flex-1 font-bold text-[14px] text-foreground line-clamp-1">{folder || "Collection"}</h3>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-secondary/50 shrink-0">
              <PrivacyIcon className="w-2.5 h-2.5 text-muted-foreground" />
              <span className="text-[9px] font-medium text-muted-foreground">{privacyCfg.label}</span>
            </div>
          </div>
          {permissions.description && (
            <p className="text-[12px] text-muted-foreground line-clamp-1 mb-2">{permissions.description}</p>
          )}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-card grid place-items-center shrink-0 overflow-hidden">
              {owner.image ? (
                <img src={owner.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[8px] font-bold">{(owner.name || "U").charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground truncate">{owner.name || "Unknown"}</span>
            <span className="text-[10px] text-muted-foreground/40">·</span>
            <span className="text-[10px] text-muted-foreground">{items.length} items</span>
            {updatedAt && (
              <>
                <span className="text-[10px] text-muted-foreground/40">·</span>
                <span className="text-[10px] text-muted-foreground/60">{timeAgo(updatedAt)}</span>
              </>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex -space-x-1.5">
              {displayCollabs.map((c) => (
                <div key={c.user_id} className="w-5 h-5 rounded-full border border-card bg-card grid place-items-center overflow-hidden">
                  {c.image ? (
                    <img src={c.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[7px] font-bold">{(c.name || "U").charAt(0).toUpperCase()}</span>
                  )}
                </div>
              ))}
              {collaborators.length > 5 && (
                <div className="w-5 h-5 rounded-full border border-card bg-secondary grid place-items-center">
                  <span className="text-[7px] font-bold text-muted-foreground">+{collaborators.length - 5}</span>
                </div>
              )}
            </div>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-semibold">{category}</span>
          </div>
        </div>
      </motion.button>

      <CollectionPreviewModal
        open={showPreview}
        onOpenChange={setShowPreview}
        folder={folder}
        items={items}
        collaborators={collaborators}
        owner={owner}
        permissions={permissions}
        updatedAt={updatedAt}
        onOpenCollection={() => { setShowPreview(false); onOpenCollection?.(); }}
      />
    </>
  );
}