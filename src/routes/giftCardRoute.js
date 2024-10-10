const express = require('express');
const { GiftCardPurchase, stripeWebhook, redeemGiftCard, giftCardSuccess, giftCardFailure, getAllGiftCards } = require('../controllers/giftCardController');
const router = express.Router();
const bodyParser = require('body-parser')
const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "images/");
    },
    filename: function (req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

const upload = multer({ storage: storage });

router.post('/purchase', upload.single("image"), GiftCardPurchase);
router.post('/sucess', giftCardSuccess);
router.post('/failure', giftCardFailure);
router.post('/redeem', redeemGiftCard);
router.get('/allgiftcards', getAllGiftCards);

module.exports = router;