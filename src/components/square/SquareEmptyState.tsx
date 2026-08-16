import React from 'react'

export default function SquareEmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="square-empty" role="status" aria-live="polite">
      <div className="square-empty-title">Nothing for now</div>
      <div className="square-empty-text">You don't have any items in Square right now. When assignments, events, or important items are available they'll appear here.</div>
      <button className="btn" onClick={onRefresh} aria-label="Refresh Square items">Refresh</button>
    </div>
  )
}
