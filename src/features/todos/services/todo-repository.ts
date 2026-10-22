import { FILTERS, type Filter, type PersistedTodos, type Todo } from '../types';

export const TODO_STORAGE_KEY = 'todos:v1';

export interface TodoRepository {
  /** Returns null when nothing valid is stored, storage is unavailable, or it throws. Never throws. */
  load(): PersistedTodos | null;
  /** Swallows storage errors. Never throws. */
  save(data: PersistedTodos): void;
}

function isTodo(value: unknown): value is Todo {
  if (typeof value !== 'object' || value === null) return false;
  const todo = value as Record<string, unknown>;
  return (
    typeof todo.id === 'string' &&
    typeof todo.title === 'string' &&
    typeof todo.completed === 'boolean' &&
    typeof todo.createdAt === 'number' &&
    Number.isFinite(todo.createdAt)
  );
}

function isFilter(value: unknown): value is Filter {
  return FILTERS.some((filter) => filter === value);
}

function isPersistedTodos(value: unknown): value is PersistedTodos {
  if (typeof value !== 'object' || value === null) return false;
  const data = value as Record<string, unknown>;
  return Array.isArray(data.todos) && data.todos.every(isTodo) && isFilter(data.filter);
}

/**
 * localStorage-backed repository. Must be safe to call when `window` is undefined
 * (static render) and must validate stored data with a type guard.
 */
export function createLocalStorageRepository(key: string = TODO_STORAGE_KEY): TodoRepository {
  return {
    load: () => {
      try {
        if (typeof window === 'undefined') return null;
        const raw = window.localStorage.getItem(key);
        if (raw === null) return null;
        const parsed: unknown = JSON.parse(raw);
        return isPersistedTodos(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },
    save: (data) => {
      try {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(key, JSON.stringify(data));
      } catch {
        // Storage can be unavailable or quota limited; persistence is best effort.
      }
    },
  };
}
