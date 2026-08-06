import React from "react";
import { Image } from "@/components/ui/image";
import { FolderOpen } from "lucide-react";

/**
 * CollectionCover — renders the collection cover image, or generates
 * a 2×2 collage from the first few saved items' images when no
 * explicit cover is set. Falls back to a gradient with an icon.
 */
export default function CollectionCover({ coverImage, items = [], className = "", height = "h-32" }) {
  const itemImages = (items || []).filter((i) => i.image_url).slice(0, 4);

  if (coverImage) {
    return (
      <div className={"relative " + height + " overflow-hidden " + className}>
        <Image src={coverImage} fittingType="fill" className="w-full h-full" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, hsl(var(--card)), transparent 70%)" }} />
      </div>
    );
  }

  if (itemImages.length === 0) {
    return (
      <div className={"relative " + height + " overflow-hidden " + className + " bg-gradient-to-br from-card to-secondary/40 grid place-items-center"}>
        <FolderOpen className="w-8 h-8 text-muted-foreground/30" strokeWidth={1.5} />
      </div>
    );
  }

  if (itemImages.length === 1) {
    return (
      <div className={"relative " + height + " overflow-hidden " + className}>
        <Image src={itemImages[0].image_url} fittingType="fill" className="w-full h-full" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, hsl(var(--card)), transparent 70%)" }} />
      </div>
    );
  }

  return (
    <div className={"relative " + height + " overflow-hidden " + className}>
      <div className="grid h-full" style={{ gridTemplateColumns: itemImages.length >= 3 ? "1fr 1fr" : "1fr", gridTemplateRows: itemImages.length >= 3 ? "1fr 1fr" : "1fr" }}>
        {itemImages.map((img, i) => (
          <div key={i} className="overflow-hidden">
            <Image src={img.image_url} fittingType="fill" className="w-full h-full" />
          </div>
        ))}
      </div>
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, hsl(var(--card)), transparent 70%)" }} />
    </div>
  );
}