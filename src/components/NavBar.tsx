import React from 'react'
import { NavLink } from 'react-router-dom'

export default function NavBar() {
  return (
    <nav className="nav-bar">
      <NavLink to="/square" className={({isActive})=> isActive? 'nav-item active' : 'nav-item'}>Square</NavLink>
      <NavLink to="/connect" className={({isActive})=> isActive? 'nav-item active' : 'nav-item'}>Connect</NavLink>
      <NavLink to="/communities" className={({isActive})=> isActive? 'nav-item active' : 'nav-item'}>Communities</NavLink>
      <NavLink to="/messages" className={({isActive})=> isActive? 'nav-item active' : 'nav-item'}>Messages</NavLink>
    </nav>
  )
}
