const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const {
  approveVendor,
  approveCustomer,
  productApproval,
  addBanner,
  createCoupon,
  deleteCoupon,
  changeOrderStatus,
  updateDeliveryDate,
  markFeatured,
  updatePrivacyPolicy,
  getPrivacyPolicy,
  getAllCoupons,
  generateNewsletter,
  getSocial,
  updateSocial,
  updateMenu,
  getMenu,
  getCategories,
  addCategory,
  markSelectedCategories,
  updateUserDetails,
  addSubcategory,
  createBlog,
  getAllBlogs,
  addSeries,
  deleteBanner,
  deleteBlog,
  setUserCreditLimit,
  editCategory,
  deleteCategory,
  rejectCustomer,
  updateOrderDetails,
  getOrderDetails,
} = require("../controllers/adminControllers");

const { sendEmail } = require("../config/sendEmail");

const router = express.Router();

// Helper function to ensure a directory exists
const ensureDirectoryExists = (directoryPath) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
};

// Generalized storage configuration
const createStorage = (subDirectory) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      const targetPath = "images/" + subDirectory;
      ensureDirectoryExists(targetPath); // Ensure directory exists
      cb(null, targetPath);
    },
    filename: function (req, file, cb) {
      const originalFilename = file.originalname;
      const extension = path.extname(originalFilename);
      const filenameWithoutExtension = originalFilename.replace(extension, "");
      const filename = `${filenameWithoutExtension}-${Date.now()}${extension}`;
      cb(null, filename);
    },
  });

// Multer storage configurations for various uploads
const bannerStorage = createStorage("");
const categoryStorage = createStorage("categories");
const subcategoryLogoStorage = createStorage("subcategories");
const seriesLogoStorage = createStorage("series");
const blogImageStorage = createStorage("blogs");

// Multer upload configurations
const bannerUpload = multer({ storage: bannerStorage }).single("banner");
const categoryUpload = multer({ storage: categoryStorage }).fields([
  { name: "categoryImage", maxCount: 1 },
]);
const subcategoryLogoUpload = multer({
  storage: subcategoryLogoStorage,
}).single("subcategoryLogo");
const seriesLogoUpload = multer({
  storage: seriesLogoStorage,
}).single("seriesLogo");
const blogImageUpload = multer({
  storage: blogImageStorage,
}).single("blogImage");

// Routes for banners
router.post("/uploadBanner", bannerUpload, addBanner);
router.delete("/banner/:bannerId", deleteBanner);

// Routes for categories
router.post(
  "/category",
  (req, res, next) => {
    categoryUpload(req, res, (err) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ error: "Category image/logo upload failed" });
      }
      next();
    });
  },
  addCategory
);
router.put(
  "/category/update",
  (req, res, next) => {
    categoryUpload(req, res, (err) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ error: "Category image/logo upload failed" });
      }
      next();
    });
  },
  editCategory
);

router.delete("/category/delete/:id", deleteCategory);
// Add a route for adding subcategories
router.post(
  "/subcategory",
  (req, res, next) => {
    subcategoryLogoUpload(req, res, (err) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ error: "Subcategory logo upload failed" });
      }
      next();
    });
  },
  addSubcategory
);

// Add a route for adding series
router.post(
  "/series",
  (req, res, next) => {
    seriesLogoUpload(req, res, (err) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ error: "Series logo upload failed" });
      }
      next();
    });
  },
  addSeries
);

// Route for creating a blog post
router.post(
  "/createBlog",
  (req, res, next) => {
    blogImageUpload(req, res, (err) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ error: "Blog image upload failed" });
      }
      next();
    });
  },
  createBlog
);

// Additional routes
router.get("/category", getCategories);
router.post("/category/select", markSelectedCategories);
router.post("/send-email", (req, res) => {
  const { email, subject, message } = req.body;
  const success = sendEmail(email, subject, message);
  if (success) {
    res.status(200).json({ message: "Email sent successfully" });
  } else {
    res.status(500).json({ error: "Email sending failed" });
  }
});

// Other routes
router.post("/approveVendor", approveVendor);
router.post("/approveCustomer", approveCustomer);
router.post("/rejectCustomer", rejectCustomer);
router.post("/approveProduct", productApproval);
router.get("/coupons", getAllCoupons);
router.post("/createCoupon", createCoupon);
router.delete("/coupons/:id", deleteCoupon);
router.put("/orderStatus", changeOrderStatus);
router.post("/updateDelivery", updateDeliveryDate);
router.post("/markFeatured", markFeatured);
router.get("/privacy", getPrivacyPolicy);
router.post("/privacy", updatePrivacyPolicy);
router.post("/newsletter", generateNewsletter);
router.get("/social", getSocial);
router.post("/social", updateSocial);
router.get("/menu", getMenu);
router.post("/menu", updateMenu);
router.put("/updateCustomer", updateUserDetails);
router.get("/blogs", getAllBlogs);
router.delete("/blog/:id", deleteBlog);
router.post("/addCreditLimit/:userId", setUserCreditLimit);
router.put('/update/:id', updateOrderDetails);
router.get('/orders/:id', getOrderDetails);

module.exports = router;
