const ADMIN_ZONES = [
    { name: 'Lima', key: 'zazuReceiptsLima', totalId: 'limaTotal', todayId: 'limaHoy' },
    { name: 'Provincia', key: 'zazuReceiptsProvincia', totalId: 'provinciaTotal', todayId: 'provinciaHoy' },
    { name: 'Caja', key: 'zazuReceiptsCaja', totalId: 'cajaTotal', todayId: 'cajaHoy' }
];

function loadAdminReceipts(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.error('Error leyendo registros', err);
        return [];
    }
}

function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
}

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('es-PE');
}

function renderTotals() {
    const todayKey = getTodayKey();
    ADMIN_ZONES.forEach((zone) => {
        const items = loadAdminReceipts(zone.key);
        const todayCount = items.filter((item) => item.registeredAt?.startsWith(todayKey)).length;
        const totalEl = document.getElementById(zone.totalId);
        const todayEl = document.getElementById(zone.todayId);
        if (totalEl) totalEl.textContent = String(items.length);
        if (todayEl) todayEl.textContent = String(todayCount);
    });
}

function renderLatest() {
    const tbody = document.getElementById('adminLatest');
    if (!tbody) return;

    const allItems = ADMIN_ZONES.flatMap((zone) => {
        const items = loadAdminReceipts(zone.key);
        return items.map((item) => ({ ...item, zone: zone.name }));
    });

    allItems.sort((a, b) => (b.registeredAt || '').localeCompare(a.registeredAt || ''));
    const latest = allItems.slice(0, 12);

    if (!latest.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay comprobantes registrados</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    latest.forEach((item) => {
        const row = document.createElement('tr');
        const numero = item.numero || item.yapeNumero || '-';
        const detalle = item.operacion || item.concepto || item.destino || '-';
        row.innerHTML = `
            <td>${item.zone}</td>
            <td>${formatDate(item.fecha)}</td>
            <td>${item.hora || '-'}</td>
            <td>${numero}</td>
            <td>S/ ${item.monto || '0.00'}</td>
            <td>${detalle}</td>
        `;
        tbody.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderTotals();
    renderLatest();
});
