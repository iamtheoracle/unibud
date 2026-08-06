import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const CLASS_KEY = (id) => ["LiveClass", id];
const RECORDS_KEY = ["AttendanceRecord"];
const CLASSES_KEY = ["LiveClass"];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * useLiveClassroom — the intelligence layer for a live class.
 *
 * Lecturer side: classroom controls (strict exam mode, Bud / AI toggles,
 * permissions, materials, thresholds), schedule / start / end, and a
 * post-class summary that notifies the lecturer.
 *
 * Student side: automatic attendance — detects participation on join,
 * tracks duration, late arrivals, early exits and reconnections, computes
 * attendance %, and writes everything into the academic AttendanceRecord.
 */
export function useLiveClassroom(classId) {
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  const classQ = useQuery({
    queryKey: CLASS_KEY(classId),
    queryFn: () => base44.entities.LiveClass.get(classId),
    enabled: !!classId,
  });
  const liveClass = classQ.data;

  const recordsQ = useQuery({
    queryKey: RECORDS_KEY,
    queryFn: () => base44.entities.AttendanceRecord.list("-created_date", 200),
    enabled: !!classId,
  });
  const classRecords = (recordsQ.data || []).filter((r) => r.live_class_id === classId);

  const isLecturer = !!(user && liveClass && (user.id === liveClass.lecturer_id || user.role === "admin"));

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: CLASS_KEY(classId) });
    qc.invalidateQueries({ queryKey: RECORDS_KEY });
  }, [qc, classId]);

  // ── Lecturer: controls ──
  const updateControls = useMutation({
    mutationFn: (patch) => base44.entities.LiveClass.update(classId, patch),
    onSuccess: invalidate,
  });

  const shareMaterial = useMutation({
    mutationFn: (material) => {
      const materials = [...(liveClass?.materials || []), material];
      return base44.entities.LiveClass.update(classId, { materials });
    },
    onSuccess: invalidate,
  });

  const removeMaterial = useMutation({
    mutationFn: (idx) => {
      const materials = [...(liveClass?.materials || [])];
      materials.splice(idx, 1);
      return base44.entities.LiveClass.update(classId, { materials });
    },
    onSuccess: invalidate,
  });

  const scheduleClass = useMutation({
    mutationFn: (data) =>
      base44.entities.LiveClass.create({
        ...data,
        lecturer_name: user?.full_name || user?.preferred_name || "Lecturer",
        lecturer_id: user?.id,
        institution_id: user?.data?.institution_id || "default",
        status: "scheduled",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLASSES_KEY }),
  });

  const startClass = useMutation({
    mutationFn: () => base44.entities.LiveClass.update(classId, { status: "live", started_at: new Date().toISOString() }),
    onSuccess: invalidate,
  });

  const endClass = useMutation({
    mutationFn: async () => {
      const recs = classRecords;
      const present = recs.filter((r) => r.status === "present");
      const late = recs.filter((r) => r.late).length;
      const earlyExit = recs.filter((r) => r.early_exit).length;
      const avgPct = present.length ? Math.round(present.reduce((a, r) => a + (r.attendance_pct || 0), 0) / present.length) : 0;
      const summary = {
        participants: recs.length,
        present: present.length,
        late,
        early_exit: earlyExit,
        avg_attendance_pct: avgPct,
        ended_at: new Date().toISOString(),
      };
      await base44.entities.LiveClass.update(classId, {
        status: "ended",
        end_time: new Date().toTimeString().slice(0, 5),
        summary,
      });
      if (liveClass?.lecturer_id) {
        await base44.entities.Notification.create({
          user_id: liveClass.lecturer_id,
          title: `Class ended — ${liveClass.title}`,
          message: `${present.length} of ${recs.length} present · ${late} late · ${earlyExit} early exits · avg ${avgPct}% attendance.`,
          type: "academic",
          category: "system",
          priority: "normal",
          link: `/classroom/${classId}`,
          icon: "check-circle",
        });
      }
      return summary;
    },
    onSuccess: invalidate,
  });

  // ── Student: live attendance automation ──
  const recordIdRef = useRef(null);
  const joinTimeRef = useRef(null);
  const [joined, setJoined] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [reconnections, setReconnections] = useState(0);

  useEffect(() => {
    if (!joined) return;
    const t = setInterval(() => {
      setDurationSec(Math.floor((Date.now() - joinTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [joined]);

  // detect reconnections (tab hidden → visible while joined)
  useEffect(() => {
    if (!joined) return;
    const onVis = () => {
      if (document.visibilityState === "visible") setReconnections((r) => r + 1);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [joined]);

  const join = useCallback(async () => {
    if (joined || !liveClass || !user || isLecturer) return;
    const now = new Date();
    const startedAt = liveClass.started_at ? new Date(liveClass.started_at).getTime() : now.getTime();
    const late = now.getTime() - startedAt > (liveClass.late_after_minutes || 10) * 60000;
    const rec = await base44.entities.AttendanceRecord.create({
      course_code: liveClass.course_code,
      course_title: liveClass.course_title || null,
      date: todayISO(),
      status: "present",
      live_class_id: classId,
      participant_name: user.full_name || user.preferred_name || "Student",
      participant_role: "student",
      join_time: now.toISOString(),
      late,
      reconnections: 0,
      attendance_pct: 0,
      lecturer_notified: false,
      institution_id: liveClass.institution_id || user?.data?.institution_id || "default",
      note: `Auto check-in${late ? " (late)" : ""}`,
    });
    recordIdRef.current = rec.id;
    joinTimeRef.current = now.getTime();
    setReconnections(0);
    setDurationSec(0);
    setJoined(true);
  }, [joined, liveClass, user, isLecturer, classId]);

  const leave = useCallback(async () => {
    if (!joined) return;
    const leaveTime = new Date();
    const durMin = joinTimeRef.current ? Math.max(0, Math.round((leaveTime.getTime() - joinTimeRef.current) / 60000)) : 0;
    const schedDur = liveClass?.duration_minutes || 0;
    const pct = schedDur > 0 ? Math.min(100, Math.round((durMin / schedDur) * 100)) : durMin > 0 ? 100 : 0;
    const earlyExit = (liveClass?.min_attendance_minutes || 0) > 0 && durMin < liveClass.min_attendance_minutes;
    if (recordIdRef.current) {
      try {
        await base44.entities.AttendanceRecord.update(recordIdRef.current, {
          leave_time: leaveTime.toISOString(),
          duration_minutes: durMin,
          attendance_pct: pct,
          early_exit: earlyExit,
          reconnections,
        });
      } catch {}
    }
    recordIdRef.current = null;
    joinTimeRef.current = null;
    setJoined(false);
    qc.invalidateQueries({ queryKey: RECORDS_KEY });
  }, [joined, liveClass, reconnections, qc]);

  return {
    user,
    liveClass,
    loading: classQ.isLoading,
    isLecturer,
    classRecords,
    // lecturer
    updateControls: updateControls.mutate,
    updatingControls: updateControls.isPending,
    shareMaterial: shareMaterial.mutate,
    sharingMaterial: shareMaterial.isPending,
    removeMaterial: removeMaterial.mutate,
    scheduleClass: scheduleClass.mutate,
    scheduling: scheduleClass.isPending,
    startClass: startClass.mutate,
    startingClass: startClass.isPending,
    endClass: endClass.mutate,
    endingClass: endClass.isPending,
    // student
    joined,
    join,
    leave,
    durationSec,
    reconnections,
    // derived
    summary: liveClass?.summary || null,
  };
}