import express from "express";

import {
  getDrivers,
  createDriver,
  updateDriver,
  updateDriverStatus,
  deleteDriver,
} from "../controllers/driverController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router =
  express.Router();

/* =========================
   GET
========================= */

router.get(
  "/",
  authMiddleware,
  getDrivers
);

/* =========================
   CREATE
========================= */

router.post(
  "/",
  authMiddleware,
  allowRoles(
    "Administrator",
    "Operator"
  ),
  createDriver
);

/* =========================
   UPDATE
========================= */

router.put(
  "/:id",
  authMiddleware,
  allowRoles(
    "Administrator",
    "Operator"
  ),
  updateDriver
);

/* =========================
   STATUS
========================= */

router.patch(
  "/:id/status",
  authMiddleware,
  allowRoles(
    "Administrator",
    "Operator"
  ),
  updateDriverStatus
);

/* =========================
   DELETE
   ADMINISTRATOR ONLY
========================= */

router.delete(
  "/:id",
  authMiddleware,
  allowRoles(
    "Administrator"
  ),
  deleteDriver
);

export default router;