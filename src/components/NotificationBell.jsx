import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import "./NotificationBell.css";

function NotificationBell() {
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

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  /* =========================
     LOAD NOTIFICATIONS
  ========================= */

  const loadNotifications =
    useCallback(
      async (
        shouldOpen = false
      ) => {
        if (
          !token ||
          ![
            "Administrator",
            "Operator",
          ].includes(
            role
          )
        ) {
          return;
        }

        setLoading(true);

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

          const alerts =
            data.alerts || [];

          setNotifications(
            alerts
          );

          if (
            shouldOpen &&
            alerts.length >
              0
          ) {
            setOpen(true);
          }
        } catch (err) {
          console.error(
            "Notification error:",
            err
          );
        } finally {
          setLoading(false);
        }
      },
      [
        token,
        role,
        navigate,
      ]
    );

  /* =========================
     NORMAL LOAD
  ========================= */

  useEffect(() => {
    const shouldOpen =
      sessionStorage.getItem(
        "openVehicleNotifications"
      ) === "1";

    const shouldRefresh =
      sessionStorage.getItem(
        "refreshVehicleNotifications"
      ) === "1";

    if (
      shouldOpen ||
      shouldRefresh
    ) {
      sessionStorage.removeItem(
        "openVehicleNotifications"
      );

      sessionStorage.removeItem(
        "refreshVehicleNotifications"
      );

      loadNotifications(
        shouldOpen
      );

      return;
    }

    loadNotifications(
      false
    );
  }, [
    loadNotifications,
  ]);

  /* =========================
     REFRESH EVENT
  ========================= */

  useEffect(() => {
    const handleRefresh =
      () => {
        loadNotifications(
          true
        );
      };

    window.addEventListener(
      "vehicle-notifications-refresh",
      handleRefresh
    );

    return () => {
      window.removeEventListener(
        "vehicle-notifications-refresh",
        handleRefresh
      );
    };
  }, [
    loadNotifications,
  ]);

  if (
    ![
      "Administrator",
      "Operator",
    ].includes(role)
  ) {
    return null;
  }

  const getIcon = (
    severity
  ) => {
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

  const handleBellClick =
    async () => {
      await loadNotifications(
        false
      );

      setOpen(true);
    };

  const handleAlertClick = (
    alert
  ) => {
    setOpen(false);

    if (alert.link) {
      navigate(
        alert.link
      );
    }
  };

  return (
    <>
      <button
        type="button"
        className="global-notification-bell"
        onClick={
          handleBellClick
        }
        title="Notifications"
      >

        <span className="global-bell-icon">
          🔔
        </span>

        {notifications.length >
          0 && (

          <span className="global-bell-count">
            {
              notifications.length
            }
          </span>

        )}

      </button>

      {open && (

        <div className="global-notification-overlay">

          <div className="global-notification-popup">

            <div className="global-notification-header">

              <h3>
                🔔 Vehicle Notifications
              </h3>

              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
              >
                ×
              </button>

            </div>

            <div className="global-notification-body">

              {loading ? (

                <div className="global-notification-empty">
                  Loading alerts...
                </div>

              ) : notifications.length ===
                0 ? (

                <div className="global-notification-normal">
                  ✅ No alerts found — all systems normal.
                </div>

              ) : (

                notifications.map(
                  (alert) => (

                    <button
                      type="button"
                      key={
                        alert.id
                      }
                      className={`global-notification-item ${
                        alert.severity ||
                        "warning"
                      }`}
                      onClick={() =>
                        handleAlertClick(
                          alert
                        )
                      }
                    >

                      <span className="global-notification-item-icon">
                        {getIcon(
                          alert.severity
                        )}
                      </span>

                      <span className="global-notification-text">

                        <strong>
                          {
                            alert.title
                          }
                        </strong>

                        <b>
                          {
                            alert.vehicle
                          }
                        </b>

                        <span>
                          {
                            alert.message
                          }
                        </span>

                      </span>

                    </button>

                  )
                )

              )}

            </div>

            <div className="global-notification-footer">

              <button
                type="button"
                className="global-notification-ok"
                onClick={() =>
                  setOpen(false)
                }
              >
                OK
              </button>

              <button
                type="button"
                className="global-notification-dismiss"
                onClick={() =>
                  setOpen(false)
                }
              >
                Dismiss All
              </button>

            </div>

          </div>

        </div>

      )}
    </>
  );
}

export default NotificationBell;