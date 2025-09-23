import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContainer from '../components/AuthContainer';
import { useAuth } from '../hooks/useAuth';

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if user is already authenticated
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleAuthSuccess = (user) => {
    console.log('Usuario autenticado:', user);
    // The useAuth hook will automatically update the user state
    // and the useEffect above will redirect to home
  };

  return (
    <div className="min-h-screen">
      <AuthContainer onAuthSuccess={handleAuthSuccess} />
    </div>
  );
};

export default Auth;
