export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  /** Epoch milliseconds. */
  createdAt: number;
}

export type Filter = 'all' | 'active' | 'completed';

export const FILTERS: readonly Filter[] = ['all', 'active', 'completed'];

/** Shape written to and read from storage. */
export interface PersistedTodos {
  todos: Todo[];
  filter: Filter;
}

export interface TodoState extends PersistedTodos {
  /** False until the client has loaded persisted data; never persist before this is true. */
  hydrated: boolean;
}

export type TodoAction =
  | { type: 'add'; id: string; title: string; createdAt: number }
  | { type: 'toggle'; id: string }
  | { type: 'edit'; id: string; title: string }
  | { type: 'remove'; id: string }
  | { type: 'clearCompleted' }
  | { type: 'setFilter'; filter: Filter }
  | { type: 'hydrate'; data: PersistedTodos | null };
