let hours = 0;
let minutes = 0;
let seconds = 0;
let intervalId = null;
let isRunning = false;
let startTime = 0;
let totalSeconds = 0;

const hoursDisplay = document.getElementById('hours');
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const editBtn = document.getElementById('editBtn');
const modal = document.getElementById('editModal');
const saveTimer = document.getElementById('saveTimer');
const fontToggle = document.getElementById('fontToggle');
const timerDisplay = document.querySelector('.timer-display');

// Format numbers to always show two digits
function formatNumber(num) {
    return num.toString().padStart(2, '0');
}

// Load saved state from localStorage
function loadSavedState() {
    // Load font preference
    const useNormalFont = localStorage.getItem('useNormalFont') === 'true';
    if (useNormalFont) {
        timerDisplay.classList.add('normal-font');
    }

    const savedState = JSON.parse(localStorage.getItem('timerState')) || {};
    if (savedState.isRunning) {
        startTime = savedState.startTime;
        totalSeconds = savedState.totalSeconds;
        isRunning = true;
        startBtn.textContent = 'Pause';
        startBtn.style.backgroundColor = '#ff4444';
        
        // Calculate elapsed time since last save
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
        
        // Update time values including elapsed time
        totalSeconds = savedState.totalSeconds + elapsedSeconds;
        hours = Math.floor(totalSeconds / 3600);
        minutes = Math.floor((totalSeconds % 3600) / 60);
        seconds = totalSeconds % 60;
        
        // Update start time to current time
        startTime = currentTime;
        
        // Restart the timer
        intervalId = setInterval(runTimer, 1000);
    } else if (savedState.totalSeconds) {
        totalSeconds = savedState.totalSeconds;
        hours = Math.floor(totalSeconds / 3600);
        minutes = Math.floor((totalSeconds % 3600) / 60);
        seconds = totalSeconds % 60;
    }
    updateDisplay();
}

// Save current state to localStorage
function saveState() {
    const state = {
        isRunning,
        startTime: startTime,
        totalSeconds: totalSeconds
    };
    localStorage.setItem('timerState', JSON.stringify(state));
}

// Update the display
function updateDisplay() {
    hoursDisplay.textContent = formatNumber(hours);
    minutesDisplay.textContent = formatNumber(minutes);
    secondsDisplay.textContent = formatNumber(seconds);
}

// Update the timer logic
function runTimer() {
    const currentTime = Date.now();
    const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
    startTime = currentTime;
    
    totalSeconds += 1;
    seconds++;
    if (seconds === 60) {
        seconds = 0;
        minutes++;
        if (minutes === 60) {
            minutes = 0;
            hours++;
        }
    }
    updateDisplay();
    saveState();
}

// Modify Start/Pause button handler
startBtn.addEventListener('click', () => {
    if (!isRunning) {
        startTime = Date.now();
        intervalId = setInterval(runTimer, 1000);
        startBtn.textContent = 'Pause';
        startBtn.style.backgroundColor = '#ff4444';
    } else {
        clearInterval(intervalId);
        startBtn.textContent = 'Start';
        startBtn.style.backgroundColor = '#4CAF50';
    }
    isRunning = !isRunning;
    saveState();
});

// Modify Reset button handler
resetBtn.addEventListener('click', () => {
    clearInterval(intervalId);
    hours = 0;
    minutes = 0;
    seconds = 0;
    totalSeconds = 0;
    isRunning = false;
    startBtn.textContent = 'Start';
    startBtn.style.backgroundColor = '#4CAF50';
    updateDisplay();
    localStorage.removeItem('timerState');
});

// Edit button handler
editBtn.addEventListener('click', () => {
    if (isRunning) {
        clearInterval(intervalId);
        isRunning = false;
        startBtn.textContent = 'Start';
        startBtn.style.backgroundColor = '#4CAF50';
    }
    modal.style.display = 'block';
});

// Modify Save timer handler
saveTimer.addEventListener('click', () => {
    const hourInput = document.getElementById('hourInput');
    const minuteInput = document.getElementById('minuteInput');
    const secondInput = document.getElementById('secondInput');

    hours = parseInt(hourInput.value) || 0;
    minutes = parseInt(minuteInput.value) || 0;
    seconds = parseInt(secondInput.value) || 0;

    // Calculate total seconds
    totalSeconds = hours * 3600 + minutes * 60 + seconds;

    // Normalize the time values
    minutes += Math.floor(seconds / 60);
    seconds %= 60;
    hours += Math.floor(minutes / 60);
    minutes %= 60;

    updateDisplay();
    modal.style.display = 'none';
    
    // Clear input fields
    hourInput.value = '';
    minuteInput.value = '';
    secondInput.value = '';
    
    saveState();
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Add the font toggle functionality
fontToggle.addEventListener('click', () => {
    timerDisplay.classList.toggle('normal-font');
    // Save preference
    const isNormalFont = timerDisplay.classList.contains('normal-font');
    localStorage.setItem('useNormalFont', isNormalFont);
});

// Load saved state when page loads
loadSavedState();

// Initial display update
updateDisplay(); 