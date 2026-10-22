/* eslint-disable react-you-might-not-need-an-effect/no-pass-data-to-parent --
   The spec requires useReducer to live inside TodoProvider and expose state/dispatch
   through React context. The rule misidentifies this provider pattern as passing data
   to a parent component. */

import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';

import { initialTodoState, todoReducer } from '@/features/todos/state/todo-reducer';

import type { TodoRepository } from '@/features/todos/services/todo-repository';
import type { PersistedTodos, TodoAction, TodoState } from '@/features/todos/types';

interface TodoContextValue {
  state: TodoState;
  dispatch: React.Dispatch<TodoAction>;
  repository: TodoRepository;
}

export const TodoContext = createContext<TodoContextValue | null>(null);

interface TodoProviderProps {
  children: ReactNode;
  repository: TodoRepository;
}

export function TodoProvider({ children, repository }: TodoProviderProps) {
  const [state, dispatch] = useReducer(todoReducer, initialTodoState);

  useEffect(() => {
    const data = repository.load();
    dispatch({ type: 'hydrate', data });
  }, [repository]);

  useEffect(() => {
    if (!state.hydrated) {
      return;
    }
    const data: PersistedTodos = { todos: state.todos, filter: state.filter };
    repository.save(data);
  }, [state.hydrated, state.todos, state.filter, repository]);

  const value = useMemo(() => ({ state, dispatch, repository }), [state, dispatch, repository]);

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodoContext(): TodoContextValue {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  return context;
}
