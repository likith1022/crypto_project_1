const mongoose = require("mongoose");

const escrowSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  originalAmount: { type: Number, required: true },
  fee: { type: Number, required: true },
  upiID: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "paid", "released", "disputed"],
    default: "pending"
  },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Prevent OverwriteModelError
const Escrow = mongoose.models.Escrow || mongoose.model("Escrow", escrowSchema);
module.exports = Escrow;
