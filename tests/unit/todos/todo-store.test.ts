import { describe, expect, it, vi } from 'vitest';

import { initialTodoState } from '../../../src/features/todos/state/todo-reducer';
import { createTodoStore } from '../../../src/features/todos/state/todo-store';

import type { TodoRepository } from '../../../src/features/todos/services/todo-repository';
import type { PersistedTodos } from '../../../src/features/todos/types';

const stored: PersistedTodos = {
  todos: [{ id: 'a', title: 'Stored', completed: false, createdAt: 1 }],
  filter: 'active',
};

function createRepository(data: PersistedTodos | null = stored) {
  const repository: TodoRepository = { load: vi.fn(() => data), save: vi.fn() };
  return repository;
}

describe('createTodoStore', () => {
  it('serves the initial state for static render without touching the repository', () => {
    const repository = createRepository();
    const store = createTodoStore(repository);

    expect(store.getServerSnapshot()).toBe(initialTodoState);
    expect(repository.load).not.toHaveBeenCalled();
  });

  it('loads once on the first client snapshot and then returns the same state', () => {
    const repository = createRepository();
    const store = createTodoStore(repository);

    const snapshot = store.getSnapshot();

    expect(snapshot).toEqual({ ...stored, hydrated: true });
    expect(store.getSnapshot()).toBe(snapshot);
    expect(repository.load).toHaveBeenCalledOnce();
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('starts empty and hydrated when nothing is stored', () => {
    const store = createTodoStore(createRepository(null));

    expect(store.getSnapshot()).toEqual({ todos: [], filter: 'all', hydrated: true });
  });

  it('saves and notifies after an action that changes state', () => {
    const repository = createRepository();
    const store = createTodoStore(repository);
    const listener = vi.fn();
    store.subscribe(listener);

    store.dispatch({ type: 'setFilter', filter: 'completed' });

    expect(store.getSnapshot().filter).toBe('completed');
    expect(repository.save).toHaveBeenCalledExactlyOnceWith({
      todos: stored.todos,
      filter: 'completed',
    });
    expect(listener).toHaveBeenCalledOnce();
  });

  it('loads stored data before the first action, so it is never overwritten', () => {
    const repository = createRepository();
    const store = createTodoStore(repository);

    store.dispatch({ type: 'add', id: 'b', title: 'New', createdAt: 2 });

    expect(repository.load).toHaveBeenCalledOnce();
    expect(repository.save).toHaveBeenCalledWith({
      todos: [...stored.todos, { id: 'b', title: 'New', completed: false, createdAt: 2 }],
      filter: 'active',
    });
  });

  it('neither saves nor notifies when an action leaves state unchanged', () => {
    const repository = createRepository();
    const store = createTodoStore(repository);
    const listener = vi.fn();
    store.subscribe(listener);
    const before = store.getSnapshot();

    store.dispatch({ type: 'toggle', id: 'missing' });

    expect(store.getSnapshot()).toBe(before);
    expect(repository.save).not.toHaveBeenCalled();
    expect(listener).not.toHaveBeenCalled();
  });

  it('stops notifying a listener after it unsubscribes', () => {
    const store = createTodoStore(createRepository());
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.dispatch({ type: 'setFilter', filter: 'all' });

    expect(listener).not.toHaveBeenCalled();
  });
});
