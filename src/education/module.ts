import { classService, ClassService } from './services/shared/class.service';
import { educatorService, EducatorService } from './services/shared/educator.service';
import { enrollmentService, EnrollmentService } from './services/shared/enrollment.service';
import { invitationService, InvitationService } from './services/shared/invitation.service';
import { permissionService, PermissionService } from './services/shared/permission.service';
import { programService, ProgramService } from './services/shared/program.service';
import { studentService, StudentService } from './services/shared/student.service';
import { subjectService, SubjectService } from './services/shared/subject.service';
import { courseService, CourseService } from './services/university/course.service';
import { departmentService, DepartmentService } from './services/university/department.service';
import { facultyService, FacultyService } from './services/university/faculty.service';
import { universityService, UniversityService } from './services/university/university.service';
import { learningProgramService, LearningProgramService } from './services/learning-org/learning-program.service';
import { organizationService, LearningOrganizationService } from './services/learning-org/organization.service';
import { classRoutes } from './api/shared/classes.routes';
import { educatorRoutes } from './api/shared/educators.routes';
import { enrollmentRoutes } from './api/shared/enrollments.routes';
import { invitationRoutes } from './api/shared/invitations.routes';
import { permissionRoutes } from './api/shared/permissions.routes';
import { programRoutes } from './api/shared/programs.routes';
import { studentRoutes } from './api/shared/students.routes';
import { subjectRoutes } from './api/shared/subjects.routes';
import { courseRoutes } from './api/university/courses.routes';
import { departmentRoutes } from './api/university/departments.routes';
import { facultyRoutes } from './api/university/faculties.routes';
import { universityRoutes } from './api/university/universities.routes';
import { learningProgramRoutes } from './api/learning-org/learning-programs.routes';
import { organizationRoutes } from './api/learning-org/organizations.routes';

export interface IModule {
  name: string;
  version: string;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}

export interface IEducationModule extends IModule {
  name: 'education';
  version: '1.0.0';
  students: StudentService;
  educators: EducatorService;
  programs: ProgramService;
  subjects: SubjectService;
  classes: ClassService;
  enrollments: EnrollmentService;
  permissions: PermissionService;
  invitations: InvitationService;
  universities: UniversityService;
  faculties: FacultyService;
  departments: DepartmentService;
  courses: CourseService;
  organizations: LearningOrganizationService;
  learningPrograms: LearningProgramService;
}

export const educationRoutes = [
  ...studentRoutes,
  ...educatorRoutes,
  ...programRoutes,
  ...subjectRoutes,
  ...classRoutes,
  ...enrollmentRoutes,
  ...permissionRoutes,
  ...invitationRoutes,
  ...universityRoutes,
  ...facultyRoutes,
  ...departmentRoutes,
  ...courseRoutes,
  ...organizationRoutes,
  ...learningProgramRoutes,
];

export const educationModule: IEducationModule = {
  name: 'education',
  version: '1.0.0',
  students: studentService,
  educators: educatorService,
  programs: programService,
  subjects: subjectService,
  classes: classService,
  enrollments: enrollmentService,
  permissions: permissionService,
  invitations: invitationService,
  universities: universityService,
  faculties: facultyService,
  departments: departmentService,
  courses: courseService,
  organizations: organizationService,
  learningPrograms: learningProgramService,
  async initialize(): Promise<void> {},
  async shutdown(): Promise<void> {},
};
