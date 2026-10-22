'use client';

import { useMemo } from 'react';

import TodoFilters from '@/features/todos/components/todo-filters';
import TodoFooter from '@/features/todos/components/todo-footer';
import TodoInput from '@/features/todos/components/todo-input';
import TodoList from '@/features/todos/components/todo-list';
import { createLocalStorageRepository } from '@/features/todos/services/todo-repository';
import { TodoProvider } from '@/features/todos/state/todo-context';

export default function TodoApp() {
  const repository = useMemo(() => createLocalStorageRepository(), []);

  return (
    <TodoProvider repository={repository}>
      <section className="mx-auto flex w-full max-w-xl flex-col gap-4 p-4">
        <TodoInput />
        <TodoList />
        <TodoFilters />
        <TodoFooter />
      </section>
    </TodoProvider>
  );
}
