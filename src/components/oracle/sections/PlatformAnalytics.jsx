import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, PieChart, Pie, Cell as PCell, Legend } from "recharts";
import { Users, Building2, Flag, LifeBuoy } from "lucide-react";

const PIE = ["#7FD8FF", "#A78BFA", "#34D399", "#FBBF24", "#F472B6", "#60A5FA"];

export default function PlatformAnalytics() {
  const [data, setData] = useState({ instByStatus: [], reportsByStatus: [], ticketsByCat: [] });

  useEffect(() => {
    (async () => {
      try {
        const [inst, reports, tickets] = await Promise.all([
          base44.entities.Institution.list("-created_date", 100).catch(() => []),
          base44.entities.ContentReport.list("-created_date", 100).catch(() => []),
          base44.entities.SupportTicket.list("-created_date", 100).catch(() => []),
        ]);
        const group = (arr, field) => {
          const m = {}; arr.forEach((x) => { const k = x[field] || "unknown"; m[k] = (m[k] || 0) + 1; });
          return Object.entries(m).map(([name, value]) => ({ name, value }));
        };
        setData({ instByStatus: group(inst, "verification_status"), reportsByStatus: group(reports, "status"), ticketsByCat: group(tickets, "category") });
      } catch {}
    })();
  }, []);

  return (
    <div className="space-y-5">
      <div><h1 className="text-[20px] font-heading font-bold">Platform Analytics</h1><p className="text-[13px] text-muted-foreground">Aggregate metrics across UNIBUD.</p></div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Institutions by verification status" icon={Building2}><Bars data={data.instByStatus} /></Panel>
        <Panel title="Reports by status" icon={Flag}><Bars data={data.reportsByStatus} /></Panel>
        <Panel title="Support tickets by category" icon={LifeBuoy}>
          {data.ticketsByCat.length === 0 ? <Empty /> :
            <ResponsiveContainer width="100%" height={200}>
              <PieChart><Pie data={data.ticketsByCat} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={{ fontSize: 10 }}>{data.ticketsByCat.map((_, i) => <PCell key={i} fill={PIE[i % PIE.length]} />)}</Pie><Legend wrapperStyle={{ fontSize: 10 }} /></PieChart>
            </ResponsiveContainer>}
        </Panel>
        <Panel title="Quick counts">
          <div className="grid grid-cols-2 gap-3">
            <Mini icon={Building2} label="Institutions" value={data.instByStatus.reduce((s, x) => s + x.value, 0)} />
            <Mini icon={Flag} label="Reports" value={data.reportsByStatus.reduce((s, x) => s + x.value, 0)} />
            <Mini icon={LifeBuoy} label="Tickets" value={data.ticketsByCat.reduce((s, x) => s + x.value, 0)} />
            <Mini icon={Users} label="Active" value="—" />
          </div>
        </Panel>
      </div>
    </div>
  );
}

const Panel = ({ title, icon: Icon, children }) => (
  <div className="glass-card radius-lg p-4"><p className="text-[13px] font-heading font-semibold mb-3 flex items-center gap-1.5">{Icon && <Icon className="w-4 h-4 text-primary" />}{title}</p>{children}</div>
);
const Bars = ({ data }) => data.length === 0 ? <Empty /> : (
  <ResponsiveContainer width="100%" height={200}><BarChart data={data}><XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" /><YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" /><Tooltip cursor={{ fill: "hsl(var(--muted)/0.3)" }} /><Bar dataKey="value" radius={[6, 6, 0, 0]}><Cell fill="#7FD8FF" /></Bar></BarChart></ResponsiveContainer>
);
const Empty = () => <p className="text-[12px] text-muted-foreground">No data yet.</p>;
const Mini = ({ icon: Icon, label, value }) => (
  <div className="bg-muted/30 rounded-lg p-3"><div className="flex items-center gap-1.5"><Icon className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span></div><p className="text-[20px] font-heading font-bold mt-1">{value}</p></div>
);