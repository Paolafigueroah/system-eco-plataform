import React from 'react';
import { Code, Database, Palette, Zap, Leaf, Users, TrendingUp, Shield } from 'lucide-react';
import { getCategoryIcon, getCategoryIconColor } from '../utils/categoryIcons';

const About = () => {
  const objectives = [
    {
      category: 'Objetivo General',
      icon: Leaf,
      title: 'Desarrollar una plataforma de economía circular',
      description: 'Conectar usuarios y empresas para el intercambio responsable de productos, fomentando la sostenibilidad y el consumo consciente.',
      details: [
        'Intercambio de productos usados',
        'Fomento de la sostenibilidad',
        'Consumo responsable'
      ]
    },
    {
      category: 'Objetivos Específicos',
      icon: Users,
      title: 'Gestión de usuarios y productos',
      description: 'Permitir a los usuarios registrar y publicar productos para venta, intercambio o donación.',
      details: [
        'Registro de productos usados',
        'Sistema de publicación',
        'Categorización inteligente'
      ]
    },
    {
      category: 'Sistema de Incentivos',
      icon: TrendingUp,
      title: 'Puntos y gamificación',
      description: 'Implementar un sistema de puntos o créditos que incentive la participación activa.',
      details: [
        'Puntos por donaciones',
        'Sistema de recompensas',
        'Badges y logros'
      ]
    },
    {
      category: 'Impacto Ambiental',
      icon: Shield,
      title: 'Métricas ambientales',
      description: 'Integrar un sistema de métricas ambientales, mostrando ahorro de CO₂, reciclaje o reutilización.',
      details: [
        'Medición de CO₂ ahorrado',
        'Métricas de reciclaje',
        'Reportes de impacto'
      ]
    }
  ];

  const features = [
    'Registro y login con correo y contraseña',
    'Perfiles con historial de publicaciones y puntos',
    'Publicación de productos por categorías',
    'Sistema de puntos y gamificación',
    'Chat seguro entre usuarios',
    'Filtros inteligentes de búsqueda',
    'Métricas ambientales en tiempo real',
    'Reportes y dashboards detallados'
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

  return (
    <div className="space-y-16">
      {/* Header Section */}
      <section className="text-center py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-6">
          BioConnect - Plataforma de Economía Circular
        </h1>
        <p className="text-xl text-base-content/80 max-w-3xl mx-auto">
          Una plataforma web que permite a usuarios y empresas intercambiar, vender o donar productos usados 
          para fomentar la sostenibilidad y el consumo responsable. Conectamos comunidades comprometidas 
          con el futuro del planeta.
        </p>
      </section>

      {/* Objectives Section */}
      <section className="py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
            Nuestros Objetivos
          </h2>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Trabajamos para crear un ecosistema sostenible que beneficie tanto a las personas como al medio ambiente.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {objectives.map((objective, index) => {
            const Icon = objective.icon;
            return (
              <div key={index} className="card group hover:shadow-xl transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors duration-300">
                    <Icon className="text-emerald-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-emerald-600 mb-2 block">
                      {objective.category}
                    </span>
                    <h3 className="text-xl font-semibold text-base-content mb-2">
                      {objective.title}
                    </h3>
                    <p className="text-base-content/70 mb-3">
                      {objective.description}
                    </p>
                    <div className="space-y-1">
                      {objective.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                          <span className="text-sm text-base-content/70">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features List */}
      <section className="py-16 bg-gradient-to-r from-emerald-50 to-sky-50 dark:from-emerald-900/20 dark:to-sky-900/20 rounded-2xl">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Funcionalidades Principales
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-200">
              Todo lo que necesitas para participar en la economía circular.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-gray-800 dark:text-gray-100 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
            Categorías de Productos
          </h2>
          <p className="text-lg text-base-content/70">
            Encuentra o publica productos en las categorías más populares.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => {
            const Icon = getCategoryIcon(category);
            const iconColor = getCategoryIconColor(category);
            return (
              <div key={index} className="card text-center group hover:shadow-lg transition-all duration-300">
                <div className={`w-12 h-12 ${iconColor} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-all duration-300`}>
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="font-medium text-base-content">{category}</h3>
              </div>
            );
          })}
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800 rounded-2xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Tecnologías Utilizadas
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Construida con tecnologías modernas para ofrecer la mejor experiencia.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Frontend</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">React 18</span>
                  <span className="text-emerald-600">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Tailwind CSS</span>
                  <span className="text-emerald-600">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">DaisyUI</span>
                  <span className="text-emerald-600">✓</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Backend</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Supabase</span>
                  <span className="text-emerald-600">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Autenticación JWT</span>
                  <span className="text-emerald-600">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Chat en tiempo real</span>
                  <span className="text-emerald-600">✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
