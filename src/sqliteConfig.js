import initSqlJs from 'sql.js';

// Variable global para la base de datos
let db = null;

// Función para inicializar la base de datos
export const initDatabase = async () => {
  try {
    if (!db) {
      // Inicializar SQL.js
      const SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });
      
      // Intentar cargar base de datos existente desde IndexedDB
      let dbData = null;
      try {
        dbData = await loadDatabaseFromIndexedDB();
        if (dbData) {
          db = new SQL.Database(dbData);
        } else {
          db = new SQL.Database();
        }
      } catch (error) {
        db = new SQL.Database();
      }
      
      // Crear las tablas necesarias
      await createTables();
      
      // Guardar la base de datos en IndexedDB
      await saveDatabaseToIndexedDB();
      
      return true;
    }
    return true;
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
    return false;
  }
};

// Función para crear las tablas
const createTables = async () => {
  try {
    // Tabla de usuarios
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        display_name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de productos
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        condition_product TEXT,
        transaction_type TEXT,
        price REAL,
        location TEXT,
        user_id INTEGER,
        user_email TEXT,
        user_name TEXT,
        status TEXT DEFAULT 'active',
        views INTEGER DEFAULT 0,
        favorites INTEGER DEFAULT 0,
        images TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Tabla de archivos
    db.run(`
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        mime_type TEXT,
        size INTEGER,
        path TEXT NOT NULL,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Tabla de conversaciones
    db.run(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        buyer_id INTEGER NOT NULL,
        seller_id INTEGER NOT NULL,
        last_message TEXT,
        last_message_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id),
        FOREIGN KEY (buyer_id) REFERENCES users (id),
        FOREIGN KEY (seller_id) REFERENCES users (id)
      )
    `);

    // Tabla de mensajes
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        message_type TEXT DEFAULT 'text',
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations (id),
        FOREIGN KEY (sender_id) REFERENCES users (id)
      )
    `);

    // Tabla de favoritos
    db.run(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
        UNIQUE(user_id, product_id)
      )
    `);

    // Migrar esquema existente si es necesario
    await migrateSchema();
    
    // Tablas creadas exitosamente
  } catch (error) {
    console.error('❌ Error creando tablas:', error);
  }
};

// Función para migrar el esquema existente
const migrateSchema = async () => {
  try {
    console.log('🔄 Verificando migración de esquema...');
    
    // Limpiar tablas temporales que puedan haber quedado de intentos anteriores
    try {
      db.run('DROP TABLE IF EXISTS conversations_new');
      db.run('DROP TABLE IF EXISTS conversations_backup');
    } catch (e) {
      // Ignorar errores de limpieza
    }
    
    // Verificar si la tabla conversations tiene las columnas nuevas
    const tableInfo = db.exec("PRAGMA table_info(conversations)");
    
    if (tableInfo && tableInfo.length > 0) {
      const columns = tableInfo[0].columns;
      const hasBuyerId = columns.some(col => col[1] === 'buyer_id');
      const hasSellerId = columns.some(col => col[1] === 'seller_id');
      
      if (!hasBuyerId || !hasSellerId) {
        console.log('🔄 Migrando tabla conversations...');
        
        // Crear tabla temporal con el nuevo esquema
        db.run(`
          CREATE TABLE conversations_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            buyer_id INTEGER NOT NULL,
            seller_id INTEGER NOT NULL,
            last_message TEXT,
            last_message_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products (id),
            FOREIGN KEY (buyer_id) REFERENCES users (id),
            FOREIGN KEY (seller_id) REFERENCES users (id)
          )
        `);
        
        // Copiar datos existentes (si los hay) - solo campos que existen
        try {
          db.run(`
            INSERT INTO conversations_new (id, created_at, updated_at)
            SELECT id, 
                   COALESCE(created_at, CURRENT_TIMESTAMP),
                   COALESCE(updated_at, CURRENT_TIMESTAMP)
            FROM conversations
          `);
        } catch (e) {
          console.log('ℹ️ No se pudieron copiar datos existentes, continuando...');
        }
        
        // Eliminar tabla antigua y renombrar la nueva
        db.run('DROP TABLE conversations');
        db.run('ALTER TABLE conversations_new RENAME TO conversations');
        
        console.log('✅ Migración de conversations completada');
      } else {
        console.log('✅ Tabla conversations ya tiene el esquema correcto');
      }
    }
    
    // Verificar si la tabla messages existe y tiene el esquema correcto
    const messagesInfo = db.exec("PRAGMA table_info(messages)");
    if (!messagesInfo || messagesInfo.length === 0) {
      console.log('🔄 Creando tabla messages...');
      db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          conversation_id INTEGER NOT NULL,
          sender_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          message_type TEXT DEFAULT 'text',
          is_read BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (conversation_id) REFERENCES conversations (id),
          FOREIGN KEY (sender_id) REFERENCES users (id)
        )
      `);
      console.log('✅ Tabla messages creada');
    } else {
      console.log('✅ Tabla messages ya existe');
    }
    
  } catch (error) {
    console.error('❌ Error en migración de esquema:', error);
    
    // En caso de error, intentar limpiar y recrear desde cero
    try {
      console.log('🔄 Intentando limpieza completa...');
      db.run('DROP TABLE IF EXISTS conversations');
      db.run('DROP TABLE IF EXISTS conversations_new');
      db.run('DROP TABLE IF EXISTS conversations_backup');
      
      // Recrear tabla conversations con el esquema correcto
      db.run(`
        CREATE TABLE conversations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER,
          buyer_id INTEGER NOT NULL,
          seller_id INTEGER NOT NULL,
          last_message TEXT,
          last_message_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products (id),
          FOREIGN KEY (buyer_id) REFERENCES users (id),
          FOREIGN KEY (seller_id) REFERENCES users (id)
        )
      `);
      
      console.log('✅ Tabla conversations recreada exitosamente');
    } catch (cleanupError) {
      console.error('❌ Error en limpieza:', cleanupError);
    }
  }
};

// Función para probar la conexión
export const testConnection = async () => {
  try {
    if (!db) {
      await initDatabase();
    }
    
    const result = db.exec('SELECT 1 as test');
    if (result && result.length > 0) {
      console.log('✅ Conexión a SQLite exitosa');
      return true;
    } else {
      console.log('❌ Error en la conexión');
      return false;
    }
  } catch (error) {
    console.error('❌ Error conectando a SQLite:', error);
    return false;
  }
};

// Función para ejecutar consultas
export const executeQuery = (query, params = []) => {
  try {
    if (!db) {
      return { data: null, error: 'Base de datos no inicializada' };
    }
    
    // Usar prepare para consultas con parámetros
    const stmt = db.prepare(query);
    
    // Bind parameters if provided
    if (params && params.length > 0) {
      stmt.bind(params);
    }
    
    const result = [];
    while (stmt.step()) {
      result.push(stmt.getAsObject());
    }
    stmt.free();
    
    return { data: result || [], columns: [], error: null };
  } catch (error) {
    console.error('Error ejecutando consulta:', error);
    return { data: null, error: error.message };
  }
};

// Función para ejecutar consultas que retornan un solo resultado
export const executeQuerySingle = (query, params = []) => {
  try {
    if (!db) {
      return { data: null, error: 'Base de datos no inicializada' };
    }
    
    // Usar prepare para consultas con parámetros
    const stmt = db.prepare(query);
    
    // Bind parameters if provided
    if (params && params.length > 0) {
      stmt.bind(params);
    }
    
    let result = null;
    if (stmt.step()) {
      result = stmt.getAsObject();
    }
    stmt.free();
    
    return { data: result || null, error: null };
  } catch (error) {
    console.error('Error ejecutando consulta:', error);
    return { data: null, error: error.message };
  }
};

// Función para ejecutar consultas de inserción/actualización/eliminación
export const executeQueryRun = async (query, params = []) => {
  try {
    if (!db) {
      return { data: null, error: 'Base de datos no inicializada' };
    }
    
    // Usar prepare para consultas con parámetros
    const stmt = db.prepare(query);
    stmt.run(params);
    
    const lastInsertRowid = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
    const changes = db.exec('SELECT changes()')[0].values[0][0];
    
    stmt.free();
    
    // Guardar automáticamente después de operaciones de escritura
    await autoSave();
    
    return { 
      data: { 
        lastInsertRowid: lastInsertRowid, 
        changes: changes
      }, 
      error: null 
    };
  } catch (error) {
    // Solo mostrar errores que no sean UNIQUE constraint failed
    if (!error.message.includes('UNIQUE constraint failed')) {
      console.error('Error ejecutando consulta:', error);
    }
    return { data: null, error: error.message };
  }
};

// Función para ejecutar transacciones
export const executeTransaction = async (queries) => {
  try {
    if (!db) {
      return { data: null, error: 'Base de datos no inicializada' };
    }
    
    db.exec('BEGIN TRANSACTION');
    
    const results = [];
    for (const query of queries) {
      const result = db.exec(query.sql, query.params || []);
      results.push(result);
    }
    
    db.exec('COMMIT');
    
    // Guardar automáticamente después de la transacción
    await autoSave();
    
    return { data: results, error: null };
  } catch (error) {
    db.exec('ROLLBACK');
    console.error('Error en transacción:', error);
    return { data: null, error: error.message };
  }
};

// Función para inicializar la base de datos
export const initializeDatabase = async () => {
  return await initDatabase();
};

// Función para cerrar la base de datos
export const closeDatabase = () => {
  if (db) {
    db.close();
    db = null;
    console.log('✅ Base de datos cerrada');
  }
};

// Función para exportar la base de datos como archivo
export const exportDatabase = () => {
  if (db) {
    const data = db.export();
    const blob = new Blob([data], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'system_eco.db';
    a.click();
    
    URL.revokeObjectURL(url);
    return true;
  }
  return false;
};

// Función para importar base de datos desde archivo
export const importDatabase = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    if (db) {
      db.close();
    }
    
    db = new (await initSqlJs()).Database(uint8Array);
    console.log('✅ Base de datos importada exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error importando base de datos:', error);
    return false;
  }
};

// Funciones para manejar IndexedDB (persistencia)
const DB_NAME = 'SystemEcoDB';
const DB_VERSION = 1;
const STORE_NAME = 'sqlite';

// Función para abrir IndexedDB
const openIndexedDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

// Función para cargar base de datos desde IndexedDB
const loadDatabaseFromIndexedDB = async () => {
  try {
    const indexedDB = await openIndexedDB();
    const transaction = indexedDB.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get('database');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.log('No se pudo cargar la base de datos desde IndexedDB:', error);
    return null;
  }
};

// Función para guardar base de datos en IndexedDB
const saveDatabaseToIndexedDB = async () => {
  try {
    if (!db) return false;
    
    const data = db.export();
    const indexedDB = await openIndexedDB();
    const transaction = indexedDB.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.put(data, 'database');
      request.onsuccess = () => {
        // Base de datos guardada en IndexedDB
        resolve(true);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error guardando en IndexedDB:', error);
    return false;
  }
};

// Función para guardar automáticamente después de operaciones
export const autoSave = async () => {
  if (db) {
    await saveDatabaseToIndexedDB();
  }
};
