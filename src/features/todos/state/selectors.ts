import type { Todo, TodoState } from '../types';

// CONTRACT STUBS — implemented in feat/todo-domain.

/** Todos matching `state.filter`, in insertion order. */
export function selectVisibleTodos(state: TodoState): Todo[] {
  return state.todos;
}

/** Number of todos not completed. */
export function selectActiveCount(state: TodoState): number {
  void state;
  return 0;
}

/** True when at least one todo is completed. */
export function selectHasCompleted(state: TodoState): boolean {
  void state;
  return false;
}
