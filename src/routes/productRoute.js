const express = require("express");
const {
  createProduct,
  editProduct,
  deleteProduct,
  addCashDiscounts,
  getProduct,
  getAllProducts,
  changeStockStatus,
  importCSV,
  exportCSV,
  updateCashDiscount,
  getAllCashDiscounts,
  addInterests,
  updateInterest,
  getAllInterests,
  deleteCashDiscounts,
  deleteInterest,
  getProductVariants,
} = require("../controllers/productControllers");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Wishlist = require("../models/wishlistModel");

// Ensure directories exist
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Multer storage configuration for CSV files
const csvStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "temp/csv";
    ensureDirExists(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Multer upload configuration for CSV files
const uploadCSV = multer({ storage: csvStorage });

// Multer storage configuration for images
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "images";
    ensureDirExists(dir);
    cb(null, dir); // Destination folder for saving images
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${req.body.title}-${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Multer upload configuration for images
const uploadImages = multer({ storage: imageStorage });

// Multer storage configuration for GLB/GLTF files
const arFileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "arFiles";
    ensureDirExists(dir);
    cb(null, dir); // Destination folder for saving AR files
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Multer upload configuration for GLB/GLTF files
const uploadARFile = multer({ storage: arFileStorage });

// Routes
router.get("/all", getAllProducts);
router.get('/dashboard/cart-and-wishlist/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const cart = await Cart.findOne({ userId: userId });
    const wishlist = await Wishlist.findOne({ userId: userId });
    return res.status(200).json({ cart: cart.products.length ?? 0, wishlist: wishlist.products.length ?? 0 });
  } catch (error) {
    console.log(error)
    return res.status(200).json({ cart: 0, wishlist: 0 });
  }
});

router.post("/cashDiscount/add", addCashDiscounts);
router.put("/cashDiscount/update/:id", updateCashDiscount);
router.delete("/cashDiscount/delete/:id", deleteCashDiscounts);
router.get("/cashDiscount/all", getAllCashDiscounts);

router.post("/interest/add", addInterests);
router.put("/interest/update/:id", updateInterest);
router.delete("/interest/delete/:id", deleteInterest);
router.get("/interest/all", getAllInterests);

router.post(
  "/create",
  uploadImages.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 5 },
    { name: "attributeImages" },
    { name: "arFile", maxCount: 1 },
  ]),
  createProduct
);

router.put(
  "/edit/:productId",
  uploadImages.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 5 },
    { name: "attributeImages" },
    { name: "arFile", maxCount: 1 },
  ]),
  editProduct
);

router.delete("/delete/:productId", deleteProduct);
router.post("/stockStatus", changeStockStatus);

router.get("/exportCSV", exportCSV);

router.post(
  "/importCSV",
  uploadCSV.single("csvFile"),
  importCSV
);

router.get("/:productId", getProduct);
router.get("/:productId", getProductVariants);

module.exports = router;
