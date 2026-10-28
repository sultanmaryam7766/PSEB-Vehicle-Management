import db from "../db.js";

const runQuery = (
  sql,
  params = []
) => {
  return new Promise(
    (resolve, reject) => {
      db.query(
        sql,
        params,
        (err, results) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(results);
        }
      );
    }
  );
};

export const getDashboardSummary =
  async (req, res) => {
    try {
      const [
        vehicleResult,
        activeVehicleResult,
        driverResult,
        activeTripResult,
        completedTripResult,
        fuelResult,
        maintenanceResult,
        incidentResult,
        expenseResult,
        documentResult,
        recentTrips,
      ] = await Promise.all([
        /* TOTAL VEHICLES */

        runQuery(`
          SELECT COUNT(*) AS total
          FROM vehicles
        `),

        /* ACTIVE VEHICLES */

        runQuery(`
          SELECT COUNT(*) AS total
          FROM vehicles
          WHERE status = 'Active'
        `),

        /* TOTAL DRIVERS */

        runQuery(`
          SELECT COUNT(*) AS total
          FROM drivers
        `),

        /* ACTIVE TRIPS */

        runQuery(`
          SELECT COUNT(*) AS total
          FROM trips
          WHERE status = 'Active'
        `),

        /* COMPLETED TRIPS THIS MONTH */

        runQuery(`
          SELECT COUNT(*) AS total
          FROM trips
          WHERE status = 'Completed'
          AND YEAR(start_datetime) =
              YEAR(CURDATE())
          AND MONTH(start_datetime) =
              MONTH(CURDATE())
        `),

        /* FUEL COST THIS MONTH */

        runQuery(`
          SELECT
            COALESCE(
              SUM(amount),
              0
            ) AS total
          FROM fuel_records
          WHERE YEAR(fuel_date) =
              YEAR(CURDATE())
          AND MONTH(fuel_date) =
              MONTH(CURDATE())
        `),

        /*
          SMART MAINTENANCE DUE

          A vehicle is counted once if:

          1. It has Scheduled maintenance

          OR

          2. It has In Progress maintenance

          OR

          3. Its latest Completed
             maintenance has reached
             next_service_date

          OR

          4. Current vehicle odometer
             has reached/exceeded
             next_service_odometer
        */

    runQuery(`
  SELECT
    COUNT(
      DISTINCT mr.vehicle_id
    ) AS total

  FROM maintenance_records mr

  INNER JOIN vehicles v
    ON v.id = mr.vehicle_id

  WHERE
    mr.status = 'Completed'

    AND mr.id = (
      SELECT
        mr2.id

      FROM maintenance_records mr2

      WHERE
        mr2.vehicle_id =
          mr.vehicle_id

        AND LOWER(
          TRIM(
            mr2.service_type
          )
        ) =
        LOWER(
          TRIM(
            mr.service_type
          )
        )

        AND
        mr2.status =
          'Completed'

      ORDER BY
        mr2.maintenance_date DESC,
        mr2.id DESC

      LIMIT 1
    )

    AND
    (
      CASE
        WHEN
          mr.next_service_odometer
          IS NOT NULL
        THEN
          mr.next_service_odometer

        WHEN
          LOWER(
            TRIM(
              mr.service_type
            )
          ) = 'oil change'
        THEN
          mr.odometer + 5000

        ELSE NULL
      END
    ) IS NOT NULL

    AND
    v.odometer >=
    (
      (
        CASE
          WHEN
            mr.next_service_odometer
            IS NOT NULL
          THEN
            mr.next_service_odometer

          WHEN
            LOWER(
              TRIM(
                mr.service_type
              )
            ) = 'oil change'
          THEN
            mr.odometer + 5000

          ELSE NULL
        END
      ) - 500
    )
`),

        /* OPEN INCIDENTS */

        runQuery(`
          SELECT COUNT(*) AS total
          FROM incidents
          WHERE status IN (
            'Open',
            'In Progress'
          )
        `),

        /* EXPENSES THIS MONTH */

        runQuery(`
          SELECT
            COALESCE(
              SUM(amount),
              0
            ) AS total
          FROM expenses
          WHERE YEAR(expense_date) =
              YEAR(CURDATE())
          AND MONTH(expense_date) =
              MONTH(CURDATE())
        `),

        /* EXPIRING DOCUMENTS */

        runQuery(`
          SELECT COUNT(*) AS total
          FROM vehicle_documents

          WHERE expiry_date
            >= CURDATE()

          AND expiry_date
            <= DATE_ADD(
              CURDATE(),
              INTERVAL 30 DAY
            )
        `),

        /* RECENT TRIPS */

        runQuery(`
          SELECT
            t.id,
            t.start_datetime,
            t.from_location,
            t.destination,
            t.distance,
            t.status,

            v.registration_no,
            v.vehicle_name,

            d.driver_name

          FROM trips t

          INNER JOIN vehicles v
            ON t.vehicle_id = v.id

          LEFT JOIN drivers d
            ON t.driver_id = d.id

          ORDER BY
            t.start_datetime DESC

          LIMIT 5
        `),
      ]);

      return res.json({
        summary: {
          totalVehicles:
            Number(
              vehicleResult[0]
                ?.total || 0
            ),

          activeVehicles:
            Number(
              activeVehicleResult[0]
                ?.total || 0
            ),

          totalDrivers:
            Number(
              driverResult[0]
                ?.total || 0
            ),

          activeTrips:
            Number(
              activeTripResult[0]
                ?.total || 0
            ),

          completedTripsThisMonth:
            Number(
              completedTripResult[0]
                ?.total || 0
            ),

          fuelCostThisMonth:
            Number(
              fuelResult[0]
                ?.total || 0
            ),

          maintenanceDue:
            Number(
              maintenanceResult[0]
                ?.total || 0
            ),

          openIncidents:
            Number(
              incidentResult[0]
                ?.total || 0
            ),

          expensesThisMonth:
            Number(
              expenseResult[0]
                ?.total || 0
            ),

          expiringDocuments:
            Number(
              documentResult[0]
                ?.total || 0
            ),
        },

        recentTrips,
      });
    } catch (err) {
      console.error(
        "Dashboard summary error:",
        err
      );

      return res.status(500).json({
        message:
          "Unable to load dashboard data",
      });
    }
  };