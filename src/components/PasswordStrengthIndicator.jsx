import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { getPasswordRequirements } from '../utils/validation';

/**
 * Componente que muestra los requisitos de contraseña y su estado
 * 
 * @component
 * @param {string} password - Contraseña a validar
 * @returns {JSX.Element} Indicador de requisitos de contraseña
 */
const PasswordStrengthIndicator = ({ password }) => {
  const requirements = getPasswordRequirements(password || '');
  
  const requirementList = [
    { key: 'length', label: 'Al menos 8 caracteres', met: requirements.length },
    { key: 'lowercase', label: 'Una letra minúscula', met: requirements.lowercase },
    { key: 'uppercase', label: 'Una letra mayúscula', met: requirements.uppercase },
    { key: 'number', label: 'Un número', met: requirements.number },
    { key: 'special', label: 'Un símbolo (@$!%*?&)', met: requirements.special }
  ];

  if (!password) {
    return null;
  }

  return (
    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Requisitos de contraseña:
      </p>
      <ul className="space-y-1.5">
        {requirementList.map((req) => (
          <li
            key={req.key}
            className={`flex items-center space-x-2 text-xs ${
              req.met
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {req.met ? (
              <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
            ) : (
              <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
            )}
            <span>{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrengthIndicator;

