import { test, expect } from '@playwright/test';

test.describe('Autenticación', () => {
  test('debe mostrar formulario de registro', async ({ page }) => {
    await page.goto('/auth');
    
    // Verificar que el formulario de registro está visible
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
  });

  test('debe validar campos requeridos en registro', async ({ page }) => {
    await page.goto('/auth');
    
    // Intentar enviar formulario vacío
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verificar que se muestran mensajes de error
    await page.waitForTimeout(500);
    const errors = page.locator('text=/requerido|required/i');
    await expect(errors.first()).toBeVisible();
  });

  test('debe validar formato de email', async ({ page }) => {
    await page.goto('/auth');
    
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('email-invalido');
    
    // Intentar enviar
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verificar mensaje de error de email
    await page.waitForTimeout(500);
    const error = page.locator('text=/email|correo/i');
    await expect(error.first()).toBeVisible();
  });

  test('debe poder cambiar entre login y registro', async ({ page }) => {
    await page.goto('/auth');
    
    // Buscar botón para cambiar a login
    const switchButton = page.locator('text=/inicia sesión|login/i').first();
    if (await switchButton.isVisible()) {
      await switchButton.click();
      
      // Verificar que cambió la vista
      await page.waitForTimeout(300);
      const loginForm = page.locator('text=/iniciar sesión|sign in/i');
      await expect(loginForm.first()).toBeVisible();
    }
  });
});

