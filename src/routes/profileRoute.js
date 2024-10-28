const e = require("express");
const User = require("../models/userModel");
const Address = require("../models/addressModel");

const router = e.Router();

router.get("/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId);
        if (user) {
            res.status(200).json({
                success: true,
                message: "Profile fetched successfully",
                user: user,
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.post("/address/add/:userId", async (req, res) => {
    const userId = req.params.userId;
    const { address } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        } else {
            const addressModel = new Address({
                user: userId,
                address,
            });

            addressModel.save();
            res.status(201).json({
                success: true,
                message: "Address added successfully",
                address,
            });

        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


router.get("/address/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const addresses = await Address.find({ user: userId }).sort({ createdAt: -1 });

        if (addresses.length === 0) {
            return res.status(404).json({ message: "No addresses found for this user" });
        }

        res.status(200).json({
            success: true,
            addresses,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
