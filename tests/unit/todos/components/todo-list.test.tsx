/* eslint-disable testing-library/no-manual-cleanup */
import { cleanup, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import TodoList from '@/features/todos/components/todo-list';

import { createFakeRepository, renderWithProvider } from '../test-utils';

afterEach(cleanup);

describe('TodoList', () => {
  it('shows a loading message while not hydrated', () => {
    renderWithProvider(<TodoList />, { repository: createFakeRepository() });

    expect(screen.getByText(/Cargando tareas…/i)).not.toBeNull();
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
