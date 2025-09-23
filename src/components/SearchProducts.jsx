import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  MapPin, 
  DollarSign, 
  Tag, 
  Package,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { sqliteProductService } from '../services/sqliteProductService';
import ProductCard from './ProductCard';

const SearchProducts = () => {
  const [searchParams, setSearchParams] = useState({
    searchText: '',
    category: 'all',
    transactionType: 'all',
    minPrice: '',
    maxPrice: '',
    location: '',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  // Cargar categorías al montar el componente
  useEffect(() => {
    loadCategories();
    performSearch(); // Cargar productos iniciales
  }, []);

  const loadCategories = async () => {
    try {
      const result = await sqliteProductService.getCategories();
      if (result.success) {
        setCategories(result.categories);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const result = await sqliteProductService.searchProducts(searchParams);
      if (result.success) {
        setProducts(result.products);
        setTotalResults(result.total);
      } else {
        console.error('Error en búsqueda:', result.error);
        setProducts([]);
        setTotalResults(0);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setProducts([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch();
  };

  const clearFilters = () => {
    setSearchParams({
      searchText: '',
      category: 'all',
      transactionType: 'all',
      minPrice: '',
      maxPrice: '',
      location: '',
      sortBy: 'created_at',
      sortOrder: 'DESC'
    });
  };

  const toggleSortOrder = () => {
    setSearchParams(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Buscar Productos</h1>
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400">Encuentra exactamente lo que necesitas</p>
      </div>

      {/* Barra de búsqueda principal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="searchText"
              value={searchParams.searchText}
              onChange={handleInputChange}
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-lg border transition-colors ${
              showFilters 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 dark:text-gray-300 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Filtros avanzados */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filtros Avanzados</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 flex items-center"
            >
              <X className="w-4 h-4 mr-1" />
              Limpiar filtros
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Categoría
              </label>
              <select
                name="category"
                value={searchParams.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Tipo de transacción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Package className="w-4 h-4 inline mr-1" />
                Tipo
              </label>
              <select
                name="transactionType"
                value={searchParams.transactionType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los tipos</option>
                <option value="venta">Venta</option>
                <option value="intercambio">Intercambio</option>
                <option value="donacion">Donación</option>
              </select>
            </div>

            {/* Precio mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Precio mínimo
              </label>
              <input
                type="number"
                name="minPrice"
                value={searchParams.minPrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Precio máximo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Precio máximo
              </label>
              <input
                type="number"
                name="maxPrice"
                value={searchParams.maxPrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="Sin límite"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Ubicación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Ubicación
              </label>
              <input
                type="text"
                name="location"
                value={searchParams.location}
                onChange={handleInputChange}
                placeholder="Ciudad, estado..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Ordenamiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ordenar por
              </label>
              <div className="flex gap-2">
                <select
                  name="sortBy"
                  value={searchParams.sortBy}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="created_at">Fecha de publicación</option>
                  <option value="price">Precio</option>
                  <option value="title">Título</option>
                  <option value="views">Más vistos</option>
                </select>
                <button
                  type="button"
                  onClick={toggleSortOrder}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title={`Orden ${searchParams.sortOrder === 'ASC' ? 'ascendente' : 'descendente'}`}
                >
                  {searchParams.sortOrder === 'ASC' ? (
                    <SortAsc className="w-5 h-5" />
                  ) : (
                    <SortDesc className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resultados */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Resultados de búsqueda
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isLoading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Buscando...
              </span>
            ) : (
              `${totalResults} producto${totalResults !== 1 ? 's' : ''} encontrado${totalResults !== 1 ? 's' : ''}`
            )}
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : !isLoading ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Intenta ajustar tus filtros de búsqueda o usar términos diferentes.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchProducts;
