import { executeQuery, executeQuerySingle, executeQueryRun } from '../sqliteConfig';

const sqliteFavoritesService = {
  // Agregar producto a favoritos
  async addToFavorites(userId, productId) {
    try {
      if (!userId || !productId) {
        return { success: false, error: 'ID de usuario y producto son requeridos' };
      }

      // Verificar si el producto existe
      const productCheck = executeQuerySingle(
        'SELECT id FROM products WHERE id = ? AND status = "active"',
        [productId]
      );
      
      if (productCheck.error) {
        return { success: false, error: productCheck.error };
      }
      
      if (!productCheck.data) {
        return { success: false, error: 'Producto no encontrado o no disponible' };
      }

      // Verificar si ya está en favoritos
      const existingFavorite = executeQuerySingle(
        'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      
      if (existingFavorite.error) {
        return { success: false, error: existingFavorite.error };
      }
      
      if (existingFavorite.data) {
        return { success: false, error: 'El producto ya está en tus favoritos' };
      }

      // Agregar a favoritos
      const result = await executeQueryRun(
        'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)',
        [userId, productId]
      );
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      return {
        success: true,
        message: 'Producto agregado a favoritos'
      };
      
    } catch (error) {
      console.error('Error en addToFavorites:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  },

  // Remover producto de favoritos
  async removeFromFavorites(userId, productId) {
    try {
      if (!userId || !productId) {
        return { success: false, error: 'ID de usuario y producto son requeridos' };
      }

      const result = await executeQueryRun(
        'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      if (result.changes === 0) {
        return { success: false, error: 'El producto no estaba en tus favoritos' };
      }
      
      return {
        success: true,
        message: 'Producto removido de favoritos'
      };
      
    } catch (error) {
      console.error('Error en removeFromFavorites:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  },

  // Verificar si un producto está en favoritos
  async isFavorite(userId, productId) {
    try {
      if (!userId || !productId) {
        return { success: false, isFavorite: false };
      }

      const result = executeQuerySingle(
        'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      
      if (result.error) {
        return { success: false, isFavorite: false };
      }
      
      return {
        success: true,
        isFavorite: !!result.data
      };
      
    } catch (error) {
      console.error('Error en isFavorite:', error);
      return { success: false, isFavorite: false };
    }
  },

  // Obtener favoritos de un usuario
  async getUserFavorites(userId, limit = 50, offset = 0) {
    try {
      if (!userId) {
        return { success: false, error: 'ID de usuario requerido' };
      }

      const result = executeQuery(
        `SELECT 
          p.*,
          f.created_at as favorited_at,
          u.display_name as seller_name
        FROM favorites f
        JOIN products p ON f.product_id = p.id
        JOIN users u ON p.user_id = u.id
        WHERE f.user_id = ? AND p.status = "active"
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      return {
        success: true,
        favorites: result.data || [],
        total: result.data?.length || 0
      };
      
    } catch (error) {
      console.error('Error en getUserFavorites:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  },

  // Obtener estadísticas de favoritos
  async getFavoritesStats(userId) {
    try {
      if (!userId) {
        return { success: false, error: 'ID de usuario requerido' };
      }

      // Total de favoritos
      const totalResult = executeQuerySingle(
        'SELECT COUNT(*) as total FROM favorites WHERE user_id = ?',
        [userId]
      );
      
      // Favoritos por categoría
      const categoriesResult = executeQuery(
        `SELECT 
          p.category,
          COUNT(*) as count
        FROM favorites f
        JOIN products p ON f.product_id = p.id
        WHERE f.user_id = ? AND p.status = "active"
        GROUP BY p.category
        ORDER BY count DESC`,
        [userId]
      );
      
      // Favoritos por tipo de transacción
      const transactionTypesResult = executeQuery(
        `SELECT 
          p.transaction_type,
          COUNT(*) as count
        FROM favorites f
        JOIN products p ON f.product_id = p.id
        WHERE f.user_id = ? AND p.status = "active"
        GROUP BY p.transaction_type
        ORDER BY count DESC`,
        [userId]
      );
      
      if (totalResult.error || categoriesResult.error || transactionTypesResult.error) {
        return { success: false, error: 'Error obteniendo estadísticas de favoritos' };
      }
      
      const stats = {
        total_favorites: totalResult.data?.total || 0,
        categories: categoriesResult.data || [],
        transaction_types: transactionTypesResult.data || []
      };
      
      return {
        success: true,
        stats
      };
      
    } catch (error) {
      console.error('Error en getFavoritesStats:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  },

  // Toggle favorito (agregar si no existe, remover si existe)
  async toggleFavorite(userId, productId) {
    try {
      if (!userId || !productId) {
        return { success: false, error: 'ID de usuario y producto son requeridos' };
      }

      // Verificar si ya está en favoritos
      const isFavoriteResult = await this.isFavorite(userId, productId);
      
      if (!isFavoriteResult.success) {
        return { success: false, error: 'Error verificando favoritos' };
      }
      
      if (isFavoriteResult.isFavorite) {
        // Remover de favoritos
        return await this.removeFromFavorites(userId, productId);
      } else {
        // Agregar a favoritos
        return await this.addToFavorites(userId, productId);
      }
      
    } catch (error) {
      console.error('Error en toggleFavorite:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }
};

export { sqliteFavoritesService };
export default sqliteFavoritesService;
