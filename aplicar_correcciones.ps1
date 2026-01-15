# Script para aplicar correcciones a zone-quick-form.js

$filePath = "sistema-corporacion-v2\js\zone-quick-form.js"
$content = Get-Content $filePath -Raw -Encoding UTF8

# Corrección 1: mergeSupabaseWithLocal
$old1 = @'
function mergeSupabaseWithLocal(supabaseItems, localItems) {
    const supabaseKeys = new Set(supabaseItems.map(buildReceiptKey));
    const pending = localItems.filter((item) => !supabaseKeys.has(buildReceiptKey(item)));
    return [...pending, ...supabaseItems];
}
'@

$new1 = @'
function mergeSupabaseWithLocal(supabaseItems, localItems) {
    // Crear un mapa de items de Supabase por ID (si existe) y por key
    const supabaseById = new Map();
    const supabaseByKey = new Set();
    
    supabaseItems.forEach(item => {
        if (item.id) {
            supabaseById.set(item.id, item);
        }
        supabaseByKey.add(buildReceiptKey(item));
    });
    
    // Filtrar items locales que no están en Supabase
    // Usar ID si está disponible, sino usar key
    const pending = localItems.filter((item) => {
        // Si tiene ID y existe en Supabase, es duplicado
        if (item.id && supabaseById.has(item.id)) {
            return false;
        }
        // Si no tiene ID pero tiene la misma key, es duplicado
        return !supabaseByKey.has(buildReceiptKey(item));
    });
    
    // Retornar pendientes locales + todos los de Supabase (Supabase es la fuente de verdad)
    return [...pending, ...supabaseItems];
}
'@

$content = $content -replace [regex]::Escape($old1), $new1

# Corrección 2: mapSupabaseRow
$old2 = @'
        imageData: row.image_url || row.image_data || '',
'@

$new2 = @'
        imageData: row.image_url || row.image_data || '',
        imageUrl: row.image_url || row.image_data || '',
'@

$content = $content -replace [regex]::Escape($old2), $new2

# Corrección 3: insertSupabaseReceipt
$old3 = @'
async function insertSupabaseReceipt(zone, payload) {
    const client = getSupabaseClient();
    const table = getSupabaseTable(zone);
    if (!client || !table) {
        return { ok: false, error: new Error('Supabase no configurado') };
    }
    const { error } = await client.from(table).insert(payload);
    if (error) {
        console.error('Supabase insert error:', error);
        return { ok: false, error };
    }
    return { ok: true };
}
'@

$new3 = @'
async function insertSupabaseReceipt(zone, payload) {
    const client = getSupabaseClient();
    const table = getSupabaseTable(zone);
    if (!client || !table) {
        return { ok: false, error: new Error('Supabase no configurado') };
    }
    
    // Verificar autenticación antes de insertar
    const { data: { session } } = await client.auth.getSession();
    if (!session) {
        return { ok: false, error: new Error('No autenticado. Por favor inicia sesión.') };
    }
    
    // Insertar y obtener el registro creado con su ID
    const { data, error } = await client.from(table).insert(payload).select().single();
    if (error) {
        console.error('Supabase insert error:', error);
        return { ok: false, error };
    }
    return { ok: true, data };
}
'@

$content = $content -replace [regex]::Escape($old3), $new3

# Corrección 4: deleteSupabaseReceipt
$old4 = @'
async function deleteSupabaseReceipt(zone, id) {
    const client = getSupabaseClient();
    const table = getSupabaseTable(zone);
    if (!client || !table || !id) {
        return { ok: false, error: new Error('Supabase no configurado') };
    }
    const { data, error } = await client
        .from(table)
        .delete()
        .eq('id', id)
        .select('id');
    if (error) {
        console.error('Supabase delete error:', error);
        return { ok: false, error };
    }
    return { ok: true, deleted: (data || []).length > 0 };
}
'@

$new4 = @'
async function deleteSupabaseReceipt(zone, id) {
    const client = getSupabaseClient();
    const table = getSupabaseTable(zone);
    if (!client || !table || !id) {
        return { ok: false, error: new Error('Supabase no configurado o ID faltante') };
    }
    
    // Verificar autenticación antes de eliminar
    const { data: { session } } = await client.auth.getSession();
    if (!session) {
        return { ok: false, error: new Error('No autenticado. Por favor inicia sesión.') };
    }
    
    const { data, error } = await client
        .from(table)
        .delete()
        .eq('id', id)
        .select('id');
    if (error) {
        console.error('Supabase delete error:', error);
        return { ok: false, error };
    }
    
    const deleted = (data || []).length > 0;
    if (!deleted) {
        return { ok: false, error: new Error('No se encontró el registro para eliminar') };
    }
    
    return { ok: true, deleted: true };
}
'@

$content = $content -replace [regex]::Escape($old4), $new4

# Corrección 5: Después de insertSupabaseReceipt
$old5 = @'
    const stored = await insertSupabaseReceipt(zone, supabasePayload);
    if (stored && stored.ok) {
        await syncSupabaseTable(zone);
        return true;
    }
    if (stored && stored.error && typeof showNotification === 'function') {
        showNotification(`Supabase: ${stored.error.message || 'No se pudo guardar'}`, 'error');
    }
    return false;
'@

$new5 = @'
    const stored = await insertSupabaseReceipt(zone, supabasePayload);
    if (stored && stored.ok) {
        // Actualizar el payload con el ID de Supabase si está disponible
        if (stored.data && stored.data.id) {
            payload.id = stored.data.id;
        }
        // Sincronizar después de un pequeño delay para asegurar que Supabase haya procesado
        setTimeout(async () => {
            await syncSupabaseTable(zone);
            refreshTables();
        }, 500);
        return true;
    }
    if (stored && stored.error && typeof showNotification === 'function') {
        showNotification(`Error: ${stored.error.message || 'No se pudo guardar'}`, 'error');
    }
    return false;
'@

$content = $content -replace [regex]::Escape($old5), $new5

# Corrección 6: Eliminación mejorada
$old6 = @'
            const deleted = await deleteSupabaseReceipt(zone, id);
            if (deleted && deleted.ok && deleted.deleted) {
                await syncSupabaseTable(zone);
                refreshCharts();
                refreshTables();
                window.dispatchEvent(new CustomEvent('quickReceiptsUpdated'));
                return;
            }
            if (deleted && deleted.ok === false && typeof showNotification === 'function') {
                showNotification(`Supabase: ${deleted.error.message || 'No se pudo eliminar'}`, 'error');
            }
'@

$new6 = @'
            const deleted = await deleteSupabaseReceipt(zone, id);
            if (deleted && deleted.ok && deleted.deleted) {
                // Eliminar también de localStorage inmediatamente
                const key = zone === 'lima'
                    ? 'quickReceiptsLima'
                    : zone === 'caja'
                        ? 'quickReceiptsCaja'
                        : 'quickReceiptsProvincia';
                const items = safeParseLocalStorage(key, []);
                const filtered = items.filter((item) => item.id !== id);
                localStorage.setItem(key, JSON.stringify(filtered));
                
                // Actualizar UI inmediatamente
                refreshCharts();
                refreshTables();
                window.dispatchEvent(new CustomEvent('quickReceiptsUpdated'));
                
                if (typeof showNotification === 'function') {
                    showNotification('Comprobante eliminado correctamente', 'success');
                }
                
                // Sincronizar después de un pequeño delay para asegurar consistencia
                setTimeout(async () => {
                    await syncSupabaseTable(zone);
                    refreshTables();
                }, 300);
                return;
            }
            if (deleted && deleted.ok === false && typeof showNotification === 'function') {
                showNotification(`Error: ${deleted.error?.message || 'No se pudo eliminar. Verifica tu conexión y autenticación.'}`, 'error');
            }
'@

$content = $content -replace [regex]::Escape($old6), $new6

# Corrección 7: Mostrar imágenes correctamente
$old7 = @'
        const isRemote = typeof item.imageData === 'string' && item.imageData.startsWith('http');
        const preview = item.imageData
            ? `<div class="preview-cell"><img class="preview-thumb" src="${item.imageData}" alt="Comprobante">${isRemote ? '<span class="upload-badge">Supabase</span>' : ''}</div>`
            : '<span class="text-muted">Sin imagen</span>';
        const viewBtn = `<button class="btn btn-secondary btn-sm" type="button" data-preview="${item.imageData || ''}" ${item.imageData ? '' : 'disabled'}>Ver</button>`;
'@

$new7 = @'
        // Obtener URL de imagen (priorizar imageUrl si existe, sino imageData)
        const imageUrl = item.imageUrl || item.imageData || '';
        const isRemote = typeof imageUrl === 'string' && (imageUrl.startsWith('http') || imageUrl.startsWith('https'));
        // Escapar HTML para prevenir XSS
        const safeImageUrl = typeof escapeHtml === 'function' ? escapeHtml(imageUrl) : imageUrl.replace(/"/g, '&quot;');
        const preview = imageUrl
            ? `<div class="preview-cell"><img class="preview-thumb" src="${safeImageUrl}" alt="Comprobante" onerror="this.style.display='none'; this.parentElement.innerHTML='<span class=\\'text-muted\\'>Error al cargar</span>';">${isRemote ? '<span class="upload-badge">Supabase</span>' : ''}</div>`
            : '<span class="text-muted">Sin imagen</span>';
        const safePreviewUrl = typeof escapeHtml === 'function' ? escapeHtml(imageUrl) : escapeHtml(imageUrl).replace(/"/g, '&quot;');
        const viewBtn = `<button class="btn btn-secondary btn-sm" type="button" data-preview="${safePreviewUrl}" ${imageUrl ? '' : 'disabled'}>Ver</button>`;
'@

$content = $content -replace [regex]::Escape($old7), $new7

# Guardar archivo
Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
Write-Host "Correcciones aplicadas exitosamente!"
