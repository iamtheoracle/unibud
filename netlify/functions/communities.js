// Simple in-memory communities endpoint
const communities = [
  { id: 'c1', name: 'Computer Science Club', description: 'CS students and projects', private: false },
  { id: 'c2', name: 'Math Study Group', description: 'Weekly problem solving', private: true }
];

export const handler = async () => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ communities }),
});
