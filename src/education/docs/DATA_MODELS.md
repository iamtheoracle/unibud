# Education Module Data Models

## Shared Foundation

### IProgram
```typescript
interface IProgram {
  id: string;
  name: string;          // "WAEC 2024", "B.Sc. Computer Science"
  type: string;          // "waec" | "neco" | "jamb" | "university_degree" | ...
  organizationType: 'university' | 'learningOrg';
  subjects: string[];    // Subject IDs
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
```

### IClass
```typescript
interface IClass {
  id: string;
  organizationId: string; // University ID or Learning Org ID
  programId: string;
  subjectId: string;
  educatorId: string;
  name: string;
  code?: string;
  schedule?: unknown;
  capacity?: number;
  students: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
```

### ISubject
```typescript
interface ISubject {
  id: string;
  programId: string;
  code: string;          // "MATH101"
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### IEducator
```typescript
interface IEducator {
  id: string;
  email: string;
  name: string;
  bio?: string;
  organizationIds: string[];  // Can belong to multiple orgs
  createdAt: Date;
  updatedAt: Date;
}
```

### IEnrollment
```typescript
interface IEnrollment {
  id: string;
  studentId: string;
  classId: string;
  status: 'pending' | 'approved' | 'withdrawn';
  enrolledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### IPermission
```typescript
interface IPermission {
  id: string;
  name: string;          // e.g., "course:read"
  description?: string;
  scope: string;         // "global" | "university" | "learningOrg" | ...
  createdAt: Date;
  updatedAt: Date;
}
```

### IInvitation
```typescript
interface IInvitation {
  id: string;
  email: string;
  type: 'educator' | 'student' | 'admin';
  organizationId: string;
  programId?: string;
  token: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  data?: Record<string, unknown>;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## University Ecosystem

### IUniversity
```typescript
interface IUniversity {
  id: string;
  name: string;
  code: string;          // "UNILAG"
  description?: string;
  faculties: string[];   // Faculty IDs
  createdAt: Date;
  updatedAt: Date;
}
```

### IFaculty
```typescript
interface IFaculty {
  id: string;
  universityId: string;
  name: string;
  code: string;          // "Engineering"
  departments: string[]; // Department IDs
  createdAt: Date;
  updatedAt: Date;
}
```

### IDepartment
```typescript
interface IDepartment {
  id: string;
  facultyId: string;
  name: string;
  code: string;          // "Computer Science"
  courses: string[];     // Course IDs
  createdAt: Date;
  updatedAt: Date;
}
```

### ICourse
```typescript
interface ICourse {
  id: string;
  departmentId: string;
  code: string;          // "CS101"
  name: string;
  description?: string;
  credits?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### IUniversityStudent
```typescript
interface IUniversityStudent {
  id: string;
  userId: string;        // Oracle User ID
  universityId: string;
  departmentId: string;
  courseId: string;
  matriculationNumber?: string;
  level?: '100' | '200' | '300' | '400' | '500' | '600';
  status: 'active' | 'inactive' | 'graduated' | 'withdrawn';
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Learning Organization Ecosystem

### ILearningOrganization
```typescript
type LearningOrgType = 'examCentre' | 'tutorialCentre' | 'academy' | 'trainingCentre';

interface ILearningOrganization {
  id: string;
  name: string;
  type: LearningOrgType;
  description?: string;
  educators: string[];   // Educator IDs
  createdAt: Date;
  updatedAt: Date;
}
```

### ILearningOrgStudent
```typescript
interface ILearningOrgStudent {
  id: string;
  userId: string;        // Oracle User ID
  organizationId: string;
  programId: string;     // WAEC, NECO, JAMB, etc.
  enrollmentNumber?: string;
  status: 'active' | 'inactive' | 'completed' | 'withdrawn';
  createdAt: Date;
  updatedAt: Date;
}
```
