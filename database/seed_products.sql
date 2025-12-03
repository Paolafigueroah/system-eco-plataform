-- =====================================================
-- SCRIPT DE PRODUCTOS DE PRUEBA - SYSTEM ECO
-- Mínimo 5 productos por categoría
-- Distribuidos entre los usuarios del sistema
-- =====================================================

-- Usuarios disponibles:
-- e76b4e80-3413-440e-87d3-83392fe81278 - Andre Urzua
-- 2cb196ca-542b-4684-933d-93efed59b5ee - Claudia P Figueroa
-- c324763d-f3dd-47a9-a172-8abd796bf042 - Claudia Figueroa
-- 292f0f16-c648-4430-b483-7358a0e50063 - Gerardo Figueroa Higuera
-- 63fdc677-46c4-40b3-bea6-5523a2571dfc - Paola Figueroa

-- =====================================================
-- CATEGORÍA: Electrónica (5 productos)
-- =====================================================

INSERT INTO products (title, description, category, condition_product, transaction_type, price, location, seller_id, status, views, created_at) VALUES
('iPhone 12 Pro Max 128GB', 'iPhone 12 Pro Max en excelente estado, con caja y cargador original. Pantalla perfecta, sin rayones. Funciona perfectamente.', 'Electrónica', 'excelente', 'sell', 850000, 'Bogotá, Colombia', 'e76b4e80-3413-440e-87d3-83392fe81278', 'active', 0, NOW() - INTERVAL '5 days'),
('Laptop HP Pavilion 15"', 'Laptop HP Pavilion con procesador Intel i5, 8GB RAM, 256GB SSD. Ideal para trabajo y estudio. Incluye mouse y mochila.', 'Electrónica', 'muy_bueno', 'sell', 1200000, 'Medellín, Colombia', '2cb196ca-542b-4684-933d-93efed59b5ee', 'active', 0, NOW() - INTERVAL '3 days'),
('Auriculares Sony WH-1000XM4', 'Auriculares inalámbricos Sony con cancelación de ruido activa. Excelente calidad de sonido. Incluyen estuche y cable USB.', 'Electrónica', 'excelente', 'exchange', 0, 'Cali, Colombia', 'c324763d-f3dd-47a9-a172-8abd796bf042', 'active', 0, NOW() - INTERVAL '7 days'),
('Tablet Samsung Galaxy Tab S7', 'Tablet Samsung en muy buen estado, con S Pen incluido. Perfecta para dibujo y trabajo. Pantalla de 11 pulgadas.', 'Electrónica', 'muy_bueno', 'sell', 1800000, 'Barranquilla, Colombia', '292f0f16-c648-4430-b483-7358a0e50063', 'active', 0, NOW() - INTERVAL '2 days'),
('Cámara Canon EOS Rebel T7', 'Cámara réflex digital Canon con lente 18-55mm. Ideal para principiantes en fotografía. Incluye tarjeta SD y estuche.', 'Electrónica', 'bueno', 'sell', 1500000, 'Bogotá, Colombia', '63fdc677-46c4-40b3-bea6-5523a2571dfc', 'active', 0, NOW() - INTERVAL '4 days');

-- =====================================================
-- CATEGORÍA: Ropa y accesorios (5 productos)
-- =====================================================

INSERT INTO products (title, description, category, condition_product, transaction_type, price, location, seller_id, status, views, created_at) VALUES
('Chaqueta de Cuero Genuino', 'Chaqueta de cuero genuino talla M, estilo biker. En excelente estado, sin desgaste. Perfecta para el invierno.', 'Ropa y accesorios', 'excelente', 'sell', 250000, 'Medellín, Colombia', 'e76b4e80-3413-440e-87d3-83392fe81278', 'active', 0, NOW() - INTERVAL '6 days'),
('Zapatillas Nike Air Max 270', 'Zapatillas Nike Air Max 270 talla 42, usadas pero en muy buen estado. Perfectas para correr o uso casual.', 'Ropa y accesorios', 'muy_bueno', 'sell', 180000, 'Cali, Colombia', '2cb196ca-542b-4684-933d-93efed59b5ee', 'active', 0, NOW() - INTERVAL '8 days'),
('Bolso de Mano Coach Original', 'Bolso de mano Coach original, color negro. En excelente estado, con todos los accesorios. Perfecto para ocasiones especiales.', 'Ropa y accesorios', 'excelente', 'exchange', 0, 'Bogotá, Colombia', 'c324763d-f3dd-47a9-a172-8abd796bf042', 'active', 0, NOW() - INTERVAL '10 days'),
('Vestido de Gala Largo', 'Hermoso vestido de gala largo, talla S, color azul marino. Usado una sola vez. Perfecto para eventos formales.', 'Ropa y accesorios', 'excelente', 'sell', 120000, 'Barranquilla, Colombia', '292f0f16-c648-4430-b483-7358a0e50063', 'active', 0, NOW() - INTERVAL '1 day'),
('Reloj Casio G-Shock', 'Reloj Casio G-Shock resistente al agua, color negro. Funciona perfectamente, incluye caja original. Ideal para deportes.', 'Ropa y accesorios', 'bueno', 'sell', 80000, 'Medellín, Colombia', '63fdc677-46c4-40b3-bea6-5523a2571dfc', 'active', 0, NOW() - INTERVAL '5 days');

-- =====================================================
-- CATEGORÍA: Libros y educación (5 productos)
-- =====================================================

INSERT INTO products (title, description, category, condition_product, transaction_type, price, location, seller_id, status, views, created_at) VALUES
('Colección Completa Harry Potter', 'Colección completa de 7 libros de Harry Potter en español, edición tapa dura. En excelente estado, sin rayones.', 'Libros y educación', 'excelente', 'sell', 150000, 'Bogotá, Colombia', 'e76b4e80-3413-440e-87d3-83392fe81278', 'active', 0, NOW() - INTERVAL '12 days'),
('Libros de Programación JavaScript', 'Set de 5 libros sobre programación JavaScript y React. Incluye guías prácticas y ejemplos de código.', 'Libros y educación', 'muy_bueno', 'exchange', 0, 'Medellín, Colombia', '2cb196ca-542b-4684-933d-93efed59b5ee', 'active', 0, NOW() - INTERVAL '9 days'),
('Enciclopedia Universal 20 Tomos', 'Enciclopedia universal completa en 20 tomos. Perfecta para consulta y estudio. Algunos tomos con uso moderado.', 'Libros y educación', 'bueno', 'donate', 0, 'Cali, Colombia', 'c324763d-f3dd-47a9-a172-8abd796bf042', 'active', 0, NOW() - INTERVAL '15 days'),
('Libros de Texto Universitarios', 'Colección de libros de texto universitarios de ingeniería: cálculo, física, química. En buen estado.', 'Libros y educación', 'bueno', 'sell', 200000, 'Barranquilla, Colombia', '292f0f16-c648-4430-b483-7358a0e50063', 'active', 0, NOW() - INTERVAL '11 days'),
('Novelas Clásicas de Literatura', 'Set de 10 novelas clásicas de literatura universal: Don Quijote, Cien años de soledad, etc. Ediciones de bolsillo.', 'Libros y educación', 'aceptable', 'sell', 80000, 'Bogotá, Colombia', '63fdc677-46c4-40b3-bea6-5523a2571dfc', 'active', 0, NOW() - INTERVAL '6 days');

-- =====================================================
-- CATEGORÍA: Hogar y jardín (5 productos)
-- =====================================================

INSERT INTO products (title, description, category, condition_product, transaction_type, price, location, seller_id, status, views, created_at) VALUES
('Sofá Cama de 3 Plazas', 'Sofá cama cómodo de 3 plazas, color gris. Perfecto para sala o estudio. Se convierte en cama individual. Muy buen estado.', 'Hogar y jardín', 'muy_bueno', 'sell', 450000, 'Medellín, Colombia', 'e76b4e80-3413-440e-87d3-83392fe81278', 'active', 0, NOW() - INTERVAL '7 days'),
('Mesa de Comedor para 6 Personas', 'Mesa de comedor de madera maciza para 6 personas con 6 sillas. Estilo rústico moderno. En excelente estado.', 'Hogar y jardín', 'excelente', 'sell', 800000, 'Cali, Colombia', '2cb196ca-542b-4684-933d-93efed59b5ee', 'active', 0, NOW() - INTERVAL '4 days'),
('Set de Ollas y Sartenes Antiadherentes', 'Set completo de ollas y sartenes antiadherentes de 10 piezas. Marca reconocida. Casi nuevas, usadas pocas veces.', 'Hogar y jardín', 'excelente', 'exchange', 0, 'Bogotá, Colombia', 'c324763d-f3dd-47a9-a172-8abd796bf042', 'active', 0, NOW() - INTERVAL '13 days'),
('Lámpara de Pie Moderna', 'Lámpara de pie moderna con diseño escandinavo. Color blanco. Perfecta para iluminar espacios. Funciona perfectamente.', 'Hogar y jardín', 'muy_bueno', 'sell', 120000, 'Barranquilla, Colombia', '292f0f16-c648-4430-b483-7358a0e50063', 'active', 0, NOW() - INTERVAL '8 days'),
('Macetas y Plantas Decorativas', 'Set de 5 macetas de cerámica con plantas decorativas. Perfectas para decorar interiores. Incluye plantas sanas.', 'Hogar y jardín', 'bueno', 'sell', 60000, 'Medellín, Colombia', '63fdc677-46c4-40b3-bea6-5523a2571dfc', 'active', 0, NOW() - INTERVAL '2 days');

-- =====================================================
-- CATEGORÍA: Juguetes y entretenimiento (5 productos)
-- =====================================================

INSERT INTO products (title, description, category, condition_product, transaction_type, price, location, seller_id, status, views, created_at) VALUES
('PlayStation 5 con 2 Controles', 'PlayStation 5 en excelente estado con 2 controles DualSense. Incluye 3 juegos: FIFA 24, Spider-Man 2, y God of War Ragnarök.', 'Juguetes y entretenimiento', 'excelente', 'sell', 2500000, 'Bogotá, Colombia', 'e76b4e80-3413-440e-87d3-83392fe81278', 'active', 0, NOW() - INTERVAL '1 day'),
('Nintendo Switch OLED', 'Nintendo Switch OLED con estuche y 5 juegos físicos. Pantalla perfecta, controles en excelente estado. Incluye dock y cables.', 'Juguetes y entretenimiento', 'excelente', 'sell', 1800000, 'Medellín, Colombia', '2cb196ca-542b-4684-933d-93efed59b5ee', 'active', 0, NOW() - INTERVAL '3 days'),
('Lego Star Wars Set Completo', 'Set completo de Lego Star Wars con más de 2000 piezas. Incluye manual y todas las piezas. Perfecto para coleccionistas.', 'Juguetes y entretenimiento', 'muy_bueno', 'exchange', 0, 'Cali, Colombia', 'c324763d-f3dd-47a9-a172-8abd796bf042', 'active', 0, NOW() - INTERVAL '14 days'),
('Bicicleta de Equilibrio para Niños', 'Bicicleta de equilibrio para niños de 2-5 años. Color rojo. En muy buen estado, perfecta para aprender a andar en bici.', 'Juguetes y entretenimiento', 'muy_bueno', 'sell', 150000, 'Barranquilla, Colombia', '292f0f16-c648-4430-b483-7358a0e50063', 'active', 0, NOW() - INTERVAL '9 days'),
('Juegos de Mesa Colección', 'Colección de 8 juegos de mesa: Monopoly, Scrabble, Ajedrez, Damas, etc. Todos completos con sus piezas. Ideal para familia.', 'Juguetes y entretenimiento', 'bueno', 'sell', 100000, 'Bogotá, Colombia', '63fdc677-46c4-40b3-bea6-5523a2571dfc', 'active', 0, NOW() - INTERVAL '5 days');

-- =====================================================
-- CATEGORÍA: Deportes y recreación (5 productos)
-- =====================================================

INSERT INTO products (title, description, category, condition_product, transaction_type, price, location, seller_id, status, views, created_at) VALUES
('Bicicleta de Montaña Trek', 'Bicicleta de montaña Trek, talla M, con cambios Shimano. En muy buen estado, recién revisada. Incluye casco y candado.', 'Deportes y recreación', 'muy_bueno', 'sell', 1200000, 'Medellín, Colombia', 'e76b4e80-3413-440e-87d3-83392fe81278', 'active', 0, NOW() - INTERVAL '6 days'),
('Pesas y Mancuernas Ajustables', 'Set de pesas y mancuernas ajustables de 2-20kg cada una. Perfectas para entrenamiento en casa. Incluye barra y discos.', 'Deportes y recreación', 'bueno', 'sell', 300000, 'Cali, Colombia', '2cb196ca-542b-4684-933d-93efed59b5ee', 'active', 0, NOW() - INTERVAL '10 days'),
('Pelota de Fútbol Adidas Original', 'Pelota de fútbol Adidas original, tamaño 5. Usada en pocas ocasiones, en excelente estado. Perfecta para entrenar.', 'Deportes y recreación', 'excelente', 'exchange', 0, 'Bogotá, Colombia', 'c324763d-f3dd-47a9-a172-8abd796bf042', 'active', 0, NOW() - INTERVAL '12 days'),
('Tabla de Surf Profesional', 'Tabla de surf profesional de 6 pies, ideal para principiantes. Incluye leash y quillas. En muy buen estado.', 'Deportes y recreación', 'muy_bueno', 'sell', 500000, 'Barranquilla, Colombia', '292f0f16-c648-4430-b483-7358a0e50063', 'active', 0, NOW() - INTERVAL '7 days'),
('Raquetas de Tenis Wilson', 'Par de raquetas de tenis Wilson con fundas. Perfectas para jugadores intermedios. Incluye overgrips y cordones nuevos.', 'Deportes y recreación', 'bueno', 'sell', 200000, 'Medellín, Colombia', '63fdc677-46c4-40b3-bea6-5523a2571dfc', 'active', 0, NOW() - INTERVAL '4 days');

-- =====================================================
-- CATEGORÍA: Arte y manualidades (5 productos)
-- =====================================================

INSERT INTO products (title, description, category, condition_product, transaction_type, price, location, seller_id, status, views, created_at) VALUES
('Set de Acuarelas Profesionales', 'Set completo de acuarelas profesionales de 48 colores con pinceles incluidos. Marca reconocida, casi sin usar.', 'Arte y manualidades', 'excelente', 'sell', 180000, 'Bogotá, Colombia', 'e76b4e80-3413-440e-87d3-83392fe81278', 'active', 0, NOW() - INTERVAL '8 days'),
('Lienzos y Bastidores Varios Tamaños', 'Set de 10 lienzos con bastidores de diferentes tamaños. Perfectos para pintar. Algunos nuevos, otros usados una vez.', 'Arte y manualidades', 'muy_bueno', 'sell', 120000, 'Medellín, Colombia', '2cb196ca-542b-4684-933d-93efed59b5ee', 'active', 0, NOW() - INTERVAL '11 days'),
('Kit de Bordado Completo', 'Kit completo de bordado con hilos de colores, agujas, bastidor y patrones. Ideal para principiantes. Todo nuevo.', 'Arte y manualidades', 'excelente', 'exchange', 0, 'Cali, Colombia', 'c324763d-f3dd-47a9-a172-8abd796bf042', 'active', 0, NOW() - INTERVAL '16 days'),
('Tornos para Cerámica', 'Par de tornos para cerámica de tamaño mediano. Perfectos para hacer vasijas y objetos decorativos. Funcionan perfectamente.', 'Arte y manualidades', 'bueno', 'sell', 400000, 'Barranquilla, Colombia', '292f0f16-c648-4430-b483-7358a0e50063', 'active', 0, NOW() - INTERVAL '13 days'),
('Materiales para Scrapbooking', 'Colección completa de materiales para scrapbooking: papeles, pegatinas, cintas, sellos, etc. Muchas piezas nuevas.', 'Arte y manualidades', 'muy_bueno', 'sell', 150000, 'Bogotá, Colombia', '63fdc677-46c4-40b3-bea6-5523a2571dfc', 'active', 0, NOW() - INTERVAL '6 days');

-- =====================================================
-- CATEGORÍA: Otros productos (5 productos)
-- =====================================================

INSERT INTO products (title, description, category, condition_product, transaction_type, price, location, seller_id, status, views, created_at) VALUES
('Instrumento Musical Guitarra Acústica', 'Guitarra acústica Yamaha en excelente estado. Incluye estuche rígido, cuerdas nuevas y afinador. Perfecta para principiantes.', 'Otros productos', 'muy_bueno', 'sell', 600000, 'Medellín, Colombia', 'e76b4e80-3413-440e-87d3-83392fe81278', 'active', 0, NOW() - INTERVAL '9 days'),
('Caja de Herramientas Completa', 'Caja de herramientas completa con más de 50 piezas: destornilladores, llaves, alicates, etc. Ideal para el hogar.', 'Otros productos', 'bueno', 'sell', 200000, 'Cali, Colombia', '2cb196ca-542b-4684-933d-93efed59b5ee', 'active', 0, NOW() - INTERVAL '14 days'),
('Cafetera Espresso Profesional', 'Cafetera espresso semi-profesional con molinillo integrado. Marca italiana. Funciona perfectamente, incluye manual.', 'Otros productos', 'muy_bueno', 'exchange', 0, 'Bogotá, Colombia', 'c324763d-f3dd-47a9-a172-8abd796bf042', 'active', 0, NOW() - INTERVAL '17 days'),
('Vitrina para Colección', 'Vitrina de vidrio para exhibir colecciones. Con iluminación LED integrada. Perfecta para figuras, monedas, etc. Excelente estado.', 'Otros productos', 'excelente', 'sell', 350000, 'Barranquilla, Colombia', '292f0f16-c648-4430-b483-7358a0e50063', 'active', 0, NOW() - INTERVAL '15 days'),
('Máquina de Coser Portátil', 'Máquina de coser portátil eléctrica. Perfecta para arreglos y proyectos pequeños. Incluye accesorios y manual. Muy buen estado.', 'Otros productos', 'bueno', 'sell', 250000, 'Medellín, Colombia', '63fdc677-46c4-40b3-bea6-5523a2571dfc', 'active', 0, NOW() - INTERVAL '8 days');

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que se insertaron correctamente
SELECT 
    category,
    COUNT(*) as total_productos,
    COUNT(DISTINCT seller_id) as vendedores_unicos
FROM products
WHERE seller_id IN (
    'e76b4e80-3413-440e-87d3-83392fe81278',
    '2cb196ca-542b-4684-933d-93efed59b5ee',
    'c324763d-f3dd-47a9-a172-8abd796bf042',
    '292f0f16-c648-4430-b483-7358a0e50063',
    '63fdc677-46c4-40b3-bea6-5523a2571dfc'
)
GROUP BY category
ORDER BY category;

-- Ver productos por vendedor
SELECT 
    seller_id,
    COUNT(*) as total_productos
FROM products
WHERE seller_id IN (
    'e76b4e80-3413-440e-87d3-83392fe81278',
    '2cb196ca-542b-4684-933d-93efed59b5ee',
    'c324763d-f3dd-47a9-a172-8abd796bf042',
    '292f0f16-c648-4430-b483-7358a0e50063',
    '63fdc677-46c4-40b3-bea6-5523a2571dfc'
)
GROUP BY seller_id
ORDER BY total_productos DESC;

