import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import TodoInput from '@/features/todos/components/todo-input';
import TodoList from '@/features/todos/components/todo-list';
import { TodoProvider } from '@/features/todos/state/todo-context';

import { createFakeRepository, renderWithProvider } from '../test-utils';

describe('TodoInput', () => {
  it('renders a labelled textbox', () => {
    renderWithProvider(<TodoInput />);

    expect(screen.getByRole('textbox', { name: /Nueva tarea/i })).not.toBeNull();
  });

  it('renders the input disabled in static HTML', () => {
    const view = renderToString(
      <TodoProvider repository={createFakeRepository()}>
        <TodoInput />
      </TodoProvider>
    );

    expect(view).toContain('disabled');
  });

  it('enables the input after hydration', async () => {
    renderWithProvider(<TodoInput />, { repository: createFakeRepository() });

    await waitFor(() => {
      expect(screen.queryByText(/Cargando tareas…/i)).toBeNull();
    });

    expect(screen.getByRole('textbox', { name: /Nueva tarea/i })).toHaveProperty('disabled', false);
  });

  it('clears the input after pressing Enter with a non-empty title', async () => {
    const user = userEvent.setup();
    renderWithProvider(<TodoInput />);
    const input = screen.getByRole('textbox', { name: /Nueva tarea/i });

    await user.type(input, 'Comprar leche{Enter}');

    expect(input).toHaveProperty('value', '');
  });

  it('does not clear the input when the title is empty or whitespace', async () => {
    const user = userEvent.setup();
    renderWithProvider(<TodoInput />);
    const input = screen.getByRole('textbox', { name: /Nueva tarea/i });

    await user.type(input, '   {Enter}');

    expect(input).toHaveProperty('value', '   ');
  });

  it('does not create tasks from empty or whitespace-only input', async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <>
        <TodoInput />
        <TodoList />
      </>,
      { repository: createFakeRepository() }
    );

    await waitFor(() => {
      expect(screen.queryByText(/Cargando tareas…/i)).toBeNull();
    });

    const input = screen.getByRole('textbox', { name: /Nueva tarea/i });
    await user.type(input, '   {Enter}');

    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('throws when used outside of a TodoProvider', () => {
    expect(() => renderToString(<TodoInput />)).toThrow(/useTodos/i);
  });
});
