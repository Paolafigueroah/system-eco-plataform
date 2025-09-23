import mysql from 'mysql2/promise';

// Configuración de MySQL
const mysqlConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '120212paoFH',
  database: 'system_eco',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Crear pool de conexiones
const pool = mysql.createPool(mysqlConfig);

// Función para probar la conexión
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL exitosa');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    return false;
  }
};

// Función para obtener una conexión del pool
export const getConnection = async () => {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('Error obteniendo conexión:', error.message);
    throw error;
  }
};

// Función para ejecutar consultas
export const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params);
    return { data: rows, error: null };
  } catch (error) {
    console.error('Error ejecutando consulta:', error.message);
    return { data: null, error: error.message };
  }
};

// Función para ejecutar transacciones
export const executeTransaction = async (queries) => {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params = [] } of queries) {
      const [rows] = await connection.execute(query, params);
      results.push(rows);
    }
    
    await connection.commit();
    return { data: results, error: null };
  } catch (error) {
    await connection.rollback();
    console.error('Error en transacción:', error.message);
    return { data: null, error: error.message };
  } finally {
    connection.release();
  }
};

// Exportar el pool y funciones
export { pool };
export default pool;
