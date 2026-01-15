const { getSupabaseClient } = require('./_supabase');
const { jsonResponse, parseJsonBody, getPathId, makeId } = require('./_utils');
const { validateAuth } = require('./_auth');
const { sanitizeString, isValidDate } = require('./_validation');

exports.handler = async (event) => {
  // Validar autenticación
  const authResult = await validateAuth(event);
  if (!authResult.valid) {
    return jsonResponse(401, { error: 'No autorizado', message: authResult.error });
  }

  const supabase = getSupabaseClient();
  const method = event.httpMethod;
  const id = getPathId(event, 'eventos');

  try {
    if (method === 'GET') {
      const { data, error } = await supabase.from('eventos').select('*').order('fecha', { ascending: true });
      if (error) throw error;
      return jsonResponse(200, data || []);
    }

    if (method === 'POST') {
      const payload = parseJsonBody(event.body);
      if (!payload.fecha || !payload.tipo) {
        return jsonResponse(400, { error: 'Faltan campos obligatorios.' });
      }

      // Validar fecha
      if (!isValidDate(payload.fecha)) {
        return jsonResponse(400, { error: 'Fecha inválida.' });
      }

      const now = new Date().toISOString();
      const record = {
        id: makeId(),
        fecha: payload.fecha,
        cliente: sanitizeString(payload.cliente || '', 200),
        tipo: sanitizeString(payload.tipo, 50),
        detalle: sanitizeString(payload.detalle || '', 2000),
        prioridad: sanitizeString(payload.prioridad || 'Media', 50),
        created_at: now,
        updated_at: now
      };

      const { data, error } = await supabase.from('eventos').insert(record).select().single();
      if (error) throw error;
      return jsonResponse(201, data);
    }

    if (method === 'PUT' && id) {
      const payload = parseJsonBody(event.body);
      const updates = {
        fecha: payload.fecha ? (isValidDate(payload.fecha) ? payload.fecha : undefined) : undefined,
        cliente: payload.cliente ? sanitizeString(payload.cliente, 200) : undefined,
        tipo: payload.tipo ? sanitizeString(payload.tipo, 50) : undefined,
        detalle: payload.detalle ? sanitizeString(payload.detalle, 2000) : undefined,
        prioridad: payload.prioridad ? sanitizeString(payload.prioridad, 50) : undefined,
        updated_at: new Date().toISOString()
      };
      
      // Remover campos undefined
      Object.keys(updates).forEach(key => {
        if (updates[key] === undefined) {
          delete updates[key];
        }
      });

      const { data, error } = await supabase
        .from('eventos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return jsonResponse(200, data);
    }

    if (method === 'DELETE' && id) {
      const { error } = await supabase.from('eventos').delete().eq('id', id);
      if (error) throw error;
      return jsonResponse(200, { ok: true });
    }

    return jsonResponse(405, { error: 'Metodo no permitido.' });
  } catch (err) {
    console.error('Error en eventos:', err);
    return jsonResponse(500, { error: 'Error al procesar la solicitud.' });
  }
};
