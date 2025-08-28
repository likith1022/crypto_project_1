const Order = require("../models/Order.js");
const User = require("../models/user");
const Escrow = require("../models/Escrow");

const buyUSDT = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { orderId, amount } = req.body;

    if (!orderId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid request data." });
    }

    const order = await Order.findById(orderId).populate("seller");
    if (!order || order.remainingUSDT < amount) {
      return res.status(400).json({ message: "Insufficient USDT available in this order." });
    }

    const buyer = await User.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({ message: "Buyer not found." });
    }

    const totalINR = amount * order.usdtPrice;
    const fee = amount * 0.025;
    const amountAfterFee = amount - fee;

    // Deduct USDT from order
    order.remainingUSDT -= amount;
    await order.save();

    // Create escrow entry
    const escrow = new Escrow({
      order: order._id,
      buyer: buyer._id,
      seller: order.seller._id,
      amount: amountAfterFee,
      originalAmount: amount,
      fee,
      upiID: order.upiID,
      status: "pending"
    });

    await escrow.save();

    // Emit real-time update to seller via WebSocket
    const sendToUser = req.app.get("sendToUser");
    if (sendToUser) {
      sendToUser(order.seller._id.toString(), "new-order", {
        orderId: order._id,
        buyer: {
          id: buyer._id,
          name: buyer.name
        },
        amount,
        amountAfterFee,
        totalINR,
        upiID: order.upiID,
        status: "pending"
      });
    }

    res.status(200).json({
      message: "Escrow created. Please proceed with payment.",
      orderId: order._id,
      totalINR,
      upiID: order.upiID,
      amountAfterFee
    });

  } catch (err) {
    console.error("Buy order error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ✅ UPDATED placeOrder with wallet deduction + socket emit
const placeOrder = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { amount, usdtPrice, upiID } = req.body;

    if (!amount || !usdtPrice || !upiID || amount <= 0 || usdtPrice <= 0) {
      return res.status(400).json({ message: "Invalid order data." });
    }

    // ✅ Check and deduct from seller wallet
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    if (seller.usdtWallet < amount) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    seller.usdtWallet -= amount;
    await seller.save();

    // ✅ Create order with totalUSDT and status
    const order = new Order({
      seller: sellerId,
      totalUSDT: amount,
      remainingUSDT: amount,
      usdtPrice,
      upiID,
      status: "active" // add this field!
    });

    await order.save();

    // ✅ Emit real-time update
    const sendToUser = req.app.get("sendToUser");
    if (sendToUser) {
      sendToUser(sellerId, "offer-updated", {});
    }

    res.status(201).json({
      message: "Order placed successfully",
      order: {
        _id: order._id,
        totalUSDT: order.totalUSDT,
        remainingUSDT: order.remainingUSDT,
        usdtPrice: order.usdtPrice,
        upiID: order.upiID,
        status: order.status
      }
    });
  } catch (err) {
    console.error("Place order error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.seller.toString() !== sellerId) {
      return res.status(403).json({ message: "Unauthorized to cancel this order." });
    }

    await order.deleteOne();

    res.status(200).json({ message: "Order canceled successfully." });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  buyUSDT,
  placeOrder,
  cancelOrder
};
