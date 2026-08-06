# University Ecosystem

## Overview

The University Ecosystem has a strict hierarchical structure:

```
University → Faculty → Department → Course → University Student
```

## Services

### UniversityService

```typescript
const uni = module.universities.createUniversity('University of Lagos', 'UNILAG');
module.universities.listUniversities();
module.universities.getUniversity(uni.id);
module.universities.updateUniversity(uni.id, { description: 'Premier university' });
module.universities.deleteUniversity(uni.id);
```

### FacultyService

```typescript
const faculty = module.faculties.createFaculty(uni.id, 'Engineering', 'ENG');
module.universities.addFaculty(uni.id, faculty.id); // link to university
module.faculties.listFaculties(uni.id);
```

### DepartmentService

```typescript
const dept = module.departments.createDepartment(faculty.id, 'Computer Science', 'CS');
module.faculties.addDepartment(faculty.id, dept.id); // link to faculty
module.departments.listDepartments(faculty.id);
```

### CourseService

```typescript
const course = module.courses.createCourse(dept.id, 'CS101', 'Intro to CS', 'Fundamentals', 3);
module.departments.addCourse(dept.id, course.id); // link to department
module.courses.listCourses(dept.id);
```

### UniversityStudentService

```typescript
const student = module.universityStudents.enrollStudent(
  uni.id, userId, dept.id, course.id,
  'ULAG/2024/0001',  // matriculation number
  '100',             // level
);

module.universityStudents.listStudents(uni.id);
module.universityStudents.listStudents(undefined, dept.id);
module.universityStudents.activateStudent(student.id);
module.universityStudents.deactivateStudent(student.id);
```

## Data Model

| Entity | Key Fields |
|---|---|
| University | id, name, code, faculties[] |
| Faculty | id, universityId, name, code, departments[] |
| Department | id, facultyId, name, code, courses[] |
| Course | id, departmentId, code, name, credits |
| UniversityStudent | id, userId, universityId, departmentId, courseId, matriculationNumber, level, status |

## Student Status

- `active` — currently enrolled
- `inactive` — suspended/on leave
- `graduated` — completed program
- `withdrawn` — left the program
