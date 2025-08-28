const User = require("../models/user"); // make sure this is imported

const getUserProfile = async (req, res) => {
  try {
    // Always fetch fresh data from DB to ensure accuracy
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      usdtWallet: user.usdtWallet, // <-- correct field name
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch user data", error: err.message });
  }
};

module.exports = { getUserProfile };
