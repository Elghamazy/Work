let shifts = JSON.parse(localStorage.getItem('shifts')) || [];


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

// Sync shifts after editing
function saveAndSyncShifts() {
    localStorage.setItem('shifts', JSON.stringify(shifts));
    syncShifts();
}