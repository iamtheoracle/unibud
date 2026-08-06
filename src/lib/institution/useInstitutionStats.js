import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

/**
 * useInstitutionStats — live institutional overview metrics for a tenant.
 * Pulls real counts from every tenant-scoped entity (Staff, CampusEvent,
 * LiveClass, StaffAnnouncement, Admission, Community, Club, StudentRecord)
 * plus the configured academic structure, and streams realtime activity from
 * announcements + events. Everything is RLS-scoped to the admin's institution.
 */
const safeCount = async (entity, query) => {
  try { const rows = await entity.filter(query); return Array.isArray(rows) ? rows.length : 0; } catch { return 0; }
};

export function useInstitutionStats(institution) {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const id = institution?.id;
    const name = institution?.name;
    const as = institution?.academic_structure || {};

    const [students, staff, admissions, announcements, events, liveNow, communities, clubs] = await Promise.all([
      safeCount(base44.entities.StudentRecord, name ? { university: name } : {}),
      safeCount(base44.entities.Staff, id ? { institution_id: id } : {}),
      safeCount(base44.entities.Admission, id ? { institution_id: id } : {}),
      safeCount(base44.entities.StaffAnnouncement, id ? { institution_id: id } : {}),
      safeCount(base44.entities.CampusEvent, id ? { institution_id: id } : {}),
      safeCount(base44.entities.LiveClass, id ? { institution_id: id, status: "live" } : {}),
      safeCount(base44.entities.Community, id ? { institution_id: id } : {}),
      safeCount(base44.entities.Club, id ? { institution_id: id } : {}),
    ]);

    setStats({
      students, staff, admissions, announcements, events, liveNow, communities, clubs,
      courses: (as.courses || []).length,
      departments: (as.departments || []).length,
      programmes: (as.programmes || []).length,
      levels: (as.levels || []).length,
    });

    const [anns, evs] = await Promise.all([
      base44.entities.StaffAnnouncement.filter(id ? { institution_id: id } : {}, "-created_date", 5).catch(() => []),
      base44.entities.CampusEvent.filter(id ? { institution_id: id } : {}, "-created_date", 5).catch(() => []),
    ]);
    const merged = [
      ...anns.map((a) => ({ id: `a-${a.id}`, kind: "announcement", title: a.title, sub: a.audience, priority: a.priority, at: a.created_date })),
      ...evs.map((e) => ({ id: `e-${e.id}`, kind: "event", title: e.title, sub: e.type, status: e.status, at: e.created_date })),
    ].sort((x, y) => new Date(y.at || 0) - new Date(x.at || 0)).slice(0, 6);
    setActivity(merged);
    setLoading(false);
  };

  const prepend = (item) => {
    if (!item?.id) return;
    setActivity((prev) => [item, ...prev.filter((p) => p.id !== item.id)].slice(0, 6));
  };

  useEffect(() => {
    if (!institution?.id) return;
    setLoading(true);
    load();
    const onAnn = (ev) => {
      if (ev.type !== "create") return;
      const a = ev.data;
      prepend({ id: `a-${a.id}`, kind: "announcement", title: a.title, sub: a.audience, priority: a.priority, at: a.created_date });
    };
    const onEvent = (ev) => {
      if (ev.type !== "create") return;
      const e = ev.data;
      prepend({ id: `e-${e.id}`, kind: "event", title: e.title, sub: e.type, status: e.status, at: e.created_date });
    };
    const u1 = base44.entities.StaffAnnouncement.subscribe?.(onAnn);
    const u2 = base44.entities.CampusEvent.subscribe?.(onEvent);
    return () => { u1?.(); u2?.(); };
  }, [institution?.id]);

  const health = {
    status: institution?.status,
    verified: Boolean(institution?.is_verified),
    verification_status: institution?.verification_status || "not_onboarded",
    dataSources: (institution?.data_sources || []).length,
  };

  return { stats, activity, health, loading };
}