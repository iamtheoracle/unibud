import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { BadgeCheck, Building2, Users } from "lucide-react";

function FilterToggle({ active, onClick, icon: Icon, label, sublabel }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-3.5 rounded-[16px] spring-tap transition-all w-full ${
        active ? "bg-primary/10 border border-primary/30" : "glass border border-border/30"
      }`}
    >
      <div className={`w-9 h-9 rounded-full grid place-items-center ${active ? "bg-primary/15" : "bg-muted/30"}`}>
        <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <div className="flex-1 text-left">
        <p className="text-[13px] font-semibold text-foreground">{label}</p>
        {sublabel && <p className="text-[11px] text-muted-foreground">{sublabel}</p>}
      </div>
      <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${active ? "bg-primary border-primary" : "border-border"}`}>
        {active && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
      </div>
    </button>
  );
}

export default function FilterSheet({ open, onOpenChange, filters, onChange, user }) {
  const toggle = (key) => onChange({ ...filters, [key]: !filters[key] });
  const activeCount = Object.values(filters).filter(Boolean).length;

  const handleReset = () => onChange({ verifiedOnly: false, myFaculty: false, myDepartment: false });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-[28px] max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Narrow your discovery to what matters most.</SheetDescription>
        </SheetHeader>
        <div className="space-y-2.5 px-1 pb-8 pt-3">
          <FilterToggle
            active={filters.verifiedOnly}
            onClick={() => toggle("verifiedOnly")}
            icon={BadgeCheck}
            label="Verified Only"
            sublabel="Show only verified communities and clubs"
          />
          {user?.faculty && (
            <FilterToggle
              active={filters.myFaculty}
              onClick={() => toggle("myFaculty")}
              icon={Building2}
              label="My Faculty"
              sublabel={user.faculty}
            />
          )}
          {user?.department && (
            <FilterToggle
              active={filters.myDepartment}
              onClick={() => toggle("myDepartment")}
              icon={Users}
              label="My Department"
              sublabel={user.department}
            />
          )}
          {activeCount > 0 && (
            <button
              onClick={handleReset}
              className="w-full text-center text-[12px] font-semibold text-muted-foreground py-2 spring-tap"
            >
              Clear all filters
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}