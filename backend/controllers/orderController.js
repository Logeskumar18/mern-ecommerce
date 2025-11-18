import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

export const placeOrder = async (req, res) => {
  try {
    const { cartItems, address } = req.body;

    // Validate input
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (!address || !address.fullName || !address.phone || !address.street || !address.city) {
      return res.status(400).json({ message: "Shipping address is incomplete" });
    }

    // Calculate total amount from cart items
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );

    // Prepare order items - convert cart items to order format
    const orderItems = cartItems.map(item => ({
      product: item._id,
      quantity: item.quantity || 1,
    }));

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        fullName: address.fullName,
        address: address.street,
        city: address.city,
        postalCode: address.pincode || "",
        country: "India",
        phone: address.phone,
      },
      totalAmount,
      paymentMethod: "COD",
      paymentStatus: "Pending",
      orderStatus: "Processing",
    });

    await order.save();

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    console.error("Place Order Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product")
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    console.error("Get User Orders Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get single order
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product")
      .populate("user", "name email");
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (err) {
    console.error("Get Order Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get all orders (Admin only)
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    
    let filter = {};
    if (status && status !== 'all') {
      filter.orderStatus = status;
    }
    
    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("items.product", "name price")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const totalOrders = await Order.countDocuments(filter);
    
    res.json({
      orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
      totalOrders
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    if (orderStatus) {
      order.orderStatus = orderStatus;
    }
    
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    
    await order.save();
    
    res.json({
      success: true,
      message: "Order updated successfully",
      order
    });
  } catch (error) {
    console.error("Update Order Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Generate invoice data
export const getInvoiceData = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate({
        path: "items.product",
        select: "name price description images category"
      });
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const invoiceData = {
      order,
      invoiceNumber: `INV-${order._id.toString().slice(-8).toUpperCase()}`,
      invoiceDate: new Date().toISOString(),
      companyInfo: {
        name: "MERN E-Commerce Store",
        address: "123 Business Street, Tech Tower",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        country: "India",
        email: "contact@mernecommerce.com",
        phone: "+91 98765 43210",
        gst: "27XXXXX1234X1ZX"
      }
    };
    
    res.json(invoiceData);
  } catch (error) {
    console.error("Get Invoice Data Error:", error);
    res.status(500).json({ message: error.message });
  }
};
