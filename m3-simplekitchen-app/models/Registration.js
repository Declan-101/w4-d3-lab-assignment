const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },

    email: {
        type: String,
        trim: true,
        required: true
    },

    username: {
        type: String,
        trim: true,
        required: true
    },

    password: {
        type: String,
        required: true,
        select: false
    }
});

module.exports = mongoose.model('Registration', registrationSchema);