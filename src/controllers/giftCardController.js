const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const GiftCard = require('../models/giftCardModel');
const { sendEmail } = require('../config/sendEmail');
const User = require('../models/userModel');
const PayU = require("payu");
const crypto = require('crypto');


exports.GiftCardPurchase = async (req, res) => {
    const {
        occasionName,
        description,
        amount,
        recipientEmail,
        receptionName,
        fromName,
        fromEmail,
        transactionId
    } = req.body;
    
    const image = req.file && req.file.path;
    console.log(image);
    try {
        const data = {
            key: 'YUzB10c',
            salt: 'abc',
            occasionName,
            description,
            amount,
            recipientEmail,
            receptionName,
            fromName,
            fromEmail,
            txnid: transactionId,
            image: image
        };

        const cryp = crypto.createHash('sha512');
        const string = `${data.key}|${data.txnid}|${data.amount}|${data.occasionName}|${data.description}|${data.fromName}|${data.receptionName}|${data.recipientEmail}|${data.fromEmail}|${data.image}|${data.salt}`;
        cryp.update(string);
        const hash = cryp.digest('hex');

        return res.status(200).json({
            hash: hash,
            transactionId: data.txnid
        }); 

    } catch (error) {
        console.error('Error generating PayU hash:', error);
        return res.status(500).json({ error: 'An error occurred while generating the PayU hash.' });
    }
};



exports.giftCardSuccess = async (req, res) => {
    const { fromEmail, recipientEmail, amount, transactionId,fromName } = req.body;

    try {
        const cardNumber = Math.random().toString().slice(2, 12);
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        const expirationDate = new Date(Date.now() + 40 * 24 * 60 * 60 * 1000); // 40 days

        const newGiftCard = new GiftCard({
            cardNumber,
            pin,
            amount,
            expirationDate,
            fromEmail,
            recipientEmail,
            occasionName,
            description,
            fromName,
            receptionName,
            transactionId,
        });
        
        await newGiftCard.save();

        const subject = "You've received a gift card!";
        const message = `
            <h1>Gift Card Details</h1>
            <p>Dear recipient,</p>
            <p>You've been gifted a gift card worth ₹${amount} from ${fromName}.</p>
            <p><strong>Gift Card Number:</strong> ${cardNumber}</p>
            <p><strong>Pin:</strong> ${pin}</p>
            <p><strong>Expiry Date:</strong> ${expirationDate.toDateString()}</p>
            <p>Please use the entire balance in one purchase, as remaining balances will not be saved.</p>
        `;

        await sendEmail('Recipient', recipientEmail, subject, message);

        res.status(200).json({ message: 'Gift card created and email sent successfully.' });

    } catch (error) {
        console.error('Error creating gift card on success:', error.message);
        res.status(500).json({ error: 'Failed to create gift card.' });
    }
};
exports.giftCardFailure = async (req, res) => {
    const { transactionId } = req.body;

    try {
        res.status(200).json({ message: 'Transaction failed.', transactionId });
    } catch (error) {
        console.error('Error processing failure notification:', error.message);
        res.status(500).json({ error: 'Failed to handle transaction failure.' });
    }
};


exports.redeemGiftCard = async (req, res) => {
    try {
        const { cardNumber, pin, purchaseAmount } = req.body;

        const giftCard = await GiftCard.findOne({ cardNumber, pin, isActive: true });

        if (!giftCard) {
            return res.status(400).json({ message: 'Invalid gift card or pin' });
        }

        if (new Date() > giftCard.expirationDate) {
            giftCard.isActive = false;
            await giftCard.save();
            return res.status(400).json({ message: 'Gift card has expired' });
        }

        const availableBalance = giftCard.amount;
        if (availableBalance < purchaseAmount) {
            return res.status(400).json({ message: 'Insufficient balance on gift card' });
        }

        if(availableBalance >= purchaseAmount){
            giftCard.isActive = false;
        }

        await giftCard.save();

        res.status(200).json({
            message: 'Gift card redeemed successfully',
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.checkGiftCardBalance = async (req, res) => {
    try {
        const { cardNumber, pin } = req.body;

        const giftCard = await GiftCard.findOne({ cardNumber, pin, isActive: true });

        if (!giftCard) {
            return res.status(400).json({ message: 'Invalid gift card or pin' });
        }

        if (new Date() > giftCard.expirationDate) {
            giftCard.isActive = false;
            await giftCard.save();
            return res.status(400).json({ message: 'Gift card has expired' });
        }

        await giftCard.save();

        res.status(200).json({
            message: 'Gift Balance fetched successfully',
            balance: giftCard.amount 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAllGiftCards = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await User.findById(userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }
        const giftCards = await GiftCard.find({});
        res.status(200).json({
            giftCards,
        });
    } catch (error) {
        console.error('Error retrieving gift cards:', error.message);
        res.status(500).json({ error: 'Failed to retrieve gift card data.' });
    }
};
