import db from "../db.js";

const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(results);
    });
  });
};

export const getVehicleReport = async (req, res) => {
  try {
    const {
      fromDate,
      toDate,
      vehicleId,
    } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        message:
          "From date and to date are required",
      });
    }

    const vehicleCondition =
      vehicleId
        ? " AND vehicle_id = ? "
        : "";

    const vehicleParams =
      vehicleId
        ? [vehicleId]
        : [];

    /* TRIPS */

    const trips = await runQuery(
      `
      SELECT
        t.id,
        t.vehicle_id,
        t.driver_id,
        t.start_datetime,
        t.end_datetime,
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

      WHERE DATE(t.start_datetime)
        BETWEEN ? AND ?

      ${
        vehicleId
          ? "AND t.vehicle_id = ?"
          : ""
      }

      ORDER BY
        t.start_datetime DESC
      `,
      [
        fromDate,
        toDate,
        ...vehicleParams,
      ]
    );

    /* FUEL */

    const fuel = await runQuery(
      `
      SELECT
        f.id,
        f.vehicle_id,
        f.fuel_date,
        f.liters,
        f.amount,
        f.odometer,
        f.station_vendor,

        v.registration_no,
        v.vehicle_name

      FROM fuel_records f

      INNER JOIN vehicles v
        ON f.vehicle_id = v.id

      WHERE f.fuel_date
        BETWEEN ? AND ?

      ${
        vehicleId
          ? "AND f.vehicle_id = ?"
          : ""
      }

      ORDER BY
        f.fuel_date DESC
      `,
      [
        fromDate,
        toDate,
        ...vehicleParams,
      ]
    );

    /* MAINTENANCE */

    const maintenance =
      await runQuery(
        `
        SELECT
          m.id,
          m.vehicle_id,
          m.maintenance_date,
          m.service_type,
          m.vendor,
          m.cost,
          m.status,

          v.registration_no,
          v.vehicle_name

        FROM maintenance_records m

        INNER JOIN vehicles v
          ON m.vehicle_id = v.id

        WHERE m.maintenance_date
          BETWEEN ? AND ?

        ${
          vehicleId
            ? "AND m.vehicle_id = ?"
            : ""
        }

        ORDER BY
          m.maintenance_date DESC
        `,
        [
          fromDate,
          toDate,
          ...vehicleParams,
        ]
      );

    /* INCIDENTS */

    const incidents =
      await runQuery(
        `
        SELECT
          i.id,
          i.vehicle_id,
          i.incident_date,
          i.incident_type,
          i.location,
          i.estimated_cost,
          i.actual_cost,
          i.status,

          v.registration_no,
          v.vehicle_name

        FROM incidents i

        INNER JOIN vehicles v
          ON i.vehicle_id = v.id

        WHERE i.incident_date
          BETWEEN ? AND ?

        ${
          vehicleId
            ? "AND i.vehicle_id = ?"
            : ""
        }

        ORDER BY
          i.incident_date DESC
        `,
        [
          fromDate,
          toDate,
          ...vehicleParams,
        ]
      );

    /* EXPENSES */

    const expenses =
      await runQuery(
        `
        SELECT
          e.id,
          e.vehicle_id,
          e.expense_date,
          e.category,
          e.description,
          e.amount,
          e.vendor,

          v.registration_no,
          v.vehicle_name

        FROM expenses e

        INNER JOIN vehicles v
          ON e.vehicle_id = v.id

        WHERE e.expense_date
          BETWEEN ? AND ?

        ${
          vehicleId
            ? "AND e.vehicle_id = ?"
            : ""
        }

        ORDER BY
          e.expense_date DESC
        `,
        [
          fromDate,
          toDate,
          ...vehicleParams,
        ]
      );

    /* VEHICLES */

    const vehicles = await runQuery(
      `
      SELECT
        id,
        registration_no,
        vehicle_name,
        location,
        odometer,
        status

      FROM vehicles

      ${
        vehicleId
          ? "WHERE id = ?"
          : ""
      }

      ORDER BY registration_no
      `,
      vehicleParams
    );

    /* SUMMARY CALCULATIONS */

    const totalTrips =
      trips.length;

    const totalDistance =
      trips.reduce(
        (sum, trip) =>
          sum +
          Number(
            trip.distance || 0
          ),
        0
      );

    const totalFuelLiters =
      fuel.reduce(
        (sum, item) =>
          sum +
          Number(
            item.liters || 0
          ),
        0
      );

    const totalFuelCost =
      fuel.reduce(
        (sum, item) =>
          sum +
          Number(
            item.amount || 0
          ),
        0
      );

    const totalMaintenanceCost =
      maintenance.reduce(
        (sum, item) =>
          sum +
          Number(
            item.cost || 0
          ),
        0
      );

    const totalIncidentCost =
      incidents.reduce(
        (sum, item) => {
          const actual =
            Number(
              item.actual_cost || 0
            );

          const estimated =
            Number(
              item.estimated_cost || 0
            );

          return (
            sum +
            (actual > 0
              ? actual
              : estimated)
          );
        },
        0
      );

    /*
      Fuel aur Maintenance ki category
      expense table me bhi ho sakti hai.

      Double counting avoid karne ke liye
      Other Expenses me unko dobara
      include nahi kar rahe.
    */

    const otherExpenses =
      expenses.filter(
        (item) =>
          item.category !==
            "Fuel" &&
          item.category !==
            "Maintenance"
      );

    const totalOtherExpenses =
      otherExpenses.reduce(
        (sum, item) =>
          sum +
          Number(
            item.amount || 0
          ),
        0
      );

    const totalCost =
      totalFuelCost +
      totalMaintenanceCost +
      totalIncidentCost +
      totalOtherExpenses;

    const mileage =
      totalFuelLiters > 0
        ? totalDistance /
          totalFuelLiters
        : 0;

    return res.json({
      summary: {
        totalTrips,
        totalDistance,
        totalFuelLiters,
        totalFuelCost,
        mileage,
        totalMaintenanceCost,
        totalIncidents:
          incidents.length,
        totalIncidentCost,
        totalOtherExpenses,
        totalCost,
      },

      vehicles,
      trips,
      fuel,
      maintenance,
      incidents,
      expenses,
    });
  } catch (err) {
    console.error(
      "Report error:",
      err
    );

    return res.status(500).json({
      message:
        "Unable to generate report",
    });
  }
};