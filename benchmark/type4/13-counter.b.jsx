import { useReducer } from 'react'

export function Counter() {
  const [count, bump] = useReducer((n) => n + 1, 0)
  return (
    <div>
      <span>{count}</span>
      <button onClick={bump}>+1</button>
    </div>
  )
}
