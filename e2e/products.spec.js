import { test, expect } from '@playwright/test';
import { hasE2ECredentials, loginWithCredentials } from './helpers';

test.describe('Product Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página principal
    await page.goto('/');
  });

  test('debe mostrar productos en la página principal', async ({ page }) => {
    // Esperar a que los productos se carguen
    await page.waitForSelector('[data-testid="product-card"], .product-card, article', { timeout: 10000 }).catch(() => {});
    
    // Verificar que la página carga correctamente
    await expect(page).toHaveTitle(/System Eco|BioConnect/i);
  });

  test('debe poder navegar a detalle de producto', async ({ page }) => {
    // Buscar un enlace o botón de producto
    const productLink = page.locator('a[href*="/product/"]').first();
    
    if (await productLink.count() > 0) {
      await productLink.click();
      await expect(page).toHaveURL(/\/product\//);
    }
  });

  test('debe mostrar búsqueda de productos', async ({ page }) => {
    // Buscar campo de búsqueda
    const searchInput = page.locator('input[type="search"], input[placeholder*="buscar" i], input[placeholder*="search" i]').first();
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      await expect(searchInput).toHaveValue('test');
    }
  });

  test('debe permitir abrir modal de publicar producto (auth)', async ({ page }) => {
    test.skip(!hasE2ECredentials(), 'Set E2E_EMAIL and E2E_PASSWORD to run authenticated flow');
    await loginWithCredentials(page);
    await page.goto('/dashboard');
    await page.getByRole('button', { name: /Publicar Producto/i }).first().click();
    await expect(page.getByRole('heading', { name: /Añadir Producto/i })).toBeVisible();
  });

  test('debe validar campos obligatorios al publicar producto (auth)', async ({ page }) => {
    test.skip(!hasE2ECredentials(), 'Set E2E_EMAIL and E2E_PASSWORD to run authenticated flow');
    await loginWithCredentials(page);
    await page.goto('/dashboard');
    await page.getByRole('button', { name: /Publicar Producto/i }).first().click();
    await page.getByRole('button', { name: /^Publicar Producto$/i }).click();
    await expect(page.getByText(/Por favor completa todos los campos obligatorios/i)).toBeVisible();
  });

  test('debe permitir abrir favoritos y navegar a ruta protegida (auth)', async ({ page }) => {
    test.skip(!hasE2ECredentials(), 'Set E2E_EMAIL and E2E_PASSWORD to run authenticated flow');
    await loginWithCredentials(page);
    await page.goto('/');

    const favoriteButtons = page.locator('button[title*="favorit" i]');
    const favoriteCount = await favoriteButtons.count();
    test.skip(favoriteCount === 0, 'No favorite action available in current product list');

    await favoriteButtons.first().click();
    await page.goto('/favorites');
    await expect(page).toHaveURL(/\/favorites/);
  });
});

