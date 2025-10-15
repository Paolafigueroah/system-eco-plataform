import React, { useState, useEffect } from 'react';
import { X, Users, Search, UserPlus, UserMinus, Crown, Shield, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabaseChatService } from '../services/supabaseChatService';
import { useTheme } from '../hooks/useTheme';

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [step, setStep] = useState(1); // 1: detalles, 2: participantes
  const [groupData, setGroupData] = useState({
    name: '',
    description: '',
    image: null
  });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && step === 2) {
      loadAvailableUsers();
    }
  }, [isOpen, step]);

  const loadAvailableUsers = async () => {
    try {
      const result = await supabaseChatService.getAllUsers(user.id);
      if (result.success) {
        setAvailableUsers(result.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleNext = () => {
    if (!groupData.name.trim()) {
      setError('El nombre del grupo es requerido');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleUserToggle = (user) => {
    setSelectedUsers(prev => {
      const isSelected = prev.find(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleCreateGroup = async () => {
    if (selectedUsers.length === 0) {
      setError('Selecciona al menos un participante');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const participantIds = selectedUsers.map(u => u.id);
      const result = await supabaseChatService.createGroupConversation(
        groupData.name,
        groupData.description,
        user.id,
        participantIds
      );

      if (result.success) {
        onGroupCreated(result.data);
        handleClose();
      } else {
        setError(result.error || 'Error al crear el grupo');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      setError('Error al crear el grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setGroupData({ name: '', description: '', image: null });
    setSelectedUsers([]);
    setSearchTerm('');
    setError('');
    onClose();
  };

  const filteredUsers = availableUsers.filter(user =>
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {step === 1 ? 'Crear Grupo' : 'Agregar Participantes'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {step === 1 ? 'Configura los detalles del grupo' : `${selectedUsers.length} participante${selectedUsers.length !== 1 ? 's' : ''} seleccionado${selectedUsers.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {step === 1 ? (
            <div className="space-y-6">
              {/* Nombre del grupo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del grupo *
                </label>
                <input
                  type="text"
                  value={groupData.name}
                  onChange={(e) => setGroupData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Ej: Equipo de Desarrollo"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {groupData.name.length}/50 caracteres
                </p>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={groupData.description}
                  onChange={(e) => setGroupData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Describe el propósito del grupo..."
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {groupData.description.length}/200 caracteres
                </p>
              </div>

              {/* Imagen del grupo (placeholder) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Imagen del grupo (próximamente)
                </label>
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  La funcionalidad de imagen estará disponible pronto
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Buscar usuarios..."
                />
              </div>

              {/* Lista de usuarios */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios disponibles'}
                    </p>
                  </div>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelected = selectedUsers.find(u => u.id === user.id);
                    return (
                      <div
                        key={user.id}
                        onClick={() => handleUserToggle(user)}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                          isSelected
                            ? 'bg-emerald-100 dark:bg-emerald-900 border border-emerald-300 dark:border-emerald-700'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                        }`}
                      >
                        <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-semibold">
                          {user.display_name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {user.display_name || user.email}
                          </p>
                          {user.display_name && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {isSelected ? (
                            <UserMinus className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <UserPlus className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            {step === 2 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors duration-200"
              >
                Atrás
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors duration-200"
            >
              Cancelar
            </button>
            
            {step === 1 ? (
              <button
                onClick={handleNext}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleCreateGroup}
                disabled={loading || selectedUsers.length === 0}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                {loading ? 'Creando...' : `Crear Grupo (${selectedUsers.length})`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
