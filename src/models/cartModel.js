const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      discount: {
        type: Number,
        default: 0,
      },
      updatedPrice: {
        type: Number,
      },
      discountedPrice: {
        type: Number,
        default: 0,
      },
      purchaseType: {
        type: String,
        enum: ["credit", "cash"],
        default: "credit",
      },
      paymentPeriod: {
        type: Number,
        // default: 0,
      }
    },
  ],
  cartTotal: {
    type: Number,
    default: 0,
  },
  discountsTotal: {
    type: Number,
    default: 0,
  },
  payableTotalPrice: {
    type: Number,
    default: 0,
  },
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon",
  },
  couponDiscountedTotal: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
