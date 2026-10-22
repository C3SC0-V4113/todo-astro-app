import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import { createTodoStore } from '@/features/todos/state/todo-store';

import type { TodoRepository } from '@/features/todos/services/todo-repository';
import type { TodoAction, TodoState } from '@/features/todos/types';

interface TodoContextValue {
  state: TodoState;
  dispatch: (action: TodoAction) => void;
}

export const TodoContext = createContext<TodoContextValue | null>(null);

interface TodoProviderProps {
  children: ReactNode;
  /** Read once, when the provider mounts. */
  repository: TodoRepository;
}

export function TodoProvider({ children, repository }: TodoProviderProps) {
  const [store] = useState(() => createTodoStore(repository));
  // The static render and hydration use the server snapshot (`hydrated: false`);
  // React then re-renders with the stored data, so the HTML always matches.
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const value = useMemo(() => ({ state, dispatch: store.dispatch }), [state, store]);

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodoContext(): TodoContextValue {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  return context;
}
