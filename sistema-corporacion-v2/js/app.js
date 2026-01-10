document.addEventListener('DOMContentLoaded', () => {
    if (typeof checkAuth === 'function') {
        checkAuth();
    }

    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = sessionStorage.getItem('userName') || 'Usuario';
    }
});
