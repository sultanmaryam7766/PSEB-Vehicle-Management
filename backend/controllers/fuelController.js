import db from "../db.js";

/* =========================
   AUDIT
========================= */

const addFuelAuditLog = (
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
          "Fuel audit actor error:",
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
          "Fuel",
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
              "Fuel audit error:",
              auditErr
            );
          }
        }
      );
    }
  );
};

/* =========================
   GET ALL
========================= */

export const getFuelRecords = (
  req,
  res
) => {
  const sql = `
    SELECT
      f.id,
      f.vehicle_id,
      f.trip_id,
      f.fuel_date,
      f.liters,
      f.amount,
      f.odometer,
      f.station_vendor,
      f.remarks,
      f.status,
      f.created_at,

      v.registration_no,
      v.vehicle_name,

      t.driver_id,
      d.driver_name

    FROM fuel_records f

    INNER JOIN vehicles v
      ON f.vehicle_id = v.id

    LEFT JOIN trips t
      ON f.trip_id = t.id

    LEFT JOIN drivers d
      ON t.driver_id = d.id

    ORDER BY
      f.fuel_date DESC,
      f.id DESC
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
          "Load fuel records error:",
          err
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to load fuel records",
          });
      }

      return res.json({
        fuelRecords:
          results,
      });
    }
  );
};

/* =========================
   CREATE
========================= */

export const createFuelRecord = (
  req,
  res
) => {
  const {
    vehicleId,
    tripId,
    fuelDate,
    liters,
    amount,
    odometer,
    stationVendor,
    remarks,
    status,
  } =
    req.body;

  if (
    !vehicleId ||
    !fuelDate ||
    liters === "" ||
    liters === null ||
    liters === undefined ||
    amount === "" ||
    amount === null ||
    amount === undefined ||
    odometer === "" ||
    odometer === null ||
    odometer === undefined
  ) {
    return res
      .status(400)
      .json({
        message:
          "Vehicle, date, liters, amount and odometer are required",
      });
  }

  const finalLiters =
    Number(
      liters
    );

  const finalAmount =
    Number(
      amount
    );

  const finalOdometer =
    Number(
      odometer
    );

  if (
    Number.isNaN(
      finalLiters
    ) ||
    finalLiters <=
      0
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid liters value",
      });
  }

  if (
    Number.isNaN(
      finalAmount
    ) ||
    finalAmount <
      0
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid amount",
      });
  }

  if (
    Number.isNaN(
      finalOdometer
    ) ||
    finalOdometer <
      0
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid odometer",
      });
  }

  const finalStatus =
    status ||
    "Pending";

  if (
    ![
      "Pending",
      "Verified",
    ].includes(
      finalStatus
    )
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid fuel status",
      });
  }

  const sql = `
    INSERT INTO fuel_records
    (
      vehicle_id,
      trip_id,
      fuel_date,
      liters,
      amount,
      odometer,
      station_vendor,
      remarks,
      status,
      created_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      vehicleId,
      tripId ||
        null,
      fuelDate,
      finalLiters,
      finalAmount,
      finalOdometer,
      stationVendor ||
        null,
      remarks ||
        null,
      finalStatus,
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
          "Create fuel record error:",
          err
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to create fuel record",
          });
      }

      addFuelAuditLog(
        req.user.id,
        "Created fuel record",
        result.insertId,
        `Fuel Record #${result.insertId}`
      );

      return res
        .status(201)
        .json({
          message:
            "Fuel record added successfully",
        });
    }
  );
};

/* =========================
   UPDATE
========================= */

export const updateFuelRecord = (
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
    fuelDate,
    liters,
    amount,
    odometer,
    stationVendor,
    remarks,
    status,
  } =
    req.body;

  if (
    !vehicleId ||
    !fuelDate ||
    liters === "" ||
    amount === "" ||
    odometer === ""
  ) {
    return res
      .status(400)
      .json({
        message:
          "Vehicle, date, liters, amount and odometer are required",
      });
  }

  const finalLiters =
    Number(
      liters
    );

  const finalAmount =
    Number(
      amount
    );

  const finalOdometer =
    Number(
      odometer
    );

  if (
    Number.isNaN(
      finalLiters
    ) ||
    finalLiters <=
      0 ||
    Number.isNaN(
      finalAmount
    ) ||
    finalAmount <
      0 ||
    Number.isNaN(
      finalOdometer
    ) ||
    finalOdometer <
      0
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid fuel values",
      });
  }

  if (
    ![
      "Pending",
      "Verified",
    ].includes(
      status
    )
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid fuel status",
      });
  }

  const sql = `
    UPDATE fuel_records

    SET
      vehicle_id = ?,
      trip_id = ?,
      fuel_date = ?,
      liters = ?,
      amount = ?,
      odometer = ?,
      station_vendor = ?,
      remarks = ?,
      status = ?

    WHERE id = ?
  `;

  db.query(
    sql,
    [
      vehicleId,
      tripId ||
        null,
      fuelDate,
      finalLiters,
      finalAmount,
      finalOdometer,
      stationVendor ||
        null,
      remarks ||
        null,
      status,
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
          "Update fuel record error:",
          err
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to update fuel record",
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
              "Fuel record not found",
          });
      }

      addFuelAuditLog(
        req.user.id,
        "Updated fuel record",
        id,
        `Fuel Record #${id}`
      );

      return res.json({
        message:
          "Fuel record updated successfully",
      });
    }
  );
};

/* =========================
   DELETE
   ADMINISTRATOR ONLY
========================= */

export const deleteFuelRecord = (
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
          "Invalid fuel record ID",
      });
  }

  /*
    Load record before deletion
    so Audit Log keeps useful details.
  */

  const findSql = `
    SELECT
      f.id,
      f.vehicle_id,
      f.trip_id,
      f.fuel_date,
      f.liters,
      f.amount,
      f.odometer,
      f.station_vendor,
      f.status,

      v.registration_no,
      v.vehicle_name

    FROM fuel_records f

    LEFT JOIN vehicles v
      ON f.vehicle_id = v.id

    WHERE f.id = ?

    LIMIT 1
  `;

  db.query(
    findSql,
    [
      id,
    ],
    (
      findErr,
      findResults
    ) => {
      if (
        findErr
      ) {
        console.error(
          "Find fuel before delete error:",
          findErr
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to delete fuel record",
          });
      }

      if (
        findResults.length ===
        0
      ) {
        return res
          .status(404)
          .json({
            message:
              "Fuel record not found",
          });
      }

      const record =
        findResults[0];

      const deleteSql = `
        DELETE FROM fuel_records
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
              "Delete fuel record error:",
              deleteErr
            );

            return res
              .status(500)
              .json({
                message:
                  "Unable to delete fuel record",
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
                  "Fuel record not found",
              });
          }

          const registrationNo =
            record.registration_no ||
            "Unknown Vehicle";

          const vehicleName =
            record.vehicle_name ||
            "";

          const recordName =
            `Fuel Record #${record.id} - ${registrationNo}${
              vehicleName
                ? ` - ${vehicleName}`
                : ""
            }`;

          addFuelAuditLog(
            req.user.id,
            "Deleted fuel record",
            record.id,
            recordName
          );

          return res.json({
            message:
              "Fuel record deleted successfully",

            deletedFuelRecord: {
              id:
                Number(
                  record.id
                ),

              vehicleId:
                record.vehicle_id,

              tripId:
                record.trip_id,

              registrationNo:
                record.registration_no,

              liters:
                record.liters,

              amount:
                record.amount,
            },
          });
        }
      );
    }
  );
};