// Square items (personalized overview mock)
const items = [
  { id: 's1', title: 'Assignment due: CS101', kind: 'assignment', excerpt: 'Problem set 4 — due Sep 20' },
  { id: 's2', title: 'Upcoming: Math Study Group', kind: 'event', excerpt: 'Tonight at 7PM in Library' }
]

exports.handler = async function() {
  return { statusCode: 200, body: JSON.stringify({ items }) }
}
