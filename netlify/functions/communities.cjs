// Simple in-memory communities endpoint
const communities = [
  { id: 'c1', name: 'Computer Science Club', description: 'CS students and projects', private: false },
  { id: 'c2', name: 'Math Study Group', description: 'Weekly problem solving', private: true }
]

exports.handler = async function() {
  return { statusCode: 200, body: JSON.stringify({ communities }) }
}
