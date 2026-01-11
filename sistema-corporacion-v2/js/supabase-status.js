function updateSupabaseStatus(state, message) {
    const statusEl = document.getElementById('supabaseStatus');
    if (!statusEl) return;

    statusEl.classList.remove('ok', 'error', 'loading');
    if (state) statusEl.classList.add(state);
    statusEl.textContent = message;
}

function updateLastCheck() {
    const lastCheckEl = document.getElementById('supabaseLastCheck');
    if (!lastCheckEl) return;
    lastCheckEl.textContent = new Date().toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function checkSupabaseConnection() {
    updateSupabaseStatus('loading', 'Verificando...');

    try {
        const client = typeof initSupabaseClient === 'function' ? initSupabaseClient() : null;
        if (!client) throw new Error('Supabase no configurado');
        const { error } = await client
            .from('comprobantes_lima')
            .select('id', { head: true });
        if (error) throw error;
        updateSupabaseStatus('ok', 'Conectado');
    } catch (err) {
        updateSupabaseStatus('error', 'Sin conexion');
        console.error(err);
    } finally {
        updateLastCheck();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('supabaseRefresh');
    if (refreshBtn) refreshBtn.addEventListener('click', checkSupabaseConnection);
    checkSupabaseConnection();
});
