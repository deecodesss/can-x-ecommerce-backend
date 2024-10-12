const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  cashDiscount: {
    type: [
      {
        timePeriod: { type: Number },
        discountValue: { type: Number, default: 0 },
      }
    ]
  },
  interestRate: {
    type: [
      {
        timePeriod: { type: Number },
        interestValue: { type: Number, default: 0 },
        gracePeriod: { type: Number, default: 0 },
      }
    ]
  },
  // cashDiscount: {
  //   "0-30": { type: Number, default: 0 },
  //   "30-60": { type: Number, default: 0 },
  //   "60-90": { type: Number, default: 0 },
  //   "90-120": { type: Number, default: 0 },
  // },
  // interestRate: {
  //   "0-30": { type: Number, default: 0 },
  //   "30-60": { type: Number, default: 0 },
  //   "60-90": { type: Number, default: 0 },
  //   "90-120": { type: Number, default: 0 },
  //   gracePeriod: { type: Number },
  //   // Add more periods as needed
  // },
  discounts: { type: Boolean, default: false },
  discountValue: { type: Number, default: 0 },
  price: { type: Number, required: true },
  currency: { type: String },
  available: { type: Number },
  pieces: { type: Number },
  promotional: { type: String },
  editorContent: { type: String },
  width: { type: Number },
  height: { type: Number },
  weight: { type: Number },
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
  approved: { type: Boolean, default: false },
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
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
