/**
 * Utilidades de validación de datos
 */

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} true si es válido
 */
function isValidEmail(email) {
    if (typeof email !== 'string' || !email.trim()) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim()) && email.length <= 255;
}

/**
 * Valida un número
 * @param {any} value - Valor a validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean} true si es válido
 */
function isValidNumber(value, min = -Infinity, max = Infinity) {
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    return !isNaN(num) && num >= min && num <= max;
}

/**
 * Valida una fecha
 * @param {any} value - Valor a validar
 * @returns {boolean} true si es válido
 */
function isValidDate(value) {
    if (!value) return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
}

/**
 * Valida un teléfono
 * @param {string} phone - Teléfono a validar
 * @param {number} minLength - Longitud mínima
 * @param {number} maxLength - Longitud máxima
 * @returns {boolean} true si es válido
 */
function isValidPhone(phone, minLength = 9, maxLength = 15) {
    if (typeof phone !== 'string') return false;
    const digits = phone.replace(/\D/g, '');
    return digits.length >= minLength && digits.length <= maxLength;
}

/**
 * Valida la longitud de un string
 * @param {string} str - String a validar
 * @param {number} minLength - Longitud mínima
 * @param {number} maxLength - Longitud máxima
 * @returns {boolean} true si es válido
 */
function isValidLength(str, minLength = 0, maxLength = 1000) {
    if (typeof str !== 'string') return false;
    return str.length >= minLength && str.length <= maxLength;
}

/**
 * Valida un DNI (Documento Nacional de Identidad)
 * @param {string} dni - DNI a validar
 * @returns {boolean} true si es válido
 */
function isValidDNI(dni) {
    if (typeof dni !== 'string') return false;
    const digits = dni.replace(/\D/g, '');
    return digits.length === 8;
}

/**
 * Valida un monto monetario
 * @param {any} amount - Monto a validar
 * @param {number} min - Monto mínimo
 * @param {number} max - Monto máximo
 * @returns {boolean} true si es válido
 */
function isValidAmount(amount, min = 0, max = 999999999) {
    return isValidNumber(amount, min, max);
}

/**
 * Valida un código de operación
 * @param {string} code - Código a validar
 * @returns {boolean} true si es válido
 */
function isValidOperationCode(code) {
    if (typeof code !== 'string') return false;
    // Código de operación típicamente tiene 6-12 dígitos
    const digits = code.replace(/\D/g, '');
    return digits.length >= 6 && digits.length <= 12;
}

window.isValidEmail = isValidEmail;
window.isValidNumber = isValidNumber;
window.isValidDate = isValidDate;
window.isValidPhone = isValidPhone;
window.isValidLength = isValidLength;
window.isValidDNI = isValidDNI;
window.isValidAmount = isValidAmount;
window.isValidOperationCode = isValidOperationCode;
