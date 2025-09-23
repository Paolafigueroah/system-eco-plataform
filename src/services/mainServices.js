// Servicios principales - Usando Supabase por defecto
import { supabaseAuthService } from './supabaseAuthService.js';
import { supabaseProductService } from './supabaseProductService.js';
import { supabaseChatService } from './supabaseChatService.js';
import { supabaseFavoritesService } from './supabaseFavoritesService.js';

// Exportar servicios de Supabase como servicios principales
export const authService = supabaseAuthService;
export const productService = supabaseProductService;
export const chatService = supabaseChatService;
export const favoritesService = supabaseFavoritesService;

// Exportar también con nombres específicos para compatibilidad
export {
  supabaseAuthService as authService,
  supabaseProductService as productService,
  supabaseChatService as chatService,
  supabaseFavoritesService as favoritesService
};

// Exportar servicios por defecto
export default {
  authService,
  productService,
  chatService,
  favoritesService
};
