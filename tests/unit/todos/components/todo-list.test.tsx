/* eslint-disable testing-library/no-manual-cleanup */
import { cleanup, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';

import TodoInput from '@/features/todos/components/todo-input';
import TodoList from '@/features/todos/components/todo-list';
import { TodoProvider } from '@/features/todos/state/todo-context';

import { createFakeRepository, renderWithProvider } from '../test-utils';

afterEach(cleanup);

describe('TodoList', () => {
  it('renders the loading message and the new-task input in static HTML', () => {
    const view = renderToString(
      <TodoProvider repository={createFakeRepository()}>
        <TodoInput />
        <TodoList />
      </TodoProvider>
    );

    expect(view).toContain('Cargando tareas…');
    expect(view).toContain('Nueva tarea');
  });

  it('shows an empty message when hydrated and there are no visible todos', async () => {
    renderWithProvider(<TodoList />, {
      repository: createFakeRepository({ todos: [], filter: 'all' }),
    });

    await waitFor(() => {
      expect(screen.queryByText(/Cargando tareas…/i)).toBeNull();
    });

    expect(screen.getByText(/No hay tareas para mostrar/i)).not.toBeNull();
  });

  it('renders visible todos after hydration', async () => {
    renderWithProvider(<TodoList />, {
      repository: createFakeRepository({
        todos: [
          { id: '1', title: 'Tarea uno', completed: false, createdAt: 1 },
          { id: '2', title: 'Tarea dos', completed: true, createdAt: 2 },
        ],
        filter: 'all',
      }),
    });

    await waitFor(() => {
      expect(screen.queryByText(/Cargando tareas…/i)).toBeNull();
    });

    expect(screen.getByRole('list', { name: /Lista de tareas/i })).not.toBeNull();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Tarea uno')).not.toBeNull();
    expect(screen.getByText('Tarea dos')).not.toBeNull();
  });
});
