import express from "express";

import {
  getNotifications,
} from "../controllers/notificationController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router =
  express.Router();

/* =========================
   ADMIN / OPERATOR ONLY
========================= */

const adminOperatorOnly = (
  req,
  res,
  next
) => {
  const role =
    req.user?.role;

  if (
    role !== "Administrator" &&
    role !== "Operator"
  ) {
    return res
      .status(403)
      .json({
        message:
          "Access denied",
      });
  }

  next();
};

/* =========================
   GET NOTIFICATIONS
========================= */

router.get(
  "/",
  authMiddleware,
  adminOperatorOnly,
  getNotifications
);

export default router;