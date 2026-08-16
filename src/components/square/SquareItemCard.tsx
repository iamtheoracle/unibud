import React from 'react'
import type { SquareItem } from '../../types/domain'

export default function SquareItemCard({ item }: { item: SquareItem }) {
  return (
    <article className={`square-item-card square-item-${item.kind}`} aria-labelledby={`item-${item.id}-title`}>
      <div className="square-item-main">
        <h3 id={`item-${item.id}-title`} className="square-item-title">{item.title}</h3>
        {item.excerpt && <p className="square-item-excerpt">{item.excerpt}</p>}
      </div>
      <div className="square-item-meta">
        <span className="square-item-kind">{item.kind}</span>
      </div>
    </article>
  )
}
