# Education Module API

All routes follow the pattern `/api/education/<resource>`.

## Shared Foundation Endpoints

### Academic Programs — `/api/education/programs`

| Method | Path | Description |
|---|---|---|
| POST | `/api/education/programs` | Create academic program |
| GET | `/api/education/programs` | List programs (query: `type`, `organizationType`) |
| GET | `/api/education/programs/:id` | Get program by ID |
| PUT | `/api/education/programs/:id` | Update program |
| DELETE | `/api/education/programs/:id` | Delete program |

### Classes — `/api/education/classes`

| Method | Path | Description |
|---|---|---|
| POST | `/api/education/classes` | Create class |
| GET | `/api/education/classes` | List classes (query: `organizationId`, `programId`, `educatorId`) |
| GET | `/api/education/classes/:id` | Get class |
| PUT | `/api/education/classes/:id` | Update class |
| DELETE | `/api/education/classes/:id` | Delete class |

### Subjects — `/api/education/subjects`

| Method | Path | Description |
|---|---|---|
| POST | `/api/education/subjects` | Create subject |
| GET | `/api/education/subjects` | List subjects (query: `programId`) |
| GET | `/api/education/subjects/:id` | Get subject |
| PUT | `/api/education/subjects/:id` | Update subject |
| DELETE | `/api/education/subjects/:id` | Delete subject |

### Educators — `/api/education/educators`

| Method | Path | Description |
|---|---|---|
| POST | `/api/education/educators` | Register educator |
| GET | `/api/education/educators` | List educators (query: `organizationId`) |
| GET | `/api/education/educators/:id` | Get educator |
| PUT | `/api/education/educators/:id` | Update educator |
| POST | `/api/education/educators/:id/organizations` | Assign to organization |

### Enrollments — `/api/education/enrollments`

| Method | Path | Description |
|---|---|---|
| POST | `/api/education/enrollments` | Enroll student in class |
| GET | `/api/education/enrollments` | List enrollments (query: `studentId`, `classId`) |
| GET | `/api/education/enrollments/:id` | Get enrollment |
| DELETE | `/api/education/enrollments` | Withdraw from class |
| POST | `/api/education/enrollments/:id/approve` | Approve enrollment |

### Permissions — `/api/education/permissions`

| Method | Path | Description |
|---|---|---|
| POST | `/api/education/permissions` | Define permission |
| GET | `/api/education/permissions` | List permissions |
| POST | `/api/education/permissions/grant` | Grant permission to user |
| POST | `/api/education/permissions/revoke` | Revoke permission from user |
| GET | `/api/education/permissions/check` | Check if user has permission |

### Invitations — `/api/education/invitations`

| Method | Path | Description |
|---|---|---|
| POST | `/api/education/invitations` | Send invitation |
| GET | `/api/education/invitations` | List invitations |
| GET | `/api/education/invitations/:id` | Get invitation |
| POST | `/api/education/invitations/accept` | Accept invitation by token |
| POST | `/api/education/invitations/reject` | Reject invitation by token |

---

## University Ecosystem Endpoints

### Universities — `/api/education/universities`

| Method | Path | Description |
|---|---|---|
| POST | `/api/education/universities` | Create university |
| GET | `/api/education/universities` | List all universities |
| GET | `/api/education/universities/:id` | Get university |
| PUT | `/api/education/universities/:id` | Update university |
| DELETE | `/api/education/universities/:id` | Delete university |

### Faculties — `/api/education/faculties`

| Method | Path | Description |
|---|---|---|
| POST | `/api/education/faculties` | Create faculty |
| GET | `/api/education/faculties` | List faculties (query: `universityId`) |
| GET | `/api/education/faculties/:id` | Get faculty |
| PUT | `/api/education/faculties/:id` | Update faculty |
| DELETE | `/api/education/faculties/:id` | Delete faculty |

### Departments — `/api/education/departments`

| Method | Path | Description |
|---|---|---|
| POST | `/api/education/departments` | Create department |
| GET | `/api/education/departments` | List departments (query: `facultyId`) |
| GET | `/api/education/departments/:id` | Get department |
| PUT | `/api/education/departments/:id` | Update department |
| DELETE | `/api/education/departments/:id` | Delete department |

### Courses — `/api/education/courses`

| Method | Path | Description |
|---|---|---|
| POST | `/api/education/courses` | Create course |
| GET | `/api/education/courses` | List courses (query: `departmentId`) |
| GET | `/api/education/courses/:id` | Get course |
| PUT | `/api/education/courses/:id` | Update course |
| DELETE | `/api/education/courses/:id` | Delete course |

### University Students — `/api/education/university-students`

| Method | Path | Description |
|---|---|---|
| POST | `/api/education/university-students` | Enroll student |
| GET | `/api/education/university-students` | List students (query: `universityId`, `departmentId`, `courseId`) |
| GET | `/api/education/university-students/:id` | Get student |
| PUT | `/api/education/university-students/:id` | Update student |
| POST | `/api/education/university-students/:id/activate` | Activate student |
| POST | `/api/education/university-students/:id/deactivate` | Deactivate student |

---

## Learning Organization Ecosystem Endpoints

### Organizations — `/api/education/organizations`

| Method | Path | Description |
|---|---|---|
| POST | `/api/education/organizations` | Create learning organization |
| GET | `/api/education/organizations` | List organizations (query: `type`) |
| GET | `/api/education/organizations/:id` | Get organization |
| PUT | `/api/education/organizations/:id` | Update organization |
| DELETE | `/api/education/organizations/:id` | Delete organization |

### Learning Org Students — `/api/education/org-students`

| Method | Path | Description |
|---|---|---|
| POST | `/api/education/org-students` | Enroll student |
| GET | `/api/education/org-students` | List students (query: `organizationId`, `programId`) |
| GET | `/api/education/org-students/:id` | Get student |
| PUT | `/api/education/org-students/:id` | Update student |
| POST | `/api/education/org-students/:id/activate` | Activate student |
| POST | `/api/education/org-students/:id/deactivate` | Deactivate student |
