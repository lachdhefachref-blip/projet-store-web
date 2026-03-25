import express from "express";
import { User } from "../models/User.js";
import { signAccessToken, signRefreshToken } from "../lib/jwt.js";
import { hashToken, verifyTokenHash, requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const user = await User.create({ email, password, name });
    const accessToken = signAccessToken({ sub: user._id });
    res.status(201).json({ user, accessToken });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "invalid_credentials" });
    }
    const accessToken = signAccessToken({ sub: user._id });
    res.json({ user, accessToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { router as authRouter };