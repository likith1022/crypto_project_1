const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  totalUSDT: { type: Number, required: true },
  remainingUSDT: { type: Number, required: true },
  usdtPrice: { type: Number, required: true },
  upiID: { type: String, required: true },
  status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" }
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
module.exports = Order;
