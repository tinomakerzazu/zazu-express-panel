function getDateRange() {
    const startInput = document.getElementById('reportStartDate');
    const endInput = document.getElementById('reportEndDate');
    return {
        start: startInput ? startInput.value : '',
        end: endInput ? endInput.value : ''
    };
}

function isWithinRange(item, range) {
    const source = item.fecha || item.createdAt || '';
    if (!source) return false;
    const dateValue = source.slice(0, 10);
    if (range.start && dateValue < range.start) return false;
    if (range.end && dateValue > range.end) return false;
    return true;
}

function getSupabaseClient() {
    return window.supabaseClient || null;
}

function normalizeReceiptValue(value) {
    return String(value || '').trim().toLowerCase();
}

function buildReceiptKey(item) {
    return [
        normalizeReceiptValue(item.numero),
        normalizeReceiptValue(item.celular),
        normalizeReceiptValue(item.monto),
        normalizeReceiptValue(item.fecha),
        normalizeReceiptValue(item.hora),
        normalizeReceiptValue(item.metodo),
        normalizeReceiptValue(item.destinatario),
        normalizeReceiptValue(item.destino),
        normalizeReceiptValue(item.operacion),
        normalizeReceiptValue(item.seguridad),
        normalizeReceiptValue(item.concepto),
        normalizeReceiptValue(item.caja),
        normalizeReceiptValue(item.tipo)
    ].join('|');
}

function mergeSupabaseWithLocal(supabaseItems, localItems) {
    const supabaseKeys = new Set(supabaseItems.map(buildReceiptKey));
    const pending = localItems.filter((item) => !supabaseKeys.has(buildReceiptKey(item)));
    return [...pending, ...supabaseItems];
}

function mapSupabaseRow(row) {
    return {
        id: row.id || '',
        numero: row.numero || '',
        celular: row.celular || '',
        monto: row.monto || '',
        fecha: row.fecha || '',
        hora: row.hora || '',
        metodo: row.metodo || '',
        caja: row.caja || '',
        tipo: row.tipo || '',
        destinatario: row.destinatario || '',
        destino: row.destino || '',
        operacion: row.operacion || '',
        seguridad: row.seguridad || '',
        concepto: row.concepto || '',
        imageData: row.image_url || row.image_data || '',
        createdAt: row.created_at || ''
    };
}

async function syncReportsFromSupabase() {
    const client = getSupabaseClient();
    if (!client) return;
    const tables = [
        { table: 'comprobantes_lima', key: 'quickReceiptsLima' },
        { table: 'comprobantes_provincia', key: 'quickReceiptsProvincia' },
        { table: 'comprobantes_caja', key: 'quickReceiptsCaja' }
    ];
    await Promise.all(tables.map(async (entry) => {
        const { data, error } = await client
            .from(entry.table)
            .select('*')
            .order('created_at', { ascending: false });
        if (error) return;
        const items = (data || []).map(mapSupabaseRow);
        const localItems = JSON.parse(localStorage.getItem(entry.key) || '[]');
        const merged = mergeSupabaseWithLocal(items, localItems);
        localStorage.setItem(entry.key, JSON.stringify(merged));
    }));
}

function buildGeneralReports() {
    const zoneBody = document.getElementById('generalZoneTableBody');
    const cajaBody = document.getElementById('generalCajaTableBody');
    if (!zoneBody || !cajaBody) return;

    const range = getDateRange();
    const limaAll = JSON.parse(localStorage.getItem('quickReceiptsLima') || '[]');
    const provinciaAll = JSON.parse(localStorage.getItem('quickReceiptsProvincia') || '[]');
    const cajaAll = JSON.parse(localStorage.getItem('quickReceiptsCaja') || '[]');

    const lima = limaAll.filter((item) => isWithinRange(item, range));
    const provincia = provinciaAll.filter((item) => isWithinRange(item, range));
    const caja = cajaAll.filter((item) => isWithinRange(item, range));

    const zonaRows = [
        { label: 'Zona Lima', count: lima.length },
        { label: 'Zona Provincia', count: provincia.length }
    ];
    const totalZona = zonaRows.reduce((sum, row) => sum + row.count, 0);
    zoneBody.innerHTML = zonaRows.map((row) => `
        <tr>
            <td>${row.label}</td>
            <td>${row.count}</td>
        </tr>
    `).join('') + `
        <tr>
            <td><strong>Total</strong></td>
            <td><strong>${totalZona}</strong></td>
        </tr>
    `;

    const cajaTypes = [
        { label: 'Caja - Motorizados', key: 'CAJA - MOTORIZADOS' },
        { label: 'Caja - Recojo en tienda', key: 'CAJA - RECOJO EN TIENDA' }
    ];
    const cajaRows = cajaTypes.map((type) => {
        const ingresos = caja.filter((item) => item.caja === type.key && item.tipo === 'Ingreso').length;
        const salidas = caja.filter((item) => item.caja === type.key && item.tipo === 'Salida').length;
        return {
            label: type.label,
            ingresos,
            salidas,
            total: ingresos + salidas
        };
    });
    const totalCaja = cajaRows.reduce((sum, row) => sum + row.total, 0);
    const totalIngresos = cajaRows.reduce((sum, row) => sum + row.ingresos, 0);
    const totalSalidas = cajaRows.reduce((sum, row) => sum + row.salidas, 0);

    cajaBody.innerHTML = cajaRows.map((row) => `
        <tr>
            <td>${row.label}</td>
            <td>${row.ingresos}</td>
            <td>${row.salidas}</td>
            <td>${row.total}</td>
        </tr>
    `).join('') + `
        <tr>
            <td><strong>Total</strong></td>
            <td><strong>${totalIngresos}</strong></td>
            <td><strong>${totalSalidas}</strong></td>
            <td><strong>${totalCaja}</strong></td>
        </tr>
    `;
}

function bindDateFilters() {
    const startInput = document.getElementById('reportStartDate');
    const endInput = document.getElementById('reportEndDate');
    const clearBtn = document.getElementById('reportClearDates');
    if (startInput) startInput.addEventListener('input', buildGeneralReports);
    if (endInput) endInput.addEventListener('input', buildGeneralReports);
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (startInput) startInput.value = '';
            if (endInput) endInput.value = '';
            buildGeneralReports();
        });
    }
}

function bindRealtimeUpdates() {
    window.addEventListener('storage', (event) => {
        if (!event || !event.key) return;
        if (event.key.startsWith('quickReceipts')) {
            syncReportsFromSupabase().then(buildGeneralReports);
        }
    });
    window.addEventListener('quickReceiptsUpdated', () => {
        syncReportsFromSupabase().then(buildGeneralReports);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        bindDateFilters();
        bindRealtimeUpdates();
        await syncReportsFromSupabase();
        buildGeneralReports();
    });
} else {
    bindDateFilters();
    bindRealtimeUpdates();
    syncReportsFromSupabase().then(buildGeneralReports);
}
