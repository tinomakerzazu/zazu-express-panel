const exportAdvancedReportBtn = document.getElementById('exportAdvancedReportBtn');
const inconsistencyList = document.getElementById('inconsistencyList');

function exportAdvancedReport() {
    const titulo = 'Reporte avanzado';
    const fecha = new Date().toLocaleString('es-PE');
    const indicadores = Array.from(document.querySelectorAll('.stats-grid .stat-info')).map(info => {
        const value = info.querySelector('h3')?.textContent?.trim() || '-';
        const label = info.querySelector('p')?.textContent?.trim() || '-';
        return `${label}: ${value}`;
    });

    const claves = Array.from(document.querySelectorAll('.content-grid .list-item')).map(item => item.textContent.trim());

    const contenido = [
        titulo,
        `Generado: ${fecha}`,
        '',
        'Indicadores:',
        ...indicadores,
        '',
        'Notas clave:',
        ...claves
    ].join('\n');

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_avanzado_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
}

if (exportAdvancedReportBtn) {
    exportAdvancedReportBtn.addEventListener('click', exportAdvancedReport);
}

function normalizeNumber(value) {
    if (value === null || value === undefined) return 0;
    const cleaned = String(value).replace(',', '.').replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
}

function buildInconsistencySummary(items, label) {
    const summary = {
        missingAmount: 0,
        missingDate: 0,
        missingImage: 0,
        missingOperacion: 0,
        missingConcepto: 0,
        missingTipo: 0
    };

    items.forEach((item) => {
        const monto = normalizeNumber(item.monto);
        if (!monto) summary.missingAmount += 1;
        if (!item.fecha || !item.hora) summary.missingDate += 1;
        if (!item.imageData) summary.missingImage += 1;
        if (item.metodo === 'Yape' && !item.operacion) summary.missingOperacion += 1;
        if (label === 'Caja' && !item.concepto) summary.missingConcepto += 1;
        if (label === 'Caja' && !item.tipo) summary.missingTipo += 1;
    });
    return { label, summary };
}

function renderInconsistencies() {
    if (!inconsistencyList) return;
    // Función helper para parsear de forma segura
    const safeParse = (key) => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : [];
        } catch (err) {
            console.error(`Error al parsear ${key}:`, err);
            localStorage.removeItem(key);
            return [];
        }
    };
    const lima = safeParse('quickReceiptsLima');
    const provincia = safeParse('quickReceiptsProvincia');
    const caja = safeParse('quickReceiptsCaja');

    const summaries = [
        buildInconsistencySummary(lima, 'Lima'),
        buildInconsistencySummary(provincia, 'Provincia'),
        buildInconsistencySummary(caja, 'Caja')
    ];

    const rows = [];
    summaries.forEach((entry) => {
        const { label, summary } = entry;
        if (summary.missingAmount) rows.push(`${label}: ${summary.missingAmount} sin monto`);
        if (summary.missingDate) rows.push(`${label}: ${summary.missingDate} sin fecha/hora`);
        if (summary.missingImage) rows.push(`${label}: ${summary.missingImage} sin imagen`);
        if (summary.missingOperacion) rows.push(`${label}: ${summary.missingOperacion} sin nro. de operacion`);
        if (summary.missingConcepto) rows.push(`${label}: ${summary.missingConcepto} sin concepto`);
        if (summary.missingTipo) rows.push(`${label}: ${summary.missingTipo} sin tipo`);
    });

    if (!rows.length) {
        inconsistencyList.innerHTML = '<div class="list-item text-center text-muted">Sin alertas detectadas</div>';
        return;
    }
    inconsistencyList.innerHTML = rows.slice(0, 6).map((item) => `<div class="list-item">${item}</div>`).join('');
}

function bindInconsistencyUpdates() {
    renderInconsistencies();
    window.addEventListener('storage', (event) => {
        if (event && event.key && event.key.startsWith('quickReceipts')) {
            renderInconsistencies();
        }
    });
    window.addEventListener('quickReceiptsUpdated', renderInconsistencies);
}

bindInconsistencyUpdates();

window.exportAdvancedReport = exportAdvancedReport;
