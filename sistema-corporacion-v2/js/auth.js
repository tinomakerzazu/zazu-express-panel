function loginWithProvider(provider) {
    alert(`Funcion "${provider}" en desarrollo.\n\nPor ahora usa el login tradicional:\nUsuario: ruben@corp.com\nContrasena: 0110309`);
}

if (sessionStorage.getItem('isLoggedIn')) {
    window.location.href = 'index.html';
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

    loginForm.addEventListener('submit', (e) => {
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

    if (username === 'ruben@corp.com' && password === '0110309') {
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
    } else {
        alert('Acceso denegado\n\nCredenciales incorrectas\n\nUsuario: ruben@corp.com\nContrasena: 0110309');
    }
});
}

window.loginWithProvider = loginWithProvider;
