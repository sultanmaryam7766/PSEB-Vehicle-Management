import express from "express";

import {
  getTrips,
  getTripById,
  createTrip,
  completeTrip,
  deleteTrip,
} from "../controllers/tripController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router =
  express.Router();

/* =========================
   GET ALL TRIPS
========================= */

router.get(
  "/",
  authMiddleware,
  getTrips
);

/* =========================
   GET ONE TRIP
========================= */

router.get(
  "/:id",
  authMiddleware,
  getTripById
);

/* =========================
   CREATE TRIP
========================= */

router.post(
  "/",
  authMiddleware,
  allowRoles(
    "Administrator",
    "Operator"
  ),
  createTrip
);

/* =========================
   COMPLETE TRIP
========================= */

router.patch(
  "/:id/complete",
  authMiddleware,
  allowRoles(
    "Administrator",
    "Operator"
  ),
  completeTrip
);

/* =========================
   DELETE TRIP
   ADMINISTRATOR ONLY
========================= */

router.delete(
  "/:id",
  authMiddleware,
  allowRoles(
    "Administrator"
  ),
  deleteTrip
);

export default router;