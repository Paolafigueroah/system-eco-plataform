import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Users, Code, Gift, TrendingUp, MessageCircle, Award, Plus, Search, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabaseProductService } from '../services/supabaseProductService';
import AddProductForm from '../components/AddProductForm';
import ProductCard from '../components/ProductCard';
import SearchProducts from '../components/SearchProducts';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const features = [
    {
      icon: Gift,
      title: 'Intercambio Responsable',
      description: 'Vende, intercambia o dona productos usados para fomentar la sostenibilidad.'
    },
    {
      icon: TrendingUp,
      title: 'Sistema de Puntos',
      description: 'Gana puntos por tus acciones sostenibles y canjéalos por productos.'
    },
    {
      icon: Shield,
      title: 'Métricas Ambientales',
      description: 'Visualiza tu impacto ambiental: ahorro de CO₂, reciclaje y reutilización.'
    },
    {
      icon: MessageCircle,
      title: 'Chat Seguro',
      description: 'Comunícate directamente con compradores y vendedores de forma segura.'
    }
  ];

  const benefits = [
    {
      icon: Award,
      title: 'Gamificación',
      description: 'Obtén badges y logros por tus contribuciones a la economía circular.'
    },
    {
      icon: Users,
      title: 'Comunidad Sostenible',
      description: 'Conecta con personas comprometidas con el consumo responsable.'
    },
    {
      icon: Zap,
      title: 'Filtros Inteligentes',
      description: 'Encuentra productos por categoría, ubicación o condición fácilmente.'
    },
    {
      icon: Code,
      title: 'Reportes Detallados',
      description: 'Accede a dashboards con métricas de actividad e impacto global.'
    }
  ];

  const categories = [
    'Electrónica',
    'Ropa y accesorios',
    'Libros y educación',
    'Hogar y jardín',
    'Juguetes y entretenimiento',
    'Deportes y recreación',
    'Arte y manualidades',
    'Otros productos'
  ];

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchTerm]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      let result;
      
      // Si hay término de búsqueda, usar búsqueda
      if (searchTerm.trim()) {
        result = await supabaseProductService.searchProducts(searchTerm);
      } 
      // Si hay categoría seleccionada, filtrar por categoría
      else if (selectedCategory) {
        result = await supabaseProductService.getProductsByCategory(selectedCategory);
      } 
      // Si no, obtener todos los productos
      else {
        result = await supabaseProductService.getAllProducts();
      }
      
      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductAdded = (newProduct) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(selectedCategory === category ? '' : category);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts();
  };

  return (
    <div className="space-y-16 bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-sky-300/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8">
                <span className="gradient-text text-shadow">
                  Economía Circular
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                Plataforma de intercambio responsable que conecta usuarios y empresas para fomentar la sostenibilidad
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <Link
                to="/auth"
                className="btn-primary inline-flex items-center space-x-3 text-lg px-10 py-4 text-lg font-semibold"
              >
                <span>Únete Ahora</span>
                <ArrowRight size={24} className="animate-bounce-slow" />
              </Link>
              <Link
                to="/about"
                className="btn-outline inline-flex items-center space-x-3 text-lg px-10 py-4 text-lg font-semibold"
              >
                <span>Conoce Más</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text mb-2">1000+</div>
                <div className="text-gray-600 dark:text-gray-400">Productos Intercambiados</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text mb-2">500+</div>
                <div className="text-gray-600 dark:text-gray-400">Usuarios Activos</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text mb-2">2.5T</div>
                <div className="text-gray-600 dark:text-gray-400">CO₂ Ahorrado</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Add Product Section */}
      {isAuthenticated && (
        <section className="py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar productos..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </form>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSearch(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                >
                  <Search size={20} />
                  <span>Búsqueda Avanzada</span>
                </button>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Publicar Producto</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Explorar por Categorías
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <button
                key={`category-${category}`}
                onClick={() => handleCategoryClick(category)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedCategory === category
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-emerald-600 font-semibold text-lg">
                      {category.charAt(0)}
                    </span>
                  </div>
                  <h3 className="font-medium text-sm">{category}</h3>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedCategory ? `Productos en ${selectedCategory}` : 'Productos Recientes'}
            </h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory('')}
                className="text-emerald-600 hover:text-emerald-700 text-sm"
              >
                Ver todos los productos
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando productos...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard 
                  key={product.id || `product-${Math.random()}`} 
                  product={product} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedCategory ? `No hay productos en ${selectedCategory}` : 'No hay productos disponibles'}
              </h3>
              <p className="text-gray-600 mb-4">
                {selectedCategory 
                  ? 'Sé el primero en publicar un producto en esta categoría'
                  : 'Sé el primero en publicar un producto'
                }
              </p>
              {isAuthenticated && (
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Publicar Producto</span>
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="section-title">
              ¿Cómo funciona nuestra plataforma?
            </h2>
            <p className="section-subtitle">
              Conectamos usuarios y empresas para el intercambio responsable de productos, fomentando la sostenibilidad y el consumo consciente.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={`feature-${index}-${feature.title}`} 
                  className="feature-card group animate-fade-in-up"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="feature-icon">
                    <Icon size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-emerald-50 to-purple-50 dark:from-gray-800 dark:via-emerald-900/20 dark:to-purple-900/20"></div>
        <div className="absolute top-10 right-10 w-64 h-64 bg-sky-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="section-title">
              Beneficios de la Economía Circular
            </h2>
            <p className="section-subtitle">
              Descubre todas las ventajas de participar en nuestra comunidad sostenible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={`benefit-${index}-${benefit.title}`} 
                  className="feature-card glass-effect group animate-fade-in-up"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-900 dark:to-sky-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="text-sky-600 dark:text-sky-400" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-sky-500 to-purple-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/10 rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 text-shadow">
              ¿Listo para hacer la diferencia?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed">
              Únete a miles de personas que ya están contribuyendo a un futuro más sostenible. 
              Registra productos, gana puntos y visualiza tu impacto ambiental.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/auth"
                className="bg-white text-emerald-600 hover:bg-emerald-50 font-bold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center space-x-3 text-lg"
              >
                <span>Crear Cuenta</span>
                <ArrowRight size={24} className="animate-bounce-slow" />
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 font-bold py-4 px-8 rounded-2xl transition-all duration-300 inline-flex items-center space-x-3 text-lg"
              >
                <span>Contacto</span>
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Add Product Modal */}
      {showAddProduct && (
        <AddProductForm
          onClose={() => setShowAddProduct(false)}
          onProductAdded={handleProductAdded}
        />
      )}

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Búsqueda Avanzada</h2>
              <button
                onClick={() => setShowSearch(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <SearchProducts />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
