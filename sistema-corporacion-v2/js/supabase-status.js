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
        if (typeof Storage === 'undefined' || typeof Storage.getPagos !== 'function') {
            throw new Error('Storage no disponible');
        }

        const pagos = await Storage.getPagos();
        updateSupabaseStatus('ok', `Conectado (${pagos.length} pagos)`);
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
