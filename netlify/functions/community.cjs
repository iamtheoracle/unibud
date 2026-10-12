// Community detail endpoint
const communities = [
  { id: 'c1', name: 'Computer Science Club', description: 'CS students and projects', private: false },
  { id: 'c2', name: 'Math Study Group', description: 'Weekly problem solving', private: true }
]

// membership store (in-memory)
const membership = {
  c1: ['Alice'],
  c2: ['Bob']
}

exports.handler = async function(event) {
  const q = event.queryStringParameters || {}
  const id = q.id
  const community = communities.find(c=>c.id===id)
  if(!community) return { statusCode: 200, body: JSON.stringify({ error: 'not found' }) }
  const members = membership[id] || []
  return { statusCode: 200, body: JSON.stringify({ community, members }) }
}
