import db from "../db.js";

/* =========================
   AUDIT LOG
========================= */

const addIncidentAuditLog = (
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
      if (actorErr) {
        console.error(
          "Incident audit actor error:",
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
          "Incidents",
          recordId,
          recordName,
        ],
        (auditErr) => {
          if (auditErr) {
            console.error(
              "Incident audit error:",
              auditErr
            );
          }
        }
      );
    }
  );
};

/* =========================
   GET INCIDENTS
========================= */

export const getIncidents = (
  req,
  res
) => {
  const sql = `
    SELECT
      i.id,
      i.vehicle_id,
      i.driver_id,
      i.incident_date,
      i.location,
      i.incident_type,
      i.description,
      i.estimated_cost,
      i.actual_cost,
      i.police_report_no,
      i.insurance_claim_no,
      i.status,
      i.created_at,

      v.registration_no,
      v.vehicle_name,

      d.driver_code,
      d.driver_name

    FROM incidents i

    INNER JOIN vehicles v
      ON i.vehicle_id = v.id

    LEFT JOIN drivers d
      ON i.driver_id = d.id

    ORDER BY
      i.incident_date DESC,
      i.id DESC
  `;

  db.query(
    sql,
    (
      err,
      results
    ) => {
      if (err) {
        console.error(
          "Load incidents error:",
          err
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to load incidents",
          });
      }

      return res.json({
        incidents:
          results,
      });
    }
  );
};

/* =========================
   CREATE INCIDENT
========================= */

export const createIncident = (
  req,
  res
) => {
  const {
    vehicleId,
    driverId,
    incidentDate,
    location,
    incidentType,
    description,
    estimatedCost,
    actualCost,
    policeReportNo,
    insuranceClaimNo,
    status,
  } = req.body;

  if (
    !vehicleId ||
    !incidentDate ||
    !location ||
    !incidentType
  ) {
    return res
      .status(400)
      .json({
        message:
          "Vehicle, date, location and incident type are required",
      });
  }

  const sql = `
    INSERT INTO incidents
    (
      vehicle_id,
      driver_id,
      incident_date,
      location,
      incident_type,
      description,
      estimated_cost,
      actual_cost,
      police_report_no,
      insurance_claim_no,
      status,
      created_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      vehicleId,
      driverId || null,
      incidentDate,
      location,
      incidentType,
      description || null,
      estimatedCost || 0,
      actualCost || 0,
      policeReportNo || null,
      insuranceClaimNo || null,
      status || "Open",
      req.user.id,
    ],
    (
      err,
      result
    ) => {
      if (err) {
        console.error(
          "Create incident error:",
          err
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to create incident",
          });
      }

      addIncidentAuditLog(
        req.user.id,
        "Created incident",
        result.insertId,
        `INC-${String(
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
            "Incident created successfully",
        });
    }
  );
};

/* =========================
   UPDATE INCIDENT
========================= */

export const updateIncident = (
  req,
  res
) => {
  const {
    id,
  } = req.params;

  const {
    vehicleId,
    driverId,
    incidentDate,
    location,
    incidentType,
    description,
    estimatedCost,
    actualCost,
    policeReportNo,
    insuranceClaimNo,
    status,
  } = req.body;

  if (
    !vehicleId ||
    !incidentDate ||
    !location ||
    !incidentType
  ) {
    return res
      .status(400)
      .json({
        message:
          "Vehicle, date, location and incident type are required",
      });
  }

  const sql = `
    UPDATE incidents
    SET
      vehicle_id = ?,
      driver_id = ?,
      incident_date = ?,
      location = ?,
      incident_type = ?,
      description = ?,
      estimated_cost = ?,
      actual_cost = ?,
      police_report_no = ?,
      insurance_claim_no = ?,
      status = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      vehicleId,
      driverId || null,
      incidentDate,
      location,
      incidentType,
      description || null,
      estimatedCost || 0,
      actualCost || 0,
      policeReportNo || null,
      insuranceClaimNo || null,
      status || "Open",
      id,
    ],
    (
      err,
      result
    ) => {
      if (err) {
        console.error(
          "Update incident error:",
          err
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to update incident",
          });
      }

      if (
        result.affectedRows === 0
      ) {
        return res
          .status(404)
          .json({
            message:
              "Incident not found",
          });
      }

      addIncidentAuditLog(
        req.user.id,
        "Updated incident",
        id,
        `INC-${String(
          id
        ).padStart(
          5,
          "0"
        )}`
      );

      return res.json({
        message:
          "Incident updated successfully",
      });
    }
  );
};

/* =========================
   DELETE INCIDENT
   ADMINISTRATOR ONLY
========================= */

export const deleteIncident = (
  req,
  res
) => {
  const {
    id,
  } = req.params;

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
          "Invalid incident ID",
      });
  }

  /*
    Load incident before deletion
    so Audit Log can preserve details.
  */

  const findSql = `
    SELECT
      i.id,
      i.vehicle_id,
      i.driver_id,
      i.incident_date,
      i.incident_type,
      i.location,
      i.estimated_cost,
      i.actual_cost,
      i.status,

      v.registration_no,
      v.vehicle_name,

      d.driver_code,
      d.driver_name

    FROM incidents i

    LEFT JOIN vehicles v
      ON i.vehicle_id = v.id

    LEFT JOIN drivers d
      ON i.driver_id = d.id

    WHERE i.id = ?

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
          "Find incident before delete error:",
          findErr
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to delete incident",
          });
      }

      if (
        results.length === 0
      ) {
        return res
          .status(404)
          .json({
            message:
              "Incident not found",
          });
      }

      const incident =
        results[0];

      const deleteSql = `
        DELETE FROM incidents
        WHERE id = ?
      `;

      db.query(
        deleteSql,
        [id],
        (
          deleteErr,
          deleteResult
        ) => {
          if (deleteErr) {
            console.error(
              "Delete incident error:",
              deleteErr
            );

            return res
              .status(500)
              .json({
                message:
                  "Unable to delete incident",
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
                  "Incident not found",
              });
          }

          const incidentCode =
            `INC-${String(
              incident.id
            ).padStart(
              5,
              "0"
            )}`;

          const registration =
            incident.registration_no ||
            "Unknown Vehicle";

          const vehicleName =
            incident.vehicle_name ||
            "";

          const recordName =
            `${incidentCode} - ${incident.incident_type} - ${registration}${
              vehicleName
                ? ` - ${vehicleName}`
                : ""
            }`;

          addIncidentAuditLog(
            req.user.id,
            "Deleted incident",
            incident.id,
            recordName
          );

          return res.json({
            message:
              "Incident deleted successfully",

            deletedIncident: {
              id:
                Number(
                  incident.id
                ),

              incidentCode,

              vehicleId:
                incident.vehicle_id,

              registrationNo:
                incident.registration_no,

              incidentType:
                incident.incident_type,

              estimatedCost:
                incident.estimated_cost,

              actualCost:
                incident.actual_cost,
            },
          });
        }
      );
    }
  );
};