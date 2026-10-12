// In-memory development conversations endpoint.
const conversations = [
  { id: 'conv1', title: 'Project Group', snippet: "Let's meet Wednesday" },
  { id: 'conv2', title: 'Study Buddy', snippet: 'Are you free tonight?' },
];
const messages = {
  conv1: [{ id: 'm1', from: 'Alice', text: 'Welcome to the project chat' }],
  conv2: [{ id: 'm2', from: 'Bob', text: 'Ready to study?' }],
};

export const handler = async (event) => {
  if (event.httpMethod === 'GET') {
    const id = (event.queryStringParameters || {}).id;
    if (id) return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: messages[id] || [] }) };
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversations }) };
  }
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const conversationId = body.conversationId;
      const text = typeof body.text === 'string' ? body.text.trim() : '';
      if (!conversationId || !text || !messages[conversationId]) return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'A valid conversationId and non-empty text are required' }) };
      const item = { id: `m${Date.now()}`, from: 'You', text };
      messages[conversationId].push(item);
      return { statusCode: 201, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: messages[conversationId] }) };
    } catch {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid JSON request body' }) };
    }
  }
  return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method not allowed' }) };
};
