import express from "express";

import {
  getVehicles,
  createVehicle,
  updateVehicle,
  updateVehicleStatus,
  deleteVehicle,
} from "../controllers/vehicleController.js";

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
  getVehicles
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
  createVehicle
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
  updateVehicle
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
  updateVehicleStatus
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
  deleteVehicle
);

export default router;