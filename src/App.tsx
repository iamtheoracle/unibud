import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import Bud from './components/Bud'
import Square from './pages/Square'
import Connect from './pages/Connect'
import Communities from './pages/Communities'
import Messages from './pages/Messages'

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">UNIBUD</header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/square" replace />} />
          <Route path="/square" element={<Square />} />
          <Route path="/connect/*" element={<Connect />} />
          <Route path="/communities/*" element={<Communities />} />
          <Route path="/messages/*" element={<Messages />} />
        </Routes>
      </main>
      <Bud />
      <NavBar />
    </div>
  )
}
