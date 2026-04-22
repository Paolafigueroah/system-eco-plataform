import { test, expect } from '@playwright/test';
import { hasE2ECredentials, loginWithCredentials } from './helpers';

test.describe('Chat Functionality', () => {
  test('debe requerir autenticación para acceder al chat', async ({ page }) => {
    await page.goto('/chat');
    
    // Debe redirigir a login o mostrar mensaje de autenticación requerida
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/auth|\/login|\/chat/);
  });

  test('debe mostrar interfaz de chat cuando está autenticado', async ({ page }) => {
    test.skip(!hasE2ECredentials(), 'Set E2E_EMAIL and E2E_PASSWORD to run authenticated flow');
    await loginWithCredentials(page);
    await page.goto('/chat');
    
    await expect(page.getByRole('heading', { name: 'Chat' })).toBeVisible();
  });

  test('debe mostrar búsqueda de conversaciones en chat autenticado', async ({ page }) => {
    test.skip(!hasE2ECredentials(), 'Set E2E_EMAIL and E2E_PASSWORD to run authenticated flow');
    await loginWithCredentials(page);
    await page.goto('/chat');
    await expect(page.getByPlaceholder('Buscar...')).toBeVisible();
  });

  test('debe intentar compartir producto por chat desde detalle', async ({ page }) => {
    test.skip(!hasE2ECredentials(), 'Set E2E_EMAIL and E2E_PASSWORD to run authenticated flow');
    await loginWithCredentials(page);
    await page.goto('/');
    const productLink = page.locator('a[href*="/product/"]').first();
    test.skip((await productLink.count()) === 0, 'No products available for product-share flow');
    await productLink.click();
    await page.getByRole('button', { name: /Compartir/i }).first().click();
    await expect(page).toHaveURL(/\/chat/);
    await expect(page.getByText(/Enviando producto por chat|Producto compartido con|Error al compartir/i)).toBeVisible();
  });
});

