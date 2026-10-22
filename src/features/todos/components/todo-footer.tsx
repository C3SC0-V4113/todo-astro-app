import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTodos } from '@/features/todos/hooks/use-todos';

export default function TodoFooter() {
  const { activeCount, hasCompleted, clearCompleted, hydrated } = useTodos();

  const handleClear = () => {
    clearCompleted();
    const input = document.getElementById('new-todo');
    input?.focus();
  };

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Mount the live region with its first count, so loading stored data is not
          announced; later changes to the count are. */}
      {hydrated ? (
        <span aria-live="polite">
          {activeCount} {activeCount === 1 ? 'pendiente' : 'pendientes'}
        </span>
      ) : (
        <Skeleton aria-hidden className="h-6 w-24" />
      )}
      {hasCompleted && (
        <Button type="button" variant="secondary" size="sm" onClick={handleClear}>
          Limpiar completadas
        </Button>
      )}
    </div>
  );
}
