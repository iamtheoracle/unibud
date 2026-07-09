import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all connected university connections
    const connections = await base44.asServiceRole.entities.UniversityConnection.filter({
      status: 'connected',
      consent_given: true
    });

    const results = {
      total_connections: connections?.length || 0,
      synced: 0,
      failed: 0,
      notifications_created: 0
    };

    if (!connections || connections.length === 0) {
      return Response.json({ status: 'success', results });
    }

    for (const connection of connections) {
      try {
        // Check if we should sync (only if last synced > 4 hours ago)
        const lastSynced = connection.last_synced ? new Date(connection.last_synced) : null;
        const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

        if (lastSynced && lastSynced > fourHoursAgo) {
          continue;
        }

        // Update sync status
        await base44.asServiceRole.entities.UniversityConnection.update(connection.id, {
          sync_status: 'syncing'
        });

        // Simulate syncing by updating the timestamp and status
        // In production, this would call the actual university API
        await base44.asServiceRole.entities.UniversityConnection.update(connection.id, {
          last_synced: new Date().toISOString(),
          sync_status: 'success'
        });

        results.synced++;

        // Check for upcoming assignments/exams and create reminder notifications
        const syncedData = connection.synced_data || {};

        // Create a general sync notification
        if (syncedData.announcements && Array.isArray(syncedData.announcements)) {
          for (const announcement of syncedData.announcements.slice(0, 1)) {
            await base44.asServiceRole.entities.Notification.create({
              title: announcement.title || 'University Update',
              message: announcement.message || 'New information synced from your university',
              type: 'academic',
              icon: 'Bell',
              link: '/academics'
            }).catch(() => {});
            results.notifications_created++;
          }
        }

      } catch (connError) {
        results.failed++;
        await base44.asServiceRole.entities.UniversityConnection.update(connection.id, {
          sync_status: 'failed',
          error_message: connError.message
        }).catch(() => {});
      }
    }

    return Response.json({ status: 'success', results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});