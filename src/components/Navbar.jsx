import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Info, Mail, User, LogOut, Package, MessageCircle, Heart, Bell } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ChatNotifications from './ChatNotifications';
import ToggleTheme from './ToggleTheme';
import NotificationCenter from './NotificationCenter';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/about', label: 'About', icon: Info },
    { path: '/contact', label: 'Contact', icon: Mail },
  ];

  return (
    <nav className="glass-effect backdrop-blur-md border-b border-white/20 dark:border-gray-700/50 transition-all duration-300 sticky top-0 z-40">
      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <span className="text-white font-bold text-xl">♻</span>
            </div>
            <span className="hidden sm:block text-xl sm:text-2xl font-bold gradient-text group-hover:scale-105 transition-transform duration-300 truncate max-w-[12ch]">
              Economía Circular
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 font-medium ring-1 ${
                    isActive
                      ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50/90 dark:bg-emerald-900/30 ring-emerald-200/70 dark:ring-emerald-700 shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-gray-50/90 dark:hover:bg-gray-700/50 ring-transparent hover:ring-emerald-200/60 hover:shadow-md'
                  }`}
                >
                  <Icon size={20} strokeWidth={2.5} className="shrink-0" />
                  <span className="font-semibold">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Theme Toggle & Auth Buttons & Mobile Menu Button */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 min-w-0">
            <ToggleTheme />

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/dashboard"
                  className="btn btn-sm btn-outline btn-primary flex items-center space-x-2"
                >
                  <Package size={16} strokeWidth={2.5} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link
                  to="/chat"
                  className="btn btn-sm btn-outline btn-secondary flex items-center space-x-2"
                >
                  <MessageCircle size={16} strokeWidth={2.5} />
                  <span className="hidden sm:inline">Chat</span>
                </Link>
                <Link
                  to="/profile"
                  className="btn btn-sm btn-outline btn-accent flex items-center space-x-2"
                >
                  <User size={16} strokeWidth={2.5} />
                  <span className="hidden sm:inline">Perfil</span>
                </Link>
                <Link
                  to="/favorites"
                  className="btn btn-sm btn-outline btn-error flex items-center space-x-2"
                >
                  <Heart size={16} strokeWidth={2.5} />
                  <span className="hidden sm:inline">Favoritos</span>
                </Link>
                <button
                  onClick={() => setShowNotifications(true)}
                  className="btn btn-sm btn-outline btn-warning flex items-center space-x-2 relative"
                  title="Notificaciones"
                >
                  <Bell size={16} strokeWidth={2.5} />
                  <span className="hidden sm:inline">Notificaciones</span>
                </button>
                <ChatNotifications onOpenChat={() => navigate('/chat')} />
                <div className="hidden md:flex items-center space-x-2 text-sm min-w-0">
                  <User size={16} />
                  <span className="text-base-content/80 truncate max-w-[14ch] lg:max-w-[20ch]">
                    {user?.display_name || user?.displayName || user?.email || 'Usuario'}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="btn btn-sm btn-outline btn-error flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              <div className="hidden md:flex">
                <Link
                  to="/auth"
                  className="btn btn-sm btn-primary flex items-center space-x-2"
                >
                  <User size={16} />
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                </Link>
              </div>
            )}

            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              {isOpen ? <X size={20} className="text-gray-700 dark:text-gray-300" /> : <Menu size={20} className="text-gray-700 dark:text-gray-300" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={18} strokeWidth={2.5} className={isActive ? 'text-white' : 'text-emerald-700 dark:text-emerald-300'} />
                    <span className="font-semibold">{item.label}</span>
                  </Link>
                );
              })}
              
                             {/* Mobile Auth Section */}
               <div className="border-t border-base-300 pt-2 mt-2">
                 {isAuthenticated ? (
                   <div className="space-y-2">
                     <Link
                       to="/dashboard"
                       onClick={() => setIsOpen(false)}
                       className="flex items-center space-x-3 px-3 py-3 rounded-lg bg-primary text-primary-content hover:bg-primary-focus transition-colors duration-200"
                     >
                       <Package size={18} strokeWidth={2.5} className="text-white" />
                       <span>Dashboard</span>
                     </Link>
                     <Link
                       to="/chat"
                       onClick={() => setIsOpen(false)}
                       className="flex items-center space-x-3 px-3 py-3 rounded-lg bg-secondary text-secondary-content hover:bg-secondary-focus transition-colors duration-200"
                     >
                       <MessageCircle size={18} strokeWidth={2.5} className="text-white" />
                       <span>Chat</span>
                     </Link>
                     <Link
                       to="/profile"
                       onClick={() => setIsOpen(false)}
                       className="flex items-center space-x-3 px-3 py-3 rounded-lg bg-accent text-accent-content hover:bg-accent-focus transition-colors duration-200"
                     >
                       <User size={18} strokeWidth={2.5} className="text-white" />
                       <span>Perfil</span>
                     </Link>
                     <Link
                       to="/favorites"
                       onClick={() => setIsOpen(false)}
                       className="flex items-center space-x-3 px-3 py-3 rounded-lg bg-error text-error-content hover:bg-error-focus transition-colors duration-200"
                     >
                       <Heart size={18} strokeWidth={2.5} className="text-white" />
                       <span>Favoritos</span>
                     </Link>
                     <button
                       onClick={() => {
                         setIsOpen(false);
                         setShowNotifications(true);
                       }}
                       className="flex items-center space-x-3 px-3 py-3 rounded-lg bg-warning text-warning-content hover:bg-warning-focus transition-colors duration-200"
                     >
                       <Bell size={18} strokeWidth={2.5} className="text-white" />
                       <span>Notificaciones</span>
                     </button>
                     <div className="flex items-center space-x-3 px-3 py-2 text-base-content/70">
                       <User size={18} strokeWidth={2.5} />
                       <span className="truncate max-w-[70%]">{user?.display_name || user?.displayName || user?.email || 'Usuario'}</span>
                     </div>
                     <button
                       onClick={() => {
                         handleSignOut();
                         setIsOpen(false);
                       }}
                       className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-error hover:bg-error/10 transition-colors duration-200"
                     >
                       <LogOut size={18} />
                       <span>Cerrar Sesión</span>
                     </button>
                   </div>
                 ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-primary text-primary-content hover:bg-primary-focus transition-colors duration-200"
                  >
                    <User size={18} />
                    <span>Iniciar Sesión</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </nav>
  );
};

export default Navbar;
