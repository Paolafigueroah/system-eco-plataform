import { describe, it, expect } from 'vitest';
import { formatPrice, formatDate, truncateText } from './helpers';

describe('helpers', () => {
  describe('formatPrice', () => {
    it('debe formatear precios correctamente', () => {
      expect(formatPrice(1000)).toBe('$1,000');
      expect(formatPrice(0)).toBe('$0');
      expect(formatPrice(123.45)).toBe('$123.45');
    });
  });

  describe('formatDate', () => {
    it('debe formatear fechas correctamente', () => {
      const date = new Date('2024-01-15T10:30:00');
      const formatted = formatDate(date);
      expect(formatted).toContain('2024');
    });
  });

  describe('truncateText', () => {
    it('debe truncar texto largo', () => {
      const longText = 'Este es un texto muy largo que debe ser truncado';
      const truncated = truncateText(longText, 20);
      expect(truncated.length).toBeLessThanOrEqual(23); // 20 + '...'
    });

    it('no debe truncar texto corto', () => {
      const shortText = 'Texto corto';
      expect(truncateText(shortText, 20)).toBe(shortText);
    });
  });
});

