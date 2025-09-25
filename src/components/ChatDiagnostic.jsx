import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseConfig';
import { supabaseChatService } from '../services/supabaseChatService';
import { useAuth } from '../hooks/useAuth';

const ChatDiagnostic = () => {
  const { user } = useAuth();
  const [diagnosticData, setDiagnosticData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      runDiagnostic();
    }
  }, [user]);

  const runDiagnostic = async () => {
    try {
      setLoading(true);
      const data = {};

      // 1. Verificar usuario actual
      data.currentUser = {
        id: user?.id,
        email: user?.email,
        metadata: user?.user_metadata
      };

      // 2. Verificar conexión a Supabase
      try {
        const { data: testData, error: testError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        data.supabaseConnection = {
          success: !testError,
          error: testError?.message
        };
      } catch (error) {
        data.supabaseConnection = {
          success: false,
          error: error.message
        };
      }

      // 3. Verificar usuarios en profiles
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, email, created_at')
          .order('created_at', { ascending: false });
        
        data.profiles = {
          success: !profilesError,
          count: profiles?.length || 0,
          data: profiles || [],
          error: profilesError?.message
        };
      } catch (error) {
        data.profiles = {
          success: false,
          count: 0,
          data: [],
          error: error.message
        };
      }

      // 4. Verificar conversaciones
      try {
        const result = await supabaseChatService.getUserConversations(user.id);
        data.conversations = {
          success: result.success,
          count: result.data?.length || 0,
          data: result.data || [],
          error: result.error
        };
      } catch (error) {
        data.conversations = {
          success: false,
          count: 0,
          data: [],
          error: error.message
        };
      }

      // 5. Verificar usuarios disponibles para chat
      try {
        const result = await supabaseChatService.getAllUsers(user.id);
        data.availableUsers = {
          success: result.success,
          count: result.data?.length || 0,
          data: result.data || [],
          error: result.error
        };
      } catch (error) {
        data.availableUsers = {
          success: false,
          count: 0,
          data: [],
          error: error.message
        };
      }

      // 6. Verificar RLS policies
      try {
        const { data: policies, error: policiesError } = await supabase
          .rpc('get_table_policies', { table_name: 'profiles' });
        data.rlsPolicies = {
          success: !policiesError,
          data: policies || [],
          error: policiesError?.message
        };
      } catch (error) {
        data.rlsPolicies = {
          success: false,
          data: [],
          error: error.message
        };
      }

      setDiagnosticData(data);
    } catch (error) {
      console.error('Error en diagnóstico:', error);
      setDiagnosticData({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testCreateConversation = async () => {
    if (!diagnosticData.availableUsers?.data?.length) {
      alert('No hay usuarios disponibles para crear conversación');
      return;
    }

    const otherUser = diagnosticData.availableUsers.data[0];
    try {
      const result = await supabaseChatService.createConversation(user.id, otherUser.id, null);
      alert(`Resultado: ${result.success ? 'Éxito' : 'Error'}\nMensaje: ${result.message}\nError: ${result.error || 'N/A'}`);
    } catch (error) {
      alert(`Error creando conversación: ${error.message}`);
    }
  };

  const testSendMessage = async () => {
    if (!diagnosticData.conversations?.data?.length) {
      alert('No hay conversaciones disponibles para enviar mensaje');
      return;
    }

    const conversation = diagnosticData.conversations.data[0];
    try {
      const result = await supabaseChatService.sendMessage(conversation.id, user.id, 'Mensaje de prueba');
      alert(`Resultado: ${result.success ? 'Éxito' : 'Error'}\nMensaje: ${result.message}\nError: ${result.error || 'N/A'}`);
    } catch (error) {
      alert(`Error enviando mensaje: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="loading loading-spinner loading-lg"></div>
        <p>Ejecutando diagnóstico...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold mb-4">🔍 Diagnóstico del Chat</h2>
      
      {/* Usuario actual */}
      <div className="card bg-base-200 p-4">
        <h3 className="text-lg font-semibold mb-2">👤 Usuario Actual</h3>
        <pre className="text-sm bg-base-100 p-2 rounded overflow-auto">
          {JSON.stringify(diagnosticData.currentUser, null, 2)}
        </pre>
      </div>

      {/* Conexión a Supabase */}
      <div className="card bg-base-200 p-4">
        <h3 className="text-lg font-semibold mb-2">
          🔌 Conexión a Supabase
          <span className={`badge ml-2 ${diagnosticData.supabaseConnection?.success ? 'badge-success' : 'badge-error'}`}>
            {diagnosticData.supabaseConnection?.success ? 'OK' : 'ERROR'}
          </span>
        </h3>
        <pre className="text-sm bg-base-100 p-2 rounded overflow-auto">
          {JSON.stringify(diagnosticData.supabaseConnection, null, 2)}
        </pre>
      </div>

      {/* Perfiles */}
      <div className="card bg-base-200 p-4">
        <h3 className="text-lg font-semibold mb-2">
          👥 Perfiles ({diagnosticData.profiles?.count || 0})
          <span className={`badge ml-2 ${diagnosticData.profiles?.success ? 'badge-success' : 'badge-error'}`}>
            {diagnosticData.profiles?.success ? 'OK' : 'ERROR'}
          </span>
        </h3>
        <pre className="text-sm bg-base-100 p-2 rounded overflow-auto max-h-40">
          {JSON.stringify(diagnosticData.profiles, null, 2)}
        </pre>
      </div>

      {/* Conversaciones */}
      <div className="card bg-base-200 p-4">
        <h3 className="text-lg font-semibold mb-2">
          💬 Conversaciones ({diagnosticData.conversations?.count || 0})
          <span className={`badge ml-2 ${diagnosticData.conversations?.success ? 'badge-success' : 'badge-error'}`}>
            {diagnosticData.conversations?.success ? 'OK' : 'ERROR'}
          </span>
        </h3>
        <pre className="text-sm bg-base-100 p-2 rounded overflow-auto max-h-40">
          {JSON.stringify(diagnosticData.conversations, null, 2)}
        </pre>
      </div>

      {/* Usuarios disponibles */}
      <div className="card bg-base-200 p-4">
        <h3 className="text-lg font-semibold mb-2">
          🆕 Usuarios Disponibles ({diagnosticData.availableUsers?.count || 0})
          <span className={`badge ml-2 ${diagnosticData.availableUsers?.success ? 'badge-success' : 'badge-error'}`}>
            {diagnosticData.availableUsers?.success ? 'OK' : 'ERROR'}
          </span>
        </h3>
        <pre className="text-sm bg-base-100 p-2 rounded overflow-auto max-h-40">
          {JSON.stringify(diagnosticData.availableUsers, null, 2)}
        </pre>
      </div>

      {/* Botones de prueba */}
      <div className="card bg-base-200 p-4">
        <h3 className="text-lg font-semibold mb-2">🧪 Pruebas</h3>
        <div className="space-x-2">
          <button 
            onClick={testCreateConversation}
            className="btn btn-primary btn-sm"
            disabled={!diagnosticData.availableUsers?.data?.length}
          >
            Probar Crear Conversación
          </button>
          <button 
            onClick={testSendMessage}
            className="btn btn-secondary btn-sm"
            disabled={!diagnosticData.conversations?.data?.length}
          >
            Probar Enviar Mensaje
          </button>
          <button 
            onClick={runDiagnostic}
            className="btn btn-accent btn-sm"
          >
            Refrescar Diagnóstico
          </button>
        </div>
      </div>

      {/* Error general */}
      {diagnosticData.error && (
        <div className="alert alert-error">
          <span>❌ Error general: {diagnosticData.error}</span>
        </div>
      )}
    </div>
  );
};

export default ChatDiagnostic;
