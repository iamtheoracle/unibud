import React from 'react'

export default function SquareSection({ title, children }: { title: string; children: React.ReactNode }) {
  const id = `section-${title.replace(/\s+/g,'-').toLowerCase()}`
  return (
    <section className="square-section" aria-labelledby={id}>
      <h2 id={id} className="square-section-title">{title}</h2>
      <div className="square-section-body">{children}</div>
    </section>
  )
}
