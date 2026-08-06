import React, { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * MobileSelect — renders a native <select> on desktop (unchanged behavior)
 * and a premium slide-up Vaul sheet on mobile. Maintains value, validation
 * and form integration via the standard `value`/`onChange` contract.
 */
export default function MobileSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select",
  label,
  leftIcon: Icon,
  className,
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  if (!isMobile) {
    return (
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            "w-full h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none",
            Icon ? "pl-10 pr-10" : "px-4 pr-10",
            className
          )}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "w-full h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground flex items-center justify-between spring-tap",
          Icon ? "pl-10 pr-4" : "px-4",
          className
        )}
      >
        <span className={cn("flex items-center gap-2 truncate", !selected && "text-muted-foreground")}>
          {Icon && <Icon className="w-4 h-4 text-muted-foreground shrink-0" />}
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader>
            <DrawerTitle>{label || placeholder}</DrawerTitle>
          </DrawerHeader>
          <div className="px-3 pb-6 safe-area-pb overflow-y-auto max-h-[60vh] space-y-1">
            {options.map((o) => (
              <button
                key={o.value}
                onClick={() => { onChange?.(o.value); setOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[15px] text-left spring-tap",
                  o.value === value ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-muted/60"
                )}
              >
                {o.label}
                {o.value === value && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}