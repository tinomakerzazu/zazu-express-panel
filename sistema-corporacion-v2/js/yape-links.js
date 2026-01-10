document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const yape = params.get('yape');
    if (!yape) return;

    const input = document.getElementById('limaYapeCelular')
        || document.getElementById('provinciaYapeCelular');
    const modal = document.getElementById('limaModal')
        || document.getElementById('provinciaModal');

    if (modal) {
        if (typeof showModal === 'function') {
            showModal(modal.id);
        } else {
            modal.classList.add('active');
        }
    }

    if (input) {
        input.value = yape;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
    }

    const form = input ? input.closest('form') : null;
    const metodoEl = form ? form.querySelector('[name="metodo"]') : null;
    if (metodoEl) {
        metodoEl.value = 'Yape';
        metodoEl.dispatchEvent(new Event('change', { bubbles: true }));
        if (typeof updateMethodFields === 'function') {
            updateMethodFields(form, metodoEl.value);
        }
    }
});
