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
    // Check if app just reloaded from a successful update
    if (sessionStorage.getItem('appUpdated') === 'true') {
        sessionStorage.removeItem('appUpdated'); 
        setTimeout(() => showToast('App updated successfully! 🎉'), 300); 
    }

    // ==========================================
    // "STRAIGHT TO CAMERA" LOGIC (REAL AI INTEGRATION)
    // ==========================================
    const scanInput = document.getElementById('direct-scan-input');
    
    // Live Google Apps Script Web App URL
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbyBV9vBOLiHHe-Defjzkhf6g7xXw979RGEp-kl-h_teOUUpcL-R-YZWtbSQHPEgvFlRcg/exec';

    if (scanInput) {
        scanInput.addEventListener('change', async function(e) {
            if(e.target.files.length > 0) {
                
                // Immediately check if the device is offline before trying to process
                if (!navigator.onLine) {
                    showToast("Currently Offline. Cannot use AI Scanner.", true);
                    scanInput.value = ''; // Reset input
                    return;
                }

                const file = e.target.files[0];
                const processingScreen = document.getElementById('processing-screen');
                const goodOverlay = document.getElementById('obnoxious-good');
                const badOverlay = document.getElementById('obnoxious-bad');

                // 1. Show processing blocker
                processingScreen.style.display = 'flex';

                try {
                    // 2. Compress the image using the Canvas API (Saves massive mobile data)
                    const base64Image = await compressImage(file);
                    
                    // 3. Send to Google Apps Script
                    const response = await fetch(GAS_URL, {
                        method: 'POST',
                        // Using text/plain bypasses strict browser CORS preflight blocks
                        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
                        body: JSON.stringify({ image: base64Image })
                    });

                    const result = await response.json();
                    
                    processingScreen.style.display = 'none';

                    // 4. Handle the AI response
                    if (result.error) {
                        console.error("AI Error:", result.error);
                        showToast("Failed to read date. Please try again.", true);
                    } else if (result.foundDate === false) {
                        showToast("No expiration date found in photo.", true);
                    } else {
                        // Throw the obnoxious overlay based on Gemini's logical conclusion
                        if (result.isExpired) {
                            badOverlay.style.display = 'flex';
                        } else {
                            goodOverlay.style.display = 'flex';
                        }
                    }
                } catch (err) {
                    console.error('Fetch error:', err);
                    processingScreen.style.display = 'none';
                    showToast("Connection error. Try again.", true);
                } finally {
                    scanInput.value = ''; // Reset input so user can scan again immediately
                }
            }
        });
    }
});

// Helper function: Compresses image and converts to Base64 (Strips out the "data:image/jpeg;base64," header for Gemini)
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; // Optimal width for Gemini Flash without wasting bandwidth
                let scaleSize = 1;
                
                if (img.width > MAX_WIDTH) {
                    scaleSize = MAX_WIDTH / img.width;
                }
                
                canvas.width = img.width * scaleSize;
                canvas.height = img.height * scaleSize;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Convert to JPEG with 0.7 quality
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                // Remove the data URL prefix so we just send the raw base64 string
                const base64Data = dataUrl.split(',')[1];
                resolve(base64Data);
            };
            img.onerror = error => reject(error);
        };
        reader.onerror = error => reject(error);
    });
}

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
