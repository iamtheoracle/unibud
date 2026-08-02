import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Share2, Copy, Check, Globe, Link2, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { hapticTap } from "@/lib/haptics";
import SharedCollectionCard from "@/components/highlights/SharedCollectionCard";
import RecipientPicker from "@/components/highlights/RecipientPicker";

export default function ShareFolderSheet({ open, onOpenChange, folder, itemCount, isShared, onShare }) {
  const [shared, setShared] = useState(isShared);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setShared(isShared);
  }, [isShared, open]);

  const shareUrl = `${window.location.origin}/highlights?collection=${encodeURIComponent(folder || "")}`;

  const handleShare = async () => {
    hapticTap();
    try {
      await onShare();
      setShared(true);
      toast({ title: "Collection shared!", description: `"${folder}" is now visible to your community.` });
    } catch {
      toast({ title: "Couldn't share", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleCopy = () => {
    hapticTap();
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    toast({ title: "Link copied" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-[28px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Share "{folder}"
          </SheetTitle>
          <SheetDescription>
            Share {itemCount} saved {itemCount === 1 ? "item" : "items"} from this collection with other students in your community.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-1 pb-8 pt-3">
          {/* Collection preview */}
          <SharedCollectionCard folder={folder} itemCount={itemCount} />

          {/* Visibility / quick actions */}
          {!shared ? (
            <button
              onClick={handleShare}
              className="w-full py-3 rounded-[16px] bg-foreground text-background text-[14px] font-semibold spring-tap flex items-center justify-center gap-2"
            >
              <Globe className="w-4 h-4" /> Make Visible to Community
            </button>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 p-3 rounded-[16px] bg-success/10 border border-success/20">
                <Check className="w-4 h-4 text-success shrink-0" />
                <p className="text-[12px] font-medium text-foreground">Collection is visible — other students can discover it in the Community tab.</p>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-[16px] glass">
                <Link2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-transparent text-[12px] text-muted-foreground outline-none truncate"
                />
                <button onClick={handleCopy} className="w-8 h-8 rounded-full grid place-items-center glass spring-tap shrink-0" aria-label="Copy link">
                  {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              {navigator.share && (
                <button
                  onClick={() => { hapticTap(); navigator.share({ title: folder, url: shareUrl }); }}
                  className="w-full py-2.5 rounded-[16px] glass text-[13px] font-semibold spring-tap flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" /> Share Outside UNIBUD
                </button>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Share Directly</span>
            <div className="flex-1 h-px bg-border/40" />
          </div>

          {/* Recipient picker */}
          <RecipientPicker
            onShare={onShare}
            folderName={folder}
            shareUrl={shareUrl}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}