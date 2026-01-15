/* global supabase */
function getSupabaseConfig() {
    const storedUrl = localStorage.getItem('supabaseUrl') || '';
    const storedKey = localStorage.getItem('supabaseAnonKey') || '';
    if (storedUrl && storedKey) return { url: storedUrl, key: storedKey };
    
    // ADVERTENCIA: Las credenciales por defecto deben configurarse en variables de entorno
    // en producción. Estas son solo para desarrollo.
    // IMPORTANTE: Configura SUPABASE_URL y SUPABASE_ANON_KEY en Netlify Environment Variables
    const fallbackUrl = 'https://gpshetkaotreellwyicp.supabase.co';
    const fallbackKey = 'sb_publishable_XSEyzsNLdPu98SB3OiaSLA_NqUNmlVj';
    
    // Solo usar fallback si no hay configuración almacenada
    // En producción, estas deben venir de variables de entorno del servidor
    if (fallbackUrl && fallbackKey && !storedUrl && !storedKey) {
        console.warn('⚠️ Usando credenciales por defecto. Configura SUPABASE_URL y SUPABASE_ANON_KEY en Netlify.');
        localStorage.setItem('supabaseUrl', fallbackUrl);
        localStorage.setItem('supabaseAnonKey', fallbackKey);
        return { url: fallbackUrl, key: fallbackKey };
    }
    return null;
}

function initSupabaseClient() {
    if (typeof supabase === 'undefined') return null;
    const config = getSupabaseConfig();
    if (!config) return null;
    window.supabaseClient = supabase.createClient(config.url, config.key);
    return window.supabaseClient;
}

function setSupabaseConfig(url, key) {
    if (!url || !key) return false;
    localStorage.setItem('supabaseUrl', url);
    localStorage.setItem('supabaseAnonKey', key);
    initSupabaseClient();
    return true;
}

window.getSupabaseConfig = getSupabaseConfig;
window.initSupabaseClient = initSupabaseClient;
window.setSupabaseConfig = setSupabaseConfig;

initSupabaseClient();
