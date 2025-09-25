import { supabase, supabaseUtils } from '../supabaseConfig.js';

// Servicio para manejar mensajes de contacto
export const supabaseContactService = {
  // Enviar mensaje de contacto
  sendContactMessage: async (contactData) => {
    try {
      console.log('📧 Supabase: Enviando mensaje de contacto...', contactData);
      
      const { data, error } = await supabase
        .from('contact_messages')
        .insert({
          name: contactData.name,
          email: contactData.email,
          subject: contactData.subject,
          message: contactData.message,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Mensaje de contacto enviado');
    } catch (error) {
      console.error('📧 Error enviando mensaje de contacto:', error);
      return supabaseUtils.handleError(error, 'Enviar mensaje de contacto');
    }
  },

  // Obtener mensajes de contacto (para admin)
  getContactMessages: async (limit = 50) => {
    try {
      console.log('📧 Supabase: Obteniendo mensajes de contacto...');
      
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return supabaseUtils.handleSuccess(data, 'Obtener mensajes de contacto');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Obtener mensajes de contacto');
    }
  },

  // Marcar mensaje como leído
  markAsRead: async (messageId) => {
    try {
      console.log('📧 Supabase: Marcando mensaje como leído...', messageId);
      
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: 'read', read_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;

      return supabaseUtils.handleSuccess(null, 'Mensaje marcado como leído');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Marcar mensaje como leído');
    }
  },

  // Responder mensaje
  respondToMessage: async (messageId, response) => {
    try {
      console.log('📧 Supabase: Respondiendo mensaje...', { messageId, response });
      
      const { error } = await supabase
        .from('contact_messages')
        .update({ 
          status: 'responded', 
          response: response,
          responded_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;

      return supabaseUtils.handleSuccess(null, 'Respuesta enviada');
    } catch (error) {
      return supabaseUtils.handleError(error, 'Responder mensaje');
    }
  }
};

export default supabaseContactService;
