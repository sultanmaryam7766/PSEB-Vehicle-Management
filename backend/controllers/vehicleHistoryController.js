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

export const getVehicleHistory =
  async (req, res) => {
    try {
      const {
        vehicleId,
      } = req.params;

      const {
        fromDate,
        toDate,
      } = req.query;

      if (!vehicleId) {
        return res
          .status(400)
          .json({
            message:
              "Vehicle is required",
          });
      }

      if (
        !fromDate ||
        !toDate
      ) {
        return res
          .status(400)
          .json({
            message:
              "From date and to date are required",
          });
      }

      /* =========================
         VEHICLE
      ========================= */

      const vehicles =
        await runQuery(
          `
          SELECT
            id,
            registration_no,
            vehicle_name,
            location,
            odometer,
            status
          FROM vehicles
          WHERE id = ?
          LIMIT 1
          `,
          [
            vehicleId,
          ]
        );

      if (
        vehicles.length === 0
      ) {
        return res
          .status(404)
          .json({
            message:
              "Vehicle not found",
          });
      }

      const vehicle =
        vehicles[0];

      /* =========================
         TRIPS
      ========================= */

      const trips =
        await runQuery(
          `
          SELECT
            t.id,
            t.start_datetime,
            t.end_datetime,
            t.from_location,
            t.destination,
            t.distance,
            t.start_odometer,
            t.end_odometer,
            t.status,

            d.driver_name,
            d.driver_code

          FROM trips t

          LEFT JOIN drivers d
            ON t.driver_id = d.id

          WHERE
            t.vehicle_id = ?

            AND DATE(
              t.start_datetime
            )
            BETWEEN ? AND ?

          ORDER BY
            t.start_datetime DESC
          `,
          [
            vehicleId,
            fromDate,
            toDate,
          ]
        );

      /* =========================
         FUEL
         
         IMPORTANT:
         DATE(fuel_date) is used
         because fuel_date can contain
         date + time.
      ========================= */

      const fuel =
        await runQuery(
          `
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

            t.id AS linked_trip_id,

            d.driver_name,
            d.driver_code

          FROM fuel_records f

          LEFT JOIN trips t
            ON f.trip_id = t.id

          LEFT JOIN drivers d
            ON t.driver_id = d.id

          WHERE
            f.vehicle_id = ?

            AND DATE(
              f.fuel_date
            )
            BETWEEN ? AND ?

          ORDER BY
            f.fuel_date DESC,
            f.id DESC
          `,
          [
            vehicleId,
            fromDate,
            toDate,
          ]
        );

      /* =========================
         MAINTENANCE
      ========================= */

      const maintenance =
        await runQuery(
          `
          SELECT
            id,
            maintenance_date,
            service_type,
            vendor,
            odometer,
            cost,
            next_service_date,
            next_service_odometer,
            remarks,
            status

          FROM maintenance_records

          WHERE
            vehicle_id = ?

            AND DATE(
              maintenance_date
            )
            BETWEEN ? AND ?

          ORDER BY
            maintenance_date DESC,
            id DESC
          `,
          [
            vehicleId,
            fromDate,
            toDate,
          ]
        );

      /* =========================
         INCIDENTS
      ========================= */

      const incidents =
        await runQuery(
          `
          SELECT
            i.id,
            i.incident_date,
            i.location,
            i.incident_type,
            i.description,
            i.estimated_cost,
            i.actual_cost,
            i.status,

            d.driver_name,
            d.driver_code

          FROM incidents i

          LEFT JOIN drivers d
            ON i.driver_id = d.id

          WHERE
            i.vehicle_id = ?

            AND DATE(
              i.incident_date
            )
            BETWEEN ? AND ?

          ORDER BY
            i.incident_date DESC,
            i.id DESC
          `,
          [
            vehicleId,
            fromDate,
            toDate,
          ]
        );

      /* =========================
         EXPENSES
      ========================= */

      const expenses =
        await runQuery(
          `
          SELECT
            id,
            expense_date,
            category,
            description,
            amount,
            vendor,
            reference_no,
            remarks

          FROM expenses

          WHERE
            vehicle_id = ?

            AND DATE(
              expense_date
            )
            BETWEEN ? AND ?

          ORDER BY
            expense_date DESC,
            id DESC
          `,
          [
            vehicleId,
            fromDate,
            toDate,
          ]
        );

      /* =========================
         DOCUMENTS
      ========================= */

      const documents =
        await runQuery(
          `
          SELECT
            id,
            document_type,
            document_number,
            issue_date,
            expiry_date,
            document_reference,
            document_file,
            remarks

          FROM vehicle_documents

          WHERE
            vehicle_id = ?

            AND
            (
              DATE(
                issue_date
              )
              BETWEEN ? AND ?

              OR

              DATE(
                expiry_date
              )
              BETWEEN ? AND ?
            )

          ORDER BY
            expiry_date DESC,
            id DESC
          `,
          [
            vehicleId,

            fromDate,
            toDate,

            fromDate,
            toDate,
          ]
        );

      /* =========================
         SUMMARY
      ========================= */

      const totalTrips =
        trips.length;

      const totalDistance =
        trips.reduce(
          (
            sum,
            item
          ) =>
            sum +
            Number(
              item.distance ||
                0
            ),
          0
        );

      const totalFuel =
        fuel.reduce(
          (
            sum,
            item
          ) =>
            sum +
            Number(
              item.liters ||
                0
            ),
          0
        );

      const totalFuelCost =
        fuel.reduce(
          (
            sum,
            item
          ) =>
            sum +
            Number(
              item.amount ||
                0
            ),
          0
        );

      const maintenanceCost =
        maintenance.reduce(
          (
            sum,
            item
          ) =>
            sum +
            Number(
              item.cost ||
                0
            ),
          0
        );

      const incidentCost =
        incidents.reduce(
          (
            sum,
            item
          ) => {
            const actual =
              Number(
                item.actual_cost ||
                  0
              );

            const estimated =
              Number(
                item.estimated_cost ||
                  0
              );

            return (
              sum +
              (
                actual > 0
                  ? actual
                  : estimated
              )
            );
          },
          0
        );

      /*
        Do not double-count Fuel
        and Maintenance expenses
        because they already have
        their own modules.
      */

      const otherExpenses =
        expenses.filter(
          (item) =>
            item.category !==
              "Fuel" &&
            item.category !==
              "Maintenance"
        );

      const otherExpenseCost =
        otherExpenses.reduce(
          (
            sum,
            item
          ) =>
            sum +
            Number(
              item.amount ||
                0
            ),
          0
        );

      const totalCost =
        totalFuelCost +
        maintenanceCost +
        incidentCost +
        otherExpenseCost;

      const mileage =
        totalFuel > 0
          ? totalDistance /
            totalFuel
          : 0;

      /* =========================
         HISTORY RECORDS
      ========================= */

      const records = [];

      /* TRIPS */

      trips.forEach(
        (item) => {
          records.push({
            id:
              `trip-${item.id}`,

            date:
              item.start_datetime,

            type:
              "Trips",

            driverRef:
              item.driver_name ||
              item.driver_code ||
              "--",

            details:
              `${item.from_location || "--"} → ${item.destination || "--"}`,

            odometerCost:
              item.end_odometer !==
                null &&
              item.end_odometer !==
                undefined
                ? `${Number(
                    item.end_odometer
                  ).toLocaleString()} km`
                : `${Number(
                    item.distance ||
                      0
                  ).toLocaleString()} km`,
          });
        }
      );

      /* FUEL */

      fuel.forEach(
        (item) => {
          const tripRef =
            item.linked_trip_id
              ? `TRIP-${String(
                  item.linked_trip_id
                ).padStart(
                  5,
                  "0"
                )}`
              : null;

          records.push({
            id:
              `fuel-${item.id}`,

            date:
              item.fuel_date,

            type:
              "Fuel",

            driverRef:
              item.driver_name ||
              tripRef ||
              item.station_vendor ||
              "--",

            details:
              `${Number(
                item.liters ||
                  0
              ).toLocaleString()} L${
                item.station_vendor
                  ? ` - ${item.station_vendor}`
                  : ""
              }`,

            odometerCost:
              `Rs. ${Number(
                item.amount ||
                  0
              ).toLocaleString()}${
                item.odometer !==
                  null &&
                item.odometer !==
                  undefined
                  ? ` | ${Number(
                      item.odometer
                    ).toLocaleString()} km`
                  : ""
              }`,
          });
        }
      );

      /* MAINTENANCE */

      maintenance.forEach(
        (item) => {
          records.push({
            id:
              `maintenance-${item.id}`,

            date:
              item.maintenance_date,

            type:
              "Maintenance",

            driverRef:
              item.vendor ||
              "--",

            details:
              item.service_type ||
              "--",

            odometerCost:
              `Rs. ${Number(
                item.cost ||
                  0
              ).toLocaleString()}${
                item.odometer !==
                  null &&
                item.odometer !==
                  undefined
                  ? ` | ${Number(
                      item.odometer
                    ).toLocaleString()} km`
                  : ""
              }`,
          });
        }
      );

      /* INCIDENTS */

      incidents.forEach(
        (item) => {
          const cost =
            Number(
              item.actual_cost ||
                0
            ) > 0
              ? Number(
                  item.actual_cost
                )
              : Number(
                  item.estimated_cost ||
                    0
                );

          records.push({
            id:
              `incident-${item.id}`,

            date:
              item.incident_date,

            type:
              "Incidents",

            driverRef:
              item.driver_name ||
              item.driver_code ||
              "--",

            details:
              `${item.incident_type || "Incident"}${
                item.location
                  ? ` - ${item.location}`
                  : ""
              }`,

            odometerCost:
              `Rs. ${cost.toLocaleString()}`,
          });
        }
      );

      /* EXPENSES */

      expenses.forEach(
        (item) => {
          records.push({
            id:
              `expense-${item.id}`,

            date:
              item.expense_date,

            type:
              "Expenses",

            driverRef:
              item.reference_no ||
              item.vendor ||
              "--",

            details:
              `${item.category}${
                item.description
                  ? ` - ${item.description}`
                  : ""
              }`,

            odometerCost:
              `Rs. ${Number(
                item.amount ||
                  0
              ).toLocaleString()}`,
          });
        }
      );

      /* DOCUMENTS */

      documents.forEach(
        (item) => {
          records.push({
            id:
              `document-${item.id}`,

            date:
              item.issue_date ||
              item.expiry_date,

            type:
              "Documents",

            driverRef:
              item.document_number ||
              "--",

            details:
              `${item.document_type}${
                item.expiry_date
                  ? ` - Expiry: ${String(
                      item.expiry_date
                    ).slice(
                      0,
                      10
                    )}`
                  : ""
              }`,

            odometerCost:
              "--",
          });
        }
      );

      /* =========================
         SORT NEWEST FIRST
      ========================= */

      records.sort(
        (
          a,
          b
        ) =>
          new Date(
            b.date
          ) -
          new Date(
            a.date
          )
      );

      return res.json({
        vehicle,

        summary: {
          trips:
            totalTrips,

          distance:
            totalDistance,

          fuel:
            totalFuel,

          fuelCost:
            totalFuelCost,

          mileage,

          maintenanceCost,

          incidentCost,

          otherExpenseCost,

          totalCost,
        },

        records,
      });
    } catch (err) {
      console.error(
        "Vehicle history error:",
        err
      );

      return res
        .status(500)
        .json({
          message:
            "Unable to load vehicle history",
        });
    }
  };