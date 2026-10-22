/* eslint-disable testing-library/no-manual-cleanup */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import TodoFilters from '@/features/todos/components/todo-filters';

import { renderWithProvider } from '../test-utils';

afterEach(cleanup);

describe('TodoFilters', () => {
  it('renders the filter buttons with aria-pressed', () => {
    renderWithProvider(<TodoFilters />);

    const todas = screen.getByRole('button', { name: /Todas/i });
    const pendientes = screen.getByRole('button', { name: /Pendientes/i });
    const completadas = screen.getByRole('button', { name: /Completadas/i });

    expect(todas.getAttribute('aria-pressed')).toBe('true');
    expect(pendientes.getAttribute('aria-pressed')).toBe('false');
    expect(completadas.getAttribute('aria-pressed')).toBe('false');
  });

  it('updates the active filter on click', async () => {
    const user = userEvent.setup();
    renderWithProvider(<TodoFilters />);

    await user.click(screen.getByRole('button', { name: /Pendientes/i }));

    expect(screen.getByRole('button', { name: /Pendientes/i }).getAttribute('aria-pressed')).toBe(
      'true'
    );
    expect(screen.getByRole('button', { name: /Todas/i }).getAttribute('aria-pressed')).toBe(
      'false'
    );
  });

  it('throws when used outside of a TodoProvider', () => {
    expect(() => render(<TodoFilters />)).toThrow(/useTodos/i);
  });
});
