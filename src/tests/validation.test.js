import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidPassword } from './validation';

describe('validation', () => {
  describe('isValidEmail', () => {
    it('debe validar emails correctos', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('debe rechazar emails incorrectos', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('invalid@.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('debe validar contraseñas correctas', () => {
      expect(isValidPassword('Password123')).toBe(true);
      expect(isValidPassword('MyP@ssw0rd')).toBe(true);
      expect(isValidPassword('Test1234')).toBe(true);
    });

    it('debe rechazar contraseñas incorrectas', () => {
      expect(isValidPassword('short')).toBe(false); // Muy corta
      expect(isValidPassword('nouppercase123')).toBe(false); // Sin mayúscula
      expect(isValidPassword('NOLOWERCASE123')).toBe(false); // Sin minúscula
      expect(isValidPassword('NoNumbers')).toBe(false); // Sin números
      expect(isValidPassword('')).toBe(false); // Vacía
    });
  });
});

