import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit, 
  Save, 
  X, 
  Package, 
  Eye, 
  BarChart3,
  TrendingUp,
  Tag,
  DollarSign
} from 'lucide-react';
import { supabaseAuthService } from '../services/supabaseAuthService';
import { supabaseProfileService } from '../services/supabaseProfileService';

const UserProfile = ({ userId, onClose }) => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    email: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      loadUserProfile();
      loadUserStats();
    }
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      const result = await supabaseProfileService.getUserProfile(userId);
      if (result.success) {
        setUser(result.data);
        setEditForm({
          display_name: result.data.display_name || result.data.displayName || 'Usuario',
          email: result.data.email || 'usuario@ejemplo.com'
        });
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
      setError('Error cargando perfil del usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const result = await supabaseAuthService.getUserStats(userId);
      if (result.success) {
        // Normalizar a lo que espera el UI
        const raw = result.data;
        setStats({
          total_products: raw.total_products ?? raw.products ?? 0,
          total_views: raw.total_views ?? raw.views ?? 0,
          categories: raw.categories ?? [],
          transaction_types: raw.transaction_types ?? [],
        });
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      display_name: user.display_name,
      email: user.email
    });
    setError('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');

    try {
      const result = await supabaseAuthService.updateUserProfile(userId, editForm);
      if (result.success) {
        setUser(result.data);
        setIsEditing(false);
        // Actualizar el contexto de autenticación si es necesario
        window.location.reload(); // Recargar para actualizar el contexto
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      setError('Error actualizando perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando perfil...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Error cargando perfil del usuario</p>
        {error && <p className="text-sm text-gray-600 mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Perfil de Usuario</h1>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Información del usuario */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Información Personal</h2>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Edit size={16} className="mr-2" />
                  Editar
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                  >
                    <X size={16} className="mr-2" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Guardar
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-3 sm:space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nombre de usuario
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="display_name"
                    value={editForm.display_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre de usuario"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{user.display_name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Email"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-gray-100">{user.email}</p>
                )}
              </div>

              {/* Fecha de registro */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Miembro desde
                </label>
                <p className="text-gray-900 dark:text-gray-100">{formatDate(user.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Estadísticas
            </h2>

            {stats ? (
              <div className="space-y-4">
                {/* Total de productos */}
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">Productos Publicados</p>
                      <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{stats.total_products}</p>
                    </div>
                    <Package className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                {/* Total de vistas */}
                <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-300 font-medium">Total de Vistas</p>
                      <p className="text-2xl font-bold text-green-800 dark:text-green-200">{stats.total_views}</p>
                    </div>
                    <Eye className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                {/* Categorías */}
                {stats.categories.length > 0 && (
                  <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-purple-600 mb-3 flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      Productos por Categoría
                    </h3>
                    <div className="space-y-2">
                      {stats.categories.map((category, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-purple-700 dark:text-purple-300">{category.category}</span>
                          <span className="font-medium text-purple-800 dark:text-purple-200">{category.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tipos de transacción */}
                {stats.transaction_types.length > 0 && (
                  <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-orange-600 mb-3 flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Por Tipo de Transacción
                    </h3>
                    <div className="space-y-2">
                      {stats.transaction_types.map((type, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-orange-700 dark:text-orange-300 capitalize">{type.transaction_type}</span>
                          <span className="font-medium text-orange-800 dark:text-orange-200">{type.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando estadísticas...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
