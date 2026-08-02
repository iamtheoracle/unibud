import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

export default function UniversalSheet({ open, onOpenChange, title, description, children, className = "" }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={className}>
        {title && (
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-[16px] font-semibold text-foreground tracking-tight">{title}</DrawerTitle>
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </DrawerHeader>
        )}
        <div className="px-5 pb-8 safe-area-pb">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}