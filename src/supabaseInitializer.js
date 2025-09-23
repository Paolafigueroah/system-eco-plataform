import { supabase } from './supabaseConfig.js';
import { supabaseProductService } from './services/supabaseProductService.js';
import { supabaseAuthService } from './services/supabaseAuthService.js';

// Función para inicializar Supabase
export const initSupabase = async () => {
  try {
    console.log('🚀 Iniciando Supabase...');
    
    // Verificar conexión
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('❌ Error conectando a Supabase:', error);
      return false;
    }
    
    console.log('✅ Conexión a Supabase establecida');
    
    // Crear datos de ejemplo si es necesario
    await createSampleData();
    
    return true;
  } catch (error) {
    console.error('❌ Error inicializando Supabase:', error);
    return false;
  }
};

// Función para crear datos de ejemplo
export const createSampleData = async () => {
  try {
    console.log('📦 Verificando datos de ejemplo...');
    
    // Verificar si ya hay productos
    const { data: existingProducts } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (existingProducts && existingProducts.length > 0) {
      console.log('✅ Datos de ejemplo ya existen');
      return true;
    }
    
    console.log('📦 Creando datos de ejemplo...');
    
    // Crear productos de ejemplo
    const sampleProducts = [
      {
        title: 'iPhone 12 en excelente estado',
        description: 'iPhone 12 de 128GB en color azul, sin rayones, con cargador original. Perfecto para estudiantes.',
        category: 'Electrónica',
        condition_product: 'excelente',
        transaction_type: 'venta',
        price: 450.00,
        location: 'Ciudad de México',
        user_email: 'admin@systemeco.com',
        user_name: 'Administrador',
        views: 15,
        favorites: 3,
        status: 'active'
      },
      {
        title: 'Laptop Dell Inspiron 15',
        description: 'Laptop Dell Inspiron 15 pulgadas, Intel i5, 8GB RAM, 256GB SSD. Ideal para trabajo y estudio.',
        category: 'Electrónica',
        condition_product: 'muy_bueno',
        transaction_type: 'venta',
        price: 800.00,
        location: 'Guadalajara',
        user_email: 'admin@systemeco.com',
        user_name: 'Administrador',
        views: 22,
        favorites: 5,
        status: 'active'
      },
      {
        title: 'Libros de programación',
        description: 'Colección de libros sobre React, JavaScript y desarrollo web. Ideal para desarrolladores.',
        category: 'Libros y educación',
        condition_product: 'muy_bueno',
        transaction_type: 'intercambio',
        price: 0,
        location: 'Guadalajara',
        user_email: 'admin@systemeco.com',
        user_name: 'Administrador',
        views: 8,
        favorites: 1,
        status: 'active'
      },
      {
        title: 'Bicicleta de montaña Trek',
        description: 'Bicicleta de montaña Trek, perfecta para principiantes. Incluye casco y luces.',
        category: 'Deportes y recreación',
        condition_product: 'bueno',
        transaction_type: 'venta',
        price: 1200.00,
        location: 'Monterrey',
        user_email: 'admin@systemeco.com',
        user_name: 'Administrador',
        views: 18,
        favorites: 4,
        status: 'active'
      },
      {
        title: 'Muebles de oficina',
        description: 'Escritorio y silla de oficina en buen estado. Perfecto para trabajo remoto.',
        category: 'Hogar y jardín',
        condition_product: 'bueno',
        transaction_type: 'donacion',
        price: 0,
        location: 'Puebla',
        user_email: 'admin@systemeco.com',
        user_name: 'Administrador',
        views: 12,
        favorites: 2,
        status: 'active'
      },
      {
        title: 'Ropa vintage',
        description: 'Colección de ropa vintage de los 80s y 90s. Camisetas, jeans y chaquetas únicas.',
        category: 'Ropa y accesorios',
        condition_product: 'aceptable',
        transaction_type: 'venta',
        price: 200.00,
        location: 'Tijuana',
        user_email: 'admin@systemeco.com',
        user_name: 'Administrador',
        views: 16,
        favorites: 3,
        status: 'active'
      }
    ];
    
    // Insertar productos (sin user_id ya que no tenemos usuarios de prueba en Supabase)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .insert(sampleProducts)
      .select();
    
    if (productsError) {
      console.error('❌ Error creando productos de ejemplo:', productsError);
      return false;
    }
    
    console.log(`✅ ${products.length} productos de ejemplo creados`);
    
    return true;
  } catch (error) {
    console.error('❌ Error creando datos de ejemplo:', error);
    return false;
  }
};

// Función para crear usuarios de prueba (solo para desarrollo)
export const createTestUsers = async () => {
  try {
    console.log('👤 Creando usuarios de prueba...');
    
    // Verificar si ya existen usuarios de prueba
    const { data: existingUsers } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'admin@systemeco.com')
      .limit(1);
    
    if (existingUsers && existingUsers.length > 0) {
      console.log('✅ Usuarios de prueba ya existen');
      return true;
    }
    
    // Nota: En Supabase, los usuarios se crean a través del registro normal
    // No podemos crear usuarios de prueba directamente como en SQLite
    console.log('ℹ️ Para crear usuarios de prueba, regístrate normalmente en la aplicación');
    
    return true;
  } catch (error) {
    console.error('❌ Error creando usuarios de prueba:', error);
    return false;
  }
};

// Función para mostrar información de la base de datos
export const showDatabaseInfo = async () => {
  try {
    console.log('📊 Información de la base de datos Supabase:');
    
    // Contar productos
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📦 Productos: ${productCount || 0}`);
    
    // Productos por categoría
    const { data: productsByCategory } = await supabase
      .from('products')
      .select('category')
      .eq('status', 'active');
    
    if (productsByCategory) {
      const categoryCounts = productsByCategory.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📋 Productos por categoría:');
      Object.entries(categoryCounts).forEach(([category, count]) => {
        console.log(`  - ${category}: ${count}`);
      });
    }
    
    // Contar perfiles
    const { count: profileCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    console.log(`👤 Perfiles: ${profileCount || 0}`);
    
  } catch (error) {
    console.error('❌ Error mostrando información de la BD:', error);
  }
};

export default {
  initSupabase,
  createSampleData,
  createTestUsers,
  showDatabaseInfo
};
