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

function isValidStartTime() {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= 16 && currentHour < 20; // 4 PM to 8 PM
}

function isValidEndTime() {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= 5 && currentHour < 10; // 5 AM to 10 AM
}

function startShift() {
    if (!isValidStartTime()) {
        alert('Shift start time is between 4 PM and 8 PM only');
        return;
    }
    fetch('/api/shifts/start', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                shifts.push(data.shift);
                localStorage.setItem('shifts', JSON.stringify(shifts));
                shiftInProgress = true;
                updateButtonState();
            } else {
                alert(data.message);
            }
        });
}

function endShift() {
    if (!isValidEndTime()) {
        alert('Shift end time is between 5 AM and 10 AM only');
        return;
    }
    fetch('/api/shifts/end', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                shifts = data.shifts;
                localStorage.setItem('shifts', JSON.stringify(shifts));
                shiftInProgress = false;
                updateButtonState();
                syncShifts();
            } else {
                alert(data.message);
            }
        });
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
    if (!isValidStartTime()) {
        alert('Shift start time is between 4 PM and 8 PM only');
        return;
    }
    fetch('/api/shifts/start', { method: 'POST' })
        .then(response => response.json())
        .then(data => alert(`Shift started at ${new Date(data.shift.startTime)}`));
}

function logShiftEnd() {
    if (!isValidEndTime()) {
        alert('Shift end time is between 5 AM and 10 AM only');
        return;
    }
    fetch('/api/shifts/end', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            const endTime = new Date(data.shift.endTime);
            const hoursWorked = data.shift.totalHours;
            alert(`Shift ended at ${endTime}. Hours worked: ${hoursWorked}`);
        });
}