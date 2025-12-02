import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthProvider } from '../hooks/useAuth';

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el logo', () => {
    renderWithProviders(<Navbar />);
    const logo = screen.getByAltText('BioConnect Logo');
    expect(logo).toBeInTheDocument();
  });

  it('debe renderizar enlaces de navegación', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Acerca')).toBeInTheDocument();
    expect(screen.getByText('Contacto')).toBeInTheDocument();
  });

  it('debe mostrar botón de login cuando no está autenticado', () => {
    renderWithProviders(<Navbar />);
    // El botón puede estar oculto en mobile, pero debe existir
    const loginButton = screen.queryByText(/Iniciar Sesión/i);
    // Puede estar en desktop o mobile menu
    expect(loginButton || screen.queryByRole('link', { name: /iniciar sesión/i })).toBeTruthy();
  });
});

