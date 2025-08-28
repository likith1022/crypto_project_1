const express = require("express");
const router = express.Router();
const { getUserProfile } = require("../controllers/userController");
const authenticate = require("../middleware/authenticate");

router.get("/me", authenticate, getUserProfile);

module.exports = router;
