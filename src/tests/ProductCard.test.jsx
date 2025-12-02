import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { AuthProvider } from '../hooks/useAuth';

// Mock de servicios
vi.mock('../services/supabaseFavoritesService', () => ({
  supabaseFavoritesService: {
    isFavorite: vi.fn(() => Promise.resolve({ success: true, data: false })),
    toggleFavorite: vi.fn(() => Promise.resolve({ success: true }))
  }
}));

const mockProduct = {
  id: '1',
  title: 'Producto de prueba',
  description: 'Descripción del producto',
  price: 100,
  category: 'Electrónica',
  condition_product: 'excelente',
  transaction_type: 'venta',
  status: 'active',
  views: 10,
  favorites: 5,
  user_id: 'user1',
  user_name: 'Usuario Test',
  created_at: new Date().toISOString(),
  images: ['https://example.com/image.jpg']
};

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el título del producto', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Producto de prueba')).toBeInTheDocument();
  });

  it('debe mostrar el precio formateado', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  it('debe mostrar "Gratis" cuando el precio es 0', () => {
    const freeProduct = { ...mockProduct, price: 0 };
    renderWithProviders(<ProductCard product={freeProduct} />);
    expect(screen.getByText('Gratis')).toBeInTheDocument();
  });

  it('debe mostrar la categoría del producto', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Electrónica')).toBeInTheDocument();
  });

  it('debe mostrar el badge "Vendido" cuando el status es sold', () => {
    const soldProduct = { ...mockProduct, status: 'sold' };
    renderWithProviders(<ProductCard product={soldProduct} />);
    expect(screen.getByText('Vendido')).toBeInTheDocument();
  });

  it('debe mostrar las vistas y favoritos', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/10 vistas/)).toBeInTheDocument();
    expect(screen.getByText(/5 favoritos/)).toBeInTheDocument();
  });

  it('debe tener un enlace al detalle del producto', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);
    const link = screen.getByText('Ver Detalles').closest('a');
    expect(link).toHaveAttribute('href', '/product/1');
  });
});

