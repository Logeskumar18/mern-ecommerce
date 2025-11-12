import User from "../models/User.js";
// import Product from "../models/Product.js"; // You’ll add Product model later

// View all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Block or Unblock a user
export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ message: `User ${user.isBlocked ? "blocked" : "unblocked"}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Admin Dashboard Summary (example)
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    // totalProducts, totalOrders will come later
    res.json({
      totalUsers,
      totalProducts: 0,
      totalOrders: 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
