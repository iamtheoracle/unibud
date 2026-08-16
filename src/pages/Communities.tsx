import React, { useEffect, useState } from 'react'
import type { Community } from '../types/domain'

export default function Communities(){
  const [items, setItems] = useState<Community[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [members, setMembers] = useState<string[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    setLoading(true)
    fetch('/api/communities').then(r=>r.json()).then(b=>setItems(b.communities || [])).finally(()=>setLoading(false))
  },[])

  useEffect(()=>{
    if(selectedId){
      // fetch membership and posts for the selected community
      fetch(`/api/community?id=${encodeURIComponent(selectedId)}`).then(r=>r.json()).then(b=>{
        setMembers(b.members || [])
      })
      fetch(`/api/community-posts?id=${encodeURIComponent(selectedId)}`).then(r=>r.json()).then(b=>{
        setPosts(b.posts || [])
      })
    } else {
      setMembers([])
      setPosts([])
    }
  },[selectedId])

  const join = async (id: string)=>{
    const res = await fetch('/api/community-membership', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ communityId: id, action: 'join' }) })
    const b = await res.json()
    setMembers(b.members || [])
  }
  const leave = async (id: string)=>{
    const res = await fetch('/api/community-membership', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ communityId: id, action: 'leave' }) })
    const b = await res.json()
    setMembers(b.members || [])
  }

  return (
    <section className="communities-shell">
      <h1>Communities</h1>
      <p>Discover, join, and participate in communities.</p>
      <div style={{display:'flex',gap:16,alignItems:'flex-start'}}>
        <div style={{flex:'0 0 220px'}}>
          <h3>Your Communities</h3>
          {loading && <div>Loading...</div>}
          <ul>
            {items.map(c=> (
              <li key={c.id} style={{cursor:'pointer'}} onClick={()=>setSelectedId(c.id)}>
                <strong>{c.name}</strong> {c.private? '(private)' : ''}
              </li>
            ))}
          </ul>
        </div>
        <div style={{flex:1}}>
          {selectedId ? (
            <div>
              <h2>Community</h2>
              {(() => {
                const c = items.find(x=>x.id===selectedId)
                if(!c) return <div>Community not found</div>
                return (
                  <div>
                    <h3>{c.name} {c.private? '(private)' : ''}</h3>
                    <div>{c.description}</div>
                    <div style={{marginTop:12}}>
                      <strong>Members ({members.length})</strong>
                      <div style={{marginTop:8}}>
                        {members.slice(0,10).map((m,i)=>(<div key={i}>{m}</div>))}
                      </div>
                      <div style={{marginTop:12}}>
                        <button onClick={()=>join(c.id)}>Join</button>
                        <button onClick={()=>leave(c.id)} style={{marginLeft:8}}>Leave</button>
                      </div>
                    </div>
                    <div style={{marginTop:20}}>
                      <h4>Posts</h4>
                      {posts.length===0 && <div>No posts yet.</div>}
                      <ul>
                        {posts.map(p=> (
                          <li key={p.id}><strong>{p.author}</strong>: {p.text}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              })()}
            </div>
          ) : (
            <div>Select a community to view details and posts.</div>
          )}
        </div>
      </div>
    </section>
  )
}
