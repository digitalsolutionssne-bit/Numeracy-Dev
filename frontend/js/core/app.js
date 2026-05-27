// ==========================================
// app.js - Global Initialization and Environment Configuration
// ==========================================

const appHeight = () => {
   const doc = document.documentElement;
   doc.style.setProperty('--app-height', `${window.innerHeight}px`);
};
window.addEventListener('resize', appHeight);
window.addEventListener('orientationchange', appHeight);
appHeight(); 

// Environment Banner Injection
window.addEventListener('DOMContentLoaded', () => {
   if (ENV === 'Dev' || ENV === 'Exp') {
       const banner = document.createElement('div');
       banner.textContent = ENV === 'Dev' ? 'Testing' : 'Experimentation';
       banner.style.backgroundColor = ENV === 'Dev' ? '#d32f2f' : '#9C27B0'; 
       banner.style.color = '#ffffff';
       banner.style.textAlign = 'center';
       banner.style.padding = '4px';
       banner.style.fontWeight = 'bold';
       banner.style.fontSize = '0.85rem';
       banner.style.letterSpacing = '1px';
       banner.style.textTransform = 'uppercase';
       banner.style.flexShrink = '0'; 
       banner.style.zIndex = '99999';
       document.body.insertBefore(banner, document.body.firstChild);
   }
});

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

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

// Service Worker Registration
if ('serviceWorker' in navigator) {
   window.addEventListener('load', () => {
       // Automatically map correct path whether deployed at root or subdirectory.
       let swPath = '/sw.js';
       if(window.location.pathname.includes('/frontend/pages/')) {
           swPath = '../../sw.js';
       } else if (!window.location.pathname.endsWith('/')) {
           swPath = './sw.js';
       }
       navigator.serviceWorker.register(swPath).catch(err => console.error('SW Registration Failed:', err));
   });
}

// Force Update Handler
const forceUpdateBtn = document.getElementById('force-update-btn');
if (forceUpdateBtn) {
   forceUpdateBtn.addEventListener('click', async () => {
       if (!navigator.onLine) {
           if (typeof window.showToast === 'function') {
               window.showToast("Currently Offline. App cannot be updated without internet connection.", true);
           } else {
               alert("Currently Offline. App cannot be updated without internet connection.");
           }
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
           if (icon) icon.classList.remove('spin'); 
           if(typeof window.showToast === 'function') window.showToast("Update failed. Check your connection.", true);
       }
   });
}

// Toast for successful updates
document.addEventListener('DOMContentLoaded', () => {
   if (sessionStorage.getItem('appUpdated') === 'true') {
       sessionStorage.removeItem('appUpdated'); 
       setTimeout(() => { if(typeof window.showToast === 'function') window.showToast('App updated successfully! 🎉') }, 300); 
   }
});