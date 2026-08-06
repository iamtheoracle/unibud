import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorState({ title = "Something went wrong", description, onRetry, className = "" }) {
  return (
    <div className={"flex flex-col items-center justify-center py-20 px-6 text-center " + className}>
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
        <AlertCircle className="w-7 h-7 text-destructive" strokeWidth={1.6} />
      </div>
      <h3 className="font-heading font-bold text-[17px] text-foreground mb-2 tracking-tight">{title}</h3>
      {description && <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[280px]">{description}</p>}
      {onRetry && <Button onClick={onRetry} variant="outline" size="sm" className="mt-5">Try again</Button>}
    </div>
  );
}