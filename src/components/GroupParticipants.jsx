import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserMinus, Crown, Shield, User, MoreVertical, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabaseChatService } from '../services/supabaseChatService';
import { useTheme } from '../hooks/useTheme';

const GroupParticipants = ({ conversation, isOpen, onClose, onParticipantChange }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [participants, setParticipants] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && conversation) {
      loadParticipants();
      loadAvailableUsers();
    }
  }, [isOpen, conversation]);

  const loadParticipants = async () => {
    try {
      const result = await supabaseChatService.getGroupParticipants(conversation.id);
      if (result.success) {
        setParticipants(result.data);
      }
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const result = await supabaseChatService.getAllUsers(user.id);
      if (result.success) {
        // Filtrar usuarios que ya están en el grupo
        const participantIds = participants.map(p => p.user_id);
        const available = result.data.filter(u => !participantIds.includes(u.id));
        setAvailableUsers(available);
      }
    } catch (error) {
      console.error('Error loading available users:', error);
    }
  };

  const handleAddParticipant = async (userId) => {
    setLoading(true);
    setError('');

    try {
      const result = await supabaseChatService.addGroupParticipant(
        conversation.id,
        userId,
        user.id
      );

      if (result.success) {
        await loadParticipants();
        await loadAvailableUsers();
        onParticipantChange?.();
        setShowAddModal(false);
      } else {
        setError(result.error || 'Error al agregar participante');
      }
    } catch (error) {
      console.error('Error adding participant:', error);
      setError('Error al agregar participante');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveParticipant = async (userId) => {
    if (userId === user.id) {
      setError('No puedes removerte a ti mismo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await supabaseChatService.removeGroupParticipant(
        conversation.id,
        userId,
        user.id
      );

      if (result.success) {
        await loadParticipants();
        await loadAvailableUsers();
        onParticipantChange?.();
      } else {
        setError(result.error || 'Error al remover participante');
      }
    } catch (error) {
      console.error('Error removing participant:', error);
      setError('Error al remover participante');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setLoading(true);
    setError('');

    try {
      const result = await supabaseChatService.changeParticipantRole(
        conversation.id,
        userId,
        newRole,
        user.id
      );

      if (result.success) {
        await loadParticipants();
        onParticipantChange?.();
      } else {
        setError(result.error || 'Error al cambiar rol');
      }
    } catch (error) {
      console.error('Error changing role:', error);
      setError('Error al cambiar rol');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'moderator':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'moderator':
        return 'Moderador';
      default:
        return 'Miembro';
    }
  };

  const canManageParticipants = () => {
    const userParticipant = participants.find(p => p.user_id === user.id);
    return userParticipant?.role === 'admin' || userParticipant?.role === 'moderator';
  };

  const isAdmin = () => {
    const userParticipant = participants.find(p => p.user_id === user.id);
    return userParticipant?.role === 'admin';
  };

  const filteredAvailableUsers = availableUsers.filter(user =>
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
                Participantes del Grupo
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {participants.length} participante{participants.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Agregar participante */}
          {canManageParticipants() && (
            <div className="mb-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors duration-200"
              >
                <UserPlus className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  Agregar Participante
                </span>
              </button>
            </div>
          )}

          {/* Lista de participantes */}
          <div className="space-y-3">
            {participants.map((participant) => (
              <div
                key={participant.user_id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-semibold">
                    {participant.user?.display_name?.charAt(0)?.toUpperCase() || 
                     participant.user?.email?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {participant.user?.display_name || participant.user?.email}
                      </p>
                      {getRoleIcon(participant.role)}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getRoleLabel(participant.role)}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center space-x-2">
                  {canManageParticipants() && participant.user_id !== user.id && (
                    <>
                      {isAdmin() && (
                        <select
                          value={participant.role}
                          onChange={(e) => handleRoleChange(participant.user_id, e.target.value)}
                          className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="member">Miembro</option>
                          <option value="moderator">Moderador</option>
                          <option value="admin">Administrador</option>
                        </select>
                      )}
                      <button
                        onClick={() => handleRemoveParticipant(participant.user_id)}
                        disabled={loading}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors duration-200"
                        title="Remover participante"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Modal para agregar participantes */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Agregar Participante
              </h3>
              
              {/* Búsqueda */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Buscar usuarios..."
                />
              </div>

              {/* Lista de usuarios disponibles */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredAvailableUsers.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                    No hay usuarios disponibles
                  </p>
                ) : (
                  filteredAvailableUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleAddParticipant(user.id)}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors duration-200"
                    >
                      <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
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
                      <UserPlus className="h-4 w-4 text-emerald-500" />
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAddModal(false)}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupParticipants;
