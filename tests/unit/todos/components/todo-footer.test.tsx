/* eslint-disable testing-library/no-manual-cleanup */
import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import TodoFooter from '@/features/todos/components/todo-footer';

import { createFakeRepository, renderWithProvider } from '../test-utils';

afterEach(cleanup);

describe('TodoFooter', () => {
  it('announces the active count with aria-live', async () => {
    renderWithProvider(<TodoFooter />, {
      repository: createFakeRepository({
        todos: [
          { id: '1', title: 'Uno', completed: false, createdAt: 1 },
          { id: '2', title: 'Dos', completed: true, createdAt: 2 },
        ],
        filter: 'all',
      }),
    });

    await waitFor(() => {
      expect(screen.getByText(/pendiente/i)).not.toBeNull();
    });

    const counter = screen.getByText(/pendiente/i);
    expect(counter.getAttribute('aria-live')).toBe('polite');
  });

  it('shows clear completed button only when there are completed todos', async () => {
    const user = userEvent.setup();
    renderWithProvider(<TodoFooter />, {
      repository: createFakeRepository({
        todos: [
          { id: '1', title: 'Uno', completed: false, createdAt: 1 },
          { id: '2', title: 'Dos', completed: true, createdAt: 2 },
        ],
        filter: 'all',
      }),
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Limpiar completadas/i })).not.toBeNull();
    });

    await user.click(screen.getByRole('button', { name: /Limpiar completadas/i }));

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Limpiar completadas/i })).toBeNull();
    });
  });
});
