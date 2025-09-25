import { supabase, supabaseUtils } from '../supabaseConfig.js';

// Servicio de productos con Supabase
export const supabaseProductService = {
  // Obtener todos los productos
  getAllProducts: async (filters = {}) => {
    try {
      console.log('📦 Supabase: Obteniendo productos...', filters);
      
      let query = supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.transaction_type) {
        query = query.eq('transaction_type', filters.transaction_type);
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Obtener productos');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener productos');
    }
  },

  // Obtener producto por ID
  getProductById: async (productId) => {
    try {
      console.log('📦 Supabase: Obteniendo producto...', productId);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      console.log('📦 Supabase: Respuesta de la consulta:', { data, error });

      if (error) {
        console.error('📦 Supabase: Error en consulta:', error);
        throw error;
      }

      console.log('📦 Supabase: Producto encontrado:', data);

      // Incrementar vistas
      await supabaseProductService.incrementViews(productId);

      const result = supabaseUtils.handleSuccess(data, 'Obtener producto por ID');
      console.log('📦 Supabase: Resultado final:', result);
      return result;
    } catch (error) {
      console.error('📦 Supabase: Error en getProductById:', error);
      return supabaseUtils.handleError(error, 'Obtener producto por ID');
    }
  },

  // Obtener productos por usuario
  getProductsByUserId: async (userId) => {
    try {
      console.log('📦 Supabase: Obteniendo productos del usuario...', userId);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Obtener productos por usuario');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener productos por usuario');
    }
  },

  // Crear nuevo producto
  createProduct: async (productData) => {
    try {
      console.log('📦 Supabase: Creando producto...', productData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const product = {
        ...productData,
        user_id: user.id,
        user_email: user.email,
        user_name: user.user_metadata?.display_name || user.email,
        status: 'active',
        views: 0,
        favorites: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Crear producto');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Crear producto');
    }
  },

  // Actualizar producto
  updateProduct: async (productId, updateData) => {
    try {
      console.log('📦 Supabase: Actualizando producto...', productId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('products')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .eq('user_id', user.id) // Solo el propietario puede actualizar
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Actualizar producto');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Actualizar producto');
    }
  },

  // Eliminar producto
  deleteProduct: async (productId) => {
    try {
      console.log('📦 Supabase: Eliminando producto...', productId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('user_id', user.id) // Solo el propietario puede eliminar
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Eliminar producto');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Eliminar producto');
    }
  },

  // Obtener productos del usuario actual
  getUserProducts: async (userId) => {
    try {
      console.log('📦 Supabase: Obteniendo productos del usuario...', userId);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Obtener productos del usuario');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener productos del usuario');
    }
  },

  // Incrementar vistas de un producto
  incrementViews: async (productId) => {
    try {
      const { data, error } = await supabase.rpc('increment_views', {
        product_id: productId
      });

      if (error) {
        // Si la función no existe, hacer el incremento manual
        const { error: updateError } = await supabase
          .from('products')
          .update({ views: supabase.raw('views + 1') })
          .eq('id', productId);

        if (updateError) throw updateError;
      }

      return { success: true, error: null };
    } catch (error) {
      console.warn('⚠️ Error incrementando vistas:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener productos por categoría
  getProductsByCategory: async (category) => {
    try {
      console.log('📦 Supabase: Obteniendo productos por categoría...', category);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Obtener productos por categoría');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener productos por categoría');
    }
  },

  // Buscar productos
  searchProducts: async (searchTerm) => {
    try {
      console.log('📦 Supabase: Buscando productos...', searchTerm);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Buscar productos');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Buscar productos');
    }
  }
};

export default supabaseProductService;
