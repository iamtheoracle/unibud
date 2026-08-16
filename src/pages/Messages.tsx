import React, { useEffect, useState } from 'react'

type Msg = { id: string; from: string; text: string }

type Conversation = { id: string; title: string; snippet?: string }

export default function Messages(){
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [text, setText] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(()=>{
    fetch('/api/conversations').then(r=>r.json()).then(b=>setConversations(b.conversations||[]))
  },[])

  useEffect(()=>{
    if(selected){
      fetch(`/api/conversations?id=${encodeURIComponent(selected)}`).then(r=>r.json()).then(b=>setMsgs(b.messages||[]))
    } else {
      // load default messages
      fetch('/api/messages').then(r=>r.json()).then(b=>setMsgs(b.messages||[]))
    }
  },[selected])

  const send = async ()=>{
    const payload = { text, conversationId: selected }
    const res = await fetch('/api/conversations', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    const b = await res.json()
    if(selected) setMsgs(b.messages||[])
    else setMsgs(b.messages||[])
    setText('')
  }

  return (
    <section style={{display:'flex',gap:16}}>
      <aside style={{width:220}}>
        <h2>Inbox</h2>
        <ul>
          {conversations.map(c=> (
            <li key={c.id} style={{cursor:'pointer'}} onClick={()=>setSelected(c.id)}>
              <strong>{c.title}</strong>
              <div style={{fontSize:12,color:'#666'}}>{c.snippet}</div>
            </li>
          ))}
        </ul>
      </aside>
      <div style={{flex:1}}>
        <h1>Messages</h1>
        <div className="messages-list">
          {msgs.map(m=> <div key={m.id} className="message"><strong>{m.from}:</strong> {m.text}</div>)}
        </div>
        <div className="messages-compose">
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="Write a message" />
          <button onClick={send}>Send</button>
        </div>
      </div>
    </section>
  )
}
