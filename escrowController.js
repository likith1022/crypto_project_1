const Escrow = require("../models/Escrow");
const User = require("../models/user");

exports.completeEscrow = async (req, res) => {
  const { escrowId } = req.params;
  const sellerId = req.user.id;

  try {
    const escrow = await Escrow.findById(escrowId).populate("buyer seller");

    if (!escrow) return res.status(404).json({ message: "Escrow not found." });
    if (escrow.seller._id.toString() !== sellerId)
      return res.status(403).json({ message: "Unauthorized seller." });

    if (escrow.status !== "pending")
      return res.status(400).json({ message: "Escrow already completed or invalid." });

    // Credit USDT to buyer wallet
    escrow.buyer.wallet += escrow.amountAfterFee;
    await escrow.buyer.save();

    // Mark escrow as completed
    escrow.status = "completed";
    await escrow.save();

    res.json({ message: "Escrow completed successfully." });
  } catch (err) {
    console.error("Error completing escrow:", err);
    res.status(500).json({ message: "Server error." });
  }
};
