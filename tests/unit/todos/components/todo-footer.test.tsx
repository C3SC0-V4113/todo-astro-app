/* eslint-disable testing-library/no-manual-cleanup */
import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import TodoFooter from '@/features/todos/components/todo-footer';
import TodoInput from '@/features/todos/components/todo-input';
import TodoList from '@/features/todos/components/todo-list';

import { createFakeRepository, renderWithProvider } from '../test-utils';

afterEach(cleanup);

describe('TodoFooter', () => {
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

    // eslint-disable-next-line testing-library/no-node-access
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: /Nueva tarea/i }));
  });
});
