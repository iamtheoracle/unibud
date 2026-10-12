// Honest placeholder until a real server-side AI provider is configured.
// Do not return synthetic "Bud" answers as if they came from an AI model.
export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON request body' }),
    };
  }

  // No real provider adapter or server-side provider credentials are configured
  // in this repository yet. Fail explicitly instead of fabricating an answer.
  return {
    statusCode: 503,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      error: 'Bud AI is temporarily unavailable because no AI provider is configured.',
      code: 'AI_PROVIDER_NOT_CONFIGURED',
    }),
  };
};
