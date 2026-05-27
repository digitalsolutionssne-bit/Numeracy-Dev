// ==========================================
// stopwatch.js - Stopwatch Page Logic
// ==========================================

let timerInterval = null;
let totalSeconds = 0;
let isRunning = false;
const hoursDisplay = document.getElementById('sw-hours');
const minutesDisplay = document.getElementById('sw-minutes');
const secondsDisplay = document.getElementById('sw-seconds');
const startStopBtn = document.getElementById('start-stop-btn');
const resetBtn = document.getElementById('reset-btn');

function updateDisplay() {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    hoursDisplay.textContent = h.toString().padStart(2, '0');
    minutesDisplay.textContent = m.toString().padStart(2, '0');
    secondsDisplay.textContent = s.toString().padStart(2, '0');
}

function toggleTimer() {
    if (isRunning) {
        clearInterval(timerInterval);
        startStopBtn.innerHTML = "▷ START";
        startStopBtn.style.backgroundColor = "var(--primary-color)";
        resetBtn.style.visibility = "visible"; 
    } else {
        timerInterval = setInterval(() => { totalSeconds++; updateDisplay(); }, 1000);
        startStopBtn.innerHTML = "⏸ STOP";
        startStopBtn.style.backgroundColor = "var(--error-color)"; 
        resetBtn.style.visibility = "hidden";
    }
    isRunning = !isRunning;
}

function resetTimer() {
    clearInterval(timerInterval);
    totalSeconds = 0;
    isRunning = false;
    updateDisplay();
    startStopBtn.innerHTML = "▷ START";
    startStopBtn.style.backgroundColor = "var(--primary-color)";
    resetBtn.style.visibility = "hidden";
}

startStopBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);