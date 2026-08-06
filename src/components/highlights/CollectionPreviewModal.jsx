import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Image } from "@/components/ui/image";
import { ExternalLink, Lock, Mail, Users, Building2, Globe, MessageSquare, Eye, ArrowRight } from "lucide-react";
import CollectionCover from "./CollectionCover";

const PRIVACY_CONFIG = {
  only_me: { icon: Lock, label: "Only Me" },
  invited: { icon: Mail, label: "Invited People" },
  friends: { icon: Users, label: "Friends" },
  community: { icon: Building2, label: "Community Members" },
  public: { icon: Globe, label: "Public" },
};

const CONTRIBUTE_LABELS = {
  no_one: "No one",
  selected: "Selected Collaborators",
  all_invited: "All Invited Collaborators",
  community: "Community Members",
};

const COMMENT_LABELS = {
  off: "Off",
  collaborators: "Collaborators Only",
  everyone: "Everyone with access",
};

/**
 * CollectionPreviewModal — lightweight preview that opens when a
 * rich preview card is tapped. Shows items, collaborators,
 * description, categories, and permissions without entering the
 * full collection experience.
 */
export default function CollectionPreviewModal({
  open, onOpenChange, folder, items = [], collaborators = [], owner = {}, permissions = {}, updatedAt, onOpenCollection,
}) {
  const privacy = permissions.view || "invited";
  const privacyCfg = PRIVACY_CONFIG[privacy] || PRIVACY_CONFIG.invited;
  const PrivacyIcon = privacyCfg.icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-[28px] max-h-[85vh] overflow-y-auto no-scrollbar">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">{folder || "Collection"}</SheetTitle>
          <SheetDescription>Browse items and view collaborators before opening.</SheetDescription>
        </SheetHeader>

        <div className="pb-8 space-y-4">
          <div className="rounded-2xl overflow-hidden">
            <CollectionCover coverImage={owner.coverImage} items={items} height="h-36" />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl glass-card">
            <div className="w-10 h-10 rounded-full bg-card grid place-items-center overflow-hidden shrink-0">
              {owner.image ? (
                <img src={owner.image} alt="" className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <span className="text-[12px] font-bold">{(owner.name || "U").charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold truncate">{owner.name || "Unknown"}</p>
              <p className="text-[11px] text-muted-foreground">Owner</p>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-bold">{items.length}</p>
              <p className="text-[10px] text-muted-foreground">items</p>
            </div>
          </div>

          {collaborators.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                Collaborators ({collaborators.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {collaborators.slice(0, 8).map((c) => (
                  <div key={c.user_id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-full glass-card">
                    <div className="w-5 h-5 rounded-full bg-card grid place-items-center overflow-hidden">
                      {c.image ? <img src={c.image} alt="" className="w-full h-full object-cover" loading="lazy" /> : <span className="text-[8px] font-bold">{(c.name || "U").charAt(0).toUpperCase()}</span>}
                    </div>
                    <span className="text-[11px] font-medium">{c.name}</span>
                    <span className="text-[9px] text-muted-foreground capitalize">· {c.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
              Saved Items
            </p>
            <div className="space-y-1.5">
              {items.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-2xl glass-card">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-card shrink-0">
                    {item.image_url ? (
                      <Image src={item.image_url} fittingType="fill" className="w-full h-full" />
                    ) : (
                      <div className="w-full h-full grid place-items-center">
                        <ExternalLink className="w-4 h-4 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium truncate">{item.title}</p>
                    {item.source_name && <p className="text-[10px] text-muted-foreground truncate">{item.source_name}</p>}
                  </div>
                </div>
              ))}
              {items.length > 5 && (
                <p className="text-center text-[11px] text-muted-foreground py-1">+ {items.length - 5} more items</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
              Permissions
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 p-2.5 rounded-2xl glass-card">
                <PrivacyIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-[11px] text-muted-foreground">Who can view</span>
                <span className="text-[11px] font-medium ml-auto">{privacyCfg.label}</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-2xl glass-card">
                <Eye className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-[11px] text-muted-foreground">Who can contribute</span>
                <span className="text-[11px] font-medium ml-auto">{CONTRIBUTE_LABELS[permissions.contribute] || "All Invited"}</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-2xl glass-card">
                <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-[11px] text-muted-foreground">Who can comment</span>
                <span className="text-[11px] font-medium ml-auto">{COMMENT_LABELS[permissions.comment] || "Collaborators"}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenCollection}
            className="w-full py-3 rounded-2xl bg-foreground text-background text-[14px] font-semibold spring-tap flex items-center justify-center gap-2"
          >
            Open Collection <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}