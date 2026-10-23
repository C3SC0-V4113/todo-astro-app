import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import type { Locator, Page } from '@playwright/test';

const STORAGE_KEY = 'todos:v1';
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'];

async function openApp(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Tareas', level: 1 })).toBeVisible();
  await expect(page.getByText('Cargando tareas…')).toBeHidden();
  await expect(page.locator('[data-slot="skeleton"]')).toHaveCount(0);
}

async function expectKeyboardFocus(locator: Locator) {
  await expect(locator).toBeFocused();
  await expect
    .poll(() => locator.evaluate((element) => element.matches(':focus-visible')))
    .toBe(true);
  await expect
    .poll(() =>
      locator.evaluate((element) => {
        const style = getComputedStyle(element);
        return style.boxShadow !== 'none' || style.outlineStyle !== 'none';
      })
    )
    .toBe(true);
}

async function expectNoSeriousAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
  const violations = results.violations
    .filter((violation) => violation.impact === 'critical' || violation.impact === 'serious')
    .map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      nodes: violation.nodes.map((node) => node.html),
    }));

  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
}

test('supports task creation, completion, filtering, editing, deletion and clearing', async ({
  page,
}) => {
  await openApp(page);
  const input = page.getByRole('textbox', { name: 'Nueva tarea' });
  const listItems = page.getByRole('listitem');

  await input.press('Enter');
  await expect(listItems).toHaveCount(0);
  await input.fill('   ');
  await input.press('Enter');
  await expect(listItems).toHaveCount(0);

  await input.fill('Comprar pan');
  await input.press('Enter');
  await input.fill('Leer Astro');
  await input.press('Enter');
  await expect(listItems).toHaveCount(2);
  await expect(input).toHaveValue('');
  await expect(page.getByText('2 pendientes')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Limpiar completadas' })).toBeHidden();

  const comprarCheckbox = page.getByRole('checkbox', { name: 'Comprar pan' });
  await comprarCheckbox.click();
  await expect(comprarCheckbox).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByText('1 pendiente')).toBeVisible();

  const allFilter = page.getByRole('button', { name: 'Todas', exact: true });
  const activeFilter = page.getByRole('button', { name: 'Pendientes', exact: true });
  const completedFilter = page.getByRole('button', { name: 'Completadas', exact: true });
  await expect(allFilter).toHaveAttribute('aria-pressed', 'true');
  await activeFilter.click();
  await expect(activeFilter).toHaveAttribute('aria-pressed', 'true');
  await expect(allFilter).toHaveAttribute('aria-pressed', 'false');
  await expect(listItems).toHaveCount(1);
  await expect(page.getByText('Leer Astro')).toBeVisible();

  await completedFilter.click();
  await expect(completedFilter).toHaveAttribute('aria-pressed', 'true');
  await expect(listItems).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Limpiar completadas' })).toBeVisible();

  await allFilter.click();
  await page.getByText('Leer Astro', { exact: true }).dblclick();
  const editInput = page.getByRole('textbox', { name: 'Editar tarea' });
  await expect(editInput).toHaveValue('Leer Astro');
  await editInput.fill('Leer con Playwright');
  await editInput.press('Enter');
  await expect(page.getByText('Leer con Playwright')).toBeVisible();

  await page.getByRole('button', { name: 'Editar Leer con Playwright' }).click();
  const secondEditInput = page.getByRole('textbox', { name: 'Editar tarea' });
  await secondEditInput.fill('Cambio cancelado');
  await secondEditInput.press('Escape');
  await expect(page.getByText('Leer con Playwright')).toBeVisible();

  await page.getByRole('button', { name: 'Editar Leer con Playwright' }).click();
  await page.getByRole('textbox', { name: 'Editar tarea' }).fill('   ');
  await page.getByRole('textbox', { name: 'Editar tarea' }).press('Enter');
  await expect(page.getByText('Leer con Playwright')).toHaveCount(0);
  await expect(listItems).toHaveCount(1);

  await page.getByRole('button', { name: 'Limpiar completadas' }).click();
  await expect(listItems).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Limpiar completadas' })).toBeHidden();

  await input.fill('Eliminar con botón');
  await input.press('Enter');
  await page.getByRole('button', { name: 'Eliminar Eliminar con botón' }).click();
  await expect(listItems).toHaveCount(0);
});

test('persists tasks and completion state after reload', async ({ page }) => {
  await openApp(page);
  const input = page.getByRole('textbox', { name: 'Nueva tarea' });
  await input.fill('Persistente');
  await input.press('Enter');
  await input.fill('Pendiente tras recarga');
  await input.press('Enter');
  await page.getByRole('checkbox', { name: 'Persistente' }).click();

  await expect(page.getByText('1 pendiente')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Cargando tareas…')).toBeHidden();
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await expect(page.getByRole('checkbox', { name: 'Persistente' })).toHaveAttribute(
    'aria-checked',
    'true'
  );
  await expect(page.getByRole('checkbox', { name: 'Pendiente tras recarga' })).toHaveAttribute(
    'aria-checked',
    'false'
  );
  await expect(page.getByText('1 pendiente')).toBeVisible();
});

test('recovers from corrupt storage without console or hydration errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  const hydrationWarnings: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
    if (message.type() === 'warning' && /hydration/i.test(message.text())) {
      hydrationWarnings.push(message.text());
    }
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  await page.addInitScript((key) => {
    localStorage.setItem(key, '{invalid json');
  }, STORAGE_KEY);

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Tareas', level: 1 })).toBeVisible();
  await expect(page.getByText('Cargando tareas…')).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Aún no tienes tareas' })).toBeVisible();
  expect(consoleErrors).toEqual([]);
  expect(hydrationWarnings).toEqual([]);
});

test('supports the main task flow using only the keyboard and keeps visible focus', async ({
  page,
}) => {
  await openApp(page);
  const input = page.getByRole('textbox', { name: 'Nueva tarea' });

  await page.keyboard.press('Tab');
  await expectKeyboardFocus(input);
  await page.keyboard.type('Tarea de teclado');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('listitem')).toHaveCount(1);

  await page.keyboard.press('Tab');
  const checkbox = page.getByRole('checkbox', { name: 'Tarea de teclado' });
  await expectKeyboardFocus(checkbox);
  await page.keyboard.press('Space');
  await expect(checkbox).toHaveAttribute('aria-checked', 'true');

  await page.keyboard.press('Tab');
  const editButton = page.getByRole('button', { name: 'Editar Tarea de teclado' });
  await expectKeyboardFocus(editButton);
  await page.keyboard.press('Enter');
  const editInput = page.getByRole('textbox', { name: 'Editar tarea' });
  await expect(editInput).toBeFocused();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('Cambio cancelado');
  await page.keyboard.press('Escape');
  await expect(page.getByText('Tarea de teclado')).toBeVisible();
  await expectKeyboardFocus(editButton);

  await page.keyboard.press('Enter');
  await expect(editInput).toBeFocused();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('Tarea editada');
  await page.keyboard.press('Enter');
  await expect(page.getByText('Tarea editada')).toBeVisible();

  await page.keyboard.press('Tab');
  const deleteButton = page.getByRole('button', { name: 'Eliminar Tarea editada' });
  await expectKeyboardFocus(deleteButton);
  await page.keyboard.press('Space');
  await expect(page.getByRole('listitem')).toHaveCount(0);
  await expectKeyboardFocus(input);
});

test('shows the empty state without moving focus, and its CTA focuses the new-task input', async ({
  page,
}) => {
  await openApp(page);
  const input = page.getByRole('textbox', { name: 'Nueva tarea' });
  const cta = page.getByRole('button', { name: 'Añadir tu primera tarea' });
  await expect(page.getByRole('heading', { name: 'Aún no tienes tareas' })).toBeVisible();
  await expect(input).not.toBeFocused();
  await expect(cta).not.toBeFocused();

  await page.keyboard.press('Tab');
  await expectKeyboardFocus(input);
  await page.keyboard.press('Tab');
  await expectKeyboardFocus(cta);
  await page.keyboard.press('Enter');
  await expectKeyboardFocus(input);

  await page.keyboard.type('Primera tarea');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Aún no tienes tareas' })).toBeHidden();

  await page.getByRole('button', { name: 'Eliminar Primera tarea' }).click();
  await expect(page.getByRole('heading', { name: 'Aún no tienes tareas' })).toBeVisible();
});

for (const width of [320, 1280]) {
  test(`keeps the empty state at the skeleton height at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await openApp(page);
    const empty = page.locator('[data-slot="empty"]');
    await expect(empty).toBeVisible();
    await expect(empty).toHaveCSS('border-top-style', 'dashed');
    // Three 50px skeleton rows plus two 8px gaps: a taller panel shifts the filters.
    await expect(empty).toHaveCSS('height', '166px');
  });
}

test('tells a filter with no matches apart from an empty list', async ({ page }) => {
  await openApp(page);
  const input = page.getByRole('textbox', { name: 'Nueva tarea' });
  await input.fill('Sin completar');
  await input.press('Enter');

  await page.getByRole('button', { name: 'Completadas', exact: true }).click();
  await expect(page.getByText('Todavía no hay tareas completadas.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Aún no tienes tareas' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Añadir tu primera tarea' })).toBeHidden();

  await page.getByRole('button', { name: 'Pendientes', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Marcar Sin completar' }).click();
  await expect(page.getByText('No hay tareas pendientes.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Añadir tu primera tarea' })).toBeHidden();
});

for (const [device, viewport] of [
  ['desktop', { width: 1280, height: 800 }],
  ['mobile', { width: 375, height: 740 }],
] as const) {
  test(`separates the new-task label from its field on ${device}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await openApp(page);
    const gap = await page
      .getByRole('textbox', { name: 'Nueva tarea' })
      .evaluate(
        (input: HTMLInputElement) =>
          input.getBoundingClientRect().top -
          (input.labels?.[0]?.getBoundingClientRect().bottom ?? Number.NaN)
      );
    // `gap-2` on the field group: 8px between label and input.
    expect(gap).toBeCloseTo(8, 0);
  });
}

test('renders the static task page before JavaScript runs', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:3000',
    javaScriptEnabled: false,
  });
  try {
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Tareas', level: 1 })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Nueva tarea' })).toBeVisible();
    // The loading message is for screen readers; sighted users get skeleton
    // rows, which stay out of the accessibility tree.
    await expect(page.getByText('Cargando tareas…')).toHaveClass('sr-only');
    const skeletons = page.locator('[data-slot="skeleton"]');
    await expect(skeletons).toHaveCount(4);
    await expect(skeletons.first()).toBeVisible();
    for (const skeleton of await skeletons.all()) {
      await expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    }
    await expect(page.getByText(/pendientes?$/)).toHaveCount(0);
  } finally {
    await context.close();
  }
});

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`keeps the skeleton shape and gates its motion with reduced motion: ${reducedMotion}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      baseURL: 'http://127.0.0.1:3000',
      javaScriptEnabled: false,
      reducedMotion,
    });
    try {
      const page = await context.newPage();
      await page.goto('/');
      const skeleton = page.locator('[data-slot="skeleton"]').first();
      const container = skeleton.locator('..');
      const motionAllowed = reducedMotion === 'no-preference';

      await expect(skeleton).toHaveCSS('height', '50px');
      await expect(skeleton).toHaveCSS('animation-name', motionAllowed ? 'pulse' : 'none');
      await expect(container).toHaveCSS('animation-name', motionAllowed ? 'enter' : 'none');
      await expect(container).toHaveCSS('animation-delay', motionAllowed ? '0.3s' : '0s');
      await expect(container).toHaveCSS('animation-duration', motionAllowed ? '0.3s' : '0s');
      await expect(container).toHaveCSS('opacity', '1');
    } finally {
      await context.close();
    }
  });
}

test('has no critical or serious axe violations with an empty list and completed tasks', async ({
  page,
}) => {
  await openApp(page);
  await expectNoSeriousAxeViolations(page);

  const input = page.getByRole('textbox', { name: 'Nueva tarea' });
  await input.fill('Pendiente');
  await input.press('Enter');
  await input.fill('Completada');
  await input.press('Enter');
  await page.getByRole('checkbox', { name: 'Completada' }).click();
  await expect(page.getByRole('checkbox', { name: 'Completada' })).toHaveAttribute(
    'aria-checked',
    'true'
  );

  await expectNoSeriousAxeViolations(page);
});
