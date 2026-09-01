import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // --- Role helpers ---
    const AUTHORIZED_ROLES = [
      'department_admin', 'faculty_admin', 'university_admin',
      'operator', 'senior_operator', 'moderator', 'compliance_officer',
      'platform_admin', 'super_admin', 'operations_staff', 'executive', 'oracle',
    ];
    const STAFF_ROLES = ['lecturer', ...AUTHORIZED_ROLES];
    const viewerRole = user.role || 'student';
    const isAuthorizedStaff = AUTHORIZED_ROLES.includes(viewerRole);
    const isStaff = STAFF_ROLES.includes(viewerRole);

    // --- Mask helper ---
    function maskMatric(matric) {
      if (!matric) return null;
      if (matric.length <= 6) return '••••';
      return matric.substring(0, 3) + '••••' + matric.substring(matric.length - 2);
    }

    function applyPrivacy(records, viewerUniv) {
      return records.map(function (r) {
        let matricVisible = false;
        // Own record
        if (r.user_id && r.user_id === user.id) matricVisible = true;
        // Authorized staff
        else if (isAuthorizedStaff) matricVisible = true;
        // Lecturer in same university
        else if (viewerRole === 'lecturer' && r.university && r.university === viewerUniv) matricVisible = true;
        // Privacy-based
        else if (r.matric_privacy === 'public' && r.university && r.university === viewerUniv) matricVisible = true;
        // For university_only / connections_only / private — matric not visible to regular students in search

        return {
          id: r.id,
          user_id: r.user_id,
          full_name: r.full_name,
          avatar_url: r.avatar_url || null,
          university: r.university || null,
          faculty: r.faculty || null,
          department: r.department || null,
          level: r.level || null,
          course_code: r.course_code || null,
          student_id: r.student_id || null,
          matriculation_number: matricVisible ? r.matriculation_number : maskMatric(r.matriculation_number),
          is_matric_visible: matricVisible,
          is_verified: r.is_verified || false,
          status: r.status || 'active',
          enrollment_year: r.enrollment_year || null,
          last_active_at: r.last_active_at || null,
          created_date: r.created_date || null,
        };
      });
    }

    // ===================== ACTION: search =====================
    if (action === 'search' || !action) {
      const { query, university, cursor, pageSize, filterType } = body;
      const limit = Math.min(pageSize || 15, 50);

      const filter = {};
      if (university) filter.university = university;

      // Apply filter type
      if (filterType === 'my_department' && user.department) {
        filter.department = user.department;
      } else if (filterType === 'my_faculty' && user.faculty) {
        filter.faculty = user.faculty;
      } else if (filterType === 'my_level' && user.level) {
        filter.level = user.level;
      } else if (filterType === 'verified') {
        filter.is_verified = true;
      }

      // Build search query — supports matric number, name, dept, faculty, level, course, university, student ID
      if (query && query.trim()) {
        const q = query.trim();
        filter.$or = [
          { full_name: { $regex: q, $options: 'i' } },
          { matriculation_number: { $regex: q, $options: 'i' } },
          { student_id: { $regex: q, $options: 'i' } },
          { department: { $regex: q, $options: 'i' } },
          { faculty: { $regex: q, $options: 'i' } },
          { level: { $regex: q, $options: 'i' } },
          { course_code: { $regex: q, $options: 'i' } },
          { university: { $regex: q, $options: 'i' } },
        ];
      }

      if (cursor) {
        filter.created_date = { $lt: cursor };
      }

      const records = await base44.asServiceRole.entities.StudentRecord.filter(filter, '-created_date', limit);
      const masked = applyPrivacy(records, user.university);
      const nextCursor = records.length === limit ? (records[records.length - 1] && records[records.length - 1].created_date) : null;

      return Response.json({ results: masked, nextCursor });
    }

    // ===================== ACTION: find_by_matric =====================
    // Exact matric number lookup — used by Bud and authorized staff
    if (action === 'find_by_matric') {
      const { matriculation_number, university: matricUniv } = body;
      if (!matriculation_number) {
        return Response.json({ error: 'Missing matriculation_number' }, { status: 400 });
      }

      // Only authorized staff can do exact matric lookups
      if (!isStaff) {
        return Response.json({ error: 'Insufficient permissions. Only authorized staff can search by exact matriculation number.', permissionDenied: true }, { status: 403 });
      }

      const matricFilter = { matriculation_number: matriculation_number };
      if (matricUniv) matricFilter.university = matricUniv;

      const records = await base44.asServiceRole.entities.StudentRecord.filter(matricFilter, '-created_date', 20);
      const masked = applyPrivacy(records, user.university);

      return Response.json({ results: masked, count: records.length });
    }

    // ===================== ACTION: check_unique =====================
    // Verify matriculation number uniqueness within a university
    if (action === 'check_unique') {
      const { matriculation_number, university: uniqUniv } = body;
      if (!matriculation_number || !uniqUniv) {
        return Response.json({ error: 'matriculation_number and university are required' }, { status: 400 });
      }

      const existing = await base44.asServiceRole.entities.StudentRecord.filter({
        matriculation_number: matriculation_number,
        university: uniqUniv,
      }, '-created_date', 1);

      const isUnique = existing.length === 0 || (existing.length === 1 && existing[0].user_id === user.id);
      return Response.json({ isUnique, conflict: !isUnique });
    }

    // ===================== ACTION: upsert_record =====================
    // Create or update the caller's StudentRecord (called during onboarding/profile save)
    if (action === 'upsert_record') {
      const { matriculation_number, student_id, faculty, department, level, course_code, matric_privacy, enrollment_year, expected_graduation } = body;
      const fullName = user.full_name || body.full_name;
      const userUniversity = user.university || body.university;

      if (!fullName || !userUniversity) {
        return Response.json({ error: 'full_name and university are required' }, { status: 400 });
      }

      // Check uniqueness if matric number provided
      if (matriculation_number) {
        const existing = await base44.asServiceRole.entities.StudentRecord.filter({
          matriculation_number: matriculation_number,
          university: userUniversity,
        }, '-created_date', 1);

        if (existing.length > 0 && existing[0].user_id !== user.id) {
          return Response.json({ error: 'This matriculation number is already registered for another student at this university.', conflict: true }, { status: 409 });
        }
      }

      // Find existing record for this user
      const existingRecords = await base44.asServiceRole.entities.StudentRecord.filter({
        user_id: user.id,
      }, '-created_date', 1);

      const recordData = {
        user_id: user.id,
        full_name: fullName,
        avatar_url: user.profile_photo || body.avatar_url || null,
        matriculation_number: matriculation_number || null,
        student_id: student_id || null,
        university: userUniversity,
        faculty: faculty || user.faculty || null,
        department: department || user.department || null,
        level: level || user.level || null,
        course_code: course_code || null,
        matric_privacy: matric_privacy || 'university_only',
        enrollment_year: enrollment_year || null,
        expected_graduation: expected_graduation || null,
        status: 'active',
        last_active_at: new Date().toISOString(),
      };

      let record;
      if (existingRecords.length > 0) {
        record = await base44.asServiceRole.entities.StudentRecord.update(existingRecords[0].id, recordData);
      } else {
        record = await base44.asServiceRole.entities.StudentRecord.create(recordData);
      }

      return Response.json({ success: true, record });
    }

    // ===================== ACTION: verify_matric =====================
    // Mark a student's matriculation as verified (authorized staff only)
    if (action === 'verify_matric') {
      if (!isAuthorizedStaff) {
        return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      const { record_id } = body;
      if (!record_id) {
        return Response.json({ error: 'record_id is required' }, { status: 400 });
      }

      const record = await base44.asServiceRole.entities.StudentRecord.update(record_id, {
        is_verified: true,
        verified_at: new Date().toISOString(),
      });

      // Also update the User entity
      if (record.user_id) {
        await base44.asServiceRole.entities.User.update(record.user_id, {
          matriculation_verified: true,
        });
      }

      return Response.json({ success: true, record });
    }

    return Response.json({ error: 'Unknown action: ' + action }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});