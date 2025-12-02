-- =====================================================
-- HABILITAR REALTIME EN SUPABASE
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Habilitar Realtime para la tabla messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Habilitar Realtime para la tabla conversations
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Habilitar Realtime para la tabla message_reads (opcional, para actualizaciones de estado)
ALTER PUBLICATION supabase_realtime ADD TABLE message_reads;

-- Verificar que las tablas están en la publicación
SELECT 
    schemaname,
    tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
    AND tablename IN ('messages', 'conversations', 'message_reads');

-- Nota: Si las tablas no aparecen, ejecuta:
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
-- ALTER PUBLICATION supabase_realtime ADD TABLE message_reads;

