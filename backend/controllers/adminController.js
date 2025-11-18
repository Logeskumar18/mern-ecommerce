import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Category from "../models/Category.js";

// ------------------------
// Enhanced Dashboard Data
// ------------------------
export const getDashboardData = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalCategories,
      totalRevenue,
      recentOrders,
      topProducts,
      userStats,
      orderStats
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Category.countDocuments(),
      Order.aggregate([
        { $match: { status: { $in: ["delivered", "processing"] } } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),
      Order.find()
        .populate("user", "name email")
        .populate("cartItems.product", "name price")
        .sort({ createdAt: -1 })
        .limit(5),
      Product.aggregate([
        {
          $lookup: {
            from: "orders",
            let: { productId: "$_id" },
            pipeline: [
              { $unwind: "$cartItems" },
              { $match: { $expr: { $eq: ["$cartItems.product", "$$productId"] } } }
            ],
            as: "orderItems"
          }
        },
        {
          $addFields: {
            totalSold: { $size: "$orderItems" }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        {
          $project: {
            name: 1,
            price: 1,
            images: 1,
            totalSold: 1
          }
        }
      ]),
      User.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } },
        { $limit: 6 }
      ]),
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    // Calculate growth rates
    const currentDate = new Date();
    const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const [currentMonthUsers, lastMonthUsers, currentMonthOrders, lastMonthOrders] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: currentMonthStart } }),
      User.countDocuments({ 
        createdAt: { 
          $gte: lastMonthStart, 
          $lt: currentMonthStart 
        } 
      }),
      Order.countDocuments({ createdAt: { $gte: currentMonthStart } }),
      Order.countDocuments({ 
        createdAt: { 
          $gte: lastMonthStart, 
          $lt: currentMonthStart 
        } 
      })
    ]);

    const userGrowthRate = lastMonthUsers > 0 
      ? ((currentMonthUsers - lastMonthUsers) / lastMonthUsers * 100).toFixed(1)
      : 0;

    const orderGrowthRate = lastMonthOrders > 0 
      ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalCategories,
        totalRevenue: revenue,
        userGrowthRate: parseFloat(userGrowthRate),
        orderGrowthRate: parseFloat(orderGrowthRate),
        recentOrders,
        topProducts,
        userStats,
        orderStats
      }
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message
    });
  }
};

// ------------------------
// Enhanced Get All Users
// ------------------------
export const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = "", 
      role = "", 
      sortBy = "createdAt", 
      sortOrder = "desc" 
    } = req.query;

    // Build filter
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    
    if (role && role !== "all") {
      filter.role = role;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Pagination
    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    // Add order count for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({ user: user._id });
        return {
          ...user.toObject(),
          orderCount
        };
      })
    );

    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      success: true,
      users: usersWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message
    });
  }
};

// ------------------------
// Update User
// ------------------------
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, isVerified, isBlocked } = req.body;

    const updateData = {};
    if (role) updateData.role = role;
    if (typeof isVerified === 'boolean') updateData.isVerified = isVerified;
    if (typeof isBlocked === 'boolean') updateData.isBlocked = isBlocked;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      user
    });

  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message
    });
  }
};

// ------------------------
// Block / Unblock User (Enhanced)
// ------------------------
export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ 
      success: true,
      message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    console.error("Toggle Block User Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ------------------------
// Delete User
// ------------------------
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user has orders
    const userOrders = await Order.countDocuments({ user: userId });
    if (userOrders > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete user. User has ${userOrders} associated orders.`
      });
    }

    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message
    });
  }
};

// ------------------------
// Enhanced Get All Orders
// ------------------------
export const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = "",
      dateFrom = "",
      dateTo = "",
      minAmount = "",
      maxAmount = "",
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    // Build filter
    const filter = {};
    
    if (status && status !== "all") {
      filter.status = status;
    }
    
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo + "T23:59:59.999Z");
    }
    
    if (minAmount || maxAmount) {
      filter.total = {};
      if (minAmount) filter.total.$gte = parseFloat(minAmount);
      if (maxAmount) filter.total.$lte = parseFloat(maxAmount);
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Pagination
    const skip = (page - 1) * limit;

    const [orders, totalOrders] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email phone")
        .populate("cartItems.product", "name price images")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message
    });
  }
};

// ------------------------
// Enhanced Update Order Status
// ------------------------
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status"
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { 
        status,
        orderStatus: status, // Keep both for compatibility
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate("user", "name email").populate("cartItems.product", "name price");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      order
    });

  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message
    });
  }
};
