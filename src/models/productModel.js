const mongoose = require("mongoose");
const { required } = require("nodemon/lib/config");

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  // cashDiscount: {
  //   type: [
  //     {
  //       timePeriod: { type: Number },
  //       discountValue: { type: Number, default: 0 },
  //     }
  //   ]
  // },
  // interestRate: {
  //   type: [
  //     {
  //       timePeriod: { type: Number },
  //       interestValue: { type: Number, default: 0 },
  //       gracePeriod: { type: Number, default: 0 },
  //     }
  //   ]
  // },
  discounts: { type: Boolean, default: false },
  discountValue: { type: Number, required: false },
  // price: { type: Number, required: true },
  currency: { type: String },
  available: { type: Number },
  pieces: { type: Number },
  minQuantity: { type: Number },
  quantityIncrement: { type: Number },
  promotional: { type: String },
  editorContent: { type: String },
  width: { type: Number },
  height: { type: Number },
  // weight: { type: Number },
  status: {
    type: String,
    enum: ["available", "outOfStock"],
    default: "available",
  },
  sku: { type: String },
  mainImage: { type: String },
  additionalImages: { type: [String] },
  mainCategory: { type: [String] },
  subCategory: { type: [String] },
  series: { type: [String] },
  tags: { type: [String] },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  approved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  attributes: [
    {
      type: { type: String },
      value: { type: String },
      price: { type: String },
      attributeImage: { type: String },
    },
  ],


  featured: { type: Boolean, default: false },
  isStock: { type: Boolean, default: false },
  threeDiaLinkHor: { type: String },
  threeDiaLinkVer: { type: String },
  arFilePath: { type: String },
  metaTitle: { type: String },
  metaDescription: { type: String },
  metaTags: { type: String },

  variants: [
    {
      type: { type: String, enum: ['g', 'kg', 'ml', 'litre'], required: true },
      value: Number, // 100, 500, etc.
      price: Number, // Price for the variant
    },
  ],
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
