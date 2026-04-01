// ==========================================
// ENVIRONMENT CONFIGURATION
// ==========================================
const ENVIRONMENT = 'testing'; 

if (ENVIRONMENT === 'testing') {
    window.addEventListener('DOMContentLoaded', () => {
        const testBanner = document.createElement('div');
        testBanner.textContent = 'Test Environment';
        testBanner.style.backgroundColor = '#d32f2f'; 
        testBanner.style.color = '#ffffff';
        testBanner.style.textAlign = 'center';
        testBanner.style.padding = '4px';
        testBanner.style.fontWeight = 'bold';
        testBanner.style.fontSize = '0.85rem';
        testBanner.style.letterSpacing = '1px';
        testBanner.style.textTransform = 'uppercase';
        testBanner.style.flexShrink = '0'; 
        testBanner.style.zIndex = '9999';
        
        document.body.insertBefore(testBanner, document.body.firstChild);
    });
}

// ==========================================
// TOAST NOTIFICATION SYSTEM
// ==========================================
function showToast(message, isError = false) {
    let toast = document.getElementById('toast-container');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-container';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.style.backgroundColor = isError ? 'var(--error-color)' : 'var(--success-color)';
    
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('appUpdated') === 'true') {
        sessionStorage.removeItem('appUpdated'); 
        setTimeout(() => showToast('App updated successfully! 🎉'), 300); 
    }
});

// Global function to close the obnoxious overlays
window.closeOverlay = function() {
    const goodOverlay = document.getElementById('obnoxious-good');
    const badOverlay = document.getElementById('obnoxious-bad');
    if(goodOverlay) goodOverlay.style.display = 'none';
    if(badOverlay) badOverlay.style.display = 'none';
};

// ==========================================
// FORCE UPDATE LOGIC
// ==========================================
const forceUpdateBtn = document.getElementById('force-update-btn');
if (forceUpdateBtn) {
    forceUpdateBtn.addEventListener('click', async () => {
        if (!navigator.onLine) {
            showToast("Currently Offline. Try again when Online", true);
            return;
        }
        const icon = forceUpdateBtn.querySelector('.update-icon');
        if (icon) icon.classList.add('spin');
        
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
            }
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(registrations.map(reg => reg.unregister()));
            }

            sessionStorage.setItem('appUpdated', 'true');
            const cacheBuster = '?update=' + new Date().getTime();
            window.location.href = window.location.pathname + cacheBuster;
            
        } catch (err) {
            console.error('Update failed:', err);
            if (icon) icon.classList.remove('spin'); 
            showToast("Update failed. Check your connection.", true);
        }
    });
}

// ==========================================
// THEME & SERVICE WORKER LOGIC
// ==========================================
const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';

if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const isSubdir = window.location.pathname.includes('/pages/');
        const swPath = isSubdir ? '../sw.js' : './sw.js';

        navigator.serviceWorker.register(swPath)
            .then(registration => {
                console.log('Service Worker successfully registered with scope:', registration.scope);
            })
            .catch(err => {
                console.error('Service Worker registration failed:', err);
            });
    });
}
