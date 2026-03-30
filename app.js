// ==========================================
// ENVIRONMENT CONFIGURATION
// Toggle this between 'testing' and 'production'
// ==========================================
const ENVIRONMENT = 'testing'; 

// Inject Test Environment Banner
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
    
    // Create toast dynamically if it doesn't exist on the page
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-container';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.style.backgroundColor = isError ? 'var(--error-color)' : 'var(--success-color)';
    
    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Hide after 3.5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// Check if app just reloaded from a successful update
document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('appUpdated') === 'true') {
        sessionStorage.removeItem('appUpdated'); // Clear flag
        // Slight delay so it feels like part of the page load flow
        setTimeout(() => showToast('App updated successfully! 🎉'), 300); 
    }
});


// ==========================================
// FORCE UPDATE LOGIC
// ==========================================
const forceUpdateBtn = document.getElementById('force-update-btn');
if (forceUpdateBtn) {
    forceUpdateBtn.addEventListener('click', async () => {
        const icon = forceUpdateBtn.querySelector('.update-icon');
        
        // Start spinning animation
        if (icon) icon.classList.add('spin');
        
        try {
            // Give the user a tiny visual delay to realize the button was clicked
            await new Promise(resolve => setTimeout(resolve, 800));

            // 1. Delete all offline caches to ensure old files are wiped
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
            }

            // 2. Unregister the background Service Worker
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(registrations.map(reg => reg.unregister()));
            }

            // 3. Set sessionStorage flag so the toast pops up AFTER the hard reload
            sessionStorage.setItem('appUpdated', 'true');
            
            // 4. Hard reload to pull fresh from GitHub Pages
            window.location.reload(true);
            
        } catch (err) {
            console.error('Update failed:', err);
            if (icon) icon.classList.remove('spin'); // Stop spinning on error
            showToast("Update failed. Check your connection.", true);
        }
    });
}

// ==========================================
// APP LOGIC
// ==========================================

// Toggle Dark/Light Mode
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

// Service Worker Registration for 100% Offline PWA functionality
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
