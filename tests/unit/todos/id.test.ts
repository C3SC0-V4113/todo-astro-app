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

  it('generates unique fallback ids within the same millisecond', () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
    const now = vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
    try {
      Object.defineProperty(globalThis, 'crypto', { configurable: true, value: {} });
      const ids = Array.from({ length: 100 }, () => createId());
      expect(new Set(ids).size).toBe(ids.length);
    } finally {
      now.mockRestore();
      if (descriptor) Object.defineProperty(globalThis, 'crypto', descriptor);
    }
  });
});
