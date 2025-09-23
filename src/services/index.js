// Exportar servicios principales (SQLite)
export { default as sqliteAuthService } from './sqliteAuthService';
export { default as sqliteProductService } from './sqliteProductService';
export { default as sqliteFavoritesService } from './sqliteFavoritesService';
export { default as sqliteChatService } from './sqliteChatService';

// Exportar servicios principales (Supabase)
export { default as supabaseAuthService } from './supabaseAuthService';
export { default as supabaseProductService } from './supabaseProductService';
export { default as supabaseFavoritesService } from './supabaseFavoritesService';
export { default as supabaseChatService } from './supabaseChatService';
export { default as supabaseNotificationService } from './supabaseNotificationService';

// Exportar servicios simplificados
export { supabaseChatServiceSimple } from './supabaseChatServiceSimple';
export { supabaseFavoritesServiceSimple } from './supabaseFavoritesServiceSimple';
export { supabaseProfileService } from './supabaseProfileService';
export { supabaseChatServiceFallback } from './supabaseChatServiceFallback';

// Exportar servicios individuales también
export * from './sqliteAuthService';
export * from './sqliteProductService';
export * from './sqliteFavoritesService';
export * from './sqliteChatService';

// Exportar servicios Supabase individuales
export * from './supabaseAuthService';
export * from './supabaseProductService';
export * from './supabaseFavoritesService';
export * from './supabaseChatService';
export * from './supabaseNotificationService';
export * from './supabaseChatServiceSimple';
export * from './supabaseFavoritesServiceSimple';
export * from './supabaseProfileService';
export * from './supabaseChatServiceFallback';
export * from './supabaseChatServiceFallback';