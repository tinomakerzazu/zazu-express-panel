const testSupabaseBtn = document.getElementById('testSupabaseBtn');
const conexionResultados = document.getElementById('conexionResultados');
const supabaseUrlInput = document.getElementById('supabaseUrl');
const supabaseKeyInput = document.getElementById('supabaseAnonKey');
const supabaseSaveBtn = document.getElementById('saveSupabaseConfig');

async function exportarTodosLosDatos() {
    try {
        const data = await Storage.exportAllData();
        const json = JSON.stringify(data, null, 2);

        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `backup_corporacion_${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        showNotification('Datos exportados exitosamente', 'success');
    } catch (err) {
        console.error(err);
        showNotification('No se pudo exportar la data', 'error');
    }
}

async function testConexion() {
    if (!conexionResultados) return;
    conexionResultados.innerHTML = '<div class="list-item text-center text-muted">Probando conexion...</div>';

    try {
        const client = typeof initSupabaseClient === 'function' ? initSupabaseClient() : null;
        if (!client) throw new Error('Supabase no configurado');
        const { error } = await client
            .from('comprobantes_lima')
            .select('id', { count: 'exact', head: true });
        if (error) throw error;

        const now = new Date().toLocaleString('es-PE');
        conexionResultados.innerHTML = [
            '<div class="list-item"><strong>Estado:</strong> Conectado</div>',
            '<div class="list-item"><strong>Tabla:</strong> comprobantes_lima</div>',
            `<div class="list-item"><strong>Ultima prueba:</strong> ${now}</div>`
        ].join('');

        showNotification('Conexion exitosa', 'success');
    } catch (err) {
        console.error(err);
        conexionResultados.innerHTML = '<div class="list-item text-center text-muted">No se pudo conectar. Revisa la URL, la Anon Key y el SQL.</div>';
        showNotification('No se pudo conectar a Supabase', 'error');
    }
}

if (testSupabaseBtn) {
    testSupabaseBtn.addEventListener('click', testConexion);
}

function loadSupabaseConfig() {
    if (typeof getSupabaseConfig !== 'function') return;
    const config = getSupabaseConfig();
    if (!config) return;
    if (supabaseUrlInput) supabaseUrlInput.value = config.url || '';
    if (supabaseKeyInput) supabaseKeyInput.value = config.key || '';
}

function saveSupabaseConfig() {
    if (!supabaseUrlInput || !supabaseKeyInput) return;
    const url = supabaseUrlInput.value.trim();
    const key = supabaseKeyInput.value.trim();
    if (!url || !key) {
        showNotification('Completa la URL y la Anon Key', 'error');
        return;
    }
    if (typeof setSupabaseConfig === 'function') {
        setSupabaseConfig(url, key);
        showNotification('Credenciales guardadas', 'success');
    }
}

if (supabaseSaveBtn) {
    supabaseSaveBtn.addEventListener('click', saveSupabaseConfig);
}

loadSupabaseConfig();

window.exportarTodosLosDatos = exportarTodosLosDatos;
