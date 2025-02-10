const { default: mongoose } = require("mongoose");

const schemeModel = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    schemeStart: {
        type: Date,
        required: true
    },
    schemeEnd: {
        type: Date,
        required: true
    },
    settlementDate: {
        type: Date,
        required: true
    },
    slabs: [
        {
            slab: {
                type: Number,
                required: true
            },
            benefit: {
                type: String,
                required: true
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
});

const Scheme = mongoose.model('Scheme', schemeModel);

module.exports = Scheme;
