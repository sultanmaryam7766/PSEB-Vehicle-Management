import express from "express";

import {
  getAuditLogs,
} from "../controllers/auditController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  allowRoles("Administrator"),
  getAuditLogs
);

export default router;