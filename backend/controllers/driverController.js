import db from "../db.js";

/* =========================
   AUDIT LOG
========================= */

const addDriverAuditLog = (
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
    (actorErr, actorResults) => {
      if (actorErr) {
        console.error(
          "Driver audit actor error:",
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
          "Drivers",
          recordId,
          recordName,
        ],
        (auditErr) => {
          if (auditErr) {
            console.error(
              "Driver audit log error:",
              auditErr
            );
          }
        }
      );
    }
  );
};

/* =========================
   GET DRIVERS
========================= */

export const getDrivers = (
  req,
  res
) => {
  const sql = `
    SELECT
      d.id,
      d.driver_code,
      d.driver_name,
      d.location,
      d.current_vehicle_id,
      d.status,
      d.created_at,

      v.registration_no,
      v.vehicle_name,

      (
        SELECT COUNT(*)
        FROM trips t
        WHERE t.driver_id = d.id
          AND YEAR(t.start_datetime) =
              YEAR(CURRENT_DATE())
          AND MONTH(t.start_datetime) =
              MONTH(CURRENT_DATE())
      ) AS trips_this_month

    FROM drivers d

    LEFT JOIN vehicles v
      ON d.current_vehicle_id = v.id

    ORDER BY d.id DESC
  `;

  db.query(
    sql,
    (err, results) => {
      if (err) {
        console.error(
          "Load drivers error:",
          err
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to load drivers",
          });
      }

      return res.json({
        drivers: results,
      });
    }
  );
};

/* =========================
   CREATE DRIVER

   No permanent vehicle
   assignment is stored.
========================= */

export const createDriver = (
  req,
  res
) => {
  const {
    driverCode,
    driverName,
    location,
    status,
  } = req.body;

  if (
    !driverCode ||
    !driverName
  ) {
    return res
      .status(400)
      .json({
        message:
          "Driver ID and driver name are required",
      });
  }

  const allowedStatuses = [
    "Active",
    "Inactive",
  ];

  const finalStatus =
    status || "Active";

  if (
    !allowedStatuses.includes(
      finalStatus
    )
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid status",
      });
  }

  const checkSql = `
    SELECT id
    FROM drivers
    WHERE driver_code = ?
    LIMIT 1
  `;

  db.query(
    checkSql,
    [driverCode],
    (checkErr, results) => {
      if (checkErr) {
        console.error(
          "Driver check error:",
          checkErr
        );

        return res
          .status(500)
          .json({
            message:
              "Server error",
          });
      }

      if (
        results.length > 0
      ) {
        return res
          .status(409)
          .json({
            message:
              "Driver ID already exists",
          });
      }

      /*
        current_vehicle_id is deliberately
        NULL.

        Vehicle-driver relationship exists
        only inside Trips.
      */

      const sql = `
        INSERT INTO drivers
        (
          driver_code,
          driver_name,
          location,
          current_vehicle_id,
          status
        )
        VALUES (?, ?, ?, NULL, ?)
      `;

      db.query(
        sql,
        [
          driverCode,
          driverName,
          location || null,
          finalStatus,
        ],
        (err, result) => {
          if (err) {
            console.error(
              "Create driver error:",
              err
            );

            return res
              .status(500)
              .json({
                message:
                  "Unable to create driver",
              });
          }

          addDriverAuditLog(
            req.user.id,
            "Created driver",
            result.insertId,
            driverName
          );

          return res
            .status(201)
            .json({
              message:
                "Driver added successfully",
            });
        }
      );
    }
  );
};

/* =========================
   UPDATE DRIVER

   Removes any legacy permanent
   vehicle assignment.
========================= */

export const updateDriver = (
  req,
  res
) => {
  const {
    id,
  } = req.params;

  const {
    driverCode,
    driverName,
    location,
  } = req.body;

  if (
    !driverCode ||
    !driverName
  ) {
    return res
      .status(400)
      .json({
        message:
          "Driver ID and driver name are required",
      });
  }

  const checkSql = `
    SELECT id
    FROM drivers
    WHERE driver_code = ?
      AND id != ?
    LIMIT 1
  `;

  db.query(
    checkSql,
    [
      driverCode,
      id,
    ],
    (
      checkErr,
      results
    ) => {
      if (checkErr) {
        console.error(
          "Driver check error:",
          checkErr
        );

        return res
          .status(500)
          .json({
            message:
              "Server error",
          });
      }

      if (
        results.length > 0
      ) {
        return res
          .status(409)
          .json({
            message:
              "Driver ID already exists",
          });
      }

      /*
        Any old current_vehicle_id
        is cleared here.
      */

      const sql = `
        UPDATE drivers
        SET
          driver_code = ?,
          driver_name = ?,
          location = ?,
          current_vehicle_id = NULL
        WHERE id = ?
      `;

      db.query(
        sql,
        [
          driverCode,
          driverName,
          location || null,
          id,
        ],
        (err, result) => {
          if (err) {
            console.error(
              "Update driver error:",
              err
            );

            return res
              .status(500)
              .json({
                message:
                  "Unable to update driver",
              });
          }

          if (
            result.affectedRows === 0
          ) {
            return res
              .status(404)
              .json({
                message:
                  "Driver not found",
              });
          }

          addDriverAuditLog(
            req.user.id,
            "Updated driver",
            id,
            driverName
          );

          return res.json({
            message:
              "Driver updated successfully",
          });
        }
      );
    }
  );
};

/* =========================
   STATUS
========================= */

export const updateDriverStatus = (
  req,
  res
) => {
  const {
    id,
  } = req.params;

  const {
    status,
  } = req.body;

  const allowedStatuses = [
    "Active",
    "Inactive",
  ];

  if (
    !allowedStatuses.includes(
      status
    )
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid status",
      });
  }

  const findSql = `
    SELECT
      driver_name
    FROM drivers
    WHERE id = ?
    LIMIT 1
  `;

  db.query(
    findSql,
    [id],
    (
      findErr,
      results
    ) => {
      if (findErr) {
        console.error(
          findErr
        );

        return res
          .status(500)
          .json({
            message:
              "Server error",
          });
      }

      if (
        results.length === 0
      ) {
        return res
          .status(404)
          .json({
            message:
              "Driver not found",
          });
      }

      const driverName =
        results[0]
          .driver_name;

      const sql = `
        UPDATE drivers
        SET status = ?
        WHERE id = ?
      `;

      db.query(
        sql,
        [
          status,
          id,
        ],
        (err) => {
          if (err) {
            console.error(
              "Driver status error:",
              err
            );

            return res
              .status(500)
              .json({
                message:
                  "Unable to update driver status",
              });
          }

          const action =
            status === "Active"
              ? "Activated driver"
              : "Deactivated driver";

          addDriverAuditLog(
            req.user.id,
            action,
            id,
            driverName
          );

          return res.json({
            message:
              `Driver ${status.toLowerCase()} successfully`,
          });
        }
      );
    }
  );
};

/* =========================
   DELETE DRIVER
   ADMINISTRATOR ONLY

   Driver can only be hard
   deleted if no Trips or
   Incidents reference it.
========================= */

export const deleteDriver = (
  req,
  res
) => {
  const {
    id,
  } = req.params;

  if (
    !id ||
    Number.isNaN(
      Number(id)
    )
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid driver ID",
      });
  }

  const dependencySql = `
    SELECT
      d.id,
      d.driver_code,
      d.driver_name,
      d.status,

      (
        SELECT COUNT(*)
        FROM trips t
        WHERE t.driver_id = d.id
      ) AS trip_count,

      (
        SELECT COUNT(*)
        FROM incidents i
        WHERE i.driver_id = d.id
      ) AS incident_count

    FROM drivers d

    WHERE d.id = ?

    LIMIT 1
  `;

  db.query(
    dependencySql,
    [id],
    (
      dependencyErr,
      results
    ) => {
      if (
        dependencyErr
      ) {
        console.error(
          "Driver dependency check error:",
          dependencyErr
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to check driver records",
          });
      }

      if (
        results.length === 0
      ) {
        return res
          .status(404)
          .json({
            message:
              "Driver not found",
          });
      }

      const driver =
        results[0];

      const tripCount =
        Number(
          driver.trip_count ||
            0
        );

      const incidentCount =
        Number(
          driver.incident_count ||
            0
        );

      const totalLinks =
        tripCount +
        incidentCount;

      /* =========================
         LINKED HISTORY EXISTS
      ========================= */

      if (
        totalLinks > 0
      ) {
        const linkedItems =
          [];

        if (
          tripCount > 0
        ) {
          linkedItems.push(
            `${tripCount} trip(s)`
          );
        }

        if (
          incidentCount > 0
        ) {
          linkedItems.push(
            `${incidentCount} incident(s)`
          );
        }

        return res
          .status(409)
          .json({
            message:
              `Cannot delete ${driver.driver_name}. This driver has linked history: ${linkedItems.join(
                ", "
              )}. Set the driver to Inactive instead.`,

            linked:
              true,

            linkedCounts: {
              trips:
                tripCount,

              incidents:
                incidentCount,
            },
          });
      }

      /* =========================
         SAFE HARD DELETE
      ========================= */

      const deleteSql = `
        DELETE FROM drivers
        WHERE id = ?
      `;

      db.query(
        deleteSql,
        [id],
        (
          deleteErr,
          deleteResult
        ) => {
          if (
            deleteErr
          ) {
            console.error(
              "Delete driver error:",
              deleteErr
            );

            /*
              Extra FK protection in case
              another table references
              drivers in the future.
            */

            if (
              deleteErr.code ===
                "ER_ROW_IS_REFERENCED_2" ||
              deleteErr.errno ===
                1451
            ) {
              return res
                .status(409)
                .json({
                  message:
                    `Cannot delete ${driver.driver_name} because linked history still exists. Set the driver to Inactive instead.`,
                });
            }

            return res
              .status(500)
              .json({
                message:
                  "Unable to delete driver",
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
                  "Driver not found",
              });
          }

          const recordName =
            `${driver.driver_code} - ${driver.driver_name}`;

          addDriverAuditLog(
            req.user.id,
            "Deleted driver",
            driver.id,
            recordName
          );

          return res.json({
            message:
              "Driver deleted successfully",

            deletedDriver: {
              id:
                Number(
                  driver.id
                ),

              driverCode:
                driver.driver_code,

              driverName:
                driver.driver_name,
            },
          });
        }
      );
    }
  );
};