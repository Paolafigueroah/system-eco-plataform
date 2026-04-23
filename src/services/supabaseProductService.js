import { supabase, supabaseUtils } from '../supabaseConfig.js';
import {
  PRODUCTS_OWNER_COLUMN,
  normalizeProductOwnerFields,
  normalizeProductOwnerFieldsList
} from '../config/productSchema.js';

/**
 * Servicio de productos con Supabase
 * Proporciona funciones para CRUD de productos
 * 
 * @namespace supabaseProductService
 */
export const supabaseProductService = {
  /**
   * Obtener todos los productos activos con filtros opcionales
   * 
   * @param {Object} filters - Filtros opcionales
   * @param {string} [filters.category] - Filtrar por categoría
   * @param {string} [filters.transaction_type] - Filtrar por tipo de transacción (venta/intercambio/donación)
   * @param {string} [filters.location] - Filtrar por ubicación
   * @param {string} [filters.search] - Buscar en título y descripción
   * @returns {Promise<Object>} Resultado con success, data (array de productos) y error
   * 
   * @example
   * const result = await supabaseProductService.getAllProducts({ category: 'electronics' });
   */
  // Función helper para agregar conteo de favoritos a productos
  addFavoritesCountToProducts: async (products) => {
    if (!products || products.length === 0) return products;
    
    try {
      // Obtener conteos de favoritos para todos los productos de una vez
      const productIds = products.map(p => p.id);
      
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('product_id')
        .in('product_id', productIds);

      if (favoritesError) {
        console.warn('⚠️ Error obteniendo conteos de favoritos:', favoritesError);
        return products.map((p) => normalizeProductOwnerFields({ ...p, favorites: 0 }));
      }

      // Contar favoritos por producto
      const favoritesCount = {};
      if (favoritesData) {
        favoritesData.forEach(fav => {
          favoritesCount[fav.product_id] = (favoritesCount[fav.product_id] || 0) + 1;
        });
      }

      // Agregar conteo a cada producto
      return products.map((product) =>
        normalizeProductOwnerFields({
          ...product,
          favorites: favoritesCount[product.id] || 0
        })
      );
    } catch (error) {
      console.warn('⚠️ Error agregando conteos de favoritos:', error);
      return products.map((p) => normalizeProductOwnerFields({ ...p, favorites: 0 }));
    }
  },

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

      // Agregar conteo de favoritos
      const normalized = normalizeProductOwnerFieldsList(data || []);
      const productsWithFavorites =
        await supabaseProductService.addFavoritesCountToProducts(normalized);

      return supabaseUtils.handleSuccess(productsWithFavorites, 'Obtener productos');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener productos');
    }
  },

  /**
   * Obtener un producto por su ID
   * 
   * @param {string} productId - ID del producto (UUID)
   * @returns {Promise<Object>} Resultado con success, data (producto) y error
   * 
   * @example
   * const result = await supabaseProductService.getProductById('123e4567-e89b-12d3-a456-426614174000');
   */
  getProductById: async (productId) => {
    try {
      // Validación de parámetros
      if (!productId || typeof productId !== 'string') {
        return supabaseUtils.handleError(
          new Error('productId es requerido y debe ser un string'),
          'Obtener producto por ID'
        );
      }
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(productId)) {
        return supabaseUtils.handleError(
          new Error('productId debe ser un UUID válido'),
          'Obtener producto por ID'
        );
      }
      
      console.log('📦 Supabase: Obteniendo producto...', productId);
      
      // Obtener producto con conteo de favoritos
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError) {
        console.error('📦 Supabase: Error en consulta:', productError);
        throw productError;
      }

      // Obtener conteo de favoritos
      const { count: favoritesCount, error: favoritesError } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId);

      if (favoritesError) {
        console.warn('📦 Supabase: Error obteniendo conteo de favoritos:', favoritesError);
      }

      // Agregar el conteo de favoritos al producto
      const data = normalizeProductOwnerFields({
        ...productData,
        favorites: favoritesCount || 0
      });
      
      const error = null;

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
      // Validación de parámetros
      if (!userId || typeof userId !== 'string') {
        return supabaseUtils.handleError(
          new Error('userId es requerido y debe ser un string'),
          'Obtener productos por usuario'
        );
      }
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        return supabaseUtils.handleError(
          new Error('userId debe ser un UUID válido'),
          'Obtener productos por usuario'
        );
      }
      
      console.log('📦 Supabase: Obteniendo productos del usuario...', userId);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq(PRODUCTS_OWNER_COLUMN, userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return supabaseUtils.handleSuccess(
        normalizeProductOwnerFieldsList(data || []),
        'Obtener productos por usuario'
      );
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener productos por usuario');
    }
  },

  // Crear nuevo producto
  createProduct: async (productData) => {
    try {
      // Validación de parámetros
      if (!productData || typeof productData !== 'object') {
        return supabaseUtils.handleError(
          new Error('productData es requerido y debe ser un objeto'),
          'Crear producto'
        );
      }
      
      // Validar campos requeridos
      const title = productData.title || productData.titulo;
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return supabaseUtils.handleError(
          new Error('El título es requerido y no puede estar vacío'),
          'Crear producto'
        );
      }
      
      if (title.length > 200) {
        return supabaseUtils.handleError(
          new Error('El título no puede exceder 200 caracteres'),
          'Crear producto'
        );
      }
      
      const description = productData.description || productData.descripcion;
      if (!description || typeof description !== 'string' || description.trim().length === 0) {
        return supabaseUtils.handleError(
          new Error('La descripción es requerida y no puede estar vacía'),
          'Crear producto'
        );
      }
      
      if (description.length > 2000) {
        return supabaseUtils.handleError(
          new Error('La descripción no puede exceder 2000 caracteres'),
          'Crear producto'
        );
      }
      
      // Validar precio si está presente
      const price = productData.price || productData.precio || 0;
      if (price !== undefined && price !== null) {
        const priceNum = Number(price);
        if (isNaN(priceNum) || priceNum < 0) {
          return supabaseUtils.handleError(
            new Error('El precio debe ser un número válido mayor o igual a 0'),
            'Crear producto'
          );
        }
      }
      
      console.log('📦 Supabase: Creando producto...', productData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const product = {
        title: productData.title || productData.titulo,
        description: productData.description || productData.descripcion,
        category: productData.category || productData.categoria,
        condition_product: productData.condition_product || productData.estado,
        transaction_type: productData.transaction_type || productData.tipoTransaccion,
        price: productData.price || productData.precio || 0,
        location: productData.location || productData.ubicacion,
        images: productData.images || [],
        status: 'active',
        views: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        [PRODUCTS_OWNER_COLUMN]: user.id
      };

      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(normalizeProductOwnerFields(data), 'Crear producto');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Crear producto');
    }
  },

  // Actualizar estado del producto (disponible/vendido/no disponible)
  updateProductStatus: async (productId, status) => {
    try {
      // Validación de parámetros
      if (!productId || typeof productId !== 'string') {
        return supabaseUtils.handleError(
          new Error('productId es requerido y debe ser un string'),
          'Actualizar estado del producto'
        );
      }

      if (!['active', 'sold', 'inactive'].includes(status)) {
        return supabaseUtils.handleError(
          new Error('status debe ser: active, sold o inactive'),
          'Actualizar estado del producto'
        );
      }

      console.log('📦 Supabase: Actualizando estado del producto...', { productId, status });

      const { data, error } = await supabase
        .from('products')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(
        normalizeProductOwnerFields(data),
        'Actualizar estado del producto'
      );
    } catch (error) {
      return supabaseUtils.handleError(error, 'Actualizar estado del producto');
    }
  },

  // Actualizar producto
  updateProduct: async (productId, updateData) => {
    try {
      // Validación de parámetros
      if (!productId || typeof productId !== 'string') {
        return supabaseUtils.handleError(
          new Error('productId es requerido y debe ser un string'),
          'Actualizar producto'
        );
      }
      
      if (!updateData || typeof updateData !== 'object') {
        return supabaseUtils.handleError(
          new Error('updateData es requerido y debe ser un objeto'),
          'Actualizar producto'
        );
      }
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(productId)) {
        return supabaseUtils.handleError(
          new Error('productId debe ser un UUID válido'),
          'Actualizar producto'
        );
      }
      
      // Validar campos si están presentes
      if (updateData.title !== undefined) {
        if (typeof updateData.title !== 'string' || updateData.title.trim().length === 0) {
          return supabaseUtils.handleError(
            new Error('El título no puede estar vacío'),
            'Actualizar producto'
          );
        }
        if (updateData.title.length > 200) {
          return supabaseUtils.handleError(
            new Error('El título no puede exceder 200 caracteres'),
            'Actualizar producto'
          );
        }
      }
      
      if (updateData.description !== undefined) {
        if (typeof updateData.description !== 'string' || updateData.description.trim().length === 0) {
          return supabaseUtils.handleError(
            new Error('La descripción no puede estar vacía'),
            'Actualizar producto'
          );
        }
        if (updateData.description.length > 2000) {
          return supabaseUtils.handleError(
            new Error('La descripción no puede exceder 2000 caracteres'),
            'Actualizar producto'
          );
        }
      }
      
      if (updateData.price !== undefined && updateData.price !== null) {
        const price = Number(updateData.price);
        if (isNaN(price) || price < 0) {
          return supabaseUtils.handleError(
            new Error('El precio debe ser un número válido mayor o igual a 0'),
            'Actualizar producto'
          );
        }
      }
      
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
        .eq(PRODUCTS_OWNER_COLUMN, user.id)
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(normalizeProductOwnerFields(data), 'Actualizar producto');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Actualizar producto');
    }
  },

  // Eliminar producto
  deleteProduct: async (productId) => {
    try {
      // Validación de parámetros
      if (!productId || typeof productId !== 'string') {
        return supabaseUtils.handleError(
          new Error('productId es requerido y debe ser un string'),
          'Eliminar producto'
        );
      }
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(productId)) {
        return supabaseUtils.handleError(
          new Error('productId debe ser un UUID válido'),
          'Eliminar producto'
        );
      }
      
      console.log('📦 Supabase: Eliminando producto...', productId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq(PRODUCTS_OWNER_COLUMN, user.id)
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(normalizeProductOwnerFields(data), 'Eliminar producto');
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
        .eq(PRODUCTS_OWNER_COLUMN, userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return supabaseUtils.handleSuccess(
        normalizeProductOwnerFieldsList(data || []),
        'Obtener productos del usuario'
      );
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

      // Agregar conteo de favoritos
      const normalized = normalizeProductOwnerFieldsList(data || []);
      const productsWithFavorites =
        await supabaseProductService.addFavoritesCountToProducts(normalized);

      return supabaseUtils.handleSuccess(productsWithFavorites, 'Obtener productos por categoría');
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

      // Agregar conteo de favoritos
      const normalized = normalizeProductOwnerFieldsList(data || []);
      const productsWithFavorites =
        await supabaseProductService.addFavoritesCountToProducts(normalized);

      return supabaseUtils.handleSuccess(productsWithFavorites, 'Buscar productos');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Buscar productos');
    }
  }
};

export default supabaseProductService;
