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
// CUSTOM ROLODEX SYSTEM (INFINITE & FINITE HYBRID WITH REAL-TIME UPDATES)
// =========================================================
window.openRolodex = function(title, columns, onSaveCallback, onChangeCallback) {
    let existing = document.getElementById('rolodex-modal');
    if (existing) existing.remove();

    const backdrop = document.createElement('div');
    backdrop.id = 'rolodex-modal';
    backdrop.className = 'bottom-sheet-backdrop';
    
    let colsHtml = '';
    const NUM_SETS = 7; 
    const CENTER_SET = 3; 
    const results = {};

    // Allows dynamic rebuilding of a specific column array mid-scroll
    window.activeRolodex = {
        updateColumn: function(colId, newItems, snapValue) {
            const col = columns.find(c => c.id === colId);
            if (col && col.updateItems) col.updateItems(newItems, snapValue);
        }
    };

    let notifyTimeout = null;
    function triggerNotify() {
        clearTimeout(notifyTimeout);
        notifyTimeout = setTimeout(() => {
            if (onChangeCallback) onChangeCallback(results, window.activeRolodex);
        }, 50);
    }

    columns.forEach(col => {
        col.isInfinite = col.infinite !== false; 

        if (col.isInfinite) {
            const cycleItems =[...col.items, { value: 'DIVIDER', label: '•••', isDivider: true }];
            col.cycleLength = cycleItems.length;
            col.centerOffset = CENTER_SET * col.cycleLength;
            
            let allItems =[];
            for (let i = 0; i < NUM_SETS; i++) {
                allItems.push(...cycleItems);
            }
            col.renderedItems = allItems;
        } else {
            col.renderedItems = col.items;
            col.cycleLength = col.items.length;
            col.centerOffset = 0;
        }

        let itemsHtml = '';
        col.renderedItems.forEach((item) => {
            const opacityStyle = item.isDivider ? 'opacity: 0.15; font-size: 1rem; letter-spacing: 2px;' : '';
            itemsHtml += `<div class="rolodex-item" style="${opacityStyle}" data-value="${item.value}">${item.label}</div>`;
        });
        
        const suffixClass = col.suffixLabel ? 'has-suffix' : '';
        const staticLabel = col.suffixLabel ? `<div class="rolodex-static-label">${col.suffixLabel}</div>` : '';
        
        colsHtml += `
            <div class="rolodex-col-wrapper" style="flex: ${col.flex || 1}">
                <div class="rolodex-col ${suffixClass}" id="rolo-col-${col.id}">
                    <div class="rolodex-col-inner" id="rolo-track-${col.id}">
                        ${itemsHtml}
                    </div>
                </div>
                ${staticLabel}
            </div>
        `;
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
    
    requestAnimationFrame(() => {
        backdrop.classList.add('show');
        backdrop.querySelector('.rolodex-sheet').classList.add('show');
    });

    columns.forEach(col => {
        const colDiv = document.getElementById(`rolo-col-${col.id}`);
        const track = document.getElementById(`rolo-track-${col.id}`);
        const itemHeight = 44; 
        let maxIndex = col.renderedItems.length - 1;
        let targetIndex = 0;
        let currentY = 0;

        // Dynamic rebuild function embedded inside column closure
        col.updateItems = function(newItems, forceValue) {
            col.items = newItems;
            
            if (col.isInfinite) {
                const cycleItems =[...col.items, { value: 'DIVIDER', label: '•••', isDivider: true }];
                col.cycleLength = cycleItems.length;
                col.centerOffset = CENTER_SET * col.cycleLength;
                let allItems =[];
                for (let i = 0; i < NUM_SETS; i++) allItems.push(...cycleItems);
                col.renderedItems = allItems;
            } else {
                col.renderedItems = col.items;
                col.cycleLength = col.items.length;
                col.centerOffset = 0;
            }
            
            maxIndex = col.renderedItems.length - 1;

            let itemsHtml = '';
            col.renderedItems.forEach((item) => {
                const opacityStyle = item.isDivider ? 'opacity: 0.15; font-size: 1rem; letter-spacing: 2px;' : '';
                itemsHtml += `<div class="rolodex-item" style="${opacityStyle}" data-value="${item.value}">${item.label}</div>`;
            });
            track.innerHTML = itemsHtml;
            
            let localTarget = col.items.findIndex(i => i.value == forceValue);
            if (localTarget === -1) localTarget = col.items.length - 1; 
            
            targetIndex = col.centerOffset + localTarget;
            currentY = -targetIndex * itemHeight;
            
            track.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';
            track.style.transform = `translateY(${currentY}px)`;
            updateActive(targetIndex);
        };
        
        let localTarget = col.items.findIndex(i => i.value == col.selectedValue);
        if (localTarget === -1) localTarget = 0;

        targetIndex = col.centerOffset + localTarget;
        currentY = -targetIndex * itemHeight;
        track.style.transform = `translateY(${currentY}px)`;
        updateActive(targetIndex);

        let isDragging = false;
        let startY = 0;
        let startTransformY = 0;
        let wheelAccumulator = 0;
        let lastDelta = 0;

        function getClientY(e) {
            return e.touches ? e.touches[0].clientY : e.clientY;
        }

        function onStart(e) {
            isDragging = true;
            startY = getClientY(e);
            startTransformY = currentY;
            track.style.transition = 'none'; 
        }

        function onMove(e) {
            if (!isDragging) return;
            e.preventDefault(); 
            
            const delta = getClientY(e) - startY;
            lastDelta = delta; 
            let newY = startTransformY + delta;

            const boundsTop = 0;
            const boundsBottom = -maxIndex * itemHeight;
            if (newY > boundsTop) newY = boundsTop + (newY - boundsTop) * 0.3;
            if (newY < boundsBottom) newY = boundsBottom + (newY - boundsBottom) * 0.3;

            currentY = newY;
            track.style.transform = `translateY(${currentY}px)`;

            let tempIndex = Math.round(-currentY / itemHeight);
            tempIndex = Math.max(0, Math.min(tempIndex, maxIndex));
            
            if (tempIndex !== targetIndex) {
                targetIndex = tempIndex;
                if (navigator.vibrate) navigator.vibrate(30);
                updateActive(targetIndex);
            }
        }

        function onEnd() {
            if (!isDragging) return;
            isDragging = false;
            
            targetIndex = Math.round(-currentY / itemHeight);
            targetIndex = Math.max(0, Math.min(targetIndex, maxIndex));
            
            if (col.isInfinite && col.renderedItems[targetIndex].isDivider) {
                targetIndex += (lastDelta < 0 ? 1 : -1);
                targetIndex = Math.max(0, Math.min(targetIndex, maxIndex));
            }
            
            currentY = -targetIndex * itemHeight;
            track.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)';
            track.style.transform = `translateY(${currentY}px)`;
            updateActive(targetIndex);
            triggerNotify();

            if (col.isInfinite) {
                setTimeout(() => {
                    const offset = targetIndex % col.cycleLength;
                    targetIndex = col.centerOffset + offset;
                    currentY = -targetIndex * itemHeight;
                    track.style.transition = 'none';
                    track.offsetHeight; 
                    track.style.transform = `translateY(${currentY}px)`;
                    updateActive(targetIndex);
                }, 260); 
            }
        }

        colDiv.addEventListener('wheel', (e) => {
            e.preventDefault(); 
            wheelAccumulator += e.deltaY;
            
            if (Math.abs(wheelAccumulator) >= 30) { 
                let direction = Math.sign(wheelAccumulator);
                let newIndex = targetIndex + direction;
                newIndex = Math.max(0, Math.min(newIndex, maxIndex));
                
                if (col.isInfinite && col.renderedItems[newIndex] && col.renderedItems[newIndex].isDivider) {
                    newIndex += direction; 
                    newIndex = Math.max(0, Math.min(newIndex, maxIndex));
                }
                
                if (newIndex !== targetIndex) {
                    targetIndex = newIndex;
                    currentY = -targetIndex * itemHeight;
                    track.style.transition = 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)';
                    track.style.transform = `translateY(${currentY}px)`;
                    
                    if (navigator.vibrate) navigator.vibrate(30);
                    updateActive(targetIndex);
                    triggerNotify();

                    if (col.isInfinite) {
                        clearTimeout(col.recenterTimeout);
                        col.recenterTimeout = setTimeout(() => {
                            const offset = targetIndex % col.cycleLength;
                            targetIndex = col.centerOffset + offset;
                            currentY = -targetIndex * itemHeight;
                            track.style.transition = 'none';
                            track.offsetHeight; 
                            track.style.transform = `translateY(${currentY}px)`;
                            updateActive(targetIndex);
                        }, 160);
                    }
                }
                wheelAccumulator = 0; 
            }
        }, {passive: false});

        colDiv.addEventListener('touchstart', onStart, {passive: false});
        colDiv.addEventListener('touchmove', onMove, {passive: false});
        colDiv.addEventListener('touchend', onEnd);
        colDiv.addEventListener('touchcancel', onEnd);
        
        colDiv.addEventListener('mousedown', onStart);
        window.addEventListener('mousemove', onMove, {passive: false});
        window.addEventListener('mouseup', onEnd);

        function updateActive(index) {
            Array.from(track.children).forEach((child, i) => {
                if (i === index) {
                    child.classList.add('active');
                    results[col.id] = child.dataset.value;
                } else {
                    child.classList.remove('active');
                }
            });
        }
    });

    document.getElementById('rolo-save-btn').addEventListener('click', () => {
        columns.forEach(col => {
            const colDiv = document.getElementById(`rolo-col-${col.id}`);
            const track = document.getElementById(`rolo-track-${col.id}`);
            let y = parseFloat(track.style.transform.replace('translateY(','').replace('px)',''));
            const index = Math.round(-y / 44);
            const activeItem = track.children[index];
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

window.RoloGen = {
    hours12: () => Array.from({length:12}, (_,i) => ({ value: i+1, label: (i+1).toString().padStart(2,'0') })),
    mins60: () => Array.from({length:60}, (_,i) => ({ value: i, label: i.toString().padStart(2,'0') })),
    ampm: () =>[{value:'AM', label:'AM'}, {value:'PM', label:'PM'}],
    hours24: () => Array.from({length:24}, (_,i) => ({ value: i, label: i.toString() })),
    days: (count) => Array.from({length:count}, (_,i) => ({ value: i+1, label: (i+1).toString() })),
    days31: () => Array.from({length:31}, (_,i) => ({ value: i+1, label: (i+1).toString() })),
    monthsSpec: () =>[
        {value:1, label:'1. January (Jan)'}, {value:2, label:'2. February (Feb)'}, {value:3, label:'3. March (Mar)'},
        {value:4, label:'4. April (Apr)'}, {value:5, label:'5. May (May)'}, {value:6, label:'6. June (Jun)'},
        {value:7, label:'7. July (Jul)'}, {value:8, label:'8. August (Aug)'}, {value:9, label:'9. September (Sep)'},
        {value:10, label:'10. October (Oct)'}, {value:11, label:'11. November (Nov)'}, {value:12, label:'12. December (Dec)'}
    ],
    years: (start, count) => Array.from({length:count}, (_,i) => ({ value: start+i, label: (start+i).toString() }))
};
