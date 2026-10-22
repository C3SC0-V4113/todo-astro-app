/* eslint-disable testing-library/no-manual-cleanup */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import TodoItem from '@/features/todos/components/todo-item';

import { renderWithProvider } from '../test-utils';

afterEach(cleanup);

describe('TodoItem', () => {
  const todo = { id: '1', title: 'Tarea de prueba', completed: false, createdAt: 1 };

  it('renders the todo title and controls', () => {
    renderWithProvider(<TodoItem todo={todo} filter="all" />);

    expect(screen.getByText('Tarea de prueba')).not.toBeNull();
    expect(screen.getByRole('checkbox')).not.toBeNull();
    expect(screen.getByRole('button', { name: /Editar/i })).not.toBeNull();
    expect(screen.getByRole('button', { name: /Eliminar/i })).not.toBeNull();
  });

  it('starts editing when the edit button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider(<TodoItem todo={todo} filter="all" />);

    await user.click(screen.getByRole('button', { name: /Editar/i }));

    expect(screen.getByRole('textbox')).toHaveProperty('value', 'Tarea de prueba');
  });

  it('starts editing on double click', async () => {
    const user = userEvent.setup();
    renderWithProvider(<TodoItem todo={todo} filter="all" />);

    await user.dblClick(screen.getByText('Tarea de prueba'));

    expect(screen.getByRole('textbox')).toHaveProperty('value', 'Tarea de prueba');
  });

  it('cancels editing with Escape', async () => {
    const user = userEvent.setup();
    renderWithProvider(<TodoItem todo={todo} filter="all" />);

    await user.dblClick(screen.getByText('Tarea de prueba'));
    const textbox = screen.getByRole('textbox');
    await user.clear(textbox);
    await user.type(textbox, 'Otro título');
    await user.keyboard('{Escape}');

    expect(screen.getByText('Tarea de prueba')).not.toBeNull();
  });

  it('throws when used outside of a TodoProvider', () => {
    expect(() => render(<TodoItem todo={todo} filter="all" />)).toThrow(/useTodos/i);
  });
});
