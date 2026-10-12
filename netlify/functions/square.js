// Development-only placeholder Square endpoint.
const items = [
  { id: 's1', title: 'Assignment due: CS101', kind: 'assignment', excerpt: 'Problem set 4 — due Sep 20' },
  { id: 's2', title: 'Upcoming: Math Study Group', kind: 'event', excerpt: 'Tonight at 7PM in Library' },
];

export const handler = async () => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ items, mode: 'development-placeholder' }),
});
