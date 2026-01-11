/* global supabase */
function getSupabaseConfig() {
    const url = localStorage.getItem('supabaseUrl') || '';
    const key = localStorage.getItem('supabaseAnonKey') || '';
    if (!url || !key) return null;
    return { url, key };
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
