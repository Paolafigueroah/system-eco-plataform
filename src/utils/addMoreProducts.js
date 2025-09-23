// Función para agregar más productos a SQLite
export const addMoreProducts = async (sqliteConfig) => {
  const additionalProducts = {
    'Electrónica': [
      {
        title: 'iPhone 12 Pro',
        description: 'iPhone 12 Pro en excelente estado, 128GB, color azul pacífico. Incluye cargador original.',
        condition_product: 'excelente',
        transaction_type: 'venta',
        price: 8000.00,
        location: 'Ciudad de México'
      },
      {
        title: 'MacBook Air M1',
        description: 'MacBook Air con chip M1, 256GB SSD, 8GB RAM. Perfecto para estudiantes y profesionales.',
        condition_product: 'muy_bueno',
        transaction_type: 'venta',
        price: 15000.00,
        location: 'Guadalajara'
      },
      {
        title: 'AirPods Pro',
        description: 'AirPods Pro con cancelación de ruido activa. Incluye estuche de carga.',
        condition_product: 'bueno',
        transaction_type: 'venta',
        price: 3000.00,
        location: 'Monterrey'
      },
      {
        title: 'Samsung Galaxy S21',
        description: 'Samsung Galaxy S21 Ultra, 256GB, color negro. Incluye cargador y auriculares.',
        condition_product: 'excelente',
        transaction_type: 'intercambio',
        price: 0,
        location: 'Puebla'
      },
      {
        title: 'iPad Air 4ta Gen',
        description: 'iPad Air 4ta generación, 64GB, color rosa. Perfecto para dibujo y productividad.',
        condition_product: 'muy_bueno',
        transaction_type: 'venta',
        price: 6000.00,
        location: 'Tijuana'
      },
      {
        title: 'Nintendo Switch',
        description: 'Nintendo Switch con Joy-Cons, incluye 3 juegos: Mario Kart, Zelda y Animal Crossing.',
        condition_product: 'bueno',
        transaction_type: 'venta',
        price: 4500.00,
        location: 'Querétaro'
      },
      {
        title: 'PlayStation 5',
        description: 'PlayStation 5 con control DualSense, incluye Spider-Man: Miles Morales.',
        condition_product: 'excelente',
        transaction_type: 'intercambio',
        price: 0,
        location: 'Ciudad de México'
      },
      {
        title: 'Smartwatch Apple Watch',
        description: 'Apple Watch Series 6, GPS, 44mm, color azul. Incluye correa deportiva.',
        condition_product: 'muy_bueno',
        transaction_type: 'venta',
        price: 4000.00,
        location: 'Guadalajara'
      },
      {
        title: 'Cámara Canon EOS',
        description: 'Cámara Canon EOS Rebel T7i con lente 18-55mm. Perfecta para fotografía amateur.',
        condition_product: 'bueno',
        transaction_type: 'venta',
        price: 5500.00,
        location: 'Monterrey'
      },
      {
        title: 'Auriculares Sony WH-1000XM4',
        description: 'Auriculares inalámbricos Sony con cancelación de ruido. Excelente calidad de sonido.',
        condition_product: 'excelente',
        transaction_type: 'venta',
        price: 3500.00,
        location: 'Puebla'
      }
    ],
    'Libros y educación': [
      {
        title: 'Calculus: Early Transcendentals',
        description: 'Libro de cálculo universitario, 8va edición. En excelente estado, sin subrayados.',
        condition_product: 'excelente',
        transaction_type: 'venta',
        price: 800.00,
        location: 'Ciudad de México'
      },
      {
        title: 'Python Crash Course',
        description: 'Libro para aprender Python desde cero. Incluye ejercicios prácticos y proyectos.',
        condition_product: 'muy_bueno',
        transaction_type: 'intercambio',
        price: 0,
        location: 'Guadalajara'
      },
      {
        title: 'The Great Gatsby',
        description: 'Novela clásica de F. Scott Fitzgerald, edición especial con notas críticas.',
        condition_product: 'bueno',
        transaction_type: 'venta',
        price: 150.00,
        location: 'Monterrey'
      },
      {
        title: 'Clean Code',
        description: 'Libro sobre mejores prácticas de programación por Robert C. Martin.',
        condition_product: 'excelente',
        transaction_type: 'venta',
        price: 600.00,
        location: 'Puebla'
      },
      {
        title: 'Sapiens: De animales a dioses',
        description: 'Libro de Yuval Noah Harari sobre la historia de la humanidad.',
        condition_product: 'muy_bueno',
        transaction_type: 'donacion',
        price: 0,
        location: 'Tijuana'
      },
      {
        title: 'El Principito',
        description: 'Edición ilustrada de El Principito de Antoine de Saint-Exupéry.',
        condition_product: 'bueno',
        transaction_type: 'venta',
        price: 200.00,
        location: 'Querétaro'
      },
      {
        title: 'Harry Potter y la Piedra Filosofal',
        description: 'Primera edición de Harry Potter en español, con ilustraciones originales.',
        condition_product: 'excelente',
        transaction_type: 'venta',
        price: 400.00,
        location: 'Ciudad de México'
      },
      {
        title: 'Cien años de soledad',
        description: 'Novela de Gabriel García Márquez, edición conmemorativa.',
        condition_product: 'muy_bueno',
        transaction_type: 'intercambio',
        price: 0,
        location: 'Guadalajara'
      },
      {
        title: 'Design Patterns',
        description: 'Libro clásico sobre patrones de diseño en programación.',
        condition_product: 'bueno',
        transaction_type: 'venta',
        price: 700.00,
        location: 'Monterrey'
      },
      {
        title: '1984',
        description: 'Novela distópica de George Orwell, edición especial.',
        condition_product: 'excelente',
        transaction_type: 'venta',
        price: 250.00,
        location: 'Puebla'
      }
    ],
    'Deportes y recreación': [
      {
        title: 'Bicicleta de montaña',
        description: 'Bicicleta de montaña Trek, 21 velocidades, perfecta para senderos.',
        condition_product: 'muy_bueno',
        transaction_type: 'venta',
        price: 3500.00,
        location: 'Ciudad de México'
      },
      {
        title: 'Set de pesas ajustables',
        description: 'Set de pesas ajustables de 2.5kg a 25kg. Incluye barra y discos.',
        condition_product: 'bueno',
        transaction_type: 'venta',
        price: 1200.00,
        location: 'Guadalajara'
      },
      {
        title: 'Raqueta de tenis',
        description: 'Raqueta de tenis Wilson Pro Staff, perfecta para jugadores intermedios.',
        condition_product: 'excelente',
        transaction_type: 'intercambio',
        price: 0,
        location: 'Monterrey'
      },
      {
        title: 'Mesa de ping pong',
        description: 'Mesa de ping pong plegable, perfecta para el hogar. Incluye redes y paletas.',
        condition_product: 'muy_bueno',
        transaction_type: 'venta',
        price: 2500.00,
        location: 'Puebla'
      },
      {
        title: 'Casco de ciclismo',
        description: 'Casco de ciclismo Giro, talla M, color negro. Certificado de seguridad.',
        condition_product: 'bueno',
        transaction_type: 'venta',
        price: 400.00,
        location: 'Tijuana'
      },
      {
        title: 'Pelota de fútbol',
        description: 'Pelota de fútbol oficial Nike, talla 5, perfecta para partidos.',
        condition_product: 'excelente',
        transaction_type: 'donacion',
        price: 0,
        location: 'Querétaro'
      },
      {
        title: 'Tabla de surf',
        description: 'Tabla de surf de 8 pies, ideal para principiantes. Incluye leash.',
        condition_product: 'muy_bueno',
        transaction_type: 'venta',
        price: 1800.00,
        location: 'Ciudad de México'
      },
      {
        title: 'Guantes de boxeo',
        description: 'Guantes de boxeo Everlast, 16oz, perfectos para entrenamiento.',
        condition_product: 'bueno',
        transaction_type: 'venta',
        price: 600.00,
        location: 'Guadalajara'
      },
      {
        title: 'Mochila de senderismo',
        description: 'Mochila de senderismo Osprey, 40L, perfecta para trekking.',
        condition_product: 'excelente',
        transaction_type: 'intercambio',
        price: 0,
        location: 'Monterrey'
      },
      {
        title: 'Cuerda para escalada',
        description: 'Cuerda de escalada de 60m, 10.2mm, certificada UIAA.',
        condition_product: 'muy_bueno',
        transaction_type: 'venta',
        price: 800.00,
        location: 'Puebla'
      }
    ]
  };

  try {
    console.log('📦 Agregando productos adicionales...');
    
    for (const [category, products] of Object.entries(additionalProducts)) {
      console.log(`📋 ${category}: Agregando ${products.length} productos...`);
      
      for (const product of products) {
        const productData = {
          ...product,
          category,
          user_id: 1, // Usuario admin
          user_email: 'admin@systemeco.com',
          user_name: 'Admin',
          status: 'active',
          views: Math.floor(Math.random() * 100),
          favorites: Math.floor(Math.random() * 20),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        await sqliteConfig.executeQuery(
          `INSERT INTO products (title, description, category, condition_product, transaction_type, price, location, user_id, user_email, user_name, status, views, favorites, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            productData.title,
            productData.description,
            productData.category,
            productData.condition_product,
            productData.transaction_type,
            productData.price,
            productData.location,
            productData.user_id,
            productData.user_email,
            productData.user_name,
            productData.status,
            productData.views,
            productData.favorites,
            productData.created_at,
            productData.updated_at
          ]
        );
      }
    }
    
    console.log('✅ Productos adicionales agregados exitosamente');
    return { success: true, message: 'Productos adicionales agregados' };
  } catch (error) {
    console.error('❌ Error agregando productos adicionales:', error);
    return { success: false, error: error.message };
  }
};
