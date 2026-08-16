// community posts in-memory store
const posts = {
  c1: [ { id: 'p1', communityId: 'c1', author: 'Alice', text: 'Welcome to CS Club!', createdAt: new Date().toISOString() } ],
  c2: []
}

exports.handler = async function(event) {
  const q = event.queryStringParameters || {}
  const id = q.id
  if(event.httpMethod === 'GET'){
    return { statusCode: 200, body: JSON.stringify({ posts: posts[id] || [] }) }
  }
  if(event.httpMethod === 'POST'){
    try{
      const body = JSON.parse(event.body || '{}')
      const id = body.communityId
      const text = body.text || ''
      const item = { id: `p${Date.now()}`, communityId: id, author: 'You', text, createdAt: new Date().toISOString() }
      posts[id] = posts[id] || []
      posts[id].push(item)
      return { statusCode: 200, body: JSON.stringify({ post: item }) }
    }catch(e){
      return { statusCode: 400, body: JSON.stringify({ error: 'bad' }) }
    }
  }
  return { statusCode: 405, body: JSON.stringify({ error: 'method not allowed' }) }
}
