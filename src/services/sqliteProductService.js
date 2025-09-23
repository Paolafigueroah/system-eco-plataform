import { executeQuery, executeQuerySingle, executeQueryRun } from '../sqliteConfig';

// Servicio para gestionar productos usando SQLite
export const sqliteProductService = {
  
  // Crear un nuevo producto
  async createProduct(productData) {
    try {
      // Validar datos requeridos
      if (!productData.userId) {
        return { success: false, error: 'Usuario no autenticado' };
      }
      
      if (!productData.title || !productData.description || !productData.category) {
        return { success: false, error: 'Faltan campos requeridos' };
      }

      const result = await executeQueryRun(
        `INSERT INTO products (
          title, description, category, condition_product, transaction_type, 
          price, location, user_id, user_email, user_name, status, images, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productData.title,
          productData.description,
          productData.category,
          productData.condition,
          productData.transactionType,
          productData.price || 0,
          productData.location || '',
          productData.userId,
          productData.userEmail || '',
          productData.userName || 'Usuario',
          'active',
          productData.images || '',
          productData.createdAt || new Date().toISOString()
        ]
      );
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      if (!result.data || !result.data.lastInsertRowid) {
        return { success: false, error: 'Error al crear el producto' };
      }
      
      // Obtener el producto creado
      const newProduct = executeQuerySingle(
        'SELECT * FROM products WHERE id = ?',
        [result.data.lastInsertRowid]
      );
      
      if (newProduct.error || !newProduct.data) {
        return { success: false, error: 'Error al obtener el producto creado' };
      }
      
      return {
        success: true,
        product: newProduct.data
      };
      
    } catch (error) {
      console.error('Error en createProduct:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  },

  // Actualizar un producto existente
  async updateProduct(productId, productData) {
    try {
      // Validar datos requeridos
      if (!productId) {
        return { success: false, error: 'ID del producto es requerido' };
      }
      
      if (!productData.userId) {
        return { success: false, error: 'Usuario no autenticado' };
      }
      
      if (!productData.title || !productData.description || !productData.category) {
        return { success: false, error: 'Faltan campos requeridos' };
      }

      // Verificar que el producto existe y pertenece al usuario
      const existingProduct = executeQuerySingle(
        'SELECT * FROM products WHERE id = ? AND user_id = ?',
        [productId, productData.userId]
      );
      
      if (!existingProduct.data) {
        return { success: false, error: 'Producto no encontrado o no tienes permisos para editarlo' };
      }

      const result = await executeQueryRun(
        `UPDATE products SET 
          title = ?, 
          description = ?, 
          category = ?, 
          condition_product = ?, 
          transaction_type = ?, 
          price = ?, 
          location = ?, 
          images = ?, 
          updated_at = ?
        WHERE id = ? AND user_id = ?`,
        [
          productData.title,
          productData.description,
          productData.category,
          productData.condition,
          productData.transactionType,
          productData.price || 0,
          productData.location || '',
          productData.images || '',
          new Date().toISOString(),
          productId,
          productData.userId
        ]
      );
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      // Obtener el producto actualizado
      const updatedProduct = executeQuerySingle(
        'SELECT * FROM products WHERE id = ?',
        [productId]
      );
      
      if (updatedProduct.error || !updatedProduct.data) {
        return { success: false, error: 'Error al obtener el producto actualizado' };
      }
      
      return {
        success: true,
        product: updatedProduct.data
      };
      
    } catch (error) {
      console.error('Error en updateProduct:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  },
  
  // Obtener todos los productos
  async getAllProducts(filters = {}) {
    try {
      let query = 'SELECT * FROM products WHERE status = "active"';
      const params = [];
      
      // Aplicar filtros
      if (filters.category) {
        query += ' AND category = ?';
        params.push(filters.category);
      }
      
      if (filters.transactionType) {
        query += ' AND transaction_type = ?';
        params.push(filters.transactionType);
      }
      
      if (filters.search) {
        query += ' AND (title LIKE ? OR description LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = executeQuery(query, params);
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      return {
        success: true,
        products: result.data.map(row => {
          const product = {};
          result.columns.forEach((col, index) => {
            product[col] = row[index];
          });
          return product;
        })
      };
      
    } catch (error) {
      console.error('Error en getAllProducts:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  },
  
  // Obtener productos por usuario
  async getProductsByUser(userId) {
    try {
      const result = executeQuery(
        'SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      return {
        success: true,
        products: result.data.map(row => {
          const product = {};
          result.columns.forEach((col, index) => {
            product[col] = row[index];
          });
          return product;
        })
      };
      
    } catch (error) {
      console.error('Error en getProductsByUser:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  },
  
  // Obtener un producto por ID
  async getProduct(productId) {
    return this.getProductById(productId);
  },

  async getProductById(productId) {
    try {
      const result = executeQuerySingle(
        `SELECT 
          p.*,
          u.display_name as user_name,
          u.email as user_email,
          u.created_at as user_created_at,
          (SELECT COUNT(*) FROM products WHERE user_id = p.user_id AND status = "active") as user_products_count
        FROM products p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ? AND p.status = "active"`,
        [productId]
      );
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      if (!result.data) {
        return { success: false, error: 'Producto no encontrado' };
      }
      
      return {
        success: true,
        product: result.data
      };
      
    } catch (error) {
      console.error('Error en getProductById:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  },
  
  // Actualizar un producto
  async updateProduct(productId, updateData) {
    try {
      const result = await executeQueryRun(
        `UPDATE products SET 
          title = ?, description = ?, category = ?, condition_product = ?,
          transaction_type = ?, price = ?, location = ?, images = ?, updated_at = ?
        WHERE id = ?`,
        [
          updateData.title,
          updateData.description,
          updateData.category,
          updateData.condition,
          updateData.transactionType,
          updateData.price,
          updateData.location,
          updateData.images,
          new Date().toISOString(),
          productId
        ]
      );
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      return { success: true };
      
    } catch (error) {
      console.error('Error en updateProduct:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  },
  
  // Eliminar un producto (cambiar status a inactive)
  async deleteProduct(productId, userId) {
    try {
      // Validar parámetros
      if (!productId) {
        return { success: false, error: 'ID del producto es requerido' };
      }
      
      if (!userId) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Verificar que el producto existe y pertenece al usuario
      const existingProduct = executeQuerySingle(
        'SELECT * FROM products WHERE id = ? AND user_id = ?',
        [productId, userId]
      );
      
      if (!existingProduct.data) {
        return { success: false, error: 'Producto no encontrado o no tienes permisos para eliminarlo' };
      }

      // Eliminar el producto (cambiar status a inactive)
      const result = await executeQueryRun(
        'UPDATE products SET status = "inactive", updated_at = ? WHERE id = ? AND user_id = ?',
        [new Date().toISOString(), productId, userId]
      );
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      return { 
        success: true, 
        message: 'Producto eliminado exitosamente',
        product: existingProduct.data
      };
      
    } catch (error) {
      console.error('Error en deleteProduct:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  },
  
  // Incrementar vistas de un producto
  async incrementViews(productId) {
    try {
      const result = await executeQueryRun(
        'UPDATE products SET views = views + 1 WHERE id = ?',
        [productId]
      );
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      return { success: true };
      
    } catch (error) {
      console.error('Error en incrementViews:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  },
  
  // Obtener estadísticas de productos
  async getProductStats() {
    try {
      const totalProducts = executeQuery('SELECT COUNT(*) as count FROM products WHERE status = "active"');
      const totalViews = executeQuery('SELECT SUM(views) as total FROM products WHERE status = "active"');
      const categories = executeQuery('SELECT category, COUNT(*) as count FROM products WHERE status = "active" GROUP BY category');
      
      return {
        success: true,
        stats: {
          totalProducts: totalProducts.data[0]?.count || 0,
          totalViews: totalViews.data[0]?.total || 0,
          categories: categories.data.map(row => ({
            category: row[0],
            count: row[1]
          }))
        }
      };
      
    } catch (error) {
      console.error('Error en getProductStats:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  },
  
  // Obtener productos por categoría
  async getProductsByCategory(category) {
    try {
      const result = executeQuery(
        'SELECT * FROM products WHERE category = ? AND status = "active" ORDER BY created_at DESC',
        [category]
      );
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      return {
        success: true,
        products: result.data.map(row => {
          const product = {};
          result.columns.forEach((col, index) => {
            product[col] = row[index];
          });
          return product;
        })
      };
      
    } catch (error) {
      console.error('Error en getProductsByCategory:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  },

  // Buscar productos con filtros
  async searchProducts(searchParams = {}) {
    try {
      let query = 'SELECT * FROM products WHERE status = "active"';
      const params = [];

      // Filtro por texto de búsqueda
      if (searchParams.searchText && searchParams.searchText.trim()) {
        query += ' AND (title LIKE ? OR description LIKE ?)';
        const searchTerm = `%${searchParams.searchText.trim()}%`;
        params.push(searchTerm, searchTerm);
      }

      // Filtro por categoría
      if (searchParams.category && searchParams.category !== 'all') {
        query += ' AND category = ?';
        params.push(searchParams.category);
      }

      // Filtro por tipo de transacción
      if (searchParams.transactionType && searchParams.transactionType !== 'all') {
        query += ' AND transaction_type = ?';
        params.push(searchParams.transactionType);
      }

      // Filtro por precio mínimo
      if (searchParams.minPrice && searchParams.minPrice > 0) {
        query += ' AND price >= ?';
        params.push(searchParams.minPrice);
      }

      // Filtro por precio máximo
      if (searchParams.maxPrice && searchParams.maxPrice > 0) {
        query += ' AND price <= ?';
        params.push(searchParams.maxPrice);
      }

      // Filtro por ubicación
      if (searchParams.location && searchParams.location.trim()) {
        query += ' AND location LIKE ?';
        params.push(`%${searchParams.location.trim()}%`);
      }

      // Ordenamiento
      const sortBy = searchParams.sortBy || 'created_at';
      const sortOrder = searchParams.sortOrder || 'DESC';
      query += ` ORDER BY ${sortBy} ${sortOrder}`;

      // Límite de resultados
      if (searchParams.limit) {
        query += ' LIMIT ?';
        params.push(searchParams.limit);
      }

      const result = executeQuery(query, params);
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      return {
        success: true,
        products: result.data || [],
        total: result.data?.length || 0
      };
      
    } catch (error) {
      console.error('Error en searchProducts:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  },

  // Obtener categorías disponibles
  async getCategories() {
    try {
      const result = executeQuery(
        'SELECT DISTINCT category FROM products WHERE status = "active" ORDER BY category'
      );
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      const categories = result.data?.map(row => row.category).filter(Boolean) || [];
      
      return {
        success: true,
        categories
      };
      
    } catch (error) {
      console.error('Error en getCategories:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  },

  // Incrementar vistas de un producto
  async incrementViews(productId) {
    try {
      if (!productId) {
        return { success: false, error: 'ID de producto requerido' };
      }

      const result = await executeQueryRun(
        'UPDATE products SET views = views + 1 WHERE id = ?',
        [productId]
      );
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      return { success: true };
      
    } catch (error) {
      console.error('Error en incrementViews:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }
};

export default sqliteProductService;
