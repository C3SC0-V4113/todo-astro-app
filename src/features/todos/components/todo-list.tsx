import { Skeleton } from '@/components/ui/skeleton';
import { useTodos } from '@/features/todos/hooks/use-todos';

import TodoItem from './todo-item';

// Placeholder rows reserve roughly the height of a short list. With motion allowed
// they fade in after a delay, so a fast hydration swaps content without flashing
// them; under `prefers-reduced-motion: reduce` they render static and at once.
const SKELETON_ROWS = ['first', 'second', 'third'] as const;

export default function TodoList() {
  const { visibleTodos, hydrated, filter } = useTodos();

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-2 motion-safe:animate-in motion-safe:delay-300 motion-safe:duration-300 motion-safe:fill-mode-both motion-safe:fade-in">
        <p className="sr-only">Cargando tareas…</p>
        {SKELETON_ROWS.map((row) => (
          <Skeleton key={row} aria-hidden className="h-12.5 w-full" />
        ))}
      </div>
    );
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
