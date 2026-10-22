/* eslint-disable testing-library/no-manual-cleanup */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import TodoInput from '@/features/todos/components/todo-input';

import { renderWithProvider } from '../test-utils';

afterEach(cleanup);

describe('TodoInput', () => {
  it('renders a labelled textbox', () => {
    renderWithProvider(<TodoInput />);

    expect(screen.getByRole('textbox', { name: /Nueva tarea/i })).not.toBeNull();
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

  it('throws when used outside of a TodoProvider', () => {
    expect(() => render(<TodoInput />)).toThrow(/useTodos/i);
  });
});
