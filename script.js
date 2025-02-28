let hours = 0;
let minutes = 0;
let seconds = 0;
let milliseconds = 0;
let intervalId = null;
let displayIntervalId = null;
let isRunning = false;
let baseStartTime = 0;
let totalSeconds = 0;

const hoursDisplay = document.getElementById('hours');
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const millisecondsDisplay = document.getElementById('milliseconds');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const editBtn = document.getElementById('editBtn');
const modal = document.getElementById('editModal');
const saveTimer = document.getElementById('saveTimer');
const priyanshuBtn = document.getElementById('priyanshuBtn');
const priyanshuMenu = document.getElementById('priyanshuMenu');
const fontToggle = document.getElementById('fontToggle');
const millisecondsToggle = document.getElementById('millisecondsToggle');
const timerDisplay = document.querySelector('.timer-display');

// Format numbers to always show two digits (or three for milliseconds)
function formatNumber(num, digits = 2) {
    return num.toString().padStart(digits, '0');
}

// Load saved state from localStorage
function loadSavedState() {
    const useNormalFont = localStorage.getItem('useNormalFont') === 'true';
    const hideMilliseconds = localStorage.getItem('hideMilliseconds') === 'true';
    if (useNormalFont) {
        timerDisplay.classList.add('normal-font');
    }
    if (hideMilliseconds) {
        timerDisplay.classList.add('hide-milliseconds');
        millisecondsToggle.textContent = 'Show Milliseconds';
    } else {
        millisecondsToggle.textContent = 'Hide Milliseconds';
    }

    const savedState = JSON.parse(localStorage.getItem('timerState')) || {};
    console.log('Loaded savedState:', savedState);

    if (!savedState || !Object.keys(savedState).length) {
        console.log('No valid saved state, initializing to defaults');
        totalSeconds = 0;
        baseStartTime = 0;
        hours = 0;
        minutes = 0;
        seconds = 0;
        milliseconds = 0;
        isRunning = false;
    } else if (savedState.isRunning) {
        baseStartTime = savedState.baseStartTime || Date.now();
        totalSeconds = savedState.totalSeconds || 0;
        
        const currentTime = Date.now();
        console.log('isRunning true - baseStartTime:', baseStartTime, 'totalSeconds:', totalSeconds);

        if (baseStartTime <= 0 || baseStartTime > currentTime) {
            console.log('Invalid baseStartTime, recalculating');
            baseStartTime = Date.now() - (totalSeconds * 1000);
        }

        isRunning = true;
        startBtn.textContent = 'Pause';
        startBtn.style.backgroundColor = '#ff4444';
        
        const elapsedTime = currentTime - baseStartTime;
        totalSeconds = Math.floor(elapsedTime / 1000);
        milliseconds = elapsedTime % 1000;
        console.log('Calculated totalSeconds:', totalSeconds, 'milliseconds:', milliseconds);

        if (totalSeconds < 0 || totalSeconds > 9999 * 3600) {
            console.log('Total seconds too large or negative, resetting:', totalSeconds);
            totalSeconds = 0;
            baseStartTime = Date.now();
            milliseconds = 0;
            isRunning = false;
            startBtn.textContent = 'Start';
            startBtn.style.backgroundColor = '#4CAF50';
            localStorage.removeItem('timerState');
        } else {
            hours = Math.floor(totalSeconds / 3600);
            minutes = Math.floor((totalSeconds % 3600) / 60);
            seconds = totalSeconds % 60;
            
            intervalId = setInterval(updateTimer, 10);
            displayIntervalId = setInterval(updateDisplay, 100);
        }
    } else if (savedState.totalSeconds) {
        totalSeconds = savedState.totalSeconds || 0;
        baseStartTime = savedState.baseStartTime || Date.now() - totalSeconds * 1000;

        console.log('Paused state - baseStartTime:', baseStartTime, 'totalSeconds:', totalSeconds);

        const currentTime = Date.now();
        if (baseStartTime <= 0 || baseStartTime > currentTime) {
            console.log('Invalid baseStartTime in paused state, recalculating');
            baseStartTime = Date.now() - (totalSeconds * 1000);
        }

        if (totalSeconds < 0 || totalSeconds > 9999 * 3600) {
            console.log('Total seconds too large or negative in paused state, resetting:', totalSeconds);
            totalSeconds = 0;
            baseStartTime = Date.now();
            milliseconds = 0;
            localStorage.removeItem('timerState');
        }

        hours = Math.floor(totalSeconds / 3600);
        minutes = Math.floor((totalSeconds % 3600) / 60);
        seconds = totalSeconds % 60;
        milliseconds = 0;
    }
    updateDisplay();
}

// Save current state to localStorage
function saveState() {
    const state = {
        isRunning,
        baseStartTime: baseStartTime,
        totalSeconds: totalSeconds
    };
    console.log('Saving state:', state);
    localStorage.setItem('timerState', JSON.stringify(state));
}

// Update the display
function updateDisplay() {
    hoursDisplay.textContent = formatNumber(hours);
    minutesDisplay.textContent = formatNumber(minutes);
    secondsDisplay.textContent = formatNumber(seconds);
    millisecondsDisplay.textContent = formatNumber(milliseconds, 3);
}

// Update the timer logic with milliseconds
function updateTimer() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - baseStartTime;
    totalSeconds = Math.floor(elapsedTime / 1000);
    milliseconds = elapsedTime % 1000;

    if (totalSeconds < 0 || totalSeconds > 9999 * 3600) {
        console.log('Total seconds too large or negative in updateTimer, resetting:', totalSeconds);
        totalSeconds = 0;
        baseStartTime = Date.now();
        milliseconds = 0;
        clearInterval(intervalId);
        clearInterval(displayIntervalId);
        isRunning = false;
        startBtn.textContent = 'Start';
        startBtn.style.backgroundColor = '#4CAF50';
        localStorage.removeItem('timerState');
        updateDisplay();
    } else {
        hours = Math.floor(totalSeconds / 3600);
        minutes = Math.floor((totalSeconds % 3600) / 60);
        seconds = totalSeconds % 60;
        saveState();
    }
}

// Start/Pause button handler
startBtn.addEventListener('click', () => {
    if (!isRunning) {
        if (totalSeconds === 0) {
            baseStartTime = Date.now();
            console.log('Starting fresh, baseStartTime:', baseStartTime);
        } else {
            baseStartTime = Date.now() - totalSeconds * 1000;
            console.log('Resuming, baseStartTime:', baseStartTime, 'totalSeconds:', totalSeconds);
        }
        intervalId = setInterval(updateTimer, 10);
        displayIntervalId = setInterval(updateDisplay, 100);
        startBtn.textContent = 'Pause';
        startBtn.style.backgroundColor = '#ff4444';
    } else {
        clearInterval(intervalId);
        clearInterval(displayIntervalId);
        startBtn.textContent = 'Start';
        startBtn.style.backgroundColor = '#4CAF50';
        milliseconds = 0;
        updateDisplay();
        console.log('Paused, totalSeconds:', totalSeconds);
    }
    isRunning = !isRunning;
    saveState();
});

// Reset button handler
resetBtn.addEventListener('click', () => {
    clearInterval(intervalId);
    clearInterval(displayIntervalId);
    hours = 0;
    minutes = 0;
    seconds = 0;
    milliseconds = 0;
    totalSeconds = 0;
    baseStartTime = 0;
    isRunning = false;
    startBtn.textContent = 'Start';
    startBtn.style.backgroundColor = '#4CAF50';
    updateDisplay();
    localStorage.removeItem('timerState');
    console.log('Reset timer');
});

// Edit button handler
editBtn.addEventListener('click', () => {
    if (isRunning) {
        clearInterval(intervalId);
        clearInterval(displayIntervalId);
        isRunning = false;
        startBtn.textContent = 'Start';
        startBtn.style.backgroundColor = '#4CAF50';
    }
    modal.style.display = 'block';
});

// Save timer handler
saveTimer.addEventListener('click', () => {
    const hourInput = document.getElementById('hourInput');
    const minuteInput = document.getElementById('minuteInput');
    const secondInput = document.getElementById('secondInput');

    hours = parseInt(hourInput.value) || 0;
    minutes = parseInt(minuteInput.value) || 0;
    seconds = parseInt(secondInput.value) || 0;

    totalSeconds = hours * 3600 + minutes * 60 + seconds;
    milliseconds = 0;

    minutes += Math.floor(seconds / 60);
    seconds %= 60;
    hours += Math.floor(minutes / 60);
    minutes %= 60;

    baseStartTime = Date.now() - totalSeconds * 1000;

    updateDisplay();
    modal.style.display = 'none';
    
    hourInput.value = '';
    minuteInput.value = '';
    secondInput.value = '';
    
    saveState();
    console.log('Edited timer, totalSeconds:', totalSeconds, 'baseStartTime:', baseStartTime);
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
    if (!priyanshuBtn.contains(event.target) && !priyanshuMenu.contains(event.target)) {
        priyanshuMenu.classList.remove('show');
    }
});

// Toggle dropdown visibility
priyanshuBtn.addEventListener('click', () => {
    priyanshuMenu.classList.toggle('show');
});

// Font toggle functionality
fontToggle.addEventListener('click', () => {
    timerDisplay.classList.toggle('normal-font');
    const isNormalFont = timerDisplay.classList.contains('normal-font');
    localStorage.setItem('useNormalFont', isNormalFont);
    priyanshuMenu.classList.remove('show');
});

// Milliseconds toggle functionality
millisecondsToggle.addEventListener('click', () => {
    timerDisplay.classList.toggle('hide-milliseconds');
    const hideMilliseconds = timerDisplay.classList.contains('hide-milliseconds');
    localStorage.setItem('hideMilliseconds', hideMilliseconds);
    millisecondsToggle.textContent = hideMilliseconds ? 'Show Milliseconds' : 'Hide Milliseconds';
    priyanshuMenu.classList.remove('show');
});

// Load saved state when page loads
loadSavedState();

// Initial display update
updateDisplay();
