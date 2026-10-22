import { render as rtlRender, type RenderOptions } from '@testing-library/react';

import { TodoProvider } from '@/features/todos/state/todo-context';

import type { TodoRepository } from '@/features/todos/services/todo-repository';
import type { PersistedTodos } from '@/features/todos/types';
import type { ReactElement, ReactNode } from 'react';

export function createFakeRepository(initial: PersistedTodos | null = null): TodoRepository {
  let data = initial;
  return {
    load: () => data,
    save: (next) => {
      data = next;
    },
  };
}

interface ProviderOptions {
  repository?: TodoRepository;
}

export function renderWithProvider(
  ui: ReactElement,
  {
    repository = createFakeRepository(),
    ...options
  }: ProviderOptions & Omit<RenderOptions, 'wrapper'> = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <TodoProvider repository={repository}>{children}</TodoProvider>;
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}
