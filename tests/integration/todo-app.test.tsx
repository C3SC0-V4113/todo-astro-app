import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import TodoFilters from '@/features/todos/components/todo-filters';
import TodoFooter from '@/features/todos/components/todo-footer';
import TodoInput from '@/features/todos/components/todo-input';
import TodoList from '@/features/todos/components/todo-list';
import TodoApp from '@/features/todos/todo-app';

import { createFakeRepository, renderWithProvider } from '../unit/todos/test-utils';

function renderTodoUi(repository = createFakeRepository()) {
  return renderWithProvider(
    <section className="mx-auto flex w-full max-w-xl flex-col gap-4 p-4">
      <TodoInput />
      <TodoList />
      <TodoFilters />
      <TodoFooter />
    </section>,
    { repository }
  );
}

describe('TodoApp integration', () => {
  it('renders the loading state and new-task input in static HTML', () => {
    const view = renderToString(<TodoApp />);

    expect(view).toContain('Cargando tareas…');
    expect(view).toContain('Nueva tarea');
  });

  it('does not save before hydration', async () => {
    const repository = createFakeRepository({
      todos: [{ id: '1', title: 'Persistida', completed: false, createdAt: 1 }],
      filter: 'all',
    });
    const loadSpy = vi.spyOn(repository, 'load');
    const saveSpy = vi.spyOn(repository, 'save');
    renderTodoUi(repository);

    await waitFor(() => {
      expect(screen.queryByText(/Cargando tareas…/i)).toBeNull();
    });

    const [loadOrder] = loadSpy.mock.invocationCallOrder;
    const [saveOrder] = saveSpy.mock.invocationCallOrder;
    expect(loadOrder).toBeLessThan(saveOrder);
    expect(saveSpy).toHaveBeenCalledWith(repository.load());
  });

  it('completes a full CRUD, filter and focus flow', async () => {
    const user = userEvent.setup();
    const repository = createFakeRepository({ todos: [], filter: 'all' });
    renderTodoUi(repository);

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
    expect(firstCheckbox.getAttribute('aria-checked')).toBe('true');

    await user.click(screen.getByRole('button', { name: 'Pendientes' }));

    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
      expect(screen.getByText('Practicar React')).not.toBeNull();
    });

    await user.click(screen.getByRole('button', { name: 'Completadas' }));

    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
      expect(screen.getByText('Aprender Astro')).not.toBeNull();
    });

    await user.dblClick(screen.getByText('Aprender Astro'));
    const editInput = screen.getByRole('textbox', { name: /Editar tarea/i });
    await user.clear(editInput);
    await user.type(editInput, 'Aprender Astro avanzado{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Aprender Astro avanzado')).not.toBeNull();
    });
    expect(screen.getByRole('button', { name: /Editar Aprender Astro avanzado/i })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: /Editar Aprender Astro avanzado/i }));
    const editInput2 = screen.getByRole('textbox', { name: /Editar tarea/i });
    await user.clear(editInput2);
    await user.type(editInput2, 'Aprender Astro y React');
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText('Aprender Astro y React')).not.toBeNull();
    });

    await user.dblClick(screen.getByText('Aprender Astro y React'));
    const editInput3 = screen.getByRole('textbox', { name: /Editar tarea/i });
    await user.clear(editInput3);
    await user.type(editInput3, 'Otro título');
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.getByText('Aprender Astro y React')).not.toBeNull();
    });

    await user.click(screen.getByRole('button', { name: /Editar Aprender Astro y React/i }));
    const editInput4 = screen.getByRole('textbox', { name: /Editar tarea/i });
    await user.clear(editInput4);
    await user.type(editInput4, '   {Enter}');

    await waitFor(() => {
      expect(screen.queryByText('Aprender Astro y React')).toBeNull();
    });
    expect(input).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Todas' }));
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
      expect(screen.getByText('Practicar React')).not.toBeNull();
    });

    await user.click(screen.getByRole('button', { name: /Eliminar Practicar React/i }));

    await waitFor(() => {
      expect(screen.queryByText('Practicar React')).toBeNull();
    });
  });

  it('returns focus to the new-task input when completing under the active filter', async () => {
    const user = userEvent.setup();
    const repository = createFakeRepository({
      todos: [
        { id: '1', title: 'Pendiente', completed: false, createdAt: 1 },
        { id: '2', title: 'Completada', completed: true, createdAt: 2 },
      ],
      filter: 'all',
    });
    renderTodoUi(repository);

    await waitFor(() => {
      expect(screen.queryByText(/Cargando tareas…/i)).toBeNull();
    });

    await user.click(screen.getByRole('button', { name: 'Pendientes' }));
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
    });

    await user.click(screen.getByRole('checkbox'));
    await waitFor(() => {
      expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    });

    expect(screen.getByRole('textbox', { name: /Nueva tarea/i })).toHaveFocus();
  });
});
