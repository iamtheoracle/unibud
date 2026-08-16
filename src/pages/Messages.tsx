import React, { useEffect, useState } from 'react'

type Msg = { id: string; from: string; text: string }

export default function Messages(){
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [text, setText] = useState('')

  useEffect(()=>{ fetch('/api/messages').then(r=>r.json()).then(b=>setMsgs(b.messages||[])) },[])

  const send = async ()=>{
    const res = await fetch('/api/messages', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({text}) })
    const b = await res.json()
    setMsgs(b.messages||[])
    setText('')
  }

  return (
    <section>
      <h1>Messages</h1>
      <div className="messages-list">
        {msgs.map(m=> <div key={m.id} className="message"><strong>{m.from}:</strong> {m.text}</div>)}
      </div>
      <div className="messages-compose">
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Write a message" />
        <button onClick={send}>Send</button>
      </div>
    </section>
  )
}
