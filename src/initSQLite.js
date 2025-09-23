import { initDatabase, executeQueryRun, executeQuerySingle } from './sqliteConfig';
import bcrypt from 'bcryptjs';

// Función para inicializar SQLite
export const initSQLite = async () => {
  try {
    const success = await initDatabase();
    return success;
  } catch (error) {
    console.error('Error inicializando SQLite:', error);
    return false;
  }
};

// Variable para controlar si ya se crearon los usuarios de prueba
let testUsersCreated = false;

// Función para crear usuario de prueba
export const createTestUser = async () => {
  try {
    // Si ya se crearon los usuarios, no hacer nada
    if (testUsersCreated) {
      return true;
    }

    // Verificar si ambos usuarios ya existen
    const existingUser = await executeQuerySingle(
      'SELECT id FROM users WHERE email = ?',
      ['admin@systemeco.com']
    );
    
    const secondUser = await executeQuerySingle(
      'SELECT id FROM users WHERE email = ?',
      ['usuario2@systemeco.com']
    );
    
    // Si ambos usuarios ya existen, marcar como creados y retornar
    if ((existingUser.data && existingUser.data.id) && (secondUser.data && secondUser.data.id)) {
      console.log('✅ Usuarios de prueba ya existen');
      testUsersCreated = true;
      return true;
    }
    
    // Crear hash de la contraseña
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    // Insertar primer usuario solo si no existe
    if (!existingUser.data || !existingUser.data.id) {
      try {
        await executeQueryRun(
          'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
          ['admin@systemeco.com', passwordHash, 'Administrador']
        );
        console.log('✅ Usuario admin creado exitosamente');
      } catch (insertError) {
        // Ignorar errores de UNIQUE constraint
        if (!insertError.message.includes('UNIQUE constraint failed')) {
          console.error('❌ Error inesperado creando usuario:', insertError);
          return false;
        }
        console.log('ℹ️ Usuario admin ya existe');
      }
    }
    
    // Insertar segundo usuario solo si no existe
    if (!secondUser.data || !secondUser.data.id) {
      try {
        await executeQueryRun(
          'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
          ['usuario2@systemeco.com', passwordHash, 'Usuario Prueba 2']
        );
        console.log('✅ Usuario prueba 2 creado exitosamente');
      } catch (insertError) {
        // Ignorar errores de UNIQUE constraint
        if (!insertError.message.includes('UNIQUE constraint failed')) {
          console.error('❌ Error inesperado creando segundo usuario:', insertError);
          return false;
        }
        console.log('ℹ️ Usuario prueba 2 ya existe');
      }
    }
    
    // Marcar como creados
    testUsersCreated = true;
    return true;
  } catch (error) {
    console.error('❌ Error en createTestUser:', error);
    return false;
  }
};

// Función para crear productos de ejemplo
export const createSampleProducts = async () => {
  try {
    console.log('📦 Verificando productos de ejemplo...');
    
    // Verificar productos existentes por categoría
    const categories = ['Electrónica', 'Libros y educación', 'Deportes y recreación', 'Hogar y jardín', 'Ropa y accesorios', 'Juguetes y entretenimiento'];
    const productsToAdd = [];
    
    for (const category of categories) {
      const existingCount = await executeQuerySingle(
        'SELECT COUNT(*) as count FROM products WHERE category = ?',
        [category]
      );
      
      const count = existingCount.data?.count || 0;
      console.log(`📋 ${category}: ${count} productos existentes`);
      
      // Si hay menos de 5 productos en esta categoría, agregar más
      if (count < 5) {
        const needed = 5 - count;
        console.log(`➕ Agregando ${needed} productos para ${category}`);
        
        // Obtener productos de ejemplo para esta categoría
        const categoryProducts = getSampleProductsByCategory(category, needed);
        productsToAdd.push(...categoryProducts);
      }
    }
    
    // Insertar productos faltantes
    if (productsToAdd.length > 0) {
      console.log(`📦 Insertando ${productsToAdd.length} productos de ejemplo...`);
      
      for (const product of productsToAdd) {
        try {
          await executeQueryRun(
            `INSERT INTO products (
              title, description, category, condition_product, transaction_type,
              price, location, user_email, user_name, views, favorites, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              product.title,
              product.description,
              product.category,
              product.condition_product,
              product.transaction_type,
              product.price,
              product.location,
              product.user_email,
              product.user_name,
              product.views,
              product.favorites,
              new Date().toISOString()
            ]
          );
        } catch (insertError) {
          // Ignorar errores de productos duplicados
          if (!insertError.message.includes('UNIQUE constraint failed')) {
            console.error('❌ Error creando producto:', insertError);
          }
        }
      }
      
      console.log(`✅ ${productsToAdd.length} productos de ejemplo agregados`);
    } else {
      console.log('✅ Todas las categorías tienen suficientes productos');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error en createSampleProducts:', error);
    return false;
  }
};

// Función para obtener productos de ejemplo por categoría
const getSampleProductsByCategory = (category, count) => {
  const allProducts = {
    'Electrónica': [
      {
        title: 'iPhone 12 en excelente estado',
        description: 'iPhone 12 de 128GB en color azul, sin rayones, con cargador original. Perfecto para estudiantes.',
        condition_product: 'excelente',
        transaction_type: 'venta',
        price: 450.00,
        location: 'Ciudad de México'
      },
      {
        title: 'Laptop Dell Inspiron 15',
        description: 'Laptop Dell Inspiron 15 pulgadas, Intel i5, 8GB RAM, 256GB SSD. Ideal para trabajo y estudio.',
        condition_product: 'muy_bueno',
        transaction_type: 'venta',
        price: 800.00,
        location: 'Guadalajara'
      },
      {
        title: 'Tablet Samsung Galaxy Tab A8',
        description: 'Tablet Samsung Galaxy Tab A8 de 10.5 pulgadas, 64GB, WiFi. Perfecta para lectura y entretenimiento.',
        condition_product: 'bueno',
        transaction_type: 'venta',
        price: 250.00,
        location: 'Monterrey'
      },
      {
        title: 'Auriculares Sony WH-1000XM4',
        description: 'Auriculares inalámbricos Sony con cancelación de ruido. Excelente calidad de sonido.',
        condition_product: 'excelente',
        transaction_type: 'venta',
        price: 300.00,
        location: 'Puebla'
      },
      {
        title: 'Smartwatch Apple Watch Series 6',
        description: 'Apple Watch Series 6 GPS, 44mm, caja de aluminio. Incluye correa deportiva.',
        condition_product: 'muy_bueno',
        transaction_type: 'intercambio',
        price: 0,
        location: 'Tijuana'
      },
      {
        title: 'Consola Nintendo Switch',
        description: 'Nintendo Switch con 3 juegos incluidos: Mario Kart, Zelda y Animal Crossing.',
        condition_product: 'bueno',
        transaction_type: 'venta',
        price: 600.00,
        location: 'Querétaro'
      }
    ],
    'Libros y educación': [
      {
        title: 'Libros de programación',
        description: 'Colección de libros sobre React, JavaScript y desarrollo web. Ideal para desarrolladores.',
        condition_product: 'muy_bueno',
        transaction_type: 'intercambio',
        price: 0,
        location: 'Ciudad de México'
      },
      {
        title: 'Libros de matemáticas universitarias',
        description: 'Set completo de libros de cálculo, álgebra lineal y estadística. Perfecto para estudiantes de ingeniería.',
        condition_product: 'bueno',
        transaction_type: 'venta',
        price: 150.00,
        location: 'Guadalajara'
      },
      {
        title: 'Enciclopedias médicas',
        description: 'Colección de enciclopedias médicas actualizadas. Ideal para estudiantes de medicina.',
        condition_product: 'excelente',
        transaction_type: 'donacion',
        price: 0,
        location: 'Monterrey'
      },
      {
        title: 'Libros de literatura clásica',
        description: 'Colección de obras maestras de la literatura mundial: Cervantes, Shakespeare, García Márquez.',
        condition_product: 'muy_bueno',
        transaction_type: 'venta',
        price: 80.00,
        location: 'Puebla'
      },
      {
        title: 'Material de estudio para TOEFL',
        description: 'Libros y CDs para preparación del examen TOEFL. Incluye ejercicios prácticos.',
        condition_product: 'bueno',
        transaction_type: 'venta',
        price: 120.00,
        location: 'Tijuana'
      },
      {
        title: 'Atlas y mapas geográficos',
        description: 'Atlas mundial y mapas detallados de México. Perfecto para estudiantes de geografía.',
        condition_product: 'aceptable',
        transaction_type: 'intercambio',
        price: 0,
        location: 'Querétaro'
      }
    ],
    'Deportes y recreación': [
      {
        title: 'Bicicleta de montaña Trek',
        description: 'Bicicleta de montaña Trek, perfecta para principiantes. Incluye casco y luces.',
        condition_product: 'bueno',
        transaction_type: 'venta',
        price: 1200.00,
        location: 'Ciudad de México'
      },
      {
        title: 'Set completo de golf',
        description: 'Set completo de golf con palos, bolsas y accesorios. Ideal para principiantes.',
        condition_product: 'muy_bueno',
        transaction_type: 'venta',
        price: 800.00,
        location: 'Guadalajara'
      },
      {
        title: 'Mancuernas y pesas',
        description: 'Set de mancuernas ajustables de 20kg. Perfecto para ejercicio en casa.',
        condition_product: 'excelente',
        transaction_type: 'venta',
        price: 300.00,
        location: 'Monterrey'
      },
      {
        title: 'Raquetas de tenis',
        description: 'Par de raquetas de tenis profesionales con fundas. Ideal para jugadores intermedios.',
        condition_product: 'bueno',
        transaction_type: 'intercambio',
        price: 0,
        location: 'Puebla'
      },
      {
        title: 'Tabla de surf',
        description: 'Tabla de surf de 9 pies, perfecta para principiantes. Incluye leash y wax.',
        condition_product: 'muy_bueno',
        transaction_type: 'venta',
        price: 400.00,
        location: 'Tijuana'
      },
      {
        title: 'Balón de fútbol oficial',
        description: 'Balón de fútbol oficial FIFA, tamaño 5. Perfecto para partidos y entrenamientos.',
        condition_product: 'excelente',
        transaction_type: 'venta',
        price: 80.00,
        location: 'Querétaro'
      }
    ],
    'Hogar y jardín': [
      {
        title: 'Muebles de oficina',
        description: 'Escritorio y silla de oficina en buen estado. Perfecto para trabajo remoto.',
        condition_product: 'bueno',
        transaction_type: 'donacion',
        price: 0,
        location: 'Ciudad de México'
      },
      {
        title: 'Sofá de 3 plazas',
        description: 'Sofá cómodo de 3 plazas en color gris. Perfecto para sala de estar.',
        condition_product: 'muy_bueno',
        transaction_type: 'venta',
        price: 500.00,
        location: 'Guadalajara'
      },
      {
        title: 'Mesa de comedor de madera',
        description: 'Mesa de comedor de madera maciza para 6 personas. Incluye 6 sillas.',
        condition_product: 'bueno',
        transaction_type: 'venta',
        price: 700.00,
        location: 'Monterrey'
      },
      {
        title: 'Plantas de interior',
        description: 'Colección de plantas de interior: suculentas, cactus y plantas de hoja verde.',
        condition_product: 'excelente',
        transaction_type: 'intercambio',
        price: 0,
        location: 'Puebla'
      },
      {
        title: 'Aspiradora Dyson',
        description: 'Aspiradora Dyson sin cable, perfecto estado. Ideal para limpieza profunda.',
        condition_product: 'muy_bueno',
        transaction_type: 'venta',
        price: 350.00,
        location: 'Tijuana'
      },
      {
        title: 'Juego de ollas y sartenes',
        description: 'Set completo de ollas y sartenes antiadherentes de acero inoxidable.',
        condition_product: 'bueno',
        transaction_type: 'venta',
        price: 200.00,
        location: 'Querétaro'
      }
    ],
    'Ropa y accesorios': [
      {
        title: 'Ropa vintage',
        description: 'Colección de ropa vintage de los 80s y 90s. Camisetas, jeans y chaquetas únicas.',
        condition_product: 'aceptable',
        transaction_type: 'venta',
        price: 200.00,
        location: 'Ciudad de México'
      },
      {
        title: 'Trajes de etiqueta',
        description: 'Trajes de etiqueta para hombre, tallas M y L. Perfectos para eventos formales.',
        condition_product: 'muy_bueno',
        transaction_type: 'venta',
        price: 300.00,
        location: 'Guadalajara'
      },
      {
        title: 'Zapatos deportivos Nike',
        description: 'Par de zapatos deportivos Nike Air Max, talla 9.5. Usados pero en buen estado.',
        condition_product: 'bueno',
        transaction_type: 'venta',
        price: 80.00,
        location: 'Monterrey'
      },
      {
        title: 'Bolsa de mano Louis Vuitton',
        description: 'Bolsa de mano Louis Vuitton auténtica. Perfecto para ocasiones especiales.',
        condition_product: 'excelente',
        transaction_type: 'venta',
        price: 800.00,
        location: 'Puebla'
      },
      {
        title: 'Ropa de bebé',
        description: 'Colección de ropa de bebé 0-12 meses. Incluye bodies, pijamas y accesorios.',
        condition_product: 'muy_bueno',
        transaction_type: 'donacion',
        price: 0,
        location: 'Tijuana'
      },
      {
        title: 'Relojes de pulsera',
        description: 'Colección de relojes de pulsera para hombre y mujer. Varias marcas y estilos.',
        condition_product: 'bueno',
        transaction_type: 'venta',
        price: 150.00,
        location: 'Querétaro'
      }
    ],
    'Juguetes y entretenimiento': [
      {
        title: 'Juguetes educativos',
        description: 'Set completo de juguetes educativos para niños de 3-6 años. Incluye puzzles y bloques.',
        condition_product: 'excelente',
        transaction_type: 'intercambio',
        price: 0,
        location: 'Ciudad de México'
      },
      {
        title: 'Lego Creator',
        description: 'Set de Lego Creator con más de 1000 piezas. Perfecto para construir diferentes modelos.',
        condition_product: 'muy_bueno',
        transaction_type: 'venta',
        price: 120.00,
        location: 'Guadalajara'
      },
      {
        title: 'Muñecas Barbie',
        description: 'Colección de muñecas Barbie con accesorios y ropa. Ideal para niñas de 5-10 años.',
        condition_product: 'bueno',
        transaction_type: 'venta',
        price: 60.00,
        location: 'Monterrey'
      },
      {
        title: 'Juegos de mesa',
        description: 'Colección de juegos de mesa: Monopoly, Scrabble, Clue y más. Perfecto para familias.',
        condition_product: 'muy_bueno',
        transaction_type: 'intercambio',
        price: 0,
        location: 'Puebla'
      },
      {
        title: 'Pista de carros Hot Wheels',
        description: 'Pista de carros Hot Wheels con 20 autos incluidos. Diversión garantizada.',
        condition_product: 'bueno',
        transaction_type: 'venta',
        price: 90.00,
        location: 'Tijuana'
      },
      {
        title: 'Instrumentos musicales para niños',
        description: 'Set de instrumentos musicales: piano pequeño, guitarra, tambor y maracas.',
        condition_product: 'excelente',
        transaction_type: 'venta',
        price: 180.00,
        location: 'Querétaro'
      }
    ]
  };
  
  const categoryProducts = allProducts[category] || [];
  const selectedProducts = categoryProducts.slice(0, count);
  
  // Agregar información común a cada producto
  return selectedProducts.map(product => ({
    ...product,
    category,
    user_email: 'admin@systemeco.com',
    user_name: 'Administrador',
    views: Math.floor(Math.random() * 20) + 5,
    favorites: Math.floor(Math.random() * 8) + 1
  }));
};

// Función para crear conversaciones de ejemplo
export const createSampleConversations = async () => {
  try {
    // Creando conversaciones de ejemplo
    
    // Verificar si ya hay conversaciones
    const existingConversations = await executeQuerySingle('SELECT COUNT(*) as count FROM conversations');
    if (existingConversations.data && existingConversations.data.count > 0) {
      // Conversaciones de ejemplo ya existen
      return true;
    }
    
    // Crear conversación de ejemplo
    const conversationResult = await executeQueryRun(
      'INSERT INTO conversations (buyer_id, seller_id, last_message, last_message_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [1, 2, '¡Hola! ¿Cómo estás?', new Date().toISOString(), new Date().toISOString(), new Date().toISOString()]
    );
    
    if (conversationResult.error) {
      console.error('❌ Error creando conversación:', conversationResult.error);
      return false;
    }
    
    const conversationId = conversationResult.data.lastInsertRowid;
    
    // Crear algunos mensajes de ejemplo
    const sampleMessages = [
      {
        conversation_id: conversationId,
        sender_id: 1,
        content: '¡Hola! ¿Cómo estás?',
        created_at: new Date(Date.now() - 3600000).toISOString() // 1 hora atrás
      },
      {
        conversation_id: conversationId,
        sender_id: 2,
        content: '¡Hola! Muy bien, gracias. ¿Y tú?',
        created_at: new Date(Date.now() - 3500000).toISOString() // 58 minutos atrás
      },
      {
        conversation_id: conversationId,
        sender_id: 1,
        content: 'Todo bien también. ¿Has visto los nuevos productos en la plataforma?',
        created_at: new Date(Date.now() - 3400000).toISOString() // 56 minutos atrás
      },
      {
        conversation_id: conversationId,
        sender_id: 2,
        content: 'Sí, hay algunos muy interesantes. Me gusta el iPhone que publicaste.',
        created_at: new Date(Date.now() - 3300000).toISOString() // 55 minutos atrás
      }
    ];
    
    // Insertar mensajes
    for (const message of sampleMessages) {
      const result = await executeQueryRun(
        'INSERT INTO messages (conversation_id, sender_id, content, created_at) VALUES (?, ?, ?, ?)',
        [message.conversation_id, message.sender_id, message.content, message.created_at]
      );
      
      if (result.error) {
        console.error('❌ Error creando mensaje:', result.error);
      }
    }
    
    // Conversaciones de ejemplo creadas exitosamente
    return true;
  } catch (error) {
    console.error('❌ Error en createSampleConversations:', error);
    return false;
  }
};

// Función para mostrar información de la base de datos
export const showDatabaseInfo = async () => {
  try {
    // Información de la base de datos
    
    // Contar usuarios
    const userCount = await executeQuerySingle('SELECT COUNT(*) as count FROM users');
    // Usuarios: ${userCount.data?.count || 0}
    
    // Contar productos
    const productCount = await executeQuerySingle('SELECT COUNT(*) as count FROM products');
    // Productos: ${productCount.data?.count || 0}
    
    // Productos por categoría
    const productsByCategory = await executeQueryRun(
      'SELECT category, COUNT(*) as count FROM products GROUP BY category'
    );
    // Productos por categoría
    if (productsByCategory.data && Array.isArray(productsByCategory.data)) {
      productsByCategory.data.forEach(row => {
        console.log(`  - ${row[0]}: ${row[1]}`);
      });
    }
    
    // Productos por tipo de transacción
    const productsByType = await executeQueryRun(
      'SELECT transaction_type, COUNT(*) as count FROM products GROUP BY transaction_type'
    );
    // Productos por tipo de transacción
    if (productsByType.data && Array.isArray(productsByType.data)) {
      productsByType.data.forEach(row => {
        console.log(`  - ${row[0]}: ${row[1]}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error mostrando información de la BD:', error);
  }
};
