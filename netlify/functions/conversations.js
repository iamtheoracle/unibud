// Conversations and messages (in-memory)
let conversations = [
  { id: 'conv1', title: 'Project Group', snippet: 'Let\'s meet Wednesday' },
  { id: 'conv2', title: 'Study Buddy', snippet: 'Are you free tonight?' }
]

let messages = {
  conv1: [ { id: 'm1', from: 'Alice', text: 'Welcome to the project chat' } ],
  conv2: [ { id: 'm2', from: 'Bob', text: 'Ready to study?' } ]
}

exports.handler = async function(event) {
  if(event.httpMethod === 'GET'){
    const q = event.queryStringParameters || {}
    const id = q.id
    if(id){
      return { statusCode: 200, body: JSON.stringify({ messages: messages[id] || [] }) }
    }
    return { statusCode: 200, body: JSON.stringify({ conversations }) }
  }
  if(event.httpMethod === 'POST'){
    try{
      const body = JSON.parse(event.body || '{}')
      const conversationId = body.conversationId || 'conv1'
      const text = body.text || ''
      const item = { id: `m${Date.now()}`, from: 'You', text }
      messages[conversationId] = messages[conversationId] || []
      messages[conversationId].push(item)
      return { statusCode: 200, body: JSON.stringify({ messages: messages[conversationId] }) }
    }catch(e){
      return { statusCode: 400, body: JSON.stringify({ error: 'bad' }) }
    }
  }
  return { statusCode: 405, body: JSON.stringify({ error: 'method not allowed' }) }
}
