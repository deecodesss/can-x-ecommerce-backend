const Scheme = require("../models/schemeModel");
const User = require("../models/userModel");
const UserReward = require("../models/userRewardModel");

const addNewScheme = async (req, res) => {
    try {
        const { title, description, schemeStart, schemeEnd, settlementDate, slabs } = req.body;

        if (!title || !description || !schemeStart || !schemeEnd || !settlementDate || !slabs || slabs.length === 0) {
            return res.status(400).json({ message: 'Please provide all the required fields' });
        }

        const newScheme = new Scheme({
            title,
            description,
            schemeStart,
            schemeEnd,
            settlementDate,
            slabs,
        });

        await newScheme.save();
        return res.status(201).json({ message: 'Scheme added successfully', scheme: newScheme });
    } catch (error) {
        console.error('Error adding scheme:', error);
        return res.status(500).json({ message: 'Error adding scheme', error: error.message });
    }
};

const getSchemeById = async (req, res) => {
    try {
        const scheme = await Scheme.findById(req.params.id);
        if (!scheme) {
            return res.status(404).json({ message: 'Scheme not found' });
        }
        return res.status(200).json({ scheme });
    } catch (error) {
        console.error('Error getting scheme by ID:', error);
        return res.status(500).json({ message: 'Error getting scheme', error: error.message });
    }
};

const getAllSchemes = async (req, res) => {
    try {
        const schemes = await Scheme.find().sort({ createdAt: -1 });
        return res.status(200).json({ schemes });
    } catch (error) {
        console.error('Error getting all schemes:', error);
        return res.status(500).json({ message: 'Error getting all schemes', error: error.message });
    }
};

const deleteSchemeByID = async (req, res) => {
    try {
        const scheme = await Scheme.findByIdAndDelete(req.params.id);
        if (!scheme) {
            return res.status(404).json({ message: 'Scheme not found' });
        }

        return res.status(200).json({ message: 'Scheme deleted successfully' });
    } catch (error) {
        console.error('Error deleting scheme:', error);
        return res.status(500).json({ message: 'Error deleting scheme', error: error.message });
    }
}

const getQualifiedUsersForSchemes = async (req, res) => {
    try {
        // Fetch all users and schemes
        const users = await User.find();
        const schemes = await Scheme.find();

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        if (!schemes || schemes.length === 0) {
            return res.status(404).json({ message: "No schemes found" });
        }

        const qualifiedUsers = [];

        // Loop through all users
        for (const user of users) {
            // Loop through all schemes
            for (const scheme of schemes) {
                const slabs = scheme.slabs;

                // Find the closest slab not exceeding the user's total spent
                let closestSlab = null;
                let minDifference = Infinity;

                for (const slab of slabs) {
                    const difference = user.totalSpent - slab.slab;
                    if (difference >= 0 && difference < minDifference) {
                        closestSlab = slab;
                        minDifference = difference;
                    }
                }

                if (closestSlab) {
                    qualifiedUsers.push({
                        user: user,
                        scheme: {
                            id: scheme._id,
                            title: scheme.title,
                        },
                        slab: closestSlab,
                        benefit: closestSlab.benefit,
                    });
                }
            }
        }

        return res.status(200).json({
            message: "Qualified users fetched successfully",
            qualifiedUsers,
        });
    } catch (error) {
        console.error("Error fetching qualified users:", error);
        return res.status(500).json({
            message: "Error fetching qualified users",
            error: error.message,
        });
    }
};

const addUserReward = async (req, res) => {
    try {
        const { userId, schemeId } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        const scheme = await Scheme.findById(schemeId);
        if (!scheme) {
            throw new Error("Scheme not found");
        }

        const slabs = scheme.slabs;
        let closestSlab = null;
        let minDifference = Infinity;

        // Find the closest slab not exceeding the user's total spent
        for (const slab of slabs) {
            const difference = user.totalSpent - slab.slab;
            if (difference >= 0 && difference < minDifference) {
                closestSlab = slab;
                minDifference = difference;
            }
        }

        if (!closestSlab) {
            return res.status(200).json({ message: "No reward for this user based on their spending" });
        }

        const userReward = new UserReward({
            userId: user._id,
            schemeId: scheme._id,
            slab: closestSlab.slab,
            benefit: closestSlab.benefit,
        });

        await userReward.save();
        user.availedScheme = scheme._id;
        user.save();
        return res.status(201).json({ message: "User reward added successfully", userReward });
    } catch (error) {
        console.error("Error while adding user reward:", error);
        return res.status(500).json({ message: "Error while adding user reward", error: error.message });
    }
};

module.exports = {
    addNewScheme,
    getSchemeById,
    getAllSchemes,
    deleteSchemeByID,
    addUserReward,
    getQualifiedUsersForSchemes,
};
