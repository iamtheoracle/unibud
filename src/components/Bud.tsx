import React, { useState } from 'react'

// Bud is available globally as a contextual assistant. This is a minimal placeholder that opens a small chat panel.
export default function Bud(){
  const [open, setOpen] = useState(false)
  return (
    <div className={`bud-root ${open ? 'open' : ''}`}>
      <button className="bud-toggle" onClick={()=>setOpen(v=>!v)}>Bud</button>
      {open && (
        <div className="bud-panel">
          <div className="bud-header">Bud — your student assistant</div>
          <div className="bud-body">Bud is online (mock). Try search in Connect or ask for study help.</div>
        </div>
      )}
    </div>
  )
}
