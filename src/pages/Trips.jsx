import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import NotificationBell from "../components/NotificationBell";

import {
  useNavigate,
} from "react-router-dom";

import "./Trips.css";

function Trips() {
  const navigate =
    useNavigate();

  const user =
    JSON.parse(
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
    trips,
    setTrips,
  ] =
    useState([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  const [
    deletingId,
    setDeletingId,
  ] =
    useState(null);

  const [
    locationFilter,
    setLocationFilter,
  ] =
    useState("All");

  const [
    monthFilter,
    setMonthFilter,
  ] =
    useState("All");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState("All");

  const [
    recordsPerPage,
    setRecordsPerPage,
  ] =
    useState(20);

  const [
    searchWord,
    setSearchWord,
  ] =
    useState("");

  const [
    searchOn,
    setSearchOn,
  ] =
    useState("Any");

  /* =========================
     AUTH
  ========================= */

  useEffect(
    () => {
      if (
        !user
      ) {
        navigate(
          "/"
        );
      }
    },
    [
      navigate,
      user,
    ]
  );

  /* =========================
     LOAD TRIPS
  ========================= */

  const loadTrips =
    useCallback(
      async () => {
        if (
          !token
        ) {
          return;
        }

        setLoading(
          true
        );

        setError(
          ""
        );

        try {
          const response =
            await fetch(
              "http://localhost:5000/api/trips",
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

            navigate(
              "/"
            );

            return;
          }

          if (
            !response.ok
          ) {
            setError(
              data.message ||
                "Unable to load trips"
            );

            return;
          }

          setTrips(
            data.trips ||
              []
          );
        } catch (
          err
        ) {
          console.error(
            err
          );

          setError(
            "Unable to connect to server"
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        navigate,
        token,
      ]
    );

  useEffect(
    () => {
      loadTrips();
    },
    [
      loadTrips,
    ]
  );

  /* =========================
     MENU
  ========================= */

  const menuItems = [
    {
      name:
        "Dashboard",
    },

    {
      name:
        "Vehicles",
      path:
        "/vehicles",
    },

    {
      name:
        "Vehicle History",
      path:
        "/vehicle-history",
    },

    {
      name:
        "Drivers",
      path:
        "/drivers",
    },

    {
      name:
        "Trips",
      path:
        "/trips",
    },

    {
      name:
        "Fuel",
      path:
        "/fuel",
    },

    {
      name:
        "Maintenance",
      path:
        "/maintenance",
    },

    {
      name:
        "Documents",
      path:
        "/documents",
    },

    {
      name:
        "Incidents",
      path:
        "/incidents",
    },

    {
      name:
        "Expenses",
      path:
        "/expenses",
    },

    {
      name:
        "Reports",
      path:
        "/reports",
    },
  ];

  if (
    role ===
    "Administrator"
  ) {
    menuItems.push(
      {
        name:
          "Users & Roles",
        path:
          "/users-roles",
      },

      {
        name:
          "Audit Log",
        path:
          "/audit-log",
      }
    );
  }

  const handleDashboard =
    () => {
      if (
        role ===
        "Administrator"
      ) {
        navigate(
          "/admin-dashboard"
        );
      } else if (
        role ===
        "Operator"
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
      item.name ===
      "Dashboard"
    ) {
      handleDashboard();
      return;
    }

    navigate(
      item.path
    );
  };

  const handleLogout =
    () => {
      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      navigate(
        "/"
      );
    };

  /* =========================
     DELETE TRIP
     ADMINISTRATOR ONLY
  ========================= */

  const handleDelete =
    async (
      trip
    ) => {
      if (
        role !==
        "Administrator"
      ) {
        return;
      }

      const tripId =
        `TRIP-${String(
          trip.id
        ).padStart(
          5,
          "0"
        )}`;

      const vehicle =
        `${trip.registration_no || ""}${
          trip.vehicle_name
            ? ` - ${trip.vehicle_name}`
            : ""
        }`;

      const route =
        `${trip.from_location || "--"} → ${trip.destination || "--"}`;

      let confirmationMessage =
        `Delete ${tripId}?\n\n` +
        `${vehicle}\n` +
        `${trip.driver_name || "--"}\n` +
        `${route}\n\n`;

      if (
        trip.status ===
        "Completed"
      ) {
        confirmationMessage +=
          "WARNING: This is a COMPLETED trip.\n\n" +
          "Deleting it will:\n" +
          "- remove this trip from Vehicle History and Reports\n" +
          "- recalculate the vehicle odometer\n" +
          "- remove this trip link from any Fuel records\n" +
          "- keep the Fuel records themselves\n\n" +
          "This action cannot be undone.\n\n" +
          "Do you want to continue?";
      } else {
        confirmationMessage +=
          "This trip will be permanently deleted.\n" +
          "Any linked Fuel record will remain, but its Trip link will be removed.\n\n" +
          "Do you want to continue?";
      }

      const confirmed =
        window.confirm(
          confirmationMessage
        );

      if (
        !confirmed
      ) {
        return;
      }

      setError(
        ""
      );

      setSuccess(
        ""
      );

      setDeletingId(
        trip.id
      );

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/trips/${trip.id}`,
            {
              method:
                "DELETE",

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

          navigate(
            "/"
          );

          return;
        }

        if (
          response.status ===
          403
        ) {
          setError(
            "Only Administrator can delete trips"
          );

          return;
        }

        if (
          !response.ok
        ) {
          setError(
            data.message ||
              "Unable to delete trip"
          );

          return;
        }

        let message =
          `${tripId} deleted successfully`;

        if (
          trip.status ===
          "Completed" &&
          data.vehicleOdometerUpdated
        ) {
          message +=
            `. Vehicle odometer is now ${Number(
              data.vehicleOdometer ||
                0
            ).toLocaleString()} km.`;
        }

        if (
          Number(
            data.linkedFuelRecords ||
              0
          ) >
          0
        ) {
          message +=
            ` ${data.linkedFuelRecords} linked fuel record(s) were kept and unlinked from this trip.`;
        }

        setSuccess(
          message
        );

        await loadTrips();

        /*
          Trip deletion can affect
          maintenance notifications because
          vehicle odometer may change.
        */

        window.dispatchEvent(
          new Event(
            "vehicle-notifications-refresh"
          )
        );
      } catch (
        err
      ) {
        console.error(
          "Trip delete error:",
          err
        );

        setError(
          "Unable to connect to server"
        );
      } finally {
        setDeletingId(
          null
        );
      }
    };

  /* =========================
     FILTERS
  ========================= */

  const locations =
    useMemo(
      () => {
        return [
          "All",

          ...new Set(
            trips
              .map(
                (
                  trip
                ) =>
                  trip.from_location
              )
              .filter(
                Boolean
              )
          ),
        ];
      },
      [
        trips,
      ]
    );

  const months =
    useMemo(
      () => {
        const values =
          trips
            .map(
              (
                trip
              ) => {
                if (
                  !trip.start_datetime
                ) {
                  return null;
                }

                return String(
                  trip.start_datetime
                ).slice(
                  0,
                  7
                );
              }
            )
            .filter(
              Boolean
            );

        return [
          "All",

          ...new Set(
            values
          ),
        ];
      },
      [
        trips,
      ]
    );

  const filteredTrips =
    useMemo(
      () => {
        let result = [
          ...trips,
        ];

        if (
          locationFilter !==
          "All"
        ) {
          result =
            result.filter(
              (
                trip
              ) =>
                trip.from_location ===
                locationFilter
            );
        }

        if (
          monthFilter !==
          "All"
        ) {
          result =
            result.filter(
              (
                trip
              ) =>
                String(
                  trip.start_datetime
                ).slice(
                  0,
                  7
                ) ===
                monthFilter
            );
        }

        if (
          statusFilter !==
          "All"
        ) {
          result =
            result.filter(
              (
                trip
              ) =>
                trip.status ===
                statusFilter
            );
        }

        const word =
          searchWord
            .trim()
            .toLowerCase();

        if (
          word
        ) {
          result =
            result.filter(
              (
                trip
              ) => {
                const tripId =
                  `trip-${trip.id}`.toLowerCase();

                const vehicle =
                  `${trip.registration_no || ""} ${trip.vehicle_name || ""}`.toLowerCase();

                const driver =
                  `${trip.driver_code || ""} ${trip.driver_name || ""}`.toLowerCase();

                const route =
                  `${trip.from_location || ""} ${trip.destination || ""}`.toLowerCase();

                if (
                  searchOn ===
                  "Trip ID"
                ) {
                  return tripId.includes(
                    word
                  );
                }

                if (
                  searchOn ===
                  "Vehicle"
                ) {
                  return vehicle.includes(
                    word
                  );
                }

                if (
                  searchOn ===
                  "Driver"
                ) {
                  return driver.includes(
                    word
                  );
                }

                if (
                  searchOn ===
                  "Route"
                ) {
                  return route.includes(
                    word
                  );
                }

                return (
                  tripId.includes(
                    word
                  ) ||
                  vehicle.includes(
                    word
                  ) ||
                  driver.includes(
                    word
                  ) ||
                  route.includes(
                    word
                  )
                );
              }
            );
        }

        return result.slice(
          0,
          Number(
            recordsPerPage
          )
        );
      },
      [
        trips,
        locationFilter,
        monthFilter,
        statusFilter,
        searchWord,
        searchOn,
        recordsPerPage,
      ]
    );

  return (
    <div className="trips-page">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="trips-sidebar">
<div className="trips-welcome">

  <div className="trips-profile-avatar">
    {userInitials}
  </div>

  <div className="trips-profile-info">

    <strong>
      {userName}
    </strong>

    <span>
      {role}
    </span>

  </div>

  <NotificationBell />

</div>

        <div className="trips-menu">

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
                  "Trips"
                    ? "trips-menu-btn active"
                    : "trips-menu-btn"
                }
                onClick={() =>
                  handleMenuClick(
                    item
                  )
                }
              >
                {
                  item.name
                }
              </button>

            )
          )}

        </div>

        <button
          className="trips-logout"
          onClick={
            handleLogout
          }
        >
          Logout
        </button>

      </aside>

      {/* =========================
          CONTENT
      ========================= */}

      <main className="trips-content">

        <div className="trips-header">

          <h1>
            Trips
          </h1>

        </div>

        {/* =========================
            FILTERS
        ========================= */}

        <div className="trips-filters">

          <div className="trips-filter-field">

            <label>
              Location
            </label>

            <select
              value={
                locationFilter
              }
              onChange={(
                e
              ) =>
                setLocationFilter(
                  e.target.value
                )
              }
            >

              {locations.map(
                (
                  location
                ) => (

                  <option
                    key={
                      location
                    }
                    value={
                      location
                    }
                  >
                    {
                      location
                    }
                  </option>

                )
              )}

            </select>

          </div>

          <div className="trips-filter-field">

            <label>
              Month
            </label>

            <select
              value={
                monthFilter
              }
              onChange={(
                e
              ) =>
                setMonthFilter(
                  e.target.value
                )
              }
            >

              {months.map(
                (
                  month
                ) => (

                  <option
                    key={
                      month
                    }
                    value={
                      month
                    }
                  >
                    {
                      month
                    }
                  </option>

                )
              )}

            </select>

          </div>

          <div className="trips-filter-field">

            <label>
              Status
            </label>

            <select
              value={
                statusFilter
              }
              onChange={(
                e
              ) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All
              </option>

              <option value="Planned">
                Planned
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Completed">
                Completed
              </option>

            </select>

          </div>

          <div className="trips-filter-field small">

            <label>
              Records / page
            </label>

            <select
              value={
                recordsPerPage
              }
              onChange={(
                e
              ) =>
                setRecordsPerPage(
                  e.target.value
                )
              }
            >

              <option value="20">
                20
              </option>

              <option value="50">
                50
              </option>

              <option value="100">
                100
              </option>

            </select>

          </div>

          <div className="trips-filter-field search">

            <label>
              Enter Search Word
            </label>

            <input
              type="text"
              placeholder="Search trip..."
              value={
                searchWord
              }
              onChange={(
                e
              ) =>
                setSearchWord(
                  e.target.value
                )
              }
            />

          </div>

          <div className="trips-filter-field">

            <label>
              Search On
            </label>

            <select
              value={
                searchOn
              }
              onChange={(
                e
              ) =>
                setSearchOn(
                  e.target.value
                )
              }
            >

              <option value="Any">
                Any
              </option>

              <option value="Trip ID">
                Trip ID
              </option>

              <option value="Vehicle">
                Vehicle
              </option>

              <option value="Driver">
                Driver
              </option>

              <option value="Route">
                Route
              </option>

            </select>

          </div>

        </div>

        {/* =========================
            CREATE TRIP
        ========================= */}

        {role !==
          "Viewer" && (

          <div className="trips-actions">

            <button
              className="create-trip-btn"
              onClick={() =>
                navigate(
                  "/create-trip"
                )
              }
            >
              + CREATE TRIP
            </button>

          </div>

        )}

        {/* =========================
            SUCCESS
        ========================= */}

        {success && (

          <div
            style={{
              marginBottom:
                "14px",

              padding:
                "10px 14px",

              background:
                "#edf8ef",

              border:
                "1px solid #b9dec0",

              color:
                "#246b32",

              borderRadius:
                "4px",

              fontSize:
                "13px",

              fontWeight:
                "600",
            }}
          >
            {
              success
            }
          </div>

        )}

        {/* =========================
            ERROR
        ========================= */}

        {error && (

          <div className="trips-error">
            {
              error
            }
          </div>

        )}

        {/* =========================
            TABLE
        ========================= */}

        <div className="trips-table-wrapper">

          <table className="trips-table">

            <thead>

              <tr>

                <th>
                  Trip ID
                </th>

                <th>
                  Vehicle / Driver
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

                <th>
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr className="trips-empty-row">

                  <td colSpan="6">
                    Loading trips...
                  </td>

                </tr>

              ) : filteredTrips.length ===
                0 ? (

                <tr className="trips-empty-row">

                  <td colSpan="6">
                    No trip records found.
                  </td>

                </tr>

              ) : (

                filteredTrips.map(
                  (
                    trip
                  ) => (

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

                        <div className="trip-vehicle-line">

                          <strong>
                            {
                              trip.registration_no
                            }
                          </strong>

                          <span className="trip-vehicle-separator">
                            -
                          </span>

                          <span className="trip-vehicle-name">
                            {
                              trip.vehicle_name ||
                              "--"
                            }
                          </span>

                        </div>

                        <div className="trip-driver-name">
                          {
                            trip.driver_name ||
                            "--"
                          }
                        </div>

                      </td>

                      <td>
                        {
                          trip.from_location
                        }{" "}
                        →{" "}
                        {
                          trip.destination
                        }
                      </td>

                      <td>
                        {trip.distance !==
                          null &&
                        trip.distance !==
                          undefined
                          ? `${trip.distance} km`
                          : "--"}
                      </td>

                      <td>

                        <span
                          className={`trip-status ${String(
                            trip.status ||
                              ""
                          ).toLowerCase()}`}
                        >
                          {
                            trip.status
                          }
                        </span>

                      </td>

                      <td>

                        <div
                          style={{
                            display:
                              "flex",

                            gap:
                              "6px",

                            alignItems:
                              "center",

                            justifyContent:
                              "center",

                            flexWrap:
                              "wrap",
                          }}
                        >

                          {role !==
                            "Viewer" &&
                          trip.status ===
                            "Active" && (

                            <button
                              className="complete-trip-btn"
                              onClick={() =>
                                navigate(
                                  `/complete-trip?tripId=${trip.id}`
                                )
                              }
                            >
                              Complete
                            </button>

                          )}

                          {role ===
                            "Administrator" && (

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  trip
                                )
                              }
                              disabled={
                                deletingId ===
                                trip.id
                              }
                              style={{
                                border:
                                  "1px solid #a83232",

                                background:
                                  deletingId ===
                                  trip.id
                                    ? "#eeeeee"
                                    : "#ffffff",

                                color:
                                  "#a83232",

                                borderRadius:
                                  "4px",

                                padding:
                                  "6px 10px",

                                fontSize:
                                  "11px",

                                fontWeight:
                                  "700",

                                cursor:
                                  deletingId ===
                                  trip.id
                                    ? "not-allowed"
                                    : "pointer",

                                opacity:
                                  deletingId ===
                                  trip.id
                                    ? 0.6
                                    : 1,
                              }}
                            >
                              {deletingId ===
                              trip.id
                                ? "DELETING..."
                                : "DELETE"}
                            </button>

                          )}

                          {role ===
                            "Viewer" && (
                            "--"
                          )}

                          {role ===
                            "Operator" &&
                          trip.status !==
                            "Active" && (
                            "--"
                          )}

                        </div>

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

export default Trips;