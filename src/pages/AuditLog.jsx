import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import NotificationBell from "../components/NotificationBell";
import "./AuditLog.css";

function AuditLog() {
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
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");
  const [
    logs,
    setLogs,
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
     AUTH / ROLE CHECK
  ========================= */

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    if (
      role !== "Administrator"
    ) {
      if (
        role === "Operator"
      ) {
        navigate(
          "/operator-dashboard"
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

  /* =========================
     LOAD AUDIT LOGS
  ========================= */

  const loadAuditLogs =
    useCallback(async () => {
      if (
        role !==
        "Administrator"
      ) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            "http://localhost:5000/api/audit-logs",
            {
              method: "GET",

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
              "Unable to load audit logs"
          );

          return;
        }

        setLogs(
          data.logs || []
        );
      } catch (err) {
        console.error(
          "Audit log load error:",
          err
        );

        setError(
          "Unable to connect to server"
        );
      } finally {
        setLoading(false);
      }
    }, [
      navigate,
      role,
      token,
    ]);

  useEffect(() => {
    loadAuditLogs();
  }, [
    loadAuditLogs,
  ]);

  /* =========================
     MENU
  ========================= */

  const menuItems = [
    {
      name: "Dashboard",
      path:
        "/admin-dashboard",
    },
    {
      name: "Vehicles",
      path: "/vehicles",
    },
    {
      name:
        "Vehicle History",
      path:
        "/vehicle-history",
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
      name:
        "Maintenance",
      path:
        "/maintenance",
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
    {
      name:
        "Users & Roles",
      path:
        "/users-roles",
    },
    {
      name: "Audit Log",
      path: "/audit-log",
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
     DATE FORMAT
  ========================= */

  const formatDateTime = (
    dateValue
  ) => {
    if (!dateValue) {
      return "--";
    }

    return new Date(
      dateValue
    ).toLocaleString();
  };

  if (
    !user ||
    role !==
      "Administrator"
  ) {
    return null;
  }

  return (
    <div className="audit-page">

      {/* =====================
          SIDEBAR
      ===================== */}

      <aside className="audit-sidebar">

  <div className="audit-welcome">

  <div className="audit-profile-avatar">
    {userInitials}
  </div>

  <div className="audit-profile-info">

    <strong>
      {userName}
    </strong>

    <span>
      {role}
    </span>

  </div>

  <NotificationBell />

</div>

        <div className="audit-menu">

          {menuItems.map(
            (item) => (

              <button
                key={
                  item.name
                }
                className={
                  item.name ===
                  "Audit Log"
                    ? "audit-menu-btn active"
                    : "audit-menu-btn"
                }
                onClick={() =>
                  navigate(
                    item.path
                  )
                }
              >
                {item.name}
              </button>

            )
          )}

        </div>

        <button
          className="audit-logout"
          onClick={
            handleLogout
          }
        >
          Logout
        </button>

      </aside>

      {/* =====================
          CONTENT
      ===================== */}

      <main className="audit-content">

        <div className="audit-header">

          <h1>
            Audit Log
          </h1>

        </div>

        <div className="audit-section-title">
          System Activity
        </div>

        {error && (

          <div className="audit-error">
            {error}
          </div>

        )}

        <div className="audit-table-wrapper">

          <table className="audit-table">

            <thead>

              <tr>

                <th>
                  Date / Time
                </th>

                <th>
                  User
                </th>

                <th>
                  Action
                </th>

                <th>
                  Module
                </th>

                <th>
                  Record
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr className="audit-empty-row">

                  <td colSpan="5">
                    Loading audit activity...
                  </td>

                </tr>

              ) : logs.length ===
                0 ? (

                <tr className="audit-empty-row">

                  <td colSpan="5">
                    No audit activity found.
                  </td>

                </tr>

              ) : (

                logs.map(
                  (log) => (

                    <tr
                      key={
                        log.id
                      }
                    >

                      <td>
                        {formatDateTime(
                          log.created_at
                        )}
                      </td>

                      <td>
                        {log.actor_name ||
                          "--"}
                      </td>

                      <td>
                        {log.action ||
                          "--"}
                      </td>

                      <td>
                        {log.module ||
                          "--"}
                      </td>

                      <td>
                        {log.record_name ||
                          (log.record_id
                            ? `Record #${log.record_id}`
                            : "--")}
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

export default AuditLog;