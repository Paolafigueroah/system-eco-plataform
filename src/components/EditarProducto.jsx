import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  X, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Image as ImageIcon,
  Tag,
  FileText,
  Package,
  DollarSign,
  Edit
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabaseProductService } from '../services/supabaseProductService';

const EditarProducto = ({ product, onProductUpdated, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    estado: 'excelente',
    tipoTransaccion: 'venta',
    precio: '',
    ubicacion: ''
  });
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Cargar datos del producto al montar el componente
  useEffect(() => {
    if (product) {
      setFormData({
        titulo: product.title || '',
        descripcion: product.description || '',
        categoria: product.category || '',
        estado: product.condition_product || 'excelente',
        tipoTransaccion: product.transaction_type || 'venta',
        precio: product.price ? product.price.toString() : '',
        ubicacion: product.location || ''
      });
      
      // Cargar imágenes existentes si las hay
      if (product.images) {
        const imageNames = Array.isArray(product.images) 
          ? product.images.filter(name => name.trim())
          : product.images.split(',').filter(name => name.trim());
        setImages(imageNames);
      }
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setErrors(prev => ({
        ...prev,
        images: 'Algunos archivos no son válidos. Solo se permiten imágenes de hasta 5MB.'
      }));
    }

    const newImages = validFiles.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImages].slice(0, 5));
    setImageFiles(prev => [...prev, ...validFiles].slice(0, 5));
    
    if (errors.images) {
      setErrors(prev => ({
        ...prev,
        images: ''
      }));
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'La categoría es requerida';
    }

    if (formData.tipoTransaccion === 'venta' && !formData.precio) {
      newErrors.precio = 'El precio es requerido para productos en venta';
    }

    if (formData.precio && (isNaN(parseFloat(formData.precio)) || parseFloat(formData.precio) < 0)) {
      newErrors.precio = 'El precio debe ser un número válido';
    }

    if (images.length === 0) {
      newErrors.images = 'Al menos una imagen es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar que el usuario esté autenticado
    if (!user || !user.id) {
      setErrors({ submit: 'Debes estar autenticado para editar productos' });
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Usar servicio de Supabase
      const service = supabaseProductService;

      // Datos para Supabase
      const productData = {
        title: formData.titulo,
        description: formData.descripcion,
        category: formData.categoria,
        condition_product: formData.estado,
        transaction_type: formData.tipoTransaccion,
        price: formData.precio ? parseFloat(formData.precio) : 0,
        location: formData.ubicacion,
        images: imageFiles.length > 0 
          ? imageFiles.map(file => file.name) 
          : (Array.isArray(product.images) ? product.images : (product.images || '').split(',').filter(Boolean))
      };

      const result = await service.updateProduct(product.id, productData);

      if (result.success) {
        setSuccess(true);
        
        // Llamar callback de éxito
        if (onProductUpdated) {
          onProductUpdated(result.data || result.product);
        }

        // Cerrar modal después de 2 segundos
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setErrors({ submit: result.error || 'Error al actualizar el producto' });
      }
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      setErrors({ submit: 'Error de conexión. Inténtalo de nuevo.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-8 text-center border border-gray-200 dark:border-gray-700">
          <CheckCircle className="w-16 h-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">¡Producto Actualizado!</h3>
          <p className="text-gray-600 dark:text-gray-400">El producto ha sido actualizado exitosamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <Edit className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
            Editar Producto
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" />
              <span className="text-red-700 dark:text-red-300">{errors.submit}</span>
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Título del producto *
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.titulo ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Ej: Refrigerador LG en excelente estado"
            />
            {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Descripción *
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.descripcion ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Describe tu producto en detalle..."
            />
            {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
          </div>

          {/* Categoría y Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Categoría *
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.categoria ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                style={{ colorScheme: 'light dark' }}
              >
                <option value="">Selecciona una categoría</option>
                <option value="Electrónica">Electrónica</option>
                <option value="Hogar">Hogar</option>
                <option value="Ropa">Ropa</option>
                <option value="Deportes">Deportes</option>
                <option value="Libros">Libros</option>
                <option value="Juguetes">Juguetes</option>
                <option value="Otros">Otros</option>
              </select>
              {errors.categoria && <p className="text-red-500 text-sm mt-1">{errors.categoria}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Package className="w-4 h-4 inline mr-1" />
                Estado del producto
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                style={{ colorScheme: 'light dark' }}
              >
                <option value="excelente">Excelente</option>
                <option value="muy_bueno">Muy bueno</option>
                <option value="bueno">Bueno</option>
                <option value="aceptable">Aceptable</option>
                <option value="necesita_reparacion">Necesita reparación</option>
              </select>
            </div>
          </div>

          {/* Tipo de transacción y Precio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de transacción
              </label>
              <select
                name="tipoTransaccion"
                value={formData.tipoTransaccion}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                style={{ colorScheme: 'light dark' }}
              >
                <option value="venta">Venta</option>
                <option value="intercambio">Intercambio</option>
                <option value="donacion">Donación</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Precio {formData.tipoTransaccion === 'venta' && '*'}
              </label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.precio ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0.00"
                disabled={formData.tipoTransaccion === 'donacion'}
              />
              {errors.precio && <p className="text-red-500 text-sm mt-1">{errors.precio}</p>}
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ubicación
            </label>
            <input
              type="text"
              name="ubicacion"
              value={formData.ubicacion}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ej: Guaymas, Sonora"
            />
          </div>

          {/* Imágenes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <ImageIcon className="w-4 h-4 inline mr-1" />
              Imágenes (máximo 5)
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center bg-gray-50 dark:bg-gray-700/50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                <span className="text-gray-600 dark:text-gray-300">Haz clic para subir imágenes o arrastra y suelta</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, GIF hasta 5MB cada una</span>
              </label>
            </div>
            {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
            
            {/* Vista previa de imágenes */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.url || image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Actualizando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Actualizar Producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarProducto;
