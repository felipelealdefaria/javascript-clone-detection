export interface Preset {
  id: string
  label: string
  a: string
  b: string
}

// The first three pairs come from the 2021 thesis examples (test/fixtures/legacy).
export const PRESETS: Preset[] = [
  {
    id: 'exact',
    label: 'Exact copy',
    a: `export const arrowFunction = (value) => {
  const { type } = value
  return type
}`,
    b: `export function regularFunction (value) {
  // this is a regular function
  const { type } = value
  return type
}`,
  },
  {
    id: 'renamed',
    label: 'Renamed',
    a: `export const arrowTwo = (op, valueOne, valueTwo) => {
  // this function aims to verify if
  // operation is equal sum and perform it
  if (op === 'sum') {
    return valueOne + valueTwo
  } else {
    return valueOne - valueTwo
  }
}`,
    b: `export function regularTwo (state, vOne, vTwo) {
  if (state === 'sum') {
    return vOne + vTwo
  } else {
    return vOne - vTwo // subtract the values
  }
}`,
  },
  {
    id: 'edited',
    label: 'Edited',
    a: `export function formatPrice(amount, currency, locale = 'pt-BR') {
  if (amount == null || Number.isNaN(amount)) return '-'
  const value = Math.round(amount * 100) / 100
  const formatted = new Intl.NumberFormat(locale, { minimumFractionDigits: 2 }).format(value)
  const symbol = currency === 'BRL' ? 'R$' : currency
  return \`\${symbol} \${formatted}\`
}`,
    b: `// Copied from formatPrice, with an extra guard.
export function formatCost(total, code, locale = 'en-US') {
  if (total == null || Number.isNaN(total)) return '-'
  if (total < 0) return 'negative'
  const value = Math.round(total * 100) / 100
  const formatted = new Intl.NumberFormat(locale, { minimumFractionDigits: 2 }).format(value)
  const symbol = code === 'USD' ? '$' : code
  return \`\${symbol} \${formatted}\`
}`,
  },
  {
    id: 'behavior',
    label: 'Same behavior',
    a: `export function binarySearch(sorted, target) {
  let low = 0
  let high = sorted.length - 1
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    if (sorted[mid] === target) return mid
    if (sorted[mid] < target) low = mid + 1
    else high = mid - 1
  }
  return -1
}`,
    b: `export function search(list, wanted, from = 0, to = list.length - 1) {
  if (from > to) return -1
  const middle = (from + to) >> 1
  switch (Math.sign(list[middle] - wanted)) {
    case 0:
      return middle
    case 1:
      return search(list, wanted, from, middle - 1)
    default:
      return search(list, wanted, middle + 1, to)
  }
}`,
  },
  {
    id: 'react',
    label: 'React component',
    a: `export function UserCard({ user, onSelect }) {
  const [expanded, setExpanded] = useState(false)
  const initials = user.name.split(' ').map((part) => part[0]).join('')

  return (
    <div className="card" onClick={() => onSelect(user.id)}>
      <span className="avatar">{initials}</span>
      <h3>{user.name}</h3>
      {expanded && <p>{user.bio}</p>}
      <button onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Less' : 'More'}
      </button>
    </div>
  )
}`,
    b: `interface Props {
  member: { id: string; name: string; bio: string }
  onPick: (id: string) => void
}

export const TeamMemberCard = ({ member, onPick }: Props) => {
  const [open, setOpen] = useState<boolean>(false)
  const letters = member.name.split(' ').map((word) => word[0]).join('')

  return (
    <div className="member" onClick={() => onPick(member.id)}>
      <span className="badge">{letters}</span>
      <h3>{member.name}</h3>
      {open && <p>{member.bio}</p>}
      <button onClick={() => setOpen(!open)}>{open ? 'Hide' : 'Show'}</button>
    </div>
  )
}`,
  },
]
