import db from "../db.js";

/* =========================
   AUDIT LOG HELPER
========================= */

const addVehicleAuditLog = (
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
          "Vehicle audit actor error:",
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
          "Vehicles",
          recordId,
          recordName,
        ],
        (auditErr) => {
          if (auditErr) {
            console.error(
              "Vehicle audit log error:",
              auditErr
            );
          }
        }
      );
    }
  );
};

/* =========================
   GET VEHICLES
========================= */

export const getVehicles = (
  req,
  res
) => {
  const sql = `
    SELECT
      v.id,
      v.registration_no,
      v.vehicle_name,
      v.location,
      v.odometer,
      v.status,
      v.created_at,

      (
        SELECT COUNT(*)
        FROM trips t
        WHERE t.vehicle_id = v.id
          AND t.status = 'Completed'
      ) AS completed_trips

    FROM vehicles v

    ORDER BY v.id DESC
  `;

  db.query(
    sql,
    (err, results) => {
      if (err) {
        console.error(
          "Load vehicles error:",
          err
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to load vehicles",
          });
      }

      return res.json({
        vehicles: results,
      });
    }
  );
};

/* =========================
   CREATE VEHICLE
========================= */

export const createVehicle = (
  req,
  res
) => {
  const {
    registrationNo,
    vehicleName,
    location,
    odometer,
    status,
  } = req.body;

  if (
    !registrationNo ||
    !vehicleName
  ) {
    return res
      .status(400)
      .json({
        message:
          "Registration number and vehicle name are required",
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

  const finalOdometer =
    odometer === "" ||
    odometer === null ||
    odometer === undefined
      ? 0
      : Number(odometer);

  if (
    Number.isNaN(
      finalOdometer
    ) ||
    finalOdometer < 0
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid odometer value",
      });
  }

  const checkSql = `
    SELECT id
    FROM vehicles
    WHERE registration_no = ?
    LIMIT 1
  `;

  db.query(
    checkSql,
    [registrationNo],
    (
      checkErr,
      results
    ) => {
      if (checkErr) {
        console.error(
          "Vehicle check error:",
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
              "Vehicle registration number already exists",
          });
      }

      const sql = `
        INSERT INTO vehicles
        (
          registration_no,
          vehicle_name,
          location,
          odometer,
          status
        )
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        sql,
        [
          registrationNo,
          vehicleName,
          location || null,
          finalOdometer,
          finalStatus,
        ],
        (
          err,
          result
        ) => {
          if (err) {
            console.error(
              "Create vehicle error:",
              err
            );

            return res
              .status(500)
              .json({
                message:
                  "Unable to create vehicle",
              });
          }

          addVehicleAuditLog(
            req.user.id,
            "Created vehicle",
            result.insertId,
            registrationNo
          );

          return res
            .status(201)
            .json({
              message:
                "Vehicle added successfully",

              vehicle: {
                id:
                  result.insertId,

                registration_no:
                  registrationNo,

                vehicle_name:
                  vehicleName,

                location:
                  location || null,

                odometer:
                  finalOdometer,

                status:
                  finalStatus,

                completed_trips: 0,
              },
            });
        }
      );
    }
  );
};

/* =========================
   UPDATE VEHICLE
========================= */

export const updateVehicle = (
  req,
  res
) => {
  const {
    id,
  } = req.params;

  const {
    registrationNo,
    vehicleName,
    location,
    odometer,
  } = req.body;

  if (
    !registrationNo ||
    !vehicleName
  ) {
    return res
      .status(400)
      .json({
        message:
          "Registration number and vehicle name are required",
      });
  }

  const finalOdometer =
    odometer === "" ||
    odometer === null ||
    odometer === undefined
      ? 0
      : Number(odometer);

  if (
    Number.isNaN(
      finalOdometer
    ) ||
    finalOdometer < 0
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid odometer value",
      });
  }

  const checkSql = `
    SELECT id
    FROM vehicles
    WHERE registration_no = ?
      AND id != ?
    LIMIT 1
  `;

  db.query(
    checkSql,
    [
      registrationNo,
      id,
    ],
    (
      checkErr,
      results
    ) => {
      if (checkErr) {
        console.error(
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
              "Vehicle registration number already exists",
          });
      }

      const sql = `
        UPDATE vehicles
        SET
          registration_no = ?,
          vehicle_name = ?,
          location = ?,
          odometer = ?
        WHERE id = ?
      `;

      db.query(
        sql,
        [
          registrationNo,
          vehicleName,
          location || null,
          finalOdometer,
          id,
        ],
        (
          err,
          result
        ) => {
          if (err) {
            console.error(
              "Update vehicle error:",
              err
            );

            return res
              .status(500)
              .json({
                message:
                  "Unable to update vehicle",
              });
          }

          if (
            result.affectedRows === 0
          ) {
            return res
              .status(404)
              .json({
                message:
                  "Vehicle not found",
              });
          }

          addVehicleAuditLog(
            req.user.id,
            "Updated vehicle",
            id,
            registrationNo
          );

          return res.json({
            message:
              "Vehicle updated successfully",
          });
        }
      );
    }
  );
};

/* =========================
   UPDATE VEHICLE STATUS
========================= */

export const updateVehicleStatus = (
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
    SELECT registration_no
    FROM vehicles
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
              "Vehicle not found",
          });
      }

      const registrationNo =
        results[0]
          .registration_no;

      const sql = `
        UPDATE vehicles
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
              "Vehicle status error:",
              err
            );

            return res
              .status(500)
              .json({
                message:
                  "Unable to update vehicle status",
              });
          }

          const action =
            status === "Active"
              ? "Activated vehicle"
              : "Deactivated vehicle";

          addVehicleAuditLog(
            req.user.id,
            action,
            id,
            registrationNo
          );

          return res.json({
            message:
              `Vehicle ${status.toLowerCase()} successfully`,
          });
        }
      );
    }
  );
};

/* =========================
   DELETE VEHICLE
   ADMINISTRATOR ONLY

   Hard delete is allowed only
   when no operational/history
   records are linked.
========================= */

export const deleteVehicle = (
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
          "Invalid vehicle ID",
      });
  }

  /*
    Fetch the vehicle plus counts of
    every important linked table.

    We do NOT cascade-delete history.
  */

  const dependencySql = `
    SELECT
      v.id,
      v.registration_no,
      v.vehicle_name,
      v.status,

      (
        SELECT COUNT(*)
        FROM trips t
        WHERE t.vehicle_id = v.id
      ) AS trip_count,

      (
        SELECT COUNT(*)
        FROM fuel_records f
        WHERE f.vehicle_id = v.id
      ) AS fuel_count,

      (
        SELECT COUNT(*)
        FROM maintenance_records m
        WHERE m.vehicle_id = v.id
      ) AS maintenance_count,

      (
        SELECT COUNT(*)
        FROM vehicle_documents d
        WHERE d.vehicle_id = v.id
      ) AS document_count,

      (
        SELECT COUNT(*)
        FROM incidents i
        WHERE i.vehicle_id = v.id
      ) AS incident_count,

      (
        SELECT COUNT(*)
        FROM expenses e
        WHERE e.vehicle_id = v.id
      ) AS expense_count,

      (
        SELECT COUNT(*)
        FROM drivers dr
        WHERE dr.current_vehicle_id = v.id
      ) AS driver_assignment_count

    FROM vehicles v

    WHERE v.id = ?

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
          "Vehicle dependency check error:",
          dependencyErr
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to check vehicle records",
          });
      }

      if (
        results.length === 0
      ) {
        return res
          .status(404)
          .json({
            message:
              "Vehicle not found",
          });
      }

      const vehicle =
        results[0];

      const linkedCounts = {
        trips:
          Number(
            vehicle.trip_count || 0
          ),

        fuel:
          Number(
            vehicle.fuel_count || 0
          ),

        maintenance:
          Number(
            vehicle.maintenance_count || 0
          ),

        documents:
          Number(
            vehicle.document_count || 0
          ),

        incidents:
          Number(
            vehicle.incident_count || 0
          ),

        expenses:
          Number(
            vehicle.expense_count || 0
          ),

        driverAssignments:
          Number(
            vehicle.driver_assignment_count ||
              0
          ),
      };

      const totalLinks =
        Object.values(
          linkedCounts
        ).reduce(
          (
            total,
            count
          ) =>
            total +
            Number(count || 0),
          0
        );

      /*
        Linked vehicle:
        block hard deletion and preserve
        history. User should deactivate it.
      */

      if (
        totalLinks > 0
      ) {
        const linkedItems = [];

        if (
          linkedCounts.trips > 0
        ) {
          linkedItems.push(
            `${linkedCounts.trips} trip(s)`
          );
        }

        if (
          linkedCounts.fuel > 0
        ) {
          linkedItems.push(
            `${linkedCounts.fuel} fuel record(s)`
          );
        }

        if (
          linkedCounts.maintenance >
          0
        ) {
          linkedItems.push(
            `${linkedCounts.maintenance} maintenance record(s)`
          );
        }

        if (
          linkedCounts.documents >
          0
        ) {
          linkedItems.push(
            `${linkedCounts.documents} document(s)`
          );
        }

        if (
          linkedCounts.incidents >
          0
        ) {
          linkedItems.push(
            `${linkedCounts.incidents} incident(s)`
          );
        }

        if (
          linkedCounts.expenses >
          0
        ) {
          linkedItems.push(
            `${linkedCounts.expenses} expense(s)`
          );
        }

        if (
          linkedCounts.driverAssignments >
          0
        ) {
          linkedItems.push(
            `${linkedCounts.driverAssignments} driver assignment(s)`
          );
        }

        return res
          .status(409)
          .json({
            message:
              `Cannot delete ${vehicle.registration_no}. This vehicle has linked history: ${linkedItems.join(
                ", "
              )}. Set the vehicle to Inactive instead.`,

            linked:
              true,

            linkedCounts,
          });
      }

      /*
        No linked records found.
        Safe to hard-delete.
      */

      const deleteSql = `
        DELETE FROM vehicles
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
              "Delete vehicle error:",
              deleteErr
            );

            /*
              FK safety fallback:
              even if another future table
              references vehicles, don't
              destroy data.
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
                    `Cannot delete ${vehicle.registration_no} because linked records still exist. Set the vehicle to Inactive instead.`,
                });
            }

            return res
              .status(500)
              .json({
                message:
                  "Unable to delete vehicle",
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
                  "Vehicle not found",
              });
          }

          const recordName =
            `${vehicle.registration_no}${
              vehicle.vehicle_name
                ? ` - ${vehicle.vehicle_name}`
                : ""
            }`;

          addVehicleAuditLog(
            req.user.id,
            "Deleted vehicle",
            vehicle.id,
            recordName
          );

          return res.json({
            message:
              "Vehicle deleted successfully",

            deletedVehicle: {
              id:
                Number(
                  vehicle.id
                ),

              registrationNo:
                vehicle.registration_no,

              vehicleName:
                vehicle.vehicle_name,
            },
          });
        }
      );
    }
  );
};