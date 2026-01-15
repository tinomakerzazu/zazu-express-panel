/**
 * Utilidades de validación y sanitización para funciones de Netlify
 */

/**
 * Sanitiza un string
 */
function sanitizeString(str, maxLength = 1000) {
  if (typeof str !== 'string') return '';
  // Remover caracteres de control
  let sanitized = str.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  return sanitized.trim();
}

/**
 * Sanitiza un número
 */
function sanitizeNumber(value, min = -Infinity, max = Infinity, defaultValue = 0) {
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (isNaN(num)) return defaultValue;
  return Math.max(min, Math.min(max, num));
}

/**
 * Valida un email
 */
function isValidEmail(email) {
  if (typeof email !== 'string' || !email.trim()) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= 255;
}

/**
 * Valida un DNI
 */
function isValidDNI(dni) {
  if (typeof dni !== 'string') return false;
  const digits = dni.replace(/\D/g, '');
  return digits.length === 8;
}

/**
 * Valida un teléfono
 */
function isValidPhone(phone) {
  if (typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
}

/**
 * Valida una fecha
 */
function isValidDate(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Valida longitud de string
 */
function isValidLength(str, min = 0, max = 1000) {
  if (typeof str !== 'string') return false;
  return str.length >= min && str.length <= max;
}

/**
 * Sanitiza un payload completo
 */
function sanitizePayload(payload, schema) {
  const sanitized = {};
  Object.entries(schema).forEach(([key, rules]) => {
    const value = payload[key];
    if (value === undefined || value === null) {
      if (rules.required) {
        throw new Error(`Campo requerido: ${key}`);
      }
      sanitized[key] = rules.default !== undefined ? rules.default : null;
      return;
    }

    let sanitizedValue = value;

    // Aplicar sanitización según tipo
    if (rules.type === 'string') {
      sanitizedValue = sanitizeString(value, rules.maxLength || 1000);
      if (rules.required && !sanitizedValue) {
        throw new Error(`Campo requerido: ${key}`);
      }
    } else if (rules.type === 'number') {
      sanitizedValue = sanitizeNumber(value, rules.min, rules.max, rules.default || 0);
    } else if (rules.type === 'email') {
      sanitizedValue = sanitizeString(value, 255);
      if (!isValidEmail(sanitizedValue)) {
        throw new Error(`Email inválido: ${key}`);
      }
    } else if (rules.type === 'date') {
      if (!isValidDate(value)) {
        throw new Error(`Fecha inválida: ${key}`);
      }
      sanitizedValue = new Date(value).toISOString().split('T')[0];
    }

    // Validaciones adicionales
    if (rules.validate && !rules.validate(sanitizedValue)) {
      throw new Error(`Validación fallida: ${key}`);
    }

    sanitized[key] = sanitizedValue;
  });

  return sanitized;
}

module.exports = {
  sanitizeString,
  sanitizeNumber,
  isValidEmail,
  isValidDNI,
  isValidPhone,
  isValidDate,
  isValidLength,
  sanitizePayload
};
