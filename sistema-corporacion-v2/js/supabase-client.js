/* global supabase */
function getSupabaseConfig() {
    const storedUrl = localStorage.getItem('supabaseUrl') || '';
    const storedKey = localStorage.getItem('supabaseAnonKey') || '';
    if (storedUrl && storedKey) return { url: storedUrl, key: storedKey };
    const fallbackUrl = 'https://gpshetkaotreellwyicp.supabase.co';
    const fallbackKey = 'sb_publishable_XSEyzsNLdPu98SB3OiaSLA_NqUNmlVj';
    if (fallbackUrl && fallbackKey) {
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
