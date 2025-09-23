import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ 
  error, 
  onRetry, 
  onDismiss, 
  title = 'Error',
  showRetry = true,
  showDismiss = true,
  className = ''
}) => {
  if (!error) return null;

  return (
    <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" />
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            {title}
          </h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
            <p>{error}</p>
          </div>
          
          {(showRetry || showDismiss) && (
            <div className="mt-4 flex space-x-3">
              {showRetry && onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center space-x-1 text-sm font-medium text-red-800 dark:text-red-200 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Reintentar</span>
                </button>
              )}
              
              {showDismiss && onDismiss && (
                <button
                  onClick={onDismiss}
                  className="inline-flex items-center space-x-1 text-sm font-medium text-red-800 dark:text-red-200 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                  <span>Dismiss</span>
                </button>
              )}
            </div>
          )}
        </div>
        
        {showDismiss && onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="inline-flex text-red-400 hover:text-red-600 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
