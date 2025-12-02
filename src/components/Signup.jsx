import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { isValidEmail, isValidPassword } from '../utils/validation';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

/**
 * Componente de registro de usuario
 * 
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onSwitchToLogin - Función para cambiar a la vista de login
 * @returns {JSX.Element} Formulario de registro
 * 
 * @example
 * <Signup onSwitchToLogin={() => setIsLogin(true)} />
 */
const Signup = ({ onSwitchToLogin }) => {
  const { signUp, signInWithGoogle, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupStatus, setSignupStatus] = useState(null);
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockUntil, setBlockUntil] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Display Name validation
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'El nombre es requerido';
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = 'El nombre debe tener al menos 2 caracteres';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'El formato del correo electrónico no es válido';
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres con 1 mayúscula, 1 minúscula, 1 número y 1 símbolo (@$!%*?&)';
    }

    // Confirm Password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Verificar si el usuario está bloqueado
  useEffect(() => {
    if (blockUntil) {
      const interval = setInterval(() => {
        const now = Date.now();
        if (now >= blockUntil) {
          setIsBlocked(false);
          setBlockUntil(null);
          setSubmitAttempts(0);
          setSignupStatus(null);
          clearInterval(interval);
        } else {
          const remaining = Math.ceil((blockUntil - now) / 1000);
          const minutes = Math.floor(remaining / 60);
          const seconds = remaining % 60;
          setSignupStatus({
            type: 'error',
            message: `Demasiados intentos. Por favor espera ${minutes}:${seconds.toString().padStart(2, '0')} antes de intentar de nuevo.`
          });
        }
      }, 1000);

      return () => clearInterval(interval);
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
      setSignupStatus({
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
      setSignupStatus({
        type: 'error',
        message: 'Demasiados intentos fallidos. Por favor espera 5 minutos antes de intentar de nuevo.'
      });
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSignupStatus(null);
    setLastSubmitTime(now);

    try {
      const result = await signUp(formData.email, formData.password, formData.displayName);
      
      if (result.success) {
        // Verificar si se requiere confirmación de email
        if (result.data?.needsEmailConfirmation) {
          setSignupStatus({
            type: 'success',
            message: '¡Cuenta creada exitosamente! Por favor revisa tu correo electrónico para confirmar tu cuenta.'
          });
        } else {
          setSignupStatus({
            type: 'success',
            message: '¡Cuenta creada exitosamente! Redirigiendo...'
          });
        }
        setSubmitAttempts(0); // Resetear intentos en caso de éxito
        // La navegación se maneja automáticamente por el hook useAuth
      } else {
        setSubmitAttempts(prev => prev + 1); // Incrementar intentos fallidos
        setSignupStatus({
          type: 'error',
          message: result.error || 'Error al crear la cuenta'
        });
      }
    } catch (error) {
      setSubmitAttempts(prev => prev + 1); // Incrementar intentos fallidos
      setSignupStatus({
        type: 'error',
        message: 'Error de conexión. Inténtalo de nuevo.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-in-up">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl animate-float">
            <User className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold gradient-text mb-2">
            Crear Cuenta
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Únete a nuestra comunidad
          </p>
        </div>

        {/* Signup Form */}
        <div className="card shadow-2xl border-0">
          <form onSubmit={handleSubmit} className="space-y-6 p-8">
            {/* Status Message */}
            {signupStatus && (
              <div className={`p-4 rounded-xl flex items-center space-x-3 ${
                signupStatus.type === 'success' 
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                {signupStatus.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <span className={`font-medium ${
                  signupStatus.type === 'success' 
                    ? 'text-emerald-800 dark:text-emerald-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {signupStatus.message}
                </span>
              </div>
            )}

            {/* Display Name Field */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nombre Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.displayName}
                  onChange={handleChange}
                  className={`input-field pl-12 ${errors.displayName ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-800' : 'border-gray-200 dark:border-gray-600 focus:ring-emerald-200 dark:focus:ring-emerald-800'}`}
                  placeholder="Tu nombre completo"
                />
              </div>
              {errors.displayName && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.displayName}
                </p>
              )}
            </div>

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
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field pl-12 ${errors.email ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-800' : 'border-gray-200 dark:border-gray-600 focus:ring-emerald-200 dark:focus:ring-emerald-800'}`}
                  placeholder="tu@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pl-12 pr-12 ${errors.password ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-800' : 'border-gray-200 dark:border-gray-600 focus:ring-emerald-200 dark:focus:ring-emerald-800'}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password}
                </p>
              )}
              <PasswordStrengthIndicator password={formData.password} />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-field pl-12 pr-12 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-800' : 'border-gray-200 dark:border-gray-600 focus:ring-emerald-200 dark:focus:ring-emerald-800'}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 dark:border-gray-600 rounded mt-1 bg-white dark:bg-gray-700"
              />
              <label htmlFor="terms" className="ml-3 block text-sm text-gray-600 dark:text-gray-400">
                Acepto los{' '}
                <button
                  type="button"
                  className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 underline font-medium"
                >
                  términos y condiciones
                </button>
                {' '}y la{' '}
                <button
                  type="button"
                  className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 underline font-medium"
                >
                  política de privacidad
                </button>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-secondary w-full flex items-center justify-center space-x-3 py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creando cuenta...</span>
                </>
              ) : (
                <>
                  <User className="h-6 w-6" />
                  <span>Crear Cuenta</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">O regístrate con</span>
              </div>
            </div>

            {/* Social Signup Buttons */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={isLoading || authLoading}
                className="btn btn-outline flex items-center justify-center space-x-3 py-3 px-6 w-full max-w-xs disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Login Link */}
            <div className="text-center">
              <p className="text-base text-gray-600 dark:text-gray-400">
                ¿Ya tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors underline decoration-2 underline-offset-2"
                >
                  Inicia sesión aquí
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-500 animate-fade-in-up">
          <p>Al crear una cuenta, aceptas nuestros términos de servicio y política de privacidad</p>
        </div>
      </div>
    </div>
  );
};

// Memoizar componente para evitar re-renders innecesarios
export default React.memo(Signup);
