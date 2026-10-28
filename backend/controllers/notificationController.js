import db from "../db.js";

const MAINTENANCE_WARNING_KM = 500;

/* =========================
   GET NOTIFICATIONS
========================= */

export const getNotifications = (
  req,
  res
) => {
  const alerts = [];

  /* =========================
     SCHEDULED MAINTENANCE

     Only alert when scheduled
     date is today or passed.
  ========================= */

  const scheduledSql = `
    SELECT
      m.id AS maintenance_id,
      m.vehicle_id,
      m.service_type,
      m.maintenance_date,
      m.status,

      v.registration_no,
      v.vehicle_name

    FROM maintenance_records m

    INNER JOIN vehicles v
      ON m.vehicle_id = v.id

    WHERE
      m.status = 'Scheduled'

      AND DATE(
        m.maintenance_date
      ) <= CURDATE()

    ORDER BY
      m.maintenance_date ASC
  `;

  /* =========================
     IN PROGRESS
  ========================= */

  const inProgressSql = `
    SELECT
      m.id AS maintenance_id,
      m.vehicle_id,
      m.service_type,
      m.maintenance_date,
      m.status,

      v.registration_no,
      v.vehicle_name

    FROM maintenance_records m

    INNER JOIN vehicles v
      ON m.vehicle_id = v.id

    WHERE
      m.status = 'In Progress'

    ORDER BY
      m.maintenance_date ASC
  `;

  /* =========================
     COMPLETED SERVICE
     ODOMETER TRACKING

     Only latest completed record
     per vehicle + service type.
  ========================= */

  const completedSql = `
    SELECT
      m.id AS maintenance_id,
      m.vehicle_id,
      m.service_type,

      m.odometer AS service_odometer,

      m.next_service_odometer,

      v.registration_no,
      v.vehicle_name,

      v.odometer AS current_odometer

    FROM maintenance_records m

    INNER JOIN vehicles v
      ON m.vehicle_id = v.id

    WHERE
      m.status = 'Completed'

      AND
      m.next_service_odometer
      IS NOT NULL

      AND m.id = (
        SELECT
          m2.id

        FROM maintenance_records m2

        WHERE
          m2.vehicle_id =
            m.vehicle_id

          AND LOWER(
            TRIM(
              m2.service_type
            )
          ) =
          LOWER(
            TRIM(
              m.service_type
            )
          )

          AND
          m2.status =
            'Completed'

        ORDER BY
          m2.maintenance_date DESC,
          m2.id DESC

        LIMIT 1
      )
  `;

  /* =========================
     DOCUMENTS
  ========================= */

  const documentsSql = `
    SELECT
      d.id,
      d.vehicle_id,
      d.document_type,
      d.document_number,
      d.expiry_date,

      v.registration_no,
      v.vehicle_name,

      DATEDIFF(
        d.expiry_date,
        CURDATE()
      ) AS days_left

    FROM vehicle_documents d

    INNER JOIN vehicles v
      ON d.vehicle_id = v.id

    WHERE
      d.expiry_date
      IS NOT NULL

    ORDER BY
      d.expiry_date ASC
  `;

  /* =========================
     LOAD SCHEDULED
  ========================= */

  db.query(
    scheduledSql,
    (
      scheduledErr,
      scheduledResults
    ) => {
      if (
        scheduledErr
      ) {
        console.error(
          "Scheduled maintenance notification error:",
          scheduledErr
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to load notifications",
          });
      }

      for (
        const item of
        scheduledResults
      ) {
        alerts.push({
          id:
            `maintenance-scheduled-${item.maintenance_id}`,

          type:
            "maintenance",

          severity:
            "warning",

          title:
            "Scheduled Maintenance Due",

          vehicleId:
            item.vehicle_id,

          vehicle:
            `${item.registration_no} - ${item.vehicle_name}`,

          message:
            `${item.service_type} is scheduled and is now due.`,

          date:
            item.maintenance_date,

          link:
            "/maintenance",
        });
      }

      /* =========================
         LOAD IN PROGRESS
      ========================= */

      db.query(
        inProgressSql,
        (
          progressErr,
          progressResults
        ) => {
          if (
            progressErr
          ) {
            console.error(
              "In-progress maintenance notification error:",
              progressErr
            );

            return res
              .status(500)
              .json({
                message:
                  "Unable to load notifications",
              });
          }

          for (
            const item of
            progressResults
          ) {
            alerts.push({
              id:
                `maintenance-progress-${item.maintenance_id}`,

              type:
                "maintenance",

              severity:
                "info",

              title:
                "Maintenance In Progress",

              vehicleId:
                item.vehicle_id,

              vehicle:
                `${item.registration_no} - ${item.vehicle_name}`,

              message:
                `${item.service_type} is currently in progress.`,

              date:
                item.maintenance_date,

              link:
                "/maintenance",
            });
          }

          /* =========================
             COMPLETED SERVICE
             ODOMETER LOGIC
          ========================= */

          db.query(
            completedSql,
            (
              completedErr,
              completedResults
            ) => {
              if (
                completedErr
              ) {
                console.error(
                  "Completed maintenance notification error:",
                  completedErr
                );

                return res
                  .status(500)
                  .json({
                    message:
                      "Unable to load notifications",
                  });
              }

              for (
                const item of
                completedResults
              ) {
                const currentOdometer =
                  Number(
                    item.current_odometer ||
                      0
                  );

                const nextOdometer =
                  Number(
                    item.next_service_odometer
                  );

                if (
                  Number.isNaN(
                    currentOdometer
                  ) ||
                  Number.isNaN(
                    nextOdometer
                  )
                ) {
                  continue;
                }

                const remainingKm =
                  nextOdometer -
                  currentOdometer;

                /* =====================
                   MORE THAN 500 KM LEFT
                   NO NOTIFICATION
                ===================== */

                if (
                  remainingKm >
                  MAINTENANCE_WARNING_KM
                ) {
                  continue;
                }

                /* =====================
                   1 - 500 KM LEFT
                   DUE SOON
                ===================== */

                if (
                  remainingKm >
                  0
                ) {
                  alerts.push({
                    id:
                      `maintenance-soon-${item.maintenance_id}`,

                    type:
                      "maintenance",

                    severity:
                      "warning",

                    title:
                      `${item.service_type} Due Soon`,

                    vehicleId:
                      item.vehicle_id,

                    vehicle:
                      `${item.registration_no} - ${item.vehicle_name}`,

                    message:
                      `${remainingKm.toLocaleString()} km remaining. ${item.service_type} is due at ${nextOdometer.toLocaleString()} km.`,

                    link:
                      "/maintenance",
                  });

                  continue;
                }

                /* =====================
                   EXACT TARGET
                   DUE NOW
                ===================== */

                if (
                  remainingKm ===
                  0
                ) {
                  alerts.push({
                    id:
                      `maintenance-due-${item.maintenance_id}`,

                    type:
                      "maintenance",

                    severity:
                      "urgent",

                    title:
                      `${item.service_type} Due`,

                    vehicleId:
                      item.vehicle_id,

                    vehicle:
                      `${item.registration_no} - ${item.vehicle_name}`,

                    message:
                      `Vehicle has reached ${currentOdometer.toLocaleString()} km. ${item.service_type} is due now.`,

                    link:
                      "/maintenance",
                  });

                  continue;
                }

                /* =====================
                   TARGET CROSSED
                   OVERDUE
                ===================== */

                const overdueKm =
                  Math.abs(
                    remainingKm
                  );

                alerts.push({
                  id:
                    `maintenance-overdue-${item.maintenance_id}`,

                  type:
                    "maintenance",

                  severity:
                    "danger",

                  title:
                    `${item.service_type} Overdue`,

                  vehicleId:
                    item.vehicle_id,

                  vehicle:
                    `${item.registration_no} - ${item.vehicle_name}`,

                  message:
                    `${item.service_type} was due at ${nextOdometer.toLocaleString()} km. Current odometer is ${currentOdometer.toLocaleString()} km and it is ${overdueKm.toLocaleString()} km overdue.`,

                  link:
                    "/maintenance",
                });
              }

              /* =========================
                 DOCUMENTS
              ========================= */

              db.query(
                documentsSql,
                (
                  documentErr,
                  documentResults
                ) => {
                  if (
                    documentErr
                  ) {
                    console.error(
                      "Document notification error:",
                      documentErr
                    );

                    return res
                      .status(500)
                      .json({
                        message:
                          "Unable to load notifications",
                      });
                  }

                  for (
                    const item of
                    documentResults
                  ) {
                    const daysLeft =
                      Number(
                        item.days_left
                      );

                    /* =====================
                       EXPIRED
                    ===================== */

                    if (
                      daysLeft <
                      0
                    ) {
                      alerts.push({
                        id:
                          `document-${item.id}`,

                        type:
                          "document",

                        severity:
                          "danger",

                        title:
                          "Document Expired",

                        vehicleId:
                          item.vehicle_id,

                        vehicle:
                          `${item.registration_no} - ${item.vehicle_name}`,

                        message:
                          `${item.document_type} expired ${Math.abs(
                            daysLeft
                          )} day(s) ago.`,

                        daysLeft,

                        date:
                          item.expiry_date,

                        link:
                          "/documents",
                      });

                      continue;
                    }

                    /* =====================
                       EXPIRES TODAY
                    ===================== */

                    if (
                      daysLeft ===
                      0
                    ) {
                      alerts.push({
                        id:
                          `document-${item.id}`,

                        type:
                          "document",

                        severity:
                          "urgent",

                        title:
                          "Document Expires Today",

                        vehicleId:
                          item.vehicle_id,

                        vehicle:
                          `${item.registration_no} - ${item.vehicle_name}`,

                        message:
                          `${item.document_type} expires today.`,

                        daysLeft,

                        date:
                          item.expiry_date,

                        link:
                          "/documents",
                      });

                      continue;
                    }

                    /* =====================
                       1 - 7 DAYS
                    ===================== */

                    if (
                      daysLeft <=
                      7
                    ) {
                      alerts.push({
                        id:
                          `document-${item.id}`,

                        type:
                          "document",

                        severity:
                          "urgent",

                        title:
                          "Document Expiring Soon",

                        vehicleId:
                          item.vehicle_id,

                        vehicle:
                          `${item.registration_no} - ${item.vehicle_name}`,

                        message:
                          `${item.document_type} expires in ${daysLeft} day(s).`,

                        daysLeft,

                        date:
                          item.expiry_date,

                        link:
                          "/documents",
                      });

                      continue;
                    }

                    /* =====================
                       8 - 30 DAYS
                    ===================== */

                    if (
                      daysLeft <=
                      30
                    ) {
                      alerts.push({
                        id:
                          `document-${item.id}`,

                        type:
                          "document",

                        severity:
                          "warning",

                        title:
                          "Document Expiring",

                        vehicleId:
                          item.vehicle_id,

                        vehicle:
                          `${item.registration_no} - ${item.vehicle_name}`,

                        message:
                          `${item.document_type} expires in ${daysLeft} day(s).`,

                        daysLeft,

                        date:
                          item.expiry_date,

                        link:
                          "/documents",
                      });
                    }
                  }

                  /* =========================
                     SORT
                  ========================= */

                  const severityOrder = {
                    danger: 1,
                    urgent: 2,
                    warning: 3,
                    info: 4,
                  };

                  alerts.sort(
                    (
                      a,
                      b
                    ) => {
                      const first =
                        severityOrder[
                          a.severity
                        ] ||
                        99;

                      const second =
                        severityOrder[
                          b.severity
                        ] ||
                        99;

                      return (
                        first -
                        second
                      );
                    }
                  );

                  return res.json({
                    alerts,

                    count:
                      alerts.length,
                  });
                }
              );
            }
          );
        }
      );
    }
  );
};