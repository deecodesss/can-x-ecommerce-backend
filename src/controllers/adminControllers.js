const Product = require("../models/productModel");
const User = require("../models/userModel");
const Banner = require("../models/bannerModel");
const { sendEmail } = require("../config/sendEmail");
const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");
const PrivacyPolicy = require("../models/privacyPolicyModel");
const SocialMedia = require("../models/socialModel");
const Menu = require("../models/menuModel");
const Category = require("../models/categoryModel");
const Blog = require("../models/blogModel");

const serverUrl = process.env.SERVER_URL;

const approveVendor = async (req, res) => {
  try {
    const { user } = req.body;
    const vendor = await User.findById(user._id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    if (vendor.vendorAccess) {
      return res.status(400).json({ message: "Vendor is already approved" });
    }
    vendor.vendorAccess = true;
    await vendor.save();

    const approvalEmailMessage = `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          padding: 20px;
        }
        .container {
          background-color: #fff;
          border-radius: 5px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h2 {
          color: #333;
          margin-bottom: 20px;
        }
        p {
          color: #555;
          margin-bottom: 10px;
        }
        .button {
          background-color: #007bff;
          color: #fff;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Congratulations! Your vendor account has been approved.</h2>
        <p>Hello ${vendor.name},</p>
        <p>Your vendor account at our platform has been approved. You can now start selling your products.</p>
        <p>If you have any questions or need assistance, feel free to contact us.</p>
        <a href="${process.env.CLIENT_URL}/vendor-login" class="button">Start Selling</a>
      </div>
    </body>
  </html>
`;

    // Send approval email
    await sendEmail(
      vendor.name,
      vendor.email,
      "Vendor Approval",
      approvalEmailMessage
    );

    res.status(200).json({ message: "Vendor approved successfully" });
  } catch (error) {
    console.error("Error approving vendor:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const approveCustomer = async (req, res) => {
  try {
    const { user } = req.body;
    const customer = await User.findById(user._id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    if (customer.customerAccess) {
      return res.status(400).json({ message: "Customer is already approved" });
    }
    customer.customerAccess = true;
    await customer.save();

    const approvalEmailMessage = `
  <html>
    <head>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background-color: #f8f9fa;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .success-icon {
          font-size: 48px;
          color: #28a745;
          margin-bottom: 20px;
        }
        h2 {
          color: #28a745;
          margin: 0 0 20px 0;
          font-size: 28px;
          font-weight: 600;
        }
        .subheading {
          color: #6c757d;
          font-size: 16px;
          margin-bottom: 30px;
        }
        p {
          color: #495057;
          line-height: 1.6;
          margin-bottom: 15px;
          font-size: 16px;
        }
        .cta-button {
          background-color: #28a745;
          color: #ffffff;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 6px;
          display: inline-block;
          font-weight: 600;
          margin: 20px 0;
          transition: background-color 0.3s ease;
        }
        .cta-button:hover {
          background-color: #218838;
        }
        .features {
          margin: 30px 0;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        .feature-item {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }
        .feature-icon {
          margin-right: 15px;
          color: #28a745;
          font-size: 20px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
        }
        .social-links {
          margin-top: 20px;
        }
        .social-link {
          color: #6c757d;
          text-decoration: none;
          margin: 0 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="success-icon">✓</div>
          <h2>Welcome Aboard! 🎉</h2>
          <div class="subheading">Your account has been successfully approved</div>
        </div>
        
        <p>Dear ${customer.firstName},</p>
        
        <p>Great news! Your account has been approved and you now have full access to our platform. We're excited to have you join our community of trusted partners.</p>
        
        <center>
          <a href="[Your-Login-URL]" class="cta-button">
            Start Shopping Now
          </a>
        </center>

        <div class="features">
          <h3 style="color: #28a745; margin-bottom: 15px;">What you can do now:</h3>
          <div class="feature-item">
            <span class="feature-icon">→</span>
            <span>Browse our extensive product catalog</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">→</span>
            <span>Place orders with special partner pricing</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">→</span>
            <span>Track your orders in real-time</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">→</span>
            <span>Access exclusive deals and promotions</span>
          </div>
        </div>

        <p>To get started, simply click the button above or log in to your account using your registered email and password.</p>

        <p>If you need any assistance or have questions, our support team is here to help:</p>

        <div class="footer">
          <p>Thank you for choosing us as your business partner!</p>
          <div class="social-links">
            <a href="#" class="social-link">Facebook</a>
            <a href="#" class="social-link">Twitter</a>
            <a href="#" class="social-link">LinkedIn</a>
          </div>
          <p style="margin-top: 20px; font-size: 12px;">
            © ${new Date().getFullYear()} Satpura Bio Fertiliser India Pvt Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </body>
  </html>
`;
    // Send approval email
    await sendEmail(
      // customer.firstName,
      customer.email,
      "Account Approval",
      approvalEmailMessage
    );

    res.status(200).json({ message: "Customer approved successfully" });
  } catch (error) {
    console.error("Error approving customer:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const rejectCustomer = async (req, res) => {
  try {
    const { user } = req.body;
    const customer = await User.findById(user._id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    if (customer.customerRejected) {
      return res.status(400).json({ message: "Customer is already rejected" });
    }
    customer.customerRejected = true;
    await customer.save();

    const rejectionEmailMessage = `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          padding: 20px;
        }
        .container {
          background-color: #fff;
          border-radius: 5px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h2 {
          color: #dc3545;
          margin-bottom: 20px;
        }
        p {
          color: #555;
          margin-bottom: 10px;
        }
        .button {
          background-color: #6c757d;
          color: #fff;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          display: inline-block;
        }
        .contact-info {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Account Application Status Update</h2>
        <p>Dear ${customer.firstName},</p>
        <p>Thank you for your interest in joining our platform. After careful review of your application, we regret to inform you that we are unable to approve your account at this time.</p>
        <p>This decision may be due to one or more of the following reasons:</p>
        <ul style="color: #555; margin-bottom: 15px;">
          <li>Incomplete or incorrect documentation</li>
          <li>Unable to verify provided information</li>
          <li>Does not meet our current eligibility criteria</li>
        </ul>
        <p>You are welcome to submit a new application after 30 days with updated documentation.</p>
        <div class="contact-info">
          <p>If you believe this decision was made in error or need further clarification, please contact our support team:</p>
          <p>Phone: +91 08048978446</p>
        </div>
      </div>
    </body>
  </html>
`;

    // Send approval email
    await sendEmail(
      // customer.firstName,
      customer.email,
      "Account Rejection",
      rejectionEmailMessage
    );

    res.status(200).json({ message: "Customer rejected successfully" });
  } catch (error) {
    console.error("Error approving customer:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const productApproval = async (req, res) => {
  try {
    const { product } = req.body;
    const approvedProduct = await Product.findById(product._id);
    if (approvedProduct.approved) {
      return res.status(400).json({ message: "Product is already approved" });
    }

    approvedProduct.approved = true;
    await approvedProduct.save();

    const user = await User.findById(product.vendorId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const approvalEmailMessage = `
        <html>
          <head>
            <style>
              /* CSS styles */
            </style>
          </head>
          <body>
            <div>
              <h2>Congratulations! Your product has been approved.</h2>
              <p>Hello ${user.name},</p>
              <p>Your product "${product.title}" has been approved. It is now visible to customers on our platform.</p>
              <p>If you have any questions or need assistance, feel free to contact us.</p>
            </div>
          </body>
        </html>
      `;

    await sendEmail(
      user.name,
      user.email,
      "Product Approval",
      approvalEmailMessage
    );

    res.status(200).json({ message: "Product approved successfully" });
  } catch (error) {
    console.error("Error approving product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const addBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const bannerFile = req.file;
    const { fileName, redirectUrl, title, description, buttonContent } =
      req.body;
    console.log(fileName, title, description, buttonContent);

    const newBanner = new Banner({
      fileName,
      filePath: bannerFile.path,
      redirectUrl,
      title,
      description,
      buttonContent,
    });

    const savedBanner = await newBanner.save();

    res
      .status(200)
      .json({ message: "Banner uploaded successfully", banner: savedBanner });
  } catch (error) {
    console.error("Error adding banner:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Function to get banner URLs with perfect format
const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({});

    const bannerData = banners.map((banner) => ({
      _id: banner._id,
      filePath: `${serverUrl}/${banner.filePath.replace(/\\/g, "/")}`,
      fileName: banner.fileName,
      redirectUrl: banner.redirectUrl,
      title: banner.title,
      description: banner.description,
      buttonContent: banner.buttonContent,
    }));

    res
      .status(200)
      .json({ message: "Banners retrieved successfully", banners: bannerData });
  } catch (error) {
    console.error("Error retrieving banners:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const bannerId = req.params.bannerId;
    const banner = await Banner.findById(bannerId);

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    await Banner.findByIdAndDelete(bannerId);

    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountAmount,
      expirationDate,
      emails,
      all,
    } = req.body;

    console.log(
      code,
      description,
      discountType,
      discountAmount,
      expirationDate,
      emails[0],
      all
    );

    if (
      !code ||
      !description ||
      !discountType ||
      !discountAmount ||
      !expirationDate
    ) {
      return res.status(400).json({
        message: "All fields are required for coupon creation",
      });
    }

    const newCoupon = new Coupon({
      code,
      description,
      discountType,
      discountAmount,
      expirationDate,
    });

    const savedCoupon = await newCoupon.save();

    const subject = "Your Exclusive Coupon Code";
    const message = `
      <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 16px;
              line-height: 1.6;
              color: #333;
              background-color: #f9f9f9;
              margin: 0;
              padding: 0;
            }
            .container {
              margin: 20px auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              max-width: 600px;
            }
            h2 {
              color: #333;
              margin-top: 0;
            }
            p {
              margin: 10px 0;
              font-size: 16px;
            }
            a {
              color: #007bff;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Your Exclusive Coupon Code</h2>
            <p>${description}</p>
            <p>Use the code <strong>${code}</strong> to avail the discount.</p>
            <p>Hurry up, this offer expires on ${expirationDate}!</p>
          </div>
        </body>
      </html>
    `;

    if (all) {
      const allUsers = await User.find({}, "email");
      for (const user of allUsers) {
        await sendEmail("Recipient", user.email, subject, message);
      }
    } else if (emails && emails.length > 0 && emails[0] != "") {
      for (const email of emails) {
        await sendEmail("Recipient", email, subject, message);
      }
    }

    res.status(201).json({
      message: "Coupon added successfully and emails sent",
      coupon: savedCoupon,
    });
  } catch (error) {
    console.error("Error adding coupon:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();

    res.status(200).json({ coupons });
  } catch (error) {
    console.error("Error getting coupons:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;

    if (!couponId) {
      return res.status(400).json({ message: "Coupon ID is required" });
    }

    const deletedCoupon = await Coupon.findByIdAndDelete(couponId);

    if (!deletedCoupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.status(200).json({
      message: "Coupon deleted successfully",
      deletedCoupon,
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const changeOrderStatus = async (req, res) => {
  try {
    const { orderId, newStatus } = req.body;
    console.log(newStatus);

    if (!orderId || !newStatus) {
      return res.status(400).json({ error: "Missing orderId or newStatus" });
    }

    if (
      ![
        "orderReceived",
        "inProgress",
        "qualityCheck",
        "outForDelivery",
        "orderDelivered",
      ].includes(newStatus)
    ) {
      return res.status(400).json({ error: "Invalid newStatus" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = newStatus;
    await order.save();

    res
      .status(200)
      .json({ message: "Order status updated successfully", order });
  } catch (error) {
    console.error("Error changing order status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateDeliveryDate = async (req, res) => {
  try {
    const { orderId, deliveryDate } = req.body;
    console.log(orderId, deliveryDate);

    if (!orderId || !deliveryDate) {
      return res.status(400).json({ error: "Missing orderId or deliveryDate" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.deliveryDate = deliveryDate;
    await order.save();

    res
      .status(200)
      .json({ message: "Delivery date updated successfully", order });
  } catch (error) {
    console.error("Error updating delivery date:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const markFeatured = async (req, res) => {
  try {
    const { productId, featured } = req.body;

    if (!productId || !featured) {
      return res.status(400).json({ error: "Missing productId or isFeatured" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    product.featured = featured;

    await product.save();

    res.status(200).json({
      message: "Product featured status updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error marking product as featured:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updatePrivacyPolicy = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res
        .status(400)
        .json({ error: "Privacy policy content is required" });
    }

    const existingPolicy = await PrivacyPolicy.findOne();

    if (existingPolicy) {
      existingPolicy.content = content;
      await existingPolicy.save();
    } else {
      const newPolicy = new PrivacyPolicy({ content });
      await newPolicy.save();
    }

    return res
      .status(201)
      .json({ message: "Privacy policy updated successfully" });
  } catch (error) {
    console.error("Error updating privacy policy:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getPrivacyPolicy = async (req, res) => {
  try {
    const policy = await PrivacyPolicy.findOne();

    if (!policy) {
      return res.status(404).json({ error: "Privacy policy not found" });
    }

    return res.status(200).json({ policy });
  } catch (error) {
    console.error("Error retrieving privacy policy:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const generateNewsletter = async (req, res) => {
  const { emails, subject, message, all } = req.body;
  try {
    if (all) {
      const allUsers = await User.find({}, "email");
      for (const user of allUsers) {
        await sendEmail("", user.email, subject, message);
      }
    } else {
      for (const email of emails) {
        await sendEmail("", email, subject, message);
      }
    }
    res.status(200).json({ message: "Newsletter sent successfully" });
  } catch (error) {
    console.error("Error generating newsletter:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateSocial = async (req, res) => {
  try {
    const { facebook, twitter, youtube, instagram, linkedin } = req.body;

    if (!facebook && !twitter && !youtube && !instagram && !linkedin) {
      return res.status(400).json({ error: "No social media data provided" });
    }

    let socialMedia = await SocialMedia.findOne();

    if (!socialMedia) {
      socialMedia = new SocialMedia({});
    }

    if (facebook) socialMedia.facebook = facebook;
    if (twitter) socialMedia.twitter = twitter;
    if (youtube) socialMedia.youtube = youtube;
    if (instagram) socialMedia.instagram = instagram;
    if (linkedin) socialMedia.linkedin = linkedin;

    await socialMedia.save();

    res.status(200).json({
      message: "Social media profile updated successfully",
      socialMedia,
    });
  } catch (error) {
    console.error("Error updating social media profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getSocial = async (req, res) => {
  try {
    const socialMedia = await SocialMedia.findOne();

    if (!socialMedia) {
      return res.status(404).json({ error: "Social media profile not found" });
    }

    res.status(200).json({ socialMedia });
  } catch (error) {
    console.error("Error fetching social media profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateMenu = async (req, res) => {
  try {
    const { items } = req.body;

    let menu = await Menu.findOne();
    if (!menu) {
      menu = new Menu();
    }

    menu.items = items;

    await menu.save();

    res.status(200).json({ message: "Menu updated successfully", menu });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMenu = async (req, res) => {
  try {
    const menu = await Menu.findOne();
    if (!menu) {
      return res.status(404).json({ error: "Menu not found" });
    }
    res.status(200).json(menu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addCategory = async (req, res) => {
  try {
    const { fileName } = req.body;
    const categoryImage = req.files?.categoryImage?.[0]; // Access the uploaded category image file
    const categoryLogo = req.files?.categoryLogo?.[0]; // Access the uploaded category logo file (if any)

    // If category image is not uploaded, return an error
    if (!categoryImage) {
      return res.status(400).json({ message: "Category image is required" });
    }

    // Define paths for category image and logo
    const categoryImagePath = categoryImage.path.replace(/\\/g, "/");
    const categoryLogoPath = categoryLogo ? categoryLogo.path.replace(/\\/g, "/") : null;

    // Assuming your server URL is stored in process.env.SERVER_URL (set this in your .env file)

    // Construct full URLs for images
    const categoryImageUrl = `${serverUrl}/${categoryImagePath}`;
    const categoryLogoUrl = categoryLogo ? `${serverUrl}/images/categories/${categoryLogoPath}` : null;

    // Create a new category with the provided details
    const newCategory = new Category({
      fileName,
      imageFilePath: categoryImageUrl, // Save the full image URL
      logoFilePath: categoryLogoUrl,   // Save the full logo URL (if logo is provided)
    });

    // Save the category to the database
    const savedCategory = await newCategory.save();

    // Respond with a success message and the saved category
    res.status(201).json({ message: "Category added successfully", category: savedCategory });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const editCategory = async (req, res) => {
  try {
    const { categoryId, fileName } = req.body;
    const categoryImage = req.files?.categoryImage?.[0]; // Access the uploaded category image file (optional)
    const categoryLogo = req.files?.categoryLogo?.[0]; // Access the uploaded category logo file (optional)

    // If categoryId or fileName is missing, return an error
    if (!categoryId) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    // Find the category to update
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Define paths for updated category image and logo (if provided)
    let categoryImageUrl = category.imageFilePath; // Keep existing image if not uploaded
    let categoryLogoUrl = category.logoFilePath; // Keep existing logo if not uploaded

    // If new category image is uploaded, update the image path
    if (categoryImage) {
      categoryImageUrl = categoryImage.path.replace(/\\/g, "/");
    }

    // If new category logo is uploaded, update the logo path
    if (categoryLogo) {
      categoryLogoUrl = categoryLogo.path.replace(/\\/g, "/");
    }

    // Construct full URLs for updated images
    categoryImageUrl = `${serverUrl}/${categoryImageUrl}`;
    categoryLogoUrl = categoryLogo ? `${serverUrl}/${categoryLogoUrl}` : null;

    // Update category fields
    category.fileName = fileName || category.fileName;
    category.imageFilePath = categoryImageUrl; // Update image path if new image is provided
    category.logoFilePath = categoryLogoUrl; // Update logo path if new logo is provided

    // Save the updated category to the database
    const updatedCategory = await category.save();

    // Respond with a success message and the updated category
    res.status(200).json({ message: "Category updated successfully", category: updatedCategory });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const success = await Category.findByIdAndDelete(categoryId);
    if (!success) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// const addCategory = async (req, res) => {
//   try {
//     console.log(req.body);
//     const { fileName, redirectUrl } = req.body;
//     const categoryImage = req.files["categoryImage"][0];
//     const categoryLogo = req.files["categoryLogo"][0];

//     const newCategory = new Category({
//       fileName,
//       redirectUrl,
//       imageFilePath: categoryImage.path,
//       logoFilePath: categoryLogo.path,
//     });

//     const savedCategory = await newCategory.save();

//     res.status(201).json({
//       message: "Category added successfully",
//       category: savedCategory,
//     });
//   } catch (error) {
//     console.error("Error adding category:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

const addSubcategory = async (req, res) => {
  try {
    const { categoryId, name } = req.body;
    const subLogoFilePath = req.file.path;

    console.log(categoryId, name, subLogoFilePath);

    const category = await Category.findById(categoryId);
    console.log(category);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const newSubcategory = {
      name,
      subLogoFilePath,
    };

    console.log(newSubcategory);

    category.subcategories.push(newSubcategory);
    console.log(category.subcategories);

    const savedCategory = await category.save();

    console.log(savedCategory);

    res.status(201).json(savedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add subcategory" });
  }
};

const addSeries = async (req, res) => {
  try {
    const { subcategoryId, name } = req.body;
    const seriesLogoFilePath = req.file.path;

    const category = await Category.findOne({
      "subcategories._id": subcategoryId,
    });

    if (!category) {
      return res
        .status(404)
        .json({ error: "Category with subcategory not found" });
    }

    const subcategory = category.subcategories.find(
      (sub) => sub._id.toString() === subcategoryId
    );

    if (!subcategory) {
      return res.status(404).json({ error: "Subcategory not found" });
    }

    const newSeries = {
      name,
      seriesLogoFilePath,
    };

    subcategory.series.push(newSeries);

    const savedCategory = await category.save();

    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ error: "Failed to add series" });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    // Use your actual server URL, like 'https://example.com' or process.env.SERVER_URL
    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000'; // Make sure to set this to your actual server URL

    const categoriesWithLinks = categories.map((category) => ({
      ...category._doc,
      imageLink: `${serverUrl}/images/categories/${category.imageFilePath.replace(/\\/g, "/")}`,
      logoLink: category.logoFilePath ? `${serverUrl}/images/categories/${category.logoFilePath.replace(/\\/g, "/")}` : null, // Check if logo exists
      subcategories: category.subcategories.map((sub) => ({
        ...sub._doc,
        subLogoLink: sub.subLogoFilePath ? `${serverUrl}/images/subcategories/${sub.subLogoFilePath.replace(/\\/g, "/")}` : null, // Check if subLogo exists
      })),
    }));

    res.status(200).json({ categories: categoriesWithLinks });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const markSelectedCategories = async (req, res) => {
  try {
    const { categoryId } = req.body;
    console.log(categoryId);

    const selectedCount = await Category.countDocuments({ selected: true });

    if (selectedCount >= 6) {
      return res
        .status(400)
        .json({ message: "Maximum number of selected categories reached" });
    }

    await Category.findByIdAndUpdate(categoryId, { selected: true });

    res
      .status(200)
      .json({ message: "Category marked as selected successfully" });
  } catch (error) {
    console.error("Error marking selected category:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const { id, name, email, address } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.name = name;
    user.email = email;
    user.address = address;

    await user.save();

    res
      .status(200)
      .json({ message: "Customer details updated successfully", user });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createBlog = async (req, res) => {
  const { title, content, metaTitle, metaDescription } = req.body;

  try {
    if (!title || !content || !metaTitle || !metaDescription) {
      return res
        .status(400)
        .json({
          error:
            "Title, content, meta title, and meta description are required",
        });
    }

    const newBlog = new Blog({
      title: title,
      content: content,
      image: req.file.path,
      metaTitle: metaTitle,
      metaDescription: metaDescription,
    });

    await newBlog.save();

    res
      .status(201)
      .json({ message: "Blog post created successfully", blog: newBlog });
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();

    const blogsWithLinks = blogs.map((blog) => {
      return {
        ...blog.toObject(),
        imageLink: `${serverUrl}/${blog.image.replace(/\\/g, "/")}`,
      };
    });

    res.status(200).json(blogsWithLinks);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteBlog = async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    await Blog.findByIdAndDelete(id);

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const setUserCreditLimit = async (req, res) => {
  try {
    const { creditLimit } = req.body;
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.creditLimit = creditLimit;
    user.save();
    res.status(200).json({ message: "User credit limit updated successfully" });

  } catch (err) {
    console.error("Error setting user credit limit:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id; // Get the orderId from the request parameters
    const {
      productId, 
      variantId, 
      orderType, 
      cashDiscount, 
      interest, 
      paymentStatus, 
      orderStatus,
      deliveryDate,
      amountPaid
    } = req.body; // Get other fields from request body

    // Validate if the necessary fields are provided
    if (!productId || !variantId) {
      return res.status(400).json({ message: 'Product ID and Variant ID are required' });
    }

    // Find the order by its ID
    const order = await Order.findById(orderId)
      .populate({
        path: 'products.product', // Populate the product details
        populate: {
          path: 'variants', // Populate the variants for each product
        },
      })
      .exec();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Find the product in the order
    const product = order.products.find((p) => p.product._id.toString() === productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found in this order' });
    }

    // Check if the selected variant exists in the product's variants
    const selectedVariant = product.product.variants.find(
      (variant) => variant._id.toString() === variantId
    );
    if (!selectedVariant) {
      return res.status(404).json({ message: 'Variant not found for the selected product' });
    }

    // Update the variant for the product in the order
    product.variant = selectedVariant;

    // Recalculate the product price based on the selected variant
    product.price = selectedVariant.price;
    product.dueAmount = product.price * product.quantity;

    // Recalculate the total amount for the order
    let newTotalAmount = 0;
    order.products.forEach((prod) => {
      newTotalAmount += prod.price * prod.quantity;
    });

    order.totalAmount = newTotalAmount;
    order.amountRemaining = order.totalAmount - order.amountPaid;

    // Update other editable fields
    if (orderType) order.orderType = orderType;
    if (cashDiscount !== undefined) order.cashDiscount = cashDiscount;
    if (interest !== undefined) order.interest = interest;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (orderStatus) order.orderStatus = orderStatus;
    if (deliveryDate) order.deliveryDate = new Date(deliveryDate);
    if (amountPaid !== undefined) {
      order.amountPaid = amountPaid;
      order.amountRemaining = order.totalAmount - amountPaid;  // Update amount remaining
    }

    // Save the updated order
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order details updated successfully',
      data: {
        _id: order._id,
        orderId: order.orderId,
        customer: order.customer,
        orderType: order.orderType,
        products: order.products.map(prod => ({
          product: prod.product,
          quantity: prod.quantity,
          variant: prod.variant,
          price: prod.price,
          dueAmount: prod.dueAmount,
          cashDiscount: prod.cashDiscount,
          interest: prod.interest,
          dueDate: prod.dueDate,
        })),
        address: order.address,
        cashDiscount: order.cashDiscount,
        interest: order.interest,
        totalAmount: order.totalAmount,
        amountPaid: order.amountPaid,
        amountRemaining: order.amountRemaining,
        paymentHistory: order.paymentHistory,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        deliveryDate: order.deliveryDate,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id; // Get the orderId from the request parameters
    console.log(orderId);
    // Find the order by its ID
    const order = await Order.findById(orderId)
      .populate({
        path: 'products.product', // Populate the product details
        populate: {
          path: 'variants', // Populate the variants for each product
        },
      })
      .exec(); // Using exec to ensure a proper promise is returned

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Log the order to check if it's populated correctly
    console.log("Populated Order:", JSON.stringify(order, null, 2));

    return res.status(200).json({
      success: true,
      message: 'Order details fetched successfully',
      data: order,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  setUserCreditLimit,
  approveVendor,
  approveCustomer,
  productApproval,
  addBanner,
  getBanners,
  deleteBanner,
  createCoupon,
  getAllCoupons,
  deleteCoupon,
  changeOrderStatus,
  updateDeliveryDate,
  markFeatured,
  updatePrivacyPolicy,
  getPrivacyPolicy,
  generateNewsletter,
  updateSocial,
  getSocial,
  updateMenu,
  getMenu,
  addCategory,
  editCategory,
  deleteCategory,
  addSubcategory,
  addSeries,
  getCategories,
  markSelectedCategories,
  updateUserDetails,
  createBlog,
  getAllBlogs,
  deleteBlog,
  rejectCustomer,
  updateOrderDetails,
  getOrderDetails,
};
