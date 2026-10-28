import express from "express";

import {
  createUser,
  getUsers,
  updateUser,
  updateUserStatus,
  resetUserPassword,
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  allowRoles("Administrator"),
  getUsers
);

router.post(
  "/",
  authMiddleware,
  allowRoles("Administrator"),
  createUser
);

router.put(
  "/:id",
  authMiddleware,
  allowRoles("Administrator"),
  updateUser
);

router.patch(
  "/:id/status",
  authMiddleware,
  allowRoles("Administrator"),
  updateUserStatus
);

router.post(
  "/:id/reset-password",
  authMiddleware,
  allowRoles("Administrator"),
  resetUserPassword
);

export default router;