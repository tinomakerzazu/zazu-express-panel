/* global supabase */
const SUPABASE_URL = 'https://gpshetkaotreellwyicp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_XSEyzsNLdPu98SB3OiaSLA_NqUNmlVj';

if (typeof supabase !== 'undefined') {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
