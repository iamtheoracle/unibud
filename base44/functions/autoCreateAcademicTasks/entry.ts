import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json().catch(() => ({}));
  const { action } = body;

  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    const oneDayLater = new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000);

    let tasksCreated = 0;
    let notificationsSent = 0;
    let skipped = 0;

    // ─── Monitor Assignment records with approaching deadlines ───
    try {
      const assignments = await base44.asServiceRole.entities.Assignment.filter(
        { due_date: { $gte: todayStr, $lte: sevenDaysLater.toISOString().split('T')[0] } },
        'due_date', 200
      );

      for (const assignment of (assignments || [])) {
        const sourceId = `assignment_${assignment.id}`;

        // Check if task already exists
        const existing = await base44.asServiceRole.entities.TaskManagement.filter(
          { source_id: sourceId },
          '-created_date', 1
        );

        if (existing && existing.length > 0) {
          // Check if we need to send reminders at different intervals
          const dueDate = new Date(assignment.due_date);
          const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

          if (daysUntilDue <= 3 && daysUntilDue > 0) {
            // Check if 3-day reminder was already sent
            const reminderKey = `${sourceId}_reminder_3d`;
            const existingReminder = await base44.asServiceRole.entities.Notification.filter(
              { batch_key: reminderKey },
              '-created_date', 1
            );

            if (!existingReminder || existingReminder.length === 0) {
              await base44.asServiceRole.entities.Notification.create({
                title: `Assignment due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
                message: `"${assignment.title}" is due on ${dueDate.toLocaleDateString()}. Don't forget to submit!`,
                type: 'academic',
                category: 'assignment',
                user_id: assignment.created_by_id || null,
                priority: daysUntilDue <= 1 ? 'high' : 'normal',
                link: '/assignments',
                icon: 'Clock',
                source: 'auto_academic_tasks',
                batch_key: reminderKey,
              });
              notificationsSent++;
            }
          }

          if (daysUntilDue <= 1 && daysUntilDue >= 0) {
            const reminderKey = `${sourceId}_reminder_1d`;
            const existingReminder = await base44.asServiceRole.entities.Notification.filter(
              { batch_key: reminderKey },
              '-created_date', 1
            );

            if (!existingReminder || existingReminder.length === 0) {
              await base44.asServiceRole.entities.Notification.create({
                title: daysUntilDue === 0 ? 'Assignment due today!' : 'Assignment due tomorrow!',
                message: `"${assignment.title}" is due ${daysUntilDue === 0 ? 'today' : 'tomorrow'}. Make sure you're ready!`,
                type: 'academic',
                category: 'assignment',
                user_id: assignment.created_by_id || null,
                priority: 'high',
                link: '/assignments',
                icon: 'AlertCircle',
                source: 'auto_academic_tasks',
                batch_key: reminderKey,
              });
              notificationsSent++;
            }
          }

          skipped++;
          continue;
        }

        // Create new academic task
        try {
          await base44.asServiceRole.entities.TaskManagement.create({
            title: `Assignment: ${assignment.title || 'Due'}`,
            description: assignment.description || '',
            due_date: assignment.due_date,
            status: 'todo',
            priority: 'high',
            source: 'assignment',
            source_id: sourceId,
            category: 'academic',
          });
          tasksCreated++;

          // Create initial notification
          const dueDate = new Date(assignment.due_date);
          const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
          await base44.asServiceRole.entities.Notification.create({
            title: 'New academic task created',
            message: `Assignment "${assignment.title || 'Untitled'}" is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}. A task has been added to your agenda.`,
            type: 'academic',
            category: 'assignment',
            user_id: assignment.created_by_id || null,
            priority: 'normal',
            link: '/agenda',
            icon: 'ClipboardList',
            source: 'auto_academic_tasks',
            batch_key: `${sourceId}_initial`,
          });
          notificationsSent++;
        } catch (e) {
          console.error('[autoCreateAcademicTasks] Failed to create task for assignment:', assignment.id, e.message);
        }
      }
    } catch (e) {
      console.error('[autoCreateAcademicTasks] Assignment monitoring failed:', e.message);
    }

    // ─── Monitor StudyGroupTask records with approaching deadlines ───
    try {
      const groupTasks = await base44.asServiceRole.entities.StudyGroupTask.filter(
        { due_date: { $gte: todayStr, $lte: sevenDaysLater.toISOString().split('T')[0] }, status: { $ne: 'done' } },
        'due_date', 200
      );

      for (const gtask of (groupTasks || [])) {
        const sourceId = `study_group_task_${gtask.id}`;

        const existing = await base44.asServiceRole.entities.TaskManagement.filter(
          { source_id: sourceId },
          '-created_date', 1
        );

        if (existing && existing.length > 0) {
          skipped++;
          continue;
        }

        try {
          await base44.asServiceRole.entities.TaskManagement.create({
            title: gtask.title || 'Study Group Task',
            description: gtask.description || '',
            due_date: gtask.due_date,
            status: 'todo',
            priority: gtask.priority || 'medium',
            source: 'study_group_task',
            source_id: sourceId,
            category: 'academic',
            assigned_to: gtask.assigned_to || null,
          });
          tasksCreated++;

          if (gtask.assigned_to) {
            await base44.asServiceRole.entities.Notification.create({
              title: 'Study group task assigned',
              message: `"${gtask.title}" is due on ${new Date(gtask.due_date).toLocaleDateString()}. Check your agenda for details.`,
              type: 'academic',
              category: 'study_group',
              user_id: gtask.assigned_to,
              priority: 'normal',
              link: '/agenda',
              icon: 'ListTodo',
              source: 'auto_academic_tasks',
              batch_key: `${sourceId}_initial`,
            });
            notificationsSent++;
          }
        } catch (e) {
          console.error('[autoCreateAcademicTasks] Failed to create task for group task:', gtask.id, e.message);
        }
      }
    } catch (e) {
      console.error('[autoCreateAcademicTasks] StudyGroupTask monitoring failed:', e.message);
    }

    return Response.json({
      status: 'success',
      tasksCreated,
      notificationsSent,
      skipped,
    });
  } catch (error) {
    console.error('[autoCreateAcademicTasks] Fatal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});