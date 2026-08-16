import React, { useEffect, useState, useCallback } from 'react'
import SquareHeader from '../components/square/SquareHeader'
import SquareSection from '../components/square/SquareSection'
import SquareItemCard from '../components/square/SquareItemCard'
import SquareEmptyState from '../components/square/SquareEmptyState'
import SquareLoading from '../components/square/SquareLoading'
import type { SquareItem } from '../types/domain'

type FetchState = {
  loading: boolean
  error: string | null
  items: SquareItem[] | null
}

export default function Square() {
  const [state, setState] = useState<FetchState>({ loading: true, error: null, items: null })

  const fetchItems = useCallback(async () => {
    setState({ loading: true, error: null, items: null })
    try {
      const res = await fetch('/api/square')
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      const body = await res.json()
      const items: SquareItem[] = Array.isArray(body.items) ? body.items : []
      setState({ loading: false, error: null, items })
    } catch (err: any) {
      setState({ loading: false, error: err?.message || 'Unknown error', items: null })
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  if (state.loading) return (
    <main className="square-page">
      <SquareHeader />
      <div className="square-content">
        <SquareLoading />
      </div>
    </main>
  )

  if (state.error) return (
    <main className="square-page">
      <SquareHeader />
      <div className="square-content">
        <div role="alert" className="square-error">
          <div>Unable to load your Square items: {state.error}</div>
          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={fetchItems} aria-label="Retry loading Square items">Retry</button>
          </div>
        </div>
      </div>
    </main>
  )

  const items = state.items || []

  if (items.length === 0) return (
    <main className="square-page">
      <SquareHeader />
      <div className="square-content">
        <SquareEmptyState onRefresh={fetchItems} />
      </div>
    </main>
  )

  const priority = items.filter(i => i.kind === 'assignment' || i.kind === 'task').slice(0, 3)
  const upcoming = items.filter(i => !priority.includes(i))

  return (
    <main className="square-page">
      <SquareHeader />
      <div className="square-content">
        <SquareSection title="Today">
          <div className="square-priority">
            {priority.length === 0 ? <div className="square-note">No priority items for today.</div> :
              priority.map(i => <SquareItemCard key={i.id} item={i} />)
            }
          </div>
        </SquareSection>

        <SquareSection title="Upcoming">
          <div className="square-upcoming">
            {upcoming.map(i => <SquareItemCard key={i.id} item={i} />)}
          </div>
        </SquareSection>
      </div>
    </main>
  )
}
