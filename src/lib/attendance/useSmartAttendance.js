import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const SESSIONS_KEY = ["AttendanceSession"];
const RECORDS_KEY = ["AttendanceRecord"];

function genCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * useSmartAttendance — live QR/code attendance for UNIBUD.
 * Lecturers open sessions (rotating code, expiry); students check in;
 * history + analytics run over the existing AttendanceRecord entity.
 */
export function useSmartAttendance() {
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  const { data: sessions = [] } = useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: () => base44.entities.AttendanceSession.list("-created_date", 50),
  });
  const { data: records = [] } = useQuery({
    queryKey: RECORDS_KEY,
    queryFn: () => base44.entities.AttendanceRecord.list("-created_date", 100),
  });

  const now = Date.now();
  const activeSessions = sessions.filter((s) => s.status === "open" && new Date(s.expires_at).getTime() > now);

  const myRecords = records.filter((r) => r.created_by_id === user?.id);
  const present = myRecords.filter((r) => r.status === "present").length;
  const absent = myRecords.filter((r) => r.status === "absent").length;
  const excused = myRecords.filter((r) => r.status === "excused").length;
  const total = myRecords.length;
  const rate = total ? Math.round((present / total) * 100) : 0;

  const startSession = useMutation({
    mutationFn: ({ courseCode, courseTitle, durationMinutes, location, lateAfterMinutes }) => {
      const mins = Math.max(5, Math.min(180, Number(durationMinutes) || 30));
      return base44.entities.AttendanceSession.create({
        course_code: courseCode,
        course_title: courseTitle || null,
        code: genCode(),
        lecturer_name: user?.full_name || user?.preferred_name || "Lecturer",
        expires_at: new Date(Date.now() + mins * 60000).toISOString(),
        status: "open",
        location: location || null,
        late_after_minutes: Number(lateAfterMinutes) || 15,
        institution_id: user?.data?.institution_id || "default",
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SESSIONS_KEY }),
  });

  const closeSession = useMutation({
    mutationFn: (id) => base44.entities.AttendanceSession.update(id, { status: "closed" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: SESSIONS_KEY }),
  });

  const alreadyCheckedIn = (courseCode) =>
    myRecords.some((r) => r.course_code === courseCode && r.date === today() && r.status === "present");

  const checkIn = useMutation({
    mutationFn: async (session) => {
      if (alreadyCheckedIn(session.course_code)) {
        throw new Error("You have already checked in for this class today.");
      }
      const elapsedMin = (Date.now() - new Date(session.created_date).getTime()) / 60000;
      const late = elapsedMin > (session.late_after_minutes || 15);
      return base44.entities.AttendanceRecord.create({
        course_code: session.course_code,
        course_title: session.course_title || null,
        date: today(),
        status: "present",
        note: `Checked in via code ${session.code}${late ? " (late)" : ""}`,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: RECORDS_KEY }),
  });

  const checkInByCode = useMutation({
    mutationFn: async (code) => {
      const session = activeSessions.find((s) => s.code.toUpperCase() === code.toUpperCase().trim());
      if (!session) throw new Error("No active session matches that code.");
      return checkIn.mutateAsync(session);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: RECORDS_KEY }),
  });

  return {
    user,
    activeSessions,
    myRecords,
    present,
    absent,
    excused,
    total,
    rate,
    alreadyCheckedIn,
    startSession: startSession.mutate,
    startSessionPending: startSession.isPending,
    closeSession: closeSession.mutate,
    checkIn: checkIn.mutate,
    checkInByCode: checkInByCode.mutate,
    checkingIn: checkIn.isPending || checkInByCode.isPending,
  };
}