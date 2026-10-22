import { expect, test } from '@playwright/test';

test('loads the todo app home page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Tareas', level: 1 })).toBeVisible();
});
