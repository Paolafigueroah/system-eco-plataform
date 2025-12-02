import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';

describe('PasswordStrengthIndicator', () => {
  it('no debe renderizar cuando no hay contraseña', () => {
    const { container } = render(<PasswordStrengthIndicator password="" />);
    expect(container.firstChild).toBeNull();
  });

  it('debe mostrar todos los requisitos', () => {
    render(<PasswordStrengthIndicator password="Test" />);
    expect(screen.getByText(/Al menos 8 caracteres/i)).toBeInTheDocument();
    expect(screen.getByText(/Una letra minúscula/i)).toBeInTheDocument();
    expect(screen.getByText(/Una letra mayúscula/i)).toBeInTheDocument();
    expect(screen.getByText(/Un número/i)).toBeInTheDocument();
    expect(screen.getByText(/Un símbolo/i)).toBeInTheDocument();
  });

  it('debe mostrar checkmarks para requisitos cumplidos', () => {
    render(<PasswordStrengthIndicator password="Password123@" />);
    const checks = screen.getAllByRole('img', { hidden: true });
    expect(checks.length).toBeGreaterThan(0);
  });
});

