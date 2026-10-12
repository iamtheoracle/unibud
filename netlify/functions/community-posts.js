// In-memory development community-posts endpoint.
const posts = {
  c1: [{ id: 'p1', communityId: 'c1', author: 'Alice', text: 'Welcome to CS Club!', createdAt: new Date().toISOString() }],
  c2: [],
};

export const handler = async (event) => {
  const query = event.queryStringParameters || {};
  if (event.httpMethod === 'GET') {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ posts: posts[query.id] || [] }) };
  }
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const communityId = body.communityId;
      const text = typeof body.text === 'string' ? body.text.trim() : '';
      if (!communityId || !text) return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'communityId and non-empty text are required' }) };
      const item = { id: `p${Date.now()}`, communityId, author: 'You', text, createdAt: new Date().toISOString() };
      posts[communityId] = posts[communityId] || [];
      posts[communityId].push(item);
      return { statusCode: 201, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ post: item }) };
    } catch {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid JSON request body' }) };
    }
  }
  return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method not allowed' }) };
};
