const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const Shift = require('./models/Shift'); // Assuming you have a Shift model

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Basic route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Shift
app.post('/api/shifts/start', async (req, res) => {
    const now = new Date();
    const currentHour = now.getHours();

    // Check if current time is between 4 PM and 8 PM
    if (currentHour < 16 || currentHour >= 20) {
        return res.status(400).json({ success: false, message: 'Shift start time is between 4 PM and 8 PM only' });
    }

    // Check if there's already an active shift
    const activeShift = await Shift.findOne({ endTime: null });
    if (activeShift) {
        return res.status(400).json({ success: false, message: 'An active shift already exists' });
    }

    const shift = new Shift({
        startTime: now,
        endTime: null,
        totalHours: 0
    });
    await shift.save();
    res.json({ success: true, shift });
});


// End Shift
app.post('/api/shifts/end', async (req, res) => {
    const now = new Date();
    const currentHour = now.getHours();

    // Check if current time is between 5 AM and 10 AM
    if (currentHour < 5 || currentHour >= 10) {
        return res.status(400).json({ success: false, message: 'Shift end time is between 5 AM and 10 AM only' });
    }

    const shifts = await Shift.find({ endTime: null });
    if (shifts.length > 0) {
        const lastShift = shifts[shifts.length - 1];
        lastShift.endTime = now;
        lastShift.totalHours = calculateHours(new Date(lastShift.startTime), lastShift.endTime);
        await lastShift.save();
        res.json({ success: true, shift: lastShift, shifts: await Shift.find() });
    } else {
        res.json({ success: false, message: 'No active shift found' });
    }
});

// Calculate Hours
function calculateHours(startTime, endTime) {
    const diffInMs = endTime - startTime;
    return (diffInMs / (1000 * 60 * 60)).toFixed(2);
}

// Sync Shifts
app.post('/api/shifts/sync', async (req, res) => {
    const shifts = req.body;
    await Shift.insertMany(shifts);
    res.json({ success: true });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});