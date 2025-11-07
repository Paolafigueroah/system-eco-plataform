import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Edit, 
  Save, 
  X, 
  Package, 
  Heart, 
  Eye, 
  Award,
  Phone,
  Globe,
  Camera,
  Upload
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabaseProfileService } from '../services/supabaseProfileService';
import { supabaseProductService } from '../services/supabaseProductService';

const UserProfile = ({ userId, onClose }) => {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalViews: 0,
    totalFavorites: 0,
    memberSince: null
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    display_name: '',
    bio: '',
    location: '',
    phone: '',
    website: ''
  });

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadUserProducts();
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const result = await supabaseProfileService.getProfile(userId);
      if (result.success) {
        setProfile(result.data);
        setEditData({
          display_name: result.data.display_name || '',
          bio: result.data.bio || '',
          location: result.data.location || '',
          phone: result.data.phone || '',
          website: result.data.website || ''
        });
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProducts = async () => {
    try {
      const result = await supabaseProductService.getProductsByUserId(userId);
      if (result.success) {
        setUserProducts(result.data);
        
        // Calcular estadísticas
        const totalViews = result.data.reduce((sum, product) => sum + (product.views || 0), 0);
        const totalFavorites = result.data.reduce((sum, product) => sum + (product.favorites || 0), 0);
        
        setStats({
          totalProducts: result.data.length,
          totalViews,
          totalFavorites,
          memberSince: result.data[0]?.created_at || new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error cargando productos del usuario:', error);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      // Normalizar la URL del sitio web: agregar https:// si no tiene protocolo
      const normalizedData = { ...editData };
      if (normalizedData.website && normalizedData.website.trim()) {
        const website = normalizedData.website.trim();
        // Si no empieza con http:// o https://, agregar https://
        if (!website.match(/^https?:\/\//i)) {
          normalizedData.website = `https://${website}`;
        }
      }
      
      const result = await supabaseProfileService.updateProfile(userId, normalizedData);
      if (result.success) {
        setProfile({ ...profile, ...normalizedData });
        setEditData(normalizedData); // Actualizar también el estado local
        setEditing(false);
      } else {
        alert('Error actualizando perfil: ' + result.error);
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      alert('Error actualizando perfil');
    }
  };

  const handleCancel = () => {
    setEditData({
      display_name: profile?.display_name || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      phone: profile?.phone || '',
      website: profile?.website || ''
    });
    setEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOwnProfile = currentUser && currentUser.id === userId;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Perfil de Usuario</h1>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {(profile?.display_name || profile?.email || 'U').charAt(0).toUpperCase()}
              </div>
              {isOwnProfile && (
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors">
                  <Camera size={16} />
                </button>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre de usuario
                    </label>
                    <input
                      type="text"
                      name="display_name"
                      value={editData.display_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Biografía
                    </label>
                    <textarea
                      name="bio"
                      value={editData.bio}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      placeholder="Cuéntanos sobre ti..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Ubicación
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={editData.location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Ciudad, País"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={editData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sitio web
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={editData.website}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="https://tu-sitio.com o tu-sitio.com"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Puedes ingresar con o sin https://
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Save size={16} />
                      <span>Guardar</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X size={16} />
                      <span>Cancelar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {profile?.display_name || 'Usuario'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {profile?.bio || 'No hay biografía disponible'}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Mail size={16} className="mr-2" />
                      <span>{profile?.email || 'No disponible'}</span>
                    </div>
                    {profile?.location && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <MapPin size={16} className="mr-2" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile?.phone && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Phone size={16} className="mr-2" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {profile?.website && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Globe size={16} className="mr-2" />
                        <a 
                          href={profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700"
                        >
                          {profile.website}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Calendar size={16} className="mr-2" />
                      <span>Miembro desde {formatDate(stats.memberSince)}</span>
                    </div>
                  </div>

                  {isOwnProfile && (
                    <button
                      onClick={handleEdit}
                      className="mt-4 flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Edit size={16} />
                      <span>Editar Perfil</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Package className="text-emerald-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProducts}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Productos</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Eye className="text-blue-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalViews}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Vistas</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Heart className="text-red-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalFavorites}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Favoritos</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award className="text-yellow-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">4.8</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Calificación</div>
          </div>
        </div>

        {/* User Products */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Productos de {profile?.display_name || 'Usuario'}
          </h3>
          
          {userProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userProducts.map((product) => (
                <div key={product.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                      {product.title}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.transaction_type === 'venta' ? 'bg-blue-100 text-blue-800' :
                      product.transaction_type === 'intercambio' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {product.transaction_type === 'venta' ? 'Venta' :
                       product.transaction_type === 'intercambio' ? 'Intercambio' : 'Donación'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{product.views || 0} vistas</span>
                    <span>{product.favorites || 0} favoritos</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {isOwnProfile ? 'No has publicado productos aún' : 'Este usuario no tiene productos publicados'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;