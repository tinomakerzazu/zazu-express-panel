/**
 * Utilidades de sanitización para prevenir XSS y otros ataques
 */

/**
 * Escapa HTML para prevenir XSS
 * @param {string} str - String a escapar
 * @returns {string} String escapado
 */
function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Sanitiza un string removiendo caracteres peligrosos
 * @param {string} str - String a sanitizar
 * @param {number} maxLength - Longitud máxima permitida
 * @returns {string} String sanitizado
 */
function sanitizeString(str, maxLength = 1000) {
    if (typeof str !== 'string') return '';
    // Remover caracteres de control excepto espacios, tabs y newlines
    let sanitized = str.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
    // Limitar longitud
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }
    return sanitized.trim();
}

/**
 * Sanitiza un número
 * @param {any} value - Valor a sanitizar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @param {number} defaultValue - Valor por defecto si es inválido
 * @returns {number} Número sanitizado
 */
function sanitizeNumber(value, min = -Infinity, max = Infinity, defaultValue = 0) {
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    if (isNaN(num)) return defaultValue;
    return Math.max(min, Math.min(max, num));
}

/**
 * Sanitiza una fecha
 * @param {any} value - Valor a sanitizar
 * @returns {string|null} Fecha en formato ISO o null
 */
function sanitizeDate(value) {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0]; // Solo fecha, sin hora
}

/**
 * Sanitiza un email
 * @param {string} email - Email a sanitizar
 * @returns {string|null} Email sanitizado o null
 */
function sanitizeEmail(email) {
    if (typeof email !== 'string') return null;
    const sanitized = email.trim().toLowerCase();
    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) return null;
    // Limitar longitud
    if (sanitized.length > 255) return null;
    return sanitized;
}

/**
 * Sanitiza un teléfono
 * @param {string} phone - Teléfono a sanitizar
 * @returns {string} Teléfono sanitizado (solo números)
 */
function sanitizePhone(phone) {
    if (typeof phone !== 'string') return '';
    // Remover todo excepto números
    return phone.replace(/\D/g, '').substring(0, 15);
}

/**
 * Crea un elemento de texto seguro (previene XSS)
 * @param {string} text - Texto a insertar
 * @returns {Text} Nodo de texto
 */
function createTextNode(text) {
    return document.createTextNode(String(text || ''));
}

/**
 * Inserta HTML de forma segura usando textContent
 * @param {HTMLElement} element - Elemento donde insertar
 * @param {string} text - Texto a insertar
 */
function setSafeText(element, text) {
    if (element) {
        element.textContent = String(text || '');
    }
}

/**
 * Crea un elemento HTML de forma segura
 * @param {string} tag - Tag del elemento
 * @param {Object} attributes - Atributos del elemento
 * @param {string|Node} content - Contenido (será escapado)
 * @returns {HTMLElement} Elemento creado
 */
function createSafeElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'innerHTML') {
            // Nunca usar innerHTML directamente
            element.textContent = String(value || '');
        } else if (key.startsWith('on')) {
            // Ignorar event handlers inline (riesgo de seguridad)
            console.warn(`Se ignoró atributo inseguro: ${key}`);
        } else {
            element.setAttribute(key, String(value || ''));
        }
    });
    if (content) {
        if (typeof content === 'string') {
            element.textContent = content;
        } else if (content instanceof Node) {
            element.appendChild(content);
        }
    }
    return element;
}

window.escapeHtml = escapeHtml;
window.sanitizeString = sanitizeString;
window.sanitizeNumber = sanitizeNumber;
window.sanitizeDate = sanitizeDate;
window.sanitizeEmail = sanitizeEmail;
window.sanitizePhone = sanitizePhone;
window.createTextNode = createTextNode;
window.setSafeText = setSafeText;
window.createSafeElement = createSafeElement;
