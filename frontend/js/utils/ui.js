// ==========================================
// ui.js - Shared UI Utilities (Toasts, Overlays)
// ==========================================

window.showToast = function(message, isError = false) {
    let toast = document.getElementById('toast-container');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-container';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.backgroundColor = isError ? 'var(--error-color)' : 'var(--success-color)';
    requestAnimationFrame(() => { toast.classList.add('show'); });
    setTimeout(() => { toast.classList.remove('show'); }, 3500);
}
 
window.closeOverlay = function() {
    const goodOverlay = document.getElementById('obnoxious-good');
    const badOverlay = document.getElementById('obnoxious-bad');
    const notFoundOverlay = document.getElementById('obnoxious-not-found');
    if(goodOverlay) goodOverlay.style.display = 'none';
    if(badOverlay) badOverlay.style.display = 'none';
    if(notFoundOverlay) notFoundOverlay.style.display = 'none';
};