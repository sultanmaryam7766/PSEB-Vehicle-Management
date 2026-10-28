import db from "../db.js";

const OIL_CHANGE_INTERVAL_KM = 5000;
const MAINTENANCE_WARNING_KM = 500;

/* =========================
   HELPERS
========================= */

const isOilChange = (
  serviceType
) => {
  return String(
    serviceType || ""
  )
    .trim()
    .toLowerCase() ===
    "oil change";
};

const getNextServiceOdometer = ({
  serviceType,
  status,
  odometer,
  nextServiceOdometer,
}) => {
  /*
    Next service target only exists
    after maintenance is completed.
  */

  if (
    status !== "Completed"
  ) {
    return null;
  }

  /*
    Oil Change:
    automatically every 5,000 km.
  */

  if (
    isOilChange(
      serviceType
    )
  ) {
    return (
      Number(
        odometer
      ) +
      OIL_CHANGE_INTERVAL_KM
    );
  }

  /*
    Other service types:
    optional manual target.
  */

  if (
    nextServiceOdometer === "" ||
    nextServiceOdometer === null ||
    nextServiceOdometer === undefined
  ) {
    return null;
  }

  return Number(
    nextServiceOdometer
  );
};

/* =========================
   AUDIT
========================= */

const addMaintenanceAuditLog = (
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
    [
      actorUserId,
    ],
    (
      actorErr,
      actorResults
    ) => {
      if (
        actorErr
      ) {
        console.error(
          "Maintenance audit actor error:",
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
          "Maintenance",
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
              "Maintenance audit log error:",
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

export const getMaintenanceRecords = (
  req,
  res
) => {
  const sql = `
    SELECT
      m.id,
      m.vehicle_id,
      m.maintenance_date,
      m.service_type,
      m.vendor,
      m.odometer,
      m.cost,
      m.next_service_odometer,
      m.remarks,
      m.status,
      m.created_at,

      v.registration_no,
      v.vehicle_name,
      v.location,

      v.odometer AS
        current_vehicle_odometer

    FROM maintenance_records m

    INNER JOIN vehicles v
      ON m.vehicle_id =
         v.id

    ORDER BY
      m.maintenance_date DESC,
      m.id DESC
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
          "Load maintenance error:",
          err
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to load maintenance records",
          });
      }

      const records =
        results.map(
          (
            record
          ) => {
            const currentOdometer =
              Number(
                record.current_vehicle_odometer ||
                  0
              );

            const nextOdometer =
              record.next_service_odometer ===
                null ||
              record.next_service_odometer ===
                undefined
                ? null
                : Number(
                    record.next_service_odometer
                  );

            let serviceDue =
              false;

            let serviceDueSoon =
              false;

            let serviceOverdue =
              false;

            let serviceStatus =
              "none";

            let kmUntilService =
              null;

            let kmOverdue =
              0;

            if (
              record.status ===
                "Completed" &&
              nextOdometer !==
                null
            ) {
              const remainingKm =
                nextOdometer -
                currentOdometer;

              /* OVERDUE */

              if (
                remainingKm <
                0
              ) {
                serviceDue =
                  true;

                serviceOverdue =
                  true;

                serviceStatus =
                  "overdue";

                kmUntilService =
                  0;

                kmOverdue =
                  Math.abs(
                    remainingKm
                  );
              }

              /* DUE NOW */

              else if (
                remainingKm ===
                0
              ) {
                serviceDue =
                  true;

                serviceStatus =
                  "due";

                kmUntilService =
                  0;
              }

              /* DUE SOON */

              else if (
                remainingKm <=
                MAINTENANCE_WARNING_KM
              ) {
                serviceDueSoon =
                  true;

                serviceStatus =
                  "due_soon";

                kmUntilService =
                  remainingKm;
              }

              /* UPCOMING */

              else {
                serviceStatus =
                  "upcoming";

                kmUntilService =
                  remainingKm;
              }
            }

            return {
              ...record,

              service_due:
                serviceDue,

              service_due_soon:
                serviceDueSoon,

              service_overdue:
                serviceOverdue,

              service_status:
                serviceStatus,

              km_until_service:
                kmUntilService,

              km_overdue:
                kmOverdue,
            };
          }
        );

      return res.json({
        maintenanceRecords:
          records,
      });
    }
  );
};

/* =========================
   CREATE
========================= */

export const createMaintenanceRecord = (
  req,
  res
) => {
  const {
    vehicleId,
    maintenanceDate,
    serviceType,
    vendor,
    odometer,
    cost,
    nextServiceOdometer,
    remarks,
    status,
  } =
    req.body;

  if (
    !vehicleId ||
    !maintenanceDate ||
    !serviceType ||
    odometer === "" ||
    odometer === null ||
    odometer === undefined
  ) {
    return res
      .status(400)
      .json({
        message:
          "Vehicle, maintenance date, service type and odometer are required",
      });
  }

  const finalOdometer =
    Number(
      odometer
    );

  const finalCost =
    cost === "" ||
    cost === null ||
    cost === undefined
      ? 0
      : Number(
          cost
        );

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
          "Invalid odometer value",
      });
  }

  if (
    Number.isNaN(
      finalCost
    ) ||
    finalCost <
      0
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid maintenance cost",
      });
  }

  const finalStatus =
    status ||
    "Scheduled";

  const allowedStatuses = [
    "Scheduled",
    "In Progress",
    "Completed",
  ];

  if (
    !allowedStatuses.includes(
      finalStatus
    )
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid maintenance status",
      });
  }

  const finalNextOdometer =
    getNextServiceOdometer({
      serviceType,

      status:
        finalStatus,

      odometer:
        finalOdometer,

      nextServiceOdometer,
    });

  if (
    finalNextOdometer !==
      null &&
    (
      Number.isNaN(
        finalNextOdometer
      ) ||
      finalNextOdometer <=
        finalOdometer
    )
  ) {
    return res
      .status(400)
      .json({
        message:
          "Next service odometer must be greater than maintenance odometer",
      });
  }

  const sql = `
    INSERT INTO maintenance_records
    (
      vehicle_id,
      maintenance_date,
      service_type,
      vendor,
      odometer,
      cost,
      next_service_date,
      next_service_odometer,
      remarks,
      status,
      created_by
    )
    VALUES
    (
      ?, ?, ?, ?, ?, ?,
      NULL, ?,
      ?, ?, ?
    )
  `;

  db.query(
    sql,
    [
      vehicleId,
      maintenanceDate,
      serviceType,
      vendor ||
        null,
      finalOdometer,
      finalCost,
      finalNextOdometer,
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
          "Create maintenance error:",
          err
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to create maintenance record",
          });
      }

      const recordName =
        `${serviceType} - Maintenance #${result.insertId}`;

      addMaintenanceAuditLog(
        req.user.id,
        "Created maintenance record",
        result.insertId,
        recordName
      );

      return res
        .status(201)
        .json({
          message:
            "Maintenance record added successfully",

          maintenance: {
            id:
              result.insertId,

            nextServiceOdometer:
              finalNextOdometer,
          },
        });
    }
  );
};

/* =========================
   UPDATE
========================= */

export const updateMaintenanceRecord = (
  req,
  res
) => {
  const {
    id,
  } =
    req.params;

  const {
    vehicleId,
    maintenanceDate,
    serviceType,
    vendor,
    odometer,
    cost,
    nextServiceOdometer,
    remarks,
    status,
  } =
    req.body;

  if (
    !vehicleId ||
    !maintenanceDate ||
    !serviceType ||
    odometer === "" ||
    odometer === null ||
    odometer === undefined
  ) {
    return res
      .status(400)
      .json({
        message:
          "Vehicle, maintenance date, service type and odometer are required",
      });
  }

  const finalOdometer =
    Number(
      odometer
    );

  const finalCost =
    cost === "" ||
    cost === null ||
    cost === undefined
      ? 0
      : Number(
          cost
        );

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
          "Invalid odometer value",
      });
  }

  if (
    Number.isNaN(
      finalCost
    ) ||
    finalCost <
      0
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid maintenance cost",
      });
  }

  const allowedStatuses = [
    "Scheduled",
    "In Progress",
    "Completed",
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
          "Invalid maintenance status",
      });
  }

  const finalNextOdometer =
    getNextServiceOdometer({
      serviceType,

      status,

      odometer:
        finalOdometer,

      nextServiceOdometer,
    });

  if (
    finalNextOdometer !==
      null &&
    (
      Number.isNaN(
        finalNextOdometer
      ) ||
      finalNextOdometer <=
        finalOdometer
    )
  ) {
    return res
      .status(400)
      .json({
        message:
          "Next service odometer must be greater than maintenance odometer",
      });
  }

  const sql = `
    UPDATE maintenance_records

    SET
      vehicle_id = ?,
      maintenance_date = ?,
      service_type = ?,
      vendor = ?,
      odometer = ?,
      cost = ?,

      next_service_date = NULL,
      next_service_odometer = ?,

      remarks = ?,
      status = ?

    WHERE id = ?
  `;

  db.query(
    sql,
    [
      vehicleId,
      maintenanceDate,
      serviceType,
      vendor ||
        null,
      finalOdometer,
      finalCost,
      finalNextOdometer,
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
          "Update maintenance error:",
          err
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to update maintenance record",
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
              "Maintenance record not found",
          });
      }

      const recordName =
        `${serviceType} - Maintenance #${id}`;

      addMaintenanceAuditLog(
        req.user.id,
        "Updated maintenance record",
        id,
        recordName
      );

      return res.json({
        message:
          "Maintenance record updated successfully",

        maintenance: {
          id:
            Number(
              id
            ),

          nextServiceOdometer:
            finalNextOdometer,
        },
      });
    }
  );
};

/* =========================
   DELETE
   ADMINISTRATOR ONLY
========================= */

export const deleteMaintenanceRecord = (
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
          "Invalid maintenance record ID",
      });
  }

  /*
    First read the maintenance record.

    This allows us to:
    1. Confirm it exists.
    2. Preserve its details for Audit Log.
  */

  const findSql = `
    SELECT
      m.id,
      m.vehicle_id,
      m.service_type,
      m.maintenance_date,
      m.odometer,
      m.status,

      v.registration_no,
      v.vehicle_name

    FROM maintenance_records m

    LEFT JOIN vehicles v
      ON m.vehicle_id = v.id

    WHERE m.id = ?

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
          "Find maintenance before delete error:",
          findErr
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to delete maintenance record",
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
              "Maintenance record not found",
          });
      }

      const record =
        findResults[0];

      const deleteSql = `
        DELETE FROM maintenance_records
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
              "Delete maintenance error:",
              deleteErr
            );

            return res
              .status(500)
              .json({
                message:
                  "Unable to delete maintenance record",
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
                  "Maintenance record not found",
              });
          }

          const registrationNo =
            record.registration_no ||
            "Unknown Vehicle";

          const vehicleName =
            record.vehicle_name ||
            "";

          const recordName =
            `${record.service_type} - ${registrationNo}${vehicleName ? ` - ${vehicleName}` : ""} - Maintenance #${record.id}`;

          /*
            Audit Log stays even though
            maintenance record is deleted.
          */

          addMaintenanceAuditLog(
            req.user.id,
            "Deleted maintenance record",
            record.id,
            recordName
          );

          return res.json({
            message:
              "Maintenance record deleted successfully",

            deletedMaintenance: {
              id:
                Number(
                  record.id
                ),

              vehicleId:
                record.vehicle_id,

              serviceType:
                record.service_type,

              registrationNo:
                record.registration_no,

              vehicleName:
                record.vehicle_name,
            },
          });
        }
      );
    }
  );
};