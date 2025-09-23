import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Login from './Login';
import Signup from './Signup';

const AuthContainer = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSwitchToSignup = () => {
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

  const handleLoginSuccess = async (email, password) => {
    const result = await signIn(email, password);
    
    if (result.success) {
      if (onAuthSuccess) {
        onAuthSuccess(result.user);
      }
      navigate('/dashboard');
    }
    return result;
  };

  const handleSignupSuccess = async (email, password, displayName) => {
    const result = await signUp(email, password, displayName);
    if (result.success) {
      if (onAuthSuccess) {
        onAuthSuccess(result.user);
      }
      navigate('/dashboard');
    }
    return result;
  };

  return (
    <div className="min-h-screen">
      {isLogin ? (
        <Login 
          onSwitchToSignup={handleSwitchToSignup}
        />
      ) : (
        <Signup 
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
    </div>
  );
};

export default AuthContainer;
