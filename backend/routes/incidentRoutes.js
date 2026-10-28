import express from "express";

import {
  getIncidents,
  createIncident,
  updateIncident,
  deleteIncident,
} from "../controllers/incidentController.js";

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
  getIncidents
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
  createIncident
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
  updateIncident
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
  deleteIncident
);

export default router;