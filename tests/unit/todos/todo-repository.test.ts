import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createLocalStorageRepository,
  TODO_STORAGE_KEY,
} from '../../../src/features/todos/services/todo-repository';

import type { PersistedTodos } from '../../../src/features/todos/types';

const saved: PersistedTodos = {
  todos: [{ id: 'a', title: 'Task', completed: false, createdAt: 12 }],
  filter: 'active',
};

beforeEach(() => localStorage.clear());

describe('createLocalStorageRepository', () => {
  it('loads valid saved data from the default key', () => {
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(saved));
    expect(createLocalStorageRepository().load()).toEqual(saved);
  });

  it('returns null for missing, malformed JSON, incorrect shape or invalid todo fields', () => {
    const repository = createLocalStorageRepository('data');
    expect(repository.load()).toBeNull();
    localStorage.setItem('data', '{');
    expect(repository.load()).toBeNull();
    for (const invalid of [
      {},
      { todos: [], filter: 'unknown' },
      { todos: [{}], filter: 'all' },
      { todos: [{ id: 'a', title: 'x', completed: false, createdAt: Infinity }], filter: 'all' },
    ]) {
      localStorage.setItem('data', JSON.stringify(invalid));
      expect(repository.load()).toBeNull();
    }
  });

  it('saves data as JSON under the configured key', () => {
    createLocalStorageRepository('custom').save(saved);
    expect(localStorage.getItem('custom')).toBe(JSON.stringify(saved));
  });

  it('returns null on load and swallows save errors', () => {
    const repository = createLocalStorageRepository();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(repository.load()).toBeNull();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => repository.save(saved)).not.toThrow();
  });

  it('is safe when window is unavailable', () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
    try {
      Object.defineProperty(globalThis, 'window', { configurable: true, value: undefined });
      const repository = createLocalStorageRepository();
      expect(repository.load()).toBeNull();
      expect(() => repository.save(saved)).not.toThrow();
    } finally {
      if (descriptor) Object.defineProperty(globalThis, 'window', descriptor);
      else Reflect.deleteProperty(globalThis, 'window');
    }
  });
});
