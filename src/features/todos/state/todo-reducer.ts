import type { TodoAction, TodoState } from '../types';

export const initialTodoState: TodoState = { todos: [], filter: 'all', hydrated: false };

/**
 * Pure reducer. Rules:
 * - `add`/`edit` trim the title; `add` with an empty title is a no-op.
 * - `edit` with an empty (trimmed) title removes the todo.
 * - `hydrate` sets `hydrated: true`; `data: null` keeps an empty list.
 * - Unknown ids are no-ops. Never mutates `state`.
 */
export function todoReducer(state: TodoState, action: TodoAction): TodoState {
  // CONTRACT STUB — implemented in feat/todo-domain.
  void action;
  return state;
}
