import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Inbox } from "lucide-react";
import { base44 } from "@/api/base44Client";
import OperatorStatusTabs from "@/components/operator/OperatorStatusTabs";
import OperatorTaskCard from "@/components/operator/OperatorTaskCard";
import { MY_TASK_TABS } from "@/components/operator/operatorConstants";
import EmptyState from "@/components/ui/EmptyState";

export default function OperatorTasks() {
  const [activeTab, setActiveTab] = useState("assigned");
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me(), retry: false });
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["operatorAssignments"],
    queryFn: () => base44.entities.OperatorAssignment.filter({ assigned_to_id: user?.id }, "-created_date", 200),
    enabled: !!user?.id,
  });

  const my = tasks || [];
  const counts = useMemo(() => {
    const c = {};
    for (const t of my) c[t.status] = (c[t.status] || 0) + 1;
    return c;
  }, [my]);

  const filtered = useMemo(() => my.filter((t) => t.status === activeTab), [my, activeTab]);

  return (
    <div className="space-y-4 mt-2">
      <h2 className="font-heading font-bold text-[17px] text-foreground px-1">My Tasks</h2>
      <OperatorStatusTabs tabs={MY_TASK_TABS} active={activeTab} onChange={setActiveTab} counts={counts} />

      {isLoading ? (
        <div className="space-y-2.5">{[1, 2, 3].map((i) => <div key={i} className="h-[88px] rounded-[20px] shimmer" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Inbox} title="No tasks here" description={`You have no ${activeTab.replace("_", " ")} tasks.`} />
      ) : (
        <div className="space-y-2.5">{filtered.map((t, i) => <OperatorTaskCard key={t.id} task={t} index={i} />)}</div>
      )}
    </div>
  );
}