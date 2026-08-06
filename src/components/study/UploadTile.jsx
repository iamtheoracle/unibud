import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";

/** UploadTile — uploads a file and returns its URL via onUploaded. */
export default function UploadTile({ label = "Upload", accept, onUploaded }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const handle = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      onUploaded(file_url, f);
    } catch { toast({ title: "Upload failed" }); }
    finally { setBusy(false); if (ref.current) ref.current.value = ""; }
  };
  return (
    <label className="flex items-center gap-3 h-[48px] px-4 rounded-2xl glass cursor-pointer spring-tap">
      <input ref={ref} type="file" accept={accept} onChange={handle} className="hidden" />
      <span className="text-[13px] text-muted-foreground flex-1">{busy ? "Uploading…" : label}</span>
    </label>
  );
}