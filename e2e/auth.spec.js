import { test, expect } from '@playwright/test';
import { hasE2ECredentials, loginWithCredentials } from './helpers';

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

  test('debe abrir flujo de reset password', async ({ page }) => {
    await page.goto('/auth');
    await page.getByRole('button', { name: '¿Olvidaste tu contraseña?' }).click();
    await expect(page.getByRole('heading', { name: 'Restablecer Contraseña' })).toBeVisible();
    await page.getByLabel('Correo electrónico para restablecer contraseña').fill('correo-invalido');
    await page.getByRole('button', { name: 'Enviar Enlace' }).click();
    await expect(page.getByText(/formato del correo electrónico no es válido/i)).toBeVisible();
  });

  test('debe proteger rutas privadas y redirigir a auth', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth/);
  });

  test('debe iniciar sesión con credenciales E2E si existen', async ({ page }) => {
    test.skip(!hasE2ECredentials(), 'Set E2E_EMAIL and E2E_PASSWORD to run authenticated flow');
    await loginWithCredentials(page);
    await expect(page).toHaveURL(/\/dashboard|\/$/);
  });
});

