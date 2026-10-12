// Development-only placeholder search. Replace with real indexed search before production.
export const handler = async (event) => {
  const query = ((event.queryStringParameters || {}).q || '').trim();
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ results: [], query, message: 'Search index is not configured.' }),
  };
};
