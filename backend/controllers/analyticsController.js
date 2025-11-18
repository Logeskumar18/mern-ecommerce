import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// Daily Sales Report
export const getDailySales = async (req, res) => {
  try {
    const sales = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }, // Last 30 days
    ]);

    const formattedSales = sales.map(item => ({
      date: item._id,
      totalSales: item.totalSales,
      orders: item.orders,
      averageOrder: Math.round(item.totalSales / item.orders)
    }));

    res.json(formattedSales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Product-Wise Sales
export const getTopProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          name: "$productDetails.name",
          totalSold: 1,
          revenue: 1,
          category: "$productDetails.category"
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    res.json(topProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Dashboard Overview Statistics
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today.setDate(today.getDate() - 7));
    const startOfMonth = new Date(today.setDate(1));

    // Total statistics
    const [totalOrders, totalUsers, totalProducts, totalRevenue] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }])
    ]);

    // Today's statistics
    const [todayOrders, todayRevenue] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ])
    ]);

    // Weekly statistics
    const [weeklyOrders, weeklyRevenue] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ])
    ]);

    // Monthly statistics
    const [monthlyOrders, monthlyRevenue] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ])
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('user totalAmount orderStatus createdAt items');

    // Order status distribution
    const orderStatusDistribution = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      totals: {
        orders: totalOrders,
        users: totalUsers,
        products: totalProducts,
        revenue: totalRevenue[0]?.total || 0
      },
      today: {
        orders: todayOrders,
        revenue: todayRevenue[0]?.total || 0
      },
      weekly: {
        orders: weeklyOrders,
        revenue: weeklyRevenue[0]?.total || 0
      },
      monthly: {
        orders: monthlyOrders,
        revenue: monthlyRevenue[0]?.total || 0
      },
      recentOrders,
      orderStatusDistribution
    };

    res.json(stats);
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Category-wise sales
export const getCategorySales = async (req, res) => {
  try {
    const categorySales = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" },
      {
        $lookup: {
          from: "categories",
          localField: "productInfo.category",
          foreignField: "_id",
          as: "categoryInfo"
        }
      },
      { $unwind: "$categoryInfo" },
      {
        $group: {
          _id: "$categoryInfo._id",
          name: { $first: "$categoryInfo.name" },
          totalSales: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
          totalItems: { $sum: "$items.quantity" }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    res.json(categorySales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Monthly revenue trend
export const getMonthlyRevenue = async (req, res) => {
  try {
    const monthlyRevenue = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: {
                  if: { $lt: ["$_id.month", 10] },
                  then: { $concat: ["0", { $toString: "$_id.month" }] },
                  else: { $toString: "$_id.month" }
                }
              }
            ]
          },
          revenue: 1,
          orders: 1
        }
      },
      { $sort: { month: 1 } },
      { $limit: 12 } // Last 12 months
    ]);

    res.json(monthlyRevenue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
