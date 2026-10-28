import express from "express";

import {
  getMaintenanceRecords,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
} from "../controllers/maintenanceController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

/* =========================
   GET ALL
========================= */

router.get(
  "/",
  authMiddleware,
  getMaintenanceRecords
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
  createMaintenanceRecord
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
  updateMaintenanceRecord
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
  deleteMaintenanceRecord
);

export default router;