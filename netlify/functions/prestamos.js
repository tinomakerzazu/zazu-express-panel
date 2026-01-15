const { getSupabaseClient } = require('./_supabase');
const { jsonResponse, parseJsonBody, getPathId, makeId } = require('./_utils');
const { validateAuth } = require('./_auth');
const { sanitizeString, sanitizeNumber } = require('./_validation');

exports.handler = async (event) => {
  // Validar autenticación
  const authResult = await validateAuth(event);
  if (!authResult.valid) {
    return jsonResponse(401, { error: 'No autorizado', message: authResult.error });
  }

  const supabase = getSupabaseClient();
  const method = event.httpMethod;
  const id = getPathId(event, 'prestamos');

  try {
    if (method === 'GET') {
      const { data, error } = await supabase.from('prestamos').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return jsonResponse(200, data || []);
    }

    if (method === 'POST') {
      const payload = parseJsonBody(event.body);
      const now = new Date().toISOString();
      const record = {
        id: makeId(),
        cliente: sanitizeString(payload.cliente || '', 200),
        monto_prestado: sanitizeNumber(payload.montoPrestado || 0, 0, 999999999),
        estado: sanitizeString(payload.estado || 'activo', 50),
        created_at: now,
        updated_at: now
      };

      const { data, error } = await supabase.from('prestamos').insert(record).select().single();
      if (error) throw error;
      return jsonResponse(201, data);
    }

    if (method === 'PUT' && id) {
      const payload = parseJsonBody(event.body);
      const updates = {
        ...payload,
        monto_prestado: payload.montoPrestado,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('prestamos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return jsonResponse(200, data);
    }

    if (method === 'DELETE' && id) {
      const { error } = await supabase.from('prestamos').delete().eq('id', id);
      if (error) throw error;
      return jsonResponse(200, { ok: true });
    }

    return jsonResponse(405, { error: 'Metodo no permitido.' });
  } catch (err) {
    console.error('Error en prestamos:', err);
    return jsonResponse(500, { error: 'Error al procesar la solicitud.' });
  }
};
