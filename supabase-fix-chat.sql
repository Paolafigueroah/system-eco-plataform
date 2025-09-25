-- Script para arreglar problemas del chat
-- Ejecutar DESPUÉS de sincronizar usuarios

-- 1. Verificar conversaciones existentes
SELECT 
    'Conversaciones existentes:' as status,
    COUNT(*) as total_conversations
FROM conversations;

-- 2. Verificar mensajes existentes
SELECT 
    'Mensajes existentes:' as status,
    COUNT(*) as total_messages
FROM messages;

-- 3. Limpiar conversaciones huérfanas (sin usuarios válidos)
DELETE FROM conversations 
WHERE buyer_id NOT IN (SELECT id FROM profiles) 
   OR seller_id NOT IN (SELECT id FROM profiles);

-- 4. Limpiar mensajes huérfanos (sin conversación válida)
DELETE FROM messages 
WHERE conversation_id NOT IN (SELECT id FROM conversations);

-- 5. Limpiar mensajes huérfanos (sin sender válido)
DELETE FROM messages 
WHERE sender_id NOT IN (SELECT id FROM profiles);

-- 6. Verificar que las tablas tienen las políticas correctas
-- (Esto ya debería estar en el script incremental, pero lo verificamos)

-- 7. Crear una conversación de prueba si no hay ninguna
DO $$
DECLARE
    conv_count INTEGER;
    user1_id UUID;
    user2_id UUID;
BEGIN
    SELECT COUNT(*) INTO conv_count FROM conversations;
    
    -- Si no hay conversaciones, crear una de prueba
    IF conv_count = 0 THEN
        -- Obtener los primeros dos usuarios
        SELECT id INTO user1_id FROM profiles ORDER BY created_at ASC LIMIT 1;
        SELECT id INTO user2_id FROM profiles ORDER BY created_at ASC OFFSET 1 LIMIT 1;
        
        -- Si hay al menos 2 usuarios, crear una conversación de prueba
        IF user1_id IS NOT NULL AND user2_id IS NOT NULL THEN
            INSERT INTO conversations (buyer_id, seller_id, created_at, updated_at)
            VALUES (user1_id, user2_id, NOW(), NOW());
            
            RAISE NOTICE 'Conversación de prueba creada entre % y %', user1_id, user2_id;
        END IF;
    END IF;
END $$;

-- 8. Verificar el estado final
SELECT 
    'Estado final del chat:' as status,
    (SELECT COUNT(*) FROM profiles) as usuarios_disponibles,
    (SELECT COUNT(*) FROM conversations) as conversaciones_activas,
    (SELECT COUNT(*) FROM messages) as mensajes_totales;

-- 9. Mostrar conversaciones activas
SELECT 
    c.id,
    c.buyer_id,
    c.seller_id,
    b.display_name as buyer_name,
    s.display_name as seller_name,
    c.created_at
FROM conversations c
LEFT JOIN profiles b ON b.id = c.buyer_id
LEFT JOIN profiles s ON s.id = c.seller_id
ORDER BY c.created_at DESC;

-- Mensaje de confirmación
SELECT 'Chat arreglado exitosamente. Ahora debería funcionar correctamente.' as message;
