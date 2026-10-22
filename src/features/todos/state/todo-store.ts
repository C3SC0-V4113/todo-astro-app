import { initialTodoState, todoReducer } from '@/features/todos/state/todo-reducer';

import type { TodoRepository } from '@/features/todos/services/todo-repository';
import type { TodoAction, TodoState } from '@/features/todos/types';

export interface TodoStore {
  subscribe(listener: () => void): () => void;
  /** Client state. Loads from the repository on the first call, then returns the cached state. */
  getSnapshot(): TodoState;
  /** Static render and hydration state. Never touches the repository. */
  getServerSnapshot(): TodoState;
  dispatch(action: TodoAction): void;
}

/**
 * External store for `useSyncExternalStore`. Persists after every action that changes
 * state, so nothing is saved before the stored data has been loaded.
 */
export function createTodoStore(repository: TodoRepository): TodoStore {
  let state: TodoState | null = null;
  const listeners = new Set<() => void>();

  function getSnapshot(): TodoState {
    state ??= todoReducer(initialTodoState, { type: 'hydrate', data: repository.load() });
    return state;
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot,
    getServerSnapshot: () => initialTodoState,
    dispatch(action) {
      const current = getSnapshot();
      const next = todoReducer(current, action);
      if (next === current) return;
      state = next;
      repository.save({ todos: next.todos, filter: next.filter });
      listeners.forEach((listener) => listener());
    },
  };
}
