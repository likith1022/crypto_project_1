const express = require("express");
const router = express.Router();
const Escrow = require("../models/Escrow");
const authenticate = require("../middleware/authenticate");

// PATCH /api/escrow/:escrowId/complete
router.patch("/:escrowId/complete", authenticate, async (req, res) => {
  try {
    const { escrowId } = req.params;

    const escrow = await Escrow.findById(escrowId);
    if (!escrow) {
      return res.status(404).json({ message: "Escrow not found" });
    }

    if (escrow.completed) {
      return res.status(400).json({ message: "Escrow already completed" });
    }

    escrow.completed = true;
    await escrow.save();

    return res.json({ message: "Escrow marked as complete", escrow });
  } catch (error) {
    console.error("Error completing escrow:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
