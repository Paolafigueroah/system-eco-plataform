import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Cargando...', 
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const spinner = (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className={`${sizeClasses[size]} border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto`}></div>
        {text && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{text}</p>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
