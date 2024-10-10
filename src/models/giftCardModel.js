const mongoose = require('mongoose');

const giftCardSchema = new mongoose.Schema({
    cardNumber: { type: String, required: true, unique: true },
    pin: { type: String, required: true },
    amount: { type: Number, required: true },
    expirationDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    occasionName: { type: String, required: true },
    description: { type: String, required: true },
    recipientEmail: { type: String, required: true },
    receptionName: { type: String, required: true },
    fromName: { type: String, required: true },
    fromEmail: { type: String, required: true },
    transactionId: { type: String, required: true }
}, { timestamps: true });

giftCardSchema.pre('save', function(next) {
    if (!this.expirationDate) {
        this.expirationDate = new Date(Date.now() + 40 * 24 * 60 * 60 * 1000);
    }
    next();
});

module.exports = mongoose.model('GiftCard', giftCardSchema);