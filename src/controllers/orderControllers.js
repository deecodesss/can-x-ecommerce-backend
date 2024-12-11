const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const crypto = require("crypto");
const axios = require("axios");
const nodemailer = require("nodemailer");
const CryptoJS = require("crypto-js");
const moment = require("moment-timezone");
const Payment = require("../models/paymentModel");
const { default: mongoose } = require("mongoose");
const { interest } = require("payu-websdk/wrapper/emi");
const Address = require("../models/addressModel");
const Product = require("../models/productModel");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const client_url = process.env.CLIENT_URL;
const server_url = process.env.SERVER_URL;

function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase(); // Convert timestamp to base36 for shorter representation
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase(); // Generate a random 3-byte string
  return `${timestamp}${randomStr}`;
}

const stripePayment = async (req, res) => {
  const { customer, products, totalAmount, status } = req.body;
  try {
    // Update user details in the database
    const updatedUser = await updateUserDetails(customer);

    // Create line items for the Stripe Checkout session
    const lineItems = products.map((product) => ({
      price_data: {
        currency: "AED",
        product_data: {
          name: product.productId.title,
          description: "Furniture Product",
        },
        unit_amount: product.productId.price * 100,
      },
      quantity: product.quantity,
    }));

    const productMetadata = products.reduce((metadata, product) => {
      metadata[product.productId._id] = product.quantity;
      return metadata;
    }, {});

    const productMetadataString = JSON.stringify(productMetadata);

    // Create a Stripe Checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: client_url,
      cancel_url: client_url,
      payment_method_types: ["card"],
      mode: "payment",
      billing_address_collection: "auto",
      customer_email: customer.email,
      line_items: lineItems,
      metadata: {
        customerId: customer.customerId,
        products: productMetadataString,
        totalAmount,
      },
    });

    res.json({ id: stripeSession.id });
  } catch (error) {
    console.error("Error creating Stripe Checkout Session:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating a checkout session" });
  }
};

// Function to update user details in the database
const updateUserDetails = async (customer) => {
  try {
    // Retrieve user details from the database based on the email
    const user = await User.findById(customer.customerId);

    if (user) {
      // Update user details with the new information
      user.address = customer.addressLine1 + " " + customer.addressLine2;
      user.companyName = customer.companyName;
      user.phone = customer.phone;
      user.country = customer.country;
      user.city = customer.city;
      user.state = customer.state;
      user.zipCode = customer.zipCode;

      // Save the updated user details back to the database
      await user.save();
    } else {
      console.error("User not found");
    }

    return user;
  } catch (error) {
    console.error("Error updating user details:", error);
    throw error;
  }
};

const getOrdersForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const orders = await Order.find({ customer: userId }).populate(
      "products.product"
    ).populate("address").populate("paymentHistory").sort({ createdAt: -1 });

    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders for user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer")
      .populate("address")
      .populate("products.product").populate("paymentHistory").sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: "No orders found" });
    }

    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAILUSER,
        pass: process.env.EMAILPASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAILUSER,
      to: email,
      subject: "Password Reset OTP",
      html: `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              h1 {
                color: #333;
              }
              p {
                color: #555;
                font-size: 16px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Verification OTP</h1>
              <p>Your verification OTP is: <strong>${otp}</strong></p>
              <p>Please use this OTP to verify your email.</p>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("OTP email sent");
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send("User not found. Please register first.");
    }

    const otp = generateOTP();
    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 600000;

    await user.save();
    await sendOTPEmail(email, otp);
    res.send("OTP sent to your email");
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).send("Internal Server Error");
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({
      email,
      resetOTP: otp,
      resetOTPExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send("Invalid or expired OTP");
    }

    res.send("OTP verified successfully");
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).send("Internal Server Error");
  }
};

const generateRandomString = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

const SuccessIPG = async (req, res) => {
  try {
    // Assuming req.body contains the data you want to send in the POST request
    const { customerId, chargetotal, status, ipgTransactionId, ccbrand } =
      req.body;

    const products = JSON.parse(req.body.products);
    console.log(
      customerId,
      chargetotal,
      status,
      ipgTransactionId,
      ccbrand,
      products
    );

    const order = await Order.create({
      customer: customerId,
      products,
      totalAmount: chargetotal,
    });

    const cart = await Cart.findOne({ userId: customerId });

    const payment = await Payment.create({
      paymentId: ipgTransactionId,
      order: order._id,
      amount: chargetotal,
      status,
      paymentMethod: ccbrand,
    });

    order.payment = payment._id;
    await order.save();

    if (cart) {
      await Cart.findByIdAndDelete(cart._id);
    }

    // Make the POST request to client_url/successTransaction
    res.redirect(`${client_url}/successTransaction`);
  } catch (error) {
    // Handle errors
    console.error("Error making POST request:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to make POST request" });
  }
};

const createOrder = async (req, res) => {
  try {
    const { customer, addressId, orderType, orderStatus, paymentId } = req.body;

    // Validate the customer
    const user = await User.findById(customer);
    if (!user) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    // Validate the address
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(400).json({ message: "Invalid address" });
    }

    // Validate the cart
    const cart = await Cart.findOne({ userId: customer });
    if (!cart) {
      return res.status(400).json({ message: "Cart not found" });
    }

    if (orderType !== 'credit' && (paymentId === null || paymentId === undefined || paymentId === '')) {
      res.status(400).json({ message: "Payment ID is required for cash orders" });
    }

    // Validate the paymentId if provided
    let payment = null;
    if (paymentId) {
      payment = await Payment.findById(paymentId);
      if (!payment) {
        return res.status(400).json({ message: "Invalid payment ID" });
      }
    }

    const totalPayableAmount = cart.payableTotalPrice;
    const totalDiscounts = cart.products.reduce((acc, product) => acc + product.discount, 0);
    const totalInterest = cart.products.reduce((acc, product) => acc + product.interest, 0);

    // Check credit limit for "credit" and "partial" order types
    if (orderType === "credit" && (user.creditLimit - user.usedCredit) < totalPayableAmount) {
      console.log("Insufficient credit limit:", user.creditLimit, user.usedCredit, totalPayableAmount);
      return res.status(400).json({ message: "Insufficient credit limit" });
    }

    if (orderType === "partial") {
      const creditLimitNeeded = totalPayableAmount * 0.8; // 80% of total
      if ((user.creditLimit - user.usedCredit) < creditLimitNeeded) {
        console.log("Insufficient credit limit for partial order:", user.creditLimit, user.usedCredit, creditLimitNeeded);
        return res.status(400).json({ message: "Insufficient credit limit for partial order" });
      }
    }

    // Define the initial order and payment statuses
    let initialOrderStatus = "draft";
    let initialPaymentStatus = "pendingApproval";

    if (orderType === "credit") {
      initialOrderStatus = "orderReceived";
      initialPaymentStatus = "pendingPayment";
    }

    // Create the order
    console.log("Credit limit check passed:", user.creditLimit, user.usedCredit, totalPayableAmount);
    const now = new Date();
    const order = new Order({
      orderId: generateOrderId(),
      customer,
      address: addressId,
      orderType,
      products: cart.products.map((product) => ({
        product: product.productId,
        quantity: product.quantity,
        cashDiscount: product.discount,
        interest: product.interest,
        dueDate: now.setDate(now.getDate() + product.paymentPeriod).toString(),
        price: product.finalPrice,
        dueAmount: orderType === "credit" ? product.finalPrice : 0,
      })),
      orderStatus: initialOrderStatus,
      paymentStatus: initialPaymentStatus,
      cashDiscount: totalDiscounts,
      interest: totalInterest,
      totalAmount: totalPayableAmount,
      // amountPaid: orderType === "credit" || orderType === "partial" ? 0 : totalPayableAmount,
      // amountRemaining: orderType === "credit" || orderType === "partial" ? totalPayableAmount : 0,
      paymentHistory: payment ? [payment._id] : [],
    });

    // Save the order
    await order.save();

    if (payment) {
      payment.order = order._id;
      await payment.save();
    }

    // Update user credit if applicable
    if (orderType === "credit" || orderType === "partial") {
      user.usedCredit += totalPayableAmount;
      await user.save();
    }

    // Clear the user's cart after placing the order
    await Cart.findByIdAndDelete(cart._id);

    // Populate and send the response
    const populatedOrder = await Order.findById(order._id).populate("address paymentHistory");
    res.status(201).json({ success: true, message: "Ordered successfully!", data: populatedOrder });

  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
};

const addPayment = async (req, res) => {
  try {
    const { customerId, amount, upiRefNumber, orderId } = req.body;
    if (!customerId || !amount || !upiRefNumber) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const payment = new Payment({
      paymentId: generateRandomString(),
      customer: customerId,
      order: orderId,
      amount,
      upiRefNumber: upiRefNumber,
      status: "pending",
      paymentMethod: "UPI",
      createdAt: Date.now(),
    });

    await payment.save();

    // order.paymentHistory.push(payment._id);
    // order.paymentStatus = "pendingPayment";
    // payment.populate('order');
    // await order.save();

    res.status(201).json({
      success: true,
      message: "Your payment has been successfully sent for verification.",
      data: payment,
      id: payment._id,
    });
  } catch (err) {
    console.error("Error adding payment:", err);
    res.status(500).json({ error: "Failed to add payment." });
  }
};

const approvePaymentByAdmin = async (req, res) => {
  try {
    const { paymentId } = req.body;

    // Fetch the payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    // Fetch the customer
    const customer = await User.findById(payment.customer);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    // Approve payment if not already approved
    if (payment.approved !== true) {
      payment.approved = true;
      payment.status = "approved";
      payment.updatedAt = Date.now();
      await payment.save();

      // Fetch the order associated with the payment
      const order = await Order.findById(payment.order);
      if (!order) {
        return res.status(404).json({ message: "Order not found." });
      }

      // Update order details
      order.paymentStatus = "paymentApproved";
      order.amountPaid += payment.amount;
      order.amountRemaining -= payment.amount;
      order.orderStatus = "inProgress";
      if (order.paymentHistory.includes(payment._id) === false) {
        order.paymentHistory.push(payment._id);
      }
      await order.save();

      // Update customer details
      customer.totalSpent += payment.amount;
      await customer.save();

      res.status(200).json({ message: "Payment approved successfully." });
    } else {
      res.status(409).json({ message: "Payment already approved." });
    }

  } catch (err) {
    console.error("Error approving payment:", err);
    res.status(500).json({ error: "Failed to approve payment." });
  }
};

const rejectPaymentByAdmin = async (req, res) => {
  try {
    const { paymentId } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }
    payment.approved = false;
    payment.status = "rejected";
    payment.updatedAt = Date.now();
    payment.save();

    res.status(200).json({ message: "Payment rejected successfully." });

  } catch (err) {
    console.error("Error rejecting payment:", err);
    res.status(500).json({ error: "Failed to reject payment." });
  }
}

const IPGPaymentOrder = async (req, res) => {
  try {
    const order = await Order.create({
      customer,
      products,
      totalAmount,
    });

    const cart = await Cart.findOne({ userId: customer });

    const payment = await Payment.create({
      paymentId: generateRandomString(),
      order: order._id,
      amount: totalAmount,
      status: "pending",
      paymentMethod: "Credit Card",
    });

    order.payment = payment._id;
    await order.save();

    if (cart) {
      await Cart.findByIdAndDelete(cart._id);
    }

    res.status(201).json({ order, payment });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

const handlePaymentStatus = async (req, res) => {
  const { transactionId, newStatus } = req.body;
  try {
    const payment = await Payment.findOne({ _id: transactionId });

    if (!payment) {
      console.error("Payment not found for transaction:", transactionId);
      return res
        .status(404)
        .json({ message: "Payment not found", success: false });
    }

    payment.status = newStatus;
    await payment.save();

    console.log(
      `Payment status updated to ${newStatus} for transaction:`,
      transactionId
    );
    return res
      .status(200)
      .json({ message: "Payment status updated successfully", success: true });
  } catch (error) {
    console.error("Error updating payment status:", error);
    return res
      .status(500)
      .json({ message: "Failed to update payment status", success: false });
  }
};

const getAllPayments = async (req, res) => {
  try {

    const payments = await Payment.find().sort({ createdAt: -1 });

    console.log("All payments:", payments);
    res
      .status(200)
      .json({ message: "Payments fetched successfully", payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};

const getPaymentsOfOneUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const payments = await Payment.find({ customer: userId }).sort({ createdAt: -1 });

    console.log("All payments:", payments);
    res
      .status(200)
      .json({ message: "Payments fetched successfully", payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};

const getAllOrderedProductsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ customer: userId })
      .populate("products.product").sort({ createdAt: -1 })
      .exec();


    const allOrderedProducts = [];
    orders.forEach(order => {
      order.products.forEach(item => {
        allOrderedProducts.push({
          product: item.product,
          quantity: item.quantity,
          price: item.price,
          dueAmount: item.dueAmount,
          dueDate: item.dueDate,
          cashDiscount: item.cashDiscount,
          interest: item.interest,
        });
      });
    });

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    } else {
      res.status(200).json({
        success: true,
        message: "Ordered products fetched successfully",
        data: allOrderedProducts,
      })
    }
  } catch (err) {
    console.error("Error fetching ordered products:", err);
    res.status(500).json({ error: "Failed to fetch ordered products" });
  }
};

const getTotalPurchasesByAllCategories = async (req, res) => {
  try {
    const { userId } = req.params;

    const products = await Product.find();
    const categories = [...new Set(products.flatMap(product => product.mainCategory))]; // Get unique categories

    // Initialize an empty array to hold the results
    const categoryTotals = [];

    for (const category of categories) {
      // Find all products in this category
      const productsInCategory = await Product.find({
        mainCategory: { $in: [category] },
      });

      const productIds = productsInCategory.map(product => product._id);

      // Aggregate orders to calculate the total amount for this category
      const orders = await Order.aggregate([
        {
          $match: {
            customer: new mongoose.Types.ObjectId(userId), // Match orders for the specified user
            "products.product": { $in: productIds }, // Match products in the specified category
          },
        },
        {
          $unwind: "$products", // Unwind the products array to process each product individually
        },
        {
          $match: {
            "products.product": { $in: productIds }, // Filter products in the specified category
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$products.price" }, // Sum up the total amount spent on the selected category
          },
        },
      ]);

      // Push the result in the array with category as value
      categoryTotals.push({
        category: category,
        totalAmount: orders.length > 0 ? orders[0].totalAmount : 0,
      });
    }

    // Return the totals for all categories as an API response
    return res.json({
      success: true,
      data: categoryTotals,
    });
  } catch (error) {
    console.error("Error fetching total purchases by all categories:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the data.",
    });
  }
};
module.exports = {
  addPayment,
  createOrder,
  approvePaymentByAdmin,
  rejectPaymentByAdmin,
  stripePayment,
  getOrdersForUser,
  getAllOrders,
  SuccessIPG,
  IPGPaymentOrder,
  sendOtp,
  verifyOtp,
  getAllPayments,
  getPaymentsOfOneUser,
  handlePaymentStatus,
  getAllOrderedProductsByUser,
  getTotalPurchasesByAllCategories,
};
