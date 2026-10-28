import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import "./ViewerDashboard.css";
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

  if (type === "vehicle") {
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
  }

  return null;
}
function ViewerDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const role = user?.role;

  const token =
    localStorage.getItem("token");
const userName =
  user?.name ||
  "User";

const userInitial =
  userName
    .trim()
    .charAt(0)
    .toUpperCase();
  const [summary, setSummary] =
    useState({
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

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    if (role !== "Viewer") {
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
        navigate("/");
      }
    }
  }, [
    navigate,
    role,
    user,
  ]);

  useEffect(() => {
    if (
      !token ||
      role !== "Viewer"
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
            response.status === 401
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
            data.recentTrips || []
          );
        } catch (err) {
          console.error(err);

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

  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    navigate("/");
  };

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

  if (
    !user ||
    role !== "Viewer"
  ) {
    return null;
  }

  return (
    <div className="viewer-page">
      <aside className="viewer-sidebar">
     <div className="viewer-profile">

  <div className="viewer-profile-avatar">
    {userInitial}
  </div>

  <div className="viewer-profile-text">

    <strong>
      {userName}
    </strong>

    <span>
      {role}
    </span>

  </div>

</div>

        <nav className="viewer-nav">
          <button
            className="active"
            onClick={() =>
              navigate(
                "/viewer-dashboard"
              )
            }
          >
            Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/vehicles")
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
              navigate("/drivers")
            }
          >
            Drivers
          </button>

          <button
            onClick={() =>
              navigate("/trips")
            }
          >
            Trips
          </button>

          <button
            onClick={() =>
              navigate("/fuel")
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

        <button
          className="viewer-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      <main className="viewer-main">
<div className="viewer-header">

  <div className="viewer-header-icon">
    <DashboardIcon
      type="vehicle"
      size={34}
    />
  </div>

  <h1>
    Vehicle Management System
  </h1>

</div>
        {error && (
          <div className="viewer-error">
            {error}
          </div>
        )}

        <div className="viewer-section-title">
          Fleet Overview
        </div>

        <div className="viewer-stats">
          <div className="viewer-stat-card">
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

          <div className="viewer-stat-card">
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

          <div className="viewer-stat-card">
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

          <div className="viewer-stat-card">
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

          <div className="viewer-stat-card">
            <span>
              Maintenance Due
            </span>

            <strong>
              {loading
                ? "--"
                : summary.maintenanceDue}
            </strong>

            <small>
              Scheduled / In Progress
            </small>
          </div>

          <div className="viewer-stat-card">
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

          <div className="viewer-stat-card">
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

          <div className="viewer-stat-card">
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

        <div className="viewer-section-title viewer-recent-title">
          Recent Trips
        </div>

        <div className="viewer-table-wrapper">
          <table className="viewer-table">
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
                    className="viewer-empty"
                  >
                    Loading...
                  </td>
                </tr>
              ) : recentTrips.length ===
                0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="viewer-empty"
                  >
                    No trip records found.
                  </td>
                </tr>
              ) : (
                recentTrips.map(
                  (trip) => (
                    <tr
                      key={trip.id}
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
                        {
                          trip.registration_no
                        }
                      </td>

                      <td>
                        {trip.driver_name ||
                          "--"}
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

                      <td>
                        <span
                          className={`viewer-trip-status ${String(
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

export default ViewerDashboard;