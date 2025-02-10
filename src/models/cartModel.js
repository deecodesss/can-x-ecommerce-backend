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
      variantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product.variants",
        required: false, // Optional for products without variants
      },
      variant: [
        {
          type: { type: String }, // Matches product attribute type
          value: { type: String }, // Matches product attribute value
          price: { type: Number, default: 0 }, // Matches additional price for attribute
        },
      ],
      quantity: {
        type: Number,
        default: 1,
      },
      discount: {
        type: Number,
        default: 0, // Percentage or absolute value, handled in business logic
      },
      interest: {
        type: Number,
        default: 0, // Interest value for credit purchase
      },
      updatedPrice: {
        type: Number, // Updated price after calculations
      },
      finalPrice: {
        type: Number,
        default: 0, // Final price after discounts, interest, etc.
      },
      purchaseType: {
        type: String,
        enum: ["credit", "cash"],
        default: "credit",
      },
      paymentPeriod: {
        type: Number, // Applicable for credit purchases
      },
    },
  ],
  cartTotal: {
    type: Number,
    default: 0, // Sum of updated prices for all products
  },
  discountsTotal: {
    type: Number,
    default: 0, // Sum of all discounts applied
  },
  interestsTotal: {
    type: Number,
    default: 0, // Sum of all interests applied
  },
  payableTotalPrice: {
    type: Number,
    default: 0, // Cart total after discounts and interests
  },
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon",
  },
  couponDiscountedTotal: {
    type: Number,
    default: 0, // Total after applying coupon discount
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
