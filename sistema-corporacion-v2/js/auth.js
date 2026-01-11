function loginWithProvider(provider) {
    alert(`Funcion "${provider}" en desarrollo.\n\nUsa el login con correo y contraseña.`);
}

async function redirectIfLogged() {
    const client = window.supabaseClient || (typeof initSupabaseClient === 'function' ? initSupabaseClient() : null);
    if (client) {
        const { data } = await client.auth.getSession();
        if (data && data.session) {
            window.location.href = 'index.html';
            return;
        }
    }
    if (sessionStorage.getItem('isLoggedIn')) {
        window.location.href = 'index.html';
    }
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    const clearInvalid = (input) => {
        if (input) input.classList.remove('is-invalid');
    };

    [usernameInput, passwordInput].forEach((input) => {
        if (!input) return;
        input.addEventListener('input', () => clearInvalid(input));
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = (usernameInput && usernameInput.value || '').trim();
        const password = (passwordInput && passwordInput.value || '').trim();

        let hasError = false;
        if (!username) {
            if (usernameInput) usernameInput.classList.add('is-invalid');
            hasError = true;
        }
        if (!password) {
            if (passwordInput) passwordInput.classList.add('is-invalid');
            hasError = true;
        }
        if (hasError) {
            const firstInvalid = document.querySelector('.form-control.is-invalid');
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        const client = window.supabaseClient || (typeof initSupabaseClient === 'function' ? initSupabaseClient() : null);
        if (!client) {
            alert('Supabase no configurado. Revisa la configuracion.');
            return;
        }

        const { error } = await client.auth.signInWithPassword({
            email: username,
            password
        });

        if (error) {
            alert('Acceso denegado\n\nCredenciales incorrectas');
            return;
        }

        sessionStorage.setItem('isLoggedIn', 'true');
        const displayName = username.split('@')[0] || 'Usuario';
        sessionStorage.setItem('userName', displayName);

        const btn = document.querySelector('.panel-btn, .login-float-btn, .spotify-btn, .btn-login');
        if (btn) {
            btn.textContent = 'ACCESO AUTORIZADO';
            btn.style.transform = 'scale(1.05)';
        }

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 800);
    });
}

redirectIfLogged();

window.loginWithProvider = loginWithProvider;
