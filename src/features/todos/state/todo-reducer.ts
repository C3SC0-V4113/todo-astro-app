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
  switch (action.type) {
    case 'add': {
      const title = action.title.trim();
      if (!title) return state;
      return {
        ...state,
        todos: [
          ...state.todos,
          { id: action.id, title, completed: false, createdAt: action.createdAt },
        ],
      };
    }
    case 'toggle': {
      if (!state.todos.some((todo) => todo.id === action.id)) return state;
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
        ),
      };
    }
    case 'edit': {
      const title = action.title.trim();
      if (!state.todos.some((todo) => todo.id === action.id)) return state;
      return {
        ...state,
        todos: title
          ? state.todos.map((todo) => (todo.id === action.id ? { ...todo, title } : todo))
          : state.todos.filter((todo) => todo.id !== action.id),
      };
    }
    case 'remove':
      return state.todos.some((todo) => todo.id === action.id)
        ? { ...state, todos: state.todos.filter((todo) => todo.id !== action.id) }
        : state;
    case 'clearCompleted': {
      const todos = state.todos.filter((todo) => !todo.completed);
      return todos.length === state.todos.length ? state : { ...state, todos };
    }
    case 'setFilter':
      return state.filter === action.filter ? state : { ...state, filter: action.filter };
    case 'hydrate':
      return {
        ...state,
        todos: action.data?.todos ?? [],
        filter: action.data?.filter ?? 'all',
        hydrated: true,
      };
  }
}
