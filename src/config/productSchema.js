/**
 * Columna del vendedor en `public.products`.
 * - `user_id`: común en proyectos / plantillas antiguas de Supabase.
 * - `seller_id`: esquema del repositorio (`database/schema.sql`).
 *
 * En Vercel: Settings → Environment Variables →
 *   VITE_PRODUCTS_OWNER_COLUMN=seller_id
 * Si no defines nada, se usa `user_id` (compatibilidad con bases ya desplegadas).
 */
export const PRODUCTS_OWNER_COLUMN =
  import.meta.env.VITE_PRODUCTS_OWNER_COLUMN === 'seller_id' ? 'seller_id' : 'user_id';

/**
 * Expone ambos campos para que la UI (Dashboard, tarjetas, etc.) sea compatible.
 */
export function normalizeProductOwnerFields(row) {
  if (!row || typeof row !== 'object') return row;
  const owner = row.seller_id ?? row.user_id ?? null;
  if (owner == null) return row;
  return {
    ...row,
    seller_id: row.seller_id ?? owner,
    user_id: row.user_id ?? owner
  };
}

export function normalizeProductOwnerFieldsList(rows) {
  if (!Array.isArray(rows)) return rows;
  return rows.map(normalizeProductOwnerFields);
}
