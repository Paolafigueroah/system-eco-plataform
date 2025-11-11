import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('debe cargar la página principal', async ({ page }) => {
    await page.goto('/');
    
    // Verificar que la página carga
    await expect(page).toHaveTitle(/BioConnect|System Eco/);
    
    // Verificar elementos principales
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('debe mostrar productos si existen', async ({ page }) => {
    await page.goto('/');
    
    // Esperar a que la página cargue
    await page.waitForLoadState('networkidle');
    
    // Verificar que hay contenido (productos o mensaje de bienvenida)
    const content = page.locator('main, [role="main"]');
    await expect(content).toBeVisible();
  });

  test('debe tener navegación funcional', async ({ page }) => {
    await page.goto('/');
    
    // Verificar que existe la barra de navegación
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav).toBeVisible();
  });
});

