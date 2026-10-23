import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';

export default function TodoEmptyState() {
  // Focus moves only on explicit activation: the CTA promises "add a task" and the
  // labelled input is the one place to do that, like an in-page skip link.
  const focusNewTodo = () => {
    document.getElementById('new-todo')?.focus();
  };

  return (
    // Same height as the three hydration skeleton rows, so an empty store loads
    // without shifting the filters and footer.
    // eslint-disable-next-line shadcn/no-restyle -- Empty provides dashed style but no border width.
    <Empty className="min-h-41.5 border">
      <EmptyHeader>
        <EmptyTitle>
          <h2>Aún no tienes tareas</h2>
        </EmptyTitle>
        <EmptyDescription>Escribe en «Nueva tarea» y pulsa Enter para guardarla.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" variant="outline" onClick={focusNewTodo}>
          <Plus data-icon="inline-start" aria-hidden />
          Añadir tu primera tarea
        </Button>
      </EmptyContent>
    </Empty>
  );
}
