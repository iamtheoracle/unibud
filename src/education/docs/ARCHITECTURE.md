# Education Module Architecture

The education module is organized into four layers: type definitions, data access models, domain services, and API route metadata. Shared concepts live under `shared/`, while university-specific and learning-organization-specific capabilities are isolated in their own folders.

## Layers

- **Types** define the canonical contracts for identities, programs, classes, enrollments, permissions, invitations, and institutional structures.
- **Models** translate Base44 entity payloads into strongly typed module objects and encapsulate CRUD operations against `base44.entities.*`.
- **Services** implement business rules such as duplicate prevention, context assignment, program-subject linkage, invitation acceptance, and institution hierarchy validation.
- **API route definitions** provide framework-agnostic endpoint metadata for documentation or server adapters.

## Bounded Areas

- **Shared**: actors, programs, subjects, classes, permissions, and invitations.
- **University**: universities, faculties, departments, and courses.
- **Learning organizations**: private/tutorial/training providers and their scheduled program offerings.

## Integration Notes

The module exports singleton service instances plus their classes for composition. `module.ts` exposes a simple lifecycle contract (`initialize` / `shutdown`) so the education module can be registered alongside future domain modules.
