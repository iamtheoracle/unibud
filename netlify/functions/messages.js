// In-memory development messages endpoint.
let messages = [{ id: 'm1', from: 'Alice', text: 'Welcome to UNIBUD!' }];

export const handler = async (event) => {
  if (event.httpMethod === 'GET') return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages }) };
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const text = typeof body.text === 'string' ? body.text.trim() : '';
      if (!text) return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Non-empty text is required' }) };
      messages = messages.concat({ id: `m${Date.now()}`, from: 'You', text });
      return { statusCode: 201, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages }) };
    } catch {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid JSON request body' }) };
    }
  }
  return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method not allowed' }) };
};
