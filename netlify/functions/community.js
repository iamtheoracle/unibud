// In-memory development community-detail endpoint.
const communities = [
  { id: 'c1', name: 'Computer Science Club', description: 'CS students and projects', private: false },
  { id: 'c2', name: 'Math Study Group', description: 'Weekly problem solving', private: true },
];
const membership = { c1: ['Alice'], c2: ['Bob'] };

export const handler = async (event) => {
  const id = (event.queryStringParameters || {}).id;
  const community = communities.find((item) => item.id === id);
  if (!community) return { statusCode: 404, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Community not found' }) };
  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ community, members: membership[id] || [] }) };
};
