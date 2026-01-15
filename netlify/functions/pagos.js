const { getSupabaseClient, getBucketName } = require('./_supabase');
const { jsonResponse, parseJsonBody, getPathId, makeId, parseDataUrl, getExtensionFromType } = require('./_utils');
const { validateAuth } = require('./_auth');
const { sanitizeString, sanitizeNumber, isValidAmount } = require('./_validation');

// Tamaño máximo de archivo: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

exports.handler = async (event) => {
  // Validar autenticación
  const authResult = await validateAuth(event);
  if (!authResult.valid) {
    return jsonResponse(401, { error: 'No autorizado', message: authResult.error });
  }

  const supabase = getSupabaseClient();
  const bucket = getBucketName();
  const method = event.httpMethod;
  const id = getPathId(event, 'pagos');

  try {
    if (method === 'GET') {
      const { data, error } = await supabase.from('pagos').select('*').order('fecha', { ascending: false });
      if (error) throw error;

      const mapped = (data || []).map(item => ({
        id: item.id,
        cliente: item.cliente,
        clienteId: item.cliente_id,
        monto: item.monto,
        fecha: item.fecha,
        metodo: item.metodo,
        referencia: item.referencia,
        estado: item.estado,
        nota: item.nota,
        comprobante: item.comprobante_url ? {
          url: item.comprobante_url,
          name: item.comprobante_name || ''
        } : null
      }));

      return jsonResponse(200, mapped);
    }

    if (method === 'POST') {
      const payload = parseJsonBody(event.body);
      if (!payload.cliente || !payload.monto || !payload.fecha || !payload.metodo) {
        return jsonResponse(400, { error: 'Faltan campos obligatorios.' });
      }

      // Validar monto
      if (!isValidAmount(payload.monto, 0, 999999999)) {
        return jsonResponse(400, { error: 'Monto inválido.' });
      }

      let comprobanteUrl = null;
      let comprobanteName = null;

      if (payload.comprobanteBase64) {
        // Validar tamaño del archivo
        const base64Size = (payload.comprobanteBase64.length * 3) / 4;
        if (base64Size > MAX_FILE_SIZE) {
          return jsonResponse(400, { error: `El archivo excede el tamaño máximo de ${MAX_FILE_SIZE / 1024 / 1024}MB.` });
        }

        const parsed = parseDataUrl(payload.comprobanteBase64);
        if (!parsed) {
          return jsonResponse(400, { error: 'Comprobante invalido.' });
        }

        // Validar tamaño del buffer
        if (parsed.buffer && parsed.buffer.length > MAX_FILE_SIZE) {
          return jsonResponse(400, { error: `El archivo excede el tamaño máximo de ${MAX_FILE_SIZE / 1024 / 1024}MB.` });
        }

        const ext = payload.comprobanteName
          ? `.${payload.comprobanteName.split('.').pop()}`
          : getExtensionFromType(parsed.contentType);
        const fileName = `${Date.now()}-${makeId()}${ext}`;
        const filePath = `pagos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, parsed.buffer, {
            contentType: parsed.contentType,
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        comprobanteUrl = publicData?.publicUrl || null;
        comprobanteName = payload.comprobanteName || fileName;
      }

      const now = new Date().toISOString();
      const record = {
        id: makeId(),
        cliente: sanitizeString(payload.cliente, 200),
        cliente_id: payload.clienteId ? sanitizeString(payload.clienteId, 100) : null,
        monto: sanitizeNumber(payload.monto, 0, 999999999),
        fecha: payload.fecha, // Ya validado por Supabase
        metodo: sanitizeString(payload.metodo, 50),
        referencia: sanitizeString(payload.referencia || '', 200),
        estado: sanitizeString(payload.estado || 'Registrado', 50),
        nota: sanitizeString(payload.nota || '', 2000),
        comprobante_url: comprobanteUrl,
        comprobante_name: comprobanteName,
        created_at: now,
        updated_at: now
      };

      const { data, error } = await supabase.from('pagos').insert(record).select().single();
      if (error) throw error;

      return jsonResponse(201, {
        id: data.id,
        cliente: data.cliente,
        clienteId: data.cliente_id,
        monto: data.monto,
        fecha: data.fecha,
        metodo: data.metodo,
        referencia: data.referencia,
        estado: data.estado,
        nota: data.nota,
        comprobante: data.comprobante_url ? {
          url: data.comprobante_url,
          name: data.comprobante_name || ''
        } : null
      });
    }

    if (method === 'PUT' && id) {
      const payload = parseJsonBody(event.body);
      const updates = {
        estado: payload.estado,
        nota: payload.nota,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('pagos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;

      return jsonResponse(200, data);
    }

    if (method === 'DELETE' && id) {
      const { data: existing, error: fetchError } = await supabase
        .from('pagos')
        .select('comprobante_url')
        .eq('id', id)
        .single();
      if (fetchError) throw fetchError;

      if (existing?.comprobante_url) {
        const parts = existing.comprobante_url.split('/');
        const fileName = parts.slice(-2).join('/');
        if (fileName) {
          await supabase.storage.from(bucket).remove([fileName]);
        }
      }

      const { error } = await supabase.from('pagos').delete().eq('id', id);
      if (error) throw error;
      return jsonResponse(200, { ok: true });
    }

    return jsonResponse(405, { error: 'Metodo no permitido.' });
  } catch (err) {
    // No exponer detalles del error en producción
    console.error('Error en pagos:', err);
    return jsonResponse(500, { error: 'Error al procesar la solicitud.' });
  }
};
