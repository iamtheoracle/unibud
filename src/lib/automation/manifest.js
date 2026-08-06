export const TRIGGERS = [
  { key: "assignment_created", label: "Assignment Created", configFields: [] },
  { key: "assignment_updated", label: "Assignment Updated", configFields: [] },
  { key: "deadline_approaching", label: "Deadline Approaching", configFields: [{ key: "days", label: "Days until due", placeholder: "3" }] },
  { key: "course_registered", label: "Course Registered", configFields: [] },
  { key: "document_uploaded", label: "Document Uploaded", configFields: [] },
  { key: "exam_added", label: "Exam Added", configFields: [] },
  { key: "exam_result_released", label: "Exam Result Released", configFields: [] },
  { key: "lecture_note_uploaded", label: "Lecture Note Uploaded", configFields: [] },
  { key: "calendar_event", label: "Calendar Event", configFields: [] },
  { key: "institution_announcement", label: "Institution Announcement", configFields: [] },
  { key: "community_post", label: "Community Post", configFields: [] },
  { key: "marketplace_purchase", label: "Marketplace Purchase", configFields: [] },
  { key: "profile_updated", label: "Profile Updated", configFields: [] },
  { key: "attendance_recorded", label: "Attendance Recorded", configFields: [] },
  { key: "manual", label: "Manual Trigger", configFields: [] },
];

export const ACTIONS = [
  { key: "notify", label: "Send Notification", immediate: true, configFields: [{ key: "message", label: "Message", placeholder: "You have new work" }] },
  { key: "create_reminder", label: "Create Reminder", immediate: true, configFields: [{ key: "message", label: "Reminder text", placeholder: "Revise chapter 4" }] },
  { key: "send_email", label: "Send Email", immediate: true, configFields: [{ key: "subject", label: "Subject", placeholder: "" }, { key: "body", label: "Body", placeholder: "" }] },
  { key: "create_calendar_event", label: "Create Calendar Event", immediate: false, configFields: [{ key: "title", label: "Event title", placeholder: "" }] },
  { key: "create_task", label: "Create Task", immediate: false, configFields: [{ key: "title", label: "Task", placeholder: "" }] },
  { key: "generate_flashcards", label: "Generate Flashcards", immediate: false, configFields: [{ key: "topic", label: "Topic", placeholder: "Calculus — Limits" }] },
  { key: "generate_quiz", label: "Generate Quiz", immediate: false, configFields: [{ key: "topic", label: "Topic", placeholder: "" }] },
  { key: "summarize_document", label: "Summarize Document", immediate: false, configFields: [{ key: "topic", label: "Content / topic", placeholder: "" }] },
  { key: "organize_files", label: "Organize Files", immediate: false, configFields: [] },
  { key: "bookmark_content", label: "Bookmark Content", immediate: false, configFields: [] },
  { key: "recommend_tutor", label: "Recommend Tutor", immediate: false, configFields: [] },
  { key: "recommend_community", label: "Recommend Community", immediate: false, configFields: [] },
  { key: "recommend_research", label: "Recommend Research Papers", immediate: false, configFields: [] },
  { key: "archive_completed", label: "Archive Completed Work", immediate: false, configFields: [] },
  { key: "export_document", label: "Export Document", immediate: false, configFields: [] },
];

export const CONDITION_FIELDS = ["course_code", "status", "type", "priority", "subject", "score", "custom"];
export const CONDITION_OPS = ["==", "!=", "contains", ">", "<"];

export const triggerLabel = (k) => TRIGGERS.find((t) => t.key === k)?.label || k;
export const actionLabel = (k) => ACTIONS.find((a) => a.key === k)?.label || k;