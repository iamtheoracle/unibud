// In-memory development membership handler.
const membership = {
  c1: ['Alice'],
  c2: ['Bob'],
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { communityId, action } = body;
    if (!communityId || !['join', 'leave'].includes(action)) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'A valid communityId and join/leave action are required' }) };
    }
    membership[communityId] = membership[communityId] || [];
    const user = 'You'; // Development-only placeholder; replace with authenticated identity before production.
    if (action === 'join' && !membership[communityId].includes(user)) membership[communityId].push(user);
    if (action === 'leave') membership[communityId] = membership[communityId].filter((member) => member !== user);
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ members: membership[communityId] }) };
  } catch {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid JSON request body' }) };
  }
};
