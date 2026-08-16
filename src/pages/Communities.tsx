import React, { useEffect, useState } from 'react'

type Community = { id: string; name: string; description?: string; private?: boolean }

export default function Communities(){
  const [items, setItems] = useState<Community[]>([])

  useEffect(()=>{
    fetch('/api/communities').then(r=>r.json()).then(b=>setItems(b.communities || []))
  },[])

  return (
    <section>
      <h1>Communities</h1>
      <p>Discover, join, and participate in communities.</p>
      <ul>
        {items.map(c=> (
          <li key={c.id}>
            <strong>{c.name}</strong> {c.private? '(private)' : ''}
            <div>{c.description}</div>
          </li>
        ))}
      </ul>
    </section>
  )
}
