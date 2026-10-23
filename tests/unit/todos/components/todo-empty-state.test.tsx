import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import TodoEmptyState from '@/features/todos/components/todo-empty-state';
import TodoInput from '@/features/todos/components/todo-input';
import TodoList from '@/features/todos/components/todo-list';

import { createFakeRepository, renderWithProvider } from '../test-utils';

import type { PersistedTodos } from '@/features/todos/types';

function renderInputAndList(initial: PersistedTodos | null = null) {
  renderWithProvider(
    <>
      <TodoInput />
      <TodoList />
    </>,
    { repository: createFakeRepository(initial) }
  );
}

describe('TodoEmptyState', () => {
  it('composes the real Empty primitive slots with semantic content', () => {
    const view = renderToString(<TodoEmptyState />);

    expect(view).toContain('data-slot="empty"');
    expect(view).toContain('data-variant="outline"');
    expect(view).toContain('data-size="sm"');
    expect(view).toContain('data-slot="empty-header"');
    expect(view).toContain('data-slot="empty-title"');
    expect(view).toContain('data-slot="empty-description"');
    expect(view).toContain('data-slot="empty-content"');
    expect(view).toMatch(
      /<div[^>]*data-slot="empty-title"[^>]*><h2>Aún no tienes tareas<\/h2><\/div>/
    );
    expect(view).toMatch(
      /<div[^>]*data-slot="empty-content"[^>]*>[\s\S]*?<button\b[^>]*>[\s\S]*?Añadir tu primera tarea[\s\S]*?<\/button>[\s\S]*?<\/div>/
    );
  });

  it('shows the empty state with a heading, guidance and a CTA when the store has no tasks', () => {
    renderInputAndList();

    expect(screen.getByRole('heading', { level: 2, name: 'Aún no tienes tareas' })).toBeVisible();
    expect(
      screen.getByText('Escribe en «Nueva tarea» y pulsa Enter para guardarla.')
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Añadir tu primera tarea' })).toBeVisible();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('does not move focus when the empty state appears', () => {
    renderInputAndList();

    expect(screen.getByRole('button', { name: 'Añadir tu primera tarea' })).not.toHaveFocus();
    expect(document.body).toHaveFocus();
  });

  it('moves focus to the new-task input when the CTA is clicked', async () => {
    const user = userEvent.setup();
    renderInputAndList();

    await user.click(screen.getByRole('button', { name: 'Añadir tu primera tarea' }));

    expect(screen.getByRole('textbox', { name: 'Nueva tarea' })).toHaveFocus();
  });

  it.each(['{Enter}', ' '])(
    'moves focus to the input when the CTA is activated with %s',
    async (key) => {
      const user = userEvent.setup();
      renderInputAndList();

      await user.tab();
      expect(screen.getByRole('textbox', { name: 'Nueva tarea' })).toHaveFocus();
      await user.tab();
      expect(screen.getByRole('button', { name: 'Añadir tu primera tarea' })).toHaveFocus();
      await user.keyboard(key);

      expect(screen.getByRole('textbox', { name: 'Nueva tarea' })).toHaveFocus();
    }
  );

  it('replaces the empty state with the list after adding the first task', async () => {
    const user = userEvent.setup();
    renderInputAndList();

    await user.click(screen.getByRole('button', { name: 'Añadir tu primera tarea' }));
    await user.keyboard('Primera tarea{Enter}');

    expect(screen.queryByRole('heading', { name: 'Aún no tienes tareas' })).toBeNull();
    expect(screen.getByRole('list', { name: 'Lista de tareas' })).toBeVisible();
    expect(screen.getByText('Primera tarea')).toBeVisible();
  });

  it.each([
    ['active', 'No hay tareas pendientes.', true],
    ['completed', 'Todavía no hay tareas completadas.', false],
  ] as const)(
    'shows a filter message without the CTA when no task matches the %s filter',
    (filter, message, completed) => {
      renderInputAndList({
        todos: [{ id: '1', title: 'Existente', completed, createdAt: 1 }],
        filter,
      });

      expect(screen.getByText(message)).toBeVisible();
      expect(screen.queryByRole('heading', { name: 'Aún no tienes tareas' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Añadir tu primera tarea' })).toBeNull();
    }
  );
});
