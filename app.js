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
        testBanner.style.backgroundColor = '#d32f2f'; // Distinct Red
        testBanner.style.color = '#ffffff';
        testBanner.style.textAlign = 'center';
        testBanner.style.padding = '4px';
        testBanner.style.fontWeight = 'bold';
        testBanner.style.fontSize = '0.85rem';
        testBanner.style.letterSpacing = '1px';
        testBanner.style.textTransform = 'uppercase';
        testBanner.style.flexShrink = '0'; // Ensures it doesn't get squished by flexbox
        testBanner.style.zIndex = '9999';
        
        // Insert at the very top of the body
        document.body.insertBefore(testBanner, document.body.firstChild);
    });
}

// ==========================================
// APP LOGIC
// ==========================================

// Toggle Dark/Light Mode
const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';

// Apply saved theme on load
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
        // Dynamically resolve the path to sw.js depending on if we are in the root or /pages/ folder
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
