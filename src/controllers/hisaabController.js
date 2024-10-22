const Hisaab = require("../models/hisaabModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");

const fetchHisaab = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const orders = await Order.find({ user: userId });
        if (!orders) {
            return res.status(404).json({ message: "No orders found" });
        }

        const totalAmountRemaining = orders.reduce((sum, order) => sum + order.amountRmaining, 0);
        const upcomingPayments = orders
            .flatMap(order =>
                order.products
                    .filter(product => product.dueAmount > 0 && product.dueDate >= new Date())
                    .map(product => ({
                        payment: product.payment,
                        order: order._id,
                        amount: product.dueAmount,
                    }))
            );

        const totalOutstanding = totalAmountRemaining + (upcomingPayments.reduce((total, payment) => total + payment.amount, 0));

        const hisaab = new Hisaab({
            userId: userId,
            totalCreditLimit: user.creditLimit,
            usedCreditLimit: user.usedCredit,
            availableCreditLimit: user.creditLimit - user.usedCredit,
            overdue: totalAmountRemaining,
            upcomingPayment: upcomingPayments,
            totalOutstanding: totalOutstanding,
        });
        if (hisaab) {
            await hisaab.save();
            return res.status(200).json({ message: "Hisaab fetched successfully", data: hisaab });
        } else {
            return res.status(404).json({ message: "Hisaab not found" });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message });
    }

};

module.exports = {
    fetchHisaab,
};