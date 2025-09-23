import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const ConfirmDelete = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar eliminación",
  message = "¿Estás seguro de que quieres eliminar este elemento?",
  itemName = "",
  isLoading = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2 text-red-600" />
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-2">{message}</p>
            {itemName && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-gray-800">{itemName}</p>
              </div>
            )}
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium text-sm">Esta acción no se puede deshacer</p>
                <p className="text-red-600 text-sm mt-1">
                  El elemento será eliminado permanentemente de tu cuenta.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDelete;
