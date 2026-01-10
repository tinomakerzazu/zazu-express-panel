const ZONE_CONFIGS = [
    {
        zone: 'lima',
        storageKey: 'zazuReceiptsLima',
        formId: 'limaForm',
        tableBodyId: 'limaTableBody',
        barsId: 'limaBars',
        countId: 'limaCount',
        fields: {
            metodo: 'metodo',
            monto: 'monto',
            fecha: 'fecha',
            hora: 'hora'
        },
        columns: [
            { key: 'fecha', type: 'date' },
            { key: 'hora' },
            { key: 'metodo' },
            { key: 'numero' },
            { key: 'monto', type: 'money' },
            { key: 'operacion' },
            { key: 'destino' }
        ]
    },
    {
        zone: 'provincia',
        storageKey: 'zazuReceiptsProvincia',
        formId: 'provinciaForm',
        tableBodyId: 'provinciaTableBody',
        barsId: 'provinciaBars',
        countId: 'provinciaCount',
        fields: {
            metodo: 'metodo',
            monto: 'monto',
            fecha: 'fecha',
            hora: 'hora'
        },
        columns: [
            { key: 'fecha', type: 'date' },
            { key: 'hora' },
            { key: 'metodo' },
            { key: 'numero' },
            { key: 'monto', type: 'money' },
            { key: 'operacion' },
            { key: 'destino' }
        ]
    },
    {
        zone: 'caja',
        storageKey: 'zazuReceiptsCaja',
        formId: 'cajaForm',
        tableBodyId: 'cajaTableBody',
        barsId: 'cajaBars',
        countId: 'cajaCount',
        fields: {
            numero: 'cajaNumero',
            tipo: 'tipoMovimiento',
            monto: 'monto',
            fecha: 'fecha',
            hora: 'hora',
            concepto: 'concepto'
        },
        columns: [
            { key: 'fecha', type: 'date' },
            { key: 'hora' },
            { key: 'numero' },
            { key: 'tipo' },
            { key: 'monto', type: 'money' },
            { key: 'concepto' }
        ]
    }
];

function loadZoneReceipts(storageKey) {
    try {
        const raw = localStorage.getItem(storageKey);
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.error('Error leyendo registros', err);
        return [];
    }
}

function saveZoneReceipts(storageKey, items) {
    localStorage.setItem(storageKey, JSON.stringify(items));
}

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('es-PE');
}

function formatTime(value) {
    if (!value) return '-';
    return value;
}

function getDayKey(date) {
    return date.toISOString().slice(0, 10);
}

function buildDailySeries(items, days = 10) {
    const today = new Date();
    const counts = {};
    items.forEach((item) => {
        if (!item.registeredAt) return;
        const key = item.registeredAt.slice(0, 10);
        counts[key] = (counts[key] || 0) + 1;
    });

    const series = [];
    for (let i = days - 1; i >= 0; i -= 1) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const key = getDayKey(date);
        series.push({
            label: String(date.getDate()).padStart(2, '0'),
            value: counts[key] || 0,
            key
        });
    }
    return series;
}

function renderBars(container, series) {
    if (!container) return;
    container.innerHTML = '';
    const max = Math.max(...series.map((item) => item.value), 1);
    series.forEach((item) => {
        const percent = Math.max(6, Math.round((item.value / max) * 100));
        const bar = document.createElement('span');
        bar.style.setProperty('--value', percent);
        bar.dataset.label = item.label;
        container.appendChild(bar);
    });
}

function renderTable(tbody, items, columns) {
    if (!tbody) return;
    if (!items.length) {
        const colspan = columns.length;
        tbody.innerHTML = `<tr><td colspan="${colspan}" class="text-center text-muted">No hay comprobantes registrados</td></tr>`;
        return;
    }
    tbody.innerHTML = '';
    items.slice().reverse().forEach((item) => {
        const row = document.createElement('tr');
        const cells = columns.map((column) => {
            const value = item[column.key] || item[column.fallback] || '';
            if (column.type === 'date') return `<td>${formatDate(value)}</td>`;
            if (column.type === 'money') return `<td>S/ ${value || '0.00'}</td>`;
            if (column.type === 'time') return `<td>${formatTime(value)}</td>`;
            return `<td>${value || '-'}</td>`;
        });
        row.innerHTML = cells.join('');
        tbody.appendChild(row);
    });
}

function seedDateTime(form) {
    if (!form) return;
    const now = new Date();
    const dateEl = form.querySelector('[name="fecha"]');
    const timeEl = form.querySelector('[name="hora"]');
    if (dateEl && !dateEl.value) {
        dateEl.value = now.toISOString().slice(0, 10);
    }
    if (timeEl && !timeEl.value) {
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        timeEl.value = `${hh}:${mm}`;
    }
}

function registerZoneReceipt(config) {
    const form = document.getElementById(config.formId);
    if (!form) return;
    const items = loadZoneReceipts(config.storageKey);

    const record = { registeredAt: new Date().toISOString() };
    Object.entries(config.fields).forEach(([key, fieldName]) => {
        record[key] = form.querySelector(`[name="${fieldName}"]`)?.value || '';
    });
    applyMethodFields(form, record);

    items.push(record);
    saveZoneReceipts(config.storageKey, items);

    const tbody = document.getElementById(config.tableBodyId);
    renderTable(tbody, items, config.columns);

    const series = buildDailySeries(items);
    renderBars(document.getElementById(config.barsId), series);

    const todayKey = getDayKey(new Date());
    const todayCount = items.filter((item) => item.registeredAt.startsWith(todayKey)).length;
    const countEl = document.getElementById(config.countId);
    if (countEl) countEl.textContent = String(todayCount);
    if (config.zone === 'caja') updateCajaSummary(items);
}

function initZone(config) {
    const form = document.getElementById(config.formId);
    if (!form) return;

    seedDateTime(form);
    const metodoEl = form.querySelector('[name="metodo"]');
    if (metodoEl) updateMethodFields(form, metodoEl.value);
    const items = loadZoneReceipts(config.storageKey);
    renderTable(document.getElementById(config.tableBodyId), items, config.columns);
    renderBars(document.getElementById(config.barsId), buildDailySeries(items));
    const todayKey = getDayKey(new Date());
    const todayCount = items.filter((item) => item.registeredAt.startsWith(todayKey)).length;
    const countEl = document.getElementById(config.countId);
    if (countEl) countEl.textContent = String(todayCount);
    if (config.zone === 'caja') updateCajaSummary(items);

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        registerZoneReceipt(config);
        form.reset();
        seedDateTime(form);
        const metodoEl = form.querySelector('[name="metodo"]');
        if (metodoEl) updateMethodFields(form, metodoEl.value);
        const modal = form.closest('.modal');
        if (modal && typeof closeModal === 'function') {
            closeModal(modal.id);
        }
    });
}

function initReceiptsUI() {
    bindNumberChips();
    ZONE_CONFIGS.forEach(initZone);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReceiptsUI);
} else {
    initReceiptsUI();
}

let chipsBound = false;
function bindNumberChips() {
    if (chipsBound) return;
    chipsBound = true;

    document.addEventListener('click', (event) => {
        const chip = event.target.closest('.number-chip');
        if (!chip) return;
        openYapeModal(chip);
    });
}

function openYapeModal(chip) {
    if (!chip) return;
    const targetId = chip.getAttribute('data-target');
    const number = chip.getAttribute('data-number');
    const modalId = chip.getAttribute('data-modal');
    if (!targetId || !number) return;

    let modal = null;
    if (modalId) {
        if (typeof showModal === 'function') {
            showModal(modalId);
        } else {
            modal = document.getElementById(modalId);
            if (modal) modal.classList.add('active');
        }
    }

    const input = document.getElementById(targetId) || (modal ? modal.querySelector(`#${targetId}`) : null);
    if (input) {
        input.value = number;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
    }

    const list = chip.closest('.number-list');
    if (list) {
        list.querySelectorAll('.number-chip').forEach((item) => item.classList.remove('active'));
    }
    chip.classList.add('active');

    const form = input ? input.closest('form') : null;
    const metodoEl = form ? form.querySelector('[name="metodo"]') : null;
    if (metodoEl) {
        metodoEl.value = 'Yape';
        metodoEl.dispatchEvent(new Event('change', { bubbles: true }));
        updateMethodFields(form, metodoEl.value);
    }
}

window.openYapeModal = openYapeModal;

function openYapeForm(modalId, inputId, number) {
    if (!modalId || !inputId || !number) return;
    if (typeof showModal === 'function') {
        showModal(modalId);
    } else {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('active');
    }

    const input = document.getElementById(inputId);
    if (input) {
        input.value = number;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
    }

    const form = input ? input.closest('form') : null;
    const metodoEl = form ? form.querySelector('[name=\"metodo\"]') : null;
    if (metodoEl) {
        metodoEl.value = 'Yape';
        metodoEl.dispatchEvent(new Event('change', { bubbles: true }));
        updateMethodFields(form, metodoEl.value);
    }
}

window.openYapeForm = openYapeForm;

function updateMethodFields(form, methodValue) {
    if (!form) return;
    const sections = form.querySelectorAll('.method-fields');
    sections.forEach((section) => {
        const method = section.getAttribute('data-method');
        if (method === methodValue) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
}

function applyMethodFields(form, record) {
    if (!form || !record.metodo) return;
    const method = record.metodo;
    if (method === 'Yape') {
        record.numero = form.querySelector('[name="yapeCelular"]')?.value || '';
        record.destino = form.querySelector('[name="yapeDestino"]')?.value || 'Yape';
        record.operacion = form.querySelector('[name="yapeOperacion"]')?.value || '';
        record.destinatario = form.querySelector('[name="yapeDestinatario"]')?.value || '';
        record.seguridad = form.querySelector('[name="yapeSeguridad"]')?.value || '';
    } else if (method === 'Plin') {
        record.numero = form.querySelector('[name="plinCelular"]')?.value || '';
        record.destino = form.querySelector('[name="plinDestino"]')?.value || 'Plin';
        record.operacion = form.querySelector('[name="plinOperacion"]')?.value || '';
        record.destinatario = form.querySelector('[name="plinDestinatario"]')?.value || '';
        record.comision = form.querySelector('[name="plinComision"]')?.value || '';
    } else if (method === 'Transferencia') {
        record.numero = form.querySelector('[name="transDestino"]')?.value || '';
        record.destino = form.querySelector('[name="transBanco"]')?.value || 'Transferencia';
        record.operacion = form.querySelector('[name="transOperacion"]')?.value || '';
        record.origen = form.querySelector('[name="transOrigen"]')?.value || '';
    }
}

function updateCajaSummary(items) {
    const ingresos = items.filter((item) => (item.tipo || '').toLowerCase() === 'ingreso');
    const salidas = items.filter((item) => (item.tipo || '').toLowerCase() === 'salida');
    const ingresosMonto = ingresos.reduce((sum, item) => sum + (parseFloat(item.monto) || 0), 0);
    const salidasMonto = salidas.reduce((sum, item) => sum + (parseFloat(item.monto) || 0), 0);

    const ingresosCountEl = document.getElementById('cajaIngresosCount');
    const salidasCountEl = document.getElementById('cajaSalidasCount');
    const ingresosMontoEl = document.getElementById('cajaIngresosMonto');
    const salidasMontoEl = document.getElementById('cajaSalidasMonto');

    if (ingresosCountEl) ingresosCountEl.textContent = String(ingresos.length);
    if (salidasCountEl) salidasCountEl.textContent = String(salidas.length);
    if (ingresosMontoEl) ingresosMontoEl.textContent = ingresosMonto.toFixed(2);
    if (salidasMontoEl) salidasMontoEl.textContent = salidasMonto.toFixed(2);
}

document.addEventListener('change', (event) => {
    const select = event.target.closest('select[name="metodo"]');
    if (!select) return;
    updateMethodFields(select.closest('form'), select.value);
});
