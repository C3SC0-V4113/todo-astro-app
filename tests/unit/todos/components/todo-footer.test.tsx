import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import TodoFooter from '@/features/todos/components/todo-footer';
import TodoInput from '@/features/todos/components/todo-input';
import TodoList from '@/features/todos/components/todo-list';
import { TodoProvider } from '@/features/todos/state/todo-context';

import { createFakeRepository, renderWithProvider } from '../test-utils';

describe('TodoFooter', () => {
  it('shows a decorative skeleton instead of a count in static HTML', () => {
    const view = renderToString(
      <TodoProvider
        repository={createFakeRepository({
          todos: [{ id: '1', title: 'Guardada', completed: false, createdAt: 1 }],
          filter: 'all',
        })}
      >
        <TodoFooter />
      </TodoProvider>
    );

    expect(view).toContain('data-slot="skeleton"');
    expect(view).toContain('aria-hidden="true"');
    expect(view).not.toContain('pendiente');
    expect(view).not.toContain('aria-live');
  });

  it('mounts the polite live region with the stored count after hydration', () => {
    renderWithProvider(<TodoFooter />, {
      repository: createFakeRepository({
        todos: [
          { id: '1', title: 'Una', completed: false, createdAt: 1 },
          { id: '2', title: 'Dos', completed: false, createdAt: 2 },
        ],
        filter: 'all',
      }),
    });

    expect(screen.getByText('2 pendientes')).toHaveAttribute('aria-live', 'polite');
    expect(document.body.innerHTML).not.toContain('data-slot="skeleton"');
  });

  it('returns focus to the new-task input after clearing completed', async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <>
        <TodoInput />
        <TodoList />
        <TodoFooter />
      </>,
      {
        repository: createFakeRepository({
          todos: [
            { id: '1', title: 'Hecha', completed: true, createdAt: 1 },
            { id: '2', title: 'Pendiente', completed: false, createdAt: 2 },
          ],
          filter: 'all',
        }),
      }
    );

    await waitFor(() => {
      expect(screen.queryByText(/Cargando tareas…/i)).toBeNull();
    });

    await user.click(screen.getByRole('button', { name: /Limpiar completadas/i }));

    await waitFor(() => {
      expect(screen.queryByRole('checkbox', { name: /Hecha/i })).toBeNull();
    });

    expect(screen.getByRole('textbox', { name: /Nueva tarea/i })).toHaveFocus();
  });
});
