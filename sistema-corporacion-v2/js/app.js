document.addEventListener('DOMContentLoaded', async () => {
    if (typeof checkAuth === 'function') {
        await checkAuth();
    }

    const userNameEl = document.getElementById('userName');
    if (!userNameEl) return;

    const client = window.supabaseClient || (typeof initSupabaseClient === 'function' ? initSupabaseClient() : null);
    if (client) {
        const { data } = await client.auth.getSession();
        const email = data?.session?.user?.email || '';
        if (email) {
            userNameEl.textContent = email.split('@')[0] || 'Usuario';
            return;
        }
    }

    userNameEl.textContent = sessionStorage.getItem('userName') || 'Usuario';
});
