const express = require("express");

const {
  getOrdersForUser,
  getAllOrders,
  stripePayment,
  cybersourcePayment,
  sendOtp,
  verifyOtp,
  IPGPaymentOrder,
  getAllPayments,
  handlePaymentStatus,
  SuccessIPG,
  createOrder,
  getAllOrderedProductsByUser,
  addPayment,
  approvePaymentByAdmin,
  rejectPaymentByAdmin,
  getTotalPurchasesByAllCategories,
} = require("../controllers/orderControllers");
const { applyCoupon } = require("../controllers/cartControllers");
const router = express.Router();

router.post("/ipg-payment", IPGPaymentOrder);
router.post("/successTransaction", SuccessIPG);
router.post("/stripe-checkout", stripePayment);
router.get("/getAllPayments", getAllPayments);
router.put("/paymentStatus", handlePaymentStatus);
router.get("/:userId", getOrdersForUser);
router.get("/", getAllOrders);
router.post("/applyCoupon", applyCoupon);
router.post("/sendOtp", sendOtp);
router.post("/verifyOtp", verifyOtp);

router.post("/create", createOrder);
router.post("/payment/add", addPayment);
router.post("/payment/approve", approvePaymentByAdmin);
router.post("/payment/reject", rejectPaymentByAdmin);
router.get("/products/:userId", getAllOrderedProductsByUser);
router.get("/category/total-purchase/:userId", getTotalPurchasesByAllCategories);


module.exports = router;
