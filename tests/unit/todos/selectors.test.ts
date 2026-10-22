import { describe, expect, it } from 'vitest';

import {
  selectActiveCount,
  selectHasCompleted,
  selectVisibleTodos,
} from '../../../src/features/todos/state/selectors';

import type { TodoState } from '../../../src/features/todos/types';

const active = { id: 'a', title: 'Active', completed: false, createdAt: 1 };
const completed = { id: 'b', title: 'Done', completed: true, createdAt: 2 };
const base: TodoState = { todos: [active, completed], filter: 'all', hydrated: true };

describe('todo selectors', () => {
  it('selects all, active and completed todos in insertion order', () => {
    expect(selectVisibleTodos(base)).toEqual([active, completed]);
    expect(selectVisibleTodos({ ...base, filter: 'active' })).toEqual([active]);
    expect(selectVisibleTodos({ ...base, filter: 'completed' })).toEqual([completed]);
    expect(selectVisibleTodos({ ...base, todos: [] })).toEqual([]);
  });

  it('counts active todos', () => {
    expect(selectActiveCount(base)).toBe(1);
    expect(selectActiveCount({ ...base, todos: [completed] })).toBe(0);
  });

  it('reports whether completed todos exist', () => {
    expect(selectHasCompleted(base)).toBe(true);
    expect(selectHasCompleted({ ...base, todos: [active] })).toBe(false);
  });
});
