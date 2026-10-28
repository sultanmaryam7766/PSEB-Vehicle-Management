import express from "express";

import {
  getFuelRecords,
  createFuelRecord,
  updateFuelRecord,
  deleteFuelRecord,
} from "../controllers/fuelController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router =
  express.Router();

/* =========================
   GET ALL
========================= */

router.get(
  "/",
  authMiddleware,
  getFuelRecords
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
  createFuelRecord
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
  updateFuelRecord
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
  deleteFuelRecord
);

export default router;