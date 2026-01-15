const { getSupabaseClient } = require('./_supabase');

/**
 * Valida el token de autenticación del usuario desde el header Authorization
 * @param {Object} event - Evento de Netlify Function
 * @returns {Object} { valid: boolean, user: Object|null, error: string|null }
 */
async function validateAuth(event) {
  const authHeader = event.headers?.authorization || event.headers?.Authorization || '';
  
  if (!authHeader) {
    return { valid: false, user: null, error: 'No se proporcionó token de autenticación' };
  }

  // Extraer el token (formato: "Bearer <token>" o solo "<token>")
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  
  if (!token) {
    return { valid: false, user: null, error: 'Token de autenticación inválido' };
  }

  try {
    // Crear cliente con anon key para validar tokens de usuario
    // El service role key no debe usarse para validar tokens de usuario
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return { valid: false, user: null, error: 'Configuración de Supabase incompleta' };
    }

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });
    
    // Verificar el token con Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { valid: false, user: null, error: 'Token inválido o expirado' };
    }

    return { valid: true, user, error: null };
  } catch (err) {
    return { valid: false, user: null, error: err.message || 'Error al validar autenticación' };
  }
}

/**
 * Middleware para proteger funciones de Netlify
 * @param {Function} handler - Función handler de la Netlify Function
 * @returns {Function} Handler protegido con autenticación
 */
function requireAuth(handler) {
  return async (event) => {
    const authResult = await validateAuth(event);
    
    if (!authResult.valid) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'No autorizado',
          message: authResult.error 
        })
      };
    }

    // Agregar el usuario al evento para uso en el handler
    event.user = authResult.user;
    
    return handler(event);
  };
}

module.exports = {
  validateAuth,
  requireAuth
};
