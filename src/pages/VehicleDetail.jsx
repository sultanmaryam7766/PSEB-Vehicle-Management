import {
  useEffect,
  useMemo,
  useState,
} from "react";
import NotificationBell from "../components/NotificationBell";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./VehicleDetail.css";

function VehicleDetail() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const role = user?.role;

  const token =
    localStorage.getItem("token");

  const params =
    new URLSearchParams(
      location.search
    );

  const urlVehicleId =
    params.get("id") || "";

  const [vehicles, setVehicles] =
    useState([]);

  const [drivers, setDrivers] =
    useState([]);

  const [trips, setTrips] =
    useState([]);

  const [fuel, setFuel] =
    useState([]);

  const [
    maintenance,
    setMaintenance,
  ] = useState([]);

  const [documents, setDocuments] =
    useState([]);

  const [incidents, setIncidents] =
    useState([]);

  const [expenses, setExpenses] =
    useState([]);

  const [
    selectedVehicleId,
    setSelectedVehicleId,
  ] = useState(urlVehicleId);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const menuItems = [
    { name: "Dashboard" },

    {
      name: "Vehicles",
      path: "/vehicles",
    },

    {
      name: "Vehicle History",
      path: "/vehicle-history",
    },

    {
      name: "Drivers",
      path: "/drivers",
    },

    {
      name: "Trips",
      path: "/trips",
    },

    {
      name: "Fuel",
      path: "/fuel",
    },

    {
      name: "Maintenance",
      path: "/maintenance",
    },

    {
      name: "Documents",
      path: "/documents",
    },

    {
      name: "Incidents",
      path: "/incidents",
    },

    {
      name: "Expenses",
      path: "/expenses",
    },

    {
      name: "Reports",
      path: "/reports",
    },
  ];

  if (
    role === "Administrator"
  ) {
    menuItems.push(
      {
        name: "Users & Roles",
        path: "/users-roles",
      },

      {
        name: "Audit Log",
        path: "/audit-log",
      }
    );
  }

  const handleDashboard = () => {
    if (
      role === "Administrator"
    ) {
      navigate(
        "/admin-dashboard"
      );
    } else if (
      role === "Operator"
    ) {
      navigate(
        "/operator-dashboard"
      );
    } else {
      navigate(
        "/viewer-dashboard"
      );
    }
  };

  const handleMenuClick = (
    item
  ) => {
    if (
      item.name === "Dashboard"
    ) {
      handleDashboard();
      return;
    }

    navigate(item.path);
  };

  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    navigate("/");
  };

  const getArray = (
    data,
    key
  ) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (
      Array.isArray(data?.[key])
    ) {
      return data[key];
    }

    return [];
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const loadAllData =
      async () => {
        setLoading(true);
        setError("");

        try {
          const headers = {
            Authorization:
              `Bearer ${token}`,
          };

          const responses =
            await Promise.all([
              fetch(
                "http://localhost:5000/api/vehicles",
                { headers }
              ),

              fetch(
                "http://localhost:5000/api/drivers",
                { headers }
              ),

              fetch(
                "http://localhost:5000/api/trips",
                { headers }
              ),

              fetch(
                "http://localhost:5000/api/fuel",
                { headers }
              ),

              fetch(
                "http://localhost:5000/api/maintenance",
                { headers }
              ),

              fetch(
                "http://localhost:5000/api/documents",
                { headers }
              ),

              fetch(
                "http://localhost:5000/api/incidents",
                { headers }
              ),

              fetch(
                "http://localhost:5000/api/expenses",
                { headers }
              ),
            ]);

          const unauthorized =
            responses.some(
              (response) =>
                response.status ===
                401
            );

          if (unauthorized) {
            localStorage.removeItem(
              "token"
            );

            localStorage.removeItem(
              "user"
            );

            navigate("/");
            return;
          }

          const [
            vehicleData,
            driverData,
            tripData,
            fuelData,
            maintenanceData,
            documentData,
            incidentData,
            expenseData,
          ] = await Promise.all(
            responses.map(
              (response) =>
                response.json()
            )
          );

          const vehicleList =
            getArray(
              vehicleData,
              "vehicles"
            );

          setVehicles(
            vehicleList
          );

          setDrivers(
            getArray(
              driverData,
              "drivers"
            )
          );

          setTrips(
            getArray(
              tripData,
              "trips"
            )
          );

          setFuel(
            getArray(
              fuelData,
              "fuel"
            ).length
              ? getArray(
                  fuelData,
                  "fuel"
                )
              : getArray(
                  fuelData,
                  "fuelRecords"
                )
          );

          setMaintenance(
            getArray(
              maintenanceData,
              "maintenance"
            ).length
              ? getArray(
                  maintenanceData,
                  "maintenance"
                )
              : getArray(
                  maintenanceData,
                  "maintenanceRecords"
                )
          );

          setDocuments(
            getArray(
              documentData,
              "documents"
            )
          );

          setIncidents(
            getArray(
              incidentData,
              "incidents"
            )
          );

          setExpenses(
            getArray(
              expenseData,
              "expenses"
            )
          );

          if (
            !selectedVehicleId &&
            vehicleList.length > 0
          ) {
            setSelectedVehicleId(
              String(
                vehicleList[0].id
              )
            );
          }
        } catch (err) {
          console.error(err);

          setError(
            "Unable to load vehicle details"
          );
        } finally {
          setLoading(false);
        }
      };

    loadAllData();
  }, [token, navigate]);

  const selectedVehicle =
    useMemo(() => {
      return vehicles.find(
        (vehicle) =>
          String(vehicle.id) ===
          String(
            selectedVehicleId
          )
      );
    }, [
      vehicles,
      selectedVehicleId,
    ]);

  const vehicleTrips =
    useMemo(
      () =>
        trips.filter(
          (item) =>
            String(
              item.vehicle_id
            ) ===
            String(
              selectedVehicleId
            )
        ),
      [trips, selectedVehicleId]
    );

  const vehicleFuel =
    useMemo(
      () =>
        fuel.filter(
          (item) =>
            String(
              item.vehicle_id
            ) ===
            String(
              selectedVehicleId
            )
        ),
      [fuel, selectedVehicleId]
    );

  const vehicleMaintenance =
    useMemo(
      () =>
        maintenance.filter(
          (item) =>
            String(
              item.vehicle_id
            ) ===
            String(
              selectedVehicleId
            )
        ),
      [
        maintenance,
        selectedVehicleId,
      ]
    );

  const vehicleDocuments =
    useMemo(
      () =>
        documents.filter(
          (item) =>
            String(
              item.vehicle_id
            ) ===
            String(
              selectedVehicleId
            )
        ),
      [
        documents,
        selectedVehicleId,
      ]
    );

  const vehicleIncidents =
    useMemo(
      () =>
        incidents.filter(
          (item) =>
            String(
              item.vehicle_id
            ) ===
            String(
              selectedVehicleId
            )
        ),
      [
        incidents,
        selectedVehicleId,
      ]
    );

  const vehicleExpenses =
    useMemo(
      () =>
        expenses.filter(
          (item) =>
            String(
              item.vehicle_id
            ) ===
            String(
              selectedVehicleId
            )
        ),
      [
        expenses,
        selectedVehicleId,
      ]
    );

  const assignedDriver =
    useMemo(() => {
      return drivers.find(
        (driver) =>
          String(
            driver.current_vehicle_id
          ) ===
          String(
            selectedVehicleId
          )
      );
    }, [
      drivers,
      selectedVehicleId,
    ]);

  const formatNumber = (
    value
  ) =>
    Number(
      value || 0
    ).toLocaleString(
      undefined,
      {
        maximumFractionDigits: 2,
      }
    );

  const dateOnly = (value) => {
    if (!value) return "--";

    return String(value).slice(
      0,
      10
    );
  };

  const totalDistance =
    vehicleTrips.reduce(
      (sum, item) =>
        sum +
        Number(
          item.distance || 0
        ),
      0
    );

  const totalFuel =
    vehicleFuel.reduce(
      (sum, item) =>
        sum +
        Number(
          item.liters || 0
        ),
      0
    );

  const totalFuelCost =
    vehicleFuel.reduce(
      (sum, item) =>
        sum +
        Number(
          item.amount || 0
        ),
      0
    );

  const totalMaintenance =
    vehicleMaintenance.reduce(
      (sum, item) =>
        sum +
        Number(
          item.cost || 0
        ),
      0
    );

  const totalExpenses =
    vehicleExpenses.reduce(
      (sum, item) =>
        sum +
        Number(
          item.amount || 0
        ),
      0
    );

  const recentTrips = [
    ...vehicleTrips,
  ]
    .sort(
      (a, b) =>
        new Date(
          b.start_datetime
        ) -
        new Date(
          a.start_datetime
        )
    )
    .slice(0, 5);

  const recentMaintenance = [
    ...vehicleMaintenance,
  ]
    .sort(
      (a, b) =>
        new Date(
          b.maintenance_date
        ) -
        new Date(
          a.maintenance_date
        )
    )
    .slice(0, 5);

  const handleVehicleChange = (
    e
  ) => {
    const id =
      e.target.value;

    setSelectedVehicleId(id);

    navigate(
      `/vehicle-detail?id=${id}`,
      {
        replace: true,
      }
    );
  };

  const openHistory = () => {
    if (!selectedVehicle) {
      return;
    }

    navigate(
      "/vehicle-history"
    );
  };

  return (
    <div className="detail-page">
      <aside className="detail-sidebar">
        <div className="detail-welcome">
          <span>
            Welcome User!
          </span>

         <NotificationBell />
        </div>

        <div className="detail-menu">
          {menuItems.map(
            (item) => (
              <button
                key={item.name}
                className={
                  item.name ===
                  "Vehicles"
                    ? "detail-menu-btn active"
                    : "detail-menu-btn"
                }
                onClick={() =>
                  handleMenuClick(
                    item
                  )
                }
              >
                {item.name}
              </button>
            )
          )}
        </div>

        <button
          className="detail-logout"
          onClick={
            handleLogout
          }
        >
          Logout
        </button>
      </aside>

      <main className="detail-content">
        <div className="detail-header">
          <h1>
            Vehicle Detail
          </h1>
        </div>

        <div className="detail-selector">
          <div>
            <label>
              Select Vehicle
            </label>

            <select
              value={
                selectedVehicleId
              }
              onChange={
                handleVehicleChange
              }
            >
              <option value="">
                Select Vehicle
              </option>

              {vehicles.map(
                (vehicle) => (
                  <option
                    key={vehicle.id}
                    value={vehicle.id}
                  >
                    {
                      vehicle.registration_no
                    }{" "}
                    -{" "}
                    {
                      vehicle.vehicle_name
                    }
                  </option>
                )
              )}
            </select>
          </div>

          <button
            className="detail-history-btn"
            onClick={
              openHistory
            }
            disabled={
              !selectedVehicle
            }
          >
            VIEW VEHICLE HISTORY
          </button>
        </div>

        {error && (
          <div className="detail-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="detail-loading">
            Loading vehicle details...
          </div>
        ) : !selectedVehicle ? (
          <div className="detail-empty">
            Select a vehicle to view its complete details.
          </div>
        ) : (
          <>
            <div className="detail-profile">
              <div className="detail-profile-title">
                <div>
                  <h2>
                    {
                      selectedVehicle.registration_no
                    }
                  </h2>

                  <p>
                    {
                      selectedVehicle.vehicle_name
                    }
                  </p>
                </div>

                <span
                  className={
                    selectedVehicle.status ===
                    "Active"
                      ? "detail-status active"
                      : "detail-status inactive"
                  }
                >
                  {
                    selectedVehicle.status
                  }
                </span>
              </div>

              <div className="detail-profile-grid">
                <div>
                  <span>
                    Vehicle ID
                  </span>

                  <strong>
                    VEH-
                    {String(
                      selectedVehicle.id
                    ).padStart(
                      5,
                      "0"
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Registration No.
                  </span>

                  <strong>
                    {
                      selectedVehicle.registration_no
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Vehicle Name
                  </span>

                  <strong>
                    {
                      selectedVehicle.vehicle_name
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Location
                  </span>

                  <strong>
                    {
                      selectedVehicle.location ||
                      "--"
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Current Odometer
                  </span>

                  <strong>
                    {formatNumber(
                      selectedVehicle.odometer
                    )}{" "}
                    km
                  </strong>
                </div>

                <div>
                  <span>
                    Assigned Driver
                  </span>

                  <strong>
                    {assignedDriver
                      ? assignedDriver.driver_name
                      : "Not Assigned"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="detail-summary-grid">
              <div className="detail-summary-card">
                <span>
                  Total Trips
                </span>

                <strong>
                  {
                    vehicleTrips.length
                  }
                </strong>
              </div>

              <div className="detail-summary-card">
                <span>
                  Total Distance
                </span>

                <strong>
                  {formatNumber(
                    totalDistance
                  )}{" "}
                  km
                </strong>
              </div>

              <div className="detail-summary-card">
                <span>
                  Fuel Used
                </span>

                <strong>
                  {formatNumber(
                    totalFuel
                  )}{" "}
                  L
                </strong>
              </div>

              <div className="detail-summary-card">
                <span>
                  Fuel Cost
                </span>

                <strong>
                  {formatNumber(
                    totalFuelCost
                  )}
                </strong>
              </div>

              <div className="detail-summary-card">
                <span>
                  Maintenance
                </span>

                <strong>
                  {formatNumber(
                    totalMaintenance
                  )}
                </strong>
              </div>

              <div className="detail-summary-card">
                <span>
                  Incidents
                </span>

                <strong>
                  {
                    vehicleIncidents.length
                  }
                </strong>
              </div>

              <div className="detail-summary-card">
                <span>
                  Documents
                </span>

                <strong>
                  {
                    vehicleDocuments.length
                  }
                </strong>
              </div>

              <div className="detail-summary-card">
                <span>
                  Expenses
                </span>

                <strong>
                  {formatNumber(
                    totalExpenses
                  )}
                </strong>
              </div>
            </div>

            <div className="detail-two-column">
              <section className="detail-section">
                <div className="detail-section-title">
                  Recent Trips
                </div>

                <div className="detail-table-wrapper">
                  <table className="detail-table">
                    <thead>
                      <tr>
                        <th>Trip</th>
                        <th>Date</th>
                        <th>
                          Route
                        </th>
                        <th>
                          Distance
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentTrips.length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="detail-table-empty"
                          >
                            No trip records.
                          </td>
                        </tr>
                      ) : (
                        recentTrips.map(
                          (trip) => (
                            <tr
                              key={
                                trip.id
                              }
                            >
                              <td>
                                TRIP-
                                {String(
                                  trip.id
                                ).padStart(
                                  5,
                                  "0"
                                )}
                              </td>

                              <td>
                                {dateOnly(
                                  trip.start_datetime
                                )}
                              </td>

                              <td>
                                {trip.from_location ||
                                  "--"}{" "}
                                →{" "}
                                {trip.destination ||
                                  "--"}
                              </td>

                              <td>
                                {formatNumber(
                                  trip.distance
                                )}{" "}
                                km
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="detail-section">
                <div className="detail-section-title">
                  Recent Maintenance
                </div>

                <div className="detail-table-wrapper">
                  <table className="detail-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>
                          Service
                        </th>
                        <th>Cost</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentMaintenance.length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="detail-table-empty"
                          >
                            No maintenance records.
                          </td>
                        </tr>
                      ) : (
                        recentMaintenance.map(
                          (item) => (
                            <tr
                              key={
                                item.id
                              }
                            >
                              <td>
                                {dateOnly(
                                  item.maintenance_date
                                )}
                              </td>

                              <td>
                                {
                                  item.service_type
                                }
                              </td>

                              <td>
                                {formatNumber(
                                  item.cost
                                )}
                              </td>

                              <td>
                                {
                                  item.status
                                }
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div className="detail-two-column">
              <section className="detail-section">
                <div className="detail-section-title">
                  Documents
                </div>

                <div className="detail-table-wrapper">
                  <table className="detail-table">
                    <thead>
                      <tr>
                        <th>
                          Document
                        </th>
                        <th>Number</th>
                        <th>
                          Expiry
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {vehicleDocuments.length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan="3"
                            className="detail-table-empty"
                          >
                            No document records.
                          </td>
                        </tr>
                      ) : (
                        vehicleDocuments
                          .slice(
                            0,
                            5
                          )
                          .map(
                            (
                              item
                            ) => (
                              <tr
                                key={
                                  item.id
                                }
                              >
                                <td>
                                  {
                                    item.document_type
                                  }
                                </td>

                                <td>
                                  {item.document_number ||
                                    "--"}
                                </td>

                                <td>
                                  {dateOnly(
                                    item.expiry_date
                                  )}
                                </td>
                              </tr>
                            )
                          )
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="detail-section">
                <div className="detail-section-title">
                  Incidents
                </div>

                <div className="detail-table-wrapper">
                  <table className="detail-table">
                    <thead>
                      <tr>
                        <th>
                          Incident
                        </th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {vehicleIncidents.length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="detail-table-empty"
                          >
                            No incident records.
                          </td>
                        </tr>
                      ) : (
                        vehicleIncidents
                          .slice(
                            0,
                            5
                          )
                          .map(
                            (
                              item
                            ) => (
                              <tr
                                key={
                                  item.id
                                }
                              >
                                <td>
                                  INC-
                                  {String(
                                    item.id
                                  ).padStart(
                                    5,
                                    "0"
                                  )}
                                </td>

                                <td>
                                  {dateOnly(
                                    item.incident_date
                                  )}
                                </td>

                                <td>
                                  {
                                    item.incident_type
                                  }
                                </td>

                                <td>
                                  {
                                    item.status
                                  }
                                </td>
                              </tr>
                            )
                          )
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default VehicleDetail;