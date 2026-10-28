import express from "express";

import {
  getVehicleReport,
} from "../controllers/reportController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router =
  express.Router();

router.get(
  "/vehicle-summary",
  authMiddleware,
  getVehicleReport
);

export default router;