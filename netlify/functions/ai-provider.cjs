// Minimal Netlify Function mock for AI provider. This returns deterministic responses and must not call external LLMs.
exports.handler = async function(event, context) {
  try {
    const body = JSON.parse(event.body || '{}')
    const prompt = body.prompt || ''
    // Controlled deterministic mock — do NOT call external providers here.
    const text = `MockBud: I heard you ask "${prompt}". This is a deterministic mock response for development.`
    return {
      statusCode: 200,
      body: JSON.stringify({ text })
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'invalid request' }) }
  }
}
