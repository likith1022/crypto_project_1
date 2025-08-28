const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const Order = require("../models/Order.js");
const { buyUSDT, placeOrder } = require("../controllers/orderController");

// ✅ GET all available orders (for buyers)
router.get("/", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ remainingUSDT: { $gt: 0 } }).populate("seller", "name");
    const formatted = orders.map(order => ({
      _id: order._id,
      sellerName: order.seller.name,
      totalUSDT: order.totalUSDT,
      remainingUSDT: order.remainingUSDT,
      usdtPrice: order.usdtPrice,
      upiID: order.upiID,
      status: order.status
    }));
    res.status(200).json(formatted);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET /api/orders/my (Seller's own active orders)
router.get("/my", authenticate, async (req, res) => {
  try {
    const sellerId = req.user.id;
    const orders = await Order.find({ seller: sellerId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching seller's orders:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ POST /api/orders/create (Seller creates new order)
router.post("/create", authenticate, placeOrder);

// ✅ POST /api/orders/buy (Buyer initiates purchase)
router.post("/buy", authenticate, buyUSDT);

module.exports = router;
