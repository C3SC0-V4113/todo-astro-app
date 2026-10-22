import { describe, expect, it, vi } from 'vitest';

import { createId } from '../../../src/lib/id';

describe('createId', () => {
  it('uses crypto.randomUUID when available', () => {
    const uuid = vi.fn(() => 'generated-uuid');
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
    try {
      Object.defineProperty(globalThis, 'crypto', {
        configurable: true,
        value: { randomUUID: uuid },
      });
      expect(createId()).toBe('generated-uuid');
      expect(uuid).toHaveBeenCalledOnce();
    } finally {
      if (descriptor) Object.defineProperty(globalThis, 'crypto', descriptor);
    }
  });

  it('generates a nonempty fallback id when randomUUID is unavailable', () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
    try {
      Object.defineProperty(globalThis, 'crypto', { configurable: true, value: {} });
      const first = createId();
      expect(first).toMatch(/^todo-/);
      expect(first.length).toBeGreaterThan(10);
    } finally {
      if (descriptor) Object.defineProperty(globalThis, 'crypto', descriptor);
    }
  });
});
