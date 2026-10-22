import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function TodoEmptyState() {
  // Focus moves only on explicit activation: the CTA promises "add a task" and the
  // labelled input is the one place to do that, like an in-page skip link.
  const focusNewTodo = () => {
    document.getElementById('new-todo')?.focus();
  };

  return (
    // Same height as the three hydration skeleton rows, so an empty store loads
    // without shifting the filters and footer.
    <div className="flex min-h-41.5 flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-4 text-center">
      <div className="flex flex-col gap-1">
        <h2 className="font-medium text-balance">Aún no tienes tareas</h2>
        <p className="text-sm text-pretty text-muted-foreground">
          Escribe en «Nueva tarea» y pulsa Enter para guardarla.
        </p>
      </div>
      <Button type="button" variant="outline" onClick={focusNewTodo}>
        <Plus data-icon="inline-start" aria-hidden />
        Añadir tu primera tarea
      </Button>
    </div>
  );
}
