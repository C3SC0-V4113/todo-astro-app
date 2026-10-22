import { describe, expect, it } from 'vitest';

import { initialTodoState, todoReducer } from '../../../src/features/todos/state/todo-reducer';

import type { TodoState } from '../../../src/features/todos/types';

const todos = [
  { id: 'a', title: 'First', completed: false, createdAt: 1 },
  { id: 'b', title: 'Second', completed: true, createdAt: 2 },
];
const state: TodoState = { todos, filter: 'active', hydrated: true };

describe('todoReducer', () => {
  it('adds trimmed title and initializes completion state', () => {
    expect(todoReducer(state, { type: 'add', id: 'c', title: '  Third  ', createdAt: 3 })).toEqual({
      ...state,
      todos: [...todos, { id: 'c', title: 'Third', completed: false, createdAt: 3 }],
    });
    expect(state.todos).toBe(todos);
  });

  it('does not add empty title', () => {
    expect(todoReducer(state, { type: 'add', id: 'c', title: '   ', createdAt: 3 })).toBe(state);
  });

  it('toggles a matching todo immutably and ignores unknown ids', () => {
    const next = todoReducer(state, { type: 'toggle', id: 'a' });
    expect(next.todos[0]).toEqual({ ...todos[0], completed: true });
    expect(next.todos[1]).toBe(todos[1]);
    expect(next.todos).not.toBe(todos);
    expect(todoReducer(state, { type: 'toggle', id: 'missing' })).toBe(state);
  });

  it('edits a trimmed title and removes on an empty title', () => {
    expect(todoReducer(state, { type: 'edit', id: 'a', title: '  Renamed  ' }).todos[0].title).toBe(
      'Renamed'
    );
    expect(todoReducer(state, { type: 'edit', id: 'b', title: '  ' }).todos).toEqual([todos[0]]);
    expect(todoReducer(state, { type: 'edit', id: 'missing', title: 'x' })).toBe(state);
  });

  it('removes a matching todo and ignores unknown ids', () => {
    expect(todoReducer(state, { type: 'remove', id: 'a' }).todos).toEqual([todos[1]]);
    expect(todoReducer(state, { type: 'remove', id: 'missing' })).toBe(state);
  });

  it('clears completed todos and preserves identity when none are completed', () => {
    expect(todoReducer(state, { type: 'clearCompleted' }).todos).toEqual([todos[0]]);
    expect(todoReducer({ ...state, todos: [todos[0]] }, { type: 'clearCompleted' }).todos).toEqual([
      todos[0],
    ]);
  });

  it('sets the filter and preserves identity when unchanged', () => {
    expect(todoReducer(state, { type: 'setFilter', filter: 'completed' }).filter).toBe('completed');
    expect(todoReducer(state, { type: 'setFilter', filter: 'active' })).toBe(state);
  });

  it('hydrates saved data or an empty state and marks it hydrated', () => {
    expect(
      todoReducer(initialTodoState, { type: 'hydrate', data: { todos, filter: 'completed' } })
    ).toEqual({
      todos,
      filter: 'completed',
      hydrated: true,
    });
    expect(todoReducer(state, { type: 'hydrate', data: null })).toEqual({
      todos: [],
      filter: 'all',
      hydrated: true,
    });
  });
});
