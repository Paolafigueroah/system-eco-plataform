import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidPassword, getPasswordStrength, getPasswordRequirements } from '../utils/validation';

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
    it('debe validar contraseñas correctas con todos los requisitos', () => {
      expect(isValidPassword('Password123@')).toBe(true);
      expect(isValidPassword('MyP@ssw0rd')).toBe(true);
      expect(isValidPassword('Test1234!')).toBe(true);
      expect(isValidPassword('Secure$Pass1')).toBe(true);
    });

    it('debe rechazar contraseñas incorrectas', () => {
      expect(isValidPassword('short')).toBe(false); // Muy corta
      expect(isValidPassword('nouppercase123@')).toBe(false); // Sin mayúscula
      expect(isValidPassword('NOLOWERCASE123@')).toBe(false); // Sin minúscula
      expect(isValidPassword('NoNumbers@')).toBe(false); // Sin números
      expect(isValidPassword('NoSymbol123')).toBe(false); // Sin símbolos
      expect(isValidPassword('')).toBe(false); // Vacía
    });
  });

  describe('getPasswordStrength', () => {
    it('debe calcular la fortaleza correctamente', () => {
      const weak = getPasswordStrength('short');
      expect(weak.label).toBe('Débil');
      
      const regular = getPasswordStrength('Password1');
      expect(regular.label).toBe('Regular');
      
      const good = getPasswordStrength('Password123');
      expect(good.label).toBe('Buena');
      
      const strong = getPasswordStrength('Password123@');
      expect(strong.label).toBe('Fuerte');
    });
  });

  describe('getPasswordRequirements', () => {
    it('debe verificar todos los requisitos', () => {
      const reqs = getPasswordRequirements('Password123@');
      expect(reqs.length).toBe(true);
      expect(reqs.lowercase).toBe(true);
      expect(reqs.uppercase).toBe(true);
      expect(reqs.number).toBe(true);
      expect(reqs.special).toBe(true);
    });

    it('debe detectar requisitos faltantes', () => {
      const reqs = getPasswordRequirements('password');
      expect(reqs.uppercase).toBe(false);
      expect(reqs.number).toBe(false);
      expect(reqs.special).toBe(false);
    });
  });
});

