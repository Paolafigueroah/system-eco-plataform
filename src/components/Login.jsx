import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, ArrowLeft, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { isValidEmail } from '../utils/validation';

const Login = ({ onSwitchToSignup }) => {
  const { signIn, resetPassword, signInWithGoogle, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginStatus, setLoginStatus] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockUntil, setBlockUntil] = useState(null);
  
  const emailInputRef = useRef(null);
  const forgotPasswordInputRef = useRef(null);
  const modalRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  // Cargar email guardado al montar el componente
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Auto-focus en el campo de email al montar
  useEffect(() => {
    if (emailInputRef.current && !formData.email) {
      emailInputRef.current.focus();
    }
  }, []);

  // Función para cerrar el modal de forgot password
  const closeForgotPasswordModal = useCallback(() => {
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
    setForgotPasswordStatus(null);
  }, []);

  // Manejar cierre del modal con ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showForgotPassword) {
        closeForgotPasswordModal();
      }
    };

    if (showForgotPassword) {
      document.addEventListener('keydown', handleEscape);
      // Focus trap: enfocar el primer elemento cuando se abre el modal
      setTimeout(() => {
        if (forgotPasswordInputRef.current) {
          forgotPasswordInputRef.current.focus();
        }
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showForgotPassword, closeForgotPasswordModal]);

  // Focus trap para el modal
  useEffect(() => {
    if (showForgotPassword && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        firstFocusableRef.current = focusableElements[0];
        lastFocusableRef.current = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e) => {
          if (e.key !== 'Tab') return;

          if (e.shiftKey) {
            if (document.activeElement === firstFocusableRef.current) {
              e.preventDefault();
              lastFocusableRef.current?.focus();
            }
          } else {
            if (document.activeElement === lastFocusableRef.current) {
              e.preventDefault();
              firstFocusableRef.current?.focus();
            }
          }
        };

        modalRef.current.addEventListener('keydown', handleTabKey);
        return () => {
          modalRef.current?.removeEventListener('keydown', handleTabKey);
        };
      }
    }
  }, [showForgotPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validación en tiempo real
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Validación en tiempo real mientras el usuario escribe
    if (name === 'email' && value.trim()) {
      if (!isValidEmail(value)) {
        setErrors(prev => ({
          ...prev,
          email: 'El formato del correo electrónico no es válido'
        }));
      }
    }

    if (name === 'password' && value.trim() && value.length < 6) {
      setErrors(prev => ({
        ...prev,
        password: 'La contraseña debe tener al menos 6 caracteres'
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'El formato del correo electrónico no es válido';
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordStatus({
        type: 'error',
        message: 'Por favor ingresa tu correo electrónico'
      });
      return;
    }

    if (!isValidEmail(forgotPasswordEmail)) {
      setForgotPasswordStatus({
        type: 'error',
        message: 'El formato del correo electrónico no es válido'
      });
      return;
    }

    setIsLoading(true);
    setForgotPasswordStatus(null);

    try {
      const result = await resetPassword(forgotPasswordEmail);
      
      if (result.success) {
        setForgotPasswordStatus({
          type: 'success',
          message: 'Se ha enviado un enlace de restablecimiento a tu correo electrónico'
        });
        setForgotPasswordEmail('');
      } else {
        setForgotPasswordStatus({
          type: 'error',
          message: result.error || 'Error al enviar el correo de restablecimiento'
        });
      }
    } catch (error) {
      setForgotPasswordStatus({
        type: 'error',
        message: 'Error interno del servidor'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener mensaje de error más específico
  const getErrorMessage = (error) => {
    if (!error) return 'Error al iniciar sesión';
    
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('invalid login credentials') || errorLower.includes('invalid credentials')) {
      return 'Correo electrónico o contraseña incorrectos';
    }
    if (errorLower.includes('email not confirmed')) {
      return 'Por favor verifica tu correo electrónico antes de iniciar sesión';
    }
    if (errorLower.includes('too many requests')) {
      return 'Demasiados intentos. Por favor espera unos minutos antes de intentar nuevamente';
    }
    if (errorLower.includes('network') || errorLower.includes('fetch')) {
      return 'Error de conexión. Verifica tu conexión a internet';
    }
    if (errorLower.includes('user not found')) {
      return 'No existe una cuenta con este correo electrónico';
    }
    
    return error || 'Error al iniciar sesión. Inténtalo de nuevo';
  };

  // Verificar si el usuario está bloqueado
  useEffect(() => {
    if (blockUntil) {
      const now = Date.now();
      if (now >= blockUntil) {
        setIsBlocked(false);
        setBlockUntil(null);
        setSubmitAttempts(0);
      } else {
        const remaining = Math.ceil((blockUntil - now) / 1000);
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        setLoginStatus({
          type: 'error',
          message: `Demasiados intentos. Por favor espera ${minutes}:${seconds.toString().padStart(2, '0')} antes de intentar de nuevo.`
        });
      }
    }
  }, [blockUntil]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Rate limiting: verificar bloqueo
    if (isBlocked) {
      return;
    }
    
    // Rate limiting: verificar tiempo entre intentos
    const now = Date.now();
    if (now - lastSubmitTime < 2000) {
      setLoginStatus({
        type: 'error',
        message: 'Por favor espera un momento antes de intentar de nuevo.'
      });
      return;
    }
    
    // Rate limiting: verificar número de intentos
    if (submitAttempts >= 5) {
      const blockTime = 5 * 60 * 1000; // 5 minutos
      setBlockUntil(now + blockTime);
      setIsBlocked(true);
      setLoginStatus({
        type: 'error',
        message: 'Demasiados intentos fallidos. Por favor espera 5 minutos antes de intentar de nuevo.'
      });
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoginStatus(null);
    setLastSubmitTime(now);

    try {
      const result = await signIn(formData.email, formData.password);
      
      if (result && result.success) {
        // Guardar email si "Recordarme" está activado
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        setLoginStatus({
          type: 'success',
          message: '¡Inicio de sesión exitoso!'
        });
        // La navegación se maneja automáticamente por el hook useAuth
        // No necesitamos setIsLoading(false) aquí porque el loading se maneja en useAuth
      } else {
        setLoginStatus({
          type: 'error',
          message: getErrorMessage(result?.error)
        });
        setIsLoading(false); // Solo ocultar loading en caso de error
      }
    } catch (error) {
      console.error('Error en login:', error);
      setLoginStatus({
        type: 'error',
        message: 'Error de conexión. Inténtalo de nuevo.'
      });
      setIsLoading(false); // Solo ocultar loading en caso de error
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-in-up">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl animate-float">
            <Lock className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold gradient-text mb-2">
            Iniciar Sesión
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Accede a tu cuenta para continuar
          </p>
        </div>

        {/* Login Form */}
        <div className="card shadow-2xl border-0">
          <form onSubmit={handleSubmit} className="space-y-6 p-8">
            {/* Status Message */}
            {loginStatus && (
              <div className={`p-4 rounded-xl flex items-center space-x-3 ${
                loginStatus.type === 'success' 
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                {loginStatus.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <span className={`font-medium ${
                  loginStatus.type === 'success' 
                    ? 'text-emerald-800 dark:text-emerald-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {loginStatus.message}
                </span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  ref={emailInputRef}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field pl-12 ${errors.email ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-800' : 'border-gray-200 dark:border-gray-600 focus:ring-emerald-200 dark:focus:ring-emerald-800'}`}
                  placeholder="tu@email.com"
                  aria-label="Correo electrónico"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center" role="alert">
                  <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pl-12 pr-12 ${errors.password ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-800' : 'border-gray-200 dark:border-gray-600 focus:ring-emerald-200 dark:focus:ring-emerald-800'}`}
                  placeholder="••••••••"
                  aria-label="Contraseña"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center" role="alert">
                  <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  aria-label="Recordar mi correo electrónico"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  Recordarme
                </label>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors font-medium"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || authLoading}
              className="btn-primary w-full flex items-center justify-center space-x-3 py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(isLoading || authLoading) ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <Lock className="h-6 w-6" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">O continúa con</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={isLoading || authLoading}
                className="btn-outline flex items-center justify-center space-x-3 py-3 px-6 w-full max-w-xs hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Iniciar sesión con Google"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium">Continuar con Google</span>
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-base text-gray-600 dark:text-gray-400">
                ¿No tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={onSwitchToSignup}
                  className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors underline decoration-2 underline-offset-2"
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-500 animate-fade-in-up">
          <p>Al continuar, aceptas nuestros términos de servicio y política de privacidad</p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Cerrar modal al hacer clic fuera
            if (e.target === e.currentTarget) {
              closeForgotPasswordModal();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-password-title"
        >
          <div 
            ref={modalRef}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="forgot-password-title" className="text-xl font-bold text-gray-900 dark:text-white">
                Restablecer Contraseña
              </h2>
              <button
                onClick={closeForgotPasswordModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Cerrar modal de restablecer contraseña"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            <form onSubmit={handleForgotPassword}>
              <div className="mb-4">
                <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    ref={forgotPasswordInputRef}
                    id="forgot-email"
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="tu@email.com"
                    required
                    autoComplete="email"
                    aria-label="Correo electrónico para restablecer contraseña"
                  />
                </div>
              </div>

              {forgotPasswordStatus && (
                <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
                  forgotPasswordStatus.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                  {forgotPasswordStatus.type === 'success' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <span className="text-sm">{forgotPasswordStatus.message}</span>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closeForgotPasswordModal}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Enviando...' : 'Enviar Enlace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
