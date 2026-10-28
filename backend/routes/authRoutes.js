import express from "express";
import {
  login,
  changePassword,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    message: "User authenticated successfully",
    user: req.user,
  });
});

router.post(
  "/change-password",
  authMiddleware,
  changePassword
);

export default router;