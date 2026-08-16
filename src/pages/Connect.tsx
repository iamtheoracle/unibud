import React, { useState } from 'react'

export default function Connect(){
  const [q, setQ] = useState('')
  const [results, setResults] = useState<string[]>([])
  const search = async ()=>{
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
    const body = await res.json()
    setResults(body.results || [])
  }

  return (
    <section>
      <h1>Connect</h1>
      <p>Search for students and discover connections.</p>
      <div>
        <input placeholder="Search students" value={q} onChange={e=>setQ(e.target.value)} />
        <button onClick={search}>Search</button>
      </div>
      <ul>
        {results.map((r,i)=> <li key={i}>{r}</li>)}
      </ul>
    </section>
  )
}
