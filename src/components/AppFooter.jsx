import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const AppFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-auto border-t border-gray-200/80 bg-white/90 dark:border-gray-700/80 dark:bg-gray-900/90 backdrop-blur-md"
      role="contentinfo"
    >
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="mb-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Leaf className="h-6 w-6" aria-hidden />
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">System Eco</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Plataforma de economía circular para intercambiar, vender y donar productos de forma responsable,
              conectando personas y organizaciones.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm" aria-label="Pie de página">
            <Link
              to="/"
              className="text-gray-600 transition-colors hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
            >
              Inicio
            </Link>
            <Link
              to="/about"
              className="text-gray-600 transition-colors hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
            >
              Acerca de
            </Link>
            <Link
              to="/contact"
              className="text-gray-600 transition-colors hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
            >
              Contacto
            </Link>
            <Link
              to="/auth"
              className="text-gray-600 transition-colors hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
            >
              Acceso
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-gray-100 pt-8 text-center text-xs text-gray-500 dark:border-gray-800 dark:text-gray-500 md:flex-row md:items-center md:justify-between md:text-left">
          <p>
            © {year} System Eco. Proyecto de titulación — uso académico y demostración de producto.
          </p>
          <p className="text-gray-400 dark:text-gray-600">
            Economía circular · Sostenibilidad · Comunidad
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
