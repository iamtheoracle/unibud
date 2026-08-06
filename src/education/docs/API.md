# Education Module — API Reference

## Base URL
All Education Module API endpoints are prefixed: `/api/education`

---

## Domain 1: Identity

### Students
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/students` | Register a student |
| `GET` | `/students` | List students |
| `GET` | `/students/:id` | Get student |
| `PATCH` | `/students/:id` | Update student |
| `POST` | `/students/:id/activate` | Activate student |
| `POST` | `/students/:id/deactivate` | Deactivate student |
| `GET` | `/students/:id/contexts` | Get student's org contexts |
| `POST` | `/students/:id/contexts` | Add student to context |
| `DELETE` | `/students/:id/contexts/:contextId` | Remove context |

### Educators
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/educators` | Register an educator |
| `GET` | `/educators` | List educators |
| `GET` | `/educators/:id` | Get educator |
| `PATCH` | `/educators/:id` | Update educator |
| `GET` | `/educators/:id/contexts` | Get educator's contexts |
| `POST` | `/educators/:id/contexts` | Assign educator to context |
| `DELETE` | `/educators/:id/contexts/:contextId` | Remove context |

---

## Domain 2: Academic

### Programs
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/programs` | Create program |
| `GET` | `/programs` | List programs (filter: `?type=waec`) |
| `GET` | `/programs/:id` | Get program |
| `PATCH` | `/programs/:id` | Update program |
| `DELETE` | `/programs/:id` | Delete program |
| `POST` | `/programs/:id/subjects` | Add subject to program |
| `DELETE` | `/programs/:id/subjects/:subjectId` | Remove subject |

### Subjects
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/subjects` | Create subject |
| `GET` | `/subjects` | List subjects (filter: `?programId=...`) |
| `GET` | `/subjects/:id` | Get subject |
| `PATCH` | `/subjects/:id` | Update subject |
| `DELETE` | `/subjects/:id` | Delete subject |

### Classes
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/classes` | Create class |
| `GET` | `/classes` | List classes (filter: `?programId`, `?educatorId`, `?organizationId`) |
| `GET` | `/classes/:id` | Get class |
| `PATCH` | `/classes/:id` | Update class |
| `DELETE` | `/classes/:id` | Delete class |
| `POST` | `/classes/:id/students` | Add student |
| `DELETE` | `/classes/:id/students/:studentId` | Remove student |

### Enrollments
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/enrollments` | Enroll student in class |
| `GET` | `/enrollments` | List enrollments (filter: `?studentId`, `?classId`) |
| `GET` | `/enrollments/:id` | Get enrollment |
| `POST` | `/enrollments/:id/approve` | Approve enrollment |
| `POST` | `/enrollments/:id/reject` | Reject enrollment |
| `POST` | `/enrollments/withdraw` | Withdraw from class |

---

## Domain 3: University

### Universities
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/universities` | Create university |
| `GET` | `/universities` | List universities |
| `GET` | `/universities/:id` | Get university |
| `PATCH` | `/universities/:id` | Update university |
| `DELETE` | `/universities/:id` | Delete university |

### Faculties
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/faculties` | Create faculty |
| `GET` | `/faculties` | List faculties (filter: `?universityId`) |
| `GET` | `/faculties/:id` | Get faculty |
| `PATCH` | `/faculties/:id` | Update faculty |
| `DELETE` | `/faculties/:id` | Delete faculty |

### Departments
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/departments` | Create department |
| `GET` | `/departments` | List departments (filter: `?facultyId`) |
| `GET` | `/departments/:id` | Get department |
| `PATCH` | `/departments/:id` | Update department |
| `DELETE` | `/departments/:id` | Delete department |

### Courses (University)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/courses` | Create course |
| `GET` | `/courses` | List courses (filter: `?departmentId`) |
| `GET` | `/courses/:id` | Get course |
| `PATCH` | `/courses/:id` | Update course |
| `DELETE` | `/courses/:id` | Delete course |

---

## Domain 4: Learning Organization

### Organizations
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/organizations` | Create organization |
| `GET` | `/organizations` | List organizations (filter: `?type`) |
| `GET` | `/organizations/:id` | Get organization |
| `PATCH` | `/organizations/:id` | Update organization |
| `DELETE` | `/organizations/:id` | Delete organization |

### Learning Programs
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/learning-programs` | Create learning program |
| `GET` | `/learning-programs` | List (filter: `?organizationId`) |
| `GET` | `/learning-programs/:id` | Get learning program |
| `PATCH` | `/learning-programs/:id` | Update learning program |
| `DELETE` | `/learning-programs/:id` | Delete learning program |

---

## Domain 5: Shared Infrastructure

### Permissions
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/permissions` | Define a permission |
| `POST` | `/permissions/grant` | Grant permission to user |
| `POST` | `/permissions/revoke` | Revoke permission from user |
| `GET` | `/permissions/check` | Check if user has permission |
| `GET` | `/permissions/:userId` | List permissions for user |

### Invitations
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/invitations` | Send invitation |
| `GET` | `/invitations` | List invitations (filter: `?organizationId`) |
| `GET` | `/invitations/:token` | Get invitation by token |
| `POST` | `/invitations/:token/accept` | Accept invitation |
| `POST` | `/invitations/:token/reject` | Reject invitation |
| `POST` | `/invitations/:id/revoke` | Revoke invitation |
