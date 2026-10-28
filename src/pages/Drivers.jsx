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

import "./Drivers.css";

function Drivers() {
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
    drivers,
    setDrivers,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  const [
    locationFilter,
    setLocationFilter,
  ] = useState("All");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");

  const [
    searchWord,
    setSearchWord,
  ] = useState("");

  const [
    searchOn,
    setSearchOn,
  ] = useState("Any");

  const [
    recordsPerPage,
    setRecordsPerPage,
  ] = useState(20);

  const [
    editingDriver,
    setEditingDriver,
  ] = useState(null);

  const [
    editForm,
    setEditForm,
  ] = useState({
    driverCode: "",
    driverName: "",
    location: "",
  });

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
     LOAD DRIVERS
  ========================= */

  const loadDrivers =
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
              "http://localhost:5000/api/drivers",
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
                "Unable to load drivers"
            );

            return;
          }

          setDrivers(
            data.drivers ||
              []
          );
        } catch (
          err
        ) {
          console.error(
            "Load drivers error:",
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
      loadDrivers();
    },
    [
      loadDrivers,
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
     EDIT
  ========================= */

  const handleEdit = (
    driver
  ) => {
    setError(
      ""
    );

    setSuccess(
      ""
    );

    setEditingDriver(
      driver
    );

    setEditForm({
      driverCode:
        driver.driver_code,

      driverName:
        driver.driver_name,

      location:
        driver.location ||
        "",
    });
  };

  const handleEditChange = (
    e
  ) => {
    const {
      name,
      value,
    } =
      e.target;

    setEditForm(
      (
        prev
      ) => ({
        ...prev,

        [name]:
          value,
      })
    );
  };

  const handleUpdate =
    async (
      e
    ) => {
      e.preventDefault();

      if (
        !editingDriver
      ) {
        return;
      }

      setError(
        ""
      );

      setSuccess(
        ""
      );

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/drivers/${editingDriver.id}`,
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify(
                  editForm
                ),
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
              "Unable to update driver"
          );

          return;
        }

        setSuccess(
          "Driver updated successfully"
        );

        setEditingDriver(
          null
        );

        await loadDrivers();
      } catch (
        err
      ) {
        console.error(
          "Update driver error:",
          err
        );

        setError(
          "Unable to connect to server"
        );
      }
    };

  /* =========================
     STATUS
  ========================= */

  const handleStatusChange =
    async (
      driver
    ) => {
      const newStatus =
        driver.status ===
        "Active"
          ? "Inactive"
          : "Active";

      const confirmed =
        window.confirm(
          `Change ${driver.driver_name} to ${newStatus}?`
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

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/drivers/${driver.id}/status`,
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  status:
                    newStatus,
                }),
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
              "Unable to update driver status"
          );

          return;
        }

        setSuccess(
          data.message
        );

        await loadDrivers();
      } catch (
        err
      ) {
        console.error(
          "Driver status error:",
          err
        );

        setError(
          "Unable to connect to server"
        );
      }
    };

  /* =========================
     DELETE
     ADMINISTRATOR ONLY
  ========================= */

  const handleDelete =
    async (
      driver
    ) => {
      if (
        role !==
        "Administrator"
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `Delete driver ${driver.driver_code}?\n\n` +
          `${driver.driver_name}\n\n` +
          "A driver can only be permanently deleted if no Trips or Incidents are linked to the driver.\n\n" +
          "If historical records exist, deletion will be blocked and you should set the driver to Inactive instead.\n\n" +
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
        driver.id
      );

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/drivers/${driver.id}`,
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
            "Only Administrator can delete drivers"
          );

          return;
        }

        if (
          response.status ===
          409
        ) {
          setError(
            data.message ||
              "This driver has linked history and cannot be deleted. Set the driver to Inactive instead."
          );

          return;
        }

        if (
          !response.ok
        ) {
          setError(
            data.message ||
              "Unable to delete driver"
          );

          return;
        }

        setSuccess(
          `${driver.driver_code} - ${driver.driver_name} deleted successfully`
        );

        if (
          editingDriver?.id ===
          driver.id
        ) {
          setEditingDriver(
            null
          );
        }

        await loadDrivers();
      } catch (
        err
      ) {
        console.error(
          "Delete driver error:",
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
            drivers
              .map(
                (
                  driver
                ) =>
                  driver.location
              )
              .filter(
                Boolean
              )
          ),
        ];
      },
      [
        drivers,
      ]
    );

  const filteredDrivers =
    useMemo(
      () => {
        let result = [
          ...drivers,
        ];

        if (
          locationFilter !==
          "All"
        ) {
          result =
            result.filter(
              (
                driver
              ) =>
                driver.location ===
                locationFilter
            );
        }

        if (
          statusFilter !==
          "All"
        ) {
          result =
            result.filter(
              (
                driver
              ) =>
                driver.status ===
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
                driver
              ) => {
                const code =
                  String(
                    driver.driver_code ||
                      ""
                  ).toLowerCase();

                const name =
                  String(
                    driver.driver_name ||
                      ""
                  ).toLowerCase();

                if (
                  searchOn ===
                  "Driver ID"
                ) {
                  return code.includes(
                    word
                  );
                }

                if (
                  searchOn ===
                  "Name"
                ) {
                  return name.includes(
                    word
                  );
                }

                return (
                  code.includes(
                    word
                  ) ||
                  name.includes(
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
        drivers,
        locationFilter,
        statusFilter,
        searchWord,
        searchOn,
        recordsPerPage,
      ]
    );

  if (
    !user
  ) {
    return null;
  }

  return (
    <div className="drivers-page">

      <aside className="drivers-sidebar">

      <div className="drivers-welcome">

  <div className="drivers-profile-avatar">
    {userInitials}
  </div>

  <div className="drivers-profile-info">

    <strong>
      {userName}
    </strong>

    <span>
      {role}
    </span>

  </div>

  <NotificationBell />

</div>

        <div className="drivers-menu">

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
                  "Drivers"
                    ? "drivers-menu-btn active"
                    : "drivers-menu-btn"
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
          className="drivers-logout"
          onClick={
            handleLogout
          }
        >
          Logout
        </button>

      </aside>

      <main className="drivers-content">

        <div className="drivers-header">

          <h1>
            Drivers
          </h1>

        </div>

        {role !==
          "Viewer" && (

          <div className="drivers-actions">

            <button
              className="drivers-add-btn"
              onClick={() =>
                navigate(
                  "/add-driver"
                )
              }
            >
              + ADD DRIVER
            </button>

          </div>

        )}

        <div className="drivers-filters">

          <div className="drivers-filter-field">

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

          <div className="drivers-filter-field">

            <label>
              Month
            </label>

            <select disabled>

              <option>
                All
              </option>

            </select>

          </div>

          <div className="drivers-filter-field">

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

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>

            </select>

          </div>

          <div className="drivers-filter-field small">

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

          <div className="drivers-filter-field search">

            <label>
              Enter Search Word
            </label>

            <input
              type="text"
              placeholder="Search driver..."
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

          <div className="drivers-filter-field">

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

              <option value="Driver ID">
                Driver ID
              </option>

              <option value="Name">
                Name
              </option>

            </select>

          </div>

        </div>

        {error && (

          <div className="drivers-error">
            {
              error
            }
          </div>

        )}

        {success && (

          <div className="drivers-success">
            {
              success
            }
          </div>

        )}

        <div className="drivers-table-wrapper">

          <table className="drivers-table">

            <thead>

              <tr>

                <th>
                  Driver ID
                </th>

                <th>
                  Name
                </th>

                <th>
                  Trips This Month
                </th>

                <th>
                  Status
                </th>

                {role !==
                  "Viewer" && (

                  <th>
                    Actions
                  </th>

                )}

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr className="drivers-empty-row">

                  <td
                    colSpan={
                      role ===
                      "Viewer"
                        ? 4
                        : 5
                    }
                  >
                    Loading drivers...
                  </td>

                </tr>

              ) : filteredDrivers.length ===
                0 ? (

                <tr className="drivers-empty-row">

                  <td
                    colSpan={
                      role ===
                      "Viewer"
                        ? 4
                        : 5
                    }
                  >
                    No driver records found.
                  </td>

                </tr>

              ) : (

                filteredDrivers.map(
                  (
                    driver
                  ) => (

                    <tr
                      key={
                        driver.id
                      }
                    >

                      <td>
                        {
                          driver.driver_code
                        }
                      </td>

                      <td>
                        {
                          driver.driver_name
                        }
                      </td>

                      <td>

                        <strong>
                          {
                            Number(
                              driver.trips_this_month
                            ) ||
                            0
                          }
                        </strong>

                      </td>

                      <td>

                        <span
                          className={
                            driver.status ===
                            "Active"
                              ? "driver-status active"
                              : "driver-status inactive"
                          }
                        >
                          {
                            driver.status
                          }
                        </span>

                      </td>

                      {role !==
                        "Viewer" && (

                        <td>

                          <div className="driver-row-actions">

                            <button
                              type="button"
                              className="driver-edit-btn"
                              onClick={() =>
                                handleEdit(
                                  driver
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="driver-status-btn"
                              onClick={() =>
                                handleStatusChange(
                                  driver
                                )
                              }
                            >
                              {driver.status ===
                              "Active"
                                ? "Deactivate"
                                : "Activate"}
                            </button>

                            {role ===
                              "Administrator" && (

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    driver
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  driver.id
                                }
                                style={{
                                  border:
                                    "1px solid #a83232",

                                  background:
                                    deletingId ===
                                    driver.id
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
                                    driver.id
                                      ? "not-allowed"
                                      : "pointer",

                                  opacity:
                                    deletingId ===
                                    driver.id
                                      ? 0.6
                                      : 1,
                                }}
                              >
                                {deletingId ===
                                driver.id
                                  ? "DELETING..."
                                  : "DELETE"}
                              </button>

                            )}

                          </div>

                        </td>

                      )}

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

        {editingDriver && (

          <div className="driver-edit-box">

            <h3>
              Edit Driver
            </h3>

            <form
              onSubmit={
                handleUpdate
              }
            >

              <div className="driver-edit-grid">

                <div>

                  <label>
                    Driver ID
                  </label>

                  <input
                    type="text"
                    name="driverCode"
                    value={
                      editForm.driverCode
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  />

                </div>

                <div>

                  <label>
                    Driver Name
                  </label>

                  <input
                    type="text"
                    name="driverName"
                    value={
                      editForm.driverName
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  />

                </div>

                <div>

                  <label>
                    Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={
                      editForm.location
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>

              </div>

              <div className="driver-edit-actions">

                <button
                  type="submit"
                  className="driver-save-btn"
                >
                  SAVE CHANGES
                </button>

                <button
                  type="button"
                  className="driver-cancel-btn"
                  onClick={() =>
                    setEditingDriver(
                      null
                    )
                  }
                >
                  CANCEL
                </button>

              </div>

            </form>

          </div>

        )}

      </main>

    </div>
  );
}

export default Drivers;