-- Script para insertar productos de ejemplo en Supabase
-- Ejecutar en el SQL Editor de Supabase

-- Insertar productos de ejemplo
INSERT INTO products (
  id,
  title,
  description,
  price,
  category,
  transaction_type,
  condition,
  location,
  user_id,
  images,
  is_active,
  created_at,
  updated_at
) VALUES 
-- Productos de Electrónicos
(
  gen_random_uuid(),
  'iPhone 13 Pro Max 256GB',
  'iPhone 13 Pro Max en excelente estado, 256GB de almacenamiento, color Azul Sierra. Incluye cargador original y funda protectora. Pantalla sin rayones, batería al 95%.',
  850.00,
  'Electrónicos',
  'Venta',
  'Excelente',
  'Ciudad de México',
  (SELECT id FROM auth.users LIMIT 1),
  '["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"]',
  true,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
),

(
  gen_random_uuid(),
  'MacBook Air M2 13 pulgadas',
  'MacBook Air con chip M2, 8GB RAM, 256GB SSD. Laptop en perfecto estado, ideal para estudiantes y profesionales. Incluye cargador original.',
  1200.00,
  'Electrónicos',
  'Venta',
  'Excelente',
  'Guadalajara',
  (SELECT id FROM auth.users LIMIT 1),
  '["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"]',
  true,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
),

(
  gen_random_uuid(),
  'Samsung Galaxy S22 Ultra',
  'Samsung Galaxy S22 Ultra 128GB, color Negro. Teléfono en muy buen estado, incluye cargador y auriculares originales. Pantalla AMOLED 6.8 pulgadas.',
  750.00,
  'Electrónicos',
  'Venta',
  'Muy bueno',
  'Monterrey',
  (SELECT id FROM auth.users LIMIT 1),
  '["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"]',
  true,
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days'
),

-- Productos de Ropa
(
  gen_random_uuid(),
  'Chaqueta de Cuero Genuina',
  'Chaqueta de cuero genuino talla M, color negro. Marca reconocida, en excelente estado. Perfecta para el invierno.',
  180.00,
  'Ropa',
  'Venta',
  'Muy bueno',
  'Puebla',
  (SELECT id FROM auth.users LIMIT 1),
  '["https://images.unsplash.com/photo-1551028719-001c4b5e8caf?w=500", "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500"]',
  true,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
),

(
  gen_random_uuid(),
  'Zapatos Deportivos Nike Air Max',
  'Zapatos deportivos Nike Air Max talla 9.5, color blanco y negro. Usados pero en buen estado, ideales para correr o gimnasio.',
  80.00,
  'Ropa',
  'Venta',
  'Bueno',
  'Tijuana',
  (SELECT id FROM auth.users LIMIT 1),
  '["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500"]',
  true,
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '4 days'
),

-- Productos de Hogar
(
  gen_random_uuid(),
  'Sofá de 3 Plazas Gris',
  'Sofá de 3 plazas en tela gris, perfecto estado. Ideal para sala o living. Dimensiones: 200x90x85 cm. Se entrega en la zona metropolitana.',
  450.00,
  'Hogar',
  'Venta',
  'Muy bueno',
  'Ciudad de México',
  (SELECT id FROM auth.users LIMIT 1),
  '["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500", "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500"]',
  true,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
),

(
  gen_random_uuid(),
  'Mesa de Centro de Madera',
  'Mesa de centro de madera de pino, estilo rústico. Dimensiones: 120x60x45 cm. Perfecta para decorar tu sala.',
  120.00,
  'Hogar',
  'Venta',
  'Excelente',
  'Querétaro',
  (SELECT id FROM auth.users LIMIT 1),
  '["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500"]',
  true,
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '6 days'
),

-- Productos de Deportes
(
  gen_random_uuid(),
  'Bicicleta de Montaña Trek',
  'Bicicleta de montaña Trek modelo 2022, 21 velocidades, frenos de disco. Ideal para senderos y ciudad. Talla M (1.70-1.80m).',
  350.00,
  'Deportes',
  'Venta',
  'Muy bueno',
  'Cancún',
  (SELECT id FROM auth.users LIMIT 1),
  '["https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500", "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500"]',
  true,
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '8 days'
),

(
  gen_random_uuid(),
  'Set de Pesas Ajustables',
  'Set de pesas ajustables de 2.5kg a 20kg cada una. Incluye barra y discos. Perfecto para entrenar en casa.',
  200.00,
  'Deportes',
  'Venta',
  'Excelente',
  'León',
  (SELECT id FROM auth.users LIMIT 1),
  '["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500"]',
  true,
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '10 days'
),

-- Productos de Libros
(
  gen_random_uuid(),
  'Libro: "El Principito" - Edición Especial',
  'El Principito de Antoine de Saint-Exupéry, edición especial con ilustraciones originales. Libro en perfecto estado, tapa dura.',
  25.00,
  'Libros',
  'Venta',
  'Excelente',
  'Mérida',
  (SELECT id FROM auth.users LIMIT 1),
  '["https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500"]',
  true,
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '12 days'
),

(
  gen_random_uuid(),
  'Colección de Manga One Piece',
  'Colección de One Piece tomos 1-20, en español. Todos los libros en muy buen estado, sin rayones ni páginas dobladas.',
  150.00,
  'Libros',
  'Venta',
  'Muy bueno',
  'Toluca',
  (SELECT id FROM auth.users LIMIT 1),
  '["https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500"]',
  true,
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '15 days'
),

-- Productos de Intercambio
(
  gen_random_uuid(),
  'Guitarra Acústica Yamaha',
  'Guitarra acústica Yamaha F310, perfecta para principiantes. Incluye estuche y púas. Intercambio por otro instrumento musical.',
  0.00,
  'Música',
  'Intercambio',
  'Bueno',
  'Aguascalientes',
  (SELECT id FROM auth.users LIMIT 1),
  '["https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500", "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500"]',
  true,
  NOW() - INTERVAL '9 days',
  NOW() - INTERVAL '9 days'
),

(
  gen_random_uuid(),
  'Cámara Canon EOS Rebel T7',
  'Cámara Canon EOS Rebel T7 con lente 18-55mm. Intercambio por cámara de video o equipo de fotografía profesional.',
  0.00,
  'Fotografía',
  'Intercambio',
  'Muy bueno',
  'Saltillo',
  (SELECT id FROM auth.users LIMIT 1),
  '["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500", "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500"]',
  true,
  NOW() - INTERVAL '11 days',
  NOW() - INTERVAL '11 days'
),

-- Productos de Alquiler
(
  gen_random_uuid(),
  'Casa de Playa en Cancún',
  'Casa de 3 recámaras, 2 baños, con alberca privada. Alquiler por semana. Incluye estacionamiento para 2 autos.',
  500.00,
  'Inmuebles',
  'Alquiler',
  'Excelente',
  'Cancún',
  (SELECT id FROM auth.users LIMIT 1),
  '["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500", "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500"]',
  true,
  NOW() - INTERVAL '13 days',
  NOW() - INTERVAL '13 days'
),

(
  gen_random_uuid(),
  'Auto Híbrido Toyota Prius 2020',
  'Toyota Prius 2020, híbrido, 4 puertas, automático. Alquiler por día. Perfecto para viajes de trabajo o turismo.',
  80.00,
  'Vehículos',
  'Alquiler',
  'Excelente',
  'Ciudad de México',
  (SELECT id FROM auth.users LIMIT 1),
  '["https://images.unsplash.com/photo-1549317336-206569e8475c?w=500", "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500"]',
  true,
  NOW() - INTERVAL '14 days',
  NOW() - INTERVAL '14 days'
);

-- Verificar que los productos se insertaron correctamente
SELECT 
  title,
  category,
  transaction_type,
  price,
  condition,
  location,
  created_at
FROM products 
ORDER BY created_at DESC 
LIMIT 15;
