import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Switch } from "@/components/ui/switch";
import { RotateCcw } from "lucide-react";

/**
 * BudOrbPrefsSheet — personalize the floating Bud companion:
 * side, floating height, auto-hide, compact mode, and reset.
 */
export default function BudOrbPrefsSheet({ open, onClose, prefs, update, reset }) {
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader>
          <DrawerTitle>Customize Bud</DrawerTitle>
        </DrawerHeader>
        <div className="px-5 pb-8 safe-area-pb space-y-6 overflow-y-auto max-h-[64vh]">
          {/* Side */}
          <div>
            <p className="text-[12px] font-semibold text-muted-foreground mb-2 ml-1">Side</p>
            <div className="grid grid-cols-2 gap-2">
              {["left", "right"].map((s) => (
                <button
                  key={s}
                  onClick={() => update({ side: s, dockX: null, dockY: null })}
                  className={`h-[44px] rounded-2xl text-[14px] font-semibold capitalize spring-tap ${
                    prefs.side === s ? "bg-primary text-primary-foreground" : "bg-muted/50 text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Floating height */}
          <div>
            <div className="flex items-center justify-between mb-2 ml-1">
              <p className="text-[12px] font-semibold text-muted-foreground">Floating height</p>
              <span className="text-[12px] text-muted-foreground">{prefs.height}px</span>
            </div>
            <input
              type="range"
              min={80}
              max={280}
              step={4}
              value={prefs.height}
              onChange={(e) => update({ height: Number(e.target.value), dockY: null })}
              className="w-full accent-primary"
            />
          </div>

          {/* Auto-hide */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold text-foreground">Auto-hide</p>
              <p className="text-[12px] text-muted-foreground">Bud steps aside when idle</p>
            </div>
            <Switch checked={prefs.autoHide} onCheckedChange={(v) => update({ autoHide: v })} />
          </div>

          {/* Compact */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold text-foreground">Compact</p>
              <p className="text-[12px] text-muted-foreground">Smaller orb</p>
            </div>
            <Switch checked={prefs.compact} onCheckedChange={(v) => update({ compact: v })} />
          </div>

          <button
            onClick={reset}
            className="w-full h-[48px] rounded-2xl border border-border text-[14px] font-semibold text-foreground flex items-center justify-center gap-2 spring-tap"
          >
            <RotateCcw className="w-4 h-4" /> Reset to defaults
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}