import { useState } from 'react'

export function UserCard({ user, onSelect }) {
  const [expanded, setExpanded] = useState(false)
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')

  return (
    <div className="card" onClick={() => onSelect(user.id)}>
      <span className="avatar">{initials}</span>
      <h3>{user.name}</h3>
      {expanded && <p>{user.bio}</p>}
      <button onClick={() => setExpanded(!expanded)}>{expanded ? 'Less' : 'More'}</button>
    </div>
  )
}
