import express from "express";

import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";

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
  getExpenses
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
  createExpense
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
  updateExpense
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
  deleteExpense
);

export default router;