import express from "express";

import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
} from "../controllers/documentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

import uploadDocument from "../middleware/uploadMiddleware.js";

const router =
  express.Router();

/* =========================
   GET DOCUMENTS
========================= */

router.get(
  "/",
  authMiddleware,
  getDocuments
);

/* =========================
   CREATE DOCUMENT
========================= */

router.post(
  "/",
  authMiddleware,
  allowRoles(
    "Administrator",
    "Operator"
  ),
  uploadDocument.single(
    "documentFile"
  ),
  createDocument
);

/* =========================
   UPDATE DOCUMENT
========================= */

router.put(
  "/:id",
  authMiddleware,
  allowRoles(
    "Administrator",
    "Operator"
  ),
  uploadDocument.single(
    "documentFile"
  ),
  updateDocument
);

/* =========================
   DELETE DOCUMENT
   ADMINISTRATOR ONLY
========================= */

router.delete(
  "/:id",
  authMiddleware,
  allowRoles(
    "Administrator"
  ),
  deleteDocument
);

export default router;