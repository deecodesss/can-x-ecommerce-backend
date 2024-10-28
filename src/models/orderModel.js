const mongoose = require("mongoose");
const { interest } = require("payu-websdk/wrapper/emi");

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderType: {
    type: String,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
        required: true,
      },
      cashDiscount: {
        type: Number,
      },
      interest: {
        type: Number,
      },
      dueDate: {
        type: Date,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      dueAmount: {
        type: Number,
        default: 0,
      }
    },
  ],
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true
  },
  cashDiscount: {
    type: Number,
    default: 0,
  },
  interest: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  amountRmaining: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: [
      "orderReceived",
      "inProgress",
      "qualityCheck",
      "outForDelivery",
      "orderDelivered",
    ],
    default: "orderReceived",
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deliveryDate: {
    type: Date,
    default: null,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
