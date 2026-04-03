const appHeight = () => {
    const doc = document.documentElement;
    doc.style.setProperty('--app-height', `${window.innerHeight}px`);
};
window.addEventListener('resize', appHeight);
window.addEventListener('orientationchange', appHeight);
appHeight(); 

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
    requestAnimationFrame(() => { toast.classList.add('show'); });
    setTimeout(() => { toast.classList.remove('show'); }, 3500);
}

document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('appUpdated') === 'true') {
        sessionStorage.removeItem('appUpdated'); 
        setTimeout(() => showToast('App updated successfully! 🎉'), 300); 
    }
});

window.closeOverlay = function() {
    const goodOverlay = document.getElementById('obnoxious-good');
    const badOverlay = document.getElementById('obnoxious-bad');
    if(goodOverlay) goodOverlay.style.display = 'none';
    if(badOverlay) badOverlay.style.display = 'none';
};

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
            if (icon) icon.classList.remove('spin'); 
            showToast("Update failed. Check your connection.", true);
        }
    });
}

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

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const isSubdir = window.location.pathname.includes('/pages/');
        const swPath = isSubdir ? '../sw.js' : './sw.js';
        navigator.serviceWorker.register(swPath).catch(err => console.error(err));
    });
}

// =========================================================
// CUSTOM ROLODEX SYSTEM (HAPTIC + NON-CONTINUOUS)
// =========================================================
window.openRolodex = function(title, columns, onSaveCallback) {
    // Remove existing if any
    let existing = document.getElementById('rolodex-modal');
    if (existing) existing.remove();

    const backdrop = document.createElement('div');
    backdrop.id = 'rolodex-modal';
    backdrop.className = 'bottom-sheet-backdrop';
    
    // Build HTML string for columns
    let colsHtml = '';
    columns.forEach(col => {
        let itemsHtml = '';
        col.items.forEach(item => {
            itemsHtml += `<div class="rolodex-item" data-value="${item.value}">${item.label}</div>`;
        });
        colsHtml += `<div class="rolodex-col" id="rolo-col-${col.id}" style="flex: ${col.flex || 1}">${itemsHtml}</div>`;
    });

    backdrop.innerHTML = `
        <div class="bottom-sheet rolodex-sheet">
            <div class="rolodex-header">
                <span class="rolodex-cancel" onclick="closeRolodex()">Cancel</span>
                <span class="rolodex-title">${title}</span>
                <span class="rolodex-save" id="rolo-save-btn">Set</span>
            </div>
            <div class="rolodex-body">
                <div class="rolodex-highlight"></div>
                ${colsHtml}
            </div>
        </div>
    `;

    document.body.appendChild(backdrop);
    
    // Trigger slide up
    requestAnimationFrame(() => {
        backdrop.classList.add('show');
        backdrop.querySelector('.rolodex-sheet').classList.add('show');
    });

    const results = {};

    // Initialize scrolling and haptic mechanics for each column
    columns.forEach(col => {
        const colDiv = document.getElementById(`rolo-col-${col.id}`);
        const itemHeight = 44; 
        
        // Initial scroll position
        const targetIndex = col.items.findIndex(i => i.value == col.selectedValue);
        const finalIndex = targetIndex !== -1 ? targetIndex : 0;
        
        // Timeout ensures the DOM is painted before scrolling
        setTimeout(() => {
            colDiv.scrollTop = finalIndex * itemHeight;
            updateActiveState(colDiv, finalIndex);
        }, 10);

        let lastIndex = finalIndex;

        colDiv.addEventListener('scroll', () => {
            let currentIndex = Math.round(colDiv.scrollTop / itemHeight);
            
            // Bounds clamp (Non-continuous)
            if (currentIndex < 0) currentIndex = 0;
            if (currentIndex >= col.items.length) currentIndex = col.items.length - 1;

            if (currentIndex !== lastIndex) {
                lastIndex = currentIndex;
                // Trigger tactile haptic bump
                if (navigator.vibrate) navigator.vibrate(10);
                updateActiveState(colDiv, currentIndex);
            }
        });
    });

    function updateActiveState(colDiv, activeIndex) {
        Array.from(colDiv.children).forEach((child, i) => {
            if (i === activeIndex) {
                child.classList.add('active');
                results[colDiv.id.replace('rolo-col-', '')] = child.dataset.value;
            } else {
                child.classList.remove('active');
            }
        });
    }

    document.getElementById('rolo-save-btn').addEventListener('click', () => {
        // Force an immediate read of the current highlighted items
        columns.forEach(col => {
            const colDiv = document.getElementById(`rolo-col-${col.id}`);
            const index = Math.round(colDiv.scrollTop / 44);
            const activeItem = colDiv.children[index];
            if (activeItem) results[col.id] = activeItem.dataset.value;
        });
        
        onSaveCallback(results);
        closeRolodex();
    });
};

window.closeRolodex = function() {
    const modal = document.getElementById('rolodex-modal');
    if (modal) {
        modal.classList.remove('show');
        modal.querySelector('.rolodex-sheet').classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
};

// Global Helpers for generating standard Rolodex Arrays
window.RoloGen = {
    hours12: () => Array.from({length:12}, (_,i) => ({ value: i+1, label: (i+1).toString().padStart(2,'0') })),
    mins60: () => Array.from({length:60}, (_,i) => ({ value: i, label: i.toString().padStart(2,'0') })),
    ampm: () =>[{value:'AM', label:'AM'}, {value:'PM', label:'PM'}],
    hours24: () => Array.from({length:24}, (_,i) => ({ value: i, label: i.toString() })),
    days31: () => Array.from({length:31}, (_,i) => ({ value: i+1, label: (i+1).toString() })),
    monthsSpec: () =>[
        {value:1, label:'1. January (Jan)'}, {value:2, label:'2. February (Feb)'}, {value:3, label:'3. March (Mar)'},
        {value:4, label:'4. April (Apr)'}, {value:5, label:'5. May (May)'}, {value:6, label:'6. June (Jun)'},
        {value:7, label:'7. July (Jul)'}, {value:8, label:'8. August (Aug)'}, {value:9, label:'9. September (Sep)'},
        {value:10, label:'10. October (Oct)'}, {value:11, label:'11. November (Nov)'}, {value:12, label:'12. December (Dec)'}
    ],
    years: (start, count) => Array.from({length:count}, (_,i) => ({ value: start+i, label: (start+i).toString() }))
};
