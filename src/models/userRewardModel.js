const mongoose = require("mongoose");

const userRewardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References User model
        required: true
    },
    schemeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scheme', // References Scheme model
        required: true
    },
    slab: {
        type: Number,
        required: true
    },
    benefit: {
        type: String,
        required: true
    },
    winDate: {
        type: Date,
        default: Date.now
    },
    settled: {
        type: Boolean,
        default: false // Indicates whether the reward has been claimed or settled
    }
});

const UserReward = mongoose.model("UserReward", userRewardSchema);
module.exports = UserReward;
