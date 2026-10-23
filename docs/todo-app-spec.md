# Todo app: implementation contract

Source of truth for the implementers. The quality gates and rules in `AGENTS.md` and `DESIGN.md` apply on top of this file.

## Architecture

- Astro renders static HTML (`output: 'static'`, no adapter). `src/pages/index.astro` uses `src/layouts/main.astro`.
- One React island, `<TodoApp client:load />`, owns CRUD, filters and persistence.
  - `client:load` because the island is the page's primary, above-the-fold control. `idle`/`visible` would delay input, and `only` would drop the static HTML.
- Layers: UI components → `useTodos` (context) → `TodoStore` (`useSyncExternalStore`) → pure reducer/selectors → `TodoRepository`.
- No `window` or `localStorage` access during the static render or hydration.
  - `getServerSnapshot` returns `initialTodoState` (`hydrated: false`), so the static HTML and the hydration render match.
  - `getSnapshot` calls `repository.load()` once, on the first client snapshot, and applies `hydrate`.
  - `dispatch` saves only after an action that changes state, so stored data is never overwritten before it loads.

## Files and owners

| Path                                                                                                             | Branch                                              |
| ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `src/features/todos/types.ts`                                                                                    | contract (frozen; ask the coordinator to change it) |
| `src/features/todos/state/todo-reducer.ts`, `state/selectors.ts`, `services/todo-repository.ts`, `src/lib/id.ts` | `feat/todo-domain`                                  |
| `tests/unit/todos/{todo-reducer,selectors,todo-repository,id}.test.ts`                                           | `feat/todo-domain`                                  |
| `src/features/todos/todo-app.tsx`, `state/todo-context.tsx`, `hooks/use-todos.ts`, `components/*.tsx`            | `feat/todo-ui`                                      |
| `src/pages/index.astro`, `src/layouts/main.astro` (set `lang="es"` and the title only)                           | `feat/todo-ui`                                      |
| `tests/unit/todos/components/*.test.tsx`, `tests/integration/todo-app.test.tsx`                                  | `feat/todo-ui`                                      |
| `tests/e2e/todos.spec.ts`                                                                                        | `feat/todo-e2e`                                     |

Only the coordinator changes `package.json`, `pnpm-lock.yaml`, configs or `src/components/ui/`.

Available primitives in `src/components/ui/`: `button`, `input`, `checkbox`, `label`, `skeleton`. Icons come from `lucide-react`.

Test libraries:

- Unit and component tests: `@testing-library/react` and `@testing-library/user-event`.
- E2E: `@axe-core/playwright`.

## Behaviour (acceptance criteria)

1. Pressing Enter in the new-task input adds the trimmed title and clears the input. Empty or whitespace-only input adds nothing.
2. The checkbox toggles a task. A completed task is visually struck through and the "N pendientes" counter updates. The delete button removes the task.
3. Editing starts on double click or an "Editar" button. Enter or blur saves, Escape cancels, and an empty title deletes the task. Focus returns to a sensible element afterwards.
4. Filters (Todas / Pendientes / Completadas) are buttons with `aria-pressed`. "Limpiar completadas" shows only when at least one task is completed.
5. Data persists across reloads. If storage is invalid or throws, the app starts empty with no errors and no hydration warnings.
6. The app is fully keyboard operable with visible focus, meets WCAG 2.2 AA, and axe reports no critical or serious violations. The counter uses `aria-live="polite"`.
7. TypeScript is strict with no `any`. `pnpm run lint`, `typecheck`, `format:check` and `test` all pass. Coverage is at least 90 % for `state/` and `services/` and at least 80 % overall (`pnpm exec vitest run --coverage`).

UI copy is in Spanish.

## UI states

### Loading (static HTML, before the store hydrates)

- The list renders three `Skeleton` rows at the height of a single-line task row (`h-12.5`, 50px). The footer count renders a `Skeleton` in place of "N pendientes", so the static HTML never shows a wrong "0 pendientes".
- Motion is opt-in (`prefers-reduced-motion: no-preference` via `motion-safe:`), and the skeleton keeps its shape and size (50px rows) either way:
  - `no-preference`: the container fades in after a 300ms delay (`animate-in`, `fade-in`, `delay-300`, `duration-300` and `fill-mode-both`, each behind `motion-safe:`). Hydration usually lands before that, so a fast load swaps straight to content without a flash. Each `Skeleton` pulses (`motion-safe:animate-pulse` in the primitive).
  - `reduce`: no animation and no delay. The container and every `Skeleton` render static and visible at once.
  - An E2E test reads the computed `animation-name`, delay, duration, opacity and the 50px height under both preferences.
- Screen readers: skeletons are `aria-hidden`. A visually hidden "Cargando tareas…" paragraph stays readable while browsing, but it is not a live region, so nothing is announced on page load. The footer's `aria-live="polite"` region mounts with its first count after hydration, so loading stored data is not announced either; later count changes are.

### Empty store versus a filter with no matches

- **Empty store** (`todos.length === 0`, any filter): `TodoEmptyState` renders a heading, guidance and a CTA in a dashed panel. Its `min-h-41.5` (166px) matches the three skeleton rows, so an empty store loads with no layout shift.
  - Compose it with the shadcn `Empty` primitive: `Empty`, `EmptyHeader`, `EmptyTitle`, `EmptyDescription` and `EmptyContent`. The dashed border comes from `Empty`'s `outline` variant (the official `border` class, added as a variant so the call site passes only layout classes and `shadcn/no-restyle` needs no suppression). Keep the native `h2` inside `EmptyTitle`; do not return to custom empty-state markup.
  - Heading (`h2`): "Aún no tienes tareas".
  - Guidance: "Escribe en «Nueva tarea» y pulsa Enter para guardarla." It names the field's visible label, because the input has no submit button.
  - CTA (`Button variant="outline"`): "Añadir tu primera tarea".
- **Filter with no matches** (tasks exist, none visible): a muted paragraph, without the CTA. Adding a task is not the fix here; switching filters is, and the filter buttons sit right below.
  - Pendientes: "No hay tareas pendientes."
  - Completadas: "Todavía no hay tareas completadas."
- **Focus:** showing the empty state never moves focus, on load or after the last task is deleted (deleting already returns focus to the input as before). Only an explicit CTA activation (click, Enter or Space) moves focus to `#new-todo`. That is the CTA's whole promise and the one place a task can be added, so it works like an in-page skip link; screen readers then announce the labelled "Nueva tarea" field. An `<a href="#new-todo">` was rejected because fragment navigation does not reliably focus the input across browsers.
