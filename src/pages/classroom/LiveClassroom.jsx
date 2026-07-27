import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, Radio, Play, Square, ShieldAlert } from "lucide-react";
import { useLiveClassroom } from "@/lib/classroom/useLiveClassroom";
import { useClassroomMode } from "@/lib/classroom/ClassroomModeContext";
import LiveVideoStage from "@/components/live/LiveVideoStage";
import ClassroomControls from "@/components/classroom/ClassroomControls";
import LiveAttendancePanel from "@/components/classroom/LiveAttendancePanel";
import LiveAttendanceSummary from "@/components/classroom/LiveAttendanceSummary";

export default function LiveClassroom() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const c = useLiveClassroom(classId);
  const { liveClass, loading, isLecturer, joined, join, leave, summary } = c;
  const classroomMode = useClassroomMode();

  // reflect classroom controls into the global mode (hides Bud during exams)
  useEffect(() => {
    if (!liveClass) return;
    classroomMode.enter({
      classId,
      strictExam: liveClass.strict_exam_mode,
      budEnabled: liveClass.bud_enabled,
      aiEnabled: liveClass.ai_assistance_enabled,
    });
    return () => classroomMode.exit();
     
  }, [liveClass?.id, liveClass?.strict_exam_mode, liveClass?.bud_enabled, liveClass?.ai_assistance_enabled]);

  // student auto check-in when class is live
  useEffect(() => {
    if (liveClass?.status === "live" && !isLecturer && !joined) join();
     
  }, [liveClass?.status, isLecturer, joined]);

  // finalize student attendance when class ends
  useEffect(() => {
    if (liveClass?.status === "ended" && joined) leave();
     
  }, [liveClass?.status, joined]);

  // leave on unmount
  useEffect(() => {
    return () => {
      if (c.joined) c.leave();
    };
     
  }, []);

  if (loading || !liveClass) {
    return (
      <div className="fixed inset-0 bg-background grid place-items-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const live = liveClass.status === "live";

  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 safe-area-pt">
        <button onClick={() => navigate(-1)} className="text-muted-foreground spring-tap"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-foreground truncate">{liveClass.title}</p>
          <p className="text-[11px] text-muted-foreground truncate">{liveClass.course_code} · {liveClass.lecturer_name}</p>
        </div>
        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${live ? "bg-destructive/10 text-destructive" : liveClass.status === "ended" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
          {live ? <Radio className="w-3 h-3" /> : null}
          {liveClass.status.toUpperCase()}
        </span>
        {liveClass.strict_exam_mode && <ShieldAlert className="w-4 h-4 text-destructive" />}
      </div>

      <div className="flex-1 relative px-3 pb-2 min-h-0">
        <LiveVideoStage view="speaker" whiteboard={false} screenSharing={false} />
      </div>

      <div className="px-3 pb-3 space-y-3 overflow-y-auto max-h-[52vh] no-scrollbar">
        {isLecturer && live && (
          <div className="flex gap-2">
            {liveClass.status !== "ended" && (
              <button
                onClick={() => (live ? c.endClass() : c.startClass())}
                disabled={c.endingClass || c.startingClass}
                className={`flex-1 py-2.5 rounded-[14px] text-[12px] font-semibold flex items-center justify-center gap-1.5 spring-tap disabled:opacity-50 ${live ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}
              >
                {live ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {live ? "End class" : "Start class"}
              </button>
            )}
          </div>
        )}

        {isLecturer && liveClass.status === "scheduled" && (
          <button onClick={() => c.startClass()} disabled={c.startingClass} className="w-full py-2.5 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold flex items-center justify-center gap-1.5 spring-tap disabled:opacity-50">
            <Play className="w-3.5 h-3.5" /> Start class
          </button>
        )}

        {isLecturer && <ClassroomControls
          liveClass={liveClass}
          onUpdate={c.updateControls}
          updatingControls={c.updatingControls}
          onShare={c.shareMaterial}
          sharingMaterial={c.sharingMaterial}
          onRemove={c.removeMaterial}
          onSchedule={c.scheduleClass}
          scheduling={c.scheduling}
        />}

        <LiveAttendancePanel
          isLecturer={isLecturer}
          classRecords={c.classRecords}
          joined={joined}
          durationSec={c.durationSec}
          reconnections={c.reconnections}
          liveClass={liveClass}
          onLeave={leave}
          summary={summary}
        />

        {liveClass.status === "ended" && summary && <LiveAttendanceSummary summary={summary} liveClass={liveClass} />}
      </div>
    </div>
  );
}