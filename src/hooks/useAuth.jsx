import { useState, useEffect, createContext, useContext } from 'react';
import { supabaseAuthService } from '../services/supabaseAuthService';
import { supabase } from '../supabaseConfig';

const AuthContext = createContext();

/**
 * Hook para acceder al contexto de autenticación
 * 
 * @returns {Object} Objeto con el estado y funciones de autenticación
 * @returns {Object|null} returns.user - Usuario actual autenticado
 * @returns {boolean} returns.loading - Estado de carga
 * @returns {boolean} returns.isAuthenticated - Si el usuario está autenticado
 * @returns {Function} returns.signIn - Función para iniciar sesión
 * @returns {Function} returns.signUp - Función para registrarse
 * @returns {Function} returns.signOut - Función para cerrar sesión
 * @returns {Function} returns.resetPassword - Función para resetear contraseña
 * 
 * @example
 * const { user, signIn, isAuthenticated } = useAuth();
 */
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

/**
 * Proveedor de contexto de autenticación
 * 
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 * @returns {JSX.Element} Proveedor de autenticación
 * 
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const mapSessionUser = (sessionUser) => ({
    ...sessionUser,
    display_name: sessionUser?.user_metadata?.display_name || sessionUser?.email || 'Usuario',
    displayName: sessionUser?.user_metadata?.display_name || sessionUser?.email || 'Usuario'
  });

  const enrichUserProfile = async (sessionUser) => {
    const enrichedUser = await supabaseAuthService.getCurrentUser();
    if (enrichedUser.success && enrichedUser.data) {
      setUser({
        ...sessionUser,
        ...enrichedUser.data
      });
    }
  };

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const baseUser = mapSessionUser(session.user);
          setUser(baseUser);
          enrichUserProfile(session.user).catch((error) => {
            console.warn('No se pudo enriquecer perfil en SIGNED_IN:', error);
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'INITIAL_SESSION') {
          if (session?.user) {
            const baseUser = mapSessionUser(session.user);
            setUser(baseUser);
            enrichUserProfile(session.user).catch((error) => {
              console.warn('No se pudo enriquecer perfil en INITIAL_SESSION:', error);
            });
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
      const result = await supabaseAuthService.signIn(email, password);
      
      if (result.success) {
        // El usuario se establecerá automáticamente por el listener de auth state
        return { success: true, user: result.data?.user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error en signIn:', error);
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

  const signInWithGoogle = async () => {
    try {
      const result = await supabaseAuthService.signInWithGoogle();
      return result;
    } catch (error) {
      console.error('Error en signInWithGoogle:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  };

  const signInWithTwitter = async () => {
    try {
      const result = await supabaseAuthService.signInWithTwitter();
      return result;
    } catch (error) {
      console.error('Error en signInWithTwitter:', error);
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
    resetPassword,
    signInWithGoogle,
    signInWithTwitter
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
