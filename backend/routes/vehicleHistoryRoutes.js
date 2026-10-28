import express from "express";

import {
  getVehicleHistory,
} from "../controllers/vehicleHistoryController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/:vehicleId",
  authMiddleware,
  getVehicleHistory
);

export default router;