const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: false },
    totalHours: { type: Number, required: false }
});

module.exports = mongoose.model('Shift', shiftSchema);