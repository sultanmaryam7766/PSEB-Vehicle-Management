import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import dashboardBanner from "../assets/dashboard-fleet-banner.png";

import "./OperatorDashboard.css";

/* =========================================
   ICON
========================================= */

function DashboardIcon({
  type,
  size = 20,
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (type) {
    case "vehicle":
      return (
        <svg {...common}>
          <path d="M5 17h14" />
          <path d="M6 17v2" />
          <path d="M18 17v2" />
          <path d="M4 13l2-5h12l2 5" />
          <rect
            x="3"
            y="12"
            width="18"
            height="5"
            rx="2"
          />
          <circle cx="7" cy="15" r="1" />
          <circle cx="17" cy="15" r="1" />
        </svg>
      );

    default:
      return null;
  }
}

/* =========================================
   OPERATOR DASHBOARD
========================================= */

function OperatorDashboard() {
  const navigate =
    useNavigate();

  const user = JSON.parse(
    localStorage.getItem(
      "user"
    )
  );

  const role =
    user?.role;

  const token =
    localStorage.getItem(
      "token"
    );

  /* =========================================
     PROFILE
  ========================================= */

  const userName =
    user?.name ||
    "User";

  const userInitial =
    userName
      .trim()
      .charAt(0)
      .toUpperCase();

  /* =========================================
     DASHBOARD DATA
  ========================================= */

  const [
    summary,
    setSummary,
  ] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    totalDrivers: 0,
    activeTrips: 0,
    completedTripsThisMonth: 0,
    fuelCostThisMonth: 0,
    maintenanceDue: 0,
    openIncidents: 0,
    expensesThisMonth: 0,
    expiringDocuments: 0,
  });

  const [
    recentTrips,
    setRecentTrips,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /* =========================================
     NOTIFICATIONS
  ========================================= */

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    notificationOpen,
    setNotificationOpen,
  ] = useState(false);

  const [
    notificationLoading,
    setNotificationLoading,
  ] = useState(false);

  /* =========================================
     ROLE CHECK
  ========================================= */

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    if (
      role !== "Operator"
    ) {
      if (
        role ===
        "Administrator"
      ) {
        navigate(
          "/admin-dashboard"
        );
      } else if (
        role === "Viewer"
      ) {
        navigate(
          "/viewer-dashboard"
        );
      } else {
        navigate("/");
      }
    }
  }, [
    navigate,
    role,
    user,
  ]);

  /* =========================================
     LOAD DASHBOARD
  ========================================= */

  useEffect(() => {
    if (
      !token ||
      role !== "Operator"
    ) {
      return;
    }

    const loadDashboard =
      async () => {
        setLoading(true);
        setError("");

        try {
          const response =
            await fetch(
              "http://localhost:5000/api/dashboard/summary",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const data =
            await response.json();

          if (
            response.status ===
            401
          ) {
            localStorage.removeItem(
              "token"
            );

            localStorage.removeItem(
              "user"
            );

            navigate("/");
            return;
          }

          if (!response.ok) {
            setError(
              data.message ||
                "Unable to load dashboard"
            );

            return;
          }

          setSummary(
            data.summary || {}
          );

          setRecentTrips(
            data.recentTrips ||
              []
          );
        } catch (err) {
          console.error(
            "Operator dashboard error:",
            err
          );

          setError(
            "Unable to connect to server"
          );
        } finally {
          setLoading(false);
        }
      };

    loadDashboard();
  }, [
    token,
    role,
    navigate,
  ]);

  /* =========================================
     LOAD NOTIFICATIONS
  ========================================= */

  useEffect(() => {
    if (
      !token ||
      role !== "Operator"
    ) {
      return;
    }

    const loadNotifications =
      async () => {
        setNotificationLoading(
          true
        );

        try {
          const response =
            await fetch(
              "http://localhost:5000/api/notifications",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const data =
            await response.json();

          if (
            response.status ===
            401
          ) {
            localStorage.removeItem(
              "token"
            );

            localStorage.removeItem(
              "user"
            );

            navigate("/");
            return;
          }

          if (!response.ok) {
            console.error(
              data.message ||
                "Unable to load notifications"
            );

            return;
          }

          setNotifications(
            data.alerts || []
          );

          setNotificationOpen(
            true
          );
        } catch (err) {
          console.error(
            "Notification error:",
            err
          );
        } finally {
          setNotificationLoading(
            false
          );
        }
      };

    loadNotifications();
  }, [
    token,
    role,
    navigate,
  ]);

  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout =
    () => {
      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      navigate("/");
    };

  /* =========================================
     HELPERS
  ========================================= */

  const formatNumber = (
    value
  ) =>
    Number(
      value || 0
    ).toLocaleString(
      undefined,
      {
        maximumFractionDigits:
          2,
      }
    );

  const dateOnly = (
    value
  ) => {
    if (!value) {
      return "--";
    }

    return String(
      value
    ).slice(
      0,
      10
    );
  };

  const handleNotificationClick =
    (alert) => {
      setNotificationOpen(
        false
      );

      if (alert.link) {
        navigate(
          alert.link
        );
      }
    };

  const getNotificationIcon =
    (severity) => {
      if (
        severity ===
        "danger"
      ) {
        return "❌";
      }

      if (
        severity ===
        "urgent"
      ) {
        return "⚠️";
      }

      if (
        severity ===
        "warning"
      ) {
        return "🔔";
      }

      return "ℹ️";
    };

  /* =========================================
     ROLE GUARD
  ========================================= */

  if (
    !user ||
    role !== "Operator"
  ) {
    return null;
  }

  return (
    <div className="operator-page">

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside className="operator-sidebar">

        <div className="operator-profile">

          <div className="operator-profile-avatar">
            {userInitial}
          </div>

          <div className="operator-profile-text">

            <strong>
              {userName}
            </strong>

            <span>
              {role}
            </span>

          </div>

          <button
            type="button"
            className="operator-sidebar-notification"
            onClick={() =>
              setNotificationOpen(
                true
              )
            }
            title="Notifications"
          >

            <span className="operator-sidebar-bell">
              🔔
            </span>

            {notifications.length >
              0 && (
              <span className="operator-sidebar-notification-count">
                {
                  notifications.length
                }
              </span>
            )}

          </button>

        </div>

        {/* NAVIGATION */}

        <nav className="operator-nav">

          <button
            className="active"
            onClick={() =>
              navigate(
                "/operator-dashboard"
              )
            }
          >
            Dashboard
          </button>

          <button
            onClick={() =>
              navigate(
                "/vehicles"
              )
            }
          >
            Vehicles
          </button>

          <button
            onClick={() =>
              navigate(
                "/vehicle-history"
              )
            }
          >
            Vehicle History
          </button>

          <button
            onClick={() =>
              navigate(
                "/drivers"
              )
            }
          >
            Drivers
          </button>

          <button
            onClick={() =>
              navigate(
                "/trips"
              )
            }
          >
            Trips
          </button>

          <button
            onClick={() =>
              navigate(
                "/fuel"
              )
            }
          >
            Fuel
          </button>

          <button
            onClick={() =>
              navigate(
                "/maintenance"
              )
            }
          >
            Maintenance
          </button>

          <button
            onClick={() =>
              navigate(
                "/documents"
              )
            }
          >
            Documents
          </button>

          <button
            onClick={() =>
              navigate(
                "/incidents"
              )
            }
          >
            Incidents
          </button>

          <button
            onClick={() =>
              navigate(
                "/expenses"
              )
            }
          >
            Expenses
          </button>

          <button
            onClick={() =>
              navigate(
                "/reports"
              )
            }
          >
            Reports
          </button>

        </nav>

        {/* LOGOUT */}

        <button
          className="operator-logout"
          onClick={
            handleLogout
          }
        >
          Logout
        </button>

      </aside>

      {/* =====================================
          MAIN
      ===================================== */}

      <main className="operator-main">

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="operator-header">

          <img
            src={dashboardBanner}
            alt=""
            className="operator-header-banner"
          />

          <div className="operator-header-overlay" />

          <div className="operator-header-main">

            <div className="operator-header-icon">

              <DashboardIcon
                type="vehicle"
                size={34}
              />

            </div>

            <h1>
              Vehicle Management System
            </h1>

          </div>

        </div>

        {/* =====================================
            NOTIFICATION POPUP
        ===================================== */}

        {notificationOpen && (

          <div className="operator-notification-overlay">

            <div className="operator-notification-popup">

              <div className="operator-notification-header">

                <h3>
                  🔔 Vehicle Notifications
                </h3>

                <button
                  type="button"
                  className="operator-notification-close"
                  onClick={() =>
                    setNotificationOpen(
                      false
                    )
                  }
                >
                  ×
                </button>

              </div>

              <div className="operator-notification-body">

                {notificationLoading ? (

                  <div className="operator-notification-empty">
                    Loading alerts...
                  </div>

                ) : notifications.length ===
                  0 ? (

                  <div className="operator-notification-normal">

                    <strong>
                      ✅ No alerts found
                    </strong>

                    <span>
                      All systems are currently normal.
                    </span>

                  </div>

                ) : (

                  notifications.map(
                    (
                      alert
                    ) => (

                      <button
                        type="button"
                        key={
                          alert.id
                        }
                        className={`operator-notification-item ${
                          alert.severity ||
                          "warning"
                        }`}
                        onClick={() =>
                          handleNotificationClick(
                            alert
                          )
                        }
                      >

                        <div className="operator-notification-icon">

                          {getNotificationIcon(
                            alert.severity
                          )}

                        </div>

                        <div className="operator-notification-text">

                          <strong>
                            {
                              alert.title
                            }
                          </strong>

                          <span className="operator-notification-vehicle">
                            {
                              alert.vehicle
                            }
                          </span>

                          <span>
                            {
                              alert.message
                            }
                          </span>

                        </div>

                      </button>

                    )
                  )

                )}

              </div>

              <div className="operator-notification-footer">

                <button
                  type="button"
                  className="operator-notification-ok"
                  onClick={() =>
                    setNotificationOpen(
                      false
                    )
                  }
                >
                  OK
                </button>

                <button
                  type="button"
                  className="operator-notification-dismiss"
                  onClick={() =>
                    setNotificationOpen(
                      false
                    )
                  }
                >
                  Dismiss All
                </button>

              </div>

            </div>

          </div>

        )}

        {/* =====================================
            ERROR
        ===================================== */}

        {error && (

          <div className="operator-error">
            {error}
          </div>

        )}

        {/* =====================================
            FLEET
        ===================================== */}

        <div className="operator-section-title">
          Fleet & Daily Operations
        </div>

        <div className="operator-stats">

          {/* TOTAL VEHICLES */}

          <div
            className="operator-stat-card"
            onClick={() =>
              navigate(
                "/vehicles"
              )
            }
          >

            <span>
              Total Vehicles
            </span>

            <strong>
              {loading
                ? "--"
                : summary.totalVehicles}
            </strong>

            <small>
              Active:{" "}
              {loading
                ? "--"
                : summary.activeVehicles}
            </small>

          </div>

          {/* ACTIVE TRIPS */}

          <div
            className="operator-stat-card"
            onClick={() =>
              navigate(
                "/trips"
              )
            }
          >

            <span>
              Active Trips
            </span>

            <strong>
              {loading
                ? "--"
                : summary.activeTrips}
            </strong>

            <small>
              Completed this month:{" "}
              {loading
                ? "--"
                : summary.completedTripsThisMonth}
            </small>

          </div>

          {/* DRIVERS */}

          <div
            className="operator-stat-card"
            onClick={() =>
              navigate(
                "/drivers"
              )
            }
          >

            <span>
              Total Drivers
            </span>

            <strong>
              {loading
                ? "--"
                : summary.totalDrivers}
            </strong>

            <small>
              Registered drivers
            </small>

          </div>

          {/* FUEL */}

          <div
            className="operator-stat-card"
            onClick={() =>
              navigate(
                "/fuel"
              )
            }
          >

            <span>
              Fuel Cost
            </span>

            <strong>
              {loading
                ? "--"
                : `Rs. ${formatNumber(
                    summary.fuelCostThisMonth
                  )}`}
            </strong>

            <small>
              Current month
            </small>

          </div>

          {/* MAINTENANCE */}

          <div
            className="operator-stat-card"
            onClick={() =>
              navigate(
                "/maintenance"
              )
            }
          >

            <span>
              Maintenance Due
            </span>

            <strong>
              {loading
                ? "--"
                : summary.maintenanceDue}
            </strong>

            <small>
              Service due
            </small>

          </div>

          {/* INCIDENTS */}

          <div
            className="operator-stat-card"
            onClick={() =>
              navigate(
                "/incidents"
              )
            }
          >

            <span>
              Open Incidents
            </span>

            <strong>
              {loading
                ? "--"
                : summary.openIncidents}
            </strong>

            <small>
              Open / In Progress
            </small>

          </div>

          {/* DOCUMENTS */}

          <div
            className="operator-stat-card"
            onClick={() =>
              navigate(
                "/documents"
              )
            }
          >

            <span>
              Documents Due
            </span>

            <strong>
              {loading
                ? "--"
                : summary.expiringDocuments}
            </strong>

            <small>
              Expiring within 30 days
            </small>

          </div>

          {/* EXPENSES */}

          <div
            className="operator-stat-card"
            onClick={() =>
              navigate(
                "/expenses"
              )
            }
          >

            <span>
              Expenses
            </span>

            <strong>
              {loading
                ? "--"
                : `Rs. ${formatNumber(
                    summary.expensesThisMonth
                  )}`}
            </strong>

            <small>
              Current month
            </small>

          </div>

        </div>

        {/* =====================================
            RECENT TRIPS
        ===================================== */}

        <div
          className="operator-section-title operator-recent-title"
          onClick={() =>
            navigate(
              "/trips"
            )
          }
        >
          Recent Trips
        </div>

        <div className="operator-table-wrapper">

          <table className="operator-table">

            <thead>

              <tr>

                <th>
                  Trip ID
                </th>

                <th>
                  Date
                </th>

                <th>
                  Vehicle
                </th>

                <th>
                  Driver
                </th>

                <th>
                  Route
                </th>

                <th>
                  Distance
                </th>

                <th>
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="7"
                    className="operator-empty"
                  >
                    Loading...
                  </td>

                </tr>

              ) : recentTrips.length ===
                0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="operator-empty"
                  >
                    No trip records found.
                  </td>

                </tr>

              ) : (

                recentTrips.map(
                  (
                    trip
                  ) => (

                    <tr
                      key={
                        trip.id
                      }
                      onClick={() =>
                        navigate(
                          "/trips"
                        )
                      }
                      className="operator-trip-row-clickable"
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

                        <strong>
                          {
                            trip.registration_no
                          }
                        </strong>

                        {trip.vehicle_name && (
                          <>
                            <br />

                            <span>
                              {
                                trip.vehicle_name
                              }
                            </span>
                          </>
                        )}

                      </td>

                      <td>
                        {
                          trip.driver_name ||
                          "--"
                        }
                      </td>

                      <td>
                        {
                          trip.from_location ||
                          "--"
                        }{" "}
                        →{" "}
                        {
                          trip.destination ||
                          "--"
                        }
                      </td>

                      <td>
                        {formatNumber(
                          trip.distance
                        )}{" "}
                        km
                      </td>

                      <td>

                        <span
                          className={`operator-trip-status ${String(
                            trip.status ||
                              ""
                          )
                            .toLowerCase()
                            .replace(
                              " ",
                              "-"
                            )}`}
                        >
                          {
                            trip.status
                          }
                        </span>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </main>

    </div>
  );
}

export default OperatorDashboard;