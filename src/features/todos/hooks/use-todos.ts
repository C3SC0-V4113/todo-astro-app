'use client';

import { useCallback, useContext, useMemo } from 'react';

import {
  selectActiveCount,
  selectHasCompleted,
  selectVisibleTodos,
} from '@/features/todos/state/selectors';
import { TodoContext } from '@/features/todos/state/todo-context';
import { createId } from '@/lib/id';

import type { Filter, Todo } from '@/features/todos/types';

export interface UseTodosResult {
  todos: Todo[];
  visibleTodos: Todo[];
  activeCount: number;
  hasCompleted: boolean;
  filter: Filter;
  hydrated: boolean;
  add: (title: string) => void;
  toggle: (id: string) => void;
  edit: (id: string, title: string) => void;
  remove: (id: string) => void;
  clearCompleted: () => void;
  setFilter: (filter: Filter) => void;
}

export function useTodos(): UseTodosResult {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  const { state, dispatch } = context;

  const todos = useMemo(() => state.todos, [state.todos]);
  const visibleTodos = useMemo(() => selectVisibleTodos(state), [state]);
  const activeCount = useMemo(() => selectActiveCount(state), [state]);
  const hasCompleted = useMemo(() => selectHasCompleted(state), [state]);

  const add = useCallback(
    (title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      dispatch({ type: 'add', id: createId(), title: trimmed, createdAt: Date.now() });
    },
    [dispatch]
  );

  const toggle = useCallback(
    (id: string) => {
      dispatch({ type: 'toggle', id });
    },
    [dispatch]
  );

  const edit = useCallback(
    (id: string, title: string) => {
      dispatch({ type: 'edit', id, title });
    },
    [dispatch]
  );

  const remove = useCallback(
    (id: string) => {
      dispatch({ type: 'remove', id });
    },
    [dispatch]
  );

  const clearCompleted = useCallback(() => {
    dispatch({ type: 'clearCompleted' });
  }, [dispatch]);

  const setFilter = useCallback(
    (filter: Filter) => {
      dispatch({ type: 'setFilter', filter });
    },
    [dispatch]
  );

  return {
    todos,
    visibleTodos,
    activeCount,
    hasCompleted,
    filter: state.filter,
    hydrated: state.hydrated,
    add,
    toggle,
    edit,
    remove,
    clearCompleted,
    setFilter,
  };
}
