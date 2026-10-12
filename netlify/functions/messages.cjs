let messages = [ { id: 'm1', from: 'Alice', text: 'Welcome to UNIBUD!' } ]

exports.handler = async function(event) {
  if(event.httpMethod === 'GET'){
    return { statusCode: 200, body: JSON.stringify({ messages }) }
  }
  if(event.httpMethod === 'POST'){
    try{
      const body = JSON.parse(event.body || '{}')
      const text = body.text || ''
      const item = { id: `m${Date.now()}`, from: 'You', text }
      messages = messages.concat(item)
      return { statusCode: 200, body: JSON.stringify({ messages }) }
    }catch(e){
      return { statusCode: 400, body: JSON.stringify({ error: 'bad' }) }
    }
  }
  return { statusCode: 405, body: JSON.stringify({ error: 'method not allowed' }) }
}
