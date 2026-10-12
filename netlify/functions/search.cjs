// Simple mock search function
exports.handler = async function(event) {
  const q = (event.queryStringParameters && event.queryStringParameters.q) || ''
  const results = q ? [
    `Student: Alice (${q})`,
    `Student: Bob (${q})`,
  ] : []
  return { statusCode: 200, body: JSON.stringify({ results }) }
}
