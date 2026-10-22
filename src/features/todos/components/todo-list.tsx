'use client';

import { useTodos } from '@/features/todos/hooks/use-todos';

import TodoItem from './todo-item';

export default function TodoList() {
  const { visibleTodos, hydrated } = useTodos();

  if (!hydrated) {
    return <p className="text-muted-foreground">Cargando tareas…</p>;
  }

  if (visibleTodos.length === 0) {
    return <p className="text-muted-foreground">No hay tareas para mostrar.</p>;
  }

  return (
    <ul className="flex flex-col gap-2" aria-label="Lista de tareas">
      {visibleTodos.map((todo) => (
        <li key={todo.id}>
          <TodoItem todo={todo} />
        </li>
      ))}
    </ul>
  );
}
