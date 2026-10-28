import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import dashboardBanner from "../assets/dashboard-fleet-banner.png";

import "./AdminDashboard.css";

/* =========================
   SIMPLE SVG ICON
   No external library needed
========================= */

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
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      );

    case "vehicle":
      return (
        <svg {...common}>
          <path d="M5 17h14" />
          <path d="M6 17v2" />
          <path d="M18 17v2" />
          <path d="M4 13l2-5h12l2 5" />
          <rect x="3" y="12" width="18" height="5" rx="2" />
          <circle cx="7" cy="15" r="1" />
          <circle cx="17" cy="15" r="1" />
        </svg>
      );

    case "history":
      return (
        <svg {...common}>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v6h6" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "drivers":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 19c0-3 2.5-5 6-5s6 2 6 5" />
          <circle cx="17" cy="9" r="2" />
          <path d="M16 14c3 0 5 1.5 5 4" />
        </svg>
      );

    case "trips":
      return (
        <svg {...common}>
          <path d="M5 21c0-7 4-7 4-14" />
          <path d="M15 3c0 7 4 7 4 14" />
          <path d="M8 7h2" />
          <path d="M14 17h2" />
        </svg>
      );

    case "fuel":
      return (
        <svg {...common}>
          <path d="M6 3h8v18H6z" />
          <path d="M8 7h4" />
          <path d="M14 8h2l2 2v7a2 2 0 0 0 4 0v-6l-2-2" />
        </svg>
      );

    case "maintenance":
      return (
        <svg {...common}>
          <path d="M14 6a4 4 0 0 0-5 5L3 17l4 4 6-6a4 4 0 0 0 5-5l-3 3-3-3z" />
        </svg>
      );

    case "documents":
      return (
        <svg {...common}>
          <path d="M6 2h8l4 4v16H6z" />
          <path d="M14 2v5h5" />
          <path d="M9 12h6" />
          <path d="M9 16h6" />
        </svg>
      );

    case "incidents":
      return (
        <svg {...common}>
          <path d="M12 3L2 21h20L12 3z" />
          <path d="M12 9v5" />
          <path d="M12 18h.01" />
        </svg>
      );

    case "expenses":
      return (
        <svg {...common}>
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <path d="M8 7h8" />
          <path d="M8 11h8" />
          <path d="M8 15h4" />
        </svg>
      );

    case "reports":
      return (
        <svg {...common}>
          <path d="M4 20V10" />
          <path d="M10 20V4" />
          <path d="M16 20v-7" />
          <path d="M22 20H2" />
        </svg>
      );

    case "users":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="3" />
          <circle cx="17" cy="9" r="2" />
          <path d="M2 20c0-4 2.5-6 6-6s6 2 6 6" />
          <path d="M15 15c4 0 6 2 6 5" />
        </svg>
      );

    case "audit":
      return (
        <svg {...common}>
          <path d="M9 3h6l1 2h3v16H5V5h3z" />
          <path d="M9 11h6" />
          <path d="M9 15h4" />
        </svg>
      );

    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "logout":
      return (
        <svg {...common}>
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
          <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
        </svg>
      );

    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="M13 6l6 6-6 6" />
        </svg>
      );

    default:
      return null;
  }
}

function AdminDashboard() {
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
const userName =
  user?.name ||
  "User";

const userInitials =
  userName
    .trim()
    .charAt(0)
    .toUpperCase();
  /* =========================
     DASHBOARD DATA
  ========================= */

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

  /* =========================
     NOTIFICATIONS
  ========================= */

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

  /* =========================
     ROLE CHECK
  ========================= */

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    if (
      role !==
      "Administrator"
    ) {
      if (
        role ===
        "Operator"
      ) {
        navigate(
          "/operator-dashboard"
        );
      } else if (
        role ===
        "Viewer"
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

  /* =========================
     LOAD DASHBOARD
  ========================= */

  useEffect(() => {
    if (
      !token ||
      role !==
        "Administrator"
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
            "Dashboard error:",
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

  /* =========================
     LOAD NOTIFICATIONS
  ========================= */

  useEffect(() => {
    if (
      !token ||
      role !==
        "Administrator"
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

  /* =========================
     MENU
  ========================= */

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin-dashboard",
      icon: "dashboard",
    },
    {
      name: "Vehicles",
      path: "/vehicles",
      icon: "vehicle",
    },
    {
      name: "Vehicle History",
      path: "/vehicle-history",
      icon: "history",
    },
    {
      name: "Drivers",
      path: "/drivers",
      icon: "drivers",
    },
    {
      name: "Trips",
      path: "/trips",
      icon: "trips",
    },
    {
      name: "Fuel",
      path: "/fuel",
      icon: "fuel",
    },
    {
      name: "Maintenance",
      path: "/maintenance",
      icon: "maintenance",
    },
    {
      name: "Documents",
      path: "/documents",
      icon: "documents",
    },
    {
      name: "Incidents",
      path: "/incidents",
      icon: "incidents",
    },
    {
      name: "Expenses",
      path: "/expenses",
      icon: "expenses",
    },
    {
      name: "Reports",
      path: "/reports",
      icon: "reports",
    },
    {
      name: "Users & Roles",
      path: "/users-roles",
      icon: "users",
    },
    {
      name: "Audit Log",
      path: "/audit-log",
      icon: "audit",
    },
  ];

  /* =========================
     LOGOUT
  ========================= */

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

  /* =========================
     HELPERS
  ========================= */

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

  const handleCardKeyDown = (
    e,
    path
  ) => {
    if (
      e.key === "Enter" ||
      e.key === " "
    ) {
      navigate(path);
    }
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

  const stats = [
    {
      title: "Total Vehicles",
      value: loading
        ? "--"
        : summary.totalVehicles,
      subtitle: `Active: ${
        loading
          ? "--"
          : summary.activeVehicles
      }`,
      icon: "vehicle",
      path: "/vehicles",
      className: "vehicles",
    },
    {
      title: "Total Drivers",
      value: loading
        ? "--"
        : summary.totalDrivers,
      subtitle:
        "Registered drivers",
      icon: "drivers",
      path: "/drivers",
      className: "drivers",
    },
    {
      title: "Active Trips",
      value: loading
        ? "--"
        : summary.activeTrips,
      subtitle: `Completed this month: ${
        loading
          ? "--"
          : summary.completedTripsThisMonth
      }`,
      icon: "trips",
      path: "/trips",
      className: "trips",
    },
    {
      title:
        "Fuel Cost This Month",
      value: loading
        ? "--"
        : `Rs. ${formatNumber(
            summary.fuelCostThisMonth
          )}`,
      subtitle:
        "Current month fuel",
      icon: "fuel",
      path: "/fuel",
      className: "fuel",
    },
    {
      title:
        "Maintenance Due",
      value: loading
        ? "--"
        : summary.maintenanceDue,
      subtitle:
        "Service due",
      icon: "maintenance",
      path: "/maintenance",
      className:
        "maintenance",
    },
    {
      title:
        "Open Incidents",
      value: loading
        ? "--"
        : summary.openIncidents,
      subtitle:
        "Open / In Progress",
      icon: "incidents",
      path: "/incidents",
      className: "incidents",
    },
    {
      title:
        "Expenses This Month",
      value: loading
        ? "--"
        : `Rs. ${formatNumber(
            summary.expensesThisMonth
          )}`,
      subtitle:
        "Recorded expenses",
      icon: "expenses",
      path: "/expenses",
      className: "expenses",
    },
    {
      title:
        "Expiring Documents",
      value: loading
        ? "--"
        : summary.expiringDocuments,
      subtitle:
        "Within next 30 days",
      icon: "documents",
      path: "/documents",
      className: "documents",
    },
  ];

  if (
    !user ||
    role !==
      "Administrator"
  ) {
    return null;
  }

  return (
    <div className="admin-page">

      {/* =====================
          SIDEBAR
      ===================== */}

      <aside className="admin-sidebar">

       <div className="admin-profile">

  <div className="admin-profile-avatar">
    <span>
      {userInitials}
    </span>
  </div>

  <div className="admin-profile-text">

    <strong>
      {userName}
    </strong>

    <span>
      {role}
    </span>

  </div>

  <button
    type="button"
    className="admin-sidebar-notification"
    onClick={() =>
      setNotificationOpen(
        true
      )
    }
    title="Notifications"
  >
    <span className="admin-sidebar-bell">
      🔔
    </span>

    {notifications.length > 0 && (
      <span className="admin-sidebar-notification-count">
        {notifications.length}
      </span>
    )}
  </button>

</div>

        <div className="admin-menu">

          {menuItems.map(
            (
              item
            ) => (

              <button
                key={
                  item.name
                }
                className={
                  item.name ===
                  "Dashboard"
                    ? "admin-menu-btn active"
                    : "admin-menu-btn"
                }
                onClick={() =>
                  navigate(
                    item.path
                  )
                }
              >

                <span className="admin-menu-icon">
                  <DashboardIcon
                    type={
                      item.icon
                    }
                    size={17}
                  />
                </span>

                <span>
                  {
                    item.name
                  }
                </span>

              </button>

            )
          )}

        </div>

        <button
          className="admin-logout"
          onClick={
            handleLogout
          }
        >

          <DashboardIcon
            type="logout"
            size={17}
          />

          <span>
            Logout
          </span>

        </button>

      </aside>

      {/* =====================
          CONTENT
      ===================== */}

      <main className="admin-content">

        {/* =====================
            HERO HEADER
        ===================== */}

       <div className="admin-header">

  <img
    src={dashboardBanner}
    alt=""
    className="admin-header-banner"
  />

  <div className="admin-header-overlay" />

  <div className="admin-header-main">

    <div className="admin-header-icon">
      <DashboardIcon
        type="vehicle"
        size={34}
      />
    </div>

    <div>
      <h1>
        Vehicle Management System
      </h1>

   
    </div>



          </div>

        </div>

        {/* =====================
            NOTIFICATION POPUP
        ===================== */}

        {notificationOpen && (

          <div className="admin-notification-overlay">

            <div className="admin-notification-popup">

              <div className="admin-notification-header">

                <h3>
                  🔔 Vehicle Notifications
                </h3>

                <button
                  type="button"
                  className="admin-notification-close"
                  onClick={() =>
                    setNotificationOpen(
                      false
                    )
                  }
                >
                  ×
                </button>

              </div>

              <div className="admin-notification-body">

                {notificationLoading ? (

                  <div className="admin-notification-empty">
                    Loading alerts...
                  </div>

                ) : notifications.length ===
                  0 ? (

                  <div className="admin-notification-normal">

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
                        className={`admin-notification-item ${
                          alert.severity ||
                          "warning"
                        }`}
                        onClick={() =>
                          handleNotificationClick(
                            alert
                          )
                        }
                      >

                        <div className="admin-notification-icon">
                          {getNotificationIcon(
                            alert.severity
                          )}
                        </div>

                        <div className="admin-notification-text">

                          <strong>
                            {
                              alert.title
                            }
                          </strong>

                          <span className="admin-notification-vehicle">
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

              <div className="admin-notification-footer">

                <button
                  type="button"
                  className="admin-notification-ok"
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
                  className="admin-notification-dismiss"
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

        {/* ERROR */}

        {error && (

          <div className="admin-error">
            {
              error
            }
          </div>

        )}

        {/* =====================
            FLEET OVERVIEW
        ===================== */}

        <section className="admin-dashboard-panel">

          <div className="admin-panel-heading">

            <div className="admin-panel-heading-left">

              <span className="admin-section-icon blue">
                <DashboardIcon
                  type="reports"
                  size={20}
                />
              </span>

              <div>

                <h2>
                  Fleet Overview
                </h2>

               

              </div>

            </div>

          </div>

          <div className="admin-stats">

            {stats.map(
              (
                stat
              ) => (

                <div
                  key={
                    stat.title
                  }
                  className={`admin-stat-card admin-stat-card-clickable ${stat.className}`}
                  onClick={() =>
                    navigate(
                      stat.path
                    )
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(
                    e
                  ) =>
                    handleCardKeyDown(
                      e,
                      stat.path
                    )
                  }
                >

                  <div className="admin-stat-icon">
                    <DashboardIcon
                      type={
                        stat.icon
                      }
                      size={24}
                    />
                  </div>

                  <div className="admin-stat-info">

                    <p>
                      {
                        stat.title
                      }
                    </p>

                    <h2>
                      {
                        stat.value
                      }
                    </h2>

                    <span>
                      {
                        stat.subtitle
                      }
                    </span>

                  </div>

                  <div className="admin-stat-arrow">
                    <DashboardIcon
                      type="arrow"
                      size={15}
                    />
                  </div>

                </div>

              )
            )}

          </div>

        </section>

        {/* =====================
            RECENT TRIPS
        ===================== */}

        <section className="admin-dashboard-panel admin-trips-panel">

          <div className="admin-panel-heading admin-recent-heading">

            <div className="admin-panel-heading-left">

              <span className="admin-section-icon blue">
                <DashboardIcon
                  type="clock"
                  size={20}
                />
              </span>

              <div>

                <h2>
                  Recent Trips
                </h2>

               

              </div>

            </div>

            <button
              type="button"
              className="admin-view-all-btn"
              onClick={() =>
                navigate(
                  "/trips"
                )
              }
            >

              <span>
                View All Trips
              </span>

              <DashboardIcon
                type="arrow"
                size={15}
              />

            </button>

          </div>

          <div className="admin-table-wrapper">

            <table className="admin-table">

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
                      className="admin-empty"
                    >

                      <div className="admin-empty-state">

                        <div className="admin-empty-icon">
                          <DashboardIcon
                            type="vehicle"
                            size={28}
                          />
                        </div>

                        <strong>
                          Loading...
                        </strong>

                      </div>

                    </td>

                  </tr>

                ) : recentTrips.length ===
                  0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="admin-empty"
                    >

                      <div className="admin-empty-state">

                        <div className="admin-empty-icon">
                          <DashboardIcon
                            type="vehicle"
                            size={28}
                          />
                        </div>

                        <strong>
                          No trip records found.
                        </strong>

                        <span>
                          Trip data will appear here once trips are added.
                        </span>

                      </div>

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
                        className="admin-trip-row-clickable"
                        onClick={() =>
                          navigate(
                            "/trips"
                          )
                        }
                        title="Open Trips"
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

                              <span className="admin-table-muted">
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
                            className={`admin-trip-status ${String(
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

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;