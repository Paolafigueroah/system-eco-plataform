import React, { useState } from 'react';
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
  DollarSign
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabaseProductService } from '../services/supabaseProductService';

const PublicarProducto = ({ onProductPublished, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    estado: 'nuevo',
    tipoTransaccion: 'venta',
    precio: '',
    ubicacion: ''
  });

  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Opciones para los selectores
  const categorias = [
    'Electrónicos',
    'Ropa y Accesorios',
    'Hogar y Jardín',
    'Deportes',
    'Libros y Música',
    'Automóviles',
    'Servicios',
    'Otros'
  ];

  const estados = [
    { value: 'nuevo', label: 'Nuevo' },
    { value: 'como-nuevo', label: 'Como Nuevo' },
    { value: 'excelente', label: 'Excelente' },
    { value: 'bueno', label: 'Bueno' },
    { value: 'aceptable', label: 'Aceptable' }
  ];

  const tiposTransaccion = [
    { value: 'venta', label: 'Venta' },
    { value: 'intercambio', label: 'Intercambio' },
    { value: 'donacion', label: 'Donación' },
    { value: 'alquiler', label: 'Alquiler' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 5) {
      alert('Máximo 5 imágenes permitidas');
      return;
    }

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImages(prev => [...prev, e.target.result]);
          setImageFiles(prev => [...prev, file]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };



  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    } else if (formData.titulo.trim().length < 5) {
      newErrors.titulo = 'El título debe tener al menos 5 caracteres';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    } else if (formData.descripcion.trim().length < 20) {
      newErrors.descripcion = 'La descripción debe tener al menos 20 caracteres';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'Selecciona una categoría';
    }

    if (!formData.precio && formData.tipoTransaccion === 'venta') {
      newErrors.precio = 'El precio es requerido para productos en venta';
    }

    if (formData.precio && isNaN(parseFloat(formData.precio))) {
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
      setErrors({ submit: 'Debes estar autenticado para publicar productos' });
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Crear producto usando Supabase
      const productData = {
        title: formData.titulo,
        description: formData.descripcion,
        category: formData.categoria,
        condition_product: formData.estado,
        transaction_type: formData.tipoTransaccion,
        price: formData.precio ? parseFloat(formData.precio) : 0,
        location: formData.ubicacion,
        user_email: user.email,
        user_name: user.display_name || user.email,
        images: imageFiles.length > 0 ? imageFiles.map(file => file.name) : []
      };

      const result = await supabaseProductService.createProduct(productData);

      if (result.success) {
        setSuccess(true);
        
        // Llamar callback de éxito
        if (onProductPublished) {
          onProductPublished(result.data);
        }

        // Resetear formulario después de 3 segundos
        setTimeout(() => {
          setSuccess(false);
          setFormData({
            titulo: '',
            descripcion: '',
            categoria: '',
            estado: 'nuevo',
            tipoTransaccion: 'venta',
            precio: '',
            ubicacion: ''
          });
          setImages([]);
          setImageFiles([]);
        }, 3000);
      } else {
        setErrors({ submit: 'Error al publicar el producto. Inténtalo de nuevo.' });
      }
    } catch (error) {
      console.error('Error al publicar producto:', error);
      setErrors({ submit: 'Error de conexión. Inténtalo de nuevo.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-12 w-12 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Producto Publicado!
          </h2>
          <p className="text-gray-600 mb-6">
            Tu producto ha sido publicado exitosamente y ya está visible para otros usuarios.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="btn btn-primary w-full"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Publicar Nuevo Producto
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error general */}
          {errors.submit && (
            <div className="alert alert-error">
              <AlertCircle className="h-5 w-5" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Título */}
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-2" />
              Título del Producto *
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className={`input-field ${errors.titulo ? 'border-error focus:ring-error' : ''}`}
              placeholder="Ej: iPhone 13 Pro Max en excelente estado"
            />
            {errors.titulo && (
              <p className="mt-1 text-sm text-error">{errors.titulo}</p>
            )}
          </div>

          {/* Categoría y Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="h-4 w-4 inline mr-2" />
                Categoría *
              </label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className={`input-field ${errors.categoria ? 'border-error focus:ring-error' : ''}`}
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.categoria && (
                <p className="mt-1 text-sm text-error">{errors.categoria}</p>
              )}
            </div>

            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="h-4 w-4 inline mr-2" />
                Estado del Producto
              </label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="input-field"
              >
                {estados.map(est => (
                  <option key={est.value} value={est.value}>{est.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tipo de Transacción y Precio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tipoTransaccion" className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-2" />
                Tipo de Transacción
              </label>
              <select
                id="tipoTransaccion"
                name="tipoTransaccion"
                value={formData.tipoTransaccion}
                onChange={handleChange}
                className="input-field"
              >
                {tiposTransaccion.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-2">
                Precio {formData.tipoTransaccion === 'venta' && '*'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  id="precio"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  className={`input-field pl-8 ${errors.precio ? 'border-error focus:ring-error' : ''}`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              {errors.precio && (
                <p className="mt-1 text-sm text-error">{errors.precio}</p>
              )}
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación
            </label>
            <input
              type="text"
              id="ubicacion"
              name="ubicacion"
              value={formData.ubicacion}
              onChange={handleChange}
              className="input-field"
              placeholder="Ciudad, Estado o País"
            />
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del Producto *
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={4}
              className={`input-field resize-none ${errors.descripcion ? 'border-error focus:ring-error' : ''}`}
              placeholder="Describe detalladamente tu producto, incluye características, especificaciones, historial de uso, etc."
            />
            {errors.descripcion && (
              <p className="mt-1 text-sm text-error">{errors.descripcion}</p>
            )}
          </div>

          {/* Subida de Imágenes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="h-4 w-4 inline mr-2" />
              Imágenes del Producto * (Máximo 5)
            </label>
            
            {/* Área de subida */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Haz clic para subir imágenes o arrastra y suelta aquí
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF hasta 5MB cada una
                </p>
              </label>
            </div>

            {/* Imágenes previsualizadas */}
            {images.length > 0 && (
              <div className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {images.length} de 5 imágenes seleccionadas
                </p>
              </div>
            )}

            {errors.images && (
              <p className="mt-1 text-sm text-error">{errors.images}</p>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Publicando...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Publicar Producto</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicarProducto;
