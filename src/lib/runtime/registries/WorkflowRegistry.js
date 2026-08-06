/**
 * Workflow Registry — Workflow Definitions
 *
 * Authoritative metadata for CNCF SWF workflows. The actual workflow files
 * live in base44/workflows/, this registry provides runtime metadata for
 * Nexus and Orbit to reference.
 */

import { logger } from '../logger';

const DEFAULT_WORKFLOWS = [
  { workflow_id: 'bud_notification_engine', name: 'Bud Notification Engine', trigger: 'scheduled', orbitManaged: true, description: 'Processes notification queue and dispatches via Bud' },
  { workflow_id: 'bud_reminders', name: 'Bud Reminders', trigger: 'scheduled', orbitManaged: true, description: 'Sends Bud reminders based on user preferences' },
  { workflow_id: 'deadline_reminders', name: 'Deadline Reminders', trigger: 'scheduled', orbitManaged: true, description: 'Sends assignment deadline reminders' },
  { workflow_id: 'event_reminders', name: 'Event Reminders', trigger: 'scheduled', orbitManaged: true, description: 'Sends campus event reminders' },
  { workflow_id: 'study_streak_reminders', name: 'Study Streak Reminders', trigger: 'scheduled', orbitManaged: true, description: 'Maintains study streaks' },
  { workflow_id: 'exam_countdown', name: 'Exam Countdown', trigger: 'scheduled', orbitManaged: true, description: 'Sends exam countdown notifications' },
  { workflow_id: 'welcome_new_student', name: 'Welcome New Student', trigger: 'app_user_auth', orbitManaged: true, description: 'Welcomes new students' },
  { workflow_id: 'outreach_followup', name: 'Outreach Follow-up', trigger: 'scheduled', orbitManaged: true, description: 'Follows up on institution outreach' },
  { workflow_id: 'university_connect_bg_sync', name: 'University Connect Background Sync', trigger: 'scheduled', orbitManaged: true, description: 'Background data sync' },
  { workflow_id: 'activate_scheduled_announcements', name: 'Activate Scheduled Announcements', trigger: 'scheduled', orbitManaged: true, description: 'Activates scheduled staff announcements' },
  { workflow_id: 'study_group_message_notifications', name: 'Study Group Message Notifications', trigger: 'entity', orbitManaged: true, description: 'Notifies on study group messages' },
  { workflow_id: 'study_group_task_notifications', name: 'Study Group Task Notifications', trigger: 'entity', orbitManaged: true, description: 'Notifies on study group tasks' },
  { workflow_id: 'task_deadline_reminders', name: 'Task Deadline Reminders', trigger: 'scheduled', orbitManaged: true, description: 'Reminds about task deadlines' },
];

class WorkflowRegistry {
  constructor() { this._workflows = new Map(); this._ready = false; }

  async init() {
    for (const wf of DEFAULT_WORKFLOWS) this._workflows.set(wf.workflow_id, wf);
    this._ready = true;
    logger.info('WorkflowRegistry initialized', { workflowCount: this._workflows.size });
  }

  register(wfDef) { this._workflows.set(wfDef.workflow_id, wfDef); }
  get(wfId) { return this._workflows.get(wfId) || null; }
  list(filter) {
    const all = Array.from(this._workflows.values());
    if (filter?.trigger) return all.filter((w) => w.trigger === filter.trigger);
    return all;
  }

  get ready() { return this._ready; }
}

export const workflowRegistry = new WorkflowRegistry();
export default workflowRegistry;