import React from 'react'

export default function SquareLoading() {
  return (
    <div className="square-loading" role="status" aria-live="polite">
      <div className="loader" aria-hidden="true"></div>
      <div>Loading Square…</div>
    </div>
  )
}
