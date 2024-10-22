const mongoose = require("mongoose");

const hisaabSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    totalCreditLimit: {
        type: Number,
        default: 0,
    },
    usedCreditLimit: {
        type: Number,
        default: 0,
    },
    availableCreditLimit: {
        type: Number,
        default: 0,
    },
    overdue: {
        type: Number,
        default: 0,
    },
    upcomingPayment: [
        {
            payment: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Payment",
            },
            order: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Order",
            },
            amount: {
                type: Number,
            },
        }
    ],
    totalOutstanding: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Hisaab = mongoose.model("Hisaab", hisaabSchema);

module.exports = Hisaab;