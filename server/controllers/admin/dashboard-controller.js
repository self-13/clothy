const Order = require("../../models/Order");
const Product = require("../../models/Product");
const User = require("../../models/User");

const getDashboardStats = async (req, res) => {
  try {
    // 1. Total Revenue (only from paid or processing/shipped/delivered orders)
    const revenueData = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          orderStatus: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // 2. Total Orders
    const totalOrders = await Order.countDocuments({});

    // 3. Total Products
    const totalProducts = await Product.countDocuments({});

    // 4. Total Users (Exclude Admins)
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });

    // 5. Low Stock Products (stock < 10 for any size)
    const lowStockProducts = await Product.find({
      "sizes.stock": { $lt: 10 },
    }).select("title sizes brand category");

    // 6. Recent Orders (last 10)
    const recentOrders = await Order.find({})
      .sort({ orderDate: -1 })
      .limit(10)
      .populate("userId", "userName email");

    // 7. Sales per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesOverTime = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: sevenDaysAgo },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
          sales: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        lowStockAlerts: lowStockProducts, // Renamed to match frontend
        recentOrders,
        salesData: salesOverTime, // Renamed to match frontend expectations
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching dashboard stats",
    });
  }
};

module.exports = { getDashboardStats };
