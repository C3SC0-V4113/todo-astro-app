import type { Todo, TodoState } from '../types';

/** Todos matching `state.filter`, in insertion order. */
export function selectVisibleTodos(state: TodoState): Todo[] {
  switch (state.filter) {
    case 'active':
      return state.todos.filter((todo) => !todo.completed);
    case 'completed':
      return state.todos.filter((todo) => todo.completed);
    case 'all':
      return state.todos;
  }
}

/** Number of todos not completed. */
export function selectActiveCount(state: TodoState): number {
  return state.todos.filter((todo) => !todo.completed).length;
}

/** True when at least one todo is completed. */
export function selectHasCompleted(state: TodoState): boolean {
  return state.todos.some((todo) => todo.completed);
}
