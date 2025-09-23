import React from 'react';
import { useAuth } from '../hooks/useAuth';
import UserProfile from '../components/UserProfile';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">Debes iniciar sesión para acceder a tu perfil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserProfile userId={user?.id} onClose={() => window.history.back()} />
    </div>
  );
};

export default Profile;
