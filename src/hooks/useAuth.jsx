import { useState, useEffect, createContext, useContext } from 'react';
import { supabaseAuthService } from '../services/supabaseAuthService';
import { supabase } from '../supabaseConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('useAuth debe ser usado dentro de un AuthProvider');
    // Retornar valores por defecto en lugar de lanzar error
    return {
      user: null,
      loading: false,
      isAuthenticated: false,
      signIn: () => Promise.resolve({ success: false, error: 'AuthProvider no disponible' }),
      signUp: () => Promise.resolve({ success: false, error: 'AuthProvider no disponible' }),
      signOut: () => {},
      resetPassword: () => Promise.resolve({ success: false, error: 'AuthProvider no disponible' })
    };
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Usar directamente los datos de la sesión para evitar llamadas adicionales
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'INITIAL_SESSION') {
          // Solo en la carga inicial
          if (session?.user) {
            setUser(session.user);
          } else {
            setUser(null);
          }
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      setLoading(true); // Mostrar loading durante el proceso
      const result = await supabaseAuthService.signIn(email, password);
      
      if (result.success) {
        // El usuario se establecerá automáticamente por el listener de auth state
        return { success: true, user: result.data?.user };
      } else {
        setLoading(false); // Ocultar loading en caso de error
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error en signIn:', error);
      setLoading(false); // Ocultar loading en caso de error
      return { success: false, error: 'Error interno del servidor' };
    }
  };

  const signUp = async (email, password, displayName) => {
    try {
      const result = await supabaseAuthService.signUp(email, password, displayName);
      if (result.success) {
        // El usuario se establecerá automáticamente por el listener de auth state
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error en signUp:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  };

  const signOut = async () => {
    try {
      const result = await supabaseAuthService.signOut();
      // El usuario se limpiará automáticamente por el listener de auth state
      return result;
    } catch (error) {
      console.error('Error en signOut:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  };

  const changePassword = async (newPassword) => {
    try {
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }
      
      const result = await supabaseAuthService.changePassword(newPassword);
      return result;
    } catch (error) {
      console.error('Error en changePassword:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  };

  const resetPassword = async (email) => {
    try {
      const result = await supabaseAuthService.resetPassword(email);
      return result;
    } catch (error) {
      console.error('Error en resetPassword:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    changePassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
