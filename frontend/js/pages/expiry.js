// ==========================================
// expiry.js - Expiry Date Scanner Logic
// ==========================================

const cameraInput = document.getElementById('camera-input');
const manualCheckBtn = document.getElementById('manual-check-btn');
const manualDateDisplay = document.getElementById('manual-date-display');
const processingScreen = document.getElementById('processing-screen');
const goodOverlay = document.getElementById('obnoxious-good');
const badOverlay = document.getElementById('obnoxious-bad');
const notFoundOverlay = document.getElementById('obnoxious-not-found');

const today = new Date();
const options = { day: 'numeric', month: 'long', year: 'numeric' };
document.getElementById('today-date-display').innerText = today.toLocaleDateString('en-GB', options);

let selectedManualDate = null; 

function getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

window.openDatePicker = function() {
    const currYear = today.getFullYear();
    
    const startD = selectedManualDate ? selectedManualDate.getDate() : today.getDate();
    const startM = selectedManualDate ? selectedManualDate.getMonth() + 1 : today.getMonth() + 1;
    const startY = selectedManualDate ? selectedManualDate.getFullYear() : currYear;
    
    window.currentMaxDays = getDaysInMonth(startM, startY);
    
    window.openRolodex("Select Date",[
        { id: 'day', items: window.RoloGen.days(window.currentMaxDays), selectedValue: startD },
        { id: 'month', items: window.RoloGen.monthsSpec(), selectedValue: startM, flex: 1.8 },
        { id: 'year', items: window.RoloGen.years(currYear - 6, 19), selectedValue: startY }
    ], 
    (res) => {
        const year = parseInt(res.year);
        const month = parseInt(res.month) - 1; 
        const day = parseInt(res.day);
        
        selectedManualDate = new Date(year, month, day);
        manualDateDisplay.innerText = selectedManualDate.toLocaleDateString('en-GB', options);
    },
    (res, rolo) => {
        const y = parseInt(res.year);
        const m = parseInt(res.month);
        const currentD = parseInt(res.day);
        
        const maxDays = getDaysInMonth(m, y);
        
        if (window.currentMaxDays !== maxDays) {
            window.currentMaxDays = maxDays;
            let safeDay = currentD > maxDays ? maxDays : currentD;
            rolo.updateColumn('day', window.RoloGen.days(maxDays), safeDay);
        }
    });
}

manualCheckBtn.addEventListener('click', () => {
    if (!selectedManualDate) {
        showToast("Please tap to select a date first.", true);
        return;
    }
    processingScreen.style.display = 'flex';

    setTimeout(() => {
        processingScreen.style.display = 'none';
        const checkDate = new Date(selectedManualDate);
        checkDate.setHours(0,0,0,0);
        const compareToday = new Date(today);
        compareToday.setHours(0,0,0,0);

        if (checkDate < compareToday) badOverlay.style.display = 'flex';
        else goodOverlay.style.display = 'flex'; 
    }, 800); 
});

cameraInput.addEventListener('change', async function(e) {
    if(e.target.files.length > 0) {
        if (!navigator.onLine) {
            showToast("Currently Offline. Cannot use AI Scanner.", true);
            cameraInput.value = ''; 
            return;
        }

        const file = e.target.files[0];
        processingScreen.style.display = 'flex';

        try {
            const base64Image = await compressImage(file);
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
                body: JSON.stringify({ image: base64Image })
            });

            const result = await response.json();
            processingScreen.style.display = 'none';

            if (result.error) {
                showToast("Failed to read date. Please try again.", true);
            } else if (result.foundDate === false) {
                notFoundOverlay.style.display = 'flex';
            } else {
                if (result.isExpired) badOverlay.style.display = 'flex';
                else goodOverlay.style.display = 'flex';
            }
        } catch (err) {
            processingScreen.style.display = 'none';
            showToast("Connection error. Try again.", true);
        } finally {
            cameraInput.value = ''; 
        }
    }
});

function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; 
                let scaleSize = 1;
                if (img.width > MAX_WIDTH) scaleSize = MAX_WIDTH / img.width;
                canvas.width = img.width * scaleSize;
                canvas.height = img.height * scaleSize;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
            };
            img.onerror = error => reject(error);
        };
        reader.onerror = error => reject(error);
    });
}