const mongoose = require("mongoose");

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
    type: String, // e.g., "cash" or "credit"
    required: true,
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
      variant: [
        {
          _id: mongoose.Schema.Types.ObjectId,
          type: String,
          price: Number,
          value: Number,
        },
      ],
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
  amountRemaining: {
    type: Number,
    default: function () {
      return this.totalAmount - this.amountPaid;
    },
  },
  paymentHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  ],
  orderStatus: {
    type: String,
    enum: [
      "draft",
      "orderReceived",
      "inProgress",
      "qualityCheck",
      "outForDelivery",
      "orderDelivered",
    ],
    default: "draft",
  },
  paymentStatus: {
    type: String,
    enum: [
      "pendingPayment",
      "pendingApproval",
      "paymentApproved",
      "paidInFull",
    ],
    default: "pendingPayment",
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