let shifts = JSON.parse(localStorage.getItem('shifts')) || [];
let shiftInProgress = shifts.some(shift => !shift.endTime);

const shiftButton = document.getElementById('shiftButton');
const shiftStatus = document.getElementById('shiftStatus');

updateButtonState();

function updateButtonState() {
    if (shiftInProgress) {
        shiftButton.textContent = 'End Shift';
        shiftStatus.textContent = `Shift started at ${new Date(shifts[shifts.length - 1].startTime).toLocaleString()}`;
    } else {
        shiftButton.textContent = 'Start Shift';
        shiftStatus.textContent = 'Shift not started';
    }
}

shiftButton.addEventListener('click', () => {
    if (shiftInProgress) {
        endShift();
    } else {
        startShift();
    }
});

function startShift() {
    const shift = {
        startTime: new Date().toISOString(),
        endTime: null,
    };
    saveShiftLocally(shift);
    shiftInProgress = true;
    updateButtonState();
}

function endShift() {
    const lastShift = shifts[shifts.length - 1];
    lastShift.endTime = new Date().toISOString();
    lastShift.totalHours = calculateHours(new Date(lastShift.startTime), new Date(lastShift.endTime));
    localStorage.setItem('shifts', JSON.stringify(shifts));
    shiftInProgress = false;
    updateButtonState();
    syncShifts();
}

function saveShiftLocally(shift) {
    shifts.push(shift);
    localStorage.setItem('shifts', JSON.stringify(shifts));
}

function calculateHours(startTime, endTime) {
    const diffInMs = endTime - startTime;
    return (diffInMs / (1000 * 60 * 60)).toFixed(2);
}

function syncShifts() {
    if (navigator.onLine) {
        fetch('/api/shifts/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(shifts),
        }).then(response => response.json())
          .then(data => {
              if (data.success) {
                  localStorage.removeItem('shifts');
                  alert('Shifts synced with the server');
              }
          });
    }
}

window.addEventListener('online', syncShifts);

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');

  if (action === 'start') {
    logShiftStart();
  } else if (action === 'end') {
    logShiftEnd();
  }
});

function logShiftStart() {
  const startTime = new Date();
  localStorage.setItem('shiftStart', startTime);
  alert(`Shift started at ${startTime}`);
  // Also, save to MongoDB if online
}

function logShiftEnd() {
  const endTime = new Date();
  const startTime = new Date(localStorage.getItem('shiftStart'));
  const hoursWorked = (endTime - startTime) / 36e5; // Calculate hours
  localStorage.setItem('shiftEnd', endTime);
  alert(`Shift ended at ${endTime}. Hours worked: ${hoursWorked}`);
  // Also, save to MongoDB if online
}