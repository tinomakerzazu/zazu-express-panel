const { getSupabaseClient } = require('./_supabase');
const { jsonResponse, parseJsonBody, getPathId, makeId } = require('./_utils');
const { validateAuth } = require('./_auth');
const { sanitizeString, sanitizeNumber, isValidDNI, isValidPhone, sanitizePayload } = require('./_validation');

exports.handler = async (event) => {
  // Validar autenticación
  const authResult = await validateAuth(event);
  if (!authResult.valid) {
    return jsonResponse(401, { error: 'No autorizado', message: authResult.error });
  }

  const supabase = getSupabaseClient();
  const method = event.httpMethod;
  const id = getPathId(event, 'clientes');

  try {
    if (method === 'GET') {
      const { data, error } = await supabase.from('clientes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return jsonResponse(200, data || []);
    }

    if (method === 'POST') {
      const payload = parseJsonBody(event.body);
      if (!payload.dni || !payload.nombres || !payload.apellidos || !payload.telefonoPrincipal) {
        return jsonResponse(400, { error: 'Faltan campos obligatorios.' });
      }

      // Validar DNI
      if (!isValidDNI(payload.dni)) {
        return jsonResponse(400, { error: 'DNI inválido. Debe tener 8 dígitos.' });
      }

      // Validar teléfono
      if (!isValidPhone(payload.telefonoPrincipal)) {
        return jsonResponse(400, { error: 'Teléfono inválido.' });
      }

      // Sanitizar inputs
      const now = new Date().toISOString();
      const record = {
        id: makeId(),
        dni: sanitizeString(payload.dni, 20),
        nombres: sanitizeString(payload.nombres, 100),
        apellidos: sanitizeString(payload.apellidos, 100),
        telefono_principal: sanitizeString(payload.telefonoPrincipal, 20),
        direccion: sanitizeString(payload.direccion || '', 500),
        ocupacion: sanitizeString(payload.ocupacion || '', 100),
        ingresos_mensuales: payload.ingresosMensuales ? sanitizeNumber(payload.ingresosMensuales, 0, 999999999) : null,
        observaciones: sanitizeString(payload.observaciones || '', 2000),
        foto_perfil: payload.fotoPerfil || null,
        foto_documento: payload.fotoDocumento || null,
        ubicacion: payload.ubicacion || null,
        aval: payload.aval || null,
        created_at: now,
        updated_at: now
      };

      const { data, error } = await supabase.from('clientes').insert(record).select().single();
      if (error) throw error;
      return jsonResponse(201, data);
    }

    if (method === 'PUT' && id) {
      const payload = parseJsonBody(event.body);
      const updates = {
        ...payload,
        telefono_principal: payload.telefonoPrincipal,
        foto_perfil: payload.fotoPerfil,
        foto_documento: payload.fotoDocumento,
        ingresos_mensuales: payload.ingresosMensuales,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('clientes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return jsonResponse(200, data);
    }

    if (method === 'DELETE' && id) {
      const { error } = await supabase.from('clientes').delete().eq('id', id);
      if (error) throw error;
      return jsonResponse(200, { ok: true });
    }

    return jsonResponse(405, { error: 'Metodo no permitido.' });
  } catch (err) {
    console.error('Error en clientes:', err);
    return jsonResponse(500, { error: 'Error al procesar la solicitud.' });
  }
};
