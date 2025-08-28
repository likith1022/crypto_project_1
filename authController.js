const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");


exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already registered" });

    const user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({ msg: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", err: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }); // this must be defined before using it

    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = generateToken(user._id); // now this works fine

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        usdtWallet: user.usdtWallet,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};
