// Servicios principales - Usando Supabase por defecto
import { supabaseAuthService } from './supabaseAuthService.js';
import { supabaseProductService } from './supabaseProductService.js';
import { supabaseChatService } from './supabaseChatService.js';
import { supabaseFavoritesService } from './supabaseFavoritesService.js';

// Utilidades de Supabase
export const supabaseUtils = {
  handleSuccess: (data, operation) => {
    console.log(`✅ ${operation} exitoso:`, data);
    return { success: true, data, error: null };
  },
  handleError: (error, operation) => {
    console.error(`❌ Error en ${operation}:`, error);
    return { success: false, data: null, error: error.message || error };
  }
};

// Exportar servicios de Supabase como servicios principales
export const authService = supabaseAuthService;
export const productService = supabaseProductService;
export const chatService = supabaseChatService;
export const favoritesService = supabaseFavoritesService;

// Exportar servicios por defecto
export default {
  authService,
  productService,
  chatService,
  favoritesService,
  supabaseUtils
};
