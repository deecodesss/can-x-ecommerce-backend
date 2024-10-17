const mongoose = require("mongoose");

const interestSchema = new mongoose.Schema({
    paymentStart: {
        type: Number,
        required: true,
    },
    paymentEnd: {
        type: Number,
        required: true,
    },
    interest: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date
    }
});

const Interest = mongoose.model("Interest", interestSchema);

module.exports = Interest;
