# Private Education Identity and Institution Boundaries

## Decision

Tutors, students, and institutions are distinct education-domain identities. They are not interchangeable public profile types.

This capability is documented for future implementation. It is not part of the current public launch surface and must not be exposed through public profile discovery, public institution directories, creator listings, or page/community search.

## Distinct roles

### Student
A student assignment represents a person's recognised student relationship with an institution. Student records may include an institution reference, student number/reference, programme/class, enrolment and academic status, subject to data minimisation and access policy.

### Tutor
A tutor assignment represents a person's recognised teaching relationship with an institution or approved education programme. It has its own approval state, subject areas, teaching status, and tutor-specific permissions.

A tutor is not automatically a student. A student is not automatically a tutor. An account may hold both only through two distinct, separately approved role assignments. The user's public personal profile does not reveal either role by default.

### Institution
An institution is a private, verified organisational record in the education domain, not a public page/community profile by default. It can hold distinct authority over student records and tutor records.

Institution powers must be explicitly granted and separated:
- manage student records;
- manage tutor records;
- assign or approve student roles;
- assign or approve tutor roles;
- establish tutor-to-student relationships.

Permission over one group never implies permission over the other. Institution status and authority must be verified before any operation is accepted.

## Tutor-to-student relationships

A tutor may be linked to a student through an institution-authorised relationship with an explicit lifecycle: proposed, active, paused, ended. A link must record who created it and when. It must not be created solely because two users follow each other, chat, share a course, or appear in the same institution.

Future implementation must define safeguarding, consent, age handling, parent/guardian involvement where required, conflict-of-interest controls, and audit rules before enabling tutor-student messaging, sessions, assessment, or access to student records.

## Privacy and visibility

- Institution records are private and not publicly listed in the current phase.
- Tutor records are private and not publicly listed in the current phase.
- Student records are private and not publicly listed.
- Public profiles do not automatically expose student enrolment, tutor status, institution affiliation, student references, subject assignments, or private education relationships.
- No public search, recommendation, or indexing of these records until a separately approved product and privacy design exists.

## Current implementation boundary

The shared contracts describe the future data boundary only. No institution verification, student enrolment, tutor approval, record storage, public directory, tutor marketplace, tutor-student chat, or academic access-control service is implemented by this specification.

Before implementation, define institution verification, authority delegation, data retention, education-record privacy, safeguarding, consent, audit, and jurisdiction-specific legal requirements.
