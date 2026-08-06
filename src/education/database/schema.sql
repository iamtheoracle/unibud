-- ─── Education Module Database Schema ────────────────────────────────────────
-- Two education ecosystems sharing a common foundation.
--
-- Ecosystem 1: University  (universities, faculties, departments, courses, university_students)
-- Ecosystem 2: Learning Org (learning_organizations, learning_org_students)
-- Shared:      programs, subjects, educators, classes, enrollments, permissions, invitations
--
-- Total: 16 tables (7 shared + 5 university + 2 learning org + 2 junction)

-- ─── Shared Foundation Tables ─────────────────────────────────────────────────

CREATE TABLE programs (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL,                 -- e.g. "waec", "neco", "jamb", "university_degree"
  organization_type TEXT NOT NULL            -- "university" | "learningOrg"
    CHECK (organization_type IN ('university', 'learningOrg')),
  description TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subjects (
  id          TEXT PRIMARY KEY,
  program_id  TEXT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  code        TEXT NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (program_id, code)
);

CREATE TABLE educators (
  id              TEXT PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  bio             TEXT,
  organization_ids TEXT[] NOT NULL DEFAULT '{}',
  metadata        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE classes (
  id              TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,             -- Can be a university ID or learning org ID
  program_id      TEXT NOT NULL REFERENCES programs(id) ON DELETE RESTRICT,
  subject_id      TEXT NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  educator_id     TEXT NOT NULL REFERENCES educators(id) ON DELETE RESTRICT,
  name            TEXT NOT NULL,
  code            TEXT,
  schedule        JSONB,
  capacity        INTEGER,
  metadata        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE enrollments (
  id          TEXT PRIMARY KEY,
  student_id  TEXT NOT NULL,
  class_id    TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'withdrawn')),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, class_id)
);

CREATE TABLE permissions (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  scope       TEXT NOT NULL DEFAULT 'global',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_permissions (
  user_id         TEXT NOT NULL,
  permission_name TEXT NOT NULL REFERENCES permissions(name) ON DELETE CASCADE,
  context         JSONB,
  granted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, permission_name, COALESCE(context::TEXT, ''))
);

CREATE TABLE invitations (
  id              TEXT PRIMARY KEY,
  email           TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('educator', 'student', 'admin')),
  organization_id TEXT NOT NULL,
  program_id      TEXT,
  token           TEXT NOT NULL UNIQUE,
  status          TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  data            JSONB,
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── University Ecosystem Tables ──────────────────────────────────────────────

CREATE TABLE universities (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  code        TEXT NOT NULL UNIQUE,          -- e.g. "UNILAG"
  description TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE faculties (
  id            TEXT PRIMARY KEY,
  university_id TEXT NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  code          TEXT NOT NULL,              -- e.g. "Engineering"
  description   TEXT,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (university_id, code)
);

CREATE TABLE departments (
  id          TEXT PRIMARY KEY,
  faculty_id  TEXT NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  code        TEXT NOT NULL,               -- e.g. "Computer Science"
  description TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (faculty_id, code)
);

CREATE TABLE courses (
  id            TEXT PRIMARY KEY,
  department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  code          TEXT NOT NULL,             -- e.g. "CS101"
  name          TEXT NOT NULL,
  description   TEXT,
  credits       INTEGER,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (department_id, code)
);

CREATE TABLE university_students (
  id                    TEXT PRIMARY KEY,
  user_id               TEXT NOT NULL,
  university_id         TEXT NOT NULL REFERENCES universities(id) ON DELETE RESTRICT,
  department_id         TEXT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  course_id             TEXT NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  matriculation_number  TEXT,
  level                 TEXT CHECK (level IN ('100', '200', '300', '400', '500', '600')),
  status                TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'graduated', 'withdrawn')),
  metadata              JSONB,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (university_id, matriculation_number)
);

-- ─── Learning Organization Ecosystem Tables ───────────────────────────────────

CREATE TABLE learning_organizations (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL
    CHECK (type IN ('examCentre', 'tutorialCentre', 'academy', 'trainingCentre')),
  description TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE learning_org_students (
  id                TEXT PRIMARY KEY,
  user_id           TEXT NOT NULL,
  organization_id   TEXT NOT NULL REFERENCES learning_organizations(id) ON DELETE RESTRICT,
  program_id        TEXT NOT NULL REFERENCES programs(id) ON DELETE RESTRICT,
  enrollment_number TEXT,
  status            TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'completed', 'withdrawn')),
  metadata          JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Junction Tables ──────────────────────────────────────────────────────────

CREATE TABLE educator_organizations (
  educator_id     TEXT NOT NULL REFERENCES educators(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL,
  assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (educator_id, organization_id)
);

CREATE TABLE class_students (
  class_id    TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id  TEXT NOT NULL,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (class_id, student_id)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX idx_subjects_program_id       ON subjects(program_id);
CREATE INDEX idx_classes_organization_id   ON classes(organization_id);
CREATE INDEX idx_classes_program_id        ON classes(program_id);
CREATE INDEX idx_classes_educator_id       ON classes(educator_id);
CREATE INDEX idx_enrollments_student_id    ON enrollments(student_id);
CREATE INDEX idx_enrollments_class_id      ON enrollments(class_id);
CREATE INDEX idx_invitations_email         ON invitations(email);
CREATE INDEX idx_invitations_token         ON invitations(token);
CREATE INDEX idx_faculties_university_id   ON faculties(university_id);
CREATE INDEX idx_departments_faculty_id    ON departments(faculty_id);
CREATE INDEX idx_courses_department_id     ON courses(department_id);
CREATE INDEX idx_uni_students_university   ON university_students(university_id);
CREATE INDEX idx_uni_students_department   ON university_students(department_id);
CREATE INDEX idx_lo_students_org           ON learning_org_students(organization_id);
CREATE INDEX idx_lo_students_program       ON learning_org_students(program_id);
