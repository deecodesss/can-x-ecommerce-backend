const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");

const addToCart = async (req, res) => {
  const { userId, productId, quantity, purchaseType, paymentPeriod } = req.body;

  try {
    // Validate the user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Validate the product
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) return res.status(404).json({ message: `Product with ID ${productId} not found` });

    // Parse the quantity and ensure it's valid
    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: "Quantity must be a valid integer greater than 0" });
    }

    // Initialize discount value
    let discountValue = 0;

    // Calculate discount if applicable
    if (purchaseType === "credit" && paymentPeriod) {
      const cashDiscount = existingProduct.cashDiscount;

      for (const discount of cashDiscount) {
        if (paymentPeriod <= discount.timePeriod) {
          discountValue = discount.discountValue;
          break;
        }
      }
    }

    // Calculate original and discounted prices
    const originalPrice = existingProduct.price * parsedQuantity;
    const discountedPrice = discountValue > 0 ? originalPrice - (originalPrice * discountValue / 100) : originalPrice;

    // Ensure discountedPrice is not NaN
    const finalDiscountedPrice = isNaN(discountedPrice) ? originalPrice : discountedPrice;

    // Check if the cart already exists for the user
    let cart = await Cart.findOne({ userId });

    // Initialize totals
    let discountsTotal = 0;
    let totalAmount = 0;
    let cartTotal = 0;
    // If no cart exists, create a new cart
    if (!cart) {
      cart = new Cart({
        userId,
        products: [{
          productId,
          quantity: parsedQuantity,
          discount: discountValue,
          updatedPrice: originalPrice,
          discountedPrice: finalDiscountedPrice,
          purchaseType,
          paymentPeriod,
        }],
        cartTotal: originalPrice,
        discountsTotal: originalPrice - finalDiscountedPrice,
        payableTotalPrice: finalDiscountedPrice,
      });
    } else {
      // Update cart
      const existingCartItem = cart.products.find(item => item.productId.toString() === productId);

      if (existingCartItem) {
        // If product exists, update the quantity and prices
        existingCartItem.quantity += parsedQuantity;
        existingCartItem.updatedPrice = (existingCartItem.updatedPrice || 0) + originalPrice; // Ensure default value
        existingCartItem.discountedPrice = (existingCartItem.discountedPrice || 0) + finalDiscountedPrice; // Ensure default value
        existingCartItem.discount = discountValue;
        existingCartItem.purchaseType = purchaseType;
        existingCartItem.paymentPeriod = paymentPeriod;
      } else {
        // Add new product to cart
        cart.products.push({
          productId,
          quantity: parsedQuantity,
          discount: discountValue,
          updatedPrice: originalPrice,
          discountedPrice: finalDiscountedPrice,
          purchaseType,
          paymentPeriod,
        });
      }

      // Calculate new totals
      // discountsTotal = cart.products.reduce((total, item) => total + item.updatedPrice - item.discountedPrice, 0);
      totalAmount = cart.products.reduce((total, item) => total + item.discountedPrice, 0);
      cartTotal = cart.products.reduce((total, item) => total + item.updatedPrice, 0);


      // Update cart totals
      cart.cartTotal = cartTotal;
      cart.discountsTotal = cartTotal - totalAmount;
      cart.payableTotalPrice = totalAmount;
    }

    // Save the cart
    await cart.save();

    // Respond with cart details
    res.status(201).json({ message: "Product added to cart successfully", cart });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const removeFromCart = async (req, res) => {
  const { userId, productId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res
        .status(404)
        .json({ message: `Product with ID ${productId} not found` });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const existingCartItemIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (existingCartItemIndex === -1) {
      return res
        .status(404)
        .json({ message: `Product with ID ${productId} not found in cart` });
    }

    // If product exists in the cart, remove it
    cart.products.splice(existingCartItemIndex, 1);
    await cart.save();

    res
      .status(200)
      .json({ message: "Product removed from cart successfully", cart });
  } catch (error) {
    console.error("Error removing product from cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const decreaseQuantityOfProduct = async (req, res) => {
  const { userId, productId } = req.body;
  console.log(userId, productId);
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res
        .status(404)
        .json({ message: `Product with ID ${productId} not found` });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const existingCartItemIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (existingCartItemIndex === -1) {
      return res
        .status(404)
        .json({ message: `Product with ID ${productId} not found in cart` });
    }

    // Decrease the quantity of the product by 1
    if (cart.products[existingCartItemIndex].quantity > 1) {
      cart.products[existingCartItemIndex].quantity -= 1;
    } else {
      // If quantity becomes 0, remove the product from the cart
      cart.products.splice(existingCartItemIndex, 1);
    }

    await cart.save();

    res
      .status(200)
      .json({ message: "Quantity of product decreased successfully", cart });
  } catch (error) {
    console.error("Error decreasing quantity of product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCart = async (req, res) => {
  const { userId } = req.params;
  console.log(userId);
  try {
    // Find the cart associated with the user
    const cart = await Cart.findOne({ userId }).populate("products.productId");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({ message: "Cart found successfully", cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const { userId, couponCode, total } = req.body;

    const coupon = await Coupon.findOne({ code: couponCode });

    if (!coupon) {
      return res.status(404).json({ error: "Coupon code not found" });
    }

    if (coupon.expirationDate < new Date()) {
      return res.status(400).json({ error: "Coupon code has expired" });
    }

    const user = await User.findById(userId);
    if (user.couponsApplied.includes(coupon._id)) {
      return res.status(400).json({ error: "Coupon already applied by the user" });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    let couponDiscountedTotal = total;

    if (coupon.discountType === 'percentage') {
      couponDiscountedTotal = total - (total * (coupon.discountAmount / 100));
    } else if (coupon.discountType === 'fixed') {
      couponDiscountedTotal = total - coupon.discountAmount;
    }

    const roundedDiscountedTotal = Math.round(couponDiscountedTotal);

    const roundedCouponDiscountedTotal = Math.max(roundedDiscountedTotal, 0);

    cart.couponId = coupon._id;
    cart.couponDiscountedTotal = roundedCouponDiscountedTotal;
    await cart.save();

    user.couponsApplied.push(coupon._id);
    await user.save();

    return res.status(200).json({
      message: "Coupon applied successfully",
      coupon,
      cart: { ...cart.toObject(), couponDiscountedTotal: roundedCouponDiscountedTotal }
    });
  } catch (error) {
    console.error("Error applying coupon:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getCoupon = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId }).populate('couponId');

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    if (!cart.couponId) {
      return res.status(200).json({ message: "No coupon applied" });
    }

    return res.status(200).json({ coupon: cart.couponId });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const removeCouponFromCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    if (!cart.couponId) {
      return res.status(400).json({ error: "No coupon applied to this cart" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const couponId = cart.couponId;
    cart.couponId = null;
    cart.couponDiscountedTotal = 0;
    await cart.save();

    user.couponsApplied = user.couponsApplied.filter(id => !id.equals(couponId));
    await user.save();

    return res.status(200).json({ message: "Coupon removed successfully", cart });
  } catch (error) {
    console.error("Error removing coupon:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  decreaseQuantityOfProduct,
  getCart,
  applyCoupon,
  getCoupon,
  removeCouponFromCart
};
