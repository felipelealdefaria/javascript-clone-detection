import { useState } from 'react'

interface Props {
  member: { id: string; name: string; bio: string }
  onPick: (id: string) => void
}

// Copied from UserCard and renamed.
export const TeamMemberCard = ({ member, onPick }: Props) => {
  const [open, setOpen] = useState<boolean>(false)
  const letters = member.name
    .split(' ')
    .map((word) => word[0])
    .join('')

  return (
    <div className="member" onClick={() => onPick(member.id)}>
      <span className="badge">{letters}</span>
      <h3>{member.name}</h3>
      {open && <p>{member.bio}</p>}
      <button onClick={() => setOpen(!open)}>{open ? 'Hide' : 'Show'}</button>
    </div>
  )
}
