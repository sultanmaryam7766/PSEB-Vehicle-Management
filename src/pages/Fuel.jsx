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

import "./Fuel.css";

function Fuel() {
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
    fuelRecords,
    setFuelRecords,
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
     LOAD FUEL RECORDS
  ========================= */

  const loadFuelRecords =
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
              "http://localhost:5000/api/fuel",
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
                "Unable to load fuel records"
            );

            return;
          }

          setFuelRecords(
            data.fuelRecords ||
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
      loadFuelRecords();
    },
    [
      loadFuelRecords,
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
     DELETE
     ADMINISTRATOR ONLY
  ========================= */

  const handleDelete =
    async (
      record
    ) => {
      if (
        role !==
        "Administrator"
      ) {
        return;
      }

      const vehicleName =
        `${record.registration_no || ""}${
          record.vehicle_name
            ? ` - ${record.vehicle_name}`
            : ""
        }`;

      const tripName =
        record.trip_id
          ? `TRIP-${String(
              record.trip_id
            ).padStart(
              5,
              "0"
            )}`
          : "No linked trip";

      const confirmed =
        window.confirm(
          `Delete Fuel Record #${record.id}?\n\n` +
          `${vehicleName}\n` +
          `${tripName}\n` +
          `${record.liters} liters\n` +
          `Amount: Rs. ${Number(
            record.amount ||
              0
          ).toLocaleString()}\n\n` +
          "This fuel record will be permanently deleted.\n" +
          "Fuel totals, mileage, Vehicle History and Reports will update.\n\n" +
          "Do you want to continue?"
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
        record.id
      );

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/fuel/${record.id}`,
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
            "Only Administrator can delete fuel records"
          );

          return;
        }

        if (
          !response.ok
        ) {
          setError(
            data.message ||
              "Unable to delete fuel record"
          );

          return;
        }

        setSuccess(
          `Fuel Record #${record.id} deleted successfully`
        );

        await loadFuelRecords();

      } catch (
        err
      ) {
        console.error(
          "Fuel delete error:",
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
            fuelRecords
              .map(
                (
                  record
                ) =>
                  record.station_vendor
              )
              .filter(
                Boolean
              )
          ),
        ];
      },
      [
        fuelRecords,
      ]
    );

  const months =
    useMemo(
      () => {
        return [
          "All",

          ...new Set(
            fuelRecords
              .map(
                (
                  record
                ) =>
                  record.fuel_date
                    ? String(
                        record.fuel_date
                      ).slice(
                        0,
                        7
                      )
                    : null
              )
              .filter(
                Boolean
              )
          ),
        ];
      },
      [
        fuelRecords,
      ]
    );

  const filteredRecords =
    useMemo(
      () => {
        let result = [
          ...fuelRecords,
        ];

        if (
          locationFilter !==
          "All"
        ) {
          result =
            result.filter(
              (
                record
              ) =>
                record.station_vendor ===
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
                record
              ) =>
                String(
                  record.fuel_date
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
                record
              ) =>
                record.status ===
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
                record
              ) => {
                const vehicle =
                  `${record.registration_no || ""} ${record.vehicle_name || ""}`.toLowerCase();

                const trip =
                  record.trip_id
                    ? `trip-${record.trip_id}`
                    : "";

                const driver =
                  (
                    record.driver_name ||
                    ""
                  ).toLowerCase();

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
                  "Trip ID"
                ) {
                  return trip.includes(
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

                return (
                  vehicle.includes(
                    word
                  ) ||
                  trip.includes(
                    word
                  ) ||
                  driver.includes(
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
        fuelRecords,
        locationFilter,
        monthFilter,
        statusFilter,
        recordsPerPage,
        searchWord,
        searchOn,
      ]
    );

  /* =========================
     DATE FORMAT
  ========================= */

  const formatDate = (
    value
  ) => {
    if (
      !value
    ) {
      return "--";
    }

    return new Date(
      value
    ).toLocaleString();
  };

  return (
    <div className="fuel-page">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="fuel-sidebar">

      <div className="fuel-welcome">

  <div className="fuel-profile-avatar">
    {userInitials}
  </div>

  <div className="fuel-profile-info">

    <strong>
      {userName}
    </strong>

    <span>
      {role}
    </span>

  </div>

  <NotificationBell />

</div>

        <div className="fuel-menu">

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
                  "Fuel"
                    ? "fuel-menu-btn active"
                    : "fuel-menu-btn"
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
          className="fuel-logout"
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

      <main className="fuel-content">

        <div className="fuel-header">

          <h1>
            Fuel Management
          </h1>

        </div>

        {/* =========================
            FILTERS
        ========================= */}

        <div className="fuel-filters">

          <div className="fuel-filter-field">

            <label>
              Station / Vendor
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

          <div className="fuel-filter-field">

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

          <div className="fuel-filter-field">

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

              <option value="Pending">
                Pending
              </option>

              <option value="Verified">
                Verified
              </option>

            </select>

          </div>

          <div className="fuel-filter-field">

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

          <div className="fuel-filter-field search">

            <label>
              Enter Search Word
            </label>

            <input
              type="text"
              placeholder="Search fuel record..."
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

          <div className="fuel-filter-field">

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

              <option value="Vehicle">
                Vehicle
              </option>

              <option value="Trip ID">
                Trip ID
              </option>

              <option value="Driver">
                Driver
              </option>

            </select>

          </div>

        </div>

        {/* =========================
            ADD
        ========================= */}

        {role !==
          "Viewer" && (

          <div className="fuel-actions">

            <button
              className="fuel-add-btn"
              onClick={() =>
                navigate(
                  "/add-fuel"
                )
              }
            >
              + ADD FUEL
            </button>

          </div>

        )}

        {/* =========================
            MESSAGES
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

        {error && (

          <div className="fuel-error">
            {
              error
            }
          </div>

        )}

        {/* =========================
            TABLE
        ========================= */}

        <div className="fuel-table-wrapper">

          <table className="fuel-table">

            <thead>

              <tr>

                <th>
                  Date
                </th>

                <th>
                  Vehicle / Trip
                </th>

                <th>
                  Driver
                </th>

                <th>
                  Liters
                </th>

                <th>
                  Amount
                </th>

                <th>
                  Status
                </th>

                {role ===
                  "Administrator" && (

                  <th>
                    Actions
                  </th>

                )}

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr className="fuel-empty-row">

                  <td
                    colSpan={
                      role ===
                      "Administrator"
                        ? 7
                        : 6
                    }
                  >
                    Loading fuel records...
                  </td>

                </tr>

              ) : filteredRecords.length ===
                0 ? (

                <tr className="fuel-empty-row">

                  <td
                    colSpan={
                      role ===
                      "Administrator"
                        ? 7
                        : 6
                    }
                  >
                    No fuel records found.
                  </td>

                </tr>

              ) : (

                filteredRecords.map(
                  (
                    record
                  ) => (

                    <tr
                      key={
                        record.id
                      }
                    >

                      <td>
                        {formatDate(
                          record.fuel_date
                        )}
                      </td>

                      <td>

                        <strong>
                          {
                            record.registration_no
                          }
                        </strong>

                        <br />

                        {record.trip_id
                          ? `TRIP-${String(
                              record.trip_id
                            ).padStart(
                              5,
                              "0"
                            )}`
                          : "--"}

                      </td>

                      <td>
                        {
                          record.driver_name ||
                          "--"
                        }
                      </td>

                      <td>
                        {
                          record.liters
                        }
                      </td>

                      <td>
                        {
                          record.amount
                        }
                      </td>

                      <td>
                        {
                          record.status
                        }
                      </td>

                      {role ===
                        "Administrator" && (

                        <td>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                record
                              )
                            }
                            disabled={
                              deletingId ===
                              record.id
                            }
                            style={{
                              border:
                                "1px solid #a83232",

                              background:
                                deletingId ===
                                record.id
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
                                record.id
                                  ? "not-allowed"
                                  : "pointer",

                              opacity:
                                deletingId ===
                                record.id
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            {deletingId ===
                            record.id
                              ? "DELETING..."
                              : "DELETE"}
                          </button>

                        </td>

                      )}

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

export default Fuel;