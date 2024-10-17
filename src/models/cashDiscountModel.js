const mongoose = require("mongoose");

const cashDiscountSchema = new mongoose.Schema({
    paymentStart: {
        type: Number,
        required: true,
    },
    paymentEnd: {
        type: Number,
        required: true,
    },
    discount: {
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

const CashDiscount = mongoose.model("CashDiscount", cashDiscountSchema);

module.exports = CashDiscount;
