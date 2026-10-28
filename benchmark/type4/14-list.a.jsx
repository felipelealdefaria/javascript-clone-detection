export function TodoList({ todos, onToggle }) {
  return (
    <ul className="todos">
      {todos.map((todo) => (
        <li key={todo.id} className={todo.done ? 'done' : ''}>
          <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
          {todo.title}
        </li>
      ))}
    </ul>
  )
}
