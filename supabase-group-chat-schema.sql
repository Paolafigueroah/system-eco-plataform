-- Schema para chat grupal
-- Ejecutar en Supabase SQL Editor

-- Agregar columna para tipo de conversación
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS conversation_type VARCHAR(20) DEFAULT 'private' CHECK (conversation_type IN ('private', 'group'));

-- Agregar columna para nombre del grupo
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS group_name TEXT;

-- Agregar columna para descripción del grupo
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS group_description TEXT;

-- Agregar columna para imagen del grupo
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS group_image_url TEXT;

-- Agregar columna para administrador del grupo
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS group_admin_id UUID REFERENCES profiles(id);

-- Crear tabla para participantes de grupos
CREATE TABLE IF NOT EXISTS group_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Un usuario solo puede estar una vez en cada grupo
    UNIQUE(conversation_id, user_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_group_participants_conversation_id ON group_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_group_participants_user_id ON group_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(conversation_type);
CREATE INDEX IF NOT EXISTS idx_conversations_group_admin ON conversations(group_admin_id);

-- Función para crear conversación grupal
CREATE OR REPLACE FUNCTION create_group_conversation(
    group_name_param TEXT,
    group_description_param TEXT,
    admin_id_param UUID,
    participant_ids UUID[]
)
RETURNS UUID AS $$
DECLARE
    conversation_id UUID;
    participant_id UUID;
BEGIN
    -- Crear la conversación
    INSERT INTO conversations (
        conversation_type,
        group_name,
        group_description,
        group_admin_id,
        created_at,
        updated_at
    ) VALUES (
        'group',
        group_name_param,
        group_description_param,
        admin_id_param,
        NOW(),
        NOW()
    ) RETURNING id INTO conversation_id;

    -- Agregar el administrador como participante
    INSERT INTO group_participants (conversation_id, user_id, role)
    VALUES (conversation_id, admin_id_param, 'admin');

    -- Agregar otros participantes
    FOREACH participant_id IN ARRAY participant_ids
    LOOP
        IF participant_id != admin_id_param THEN
            INSERT INTO group_participants (conversation_id, user_id, role)
            VALUES (conversation_id, participant_id, 'member');
        END IF;
    END LOOP;

    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para agregar participante a grupo
CREATE OR REPLACE FUNCTION add_group_participant(
    conversation_id_param UUID,
    user_id_param UUID,
    inviter_id_param UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN;
    conversation_type_check VARCHAR(20);
BEGIN
    -- Verificar que la conversación es un grupo
    SELECT conversation_type INTO conversation_type_check
    FROM conversations
    WHERE id = conversation_id_param;

    IF conversation_type_check != 'group' THEN
        RAISE EXCEPTION 'La conversación no es un grupo';
    END IF;

    -- Verificar que el inviter es admin o moderador
    SELECT EXISTS(
        SELECT 1 FROM group_participants
        WHERE conversation_id = conversation_id_param
        AND user_id = inviter_id_param
        AND role IN ('admin', 'moderator')
    ) INTO is_admin;

    IF NOT is_admin THEN
        RAISE EXCEPTION 'Solo administradores y moderadores pueden agregar participantes';
    END IF;

    -- Agregar participante
    INSERT INTO group_participants (conversation_id, user_id, role)
    VALUES (conversation_id_param, user_id_param, 'member')
    ON CONFLICT (conversation_id, user_id) DO NOTHING;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para remover participante de grupo
CREATE OR REPLACE FUNCTION remove_group_participant(
    conversation_id_param UUID,
    user_id_param UUID,
    remover_id_param UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN;
    target_role VARCHAR(20);
    remover_role VARCHAR(20);
BEGIN
    -- Verificar que el remover es admin o moderador
    SELECT role INTO remover_role
    FROM group_participants
    WHERE conversation_id = conversation_id_param
    AND user_id = remover_id_param;

    IF remover_role NOT IN ('admin', 'moderator') THEN
        RAISE EXCEPTION 'Solo administradores y moderadores pueden remover participantes';
    END IF;

    -- Obtener rol del usuario a remover
    SELECT role INTO target_role
    FROM group_participants
    WHERE conversation_id = conversation_id_param
    AND user_id = user_id_param;

    -- Los moderadores no pueden remover admins
    IF remover_role = 'moderator' AND target_role = 'admin' THEN
        RAISE EXCEPTION 'Los moderadores no pueden remover administradores';
    END IF;

    -- Remover participante
    DELETE FROM group_participants
    WHERE conversation_id = conversation_id_param
    AND user_id = user_id_param;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies para group_participants
ALTER TABLE group_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group participants are viewable by group members" ON group_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_participants gp
            WHERE gp.conversation_id = group_participants.conversation_id
            AND gp.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage group participants" ON group_participants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM group_participants gp
            WHERE gp.conversation_id = group_participants.conversation_id
            AND gp.user_id = auth.uid()
            AND gp.role IN ('admin', 'moderator')
        )
    );

-- Actualizar políticas de conversations para grupos
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations" ON conversations
    FOR SELECT USING (
        conversation_type = 'private' AND (
            user1_id = auth.uid() OR user2_id = auth.uid()
        )
        OR
        conversation_type = 'group' AND EXISTS (
            SELECT 1 FROM group_participants gp
            WHERE gp.conversation_id = conversations.id
            AND gp.user_id = auth.uid()
        )
    );

-- Función para obtener conversaciones del usuario (incluyendo grupos)
CREATE OR REPLACE FUNCTION get_user_conversations(user_id_param UUID)
RETURNS TABLE (
    id UUID,
    conversation_type VARCHAR(20),
    group_name TEXT,
    group_description TEXT,
    group_image_url TEXT,
    group_admin_id UUID,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    other_user_id UUID,
    other_user_name TEXT,
    other_user_email TEXT,
    participant_count BIGINT,
    unread_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.conversation_type,
        c.group_name,
        c.group_description,
        c.group_image_url,
        c.group_admin_id,
        c.last_message,
        c.last_message_at,
        c.created_at,
        c.updated_at,
        CASE 
            WHEN c.conversation_type = 'private' THEN
                CASE 
                    WHEN c.user1_id = user_id_param THEN c.user2_id
                    ELSE c.user1_id
                END
            ELSE NULL
        END as other_user_id,
        CASE 
            WHEN c.conversation_type = 'private' THEN
                CASE 
                    WHEN c.user1_id = user_id_param THEN p2.display_name
                    ELSE p1.display_name
                END
            ELSE c.group_name
        END as other_user_name,
        CASE 
            WHEN c.conversation_type = 'private' THEN
                CASE 
                    WHEN c.user1_id = user_id_param THEN p2.email
                    ELSE p1.email
                END
            ELSE NULL
        END as other_user_email,
        CASE 
            WHEN c.conversation_type = 'group' THEN
                (SELECT COUNT(*) FROM group_participants gp WHERE gp.conversation_id = c.id)
            ELSE 2
        END as participant_count,
        COALESCE(
            (SELECT COUNT(*) FROM messages m 
             WHERE m.conversation_id = c.id 
             AND m.sender_id != user_id_param
             AND NOT EXISTS (
                 SELECT 1 FROM message_reads mr 
                 WHERE mr.message_id = m.id 
                 AND mr.user_id = user_id_param
             )), 0
        ) as unread_count
    FROM conversations c
    LEFT JOIN profiles p1 ON c.user1_id = p1.id
    LEFT JOIN profiles p2 ON c.user2_id = p2.id
    WHERE 
        (c.conversation_type = 'private' AND (c.user1_id = user_id_param OR c.user2_id = user_id_param))
        OR
        (c.conversation_type = 'group' AND EXISTS (
            SELECT 1 FROM group_participants gp
            WHERE gp.conversation_id = c.id
            AND gp.user_id = user_id_param
        ))
    ORDER BY c.last_message_at DESC NULLS LAST, c.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios para documentación
COMMENT ON TABLE group_participants IS 'Participantes de conversaciones grupales';
COMMENT ON FUNCTION create_group_conversation(TEXT, TEXT, UUID, UUID[]) IS 'Crea una nueva conversación grupal con participantes';
COMMENT ON FUNCTION add_group_participant(UUID, UUID, UUID) IS 'Agrega un participante a un grupo';
COMMENT ON FUNCTION remove_group_participant(UUID, UUID, UUID) IS 'Remueve un participante de un grupo';
COMMENT ON FUNCTION get_user_conversations(UUID) IS 'Obtiene todas las conversaciones del usuario (privadas y grupales)';
