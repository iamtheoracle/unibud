# Education Module Data Models

All interfaces are in `src/education/types/index.ts`.

## IProgram

```typescript
interface IProgram {
  id: string;
  name: string;          // e.g. "WAEC", "University Degree"
  code?: string;         // e.g. "WAEC-2024"
  description?: string;
  type: string;          // e.g. "preUniversity", "university"
  subjects: string[];    // Subject IDs
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
```

## IOrganization

```typescript
interface IOrganization {
  id: string;
  name: string;
  type: string;          // e.g. "University", "ExamCentre", "TutorialCentre"
  description?: string;
  educators: string[];   // Educator IDs
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
```

## IStudent

```typescript
interface IStudent {
  id: string;
  userId: string;            // Oracle User ID
  organizationId: string;
  programId: string;
  enrollmentNumber?: string;
  status: 'active' | 'inactive' | 'graduated' | 'withdrawn';
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
```

## IEducator

```typescript
interface IEducator {
  id: string;
  userId: string;            // Oracle User ID
  bio?: string;
  qualifications?: string[];
  organizations: string[];   // Organization IDs
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
```

## IClass

```typescript
interface IClass {
  id: string;
  organizationId: string;
  programId: string;
  subjectId: string;
  educatorId: string;
  name: string;
  code?: string;
  schedule?: {
    days?: string[];
    time?: string;
    location?: string;
  };
  capacity?: number;
  students: string[];        // Student IDs
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
```

## ISubject

```typescript
interface ISubject {
  id: string;
  programId: string;
  code: string;              // e.g. "ENG101"
  name: string;
  description?: string;
  credits?: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
```

## IEnrollment

```typescript
interface IEnrollment {
  id: string;
  studentId: string;
  classId: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  enrolledAt: Date;
  approvedAt?: Date;
  withdrawnAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
```

## IPermission

```typescript
interface IPermission {
  id: string;
  name: string;              // e.g. "student.view_class"
  description?: string;
  scope: 'global' | 'organization' | 'class';
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
```

## IInvitation

```typescript
interface IInvitation {
  id: string;
  email: string;
  token: string;             // URL-safe random token (64 hex chars)
  type: 'student' | 'educator';
  organizationId?: string;
  programId?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'revoked';
  data?: Record<string, unknown>;
  expiresAt: Date;           // 72 hours from creation
  acceptedAt?: Date;
  createdAt: Date;
}
```
