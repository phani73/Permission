const express = require("express");
const UserModel = require("../models/User");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password === password) {
      req.session.user = user;
      return res.status(200).json({ message: "Login Successful", user });
    } else {
      return res.status(401).json({ message: "Incorrect password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Logout failed");
    }
    res.clearCookie("connect.sid");
    return res.status(200).send("Logout successful");
  });
});

module.exports = router;
