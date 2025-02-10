const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");
const CashDiscount = require("../models/cashDiscountModel");
const Interest = require("../models/interestModel");
const Order = require("../models/orderModel");

const addToCart = async (req, res) => {
  const { userId, productId, quantity, purchaseType, paymentPeriod, variantId } = req.body;

  try {
    // Validate the user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Validate the product
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) return res.status(404).json({ message: `Product with ID ${productId} not found` });

    // Get the selected variant if provided
    let selectedVariant = null;
    if (variantId) {
      selectedVariant = existingProduct.variants.find(variant => variant._id.toString() === variantId);
      if (!selectedVariant) return res.status(404).json({ message: "Variant not found" });
    }

    // Parse the quantity and ensure it's valid
    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: "Quantity must be a valid integer greater than 0" });
    }

    // Initialize discount and interest values
    let discountValue = 0;
    let interestValue = 0;

    // Calculate discount based on purchase type
    if (purchaseType === "credit" && paymentPeriod >= 0) {
      // Fetch the applicable cash discount based on the payment period
      const cashDiscount = await CashDiscount.findOne({
        paymentStart: { $lte: paymentPeriod },
        paymentEnd: { $gte: paymentPeriod }
      });
      if (cashDiscount) {
        discountValue = cashDiscount.discount; // Apply the discount percentage
      }
    }

    // Fetch the applicable interest based on the payment period
    const interest = await Interest.findOne({
      paymentStart: { $lte: paymentPeriod },
      paymentEnd: { $gte: paymentPeriod }
    });

    if (interest) {
      interestValue = interest.interest; // Apply the interest percentage
    }

    // Calculate original price (with or without variant)
    const originalPrice = selectedVariant ? selectedVariant.price * parsedQuantity : existingProduct.price * parsedQuantity;

    // Calculate discounted price
    const discountedPrice = originalPrice - (discountValue / 100 * originalPrice); // Apply discount to total

    // Calculate interest for delayed payments
    let totalInterest = 0;
    if (interestValue > 0) {
      const interestStartPeriod = interest.paymentStart; // Assuming this is the start of the interest application
      const daysDelayed = paymentPeriod - interestStartPeriod;
      const monthsDelayed = Math.ceil(daysDelayed / 30);

      if (daysDelayed > 0) {
        totalInterest = (interestValue / 100) * discountedPrice * monthsDelayed; // Calculate interest for delayed months
      }
    }

    // Final price after applying discount and adding interest
    const finalPrice = discountedPrice + totalInterest;

    // Check if the cart already exists for the user
    let cart = await Cart.findOne({ userId });

    // If no cart exists, create a new cart
    if (!cart) {
      cart = new Cart({
        userId,
        products: [{
          productId,
          variantId,
          variant: selectedVariant || null,
          quantity: parsedQuantity,
          discount: discountValue,
          interest: interestValue,
          updatedPrice: originalPrice,
          finalPrice: finalPrice,
          purchaseType,
          paymentPeriod,
        }],
        cartTotal: originalPrice,
        payableTotalPrice: finalPrice,
        discountsTotal: discountValue > 0 ? originalPrice - discountedPrice : 0,
        interestsTotal: totalInterest,
      });
    } else {
      // Check if the product already exists in the cart
      const existingProductInCart = cart.products.find(item => item.productId.toString() === productId && item.variantId.toString() === variantId);
      if (existingProductInCart) {
        return res.status(400).json({ message: "Product with this variant already exists in cart" });
      }

      // Add the new product to the cart
      cart.products.push({
        productId,
        variantId,
        variant: selectedVariant || null,
        quantity: parsedQuantity,
        discount: discountValue,
        interest: interestValue,
        updatedPrice: originalPrice,
        finalPrice: finalPrice,
        purchaseType,
        paymentPeriod,
      });

      // Update the cart totals
      cart.cartTotal += originalPrice;
      cart.payableTotalPrice += finalPrice;
      cart.discountsTotal += discountValue > 0 ? originalPrice - discountedPrice : 0;
      cart.interestsTotal += totalInterest;
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
    // Validate the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate the product
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: `Product with ID ${productId} not found` });
    }

    // Fetch the user's cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Check if product exists in the cart
    const existingCartItemIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (existingCartItemIndex === -1) {
      return res.status(404).json({ message: `Product with ID ${productId} not found in cart` });
    }

    // Store the price and interest of the item being removed
    const itemToRemove = cart.products[existingCartItemIndex];
    const itemDiscount = itemToRemove.discount;
    const itemInterest = itemToRemove.interest;
    const itemFinalPrice = itemToRemove.finalPrice;

    // Remove the product from the cart
    cart.products.splice(existingCartItemIndex, 1);

    // Recalculate the total cart values after removal
    let originalCartTotal = 0;
    let finalCartTotal = 0;
    let totalDiscounts = 0;
    let totalInterests = 0;

    for (const product of cart.products) {
      originalCartTotal += existingProduct.price * product.quantity; // Assuming original price from the existingProduct
      if (product.discount > 0) {
        totalDiscounts += (product.discount / 100) * (existingProduct.price * product.quantity);
      }
      if (product.interest > 0) {
        const interest = product.interest;
        const monthsDelayed = Math.ceil((paymentPeriod - interest.paymentStart) / 30); // Calculate how many months interest applies
        totalInterests += (interest / 100) * (existingProduct.price * product.quantity) * monthsDelayed;
      }
      finalCartTotal += product.finalPrice;
    }

    // Update cart totals
    cart.cartTotal = originalCartTotal;
    cart.payableTotalPrice = finalCartTotal; // This will now reflect the updated final price
    cart.discountsTotal = totalDiscounts; // Total discounts applied
    cart.interestsTotal = totalInterests; // Total interests applied

    // Save the updated cart
    await cart.save();

    res.status(200).json({ message: "Product removed from cart successfully", cart });
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

const getLastUsedAddress = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const lastOrder = await Order.findOne({ customer: userId })
      .sort({ createdAt: -1 })
      .populate("address");

    if (!lastOrder) {
      return res.status(404).json({ error: "No address found" });
    }
    if (!lastOrder.address) {
      return res.status(404).json({ error: "No address found" });
    }

    return res.status(200).json({ address: lastOrder.address });

  } catch (error) {
    console.error("Error fetching last used address:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  addToCart,
  removeFromCart,
  decreaseQuantityOfProduct,
  getCart,
  applyCoupon,
  getCoupon,
  removeCouponFromCart,
  getLastUsedAddress,
};