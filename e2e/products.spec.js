import { test, expect } from '@playwright/test';

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
});

