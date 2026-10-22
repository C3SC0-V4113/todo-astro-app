import { Button } from '@/components/ui/button';
import { useTodos } from '@/features/todos/hooks/use-todos';

import type { Filter } from '@/features/todos/types';

const FILTER_LABELS: Record<Filter, string> = {
  all: 'Todas',
  active: 'Pendientes',
  completed: 'Completadas',
};

export default function TodoFilters() {
  const { filter, setFilter } = useTodos();

  return (
    <div className="flex gap-2" role="group" aria-label="Filtrar tareas">
      {(['all', 'active', 'completed'] as const).map((value) => (
        <Button
          key={value}
          type="button"
          variant={filter === value ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter(value)}
          aria-pressed={filter === value}
        >
          {FILTER_LABELS[value]}
        </Button>
      ))}
    </div>
  );
}
