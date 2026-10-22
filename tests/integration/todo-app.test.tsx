/* eslint-disable testing-library/no-manual-cleanup */
import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import TodoApp from '@/features/todos/todo-app';

import { createFakeRepository, renderWithProvider } from '../unit/todos/test-utils';

afterEach(cleanup);

describe('TodoApp integration', () => {
  it('completes a full CRUD and filter flow', async () => {
    const user = userEvent.setup();
    const repository = createFakeRepository({ todos: [], filter: 'all' });
    renderWithProvider(<TodoApp />, { repository });

    await waitFor(() => {
      expect(screen.queryByText(/Cargando tareas…/i)).toBeNull();
    });

    const input = screen.getByRole('textbox', { name: /Nueva tarea/i });
    await user.type(input, 'Aprender Astro{Enter}');
    await user.type(input, 'Practicar React{Enter}');

    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    const firstCheckbox = screen.getAllByRole('checkbox')[0];
    await user.click(firstCheckbox);

    expect(firstCheckbox).toHaveProperty('checked', true);

    await user.click(screen.getByRole('button', { name: /Pendientes/i }));

    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
      expect(screen.getByText('Practicar React')).not.toBeNull();
    });

    await user.click(screen.getByRole('button', { name: /Completadas/i }));

    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
      expect(screen.getByText('Aprender Astro')).not.toBeNull();
    });

    await user.click(screen.getByRole('button', { name: /Eliminar Aprender Astro/i }));

    await waitFor(() => {
      expect(screen.queryByText('Aprender Astro')).toBeNull();
    });
  });

  it('does not save before hydration', async () => {
    const repository = createFakeRepository({ todos: [], filter: 'all' });
    const saveSpy = vi.spyOn(repository, 'save');
    renderWithProvider(<TodoApp />, { repository });

    expect(screen.getByText(/Cargando tareas…/i)).not.toBeNull();
    expect(saveSpy).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByText(/Cargando tareas…/i)).toBeNull();
    });

    expect(saveSpy).toHaveBeenCalledTimes(1);
  });
});
