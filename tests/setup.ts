import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Vitest runs without `globals`, so Testing Library cannot register its automatic
// cleanup. `cleanup` unmounts every rendered tree and removes its container from
// `document.body`; `view.unmount()` alone would leave empty containers behind.
afterEach(cleanup);
