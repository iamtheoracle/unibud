// simple membership handler
const membership = {
  c1: ['Alice'],
  c2: ['Bob']
}

exports.handler = async function(event) {
  if(event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'method not allowed' }) }
  try{
    const body = JSON.parse(event.body || '{}')
    const { communityId, action } = body
    if(!communityId || !action) return { statusCode: 400, body: JSON.stringify({ error: 'missing' }) }
    membership[communityId] = membership[communityId] || []
    const user = 'You' // dev placeholder
    if(action === 'join'){
      if(!membership[communityId].includes(user)) membership[communityId].push(user)
    } else if(action === 'leave'){
      membership[communityId] = membership[communityId].filter(m=>m!==user)
    }
    return { statusCode: 200, body: JSON.stringify({ members: membership[communityId] }) }
  }catch(e){
    return { statusCode: 400, body: JSON.stringify({ error: 'bad' }) }
  }
}
