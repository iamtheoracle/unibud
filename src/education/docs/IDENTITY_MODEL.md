# Unified Identity Model

The module separates a platform user identity from education-specific identities.

## Core Identity Rules

- `userId` links a student or educator record to the broader UniBud identity system.
- `Student` and `Educator` records hold profile details and lifecycle status for education use cases.
- Context records (`StudentContext`, `EducatorContext`) attach a person to a university or learning organization without duplicating the base profile.

## Why Contexts Exist

A single learner or educator may participate across multiple institutions. Context records make institutional membership explicit and allow per-context fields such as enrollment number, assignment date, or completion state.

## Authorization Model

Permissions are defined centrally and granted to users through `UserPermission` records. Grants can be global or context-bound using the optional `context` value. This allows UniBud to represent platform-wide roles as well as institution-scoped capabilities.

## Invitations

Invitations bridge anonymous email addresses to formal student or educator records. Accepting an invitation promotes the email holder into the appropriate identity type and preserves the originating organization/program linkage.
