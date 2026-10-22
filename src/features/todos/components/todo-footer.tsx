import { Button } from '@/components/ui/button';
import { useTodos } from '@/features/todos/hooks/use-todos';

export default function TodoFooter() {
  const { activeCount, hasCompleted, clearCompleted } = useTodos();

  return (
    <div className="flex items-center justify-between gap-4">
      <span aria-live="polite">
        {activeCount} {activeCount === 1 ? 'pendiente' : 'pendientes'}
      </span>
      {hasCompleted && (
        <Button type="button" variant="secondary" size="sm" onClick={clearCompleted}>
          Limpiar completadas
        </Button>
      )}
    </div>
  );
}
