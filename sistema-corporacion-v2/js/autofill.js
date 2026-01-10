const MONTHS = {
    ene: 0,
    feb: 1,
    mar: 2,
    abr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    ago: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dic: 11
};

function parseMoney(text) {
    const clean = normalizeText(text);
    const match = clean.match(/s\s*\/?\s*([0-9][0-9.,]+)/i);
    if (match) {
        return normalizeAmount(match[1]);
    }

    const lines = clean.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    const currencyLine = lines.find((line) => /s\s*\/?/.test(line) && /[0-9]/.test(line));
    if (currencyLine) {
        const inline = currencyLine.match(/([0-9][0-9.,]+)/);
        if (inline) return normalizeAmount(inline[1]);
    }
    const currencyOnlyIndex = lines.findIndex((line) => /^s\s*\/?$/i.test(line));
    if (currencyOnlyIndex >= 0 && lines[currencyOnlyIndex + 1]) {
        const nextAmount = lines[currencyOnlyIndex + 1].match(/([0-9][0-9.,]+)/);
        if (nextAmount) return normalizeAmount(nextAmount[1]);
    }

    const nearTop = lines.slice(0, 6).find((line) => /^[0-9][0-9.,]{1,}$/i.test(line));
    if (nearTop) return normalizeAmount(nearTop);

    const fallback = clean.match(/([0-9]{1,4}(?:[.,][0-9]{2})?)/);
    if (!fallback) return '';
    return normalizeAmount(fallback[1]);
}

function normalizeAmount(value) {
    const raw = value.replace(/\s+/g, '');
    if (/,\d{2}$/.test(raw)) {
        return raw.replace(/\./g, '').replace(',', '.');
    }
    const normalized = raw.replace(/[.,](?=\d{3}(\D|$))/g, '');
    return normalized.replace(',', '.');
}

function parseOperacion(text) {
    const clean = normalizeText(text);
    const match = clean.match(/(codigo|numero|nro)\s*\.?\s*de\s*operacion\s*:?[\s\n]*([0-9\s]{6,})/i);
    if (match) return match[2].replace(/\s+/g, '');
    const alt = clean.match(/nro\s*\.?\s*operacion\s*[:\-]?\s*([0-9\s]{6,})/i);
    if (alt) return alt[1].replace(/\s+/g, '');
    const fallback = clean.match(/operacion\s*[:\-]?\s*([0-9\s]{6,})/i);
    if (fallback) return fallback[1].replace(/\s+/g, '');

    const lines = clean.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    for (let i = 0; i < lines.length; i += 1) {
        if (/nro/.test(lines[i].toLowerCase()) && /operacion/.test(lines[i].toLowerCase())) {
            const inline = lines[i].match(/([0-9]{6,})/);
            if (inline) return inline[1];
            const next = lines[i + 1] ? lines[i + 1].match(/([0-9]{6,})/) : null;
            if (next) return next[1];
        }
    }
    return '';
}

function parseMetodo(text) {
    const lower = normalizeText(text).toLowerCase();
    if (lower.includes('yape') || /y\s*a\s*p\s*e/.test(lower)) return 'Yape';
    if (lower.includes('plin') || /p[l1]in/.test(lower) || /p\s*l\s*[i1l]\s*n/.test(lower)) return 'Plin';
    if (lower.includes('transfer') || lower.includes('transferencia') || lower.includes('transferencia exitosa')) {
        return 'Transferencia';
    }
    if (/(bcp|interbank|bbva|scotiabank|banbif)/.test(lower)) {
        return 'Transferencia';
    }
    if (lower.includes('tarjeta')) return 'Tarjeta';
    if (lower.includes('efectivo')) return 'Efectivo';
    return '';
}

function parseProveedor(text) {
    const clean = normalizeText(text);
    const match = clean.match(/enviado\s+a\s*:?\s*([A-Za-z\s\.\*]+)(?:\n|$)/i);
    if (match) return match[1].trim();

    const amountMatch = clean.match(/s\s*\/?\s*[0-9]+(?:[\.,][0-9]{2})?\s*\n\s*([A-Za-z\s\*]{3,50})/i);
    if (amountMatch) return amountMatch[1].trim();

    const stop = ['yape', 'plin', 'pago', 'comision', 'destino', 'fecha', 'hora', 'codigo', 'operacion', 'transferencia', 'exitosa'];
    const lines = clean.split(/\n+/).map(line => line.trim()).filter(Boolean);
    const candidate = lines.find(line => {
        const lower = line.toLowerCase();
        const hasLetters = /[A-Za-z]/.test(line);
        const hasDigits = /\d/.test(line);
        const isStop = stop.some(word => lower.includes(word));
        return hasLetters && !hasDigits && !isStop && line.length <= 50;
    });
    return candidate || '';
}

function parseCelular(text) {
    const clean = normalizeText(text);
    const match = clean.match(/(\d[\d\s]{7,}\d)/);
    if (match) {
        const digits = match[1].replace(/\D/g, '');
        if (digits.length === 9) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
        return digits;
    }

    const masked = clean.match(/\*+\s*\*+\s*(\d{3})/);
    if (masked) return `*** *** ${masked[1]}`;

    const lines = clean.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    for (let i = 0; i < lines.length; i += 1) {
        if (lines[i].toLowerCase().includes('celular')) {
            const inline = lines[i].match(/(\d{9})/);
            if (inline) return `${inline[1].slice(0, 3)} ${inline[1].slice(3, 6)} ${inline[1].slice(6)}`;
            const inlineMasked = lines[i].match(/\*+\s*\*+\s*(\d{3})/);
            if (inlineMasked) return `*** *** ${inlineMasked[1]}`;
            const next = lines[i + 1] ? lines[i + 1].match(/(\d{9})/) : null;
            if (next) return `${next[1].slice(0, 3)} ${next[1].slice(3, 6)} ${next[1].slice(6)}`;
        }
    }

    return '';
}

function parseCodigoSeguridad(text) {
    const clean = normalizeText(text);
    const match = clean.match(/codigo\s+de\s+seguridad\s*:?\s*([0-9]{3})/i);
    return match ? match[1] : '';
}

function parseDestino(text) {
    const clean = normalizeText(text);
    const lineMatch = clean.match(/destino\s*:?\s*([A-Za-z\s]+)/i);
    if (lineMatch) {
        const raw = lineMatch[1].trim();
        const trimmed = raw.replace(/\b(nro|numero|operacion|de)\b.*$/i, '').trim();
        return trimmed || raw;
    }

    const lines = clean.split(/\n+/).map(line => line.trim()).filter(Boolean);
    for (let i = 0; i < lines.length; i += 1) {
        if (lines[i].toLowerCase().startsWith('destino')) {
            const rest = lines[i].replace(/destino\s*:?\s*/i, '').trim();
            if (rest) {
                const trimmed = rest.replace(/\b(nro|numero|operacion|de)\b.*$/i, '').trim();
                return trimmed || rest;
            }
            if (lines[i + 1]) return lines[i + 1].trim();
        }
    }
    return '';
}

function parseComision(text) {
    const clean = normalizeText(text);
    const match = clean.match(/comision\s*:?\s*([A-Za-z]+)/i);
    return match ? match[1].trim() : '';
}

function parseBanco(text) {
    const clean = normalizeText(text);
    const match = clean.match(/(bcp|interbank|bbva|scotiabank|banbif)/i);
    return match ? match[1].toUpperCase() : '';
}

function parseCuentaOrigen(text) {
    const clean = normalizeText(text);
    const match = clean.match(/desde\s*\n?\s*([^\n]+)/i);
    return match ? match[1].trim() : '';
}

function parseCuentaDestino(text) {
    const clean = normalizeText(text);
    const match = clean.match(/enviado\s+a\s*\n?\s*([^\n]+)/i);
    return match ? match[1].trim() : '';
}

function parseHora(text) {
    const clean = normalizeText(text);
    const match = clean.match(/(\d{1,2}):(\d{2})\s*([ap])?\.?\s*m?\.?/i);
    if (!match) return '';
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const meridiem = match[3] ? match[3].toLowerCase() : '';
    if (meridiem === 'p' && hours < 12) hours += 12;
    if (meridiem === 'a' && hours === 12) hours = 0;
    const hh = String(hours).padStart(2, '0');
    return `${hh}:${minutes}`;
}

function normalizeDate(day, monthLabel, year) {
    const cleaned = monthLabel.toLowerCase().replace(/[^a-z]/g, '');
    const key = cleaned.slice(0, 3);
    const monthIndex = MONTHS[key];
    if (monthIndex === undefined) return '';
    const month = String(monthIndex + 1).padStart(2, '0');
    const dayVal = String(day).padStart(2, '0');
    return `${year}-${month}-${dayVal}`;
}

function parseFecha(text) {
    const clean = normalizeText(text);
    const compact = clean.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (compact) return `${compact[3]}-${compact[2]}-${compact[1]}`;

    const match = clean.match(/fecha\s+y\s+hora\s*:\s*([0-9]{1,2})\s+([A-Za-z\.]+)\s+([0-9]{4})/i);
    if (match) return normalizeDate(match[1], match[2], match[3]);

    const alt = clean.match(/(\d{1,2})\s+([A-Za-z\.]+)\s+([0-9]{4})/i);
    if (alt) return normalizeDate(alt[1], alt[2], alt[3]);

    return '';
}

function normalizeText(text) {
    if (!text) return '';
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function fillField(id, value) {
    const el = document.getElementById(id);
    if (!el || !value) return;
    el.value = value;
}

function updateMetodoFields(methodValue) {
    const sections = document.querySelectorAll('.method-fields');
    sections.forEach(section => {
        const method = section.getAttribute('data-method');
        if (method === methodValue) {
            section.classList.add('active');
        } else if (method === 'default' && !['Yape', 'Plin', 'Transferencia'].includes(methodValue)) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
}

function fillFromText(text) {
    if (!text.trim()) return;

    fillField('monto', parseMoney(text));
    fillField('fecha', parseFecha(text));
    const horaEl = document.getElementById('hora');
    if (horaEl && !horaEl.value) {
        fillField('hora', parseHora(text));
    }

    const metodo = parseMetodo(text);
    const metodoEl = document.getElementById('metodo');
    if (metodoEl && metodo) metodoEl.value = metodo;
    updateMetodoFields(metodo || (metodoEl ? metodoEl.value : ''));

    fillField('yapeDestinatario', parseProveedor(text));
    fillField('yapeCelular', parseCelular(text));
    fillField('yapeDestino', parseDestino(text));
    fillField('yapeCodigoSeguridad', parseCodigoSeguridad(text));
    fillField('yapeOperacion', parseOperacion(text));

    fillField('plinEnviado', parseProveedor(text));
    fillField('plinCelular', parseCelular(text));
    fillField('plinDestino', parseDestino(text));
    fillField('plinComision', parseComision(text));
    fillField('plinOperacion', parseOperacion(text));

    fillField('transBanco', parseBanco(text));
    fillField('transMontoCuenta', parseCuentaOrigen(text));
    fillField('transDestino', parseCuentaDestino(text));
    fillField('transOperacion', parseOperacion(text));
}

async function ocrAutofill() {
    const input = document.getElementById('archivo');
    const status = document.getElementById('ocrStatus');
    seedHora();
    if (!input || !input.files || !input.files.length) {
        if (status) status.textContent = 'Selecciona una imagen para leer.';
        return;
    }
    const file = input.files[0];
    if (file.type === 'application/pdf') {
        if (status) status.textContent = 'OCR solo disponible para imagenes.';
        return;
    }
    if (!window.Tesseract) {
        if (status) status.textContent = 'OCR no disponible.';
        return;
    }

    if (status) status.textContent = 'Leyendo comprobante...';
    try {
        const result = await window.Tesseract.recognize(file, 'spa');
        const text = result?.data?.text || '';
        fillFromText(text);
        if (status) status.textContent = 'Comprobante leido.';
    } catch (err) {
        if (status) status.textContent = 'No se pudo leer el comprobante.';
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const ocrBtn = document.getElementById('ocrBtn');
    const metodoEl = document.getElementById('metodo');
    const archivoEl = document.getElementById('archivo');

    seedHora();
    if (ocrBtn) ocrBtn.addEventListener('click', ocrAutofill);
    if (archivoEl) archivoEl.addEventListener('change', ocrAutofill);
    if (metodoEl) {
        updateMetodoFields(metodoEl.value);
        metodoEl.addEventListener('change', (event) => updateMetodoFields(event.target.value));
    }
});

function seedHora() {
    const horaEl = document.getElementById('hora');
    if (!horaEl || horaEl.value) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    horaEl.value = `${hh}:${mm}`;
}
