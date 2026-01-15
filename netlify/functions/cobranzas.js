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
  const id = getPathId(event, 'cobranzas');

  try {
    if (method === 'GET') {
      const { data, error } = await supabase.from('cobranzas').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return jsonResponse(200, data || []);
    }

    if (method === 'POST') {
      const payload = parseJsonBody(event.body);
      if (!payload.cliente || payload.saldo === undefined) {
        return jsonResponse(400, { error: 'Faltan campos obligatorios.' });
      }

      const now = new Date().toISOString();
      const record = {
        id: makeId(),
        cliente: sanitizeString(payload.cliente, 200),
        saldo: sanitizeNumber(payload.saldo, 0, 999999999),
        dias_mora: sanitizeNumber(payload.diasMora || 0, 0, 9999),
        ultima_gestion: sanitizeString(payload.ultimaGestion || '', 1000),
        estado: sanitizeString(payload.estado || 'Pendiente', 50),
        created_at: now,
        updated_at: now
      };

      const { data, error } = await supabase.from('cobranzas').insert(record).select().single();
      if (error) throw error;
      return jsonResponse(201, data);
    }

    if (method === 'PUT' && id) {
      const payload = parseJsonBody(event.body);
      const updates = {
        cliente: payload.cliente ? sanitizeString(payload.cliente, 200) : undefined,
        saldo: payload.saldo !== undefined ? sanitizeNumber(payload.saldo, 0, 999999999) : undefined,
        dias_mora: payload.diasMora !== undefined ? sanitizeNumber(payload.diasMora, 0, 9999) : undefined,
        ultima_gestion: payload.ultimaGestion ? sanitizeString(payload.ultimaGestion, 1000) : undefined,
        estado: payload.estado ? sanitizeString(payload.estado, 50) : undefined,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('cobranzas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return jsonResponse(200, data);
    }

    if (method === 'DELETE' && id) {
      const { error } = await supabase.from('cobranzas').delete().eq('id', id);
      if (error) throw error;
      return jsonResponse(200, { ok: true });
    }

    return jsonResponse(405, { error: 'Metodo no permitido.' });
  } catch (err) {
    console.error('Error en cobranzas:', err);
    return jsonResponse(500, { error: 'Error al procesar la solicitud.' });
  }
};
