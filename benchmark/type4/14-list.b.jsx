export function Tasks(props) {
  const rows = []
  for (const task of props.todos) {
    const toggle = () => props.onToggle(task.id)
    rows.push(
      <li key={task.id} className={task.done ? 'done' : ''}>
        <input type="checkbox" checked={task.done} onChange={toggle} />
        {task.title}
      </li>,
    )
  }
  return <ul className="todos">{rows}</ul>
}
