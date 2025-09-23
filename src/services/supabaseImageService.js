import { supabase, supabaseUtils } from '../supabaseConfig.js';

// Servicio para manejo de imágenes con Supabase Storage
export const supabaseImageService = {
  // Subir imagen a Supabase Storage
  uploadImage: async (file, userId, productId = null) => {
    try {
      console.log('📸 Supabase: Subiendo imagen...', { fileName: file.name, userId, productId });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = productId ? `products/${userId}/${productId}/${fileName}` : `products/${userId}/${fileName}`;

      // Subir archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Obtener URL pública
      const { data: publicData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      return supabaseUtils.handleSuccess({
        path: filePath,
        url: publicData.publicUrl,
        fileName: fileName
      }, 'Subir imagen');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Subir imagen');
    }
  },

  // Subir múltiples imágenes
  uploadMultipleImages: async (files, userId, productId = null) => {
    try {
      console.log('📸 Supabase: Subiendo múltiples imágenes...', files.length);
      
      const uploadPromises = Array.from(files).map(file => 
        supabaseImageService.uploadImage(file, userId, productId)
      );

      const results = await Promise.all(uploadPromises);
      
      // Verificar si todas las subidas fueron exitosas
      const successful = results.filter(result => result.success);
      const failed = results.filter(result => !result.success);

      if (failed.length > 0) {
        console.warn('⚠️ Algunas imágenes no se pudieron subir:', failed);
      }

      return supabaseUtils.handleSuccess({
        uploaded: successful.map(r => r.data),
        failed: failed.length,
        total: files.length
      }, 'Subir múltiples imágenes');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Subir múltiples imágenes');
    }
  },

  // Eliminar imagen
  deleteImage: async (filePath) => {
    try {
      console.log('📸 Supabase: Eliminando imagen...', filePath);
      
      const { error } = await supabase.storage
        .from('products')
        .remove([filePath]);

      if (error) throw error;

      return supabaseUtils.handleSuccess(null, 'Eliminar imagen');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Eliminar imagen');
    }
  },

  // Obtener URL pública de una imagen
  getPublicUrl: (filePath) => {
    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  },

  // Validar archivo de imagen
  validateImageFile: (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Tipo de archivo no permitido. Solo se permiten JPG, PNG y WEBP.'
      };
    }
    
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'El archivo es muy grande. Máximo 5MB permitido.'
      };
    }
    
    return { isValid: true };
  }
};

export default supabaseImageService;
