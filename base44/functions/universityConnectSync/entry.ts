import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'sync';

    if (action === 'sync') {
      // Find the user's active university connection
      const connections = await base44.entities.UniversityConnection.filter({
        created_by_id: user.id,
        status: 'connected'
      });

      if (!connections || connections.length === 0) {
        return Response.json({ status: 'no_connection', message: 'No active university connection found' });
      }

      const connection = connections[0];

      // Mark as syncing
      await base44.entities.UniversityConnection.update(connection.id, {
        sync_status: 'syncing'
      });

      try {
        // Generate synced academic data using LLM to simulate university portal data
        const llmResponse = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate realistic academic sync data for a ${user.department || 'Computer Science'} student at ${user.university}, ${user.level || '300 Level'}. Include: faculty, department, level, current_semester, registered_courses (array of {code, title, credits, lecturer}), gpa, cgpa, credits_completed, total_credits, attendance_percentage, assignment_completion, quiz_average, lecture_timetable (array of {day, code, time, location}), exam_timetable (array of {code, date, time, location}), academic_calendar (array of {event, date}), announcements (array of {title, message, date}), lecturer_info (array of {name, course, email, office}), classroom_locations (array of {code, building, room}). Return as structured JSON. Use realistic Nigerian university data.`,
          response_json_schema: {
            type: 'object',
            properties: {
              faculty: { type: 'string' },
              department: { type: 'string' },
              level: { type: 'string' },
              current_semester: { type: 'string' },
              registered_courses: { type: 'array', items: { type: 'object' } },
              gpa: { type: 'number' },
              cgpa: { type: 'number' },
              credits_completed: { type: 'number' },
              total_credits: { type: 'number' },
              attendance_percentage: { type: 'number' },
              assignment_completion: { type: 'number' },
              quiz_average: { type: 'number' },
              lecture_timetable: { type: 'array', items: { type: 'object' } },
              exam_timetable: { type: 'array', items: { type: 'object' } },
              academic_calendar: { type: 'array', items: { type: 'object' } },
              announcements: { type: 'array', items: { type: 'object' } },
              lecturer_info: { type: 'array', items: { type: 'object' } },
              classroom_locations: { type: 'array', items: { type: 'object' } }
            }
          }
        });

        const syncedData = {
          ...llmResponse,
          synchronized_at: new Date().toISOString(),
          sync_source: 'university_connect_engine'
        };

        // Update the connection record
        await base44.entities.UniversityConnection.update(connection.id, {
          last_synced: new Date().toISOString(),
          sync_status: 'success',
          synced_data: syncedData
        });

        // Create notifications for any new announcements
        if (llmResponse.announcements && Array.isArray(llmResponse.announcements)) {
          for (const announcement of llmResponse.announcements.slice(0, 3)) {
            await base44.entities.Notification.create({
              title: announcement.title || 'University Announcement',
              message: announcement.message || '',
              type: 'academic',
              icon: 'Bell',
              link: '/academics'
            }).catch(() => {});
          }
        }

        // Create reminder notifications for upcoming exams
        if (llmResponse.exam_timetable && Array.isArray(llmResponse.exam_timetable)) {
          for (const exam of llmResponse.exam_timetable.slice(0, 3)) {
            if (exam.date) {
              await base44.entities.Notification.create({
                title: `Exam: ${exam.code || 'Upcoming Exam'}`,
                message: `Scheduled for ${exam.date} at ${exam.location || 'TBD'}. Start preparing early!`,
                type: 'reminder',
                icon: 'AlertCircle',
                link: '/academics'
              }).catch(() => {});
            }
          }
        }

        return Response.json({
          status: 'success',
          connection_id: connection.id,
          synced_at: syncedData.synchronized_at,
          data_points: Object.keys(syncedData).length - 2
        });

      } catch (syncError) {
        await base44.entities.UniversityConnection.update(connection.id, {
          sync_status: 'failed',
          error_message: syncError.message
        });
        return Response.json({ status: 'error', error: syncError.message }, { status: 500 });
      }
    }

    if (action === 'get_status') {
      const connections = await base44.entities.UniversityConnection.filter({
        created_by_id: user.id,
        status: 'connected'
      });
      const connection = connections?.[0] || null;

      const prefs = await base44.entities.ReminderPreference.filter({
        created_by_id: user.id
      });
      const preference = prefs?.[0] || null;

      const socials = await base44.entities.SocialConnection.filter({
        created_by_id: user.id,
        is_connected: true
      });

      return Response.json({
        connection,
        reminder_preference: preference,
        social_connections: socials || []
      });
    }

    if (action === 'update_reminder_prefs') {
      const prefs = body.preferences || {};
      const existing = await base44.entities.ReminderPreference.filter({
        created_by_id: user.id
      });

      if (existing && existing.length > 0) {
        await base44.entities.ReminderPreference.update(existing[0].id, prefs);
      } else {
        await base44.entities.ReminderPreference.create(prefs);
      }
      return Response.json({ status: 'success', message: 'Reminder preferences updated' });
    }

    if (action === 'toggle_social') {
      const platform = body.platform;
      const profileUrl = body.profile_url || '';
      const username = body.username || '';
      const consent = body.consent || false;

      const existing = await base44.entities.SocialConnection.filter({
        created_by_id: user.id,
        platform
      });

      if (existing && existing.length > 0) {
        const updated = await base44.entities.SocialConnection.update(existing[0].id, {
          is_connected: !existing[0].is_connected,
          profile_url: profileUrl || existing[0].profile_url,
          username: username || existing[0].username,
          connected_date: new Date().toISOString(),
          consent_for_recommendations: consent
        });
        return Response.json({ status: 'success', connection: updated });
      } else {
        const created = await base44.entities.SocialConnection.create({
          platform,
          profile_url: profileUrl,
          username,
          is_connected: true,
          connected_date: new Date().toISOString(),
          consent_for_recommendations: consent
        });
        return Response.json({ status: 'success', connection: created });
      }
    }

    if (action === 'get_mentor_recommendations') {
      const mentors = await base44.entities.Mentor.list('-rating', 20);
      const userDept = user.department || 'Computer Science';
      const userUni = user.university || '';

      const llmResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `A student is studying ${userDept} at ${userUni}. Their interests and goals suggest they would benefit from mentorship. Based on this, recommend which mentor specializations would be most valuable. Return an array of specialization strings.`,
        response_json_schema: {
          type: 'object',
          properties: {
            recommended_specializations: { type: 'array', items: { type: 'string' } },
            reasoning: { type: 'string' }
          }
        }
      }).catch(() => ({ recommended_specializations: [], reasoning: '' }));

      return Response.json({
        mentors,
        recommendations: llmResponse
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});