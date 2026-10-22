import { Skeleton } from '@/components/ui/skeleton';
import { useTodos } from '@/features/todos/hooks/use-todos';

import TodoEmptyState from './todo-empty-state';
import TodoItem from './todo-item';

// Placeholder rows reserve roughly the height of a short list. They fade in
// after a delay so a fast hydration swaps content without flashing them.
const SKELETON_ROWS = ['first', 'second', 'third'] as const;

export default function TodoList() {
  const { todos, visibleTodos, hydrated, filter } = useTodos();

  if (!hydrated) {
    return (
      <div className="flex animate-in flex-col gap-2 delay-300 duration-300 fill-mode-both fade-in">
        <p className="sr-only">Cargando tareas…</p>
        {SKELETON_ROWS.map((row) => (
          <Skeleton key={row} aria-hidden className="h-12.5 w-full" />
        ))}
      </div>
    );
  }

  if (todos.length === 0) {
    return <TodoEmptyState />;
  }

  if (visibleTodos.length === 0) {
    return <p className="text-muted-foreground">No hay tareas para mostrar.</p>;
  }

  return (
    <ul className="flex flex-col gap-2" aria-label="Lista de tareas">
      {visibleTodos.map((todo) => (
        <li key={todo.id}>
          <TodoItem todo={todo} filter={filter} />
        </li>
      ))}
    </ul>
  );
}
