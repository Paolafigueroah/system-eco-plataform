export const hasE2ECredentials = () =>
  Boolean(process.env.E2E_EMAIL && process.env.E2E_PASSWORD);

export const loginWithCredentials = async (page) => {
  if (!hasE2ECredentials()) {
    throw new Error('Missing E2E credentials');
  }

  await page.goto('/auth');
  await page.getByLabel('Correo electrónico').fill(process.env.E2E_EMAIL);
  await page.getByLabel('Contraseña').fill(process.env.E2E_PASSWORD);
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await page.waitForURL(/\/dashboard|\/$/, { timeout: 15000 });
};
