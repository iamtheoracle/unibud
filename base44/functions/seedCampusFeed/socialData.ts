/* ── Social Seed Data ──
   Realistic launch content for every social entity.
   All records marked is_seed_content for Orbit-managed replacement. */

const U = 'University of Lagos';

// ── Conversations (with inline messages) ──
export const CONVERSATIONS = [
  { type: 'direct', title: 'Adaeze Okonkwo', avatar_url: '', university: U, is_pinned: true,
    participants: [{ user_id: 'seed_adaeze', name: 'Adaeze Okonkwo', role: 'student', handle: 'Computer Science · 300L' }],
    last_message: { content: 'See you at the library! 📚', author_name: 'Adaeze Okonkwo', type: 'text' },
    messages: [
      { content: 'Hey! Are you done with the CSC 301 assignment?', author_name: 'Adaeze Okonkwo', author_id: 'seed_adaeze', author_role: 'student', type: 'text' },
      { content: 'Almost! Just need to finish the last question. You?', author_name: 'You', author_id: 'seed_me', author_role: 'student', type: 'text' },
      { content: 'Same here. Want to meet at the library later?', author_name: 'Adaeze Okonkwo', author_id: 'seed_adaeze', author_role: 'student', type: 'text' },
      { content: 'Sure! 4 PM?', author_name: 'You', author_id: 'seed_me', author_role: 'student', type: 'text' },
      { content: 'Perfect. See you then! 📚', author_name: 'Adaeze Okonkwo', author_id: 'seed_adaeze', author_role: 'student', type: 'text' },
    ] },
  { type: 'group', title: 'CSC 301 Study Group', avatar_url: '', university: U, faculty: 'Science', department: 'Computer Science', course_code: 'CSC 301',
    participants: [
      { user_id: 'seed_adaeze', name: 'Adaeze Okonkwo', role: 'student', handle: 'CSC · 300L', is_admin: true },
      { user_id: 'seed_tunde', name: 'Tunde Bello', role: 'student', handle: 'MEC · 200L' },
      { user_id: 'seed_fatima', name: 'Fatima Ibrahim', role: 'student', handle: 'Mass Comm · 400L' },
      { user_id: 'seed_david', name: 'David Okafor', role: 'student', handle: 'Civil · 300L' },
    ],
    last_message: { content: 'I shared my notes in the group 📎', author_name: 'Adaeze Okonkwo', type: 'text' },
    messages: [
      { content: 'Guys, the assignment is due Friday. Anyone started?', author_name: 'Tunde Bello', author_id: 'seed_tunde', author_role: 'student', type: 'text' },
      { content: 'I started yesterday. The tree traversal part is tricky', author_name: 'David Okafor', author_id: 'seed_david', author_role: 'student', type: 'text' },
      { content: 'Same! I can explain it if you want', author_name: 'Adaeze Okonkwo', author_id: 'seed_adaeze', author_role: 'student', type: 'text' },
      { content: 'Yes please! 🙏', author_name: 'Fatima Ibrahim', author_id: 'seed_fatima', author_role: 'student', type: 'text' },
      { content: 'I shared my notes in the group 📎', author_name: 'Adaeze Okonkwo', author_id: 'seed_adaeze', author_role: 'student', type: 'text' },
    ] },
  { type: 'lecturer', title: 'Dr. Aminu Sadiq', avatar_url: '', university: U, department: 'Computer Science',
    participants: [{ user_id: 'seed_lecturer1', name: 'Dr. Aminu Sadiq', role: 'lecturer', handle: 'Computer Science · Faculty' }],
    last_message: { content: 'Office hours moved to Wednesday 2-4 PM', author_name: 'Dr. Aminu Sadiq', type: 'text' },
    messages: [
      { content: 'Good morning sir, I had a question about Question 3 in the assignment', author_name: 'You', author_id: 'seed_me', author_role: 'student', type: 'text' },
      { content: 'Sure, come during office hours. Tuesday 10 AM', author_name: 'Dr. Aminu Sadiq', author_id: 'seed_lecturer1', author_role: 'lecturer', type: 'text' },
      { content: 'Thank you sir! I\'ll be there', author_name: 'You', author_id: 'seed_me', author_role: 'student', type: 'text' },
      { content: 'Office hours moved to Wednesday 2-4 PM this week due to a meeting', author_name: 'Dr. Aminu Sadiq', author_id: 'seed_lecturer1', author_role: 'lecturer', type: 'text' },
    ] },
  { type: 'group', title: 'Final Year Project Team', avatar_url: '', university: U,
    participants: [
      { user_id: 'seed_emeka', name: 'Emeka Nwosu', role: 'student', handle: 'EEE · 500L', is_admin: true },
      { user_id: 'seed_zainab', name: 'Zainab Yusuf', role: 'student', handle: 'BCH · 300L' },
      { user_id: 'seed_kunle', name: 'Kunle Adebayo', role: 'student', handle: 'ARC · 400L' },
    ],
    last_message: { content: 'Presentation slides are ready! Check the shared file', author_name: 'Emeka Nwosu', type: 'text' },
    messages: [
      { content: 'Team, our defense is in 3 weeks. We need to finalize the prototype', author_name: 'Emeka Nwosu', author_id: 'seed_emeka', author_role: 'student', type: 'text' },
      { content: 'I\'ve finished the circuit design. Testing tomorrow', author_name: 'Zainab Yusuf', author_id: 'seed_zainab', author_role: 'student', type: 'text' },
      { content: 'I\'ll work on the housing design this weekend', author_name: 'Kunle Adebayo', author_id: 'seed_kunle', author_role: 'student', type: 'text' },
      { content: 'Great progress everyone! 🎉', author_name: 'Emeka Nwosu', author_id: 'seed_emeka', author_role: 'student', type: 'text' },
      { content: 'Presentation slides are ready! Check the shared file', author_name: 'Emeka Nwosu', author_id: 'seed_emeka', author_role: 'student', type: 'text' },
    ] },
  { type: 'direct', title: 'Tunde Bello', avatar_url: '', university: U,
    participants: [{ user_id: 'seed_tunde', name: 'Tunde Bello', role: 'student', handle: 'Mechanical Engineering · 200L' }],
    last_message: { content: '😂😂 that lecturer is too much', author_name: 'Tunde Bello', type: 'text' },
    messages: [
      { content: 'Did you see what happened in MEC 201 today? 😂', author_name: 'Tunde Bello', author_id: 'seed_tunde', author_role: 'student', type: 'text' },
      { content: 'No I missed it. What happened?', author_name: 'You', author_id: 'seed_me', author_role: 'student', type: 'text' },
      { content: 'The prof walked in, looked at the empty seats, and said "If you\'re not here, you\'re not serious" then walked out 😂😂', author_name: 'Tunde Bello', author_id: 'seed_tunde', author_role: 'student', type: 'text' },
      { content: '😂😂 that lecturer is too much', author_name: 'Tunde Bello', author_id: 'seed_tunde', author_role: 'student', type: 'text' },
    ] },
  { type: 'club', title: 'Developers\' Circle', avatar_url: '', university: U,
    participants: [{ user_id: 'seed_devclub', name: 'Developers\' Circle', role: 'club', handle: 'Student Club · 240 members', is_admin: true }],
    last_message: { content: 'Don\'t forget the React workshop on Friday! 💻', author_name: 'Developers\' Circle', type: 'text' },
    messages: [
      { content: 'Reminder: React workshop this Friday 3 PM in CS Lab 3', author_name: 'Developers\' Circle', author_id: 'seed_devclub', author_role: 'club', type: 'text' },
      { content: 'Do we need to install anything beforehand?', author_name: 'You', author_id: 'seed_me', author_role: 'student', type: 'text' },
      { content: 'Just Node.js and VS Code. We\'ll set up the project together', author_name: 'Developers\' Circle', author_id: 'seed_devclub', author_role: 'club', type: 'text' },
      { content: 'Don\'t forget the React workshop on Friday! 💻', author_name: 'Developers\' Circle', author_id: 'seed_devclub', author_role: 'club', type: 'text' },
    ] },
  { type: 'direct', title: 'Fatima Ibrahim', avatar_url: '', university: U,
    participants: [{ user_id: 'seed_fatima', name: 'Fatima Ibrahim', role: 'student', handle: 'Mass Communication · 400L' }],
    last_message: { content: 'Sent you the notes! 📎', author_name: 'Fatima Ibrahim', type: 'text' },
    messages: [
      { content: 'Hey, did you get the Media Ethics notes from Prof Adebayo\'s class?', author_name: 'You', author_id: 'seed_me', author_role: 'student', type: 'text' },
      { content: 'Yes! I took really detailed notes. Want me to share?', author_name: 'Fatima Ibrahim', author_id: 'seed_fatima', author_role: 'student', type: 'text' },
      { content: 'Please! 🙏 You\'re a lifesaver', author_name: 'You', author_id: 'seed_me', author_role: 'student', type: 'text' },
      { content: 'Sent you the notes! 📎', author_name: 'Fatima Ibrahim', author_id: 'seed_fatima', author_role: 'student', type: 'text' },
    ] },
  { type: 'group', title: 'Engineering Football Team', avatar_url: '', university: U,
    participants: [
      { user_id: 'seed_emeka', name: 'Emeka Nwosu', role: 'student', handle: 'EEE · 500L', is_admin: true },
      { user_id: 'seed_david', name: 'David Okafor', role: 'student', handle: 'CIV · 300L' },
      { user_id: 'seed_tunde', name: 'Tunde Bello', role: 'student', handle: 'MEC · 200L' },
    ],
    last_message: { content: 'Match moved to 4 PM due to rain ⚽', author_name: 'Emeka Nwosu', type: 'text' },
    messages: [
      { content: 'Guys, practice at 4 PM today. Don\'t be late', author_name: 'Emeka Nwosu', author_id: 'seed_emeka', author_role: 'student', type: 'text' },
      { content: 'I\'ll be there. Bringing my boots', author_name: 'David Okafor', author_id: 'seed_david', author_role: 'student', type: 'text' },
      { content: 'Same. Is it on the main field?', author_name: 'Tunde Bello', author_id: 'seed_tunde', author_role: 'student', type: 'text' },
      { content: 'Match moved to 4 PM due to rain ⚽', author_name: 'Emeka Nwosu', author_id: 'seed_emeka', author_role: 'student', type: 'text' },
    ] },
  { type: 'study_group', title: 'PHY 203 Exam Prep', avatar_url: '', university: U, course_code: 'PHY 203',
    participants: [
      { user_id: 'seed_blessing', name: 'Blessing Eze', role: 'student', handle: 'Microbiology · 200L', is_admin: true },
      { user_id: 'seed_yusuf', name: 'Yusuf Aliyu', role: 'student', handle: 'Medicine · 400L' },
    ],
    last_message: { content: 'Study session tomorrow 6 AM at the library! 📚', author_name: 'Blessing Eze', type: 'text' },
    messages: [
      { content: 'The PHY 203 midterm is next week. We need to prepare', author_name: 'Blessing Eze', author_id: 'seed_blessing', author_role: 'student', type: 'text' },
      { content: 'I\'ve been reviewing chapters 1-5. What\'s the focus?', author_name: 'Yusuf Aliyu', author_id: 'seed_yusuf', author_role: 'student', type: 'text' },
      { content: 'Mechanics and waves are heavily weighted according to past papers', author_name: 'Blessing Eze', author_id: 'seed_blessing', author_role: 'student', type: 'text' },
      { content: 'Study session tomorrow 6 AM at the library! 📚', author_name: 'Blessing Eze', author_id: 'seed_blessing', author_role: 'student', type: 'text' },
    ] },
  { type: 'direct', title: 'Dr. Grace Eze', avatar_url: '', university: U, department: 'Mathematics',
    participants: [{ user_id: 'seed_lecturer2', name: 'Dr. Grace Eze', role: 'lecturer', handle: 'Mathematics · Faculty' }],
    last_message: { content: 'Additional practice problems uploaded on the portal', author_name: 'Dr. Grace Eze', type: 'text' },
    messages: [
      { content: 'Good afternoon ma, I\'m struggling with integration by parts', author_name: 'You', author_id: 'seed_me', author_role: 'student', type: 'text' },
      { content: 'Have you tried the examples in chapter 5? They walk through it step by step', author_name: 'Dr. Grace Eze', author_id: 'seed_lecturer2', author_role: 'lecturer', type: 'text' },
      { content: 'Not yet. I\'ll check them now. Thank you ma!', author_name: 'You', author_id: 'seed_me', author_role: 'student', type: 'text' },
      { content: 'Additional practice problems uploaded on the portal', author_name: 'Dr. Grace Eze', author_id: 'seed_lecturer2', author_role: 'lecturer', type: 'text' },
    ] },
  { type: 'direct', title: 'Kunle Adebayo', avatar_url: '', university: U,
    participants: [{ user_id: 'seed_kunle', name: 'Kunle Adebayo', role: 'student', handle: 'Architecture · 400L' }],
    last_message: { content: 'The sunset photos came out amazing! 🌅', author_name: 'Kunle Adebayo', type: 'text' },
    messages: [
      { content: 'Bro, that campus photo walk was incredible', author_name: 'Kunle Adebayo', author_id: 'seed_kunle', author_role: 'student', type: 'text' },
      { content: 'I know right! Got some amazing shots', author_name: 'You', author_id: 'seed_me', author_role: 'student', type: 'text' },
      { content: 'Share them in the photography group!', author_name: 'Kunle Adebayo', author_id: 'seed_kunle', author_role: 'student', type: 'text' },
      { content: 'The sunset photos came out amazing! 🌅', author_name: 'Kunle Adebayo', author_id: 'seed_kunle', author_role: 'student', type: 'text' },
    ] },
  { type: 'group', title: 'Room 204 — Moremi Hall', avatar_url: '', university: U,
    participants: [
      { user_id: 'seed_chioma', name: 'Chioma Obi', role: 'student', handle: 'Microbiology · 200L', is_admin: true },
      { user_id: 'seed_adaeze', name: 'Adaeze Okonkwo', role: 'student', handle: 'CSC · 300L' },
    ],
    last_message: { content: 'Who took my indomie 😤😂', author_name: 'Chioma Obi', type: 'text' },
    messages: [
      { content: 'Guys, the water is running! Hurry and fetch!', author_name: 'Chioma Obi', author_id: 'seed_chioma', author_role: 'student', type: 'text' },
      { content: 'Already filled my buckets 😎', author_name: 'Adaeze Okonkwo', author_id: 'seed_adaeze', author_role: 'student', type: 'text' },
      { content: 'Show off 😂', author_name: 'Chioma Obi', author_id: 'seed_chioma', author_role: 'student', type: 'text' },
      { content: 'Who took my indomie 😤😂', author_name: 'Chioma Obi', author_id: 'seed_chioma', author_role: 'student', type: 'text' },
    ] },
  { type: 'direct', title: 'Aisha Mohammed', avatar_url: '', university: U,
    participants: [{ user_id: 'seed_aisha', name: 'Aisha Mohammed', role: 'student', handle: 'Law · 500L' }],
    last_message: { content: 'Good luck with the exam tomorrow! 💪', author_name: 'Aisha Mohammed', type: 'text' },
    messages: [
      { content: 'Are you going to the career fair next week?', author_name: 'Aisha Mohammed', author_id: 'seed_aisha', author_role: 'student', type: 'text' },
      { content: 'Definitely! I need to get my CV reviewed', author_name: 'You', author_id: 'seed_me', author_role: 'student', type: 'text' },
      { content: 'Same. See you there!', author_name: 'Aisha Mohammed', author_id: 'seed_aisha', author_role: 'student', type: 'text' },
      { content: 'Good luck with the exam tomorrow! 💪', author_name: 'Aisha Mohammed', author_id: 'seed_aisha', author_role: 'student', type: 'text' },
    ] },
  { type: 'mentor', title: 'Alumni Mentor — Tech', avatar_url: '', university: U,
    participants: [{ user_id: 'seed_mentor1', name: 'Chidi Okeke', role: 'alumni', handle: 'Software Engineer · Google' }],
    last_message: { content: 'Keep building! Your portfolio looks great', author_name: 'Chidi Okeke', type: 'text' },
    messages: [
      { content: 'Hi Chidi, thanks for agreeing to mentor me!', author_name: 'You', author_id: 'seed_me', author_role: 'student', type: 'text' },
      { content: 'My pleasure! Tell me about your goals', author_name: 'Chidi Okeke', author_id: 'seed_mentor1', author_role: 'alumni', type: 'text' },
      { content: 'I want to become a software engineer at a top tech company', author_name: 'You', author_id: 'seed_me', author_role: 'student', type: 'text' },
      { content: 'Great goal. Start by building real projects and contributing to open source', author_name: 'Chidi Okeke', author_id: 'seed_mentor1', author_role: 'alumni', type: 'text' },
      { content: 'Keep building! Your portfolio looks great', author_name: 'Chidi Okeke', author_id: 'seed_mentor1', author_role: 'alumni', type: 'text' },
    ] },
  { type: 'department', title: 'Computer Science Department', avatar_url: '', university: U, department: 'Computer Science',
    participants: [{ user_id: 'seed_csdept', name: 'Department of Computer Science', role: 'admin', handle: 'Faculty of Science', is_admin: true }],
    last_message: { content: 'New course CSC 415 — Machine Learning now available for registration', author_name: 'Department of Computer Science', type: 'text' },
    messages: [
      { content: 'Registration closes August 14th. Late registration incurs ₦10,000 fee', author_name: 'Department of Computer Science', author_id: 'seed_csdept', author_role: 'admin', type: 'text' },
      { content: 'Lab schedule for CSC 301 practicals is now posted', author_name: 'Department of Computer Science', author_id: 'seed_csdept', author_role: 'admin', type: 'text' },
      { content: 'New course CSC 415 — Machine Learning now available for registration', author_name: 'Department of Computer Science', author_id: 'seed_csdept', author_role: 'admin', type: 'text' },
    ] },
  { type: 'direct', title: 'David Okafor', avatar_url: '', university: U,
    participants: [{ user_id: 'seed_david', name: 'David Okafor', role: 'student', handle: 'Civil Engineering · 300L' }],
    last_message: { content: 'Our bridge design passed the structural analysis! 🌉', author_name: 'David Okafor', type: 'text' },
    messages: [
      { content: 'How\'s the CVE 301 project going?', author_name: 'You', author_id: 'seed_me', author_role: 'student', type: 'text' },
      { content: 'Good! We\'re testing the bridge model this week', author_name: 'David Okafor', author_id: 'seed_david', author_role: 'student', type: 'text' },
      { content: 'Our bridge design passed the structural analysis! 🌉', author_name: 'David Okafor', author_id: 'seed_david', author_role: 'student', type: 'text' },
    ] },
];

// ── Campus Events ──
export const CAMPUS_EVENTS = [
  { title: 'Annual Career Fair 2026', type: 'career_fair', date: '2026-08-14', start_time: '09:00', end_time: '16:00', location: 'Main Auditorium', description: '40+ companies including tech giants, banks, and startups recruiting interns and graduates. Bring printed CVs!', organizer_name: 'Career Services Centre', organizer_type: 'university', is_featured: true, is_free: true, capacity: 2000, attendees_count: 847, status: 'upcoming', banner_url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800', university: U },
  { title: 'UNIBUD Hackathon 2026', type: 'hackathon', date: '2026-08-21', start_time: '17:00', end_time: '17:00', location: 'Innovation Hub', description: '48 hours of coding, innovation, and prizes! Theme: Education for the Next Billion.', organizer_name: 'Developers\' Circle', organizer_type: 'club', is_featured: true, is_free: true, capacity: 200, attendees_count: 156, status: 'upcoming', university: U },
  { title: 'Cultural Festival 2026', type: 'cultural', date: '2026-08-22', start_time: '12:00', end_time: '18:00', location: 'Sports Complex Grounds', description: 'A celebration of Nigerian heritage through music, dance, food, and art.', organizer_name: 'Student Union Government', organizer_type: 'sug', is_featured: true, is_free: true, capacity: 5000, attendees_count: 2100, status: 'upcoming', university: U },
  { title: 'Inter-Faculty Football Tournament', type: 'sports', date: '2026-08-07', start_time: '16:00', end_time: '18:00', location: 'University Sports Complex', description: 'Engineering vs Science in the opening match. Free entry with student ID.', organizer_name: 'University Sports Council', organizer_type: 'university', is_free: true, capacity: 3000, attendees_count: 1200, status: 'upcoming', university: U },
  { title: 'Guest Lecture: The Future of AI in Africa', type: 'guest_lecture', date: '2026-08-07', start_time: '14:00', end_time: '16:00', location: 'Main Lecture Theatre', description: 'By Dr. Chukwuemeka Nwula, Head of AI at a leading fintech. Exploring how AI solves African problems.', organizer_name: 'Department of Computer Science', organizer_type: 'department', is_free: true, capacity: 500, attendees_count: 320, status: 'upcoming', university: U },
  { title: 'Engineering Faculty Dinner & Awards', type: 'social', date: '2026-08-19', start_time: '18:00', end_time: '21:00', location: 'Faculty Quadrangle', description: 'Celebrating outstanding students, researchers, and staff. Live music, awards, and networking.', organizer_name: 'Faculty of Engineering', organizer_type: 'faculty', is_free: false, price: 2000, capacity: 300, attendees_count: 180, status: 'upcoming', university: U },
  { title: 'UNIBUD Live in Concert', type: 'social', date: '2026-08-29', start_time: '19:00', end_time: '22:00', location: 'Sports Complex', description: 'Featuring top artists and the best student performers. The biggest campus event of the year!', organizer_name: 'Student Union Government', organizer_type: 'sug', is_featured: true, is_free: false, price: 1000, capacity: 5000, attendees_count: 3200, status: 'upcoming', university: U },
  { title: 'Alumni-Student Networking Mixer', type: 'social', date: '2026-08-16', start_time: '16:00', end_time: '19:00', location: 'Alumni Centre', description: 'Connect with successful graduates. Get mentorship, career advice, and internship leads.', organizer_name: 'Alumni Association', organizer_type: 'university', is_free: true, capacity: 200, attendees_count: 140, status: 'upcoming', university: U },
  { title: 'Science Week 2026', type: 'department_seminar', date: '2026-08-17', start_time: '09:00', end_time: '17:00', location: 'Science Faculty', description: 'Departmental exhibitions, lab tours, student research presentations, and keynote.', organizer_name: 'Faculty of Science', organizer_type: 'faculty', is_free: true, capacity: 1000, attendees_count: 450, status: 'upcoming', university: U },
  { title: 'Financial Literacy Seminar', type: 'workshop', date: '2026-08-12', start_time: '15:00', end_time: '17:00', location: 'MBA Theatre', description: 'Learn budgeting, saving, investing, and money management while in school.', organizer_name: 'Faculty of Business Administration', organizer_type: 'faculty', is_free: true, capacity: 300, attendees_count: 190, status: 'upcoming', university: U },
  { title: 'Digital Skills Workshop', type: 'workshop', date: '2026-08-13', start_time: '10:00', end_time: '12:00', location: 'ICT Training Lab', description: 'Learn Google Workspace, data analysis, and presentation skills. Certificate included!', organizer_name: 'ICT Department', organizer_type: 'university', is_free: true, capacity: 100, attendees_count: 78, status: 'upcoming', university: U },
  { title: 'Free Health Check-up Day', type: 'social', date: '2026-08-18', start_time: '09:00', end_time: '15:00', location: 'Health Centre', description: 'Blood pressure, BMI, blood sugar, and wellness checks. Completely free for all students.', organizer_name: 'University Health Centre', organizer_type: 'university', is_free: true, capacity: 500, attendees_count: 120, status: 'upcoming', university: U },
  { title: 'Tree Planting Drive', type: 'social', date: '2026-08-17', start_time: '08:00', end_time: '12:00', location: 'Main Gate', description: 'Join us in greening our campus. 200 trees to plant. Gloves and tools provided.', organizer_name: 'Volunteers for Change', organizer_type: 'club', is_free: true, capacity: 100, attendees_count: 65, status: 'upcoming', university: U },
  { title: 'Research Symposium', type: 'research_conference', date: '2026-08-25', start_time: '09:00', end_time: '15:00', location: 'Science Lecture Theatre', description: 'Undergraduate students present their research projects. Over 50 projects on display.', organizer_name: 'Faculty of Science', organizer_type: 'faculty', is_free: true, capacity: 400, attendees_count: 180, status: 'upcoming', university: U },
  { title: 'Inter-University Debate Championship', type: 'competition', date: '2026-08-20', start_time: '10:00', end_time: '14:00', location: 'Main Auditorium', description: 'Watch our team compete against 15 other universities. Come support!', organizer_name: 'Debate Society', organizer_type: 'club', is_free: true, capacity: 500, attendees_count: 230, status: 'upcoming', university: U },
];

// ── Clubs ──
export const CLUBS = [
  { name: 'Developers\' Circle', category: 'programming', description: 'The premier tech community on campus. We build, learn, and ship together. Weekly workshops, hackathons, and project teams.', university: U, members_count: 240, is_verified: true, is_recruiting: true, president: 'Adaeze Okonkwo', meeting_schedule: 'Fridays 3 PM, CS Lab 3', icon: 'Code', tags: ['coding','hackathon','workshop','tech'], accent_color: '221 83% 53%', logo_url: '' },
  { name: 'Debate Society', category: 'debate', description: 'We argue constructively and win. National award-winning debaters. All levels welcome.', university: U, members_count: 85, is_recruiting: true, president: 'Aisha Mohammed', meeting_schedule: 'Thursdays 4 PM, Room A201', icon: 'MessageSquare', tags: ['debate','public-speaking','competition'], accent_color: '251 90% 67%' },
  { name: 'Lens & Light Photography', category: 'photography', description: 'Capturing campus life through our lenses. Photo walks, exhibitions, and workshops.', university: U, members_count: 120, is_recruiting: true, president: 'Kunle Adebayo', meeting_schedule: 'Saturdays 8 AM, Main Gate', icon: 'Camera', tags: ['photography','exhibition','photo-walk'], accent_color: '46 74% 55%' },
  { name: 'Robotics Club', category: 'robotics', description: 'Building the future, one robot at a time. National Robotics Competition team.', university: U, members_count: 60, is_recruiting: true, president: 'David Okafor', meeting_schedule: 'Saturdays 10 AM, Engineering Workshop', icon: 'Bot', tags: ['robotics','engineering','competition','innovation'], accent_color: '142 71% 45%' },
  { name: 'Music Society', category: 'music', description: 'Choir, band, and soloists. We make music that moves the campus.', university: U, members_count: 95, is_recruiting: true, president: 'Blessing Eze', meeting_schedule: 'Tuesdays/Wednesdays/Fridays, Music Room', icon: 'Music', tags: ['music','concert','choir','band'], accent_color: '251 90% 67%' },
  { name: 'Dance Troupe', category: 'dance', description: 'Contemporary, hip-hop, traditional, and afrobeat. We move with purpose.', university: U, members_count: 45, is_recruiting: true, president: 'Fatima Ibrahim', meeting_schedule: 'Fridays 4 PM, Sports Complex Hall B', icon: 'Footprints', tags: ['dance','choreography','afrobeat','performance'], accent_color: '251 90% 67%' },
  { name: 'Drama Club', category: 'drama', description: 'Theatre productions, improvisation, and stagecraft. Semester production: The Gods Are Not to Blame.', university: U, members_count: 70, is_recruiting: true, president: 'Zainab Yusuf', meeting_schedule: 'Saturdays 2 PM, Arts Theatre', icon: 'Drama', tags: ['theatre','acting','production','drama'], accent_color: '251 90% 67%' },
  { name: 'Volunteers for Change', category: 'volunteer', description: 'Making a difference in our community. Outreach, cleanup drives, and mentorship.', university: U, members_count: 130, is_recruiting: true, president: 'Chioma Obi', meeting_schedule: 'Saturdays 9 AM, Student Centre', icon: 'HeartHandshake', tags: ['volunteer','community','outreach','service'], accent_color: '142 71% 45%' },
  { name: 'Entrepreneurship Hub', category: 'entrepreneurship', description: 'For student founders and aspiring entrepreneurs. Mentorship, funding, and co-working space.', university: U, members_count: 180, is_verified: true, is_recruiting: true, president: 'Emeka Nwosu', meeting_schedule: 'Daily 8 AM - 8 PM, Innovation Hub', icon: 'Rocket', tags: ['startup','entrepreneurship','innovation','funding'], accent_color: '221 83% 53%' },
  { name: 'UNILAG Warriors FC', category: 'sports', description: 'University football team. Inter-faculty champions 3 years running.', university: U, members_count: 35, is_verified: true, is_recruiting: false, president: 'Emeka Nwosu', meeting_schedule: 'Mon/Wed/Fri 4 PM, Sports Complex', icon: 'Trophy', tags: ['football','sports','team','competition'], accent_color: '0 84% 60%' },
  { name: 'UNILAG Tigers', category: 'sports', description: 'University basketball team. Looking for guards and forwards!', university: U, members_count: 20, is_recruiting: true, president: 'David Okafor', meeting_schedule: 'Tue/Thu 4 PM, Indoor Sports Hall', icon: 'Dribbble', tags: ['basketball','sports','team'], accent_color: '221 83% 53%' },
  { name: 'Christian Fellowship', category: 'other', description: 'Worship, word, and warm community. All denominations welcome.', university: U, members_count: 350, is_recruiting: true, president: 'Blessing Eze', meeting_schedule: 'Fridays 6 PM, Chapel of Peace', icon: 'Church', tags: ['fellowship','faith','worship','community'], accent_color: '46 74% 55%' },
  { name: 'Muslim Students\' Society', category: 'other', description: 'Faith, learning, and brotherhood. Jumu\'ah prayers and weekly halaqas.', university: U, members_count: 400, is_recruiting: true, president: 'Yusuf Aliyu', meeting_schedule: 'Fridays 1 PM, Central Mosque', icon: 'Moon', tags: ['fellowship','faith','islam','community'], accent_color: '142 71% 45%' },
  { name: 'Science Club', category: 'science', description: 'Exploring the wonders of science. Lab tours, experiments, and science fairs.', university: U, members_count: 90, is_recruiting: true, president: 'Zainab Yusuf', meeting_schedule: 'Wednesdays 3 PM, Science Block', icon: 'FlaskConical', tags: ['science','experiments','research'], accent_color: '142 71% 45%' },
  { name: 'Literary Society', category: 'literary', description: 'For lovers of words. Poetry, prose, creative writing, and spoken word.', university: U, members_count: 55, is_recruiting: true, president: 'Fatima Ibrahim', meeting_schedule: 'Thursdays 5 PM, Arts Block', icon: 'BookOpen', tags: ['literature','writing','poetry','creativity'], accent_color: '251 90% 67%' },
];

// ── Marketplace Listings ──
export const MARKETPLACE_LISTINGS = [
  { title: 'CSC 301 Textbook — Data Structures & Algorithms', description: 'Like new. Covers everything for CSC 301. Has highlighted sections but very clean. Original price ₦8,500.', price: 4000, category: 'textbooks', condition: 'like_new', seller_name: 'Adaeze Okonkwo', contact: 'DM on UNIBUD', status: 'active', location: 'Moremi Hall', is_verified: false, images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600'] },
  { title: 'Scientific Calculator — Casio fx-991EX', description: 'Perfect condition. Used for 2 semesters. Great for engineering and science students.', price: 5000, category: 'electronics', condition: 'good', seller_name: 'Tunde Bello', contact: 'WhatsApp: 08012345678', status: 'active', location: 'Jaja Hall', is_verified: false, images: ['https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=600'] },
  { title: 'HP Laptop — 8GB RAM, 256GB SSD', description: 'Great for coding and assignments. Intel i5, 8GB RAM, 256GB SSD. Battery still good. Reasonable offers considered.', price: 180000, category: 'electronics', condition: 'good', seller_name: 'Emeka Nwosu', contact: 'DM on UNIBUD', status: 'active', location: 'Off-campus', is_verified: true, images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600'] },
  { title: 'Mechanical Engineering Textbooks (Set of 4)', description: 'Thermodynamics, Fluid Mechanics, Strength of Materials, and Engineering Mathematics. All in good condition.', price: 12000, category: 'textbooks', condition: 'good', seller_name: 'David Okafor', contact: 'WhatsApp: 08098765432', status: 'active', location: 'Engineering Block', is_verified: false },
  { title: 'Room Heater — Electric', description: 'Keeps you warm during harmattan. Works perfectly. Moving out so selling cheap.', price: 3500, category: 'furniture', condition: 'good', seller_name: 'Chioma Obi', contact: 'DM on UNIBUD', status: 'active', location: 'Moremi Hall' },
  { title: 'Mathematics Tutoring — 100L & 200L', description: 'I scored an A in MTH 201. I can help you understand calculus, linear algebra, and discrete math. ₦2,000/hour.', price: 2000, category: 'tutoring', condition: 'new', seller_name: 'Blessing Eze', contact: 'DM on UNIBUD', status: 'active', location: 'Library', is_verified: true },
  { title: 'Concert Ticket — UNIBUD Live', description: 'Bought 2 but my friend can\'t make it. Selling one at face value. ₦1,000.', price: 1000, category: 'tickets', condition: 'new', seller_name: 'Kunle Adebayo', contact: 'WhatsApp: 08055554321', status: 'active', location: 'Sports Complex' },
  { title: 'Arduino Starter Kit', description: 'Complete kit with sensors, motors, and breadboard. Perfect for robotics and engineering projects.', price: 8000, category: 'electronics', condition: 'like_new', seller_name: 'David Okafor', contact: 'DM on UNIBUD', status: 'active', location: 'Engineering Workshop', is_verified: false, images: ['https://images.unsplash.com/photo-1564725074056-1bec5c8a4583?w=600'] },
  { title: 'Law Textbooks — Constitutional & Maritime Law', description: 'Two core textbooks for Law students. Barely used. Original price ₦15,000 each.', price: 10000, category: 'textbooks', condition: 'like_new', seller_name: 'Aisha Mohammed', contact: 'DM on UNIBUD', status: 'active', location: 'Law Library' },
  { title: 'Free: Giving Away Notes & Past Questions', description: 'I\'m graduating! All my CSC 301-401 notes, past questions, and lab manuals. Free to whoever needs them.', price: 0, category: 'textbooks', condition: 'good', is_free: true, seller_name: 'Emeka Nwosu', contact: 'DM on UNIBUD', status: 'active', location: 'Engineering Block' },
  { title: 'Bedside Reading Lamp', description: 'LED reading lamp with USB charging port. Great for late-night study sessions.', price: 2500, category: 'furniture', condition: 'good', seller_name: 'Zainab Yusuf', contact: 'DM on UNIBUD', status: 'active', location: 'Amina Hall' },
  { title: 'Graphing Notebook Set (5)', description: 'Engineering graph paper notebooks. Never used. Selling as a set.', price: 1500, category: 'textbooks', condition: 'new', seller_name: 'Tunde Bello', contact: 'WhatsApp: 08012345678', status: 'active', location: 'Jaja Hall' },
  { title: 'Portable Power Bank — 20,000mAh', description: 'Fast charging, dual USB. Essential for campus life when NEPA strikes. Barely used.', price: 8000, category: 'electronics', condition: 'like_new', seller_name: 'Fatima Ibrahim', contact: 'DM on UNIBUD', status: 'active', location: 'Moremi Hall', is_verified: false, images: ['https://images.unsplash.com/photo-1609592424823-2dbe1c3a8e72?w=600'] },
  { title: 'CV Review & Career Coaching', description: 'HR professional offering CV reviews and interview prep. 1-hour session. ₦3,000.', price: 3000, category: 'services', condition: 'new', seller_name: 'Daniel Eyo', contact: 'DM on UNIBUD', status: 'active', location: 'Career Centre', is_verified: true },
  { title: 'Bicycle — Mountain Bike', description: 'Great for getting around campus quickly. 21-speed, good brakes. Needs new tires soon.', price: 15000, category: 'furniture', condition: 'fair', seller_name: 'Yusuf Aliyu', contact: 'WhatsApp: 08011112222', status: 'active', location: 'Sports Complex', images: ['https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=600'] },
];

// ── Stories ──
const IMG = (q) => `https://images.unsplash.com/${q}?w=600`;
export const STORIES = [
  { author_name: 'Adaeze Okonkwo', author_role: 'student', author_handle: 'Computer Science · 300L', is_verified: false, type: 'photo', media_url: IMG('photo-1495616811223-4d98c6e9c869'), content: 'Library sessions hit different at 6 AM 📚✨', hashtags: ['#StudyLife','#MorningGrind'], views_count: 234, replies_count: 12, reactions: { like: 45, love: 12, celebrate: 8 }, status: 'active', university: U, is_highlight: false },
  { author_name: 'Kunle Adebayo', author_role: 'student', author_handle: 'Architecture · 400L', is_verified: false, type: 'photo', media_url: IMG('photo-1517649763962-0c623066013b'), content: 'Golden hour at the sports complex 🌅', hashtags: ['#CampusPhotography','#GoldenHour'], views_count: 412, replies_count: 28, reactions: { like: 89, love: 34, celebrate: 15 }, status: 'active', university: U, is_highlight: true, highlight_category: 'campus' },
  { author_name: 'Developers\' Circle', author_role: 'club', author_handle: 'Student Club · 240 members', is_verified: true, type: 'event', media_url: IMG('photo-1531482615713-2afd69097998'), content: 'React Workshop this Friday! Are you coming? 💻', hashtags: ['#ReactWorkshop','#DevCircle'], views_count: 567, replies_count: 45, reactions: { like: 120, celebrate: 30 }, status: 'active', university: U, poll_data: { question: 'Are you coming to the workshop?', options: [{ id: 'o1', text: 'Yes! 💯', votes: 89 }, { id: 'o2', text: 'Maybe 🤔', votes: 23 }, { id: 'o3', text: 'Can\'t make it 😢', votes: 12 }] } },
  { author_name: 'Emeka Nwosu', author_role: 'student', author_handle: 'Electrical Engineering · 500L', is_verified: false, type: 'achievement', media_url: IMG('photo-1523050854058-8df90110c9f1'), content: '2nd place at the National Engineering Innovation Challenge! 🏆', hashtags: ['#Achievement','#Engineering'], views_count: 678, replies_count: 56, reactions: { like: 150, love: 45, celebrate: 89, insightful: 12 }, status: 'active', university: U, is_highlight: true, highlight_category: 'competitions' },
  { author_name: 'Blessing Eze', author_role: 'student', author_handle: 'Biochemistry · 300L', is_verified: false, type: 'study_session', media_url: IMG('photo-1456513080510-7bf3a84b82f8'), content: '6 AM study gang! Who else is up? ☀️📚', hashtags: ['#StudySession','#6AMGang'], views_count: 189, replies_count: 15, reactions: { like: 34, celebrate: 8 }, status: 'active', university: U },
  { author_name: 'Fatima Ibrahim', author_role: 'student', author_handle: 'Mass Communication · 400L', is_verified: false, type: 'campus_moment', media_url: IMG('photo-1492684223066-81342ee5ff30'), content: 'Campus at night is magical ✨', hashtags: ['#CampusLife','#NightVibes'], views_count: 345, replies_count: 22, reactions: { like: 67, love: 23 }, status: 'active', university: U },
  { author_name: 'Student Union Government', author_role: 'admin', author_handle: 'SUG · Official', is_verified: true, type: 'event', media_url: IMG('photo-1533174072545-7a4b6ad7a6c3'), content: 'Cultural Festival is coming! August 22nd. Save the date! 🎭🇳🇬', hashtags: ['#CulturalDay','#CampusTradition'], views_count: 890, replies_count: 67, reactions: { like: 234, celebrate: 89, love: 45 }, status: 'active', university: U },
  { author_name: 'David Okafor', author_role: 'student', author_handle: 'Civil Engineering · 300L', is_verified: false, type: 'project', media_url: IMG('photo-1581093588401-fbb62a02f120'), content: 'Our bridge model held 50kg without deflection! 🌉', hashtags: ['#Engineering','#CivilEngineering','#ProjectWin'], views_count: 234, replies_count: 18, reactions: { like: 56, celebrate: 23, insightful: 12 }, status: 'active', university: U, is_highlight: true, highlight_category: 'projects' },
  { author_name: 'Chioma Obi', author_role: 'student', author_handle: 'Microbiology · 200L', is_verified: false, type: 'text', content: 'When NEPA takes light 5 minutes before your submission 😅', background_color: 'linear-gradient(135deg, #1a1a2e, #16213e)', views_count: 456, replies_count: 34, reactions: { like: 120, celebrate: 12, funny: 89 }, status: 'active', university: U, hashtags: ['#Relatable','#NEPA','#CampusStruggles'] },
  { author_name: 'Zainab Yusuf', author_role: 'student', author_handle: 'Biochemistry · 300L', is_verified: false, type: 'photo', media_url: IMG('photo-1488190211105-8b0e65b80b7e'), content: 'Best jollof on campus? I think so 😋', hashtags: ['#Foodie','#CampusEats'], views_count: 389, replies_count: 45, reactions: { like: 78, love: 34 }, status: 'active', university: U },
  { author_name: 'Dr. Aminu Sadiq', author_role: 'lecturer', author_handle: 'Computer Science · Faculty', is_verified: true, type: 'text', content: 'Reminder: Office hours Wednesday 2-4 PM. My door is always open! 🚪', background_color: 'linear-gradient(135deg, #0f3460, #16537e)', views_count: 234, replies_count: 8, reactions: { like: 45, insightful: 23 }, status: 'active', university: U },
  { author_name: 'Yusuf Aliyu', author_role: 'student', author_handle: 'Medicine · 400L', is_verified: false, type: 'photo', media_url: IMG('photo-1576091160550-2173dba999ef'), content: 'First day of clinical rotations! Let\'s go 👨🏾‍⚕️', hashtags: ['#MedSchool','#ClinicalRotation'], views_count: 345, replies_count: 28, reactions: { like: 89, celebrate: 45, love: 12 }, status: 'active', university: U },
  { author_name: 'Aisha Mohammed', author_role: 'student', author_handle: 'Law · 500L', is_verified: false, type: 'text', content: 'Constitutional Law is eating me alive ⚖️📚 Send help (and case notes)', background_color: 'linear-gradient(135deg, #2c1810, #4a2c1a)', views_count: 289, replies_count: 23, reactions: { like: 67, funny: 34, insightful: 8 }, status: 'active', university: U, hashtags: ['#LawSchool','#Struggles'] },
  { author_name: 'Lens & Light Photography', author_role: 'club', author_handle: 'Student Club · 120 members', is_verified: false, type: 'photo', media_url: IMG('photo-1452587925148-ce544e77ee70'), content: 'Photo walk this weekend! Join us 📷', hashtags: ['#PhotoWalk','#Photography'], views_count: 312, replies_count: 28, reactions: { like: 56, celebrate: 12 }, status: 'active', university: U },
  { author_name: 'Tunde Bello', author_role: 'student', author_handle: 'Mechanical Engineering · 200L', is_verified: false, type: 'photo', media_url: IMG('photo-1581092160562-40aa08e78837'), content: 'Workshop life 🔧 When the lathe works perfectly', hashtags: ['#EngineeringLife','#Workshop'], views_count: 178, replies_count: 12, reactions: { like: 34, celebrate: 8 }, status: 'active', university: U },
  { author_name: 'Adaeze Okonkwo', author_role: 'student', author_handle: 'Computer Science · 300L', is_verified: false, type: 'achievement', media_url: IMG('photo-1522071820081-009f0129c71c'), content: 'Dean\'s List! CGPA 4.82 🌟 Hard work pays off!', hashtags: ['#DeansList','#AcademicExcellence'], views_count: 567, replies_count: 45, reactions: { like: 134, celebrate: 78, love: 34, insightful: 12 }, status: 'active', university: U, is_highlight: true, highlight_category: 'academic' },
  { author_name: 'Kunle Adebayo', author_role: 'student', author_handle: 'Architecture · 400L', is_verified: false, type: 'photo', media_url: IMG('photo-1431540015161-0bf868a2d407'), content: 'Studio nights are the best nights 📐✨', hashtags: ['#Architecture','#StudioLife'], views_count: 234, replies_count: 15, reactions: { like: 45, love: 12 }, status: 'active', university: U },
  { author_name: 'Volunteers for Change', author_role: 'club', author_handle: 'Student Club · 130 members', is_verified: false, type: 'photo', media_url: IMG('photo-1488521787991-ed7bbaae773c'), content: '45 students showed up for the cleanup! 🌍💚', hashtags: ['#Volunteer','#CommunityService','#Cleanup'], views_count: 345, replies_count: 23, reactions: { like: 89, celebrate: 34, love: 23 }, status: 'active', university: U },
  { author_name: 'Daniel Eyo', author_role: 'student', author_handle: 'Chemical Engineering · 500L', is_verified: false, type: 'text', content: 'Final year is humbling. 47 days to graduation! 🎓', background_color: 'linear-gradient(135deg, #1a1a2e, #0f3460)', views_count: 423, replies_count: 34, reactions: { like: 98, celebrate: 45, love: 23 }, status: 'active', university: U, hashtags: ['#FinalYear','#GraduationCountdown'] },
  { author_name: 'Blessing Eze', author_role: 'student', author_handle: 'Biochemistry · 300L', is_verified: false, type: 'study_session', media_url: IMG('photo-1513258496099-48168024aec0'), content: 'Group study saved my GPA. Find your tribe! 📚🤝', hashtags: ['#StudyGroup','#StudyTips'], views_count: 267, replies_count: 19, reactions: { like: 56, insightful: 23, celebrate: 12 }, status: 'active', university: U },
  { author_name: 'UNILAG Warriors FC', author_role: 'club', author_handle: 'University Football Team', is_verified: true, type: 'event', media_url: IMG('photo-1517466787929-bc90951d0974'), content: 'Match day! ⚽ Warriors vs Science Faculty. 4 PM. Be there! 🔥', hashtags: ['#Football','#MatchDay','#WarriorsFC'], views_count: 489, replies_count: 34, reactions: { like: 120, celebrate: 45 }, status: 'active', university: U },
  { author_name: 'Emeka Nwosu', author_role: 'student', author_handle: 'Electrical Engineering · 500L', is_verified: false, type: 'graduation', media_url: IMG('photo-1523050854058-8df90110c9f1'), content: '47 days. It went by too fast 🎓', hashtags: ['#Graduation','#FinalYear'], views_count: 345, replies_count: 28, reactions: { like: 78, love: 34, celebrate: 23 }, status: 'active', university: U, is_highlight: true, highlight_category: 'graduation' },
  { author_name: 'Adaeze Okonkwo', author_role: 'student', author_handle: 'Computer Science · 300L', is_verified: false, type: 'photo', media_url: IMG('photo-1571263836787-6254c3a8a4f5'), content: 'Got the internship! 🎉 Never give up! 💻', hashtags: ['#Internship','#SuccessStory','#NeverGiveUp'], views_count: 678, replies_count: 56, reactions: { like: 156, celebrate: 89, love: 45, insightful: 12 }, status: 'active', university: U, is_highlight: true, highlight_category: 'academic' },
  { author_name: 'Robotics Club', author_role: 'club', author_handle: 'Student Club · 60 members', is_verified: false, type: 'project', media_url: IMG('photo-1485827404703-89b55fcc595e'), content: 'Our line-following robot is ready for competition! 🤖', hashtags: ['#Robotics','#Innovation','#Competition'], views_count: 234, replies_count: 18, reactions: { like: 56, celebrate: 23, insightful: 12 }, status: 'active', university: U },
];

// ── Study Groups ──
export const STUDY_GROUPS = [
  { name: 'CSC 301 — Data Structures Study Group', description: 'Weekly sessions covering trees, graphs, hash tables, and algorithms. All levels welcome!', type: 'course', room_type: 'video', host_name: 'Adaeze Okonkwo', subject: 'Computer Science', course_code: 'CSC 301', department: 'Computer Science', faculty: 'Science', university: U, members_count: 24, max_members: 30, status: 'active', accent_color: '221 83% 53%', tags: ['data-structures','algorithms','csc301'] },
  { name: 'MTH 201 — Mathematical Methods', description: 'Calculus, linear algebra, and differential equations. We solve problems together every week.', type: 'exam_revision', room_type: 'video', host_name: 'Blessing Eze', subject: 'Mathematics', course_code: 'MTH 201', department: 'Mathematics', faculty: 'Science', university: U, members_count: 18, max_members: 25, status: 'active', tags: ['calculus','linear-algebra','exam-prep'] },
  { name: 'PHY 203 — Physics Midterm Prep', description: 'Mechanics, waves, and optics. Past paper review sessions.', type: 'exam_revision', room_type: 'voice', host_name: 'Yusuf Aliyu', subject: 'Physics', course_code: 'PHY 203', department: 'Physics', faculty: 'Science', university: U, members_count: 15, max_members: 20, status: 'active', tags: ['physics','mechanics','exam-prep'] },
  { name: 'EEE 301 — Circuit Theory', description: 'Circuit analysis, transfer functions, and op-amps. Lab prep included.', type: 'course', room_type: 'video', host_name: 'Emeka Nwosu', subject: 'Electrical Engineering', course_code: 'EEE 301', department: 'Electrical Engineering', faculty: 'Engineering', university: U, members_count: 12, max_members: 20, status: 'active', tags: ['circuits','electronics','eee301'] },
  { name: 'Final Year Project — Solar Water Purification', description: 'Project team working on solar-powered water purification system. 2nd place at National Innovation Challenge!', type: 'project_team', room_type: 'video', host_name: 'Emeka Nwosu', subject: 'Engineering', department: 'Electrical Engineering', faculty: 'Engineering', university: U, members_count: 4, max_members: 6, status: 'active', tags: ['project','innovation','solar','water'] },
  { name: 'Law — Constitutional Law Revision', description: 'Case law review and exam preparation. All law students welcome.', type: 'exam_revision', room_type: 'voice', host_name: 'Aisha Mohammed', subject: 'Law', course_code: 'LAW 501', department: 'Law', faculty: 'Law', university: U, members_count: 22, max_members: 30, status: 'active', tags: ['law','constitutional','exam-prep'] },
  { name: 'BIO 201 — Biochemistry Study', description: 'Enzymes, metabolism, and molecular biology. Weekly quiz sessions.', type: 'course', room_type: 'video', host_name: 'Zainab Yusuf', subject: 'Biochemistry', course_code: 'BIO 201', department: 'Biochemistry', faculty: 'Science', university: U, members_count: 16, max_members: 25, status: 'active', tags: ['biochemistry','enzymes','study'] },
  { name: 'Coding Bootcamp — Web Dev Track', description: 'HTML, CSS, JavaScript, and React. Build real projects. Beginners welcome!', type: 'public', room_type: 'video', host_name: 'Adaeze Okonkwo', subject: 'Programming', department: 'Computer Science', faculty: 'Science', university: U, members_count: 45, max_members: 50, status: 'active', tags: ['web-dev','javascript','react','beginners'] },
];

// ── Communities ──
export const COMMUNITIES = [
  { name: 'Computer Science — Class of 2027', type: 'department', description: 'The official community for Computer Science students. Announcements, discussions, and resources.', university: U, faculty: 'Science', department: 'Computer Science', members_count: 320, is_official: true, is_verified: true, icon: 'Code', accent_color: '221 83% 53%', rules: ['Be respectful','No spam','Keep discussions relevant to CS'] },
  { name: 'Faculty of Engineering', type: 'faculty', description: 'All engineering departments. News, events, and inter-department discussions.', university: U, faculty: 'Engineering', members_count: 1200, is_official: true, is_verified: true, icon: 'Cog', accent_color: '0 84% 60%' },
  { name: 'Faculty of Science', type: 'faculty', description: 'The science community. Research, events, and student discussions.', university: U, faculty: 'Science', members_count: 980, is_official: true, is_verified: true, icon: 'FlaskConical', accent_color: '142 71% 45%' },
  { name: 'Moremi Hall Residents', type: 'hostel', description: 'Community for Moremi Hall residents. Hall announcements, roommate tips, and hostel life.', university: U, members_count: 450, is_official: false, is_verified: false, icon: 'Home', accent_color: '251 90% 67%' },
  { name: 'Class of 2026 — Graduating', type: 'level', description: 'Final year students graduating in 2026. Project defense, convocation, and transition discussions.', university: U, level: '500L', members_count: 680, is_official: false, is_verified: false, icon: 'GraduationCap', accent_color: '46 74% 55%' },
  { name: 'Developers\' Circle Community', type: 'club', description: 'The official online community for Dev Circle members. Code reviews, project showcases, and tech discussions.', university: U, members_count: 240, is_official: false, is_verified: true, icon: 'Code', accent_color: '221 83% 53%', rules: ['Share knowledge freely','Help others debug','No plagiarism'] },
  { name: 'Law Students Association', type: 'faculty_association', description: 'The official association for Law students. Moot court, internships, and bar prep.', university: U, faculty: 'Law', members_count: 540, is_official: true, is_verified: true, icon: 'Scale', accent_color: '0 84% 60%' },
  { name: 'Entrepreneurship Network', type: 'interest_group', description: 'For aspiring entrepreneurs and student founders. Pitch practice, mentorship, and funding opportunities.', university: U, members_count: 320, is_official: false, is_verified: false, icon: 'Rocket', accent_color: '221 83% 53%' },
];

// ── Short Videos ──
const SAMPLE_VID = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/';
export const SHORT_VIDEOS = [
  { title: '5 Study Tips That Actually Work', description: 'I went from C to A using these methods. Try them!', video_url: SAMPLE_VID + 'BigBuckBunny.mp4', thumbnail_url: IMG('photo-1456513080510-7bf3a84b82f8'), duration_seconds: 45, category: 'study_tips', author_name: 'Adaeze Okonkwo', author_role: 'student', author_handle: 'Computer Science · 300L', is_verified: false, university: U, hashtags: ['#StudyTips','#StudentLife'], likes_count: 234, comments_count: 45, shares_count: 67, views_count: 1200, status: 'active' },
  { title: 'Day in the Life of a Medical Student', description: 'From 6 AM rotations to midnight studying. This is med school!', video_url: SAMPLE_VID + 'ElephantsDream.mp4', thumbnail_url: IMG('photo-1576091160550-2173dba999ef'), duration_seconds: 60, category: 'student_project', author_name: 'Yusuf Aliyu', author_role: 'student', author_handle: 'Medicine · 400L', is_verified: false, university: U, hashtags: ['#MedSchool','#DayInTheLife'], likes_count: 456, comments_count: 78, shares_count: 123, views_count: 2300, status: 'active' },
  { title: 'How to Build Your First React App', description: 'Step by step tutorial. No prior experience needed! 💻', video_url: SAMPLE_VID + 'ForBiggerBlazes.mp4', thumbnail_url: IMG('photo-1531482615713-2afd69097998'), duration_seconds: 90, category: 'coding', author_name: 'Adaeze Okonkwo', author_role: 'student', author_handle: 'Computer Science · 300L', is_verified: false, university: U, hashtags: ['#React','#Coding','#Tutorial'], likes_count: 189, comments_count: 34, shares_count: 56, views_count: 890, status: 'active' },
  { title: 'Campus Food Review — Best Jollof on Campus', description: 'I tried every cafeteria on campus. Here\'s the winner! 🍚', video_url: SAMPLE_VID + 'ForBiggerEscapes.mp4', thumbnail_url: IMG('photo-1488190211105-8b0e65b80b7e'), duration_seconds: 35, category: 'campus_news', author_name: 'Fatima Ibrahim', author_role: 'student', author_handle: 'Mass Communication · 400L', is_verified: false, university: U, hashtags: ['#FoodReview','#CampusEats'], likes_count: 345, comments_count: 67, shares_count: 89, views_count: 1500, status: 'active' },
  { title: 'Engineering Project Showcase', description: 'Solar-powered water purification system. 2nd place nationally! 🏆', video_url: SAMPLE_VID + 'ForBiggerFun.mp4', thumbnail_url: IMG('photo-1581093588401-fbb62a02f120'), duration_seconds: 55, category: 'student_project', author_name: 'Emeka Nwosu', author_role: 'student', author_handle: 'Electrical Engineering · 500L', is_verified: false, university: U, hashtags: ['#Engineering','#Innovation','#ProjectShowcase'], likes_count: 567, comments_count: 89, shares_count: 134, views_count: 2800, status: 'active' },
  { title: 'How I Got an Internship at PayStack', description: 'My journey from struggling student to landing a dream internship. You can do it too!', video_url: SAMPLE_VID + 'ForBiggerJoyrides.mp4', thumbnail_url: IMG('photo-1522071820081-009f0129c71c'), duration_seconds: 75, category: 'career_advice', author_name: 'Adaeze Okonkwo', author_role: 'student', author_handle: 'Computer Science · 300L', is_verified: false, university: U, hashtags: ['#Internship','#CareerAdvice','#Tech'], likes_count: 678, comments_count: 123, shares_count: 234, views_count: 3400, status: 'active' },
  { title: 'Campus Tour — Hidden Gems', description: 'The best study spots, food places, and quiet corners on campus!', video_url: SAMPLE_VID + 'ForBiggerMeltdowns.mp4', thumbnail_url: IMG('photo-1521587760476-6c12a4b040da'), duration_seconds: 50, category: 'campus_news', author_name: 'Kunle Adebayo', author_role: 'student', author_handle: 'Architecture · 400L', is_verified: false, university: U, hashtags: ['#CampusTour','#HiddenGems'], likes_count: 234, comments_count: 45, shares_count: 67, views_count: 1100, status: 'active' },
  { title: 'Startup Pitch — Student Entrepreneur', description: 'My journey building a tech startup while in school. Lessons learned!', video_url: SAMPLE_VID + 'ForBiggerMoment.mp4', thumbnail_url: IMG('photo-1559136555-9303baea8ebd'), duration_seconds: 65, category: 'entrepreneurship', author_name: 'Emeka Nwosu', author_role: 'student', author_handle: 'Electrical Engineering · 500L', is_verified: false, university: U, hashtags: ['#Startup','#Entrepreneurship'], likes_count: 445, comments_count: 67, shares_count: 89, views_count: 1900, status: 'active' },
];

// ── Lost & Found ──
export const LOST_FOUND_ITEMS = [
  { title: 'Found: Student ID Card', type: 'found', category: 'id_card', description: 'Found a student ID belonging to Oluwaseun Adeleye in the main reading room. Collect from the library circulation desk.', location: 'University Library', reporter_name: 'University Library', status: 'active', university: U, date_lost_found: '2026-08-01' },
  { title: 'Lost: Black JBL Earbuds', type: 'lost', category: 'electronics', description: 'Left in Lecture Theatre 3 around 4 PM yesterday. They were a gift from my dad. Reward available! 🙏', location: 'Lecture Theatre 3', reporter_name: 'David Okafor', status: 'active', university: U, date_lost_found: '2026-08-01' },
  { title: 'Found: Scientific Calculator', type: 'found', category: 'electronics', description: 'Casio fx-991EX found in the engineering workshop. Describe to claim.', location: 'Engineering Workshop', reporter_name: 'Tunde Bello', status: 'active', university: U, date_lost_found: '2026-07-31' },
  { title: 'Lost: Blue Backpack', type: 'lost', category: 'bag', description: 'Blue Nike backpack left at the cafeteria. Contains textbooks and my laptop. Please help!', location: 'Cafeteria Block A', reporter_name: 'Blessing Eze', status: 'active', university: U, date_lost_found: '2026-07-30' },
  { title: 'Found: Set of Keys', type: 'found', category: 'keys', description: 'Set of 3 keys on a red keychain found near the sports complex. Claim at security post.', location: 'Sports Complex', reporter_name: 'Emeka Nwosu', status: 'active', university: U, date_lost_found: '2026-07-31' },
  { title: 'Lost: Wallet', type: 'lost', category: 'wallet', description: 'Brown leather wallet. Contains ID, ATM cards, and some cash. Lost between Science block and Jaja.', location: 'Science Block to Jaja', reporter_name: 'Chioma Obi', status: 'active', university: U, date_lost_found: '2026-08-01' },
  { title: 'Found: Textbook — Engineering Mathematics', type: 'found', category: 'books', description: 'Found K.A. Stroud Engineering Mathematics in LT 2. No name inside.', location: 'Lecture Theatre 2', reporter_name: 'Aisha Mohammed', status: 'active', university: U, date_lost_found: '2026-07-30' },
  { title: 'Lost: Phone — iPhone 12', type: 'lost', category: 'phone', description: 'Blue iPhone 12 with a clear case. Last seen at the library. Please DM if found. Contact: 08012345678', location: 'University Library', reporter_name: 'Fatima Ibrahim', status: 'active', university: U, date_lost_found: '2026-08-01' },
  { title: 'Found: Sunglasses', type: 'found', category: 'accessories', description: 'Ray-Ban sunglasses found on a bench near the main gate. Claim at the security office.', location: 'Main Gate', reporter_name: 'Kunle Adebayo', status: 'active', university: U, date_lost_found: '2026-07-31' },
  { title: 'Lost: Water Bottle — Thermos Flask', type: 'lost', category: 'other', description: 'Black thermos flask left at the gym. Has my name engraved on the bottom.', location: 'Sports Complex Gym', reporter_name: 'Daniel Eyo', status: 'active', university: U, date_lost_found: '2026-07-30' },
];

// ── Notifications ──
export const NOTIFICATIONS = [
  { title: 'New message from Adaeze Okonkwo', message: 'See you at the library! 📚', type: 'message', category: 'social', priority: 'normal', is_read: false, link: '/messages' },
  { title: 'Assignment Due Tomorrow', message: 'CSC 301 Assignment 2 is due Friday 11:59 PM. Don\'t forget!', type: 'reminder', category: 'assignment', priority: 'high', is_read: false, link: '/assignments' },
  { title: 'New internship opportunity', message: 'Paystack is offering software engineering internships. Apply by August 20th!', type: 'opportunity', category: 'opportunity', priority: 'high', is_read: false, link: '/opportunities' },
  { title: 'Career Fair in 12 days', message: 'The Annual Career Fair is on August 14th. 40+ companies will be there!', type: 'academic', category: 'event', priority: 'normal', is_read: true, link: '/events' },
  { title: 'New story from Adaeze', message: 'Adaeze posted a new story: "Library sessions hit different at 6 AM"', type: 'social', category: 'social', priority: 'low', is_read: false, link: '/social' },
  { title: 'Test Results Posted', message: 'PHY 203 Test 1 results are posted. Class average was 68%.', type: 'academic', category: 'academic', priority: 'normal', is_read: true, link: '/academics' },
  { title: 'Study group invitation', message: 'You\'ve been invited to join "CSC 301 Study Group"', type: 'social', category: 'study_group', priority: 'normal', is_read: false, link: '/study-groups' },
  { title: 'New club post', message: 'Developers\' Circle: React Workshop this Friday! 💻', type: 'social', category: 'community', priority: 'normal', is_read: true, link: '/clubs' },
  { title: 'Scholarship deadline approaching', message: 'MTN Foundation Scholarship closes August 30th. Apply now!', type: 'opportunity', category: 'opportunity', priority: 'high', is_read: false, link: '/scholarships' },
  { title: 'Bud reminder', message: 'You have a study session at 4 PM today. Ready to crush it? 📚', type: 'bud', category: 'bud', priority: 'normal', is_read: false, link: '/bud' },
  { title: 'New marketplace listing', message: 'New item: HP Laptop — 8GB RAM, 256GB SSD for ₦180,000', type: 'social', category: 'marketplace', priority: 'low', is_read: true, link: '/marketplace' },
  { title: 'Football match tomorrow', message: 'Inter-Faculty Football Tournament starts tomorrow at 4 PM! ⚽', type: 'social', category: 'campus', priority: 'normal', is_read: false, link: '/events' },
  { title: 'Office hours changed', message: 'Dr. Aminu Sadiq moved office hours to Wednesday 2-4 PM this week', type: 'academic', category: 'academic', priority: 'normal', is_read: true, link: '/messages' },
  { title: 'Achievement unlocked! 🎉', message: 'You\'ve completed 7 days of consistent study. Keep the streak going!', type: 'achievement', category: 'achievement', priority: 'normal', is_read: false, link: '/me' },
  { title: 'Campus event reminder', message: 'Cultural Festival is on August 22nd. Get your traditional outfits ready! 🎭', type: 'social', category: 'campus', priority: 'normal', is_read: true, link: '/events' },
];

// ── Research Projects ──
export const RESEARCH_PROJECTS = [
  { title: 'AI-Powered Early Disease Detection', description: 'Using machine learning to detect diseases early from mobile phone data. Funded by TETFund.', author_name: 'Dr. Aminu Sadiq', department: 'Computer Science', faculty: 'Science', status: 'active', tags: ['AI','machine-learning','healthcare'] },
  { title: 'Solar-Powered Water Purification System', description: 'A sustainable solution for clean water access in rural communities. 2nd place at National Innovation Challenge.', author_name: 'Emeka Nwosu', department: 'Electrical Engineering', faculty: 'Engineering', status: 'active', tags: ['solar','water','sustainability','innovation'] },
  { title: 'Campus Traffic Flow Optimization', description: 'Using data analytics to optimize movement patterns across the university campus.', author_name: 'David Okafor', department: 'Civil Engineering', faculty: 'Engineering', status: 'active', tags: ['data-analytics','optimization','urban-planning'] },
  { title: 'Local Language NLP for Education', description: 'Building natural language processing tools for Nigerian languages to improve digital education access.', author_name: 'Adaeze Okonkwo', department: 'Computer Science', faculty: 'Science', status: 'active', tags: ['NLP','education','local-languages'] },
  { title: 'Renewable Energy Microgrids', description: 'Designing microgrid systems for reliable power supply in university environments.', author_name: 'Dr. Samuel Oduya', department: 'Electrical Engineering', faculty: 'Engineering', status: 'active', tags: ['renewable-energy','microgrid','power'] },
];

// Helper to mark all seed records
export const SEED_FLAG = { is_seed_content: true, seed_batch: 'launch_v1' };