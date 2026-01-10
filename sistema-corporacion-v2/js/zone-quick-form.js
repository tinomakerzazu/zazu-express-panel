function openQuickModal(modalId, inputId, number, method, cajaType) {
    const modal = document.getElementById(modalId);
    if (modal) {
        if (typeof showModal === 'function') {
            showModal(modalId);
        } else {
            modal.classList.add('active');
        }
    }

    const input = inputId ? document.getElementById(inputId) : null;
    if (input && number) {
        input.value = number;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
    }

    const form = modal ? modal.querySelector('form') : null;
    if (form) {
        const cajaSelect = form.querySelector('[name="caja"]');
        if (cajaSelect) {
            const activeBtn = document.querySelector('#cajaStatusToggle .status-toggle-btn.active');
            if (activeBtn) {
                cajaSelect.value = activeBtn.getAttribute('data-caja') || cajaSelect.value;
            }
        }
        const celular = form.querySelector('[name="celular"]');
        if (celular && number) celular.value = number;
        const destino = form.querySelector('[name="destino"]');
        if (destino && !destino.value) destino.value = 'Yape';
        const metodo = form.querySelector('[name="metodo"]');
        if (metodo && method) {
            metodo.value = method;
        } else if (metodo && number) {
            metodo.value = 'Yape';
        }
        if (cajaType) {
            const cajaSelect = form.querySelector('[name="caja"]');
            if (cajaSelect) cajaSelect.value = cajaType;
        }
        const fecha = form.querySelector('[name="fecha"]');
        if (fecha && !fecha.value) {
            fecha.value = new Date().toISOString().slice(0, 10);
        }
        const hora = form.querySelector('[name="hora"]');
        if (hora) {
            hora.value = new Date().toTimeString().slice(0, 5);
        }
    }
}

function getSupabaseClient() {
    return window.supabaseClient || null;
}

function getSupabaseTable(zone) {
    if (zone === 'lima') return 'comprobantes_lima';
    if (zone === 'provincia') return 'comprobantes_provincia';
    if (zone === 'caja') return 'comprobantes_caja';
    return '';
}

function getZoneFromFormId(formId) {
    if (formId === 'limaQuickForm') return 'lima';
    if (formId === 'provinciaQuickForm') return 'provincia';
    if (formId === 'cajaQuickForm') return 'caja';
    return '';
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

async function syncSupabaseTable(zone) {
    const client = getSupabaseClient();
    const table = getSupabaseTable(zone);
    if (!client || !table) return;
    const { data, error } = await client
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });
    if (error) return;
    const items = (data || []).map(mapSupabaseRow);
    const key = zone === 'lima'
        ? 'quickReceiptsLima'
        : zone === 'provincia'
            ? 'quickReceiptsProvincia'
            : 'quickReceiptsCaja';
    localStorage.setItem(key, JSON.stringify(items));
}

async function syncAllSupabase() {
    await Promise.all(['lima', 'provincia', 'caja'].map((zone) => syncSupabaseTable(zone)));
}

async function insertSupabaseReceipt(zone, payload) {
    const client = getSupabaseClient();
    const table = getSupabaseTable(zone);
    if (!client || !table) return false;
    const { error } = await client.from(table).insert(payload);
    return !error;
}

async function deleteSupabaseReceipt(zone, id) {
    const client = getSupabaseClient();
    const table = getSupabaseTable(zone);
    if (!client || !table || !id) return false;
    const { error } = await client.from(table).delete().eq('id', id);
    return !error;
}

function getStorageKey(formId) {
    if (formId === 'limaQuickForm') return 'quickReceiptsLima';
    if (formId === 'provinciaQuickForm') return 'quickReceiptsProvincia';
    if (formId === 'cajaQuickForm') return 'quickReceiptsCaja';
    return 'quickReceipts';
}

async function saveQuickReceipt(form, imageMeta) {
    const formId = form.getAttribute('id') || '';
    const zone = getZoneFromFormId(formId);
    const key = getStorageKey(formId);
    const horaField = form.querySelector('[name="hora"]');
    if (horaField) {
        horaField.value = new Date().toTimeString().slice(0, 5);
    }
    const imageData = imageMeta && imageMeta.imageData ? imageMeta.imageData : '';
    const imagePath = imageMeta && imageMeta.imagePath ? imageMeta.imagePath : '';
    const imageUrl = imageMeta && imageMeta.imageUrl ? imageMeta.imageUrl : '';
    const payload = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        numero: form.querySelector('[name="numero"]')?.value || '',
        celular: form.querySelector('[name="celular"]')?.value || '',
        monto: form.querySelector('[name="monto"]')?.value || '',
        fecha: form.querySelector('[name="fecha"]')?.value || '',
        hora: form.querySelector('[name="hora"]')?.value || '',
        metodo: form.querySelector('[name="metodo"]')?.value || '',
        caja: form.querySelector('[name="caja"]')?.value || '',
        tipo: form.querySelector('[name="tipo"]')?.value || '',
        destinatario: form.querySelector('[name="destinatario"]')?.value || '',
        destino: form.querySelector('[name="destino"]')?.value || '',
        operacion: form.querySelector('[name="operacion"]')?.value || '',
        seguridad: form.querySelector('[name="seguridad"]')?.value || '',
        concepto: form.querySelector('[name="concepto"]')?.value || '',
        imageData: imageUrl || imageData || '',
        createdAt: new Date().toISOString()
    };
    const supabasePayload = {
        numero: payload.numero || null,
        celular: payload.celular || null,
        monto: payload.monto || null,
        fecha: payload.fecha || null,
        hora: payload.hora || null,
        metodo: payload.metodo || null,
        caja: payload.caja || null,
        tipo: payload.tipo || null,
        destinatario: payload.destinatario || null,
        destino: payload.destino || null,
        operacion: payload.operacion || null,
        seguridad: payload.seguridad || null,
        concepto: payload.concepto || null,
        image_path: imagePath || null,
        image_url: imageUrl || null
    };
    const stored = await insertSupabaseReceipt(zone, supabasePayload);
    if (stored) {
        await syncSupabaseTable(zone);
        return;
    }
    const items = JSON.parse(localStorage.getItem(key) || '[]');
    items.push(payload);
    localStorage.setItem(key, JSON.stringify(items));
}

function buildSeries(items, days = 7) {
    const today = new Date();
    const counts = {};
    items.forEach((item) => {
        const source = item.fecha || item.createdAt;
        if (!source) return;
        const key = source.slice(0, 10);
        counts[key] = (counts[key] || 0) + 1;
    });

    const series = [];
    for (let i = days - 1; i >= 0; i -= 1) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const key = date.toISOString().slice(0, 10);
        series.push({
            label: String(date.getDate()).padStart(2, '0'),
            value: counts[key] || 0
        });
    }
    return series;
}

function renderChart(zone, series) {
    const chart = document.getElementById(`${zone}Chart`);
    const labels = document.getElementById(`${zone}ChartLabels`);
    if (!chart || !labels) return;

    labels.querySelectorAll('span').forEach((span, index) => {
        if (series[index]) span.textContent = series[index].label;
    });

    const values = series.map((item) => item.value);
    const max = Math.max(1, ...values);
    const width = 360;
    const height = 100;
    const startX = 10;
    const startY = 120;
    const step = width / (series.length - 1 || 1);

    const points = series.map((item, index) => {
        const x = startX + step * index;
        const y = startY - (item.value / max) * height;
        return `${x} ${y}`;
    });

    const linePath = `M${points.join(' L')}`;
    const areaPath = `${linePath} L${startX + step * (series.length - 1)} 130 L${startX} 130 Z`;

    const line = chart.querySelector('.line');
    const area = chart.querySelector('.area');
    if (line) line.setAttribute('d', linePath);
    if (area) area.setAttribute('d', areaPath);
}

function refreshCharts() {
    const lima = JSON.parse(localStorage.getItem('quickReceiptsLima') || '[]');
    const provincia = JSON.parse(localStorage.getItem('quickReceiptsProvincia') || '[]');
    const caja = JSON.parse(localStorage.getItem('quickReceiptsCaja') || '[]');
    renderChart('lima', buildSeries(lima));
    renderChart('provincia', buildSeries(provincia));
    renderChart('caja', buildSeries(caja));
}

function renderQuickTable(zone, items, filteredItems) {
    const tbody = document.getElementById(`${zone}QuickTableBody`);
    if (!tbody) return;
    const rows = filteredItems || items;
    if (!rows.length) {
        const colSpan = zone === 'caja' ? 8 : 9;
        tbody.innerHTML = `<tr><td colspan="${colSpan}" class="text-muted">Sin comprobantes registrados</td></tr>`;
        return;
    }
    tbody.innerHTML = rows.map((item, index) => {
        const fecha = item.fecha || '-';
        const hora = item.hora || '-';
        const metodo = item.metodo || '-';
        const numero = item.numero || '-';
        const monto = item.monto ? `S/ ${parseFloat(item.monto || 0).toFixed(2)}` : '-';
        const operacion = item.operacion || '-';
        const destinatario = item.destinatario || '-';
        const preview = item.imageData
            ? `<img class="preview-thumb" src="${item.imageData}" alt="Comprobante">`
            : '<span class="text-muted">Sin imagen</span>';
        const viewBtn = `<button class="btn btn-secondary btn-sm" type="button" data-preview="${item.imageData || ''}" ${item.imageData ? '' : 'disabled'}>Ver</button>`;
        const rowId = item.id || '';
        if (zone === 'caja') {
            const caja = item.caja || '-';
            const tipo = item.tipo || '-';
            const concepto = item.concepto || '-';
            return `<tr>
            <td>${fecha}</td>
            <td>${hora}</td>
            <td>${caja}</td>
            <td>${tipo}</td>
            <td>${monto}</td>
            <td>${concepto}</td>
            <td>${preview}</td>
            <td>
                ${viewBtn}
                <button class="btn btn-danger btn-sm" type="button" data-delete="${rowId}" data-index="${index}">Eliminar</button>
            </td>
        </tr>`;
        }
        return `<tr>
            <td>${fecha}</td>
            <td>${hora}</td>
            <td>${metodo}</td>
            <td>${numero}</td>
            <td>${monto}</td>
            <td>${operacion}</td>
            <td>${destinatario}</td>
            <td>${preview}</td>
            <td>
                ${viewBtn}
                <button class="btn btn-danger btn-sm" type="button" data-delete="${rowId}" data-index="${index}">Eliminar</button>
            </td>
        </tr>`;
    }).join('');
}

function refreshTables() {
    const lima = JSON.parse(localStorage.getItem('quickReceiptsLima') || '[]');
    const provincia = JSON.parse(localStorage.getItem('quickReceiptsProvincia') || '[]');
    const caja = JSON.parse(localStorage.getItem('quickReceiptsCaja') || '[]');
    renderQuickTable('lima', lima, applyFilters('lima', lima));
    renderQuickTable('provincia', provincia, applyFilters('provincia', provincia));
    renderQuickTable('caja', caja, applyFilters('caja', caja));
}

const quickFilters = {
    lima: { query: '', metodo: '', fecha: '' },
    provincia: { query: '', metodo: '', fecha: '' },
    caja: { query: '', metodo: '', fecha: '', caja: '' }
};

function applyFilters(zone, items) {
    const filters = quickFilters[zone] || { query: '', metodo: '', fecha: '' };
    return items.filter((item) => {
        const query = filters.query.trim().toLowerCase();
        const matchQuery = !query || [
            item.numero,
            item.destinatario,
            item.operacion,
            item.concepto
        ].some((value) => String(value || '').toLowerCase().includes(query));
        const matchMetodo = !filters.metodo || item.metodo === filters.metodo;
        const matchCaja = !filters.caja || item.caja === filters.caja;
        const matchFecha = !filters.fecha || item.fecha === filters.fecha;
        return matchQuery && matchMetodo && matchCaja && matchFecha;
    });
}

function bindTableFilters() {
    document.querySelectorAll('.filter-input, .filter-select').forEach((input) => {
        input.addEventListener('input', () => {
            const zone = input.getAttribute('data-zone');
            const filter = input.getAttribute('data-filter');
            if (!zone || !filter || !quickFilters[zone]) return;
            quickFilters[zone][filter] = input.value || '';
            refreshTables();
        });
    });
}

function exportExcel(zone) {
    const items = JSON.parse(localStorage.getItem(`quickReceipts${zone[0].toUpperCase()}${zone.slice(1)}`) || '[]');
    const rows = applyFilters(zone, items);
    const header = zone === 'caja'
        ? ['Fecha', 'Hora', 'Caja', 'Tipo', 'Monto', 'Concepto']
        : ['Fecha', 'Hora', 'Metodo', 'Numero', 'Monto', 'Operacion', 'Destinatario'];
    const table = `
        <table>
            <thead><tr>${header.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>
                ${rows.map((item) => zone === 'caja'
                    ? `
                    <tr>
                        <td>${item.fecha || ''}</td>
                        <td>${item.hora || ''}</td>
                        <td>${item.caja || ''}</td>
                        <td>${item.tipo || ''}</td>
                        <td>${item.monto || ''}</td>
                        <td>${item.concepto || ''}</td>
                    </tr>
                    `
                    : `
                    <tr>
                        <td>${item.fecha || ''}</td>
                        <td>${item.hora || ''}</td>
                        <td>${item.metodo || ''}</td>
                        <td>${item.numero || ''}</td>
                        <td>${item.monto || ''}</td>
                        <td>${item.operacion || ''}</td>
                        <td>${item.destinatario || ''}</td>
                    </tr>
                    `
                ).join('')}
            </tbody>
        </table>
    `;
    const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comprobantes-${zone}.xls`;
    link.click();
    URL.revokeObjectURL(url);
}

function exportPDF(zone) {
    const items = JSON.parse(localStorage.getItem(`quickReceipts${zone[0].toUpperCase()}${zone.slice(1)}`) || '[]');
    const rows = applyFilters(zone, items);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write('<html><head><title>Comprobantes</title></head><body>');
    win.document.write(`<h2>Comprobantes ${zone}</h2>`);
    win.document.write('<table border="1" cellspacing="0" cellpadding="6">');
    if (zone === 'caja') {
        win.document.write('<tr><th>Fecha</th><th>Hora</th><th>Caja</th><th>Tipo</th><th>Monto</th><th>Concepto</th></tr>');
        rows.forEach((item) => {
            win.document.write(`<tr>
                <td>${item.fecha || ''}</td>
                <td>${item.hora || ''}</td>
                <td>${item.caja || ''}</td>
                <td>${item.tipo || ''}</td>
                <td>${item.monto || ''}</td>
                <td>${item.concepto || ''}</td>
            </tr>`);
        });
    } else {
        win.document.write('<tr><th>Fecha</th><th>Hora</th><th>Metodo</th><th>Numero</th><th>Monto</th><th>Operacion</th><th>Destinatario</th></tr>');
        rows.forEach((item) => {
            win.document.write(`<tr>
            <td>${item.fecha || ''}</td>
            <td>${item.hora || ''}</td>
            <td>${item.metodo || ''}</td>
            <td>${item.numero || ''}</td>
            <td>${item.monto || ''}</td>
            <td>${item.operacion || ''}</td>
            <td>${item.destinatario || ''}</td>
        </tr>`);
        });
    }
    win.document.write('</table></body></html>');
    win.document.close();
    win.focus();
    win.print();
}

function bindExportButtons() {
    document.querySelectorAll('[data-export]').forEach((button) => {
        button.addEventListener('click', () => {
            const zone = button.getAttribute('data-zone');
            const type = button.getAttribute('data-export');
            if (!zone) return;
            if (type === 'excel') exportExcel(zone);
            if (type === 'pdf') exportPDF(zone);
        });
    });
}

function bindTableActions() {
    document.addEventListener('click', async (event) => {
        const deleteBtn = event.target.closest('[data-delete]');
        if (deleteBtn) {
            const id = deleteBtn.getAttribute('data-delete');
            const zone = deleteBtn.closest('tbody')?.getAttribute('data-zone') || 'provincia';
            const deleted = await deleteSupabaseReceipt(zone, id);
            if (deleted) {
                await syncSupabaseTable(zone);
                refreshCharts();
                refreshTables();
                window.dispatchEvent(new CustomEvent('quickReceiptsUpdated'));
                return;
            }
            const key = zone === 'lima'
                ? 'quickReceiptsLima'
                : zone === 'caja'
                    ? 'quickReceiptsCaja'
                    : 'quickReceiptsProvincia';
            const items = JSON.parse(localStorage.getItem(key) || '[]');
            const index = Number(deleteBtn.getAttribute('data-index'));
            let next = items;
            if (id) {
                next = items.filter((item) => item.id !== id);
            } else if (!Number.isNaN(index)) {
                next = items.filter((_, idx) => idx !== index);
            }
            localStorage.setItem(key, JSON.stringify(next));
            refreshCharts();
            refreshTables();
            window.dispatchEvent(new CustomEvent('quickReceiptsUpdated'));
            return;
        }
        const previewBtn = event.target.closest('[data-preview]');
        if (previewBtn) {
            const img = previewBtn.getAttribute('data-preview');
            if (!img) return;
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="bi bi-image"></i> Comprobante</h2>
                        <button class="close-btn" type="button">x</button>
                    </div>
                    <div class="modal-body">
                        <div class="image-preview"><img src="${img}" alt="Comprobante"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            modal.querySelector('.close-btn')?.addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });
        }
    });
}

function bindQuickNumberButtons() {
    document.querySelectorAll('.quick-number-btn').forEach((button) => {
        button.addEventListener('click', () => {
            const number = button.getAttribute('data-quick-number');
            const method = button.getAttribute('data-quick-method');
            const cajaType = button.getAttribute('data-quick-caja');
            const modalId = button.getAttribute('data-modal');
            const inputId = button.getAttribute('data-input');
            if (!modalId) return;
            if (!number && !method && !cajaType) return;
            openQuickModal(modalId, inputId, number, method, cajaType);
        });
    });
}

function bindQuickForms() {
    document.querySelectorAll('.quick-form').forEach((form) => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const fileInput = form.querySelector('input[type="file"]');
            const file = fileInput?.files?.[0];
            const finishSave = async (imageMeta) => {
                await saveQuickReceipt(form, imageMeta);
                const modal = form.closest('.modal');
                if (modal && typeof closeModal === 'function') {
                    closeModal(modal.id);
                } else if (modal) {
                    modal.classList.remove('active');
                }
                if (typeof showNotification === 'function') {
                    showNotification('Comprobante registrado', 'success');
                }
                form.reset();
                const preview = form.querySelector('.image-preview');
                if (preview) {
                    preview.innerHTML = '<span>Sin imagen</span>';
                }
                refreshCharts();
                refreshTables();
                window.dispatchEvent(new CustomEvent('quickReceiptsUpdated'));
            };
            if (file) {
                const imageMeta = await handleReceiptImage(file);
                await finishSave(imageMeta);
            } else {
                await finishSave({ imageData: '' });
            }
        });
    });
}

function bindCajaToggle() {
    const container = document.getElementById('cajaStatusToggle');
    if (!container) return;
    container.querySelectorAll('.status-toggle-btn').forEach((button) => {
        button.addEventListener('click', () => {
            container.querySelectorAll('.status-toggle-btn').forEach((btn) => btn.classList.remove('active'));
            button.classList.add('active');
            refreshCharts();
            refreshTables();
        });
    });
}

function bindImagePreviews() {
    document.querySelectorAll('.quick-form input[type=\"file\"]').forEach((input) => {
        const preview = input.parentElement.querySelector('.image-preview');
        if (!preview) return;
        input.addEventListener('change', () => {
            const file = input.files && input.files[0];
            if (!file) {
                preview.innerHTML = '<span>Sin imagen</span>';
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                preview.innerHTML = `<img src=\"${reader.result}\" alt=\"Previsualizacion\">`;
            };
            reader.readAsDataURL(file);
        });
    });
}

function getStorageBucket() {
    return 'comprobantes';
}

function fileToDataUrl(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result || '');
        reader.readAsDataURL(file);
    });
}

function compressImage(file, maxWidth = 1200, quality = 0.7) {
    return new Promise((resolve) => {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = () => {
            img.onload = () => {
                const scale = Math.min(1, maxWidth / img.width);
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }
                canvas.toBlob(
                    (blob) => {
                        resolve(blob || file);
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

async function uploadToSupabaseStorage(file) {
    const client = getSupabaseClient();
    if (!client) return null;
    const bucket = getStorageBucket();
    const compressed = await compressImage(file);
    const extension = 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}.${extension}`;
    const filePath = `comprobantes/${fileName}`;
    const { error } = await client.storage
        .from(bucket)
        .upload(filePath, compressed, { upsert: false, contentType: 'image/jpeg' });
    if (error) return null;
    const publicUrl = client.storage.from(bucket).getPublicUrl(filePath)?.data?.publicUrl || '';
    return {
        imagePath: filePath,
        imageUrl: publicUrl
    };
}

async function handleReceiptImage(file) {
    const uploaded = await uploadToSupabaseStorage(file);
    if (uploaded && uploaded.imageUrl) {
        return {
            imagePath: uploaded.imagePath,
            imageUrl: uploaded.imageUrl,
            imageData: uploaded.imageUrl
        };
    }
    const compressed = await compressImage(file);
    const imageData = await fileToDataUrl(compressed);
    return { imageData };
}

function applyDemoOCR(form) {
    if (!form) return;
    const now = new Date();
    const dateValue = now.toISOString().slice(0, 10);
    const timeValue = now.toTimeString().slice(0, 5);

    const demo = {
        monto: '75.00',
        destinatario: 'Jessica Roj*',
        operacion: '31932156',
        seguridad: '156'
    };

    const setValue = (name, value) => {
        const input = form.querySelector(`[name="${name}"]`);
        if (input && !input.value) {
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };

    setValue('monto', demo.monto);
    setValue('destinatario', demo.destinatario);
    setValue('operacion', demo.operacion);
    setValue('seguridad', demo.seguridad);
    setValue('fecha', dateValue);
    setValue('hora', timeValue);
}

function bindDemoOCRButtons() {
    document.querySelectorAll('.ocr-demo-btn').forEach((button) => {
        button.addEventListener('click', () => {
            const formId = button.getAttribute('data-form');
            const form = document.getElementById(formId);
            applyDemoOCR(form);
            if (typeof showNotification === 'function') {
                showNotification('Lectura demo aplicada', 'success');
            }
        });
    });
}

async function initQuickForms() {
    bindQuickNumberButtons();
    bindQuickForms();
    bindImagePreviews();
    bindDemoOCRButtons();
    bindTableFilters();
    bindExportButtons();
    bindTableActions();
    bindCajaToggle();
    await syncAllSupabase();
    refreshCharts();
    refreshTables();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuickForms);
} else {
    initQuickForms();
}
