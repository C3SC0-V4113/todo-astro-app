import type { PersistedTodos } from '../types';

export const TODO_STORAGE_KEY = 'todos:v1';

export interface TodoRepository {
  /** Returns null when nothing valid is stored, storage is unavailable, or it throws. Never throws. */
  load(): PersistedTodos | null;
  /** Swallows storage errors. Never throws. */
  save(data: PersistedTodos): void;
}

/**
 * localStorage-backed repository. Must be safe to call when `window` is undefined
 * (static render) and must validate stored data with a type guard.
 */
export function createLocalStorageRepository(key: string = TODO_STORAGE_KEY): TodoRepository {
  // CONTRACT STUB — implemented in feat/todo-domain.
  void key;
  return {
    load: () => null,
    save: () => undefined,
  };
}
