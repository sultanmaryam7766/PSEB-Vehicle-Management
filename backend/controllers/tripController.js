import db from "../db.js";

/* =========================
   AUDIT LOG
========================= */

const addTripAuditLog = (
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
          "Trip audit actor error:",
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
          "Trips",
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
              "Trip audit error:",
              auditErr
            );
          }
        }
      );
    }
  );
};

/* =========================
   GET ALL TRIPS
========================= */

export const getTrips = (
  req,
  res
) => {
  const sql = `
    SELECT
      t.id,
      t.vehicle_id,
      t.driver_id,
      t.employee_department,
      t.purpose,
      t.from_location,
      t.destination,
      t.start_datetime,
      t.end_datetime,
      t.start_odometer,
      t.end_odometer,
      t.distance,
      t.status,
      t.created_at,

      v.registration_no,
      v.vehicle_name,

      d.driver_code,
      d.driver_name

    FROM trips t

    INNER JOIN vehicles v
      ON t.vehicle_id = v.id

    INNER JOIN drivers d
      ON t.driver_id = d.id

    ORDER BY t.id DESC
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
          "Load trips error:",
          err
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to load trips",
          });
      }

      return res.json({
        trips:
          results,
      });
    }
  );
};

/* =========================
   GET ONE TRIP
========================= */

export const getTripById = (
  req,
  res
) => {
  const {
    id,
  } =
    req.params;

  const sql = `
    SELECT
      t.*,

      v.registration_no,
      v.vehicle_name,

      d.driver_code,
      d.driver_name

    FROM trips t

    INNER JOIN vehicles v
      ON t.vehicle_id = v.id

    INNER JOIN drivers d
      ON t.driver_id = d.id

    WHERE t.id = ?

    LIMIT 1
  `;

  db.query(
    sql,
    [
      id,
    ],
    (
      err,
      results
    ) => {
      if (
        err
      ) {
        console.error(
          "Trip load error:",
          err
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to load trip",
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
              "Trip not found",
          });
      }

      return res.json({
        trip:
          results[0],
      });
    }
  );
};

/* =========================
   CREATE TRIP
========================= */

export const createTrip = (
  req,
  res
) => {
  const {
    vehicleId,
    driverId,
    employeeDepartment,
    purpose,
    fromLocation,
    destination,
    startDateTime,
    startOdometer,
  } =
    req.body;

  if (
    !vehicleId ||
    !driverId ||
    !employeeDepartment ||
    !purpose ||
    !fromLocation ||
    !destination ||
    !startDateTime ||
    startOdometer === "" ||
    startOdometer === null ||
    startOdometer === undefined
  ) {
    return res
      .status(400)
      .json({
        message:
          "All trip fields are required",
      });
  }

  const finalOdometer =
    Number(
      startOdometer
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
          "Invalid start odometer",
      });
  }

  const vehicleSql = `
    SELECT
      id,
      registration_no,
      vehicle_name,
      odometer,
      status

    FROM vehicles

    WHERE id = ?

    LIMIT 1
  `;

  db.query(
    vehicleSql,
    [
      vehicleId,
    ],
    (
      vehicleErr,
      vehicleResults
    ) => {
      if (
        vehicleErr
      ) {
        console.error(
          "Vehicle lookup error:",
          vehicleErr
        );

        return res
          .status(500)
          .json({
            message:
              "Server error",
          });
      }

      if (
        vehicleResults.length ===
        0
      ) {
        return res
          .status(404)
          .json({
            message:
              "Vehicle not found",
          });
      }

      const vehicle =
        vehicleResults[0];

      if (
        vehicle.status !==
        "Active"
      ) {
        return res
          .status(400)
          .json({
            message:
              "Selected vehicle is inactive",
          });
      }

      /*
        Prevent creating a trip with
        an odometer lower than the
        vehicle's current odometer.
      */

      if (
        finalOdometer <
        Number(
          vehicle.odometer ||
            0
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              `Start odometer cannot be less than current vehicle odometer (${vehicle.odometer || 0})`,
          });
      }

      const driverSql = `
        SELECT
          id,
          driver_code,
          driver_name,
          status

        FROM drivers

        WHERE id = ?

        LIMIT 1
      `;

      db.query(
        driverSql,
        [
          driverId,
        ],
        (
          driverErr,
          driverResults
        ) => {
          if (
            driverErr
          ) {
            console.error(
              "Driver lookup error:",
              driverErr
            );

            return res
              .status(500)
              .json({
                message:
                  "Server error",
              });
          }

          if (
            driverResults.length ===
            0
          ) {
            return res
              .status(404)
              .json({
                message:
                  "Driver not found",
              });
          }

          const driver =
            driverResults[0];

          if (
            driver.status !==
            "Active"
          ) {
            return res
              .status(400)
              .json({
                message:
                  "Selected driver is inactive",
              });
          }

          /*
            No permanent vehicle-driver
            assignment exists.

            We only prevent the same
            vehicle OR same driver from
            being used in two ACTIVE
            trips at the same time.
          */

          const activeTripSql = `
            SELECT
              id,
              vehicle_id,
              driver_id

            FROM trips

            WHERE status = 'Active'

            AND
            (
              vehicle_id = ?
              OR driver_id = ?
            )

            LIMIT 1
          `;

          db.query(
            activeTripSql,
            [
              vehicleId,
              driverId,
            ],
            (
              activeErr,
              activeResults
            ) => {
              if (
                activeErr
              ) {
                console.error(
                  "Active trip check error:",
                  activeErr
                );

                return res
                  .status(500)
                  .json({
                    message:
                      "Server error",
                  });
              }

              if (
                activeResults.length >
                0
              ) {
                const activeTrip =
                  activeResults[0];

                if (
                  Number(
                    activeTrip.vehicle_id
                  ) ===
                  Number(
                    vehicleId
                  )
                ) {
                  return res
                    .status(409)
                    .json({
                      message:
                        "Selected vehicle already has an active trip",
                    });
                }

                if (
                  Number(
                    activeTrip.driver_id
                  ) ===
                  Number(
                    driverId
                  )
                ) {
                  return res
                    .status(409)
                    .json({
                      message:
                        "Selected driver already has an active trip",
                    });
                }

                return res
                  .status(409)
                  .json({
                    message:
                      "Selected vehicle or driver already has an active trip",
                  });
              }

              const insertSql = `
                INSERT INTO trips
                (
                  vehicle_id,
                  driver_id,
                  employee_department,
                  purpose,
                  from_location,
                  destination,
                  start_datetime,
                  start_odometer,
                  status,
                  created_by
                )

                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?)
              `;

              db.query(
                insertSql,
                [
                  vehicleId,
                  driverId,
                  employeeDepartment,
                  purpose,
                  fromLocation,
                  destination,
                  startDateTime,
                  finalOdometer,
                  req.user.id,
                ],
                (
                  insertErr,
                  result
                ) => {
                  if (
                    insertErr
                  ) {
                    console.error(
                      "Create trip error:",
                      insertErr
                    );

                    return res
                      .status(500)
                      .json({
                        message:
                          "Unable to create trip",
                      });
                  }

                  const tripName =
                    `Trip #${result.insertId}`;

                  addTripAuditLog(
                    req.user.id,
                    "Created trip",
                    result.insertId,
                    tripName
                  );

                  return res
                    .status(201)
                    .json({
                      message:
                        "Trip created successfully",

                      trip: {
                        id:
                          result.insertId,

                        vehicle_id:
                          Number(
                            vehicleId
                          ),

                        registration_no:
                          vehicle.registration_no,

                        vehicle_name:
                          vehicle.vehicle_name,

                        driver_id:
                          Number(
                            driverId
                          ),

                        driver_name:
                          driver.driver_name,

                        start_odometer:
                          finalOdometer,

                        status:
                          "Active",
                      },
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

/* =========================
   COMPLETE TRIP
========================= */

export const completeTrip = (
  req,
  res
) => {
  const {
    id,
  } =
    req.params;

  const {
    endOdometer,
    endDateTime,
  } =
    req.body;

  if (
    endOdometer === "" ||
    endOdometer === null ||
    endOdometer === undefined ||
    !endDateTime
  ) {
    return res
      .status(400)
      .json({
        message:
          "End odometer and end date/time are required",
      });
  }

  const finalEndOdometer =
    Number(
      endOdometer
    );

  if (
    Number.isNaN(
      finalEndOdometer
    ) ||
    finalEndOdometer <
      0
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid end odometer",
      });
  }

  const findSql = `
    SELECT
      t.id,
      t.vehicle_id,
      t.driver_id,
      t.start_odometer,
      t.start_datetime,
      t.status,

      v.registration_no,
      v.vehicle_name,

      d.driver_name

    FROM trips t

    INNER JOIN vehicles v
      ON t.vehicle_id = v.id

    INNER JOIN drivers d
      ON t.driver_id = d.id

    WHERE t.id = ?

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
          "Find trip error:",
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
        results.length ===
        0
      ) {
        return res
          .status(404)
          .json({
            message:
              "Trip not found",
          });
      }

      const trip =
        results[0];

      if (
        trip.status ===
        "Completed"
      ) {
        return res
          .status(400)
          .json({
            message:
              "Trip is already completed",
          });
      }

      if (
        finalEndOdometer <
        Number(
          trip.start_odometer
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "End odometer cannot be less than start odometer",
          });
      }

      const distance =
        finalEndOdometer -
        Number(
          trip.start_odometer
        );

      db.beginTransaction(
        (
          transactionErr
        ) => {
          if (
            transactionErr
          ) {
            console.error(
              "Transaction start error:",
              transactionErr
            );

            return res
              .status(500)
              .json({
                message:
                  "Unable to complete trip",
              });
          }

          const tripSql = `
            UPDATE trips

            SET
              end_datetime = ?,
              end_odometer = ?,
              distance = ?,
              status = 'Completed'

            WHERE id = ?
              AND status = 'Active'
          `;

          db.query(
            tripSql,
            [
              endDateTime,
              finalEndOdometer,
              distance,
              id,
            ],
            (
              tripErr,
              tripResult
            ) => {
              if (
                tripErr
              ) {
                return db.rollback(
                  () => {
                    console.error(
                      "Complete trip error:",
                      tripErr
                    );

                    res
                      .status(500)
                      .json({
                        message:
                          "Unable to complete trip",
                      });
                  }
                );
              }

              if (
                tripResult.affectedRows ===
                0
              ) {
                return db.rollback(
                  () => {
                    res
                      .status(400)
                      .json({
                        message:
                          "Trip could not be completed",
                      });
                  }
                );
              }

              const vehicleSql = `
                UPDATE vehicles
                SET odometer = ?
                WHERE id = ?
              `;

              db.query(
                vehicleSql,
                [
                  finalEndOdometer,
                  trip.vehicle_id,
                ],
                (
                  vehicleErr
                ) => {
                  if (
                    vehicleErr
                  ) {
                    return db.rollback(
                      () => {
                        console.error(
                          "Vehicle odometer update error:",
                          vehicleErr
                        );

                        res
                          .status(500)
                          .json({
                            message:
                              "Unable to update vehicle odometer",
                          });
                      }
                    );
                  }

                  db.commit(
                    (
                      commitErr
                    ) => {
                      if (
                        commitErr
                      ) {
                        return db.rollback(
                          () => {
                            console.error(
                              "Commit trip error:",
                              commitErr
                            );

                            res
                              .status(500)
                              .json({
                                message:
                                  "Unable to complete trip",
                              });
                          }
                        );
                      }

                      addTripAuditLog(
                        req.user.id,
                        "Completed trip",
                        id,
                        `Trip #${id}`
                      );

                      return res.json({
                        message:
                          "Trip completed successfully",

                        trip: {
                          id:
                            Number(
                              id
                            ),

                          registration_no:
                            trip.registration_no,

                          vehicle_name:
                            trip.vehicle_name,

                          driver_name:
                            trip.driver_name,

                          start_odometer:
                            Number(
                              trip.start_odometer
                            ),

                          end_odometer:
                            finalEndOdometer,

                          distance,

                          status:
                            "Completed",
                        },
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};

/* =========================
   DELETE TRIP
   ADMINISTRATOR ONLY
========================= */

export const deleteTrip = (
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
          "Invalid trip ID",
      });
  }

  /*
    Read the trip before deletion.

    We need:
    - vehicle ID
    - current status
    - start odometer
    - vehicle / driver names
    - Audit Log information
  */

  const findSql = `
    SELECT
      t.id,
      t.vehicle_id,
      t.driver_id,
      t.employee_department,
      t.purpose,
      t.from_location,
      t.destination,
      t.start_datetime,
      t.end_datetime,
      t.start_odometer,
      t.end_odometer,
      t.distance,
      t.status,

      v.registration_no,
      v.vehicle_name,

      d.driver_code,
      d.driver_name

    FROM trips t

    LEFT JOIN vehicles v
      ON t.vehicle_id = v.id

    LEFT JOIN drivers d
      ON t.driver_id = d.id

    WHERE t.id = ?

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
          "Find trip before delete error:",
          findErr
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to delete trip",
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
              "Trip not found",
          });
      }

      const trip =
        findResults[0];

      db.beginTransaction(
        (
          transactionErr
        ) => {
          if (
            transactionErr
          ) {
            console.error(
              "Delete trip transaction start error:",
              transactionErr
            );

            return res
              .status(500)
              .json({
                message:
                  "Unable to delete trip",
              });
          }

          /*
            Fuel records must remain.

            Only remove the link between
            those fuel records and this trip.
          */

          const unlinkFuelSql = `
            UPDATE fuel_records

            SET trip_id = NULL

            WHERE trip_id = ?
          `;

          db.query(
            unlinkFuelSql,
            [
              id,
            ],
            (
              fuelErr,
              fuelResult
            ) => {
              if (
                fuelErr
              ) {
                return db.rollback(
                  () => {
                    console.error(
                      "Unlink trip fuel error:",
                      fuelErr
                    );

                    res
                      .status(500)
                      .json({
                        message:
                          "Unable to update linked fuel records",
                      });
                  }
                );
              }

              const linkedFuelCount =
                fuelResult.affectedRows ||
                0;

              const deleteSql = `
                DELETE FROM trips
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
                    return db.rollback(
                      () => {
                        console.error(
                          "Delete trip error:",
                          deleteErr
                        );

                        res
                          .status(500)
                          .json({
                            message:
                              "Unable to delete trip",
                          });
                      }
                    );
                  }

                  if (
                    deleteResult.affectedRows ===
                    0
                  ) {
                    return db.rollback(
                      () => {
                        res
                          .status(404)
                          .json({
                            message:
                              "Trip not found",
                          });
                      }
                    );
                  }

                  /*
                    Active / Planned trip:

                    It never changed the vehicle
                    odometer, so nothing else
                    needs recalculation.
                  */

                  if (
                    trip.status !==
                    "Completed"
                  ) {
                    return db.commit(
                      (
                        commitErr
                      ) => {
                        if (
                          commitErr
                        ) {
                          return db.rollback(
                            () => {
                              console.error(
                                "Delete trip commit error:",
                                commitErr
                              );

                              res
                                .status(500)
                                .json({
                                  message:
                                    "Unable to delete trip",
                                });
                            }
                          );
                        }

                        const tripId =
                          `TRIP-${String(
                            trip.id
                          ).padStart(
                            5,
                            "0"
                          )}`;

                        const recordName =
                          `${tripId} - ${trip.registration_no || "Unknown Vehicle"} - ${trip.driver_name || "Unknown Driver"}`;

                        addTripAuditLog(
                          req.user.id,
                          "Deleted trip",
                          trip.id,
                          recordName
                        );

                        return res.json({
                          message:
                            "Trip deleted successfully",

                          linkedFuelRecords:
                            linkedFuelCount,

                          vehicleOdometerUpdated:
                            false,
                        });
                      }
                    );
                  }

                  /*
                    COMPLETED TRIP:

                    Find the latest remaining
                    Completed trip of this vehicle.

                    If one exists:
                    vehicle odometer becomes that
                    remaining trip's end odometer.

                    If none exists:
                    restore odometer to the deleted
                    trip's start odometer.
                  */

                  const latestCompletedSql = `
                    SELECT
                      id,
                      end_odometer,
                      end_datetime

                    FROM trips

                    WHERE vehicle_id = ?
                      AND status = 'Completed'
                      AND end_odometer IS NOT NULL

                    ORDER BY
                      end_datetime DESC,
                      id DESC

                    LIMIT 1
                  `;

                  db.query(
                    latestCompletedSql,
                    [
                      trip.vehicle_id,
                    ],
                    (
                      latestErr,
                      latestResults
                    ) => {
                      if (
                        latestErr
                      ) {
                        return db.rollback(
                          () => {
                            console.error(
                              "Latest completed trip lookup error:",
                              latestErr
                            );

                            res
                              .status(500)
                              .json({
                                message:
                                  "Unable to recalculate vehicle odometer",
                              });
                          }
                        );
                      }

                      const recalculatedOdometer =
                        latestResults.length >
                        0
                          ? Number(
                              latestResults[0]
                                .end_odometer
                            )
                          : Number(
                              trip.start_odometer ||
                                0
                            );

                      const vehicleSql = `
                        UPDATE vehicles

                        SET odometer = ?

                        WHERE id = ?
                      `;

                      db.query(
                        vehicleSql,
                        [
                          recalculatedOdometer,
                          trip.vehicle_id,
                        ],
                        (
                          vehicleErr
                        ) => {
                          if (
                            vehicleErr
                          ) {
                            return db.rollback(
                              () => {
                                console.error(
                                  "Vehicle odometer recalculation error:",
                                  vehicleErr
                                );

                                res
                                  .status(500)
                                  .json({
                                    message:
                                      "Unable to update vehicle odometer",
                                  });
                              }
                            );
                          }

                          db.commit(
                            (
                              commitErr
                            ) => {
                              if (
                                commitErr
                              ) {
                                return db.rollback(
                                  () => {
                                    console.error(
                                      "Delete completed trip commit error:",
                                      commitErr
                                    );

                                    res
                                      .status(500)
                                      .json({
                                        message:
                                          "Unable to delete trip",
                                      });
                                  }
                                );
                              }

                              const tripId =
                                `TRIP-${String(
                                  trip.id
                                ).padStart(
                                  5,
                                  "0"
                                )}`;

                              const recordName =
                                `${tripId} - ${trip.registration_no || "Unknown Vehicle"} - ${trip.driver_name || "Unknown Driver"}`;

                              addTripAuditLog(
                                req.user.id,
                                "Deleted completed trip",
                                trip.id,
                                recordName
                              );

                              return res.json({
                                message:
                                  "Completed trip deleted successfully",

                                linkedFuelRecords:
                                  linkedFuelCount,

                                vehicleOdometerUpdated:
                                  true,

                                vehicleOdometer:
                                  recalculatedOdometer,
                              });
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};