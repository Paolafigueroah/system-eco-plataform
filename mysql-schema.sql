-- Script de configuración de MySQL para SYSTEM ECO
-- Ejecuta estos comandos en MySQL Workbench

-- 1. Crear la base de datos
CREATE DATABASE IF NOT EXISTS system_eco;
USE system_eco;

-- 2. Crear tabla de usuarios (para autenticación local)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Crear tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  condition_product VARCHAR(50) NOT NULL, -- Cambiado de 'condition' porque es palabra reservada
  transaction_type VARCHAR(50) NOT NULL,
  price DECIMAL(10,2),
  location VARCHAR(255),
  images JSON, -- MySQL 5.7+ soporta JSON
  user_id INT NOT NULL,
  user_email VARCHAR(255),
  user_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  views INT DEFAULT 0,
  favorites INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Crear tabla de conversaciones de chat
CREATE TABLE IF NOT EXISTS conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  participants JSON NOT NULL, -- Array de user_ids
  last_message TEXT,
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Crear tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_id INT NOT NULL,
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Crear tabla de archivos (para almacenamiento local)
CREATE TABLE IF NOT EXISTS files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INT NOT NULL,
  path VARCHAR(500) NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Crear índices para mejor rendimiento
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_users_email ON users(email);

-- 8. Insertar usuario administrador (opcional)
-- INSERT INTO users (email, password_hash, display_name) VALUES 
-- ('admin@systemeco.com', '$2b$10$hashedpassword', 'Administrador');

-- 9. Crear vistas útiles
CREATE VIEW active_products AS
SELECT p.*, u.display_name as seller_name
FROM products p
JOIN users u ON p.user_id = u.id
WHERE p.status = 'active';

CREATE VIEW user_stats AS
SELECT 
  u.id,
  u.display_name,
  u.email,
  COUNT(p.id) as total_products,
  SUM(CASE WHEN p.status = 'active' THEN 1 ELSE 0 END) as active_products,
  SUM(p.views) as total_views,
  SUM(p.favorites) as total_favorites
FROM users u
LEFT JOIN products p ON u.id = p.user_id
GROUP BY u.id, u.display_name, u.email;

-- 10. Crear procedimientos almacenados útiles
DELIMITER //

CREATE PROCEDURE GetProductsByCategory(IN category_name VARCHAR(100))
BEGIN
  SELECT * FROM products 
  WHERE category = category_name AND status = 'active'
  ORDER BY created_at DESC;
END //

CREATE PROCEDURE GetUserProducts(IN user_id_param INT)
BEGIN
  SELECT * FROM products 
  WHERE user_id = user_id_param
  ORDER BY created_at DESC;
END //

CREATE PROCEDURE UpdateProductViews(IN product_id_param INT)
BEGIN
  UPDATE products 
  SET views = views + 1 
  WHERE id = product_id_param;
END //

DELIMITER ;

-- 11. Crear triggers para auditoría
CREATE TRIGGER before_product_update
BEFORE UPDATE ON products
FOR EACH ROW
SET NEW.updated_at = CURRENT_TIMESTAMP;

CREATE TRIGGER before_conversation_update
BEFORE UPDATE ON conversations
FOR EACH ROW
SET NEW.updated_at = CURRENT_TIMESTAMP;

-- 12. Configurar permisos (ejecutar como root)
-- GRANT ALL PRIVILEGES ON system_eco.* TO 'root'@'localhost';
-- FLUSH PRIVILEGES;

-- 13. Verificar la creación
SHOW TABLES;
DESCRIBE products;
DESCRIBE users;
DESCRIBE conversations;
DESCRIBE messages;
DESCRIBE files;
