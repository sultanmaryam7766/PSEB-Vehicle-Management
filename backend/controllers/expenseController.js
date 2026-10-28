import db from "../db.js";

/* =========================
   AUDIT LOG
========================= */

const addExpenseAuditLog = (
  actorUserId,
  action,
  recordId,
  recordName
) => {
  const actorSql = `
    SELECT name
    FROM users
    WHERE id = ?
    LIMIT 1
  `;

  db.query(
    actorSql,
    [actorUserId],
    (
      actorErr,
      actorResults
    ) => {
      if (
        actorErr
      ) {
        console.error(
          "Expense audit actor error:",
          actorErr
        );

        return;
      }

      const actorName =
        actorResults.length > 0
          ? actorResults[0].name
          : "Unknown User";

      const auditSql = `
        INSERT INTO audit_logs
        (
          actor_user_id,
          actor_name,
          action,
          module,
          record_id,
          record_name
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(
        auditSql,
        [
          actorUserId,
          actorName,
          action,
          "Expenses",
          recordId,
          recordName,
        ],
        (
          auditErr
        ) => {
          if (
            auditErr
          ) {
            console.error(
              "Expense audit error:",
              auditErr
            );
          }
        }
      );
    }
  );
};

/* =========================
   GET EXPENSES
========================= */

export const getExpenses = (
  req,
  res
) => {
  const sql = `
    SELECT
      e.id,
      e.vehicle_id,
      e.trip_id,

      DATE_FORMAT(
        e.expense_date,
        '%Y-%m-%d'
      ) AS expense_date,

      e.category,
      e.description,
      e.amount,
      e.vendor,
      e.reference_no,
      e.remarks,
      e.created_at,

      v.registration_no,
      v.vehicle_name,
      v.location,

      t.id AS linked_trip_id

    FROM expenses e

    INNER JOIN vehicles v
      ON e.vehicle_id = v.id

    LEFT JOIN trips t
      ON e.trip_id = t.id

    ORDER BY
      e.expense_date DESC,
      e.id DESC
  `;

  db.query(
    sql,
    (
      err,
      results
    ) => {
      if (
        err
      ) {
        console.error(
          "Load expenses error:",
          err
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to load expenses",
          });
      }

      return res.json({
        expenses:
          results,
      });
    }
  );
};

/* =========================
   CREATE EXPENSE
========================= */

export const createExpense = (
  req,
  res
) => {
  const {
    vehicleId,
    tripId,
    expenseDate,
    category,
    description,
    amount,
    vendor,
    referenceNo,
    remarks,
  } =
    req.body;

  if (
    !vehicleId ||
    !expenseDate ||
    !category ||
    amount === "" ||
    amount === undefined
  ) {
    return res
      .status(400)
      .json({
        message:
          "Vehicle, date, category and amount are required",
      });
  }

  if (
    Number(
      amount
    ) < 0
  ) {
    return res
      .status(400)
      .json({
        message:
          "Amount cannot be negative",
      });
  }

  const sql = `
    INSERT INTO expenses
    (
      vehicle_id,
      trip_id,
      expense_date,
      category,
      description,
      amount,
      vendor,
      reference_no,
      remarks,
      created_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      vehicleId,
      tripId || null,
      expenseDate,
      category,
      description || null,
      amount,
      vendor || null,
      referenceNo || null,
      remarks || null,
      req.user.id,
    ],
    (
      err,
      result
    ) => {
      if (
        err
      ) {
        console.error(
          "Create expense error:",
          err
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to add expense",
          });
      }

      addExpenseAuditLog(
        req.user.id,
        "Created expense",
        result.insertId,
        `EXP-${String(
          result.insertId
        ).padStart(
          5,
          "0"
        )}`
      );

      return res
        .status(201)
        .json({
          message:
            "Expense added successfully",
        });
    }
  );
};

/* =========================
   UPDATE EXPENSE
========================= */

export const updateExpense = (
  req,
  res
) => {
  const {
    id,
  } =
    req.params;

  const {
    vehicleId,
    tripId,
    expenseDate,
    category,
    description,
    amount,
    vendor,
    referenceNo,
    remarks,
  } =
    req.body;

  if (
    !vehicleId ||
    !expenseDate ||
    !category ||
    amount === "" ||
    amount === undefined
  ) {
    return res
      .status(400)
      .json({
        message:
          "Vehicle, date, category and amount are required",
      });
  }

  if (
    Number(
      amount
    ) < 0
  ) {
    return res
      .status(400)
      .json({
        message:
          "Amount cannot be negative",
      });
  }

  const sql = `
    UPDATE expenses

    SET
      vehicle_id = ?,
      trip_id = ?,
      expense_date = ?,
      category = ?,
      description = ?,
      amount = ?,
      vendor = ?,
      reference_no = ?,
      remarks = ?

    WHERE id = ?
  `;

  db.query(
    sql,
    [
      vehicleId,
      tripId || null,
      expenseDate,
      category,
      description || null,
      amount,
      vendor || null,
      referenceNo || null,
      remarks || null,
      id,
    ],
    (
      err,
      result
    ) => {
      if (
        err
      ) {
        console.error(
          "Update expense error:",
          err
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to update expense",
          });
      }

      if (
        result.affectedRows ===
        0
      ) {
        return res
          .status(404)
          .json({
            message:
              "Expense not found",
          });
      }

      addExpenseAuditLog(
        req.user.id,
        "Updated expense",
        id,
        `EXP-${String(
          id
        ).padStart(
          5,
          "0"
        )}`
      );

      return res.json({
        message:
          "Expense updated successfully",
      });
    }
  );
};

/* =========================
   DELETE EXPENSE
   ADMINISTRATOR ONLY
========================= */

export const deleteExpense = (
  req,
  res
) => {
  const {
    id,
  } =
    req.params;

  if (
    !id ||
    Number.isNaN(
      Number(
        id
      )
    )
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid expense ID",
      });
  }

  /*
    Load expense first so
    Audit Log keeps useful
    information after deletion.
  */

  const findSql = `
    SELECT
      e.id,
      e.vehicle_id,
      e.trip_id,
      e.expense_date,
      e.category,
      e.description,
      e.amount,
      e.vendor,
      e.reference_no,

      v.registration_no,
      v.vehicle_name

    FROM expenses e

    LEFT JOIN vehicles v
      ON e.vehicle_id = v.id

    WHERE e.id = ?

    LIMIT 1
  `;

  db.query(
    findSql,
    [
      id,
    ],
    (
      findErr,
      results
    ) => {
      if (
        findErr
      ) {
        console.error(
          "Find expense before delete error:",
          findErr
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to delete expense",
          });
      }

      if (
        results.length ===
        0
      ) {
        return res
          .status(404)
          .json({
            message:
              "Expense not found",
          });
      }

      const expense =
        results[0];

      const deleteSql = `
        DELETE FROM expenses
        WHERE id = ?
      `;

      db.query(
        deleteSql,
        [
          id,
        ],
        (
          deleteErr,
          deleteResult
        ) => {
          if (
            deleteErr
          ) {
            console.error(
              "Delete expense error:",
              deleteErr
            );

            return res
              .status(500)
              .json({
                message:
                  "Unable to delete expense",
              });
          }

          if (
            deleteResult.affectedRows ===
            0
          ) {
            return res
              .status(404)
              .json({
                message:
                  "Expense not found",
              });
          }

          const expenseCode =
            `EXP-${String(
              expense.id
            ).padStart(
              5,
              "0"
            )}`;

          const registration =
            expense.registration_no ||
            "Unknown Vehicle";

          const vehicleName =
            expense.vehicle_name ||
            "";

          const recordName =
            `${expenseCode} - ${expense.category} - ${registration}${
              vehicleName
                ? ` - ${vehicleName}`
                : ""
            }`;

          addExpenseAuditLog(
            req.user.id,
            "Deleted expense",
            expense.id,
            recordName
          );

          return res.json({
            message:
              "Expense deleted successfully",

            deletedExpense: {
              id:
                Number(
                  expense.id
                ),

              expenseCode,

              vehicleId:
                expense.vehicle_id,

              tripId:
                expense.trip_id,

              category:
                expense.category,

              amount:
                expense.amount,

              registrationNo:
                expense.registration_no,
            },
          });
        }
      );
    }
  );
};