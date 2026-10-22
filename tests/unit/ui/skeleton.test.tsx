import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Skeleton } from '@/components/ui/skeleton';

describe('Skeleton', () => {
  it('only pulses when the user has not asked for reduced motion', () => {
    const view = renderToString(<Skeleton className="h-6" />);

    expect(view).toContain('motion-safe:animate-pulse');
    expect(view).not.toMatch(/class="[^"]*(?<!:)animate-pulse/);
    expect(view).toContain('rounded-md bg-muted');
  });
});
