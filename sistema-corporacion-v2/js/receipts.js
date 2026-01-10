const RECEIPTS_KEY = 'zazuReceipts';

function loadReceipts() {
    try {
        const raw = localStorage.getItem(RECEIPTS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.error('Error leyendo registros', err);
        return [];
    }
}

function saveReceipts(list) {
    localStorage.setItem(RECEIPTS_KEY, JSON.stringify(list));
}

function getDayKey(date) {
    return date.toISOString().slice(0, 10);
}

function buildDailySeries(receipts, days = 14) {
    const today = new Date();
    const counts = {};
    receipts.forEach((item) => {
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

function renderBars(series) {
    const container = document.getElementById('dailyBars');
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

function updateStats(receipts) {
    const todayKey = getDayKey(new Date());
    const todayCount = receipts.filter((item) => item.registeredAt?.startsWith(todayKey)).length;
    const dailyCount = document.getElementById('dailyCount');
    if (dailyCount) dailyCount.textContent = `${todayCount} hoy`;

    const totalCount = document.getElementById('totalCount');
    if (totalCount) totalCount.textContent = `${receipts.length} comprobantes registrados`;

    const series = buildDailySeries(receipts);
    renderBars(series);
}

function setRegistroHora(value) {
    const registroHora = document.getElementById('registroHora');
    if (registroHora) registroHora.textContent = `Ultimo registro: ${value || '-'}`;
}

function collectReceipt() {
    const archivo = document.getElementById('archivo');
    const fileName = archivo?.files?.[0]?.name || '';
    return {
        proveedor: document.getElementById('proveedor')?.value || 'ZazuExpress',
        metodo: document.getElementById('metodo')?.value || '',
        monto: document.getElementById('monto')?.value || '',
        fecha: document.getElementById('fecha')?.value || '',
        hora: document.getElementById('hora')?.value || '',
        celular: document.getElementById('yapeCelular')?.value || '',
        destino: document.getElementById('yapeDestino')?.value || '',
        operacion: document.getElementById('yapeOperacion')?.value || '',
        fileName,
        registeredAt: new Date().toISOString()
    };
}

function registerReceipt(isDraft = false) {
    const list = loadReceipts();
    const receipt = collectReceipt();
    receipt.status = isDraft ? 'borrador' : 'enviado';
    list.push(receipt);
    saveReceipts(list);

    const registeredAt = new Date(receipt.registeredAt).toLocaleString('es-PE');
    setRegistroHora(registeredAt);
    updateStats(list);

    if (typeof showNotification === 'function') {
        showNotification(isDraft ? 'Borrador guardado.' : 'Comprobante guardado.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('comprobanteForm');
    const borradorBtn = document.getElementById('borradorBtn');

    const receipts = loadReceipts();
    updateStats(receipts);
    if (receipts.length) {
        const last = receipts[receipts.length - 1];
        setRegistroHora(new Date(last.registeredAt).toLocaleString('es-PE'));
    }

    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            registerReceipt(false);
            form.reset();
            const proveedor = document.getElementById('proveedor');
            if (proveedor) proveedor.value = 'ZazuExpress';
        });
    }

    if (borradorBtn) {
        borradorBtn.addEventListener('click', () => registerReceipt(true));
    }
});
